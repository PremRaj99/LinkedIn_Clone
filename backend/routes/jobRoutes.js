const express = require('express');
const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Create job posting
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      locationType,
      jobType,
      experienceLevel,
      description,
      requirements,
      responsibilities,
      skills,
      benefits,
      salaryRange,
      category,
      tags,
      expiresAt,
      isRemote
    } = req.body;

    // Check if user has permission to post for this company
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const isAuthorized = companyDoc.admins.some(admin =>
      admin.user.equals(req.user._id) &&
      ['super_admin', 'admin', 'recruiter'].includes(admin.role)
    );

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to post jobs for this company' });
    }

    const job = new Job({
      title,
      company,
      location,
      locationType,
      jobType,
      experienceLevel,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      benefits: benefits || [],
      salaryRange,
      postedBy: req.user._id,
      category,
      tags: tags || [],
      expiresAt,
      isRemote: isRemote || locationType === 'remote'
    });

    await job.save();
    await job.populate([
      { path: 'company', select: 'name logo industry' },
      { path: 'postedBy', select: 'name email avatar' }
    ]);

    // Add job to company's job postings
    companyDoc.jobPostings.push(job._id);
    await companyDoc.save();

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all jobs with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      jobType,
      experienceLevel,
      company,
      isRemote,
      salaryMin,
      salaryMax,
      sortBy = 'createdAt'
    } = req.query;

    const query = { isActive: true };

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Company filter
    if (company) {
      query.company = company;
    }

    // Remote filter
    if (isRemote === 'true') {
      query.isRemote = true;
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      query['salaryRange.min'] = {};
      if (salaryMin) query['salaryRange.min'].$gte = parseInt(salaryMin);
      if (salaryMax) query['salaryRange.max'] = { $lte: parseInt(salaryMax) };
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo industry')
      .populate('postedBy', 'name email avatar')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single job
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('company', 'name logo industry description website')
      .populate('postedBy', 'name email avatar headline')
      .populate('applications.applicant', 'name email avatar headline');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for job
router.post('/:jobId/apply', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = job.applications.find(app =>
      app.applicant.equals(req.user._id)
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = {
      applicant: req.user._id,
      resume: req.file ? req.file.path : '',
      coverLetter: coverLetter || '',
      status: 'applied'
    };

    job.applications.push(application);
    job.applicantCount = job.applications.length;
    await job.save();

    // Create notification for job poster
    const notification = new Notification({
      recipient: job.postedBy,
      sender: req.user._id,
      type: 'job_application',
      title: 'New Job Application',
      message: `${req.user.name} applied for your job posting: ${job.title}`,
      relatedJob: job._id,
      relatedUser: req.user._id
    });
    await notification.save();

    // Add job to user's applied jobs
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { appliedJobs: job._id }
    });

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (for recruiters)
router.put('/:jobId/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const job = await Job.findById(req.params.jobId).populate('company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has permission to update applications
    const isAuthorized = job.company.admins.some(admin =>
      admin.user.equals(req.user._id) &&
      ['super_admin', 'admin', 'recruiter'].includes(admin.role)
    ) || job.postedBy.equals(req.user._id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update applications' });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.notes = notes;
    await job.save();

    // Create notification for applicant
    const notification = new Notification({
      recipient: application.applicant,
      sender: req.user._id,
      type: 'job_update',
      title: 'Application Status Update',
      message: `Your application for ${job.title} has been ${status}`,
      relatedJob: job._id
    });
    await notification.save();

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's applied jobs
router.get('/user/applications', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.applicant': req.user._id
    })
      .populate('company', 'name logo')
      .populate('postedBy', 'name email avatar')
      .sort({ 'applications.appliedAt': -1 });

    const applications = jobs.map(job => {
      const application = job.applications.find(app =>
        app.applicant.equals(req.user._id)
      );
      return {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          postedBy: job.postedBy
        },
        application
      };
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save/unsave job
router.post('/:jobId/save', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;

    const isSaved = user.savedJobs.includes(jobId);

    if (isSaved) {
      user.savedJobs.pull(jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.json({
      message: isSaved ? 'Job unsaved successfully' : 'Job saved successfully',
      isSaved: !isSaved
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get saved jobs
router.get('/user/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: {
        path: 'company',
        select: 'name logo'
      }
    });

    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get jobs by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const jobs = await Job.find({
      company: req.params.companyId,
      isActive: true
    })
      .populate('company', 'name logo')
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments({
      company: req.params.companyId,
      isActive: true
    });

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job
router.put('/:jobId', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    const isAuthorized = job.company.admins.some(admin =>
      admin.user.equals(req.user._id) &&
      ['super_admin', 'admin', 'recruiter'].includes(admin.role)
    ) || job.postedBy.equals(req.user._id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete job
router.delete('/:jobId', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    const isAuthorized = job.company.admins.some(admin =>
      admin.user.equals(req.user._id) &&
      ['super_admin', 'admin', 'recruiter'].includes(admin.role)
    ) || job.postedBy.equals(req.user._id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    job.isActive = false;
    await job.save();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
