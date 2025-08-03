const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'audio']
    },
    url: String,
    fileName: String,
    fileSize: Number
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: String,
  groupImage: String,
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  mutedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mutedUntil: Date
  }],
  typingUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
conversationSchema.index({ participants: 1, lastActivity: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

module.exports = {
  Conversation: mongoose.model('Conversation', conversationSchema),
  Message: mongoose.model('Message', messageSchema)
};
