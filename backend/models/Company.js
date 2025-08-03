const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  logo: String,
  coverImage: String,
  website: String,
  industry: {
    type: String,
    required: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'],
    required: true
  },
  companyType: {
    type: String,
    enum: ['public', 'private', 'nonprofit', 'government', 'startup'],
    required: true
  },
  foundedYear: Number,
  headquarters: {
    city: String,
    state: String,
    country: String,
    address: String
  },
  locations: [{
    city: String,
    state: String,
    country: String,
    address: String,
    isHeadquarters: {
      type: Boolean,
      default: false
    }
  }],
  admins: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'content_admin', 'recruiter'],
      default: 'admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: String,
    department: String,
    startDate: Date,
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: true
    }
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  jobPostings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  specialties: [String],
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String
  },
  contactInfo: {
    email: String,
    phone: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  followerCount: {
    type: Number,
    default: 0
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  analytics: {
    profileViews: {
      type: Number,
      default: 0
    },
    searchAppearances: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
companySchema.index({ name: 'text', description: 'text', specialties: 'text' });
companySchema.index({ industry: 1, companySize: 1 });
companySchema.index({ 'headquarters.city': 1, 'headquarters.country': 1 });

module.exports = mongoose.model('Company', companySchema);
