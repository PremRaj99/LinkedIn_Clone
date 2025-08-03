const express = require('express');
const { Conversation, Message } = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get all conversations for a user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      participants: req.user._id,
      isArchived: false
    })
      .populate('participants', 'name avatar headline lastSeen')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get or create conversation
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const { participants, isGroup, groupName } = req.body;

    // Add current user to participants if not already included
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];

    let conversation;

    if (!isGroup && allParticipants.length === 2) {
      // Check if conversation already exists for these two users
      conversation = await Conversation.findOne({
        participants: { $all: allParticipants, $size: 2 },
        isGroup: false
      }).populate('participants', 'name avatar headline lastSeen');
    }

    if (!conversation) {
      conversation = new Conversation({
        participants: allParticipants,
        isGroup: isGroup || false,
        groupName: groupName || '',
        admins: isGroup ? [req.user._id] : []
      });

      await conversation.save();
      await conversation.populate('participants', 'name avatar headline lastSeen');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      _id: { $in: conversation.messages }
    })
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        _id: { $in: conversation.messages },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
router.post('/conversations/:conversationId/messages', authMiddleware, upload.array('attachments', 5), async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo } = req.body;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attachments = req.files ? req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      url: file.path,
      fileName: file.originalname,
      fileSize: file.size
    })) : [];

    const message = new Message({
      sender: req.user._id,
      content: content || '',
      messageType,
      attachments,
      replyTo: replyTo || null
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    // Add message to conversation
    conversation.messages.push(message._id);
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Create notifications for other participants
    const otherParticipants = conversation.participants.filter(
      p => !p.equals(req.user._id)
    );

    const notifications = otherParticipants.map(participantId => ({
      recipient: participantId,
      sender: req.user._id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name} sent you a message`,
      actionUrl: `/messages/${conversationId}`
    }));

    await Notification.insertMany(notifications);

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update message (edit)
router.put('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (!message.sender.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (!message.sender.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark conversation as read
router.put('/conversations/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all messages in conversation as read
    await Message.updateMany(
      {
        _id: { $in: conversation.messages },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Archive conversation
router.put('/conversations/:conversationId/archive', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    conversation.isArchived = true;
    await conversation.save();

    res.json({ message: 'Conversation archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search messages
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, conversationId } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchFilter = {
      content: { $regex: query, $options: 'i' },
      isDeleted: false
    };

    // Get conversations where user is participant
    const userConversations = await Conversation.find({
      participants: req.user._id
    }).select('messages');

    const messageIds = userConversations.flatMap(conv => conv.messages);

    searchFilter._id = { $in: messageIds };

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (conversation && conversation.participants.includes(req.user._id)) {
        searchFilter._id = { $in: conversation.messages };
      }
    }

    const messages = await Message.find(searchFilter)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set typing status
router.post('/conversations/:conversationId/typing', authMiddleware, async (req, res) => {
  try {
    const { isTyping } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (isTyping) {
      // Add user to typing users if not already there
      const existingTyping = conversation.typingUsers.find(
        tu => tu.user.equals(req.user._id)
      );

      if (!existingTyping) {
        conversation.typingUsers.push({
          user: req.user._id,
          startedAt: new Date()
        });
      } else {
        existingTyping.startedAt = new Date();
      }
    } else {
      // Remove user from typing users
      conversation.typingUsers = conversation.typingUsers.filter(
        tu => !tu.user.equals(req.user._id)
      );
    }

    await conversation.save();

    // Emit typing status to other participants via socket (to be implemented)
    res.json({ message: 'Typing status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
