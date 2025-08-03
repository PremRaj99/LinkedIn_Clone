const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  headline: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  customUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profileViews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String,
    companyLogo: String
  }],
  education: [{
    school: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String,
    schoolLogo: String
  }],
  certifications: [{
    name: String,
    organization: String,
    issueDate: Date,
    expirationDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  skills: [String],
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['elementary', 'limited', 'professional', 'full', 'native']
    }
  }],
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  joinedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  companyPages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    connections: {
      type: Boolean,
      default: true
    },
    messages: {
      type: Boolean,
      default: true
    },
    jobAlerts: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    },
    showActivity: {
      type: Boolean,
      default: true
    },
    showConnections: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate custom URL from name if not provided
userSchema.pre('save', function (next) {
  if (!this.customUrl && this.name) {
    this.customUrl = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to check if user can view another user's profile
userSchema.methods.canViewProfile = function (targetUser) {
  if (targetUser.privacy.profileVisibility === 'public') return true;
  if (targetUser.privacy.profileVisibility === 'private') return this._id.equals(targetUser._id);
  if (targetUser.privacy.profileVisibility === 'connections') {
    return this._id.equals(targetUser._id) ||
      targetUser.connections.some(conn => conn.user.equals(this._id) && conn.status === 'accepted');
  }
  return false;
};

// Method to get mutual connections
userSchema.methods.getMutualConnections = function (targetUser) {
  const myConnections = this.connections
    .filter(conn => conn.status === 'accepted')
    .map(conn => conn.user.toString());

  const targetConnections = targetUser.connections
    .filter(conn => conn.status === 'accepted')
    .map(conn => conn.user.toString());

  return myConnections.filter(conn => targetConnections.includes(conn));
};

module.exports = mongoose.model('User', userSchema);
