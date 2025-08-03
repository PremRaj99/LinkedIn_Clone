const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { timeRange = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true }),
      Post.countDocuments(),
      Post.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments(),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Company.countDocuments(),
      Company.countDocuments({ createdAt: { $gte: startDate } }),
      Group.countDocuments(),
      Group.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    const [
      totalUsers, newUsers, activeUsers, verifiedUsers,
      totalPosts, newPosts,
      totalJobs, newJobs,
      totalCompanies, newCompanies,
      totalGroups, newGroups
    ] = stats;

    // Recent activity
    const recentActivity = await getRecentActivity();

    // Top performing content
    const topContent = await getTopPerformingContent();

    res.json({
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        verifiedUsers,
        totalPosts,
        newPosts,
        totalJobs,
        newJobs,
        totalCompanies,
        newCompanies,
        totalGroups,
        newGroups
      },
      recentActivity,
      topContent,
      timeRange
    });

  } catch (error) {
    res.status(500).json({ message: 'Dashboard error', error: error.message });
  }
});

// User management
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (status === 'verified') query.isVerified = true;
      if (status === 'suspended') query.isSuspended = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Users fetch error', error: error.message });
  }
});

// Update user status
router.patch('/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isVerified, isSuspended, suspensionReason } = req.body;

    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    if (typeof isSuspended === 'boolean') {
      updateData.isSuspended = isSuspended;
      if (isSuspended && suspensionReason) {
        updateData.suspensionReason = suspensionReason;
        updateData.suspendedAt = new Date();
      } else if (!isSuspended) {
        updateData.suspensionReason = undefined;
        updateData.suspendedAt = undefined;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated', user });

  } catch (error) {
    res.status(500).json({ message: 'Status update error', error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Soft delete - mark as deleted instead of removing
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Handle cascading effects (posts, connections, etc.)

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'User deletion error', error: error.message });
  }
});

// Content management - Posts
router.get('/posts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      type = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { 'author.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      if (status === 'flagged') query.isFlagged = true;
      if (status === 'hidden') query.isHidden = true;
      if (status === 'reported') query.reports = { $exists: true, $ne: [] };
    }

    if (type !== 'all') {
      query.type = type;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .populate('company', 'name logo')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Posts fetch error', error: error.message });
  }
});

// Moderate post
router.patch('/posts/:postId/moderate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { action, reason } = req.body; // actions: 'hide', 'flag', 'delete', 'approve'

    const updateData = {
      moderatedBy: req.user._id,
      moderatedAt: new Date(),
      moderationReason: reason
    };

    switch (action) {
      case 'hide':
        updateData.isHidden = true;
        break;
      case 'flag':
        updateData.isFlagged = true;
        break;
      case 'delete':
        updateData.isDeleted = true;
        updateData.deletedAt = new Date();
        break;
      case 'approve':
        updateData.isHidden = false;
        updateData.isFlagged = false;
        updateData.moderationReason = 'Approved by admin';
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { $set: updateData },
      { new: true }
    ).populate('author', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: `Post ${action}ed successfully`, post });

  } catch (error) {
    res.status(500).json({ message: 'Post moderation error', error: error.message });
  }
});

// Reports management
router.get('/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = 'all', // post, user, comment
      status = 'pending'
    } = req.query;

    // This would require a Report model, simplified for now
    const reports = [
      {
        id: '1',
        type: 'post',
        targetId: 'post123',
        reportedBy: 'user456',
        reason: 'inappropriate content',
        status: 'pending',
        createdAt: new Date()
      }
    ];

    res.json({
      reports,
      pagination: {
        current: page,
        pages: 1,
        total: reports.length
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Reports fetch error', error: error.message });
  }
});

// Job management
router.get('/jobs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (status === 'flagged') query.isFlagged = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .populate('postedBy', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Jobs fetch error', error: error.message });
  }
});

// Company management
router.get('/companies', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      if (status === 'verified') query.isVerified = true;
      if (status === 'unverified') query.isVerified = false;
      if (status === 'active') query.isActive = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const companies = await Company.find(query)
      .populate('admins.user', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Companies fetch error', error: error.message });
  }
});

