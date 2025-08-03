const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: String,
  coverImage: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    required: true
  },
  tags: [String],
  rules: [String],
  isPrivate: {
    type: Boolean,
    default: false
  },
  requireApproval: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  settings: {
    allowMemberPosts: {
      type: Boolean,
      default: true
    },
    allowMemberInvites: {
      type: Boolean,
      default: false
    },
    requirePostApproval: {
      type: Boolean,
      default: false
    }
  },
  location: String,
  website: String,
  linkedInPage: String
}, {
  timestamps: true
});

// Index for better search performance
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });
groupSchema.index({ category: 1, isPrivate: 1 });
groupSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Group', groupSchema);
