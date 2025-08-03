const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      emailVerificationToken: crypto.randomBytes(32).toString('hex')
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        headline: user.headline,
        customUrl: user.customUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        headline: user.headline,
        customUrl: user.customUrl,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('connections.user', 'name avatar headline customUrl')
      .populate('followers', 'name avatar headline customUrl')
      .populate('following', 'name avatar headline customUrl')
      .populate('companyPages', 'name logo')
      .populate('joinedGroups', 'name image memberCount');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if requesting user can view this profile
    const requestingUser = req.user;
    let canView = true;

    if (requestingUser && !user.canViewProfile(user)) {
      canView = false;
    }

    if (!canView) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    // Add profile view if different user
    if (requestingUser && !requestingUser._id.equals(user._id)) {
      // Check if already viewed recently (within last hour)
      const recentView = user.profileViews.find(view =>
        view.user.equals(requestingUser._id) &&
        (new Date() - view.viewedAt) < 3600000 // 1 hour
      );

      if (!recentView) {
        user.profileViews.push({
          user: requestingUser._id,
          viewedAt: new Date()
        });
        await user.save();

        // Create notification for profile owner
        if (user.privacy.showActivity) {
          const notification = new Notification({
            recipient: user._id,
            sender: requestingUser._id,
            type: 'profile_view',
            title: 'Profile View',
            message: `${requestingUser.name} viewed your profile`,
            relatedUser: requestingUser._id
          });
          await notification.save();
        }
      }
    }

    // Hide sensitive information for non-owners
    const isOwner = requestingUser && requestingUser._id.equals(user._id);
    const userResponse = user.toObject();

    if (!isOwner) {
      delete userResponse.email;
      delete userResponse.phone;
      delete userResponse.notificationSettings;
      delete userResponse.privacy;
      delete userResponse.blockedUsers;
      delete userResponse.savedPosts;
      delete userResponse.savedJobs;

      // Hide connections if privacy setting is off
      if (!user.privacy.showConnections) {
        userResponse.connections = [];
        userResponse.followers = [];
        userResponse.following = [];
      }
    }

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update banner image
router.put('/banner', authMiddleware, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.bannerImage = req.file.path;
    await user.save();

    res.json({
      message: 'Banner updated successfully',
      bannerImage: user.bannerImage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      headline,
      bio,
      location,
      industry,
      website,
      phone,
      customUrl,
      skills,
      languages
    } = req.body;

    const user = await User.findById(req.user._id);

    // Check if custom URL is already taken
    if (customUrl && customUrl !== user.customUrl) {
      const existingUser = await User.findOne({
        customUrl,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Custom URL already taken' });
      }
    }

    const updateData = {
      name: name || user.name,
      headline: headline !== undefined ? headline : user.headline,
      bio: bio !== undefined ? bio : user.bio,
      location: location !== undefined ? location : user.location,
      industry: industry !== undefined ? industry : user.industry,
      website: website !== undefined ? website : user.website,
      phone: phone !== undefined ? phone : user.phone,
      customUrl: customUrl || user.customUrl,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : user.skills,
      languages: languages ? JSON.parse(languages) : user.languages
    };

    Object.assign(user, updateData);
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        headline: user.headline,
        bio: user.bio,
        location: user.location,
        industry: user.industry,
        website: user.website,
        phone: user.phone,
        customUrl: user.customUrl,
        skills: user.skills,
        languages: user.languages,
        avatar: user.avatar,
        bannerImage: user.bannerImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add experience
router.post('/experience', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      startDate,
      endDate,
      current,
      description,
      companyLogo
    } = req.body;

    const user = await User.findById(req.user._id);

    const experience = {
      title,
      company,
      location,
      startDate: new Date(startDate),
      endDate: current ? null : new Date(endDate),
      current: current || false,
      description,
      companyLogo
    };

    user.experience.push(experience);
    await user.save();

    res.json({
      message: 'Experience added successfully',
      experience: user.experience[user.experience.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update experience
router.put('/experience/:experienceId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const experience = user.experience.id(req.params.experienceId);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    Object.assign(experience, req.body);

    if (req.body.endDate) {
      experience.endDate = new Date(req.body.endDate);
    }

    if (req.body.startDate) {
      experience.startDate = new Date(req.body.startDate);
    }

    await user.save();

    res.json({
      message: 'Experience updated successfully',
      experience
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete experience
router.delete('/experience/:experienceId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.experience.id(req.params.experienceId).remove();
    await user.save();

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add education
router.post('/education', authMiddleware, async (req, res) => {
  try {
    const {
      school,
      degree,
      field,
      startDate,
      endDate,
      description,
      schoolLogo
    } = req.body;

    const user = await User.findById(req.user._id);

    const education = {
      school,
      degree,
      field,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
      schoolLogo
    };

    user.education.push(education);
    await user.save();

    res.json({
      message: 'Education added successfully',
      education: user.education[user.education.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update education
router.put('/education/:educationId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const education = user.education.id(req.params.educationId);

    if (!education) {
      return res.status(404).json({ message: 'Education not found' });
    }

    Object.assign(education, req.body);

    if (req.body.endDate) {
      education.endDate = new Date(req.body.endDate);
    }

    if (req.body.startDate) {
      education.startDate = new Date(req.body.startDate);
    }

    await user.save();

    res.json({
      message: 'Education updated successfully',
      education
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete education
router.delete('/education/:educationId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.education.id(req.params.educationId).remove();
    await user.save();

    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add certification
router.post('/certifications', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      organization,
      issueDate,
      expirationDate,
      credentialId,
      credentialUrl
    } = req.body;

    const user = await User.findById(req.user._id);

    const certification = {
      name,
      organization,
      issueDate: new Date(issueDate),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      credentialId,
      credentialUrl
    };

    user.certifications.push(certification);
    await user.save();

    res.json({
      message: 'Certification added successfully',
      certification: user.certifications[user.certifications.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send connection request
router.post('/connect/:userId', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    // Check if connection already exists
    const existingConnection = targetUser.connections.find(conn =>
      conn.user.equals(currentUser._id)
    );

    if (existingConnection) {
      return res.status(400).json({
        message: 'Connection request already exists or you are already connected'
      });
    }

    // Check if user is blocked
    if (targetUser.blockedUsers.includes(currentUser._id)) {
      return res.status(400).json({ message: 'Cannot send connection request' });
    }

    // Add connection request
    targetUser.connections.push({
      user: currentUser._id,
      status: 'pending'
    });

    await targetUser.save();

    // Create notification
    const notification = new Notification({
      recipient: targetUser._id,
      sender: currentUser._id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: message || `${currentUser.name} wants to connect with you`,
      relatedUser: currentUser._id
    });

    await notification.save();

    res.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept/decline connection request
router.put('/connect/:userId/:action', authMiddleware, async (req, res) => {
  try {
    const { action } = req.params; // 'accept' or 'decline'
    const currentUser = await User.findById(req.user._id);
    const requestingUser = await User.findById(req.params.userId);

    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find connection request
    const connectionIndex = currentUser.connections.findIndex(conn =>
      conn.user.equals(requestingUser._id) && conn.status === 'pending'
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (action === 'accept') {
      // Update status to accepted
      currentUser.connections[connectionIndex].status = 'accepted';

      // Add reverse connection
      requestingUser.connections.push({
        user: currentUser._id,
        status: 'accepted'
      });

      await currentUser.save();
      await requestingUser.save();

      // Create notification
      const notification = new Notification({
        recipient: requestingUser._id,
        sender: currentUser._id,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${currentUser.name} accepted your connection request`,
        relatedUser: currentUser._id
      });

      await notification.save();

      res.json({ message: 'Connection request accepted' });
    } else if (action === 'decline') {
      // Remove connection request
      currentUser.connections.splice(connectionIndex, 1);
      await currentUser.save();

      res.json({ message: 'Connection request declined' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user connections
router.get('/connections', authMiddleware, async (req, res) => {
  try {
    const { status = 'accepted', page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'connections.user',
        select: 'name avatar headline customUrl location industry',
        match: { isActive: true }
      });

    const connections = user.connections
      .filter(conn => conn.status === status && conn.user)
      .map(conn => ({
        user: conn.user,
        status: conn.status,
        connectedAt: conn.createdAt
      }));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedConnections = connections.slice(startIndex, endIndex);

    res.json({
      connections: paginatedConnections,
      total: connections.length,
      totalPages: Math.ceil(connections.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      location,
      industry,
      page = 1,
      limit = 20,
      connections = false
    } = req.query;

    const searchQuery = { isActive: true };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { headline: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    if (industry) {
      searchQuery.industry = { $regex: industry, $options: 'i' };
    }

    // Filter by connections if requested
    if (connections === 'true' && req.user) {
      const currentUser = await User.findById(req.user._id);
      const connectionIds = currentUser.connections
        .filter(conn => conn.status === 'accepted')
        .map(conn => conn.user);

      searchQuery._id = { $in: connectionIds };
    }

    const users = await User.find(searchQuery)
      .select('name avatar headline location industry customUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(searchQuery);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow/unfollow user
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      // Create notification
      const notification = new Notification({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'connection_request',
        title: 'New Follower',
        message: `${currentUser.name} started following you`,
        relatedUser: currentUser._id
      });

      await notification.save();
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'User unfollowed successfully' : 'User followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Block/unblock user
router.post('/block/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const isBlocked = currentUser.blockedUsers.includes(targetUser._id);

    if (isBlocked) {
      // Unblock
      currentUser.blockedUsers.pull(targetUser._id);
    } else {
      // Block
      currentUser.blockedUsers.push(targetUser._id);

      // Remove connections and follows
      currentUser.connections = currentUser.connections.filter(conn =>
        !conn.user.equals(targetUser._id)
      );
      targetUser.connections = targetUser.connections.filter(conn =>
        !conn.user.equals(currentUser._id)
      );

      currentUser.following.pull(targetUser._id);
      currentUser.followers.pull(targetUser._id);
      targetUser.following.pull(currentUser._id);
      targetUser.followers.pull(currentUser._id);

      await targetUser.save();
    }

    await currentUser.save();

    res.json({
      message: isBlocked ? 'User unblocked successfully' : 'User blocked successfully',
      isBlocked: !isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mutual connections
router.get('/mutual/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId)
      .populate('connections.user', 'name avatar headline customUrl');
    const currentUser = await User.findById(req.user._id)
      .populate('connections.user', 'name avatar headline customUrl');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mutualConnections = currentUser.getMutualConnections(targetUser);

    // Get full user details for mutual connections
    const mutualUsers = await User.find({
      _id: { $in: mutualConnections }
    }).select('name avatar headline customUrl');

    res.json({
      count: mutualConnections.length,
      connections: mutualUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update privacy settings
router.put('/privacy', authMiddleware, async (req, res) => {
  try {
    const {
      profileVisibility,
      showActivity,
      showConnections
    } = req.body;

    const user = await User.findById(req.user._id);

    user.privacy = {
      profileVisibility: profileVisibility || user.privacy.profileVisibility,
      showActivity: showActivity !== undefined ? showActivity : user.privacy.showActivity,
      showConnections: showConnections !== undefined ? showConnections : user.privacy.showConnections
    };

    await user.save();

    res.json({
      message: 'Privacy settings updated successfully',
      privacy: user.privacy
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get profile views
router.get('/profile-views', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'profileViews.user',
        select: 'name avatar headline customUrl'
      });

    const views = user.profileViews
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice((page - 1) * limit, page * limit);

    res.json({
      views,
      total: user.profileViews.length,
      totalPages: Math.ceil(user.profileViews.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get people you may know
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentUser = await User.findById(req.user._id);

    // Get IDs of current connections, blocked users, and self
    const excludeIds = [
      ...currentUser.connections.map(conn => conn.user),
      ...currentUser.blockedUsers,
      currentUser._id
    ];

    // Find users with similar industry, location, or mutual connections
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds },
          isActive: true,
          $or: [
            { industry: currentUser.industry },
            { location: { $regex: currentUser.location, $options: 'i' } },
            { skills: { $in: currentUser.skills } }
          ]
        }
      },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          name: 1,
          avatar: 1,
          headline: 1,
          location: 1,
          industry: 1,
          customUrl: 1
        }
      }
    ]);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save/unsave post
router.post('/save-post/:postId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.postId;

    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      user.savedPosts.pull(postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();

    res.json({
      message: isSaved ? 'Post unsaved successfully' : 'Post saved successfully',
      isSaved: !isSaved
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get saved posts
router.get('/saved-posts', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'author',
          select: 'name avatar headline'
        },
        options: {
          limit: parseInt(limit),
          skip: (page - 1) * limit,
          sort: { createdAt: -1 }
        }
      });

    res.json({
      posts: user.savedPosts,
      totalPages: Math.ceil(user.savedPosts.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Here you would send an email with the reset token
    // For now, we'll just return the token (in production, never do this)

    res.json({
      message: 'Password reset token sent',
      token: resetToken // Remove this in production
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