// Verify company
router.patch('/companies/:companyId/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { isVerified, verificationNote } = req.body;

    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        isVerified,
        verifiedBy: req.user._id,
        verifiedAt: isVerified ? new Date() : null,
        verificationNote
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company verification updated', company });

  } catch (error) {
    res.status(500).json({ message: 'Company verification error', error: error.message });
  }
});

// System settings
router.get('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // This would come from a Settings model or configuration
    const settings = {
      platform: {
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true,
        autoApproveCompanies: false
      },
      content: {
        maxPostLength: 3000,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        moderationEnabled: true,
        autoModeration: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        digestEmails: true
      },
      security: {
        passwordStrength: 'medium',
        twoFactorRequired: false,
        sessionTimeout: 30 * 24 * 60 * 60 * 1000 // 30 days
      }
    };

    res.json(settings);

  } catch (error) {
    res.status(500).json({ message: 'Settings fetch error', error: error.message });
  }
});

// Update system settings
router.patch('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category, settings } = req.body;

    // In a real app, this would update a Settings model
    // For now, just return success

    res.json({
      message: 'Settings updated successfully',
      category,
      settings
    });

  } catch (error) {
    res.status(500).json({ message: 'Settings update error', error: error.message });
  }
});

// Bulk actions
router.post('/bulk-actions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { action, type, ids, data } = req.body;

    let result = {};

    switch (type) {
      case 'users':
        result = await handleUserBulkAction(action, ids, data);
        break;
      case 'posts':
        result = await handlePostBulkAction(action, ids, data);
        break;
      case 'jobs':
        result = await handleJobBulkAction(action, ids, data);
        break;
      default:
        return res.status(400).json({ message: 'Invalid bulk action type' });
    }

    res.json({ message: 'Bulk action completed', result });

  } catch (error) {
    res.status(500).json({ message: 'Bulk action error', error: error.message });
  }
});

// Helper functions
async function getRecentActivity() {
  const [recentUsers, recentPosts, recentJobs] = await Promise.all([
    User.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Post.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Job.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  return {
    users: recentUsers,
    posts: recentPosts,
    jobs: recentJobs
  };
}

async function getTopPerformingContent() {
  const [topPosts, topJobs] = await Promise.all([
    Post.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      .populate('author', 'name')
      .sort({ engagementScore: -1 })
      .limit(5),
    Job.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      .populate('company', 'name')
      .sort({ applications: -1 })
      .limit(5)
  ]);

  return {
    posts: topPosts,
    jobs: topJobs
  };
}

async function handleUserBulkAction(action, userIds, data) {
  switch (action) {
    case 'suspend':
      return await User.updateMany(
        { _id: { $in: userIds } },
        {
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: data.reason
        }
      );
    case 'activate':
      return await User.updateMany(
        { _id: { $in: userIds } },
        {
          isActive: true,
          isSuspended: false,
          suspensionReason: null
        }
      );
    case 'verify':
      return await User.updateMany(
        { _id: { $in: userIds } },
        { isVerified: true }
      );
    default:
      throw new Error('Invalid user bulk action');
  }
}

async function handlePostBulkAction(action, postIds, data) {
  switch (action) {
    case 'hide':
      return await Post.updateMany(
        { _id: { $in: postIds } },
        {
          isHidden: true,
          moderationReason: data.reason
        }
      );
    case 'approve':
      return await Post.updateMany(
        { _id: { $in: postIds } },
        {
          isHidden: false,
          isFlagged: false,
          moderationReason: 'Approved by admin'
        }
      );
    case 'delete':
      return await Post.updateMany(
        { _id: { $in: postIds } },
        {
          isDeleted: true,
          deletedAt: new Date(),
          moderationReason: data.reason
        }
      );
    default:
      throw new Error('Invalid post bulk action');
  }
}

async function handleJobBulkAction(action, jobIds, data) {
  switch (action) {
    case 'activate':
      return await Job.updateMany(
        { _id: { $in: jobIds } },
        { isActive: true }
      );
    case 'deactivate':
      return await Job.updateMany(
        { _id: { $in: jobIds } },
        { isActive: false }
      );
    default:
      throw new Error('Invalid job bulk action');
  }
}

module.exports = router;
