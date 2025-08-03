const express = require('express');
const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Create group
router.post('/', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      tags,
      rules,
      isPrivate,
      requireApproval,
      location,
      website,
      linkedInPage
    } = req.body;

    const group = new Group({
      name,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      rules: rules ? rules.split('\n').filter(rule => rule.trim()) : [],
      isPrivate: isPrivate === 'true',
      requireApproval: requireApproval === 'true',
      location,
      website,
      linkedInPage,
      creator: req.user._id,
      admins: [req.user._id],
      image: req.files?.image?.[0]?.path || '',
      coverImage: req.files?.coverImage?.[0]?.path || ''
    });

    // Add creator as member
    group.members.push({
      user: req.user._id,
      role: 'admin'
    });

    group.memberCount = 1;
    await group.save();

    // Add group to user's joined groups
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedGroups: group._id }
    });

    await group.populate('creator', 'name avatar headline');

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all groups with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      location,
      isPrivate,
      sortBy = 'memberCount'
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (isPrivate !== undefined) {
      query.isPrivate = isPrivate === 'true';
    }

    const groups = await Group.find(query)
      .populate('creator', 'name avatar headline')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Group.countDocuments(query);

    res.json({
      groups,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single group
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creator', 'name avatar headline')
      .populate('admins', 'name avatar headline')
      .populate('moderators', 'name avatar headline')
      .populate('members.user', 'name avatar headline');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join group
router.post('/:groupId/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member =>
      member.user.equals(req.user._id)
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Check if user has pending request
    const hasPendingRequest = group.pendingMembers.some(pending =>
      pending.user.equals(req.user._id)
    );

    if (hasPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    if (group.requireApproval && !group.isPrivate) {
      // Add to pending members
      group.pendingMembers.push({
        user: req.user._id
      });

      // Notify admins
      const notifications = group.admins.map(adminId => ({
        recipient: adminId,
        sender: req.user._id,
        type: 'group_invite',
        title: 'New Group Join Request',
        message: `${req.user.name} wants to join ${group.name}`,
        relatedGroup: group._id,
        relatedUser: req.user._id
      }));

      await Notification.insertMany(notifications);
      await group.save();

      res.json({ message: 'Join request sent successfully' });
    } else if (!group.isPrivate) {
      // Add directly as member
      group.members.push({
        user: req.user._id,
        role: 'member'
      });

      group.memberCount += 1;
      await group.save();

      // Add group to user's joined groups
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { joinedGroups: group._id }
      });

      res.json({ message: 'Joined group successfully' });
    } else {
      res.status(403).json({ message: 'This is a private group. You need an invitation to join.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave group
router.post('/:groupId/leave', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(member =>
      member.user.equals(req.user._id)
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Remove from members
    group.members.splice(memberIndex, 1);
    group.memberCount = Math.max(0, group.memberCount - 1);

    // Remove from admins and moderators if applicable
    group.admins = group.admins.filter(adminId => !adminId.equals(req.user._id));
    group.moderators = group.moderators.filter(modId => !modId.equals(req.user._id));

    await group.save();

    // Remove group from user's joined groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedGroups: group._id }
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/reject join request
router.put('/:groupId/requests/:userId', authMiddleware, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can approve/reject requests' });
    }

    // Find pending request
    const pendingIndex = group.pendingMembers.findIndex(pending =>
      pending.user.equals(req.params.userId)
    );

    if (pendingIndex === -1) {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    const pendingMember = group.pendingMembers[pendingIndex];
    group.pendingMembers.splice(pendingIndex, 1);

    if (action === 'approve') {
      // Add as member
      group.members.push({
        user: req.params.userId,
        role: 'member'
      });

      group.memberCount += 1;

      // Add group to user's joined groups
      await User.findByIdAndUpdate(req.params.userId, {
        $addToSet: { joinedGroups: group._id }
      });

      // Notify user
      const notification = new Notification({
        recipient: req.params.userId,
        sender: req.user._id,
        type: 'group_invite',
        title: 'Group Request Approved',
        message: `Your request to join ${group.name} has been approved`,
        relatedGroup: group._id
      });

      await notification.save();
    }

    await group.save();

    res.json({
      message: action === 'approve' ? 'Request approved successfully' : 'Request rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get group posts
router.get('/:groupId/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const posts = await Post.find({
      group: req.params.groupId,
      isArchived: false
    })
      .populate('author', 'name avatar headline')
      .populate('likes.user', 'name')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      group: req.params.groupId,
      isArchived: false
    });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update group
router.put('/:groupId', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can update group' });
    }

    const updateData = { ...req.body };

    if (req.files?.image?.[0]) {
      updateData.image = req.files.image[0].path;
    }

    if (req.files?.coverImage?.[0]) {
      updateData.coverImage = req.files.coverImage[0].path;
    }

    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    if (updateData.rules && typeof updateData.rules === 'string') {
      updateData.rules = updateData.rules.split('\n').filter(rule => rule.trim());
    }

    Object.assign(group, updateData);
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete group
router.delete('/:groupId', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is creator
    if (!group.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only group creator can delete group' });
    }

    group.isActive = false;
    await group.save();

    // Remove group from all users' joined groups
    await User.updateMany(
      { joinedGroups: group._id },
      { $pull: { joinedGroups: group._id } }
    );

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's groups
router.get('/user/joined', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'joinedGroups',
      populate: {
        path: 'creator',
        select: 'name avatar'
      }
    });

    res.json(user.joinedGroups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manage member role
router.put('/:groupId/members/:userId/role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body; // 'member', 'moderator', 'admin'
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can change member roles' });
    }

    // Find member
    const member = group.members.find(m => m.user.equals(req.params.userId));

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;

    // Update role-specific arrays
    if (role === 'admin') {
      if (!group.admins.includes(req.params.userId)) {
        group.admins.push(req.params.userId);
      }
      group.moderators = group.moderators.filter(id => !id.equals(req.params.userId));
    } else if (role === 'moderator') {
      if (!group.moderators.includes(req.params.userId)) {
        group.moderators.push(req.params.userId);
      }
      group.admins = group.admins.filter(id => !id.equals(req.params.userId));
    } else {
      group.admins = group.admins.filter(id => !id.equals(req.params.userId));
      group.moderators = group.moderators.filter(id => !id.equals(req.params.userId));
    }

    await group.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
