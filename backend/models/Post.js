const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'poll', 'article', 'repost'],
    default: 'text'
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    url: String,
    thumbnail: String,
    fileName: String,
    fileSize: Number
  }],
  poll: {
    question: String,
    options: [pollOptionSchema],
    expiresAt: Date,
    allowMultiple: {
      type: Boolean,
      default: false
    }
  },
  linkPreview: {
    url: String,
    title: String,
    description: String,
    image: String,
    domain: String
  },
  hashtags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  taggedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  repostContent: String,
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reactionType: {
      type: String,
      enum: ['like', 'love', 'celebrate', 'support', 'insightful', 'funny'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    shareType: {
      type: String,
      enum: ['repost', 'send', 'copy_link'],
      default: 'repost'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReasons: [String],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  engagement: {
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    sharesCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ visibility: 1, createdAt: -1 });

// Update engagement counts
postSchema.methods.updateEngagement = function () {
  this.engagement.likesCount = this.likes.length;
  this.engagement.commentsCount = this.comments.length;
  this.engagement.sharesCount = this.shares.length;
  this.engagement.viewsCount = this.views.length;
};

module.exports = mongoose.model('Post', postSchema);
