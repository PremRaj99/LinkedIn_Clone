const express = require('express');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;

    const query = { recipient: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar headline')
      .populate('relatedPost', 'content author')
      .populate('relatedJob', 'title company')
      .populate('relatedUser', 'name avatar headline')
      .populate('relatedGroup', 'name image')
      .populate('relatedCompany', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount,
      totalPages: Math.ceil(await Notification.countDocuments(query) / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.recipient.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete notification
router.delete('/:notificationId', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.recipient.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.deleteOne();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    const totalUnread = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      stats,
      totalUnread
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { email, push, connections, messages, jobAlerts } = req.body;

    const user = await User.findById(req.user._id);

    user.notificationSettings = {
      email: email !== undefined ? email : user.notificationSettings.email,
      push: push !== undefined ? push : user.notificationSettings.push,
      connections: connections !== undefined ? connections : user.notificationSettings.connections,
      messages: messages !== undefined ? messages : user.notificationSettings.messages,
      jobAlerts: jobAlerts !== undefined ? jobAlerts : user.notificationSettings.jobAlerts
    };

    await user.save();

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: user.notificationSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create notification (internal use)
router.post('/create', async (req, res) => {
  try {
    const {
      recipient,
      sender,
      type,
      title,
      message,
      actionUrl,
      relatedPost,
      relatedJob,
      relatedUser,
      relatedGroup,
      relatedCompany,
      metadata
    } = req.body;

    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      actionUrl,
      relatedPost,
      relatedJob,
      relatedUser,
      relatedGroup,
      relatedCompany,
      metadata
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
