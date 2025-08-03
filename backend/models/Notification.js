const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'like',
      'comment',
      'share',
      'connection_request',
      'connection_accepted',
      'message',
      'job_application',
      'job_update',
      'profile_view',
      'mention',
      'tag',
      'group_invite',
      'group_post',
      'company_update',
      'post_approved',
      'post_rejected'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  actionUrl: String,
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  relatedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  isPushSent: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
