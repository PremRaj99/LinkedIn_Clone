const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  locationType: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite'
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'associate', 'mid-senior', 'director', 'executive'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  benefits: [String],
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resume: String,
    coverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interviewed', 'offered', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date,
  applicantCount: {
    type: Number,
    default: 0
  },
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
  category: String,
  tags: [String],
  isRemote: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1 });
jobSchema.index({ company: 1, isActive: 1 });

module.exports = mongoose.model('Job', jobSchema);
