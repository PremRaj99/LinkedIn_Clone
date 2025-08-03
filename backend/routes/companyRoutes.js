const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Create company
router.post('/', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      industry,
      companySize,
      companyType,
      foundedYear,
      headquarters,
      locations,
      specialties,
      socialLinks,
      contactInfo
    } = req.body;

    // Check if company name already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company with this name already exists' });
    }

    const company = new Company({
      name,
      description,
      website,
      industry,
      companySize,
      companyType,
      foundedYear,
      headquarters: headquarters ? JSON.parse(headquarters) : {},
      locations: locations ? JSON.parse(locations) : [],
      specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      contactInfo: contactInfo ? JSON.parse(contactInfo) : {},
      logo: req.files?.logo?.[0]?.path || '',
      coverImage: req.files?.coverImage?.[0]?.path || ''
    });

    // Add creator as super admin
    company.admins.push({
      user: req.user._id,
      role: 'super_admin'
    });

    await company.save();

    // Add company to user's company pages
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { companyPages: company._id }
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all companies with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      industry,
      companySize,
      location,
      sortBy = 'followerCount'
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (industry) {
      query.industry = industry;
    }

    if (companySize) {
      query.companySize = companySize;
    }

    if (location) {
      query.$or = [
        { 'headquarters.city': { $regex: location, $options: 'i' } },
        { 'headquarters.country': { $regex: location, $options: 'i' } },
        { 'locations.city': { $regex: location, $options: 'i' } },
        { 'locations.country': { $regex: location, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single company
router.get('/:companyId', async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId)
      .populate('admins.user', 'name avatar headline')
      .populate('employees.user', 'name avatar headline')
      .populate('jobPostings')
      .populate('followers', 'name avatar headline');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Increment profile views
    company.analytics.profileViews += 1;
    await company.save();

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow/unfollow company
router.post('/:companyId/follow', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const isFollowing = company.followers.includes(req.user._id);

    if (isFollowing) {
      company.followers.pull(req.user._id);
      company.followerCount = Math.max(0, company.followerCount - 1);
    } else {
      company.followers.push(req.user._id);
      company.followerCount += 1;
    }

    await company.save();

    res.json({
      message: isFollowing ? 'Company unfollowed successfully' : 'Company followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company posts
router.get('/:companyId/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({
      company: req.params.companyId,
      isArchived: false
    })
      .populate('author', 'name avatar headline')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      company: req.params.companyId,
      isArchived: false
    });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company jobs
router.get('/:companyId/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive = 'true' } = req.query;

    const query = {
      company: req.params.companyId,
      isActive: isActive === 'true'
    };

    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add employee to company
router.post('/:companyId/employees', authMiddleware, async (req, res) => {
  try {
    const { userId, position, department, startDate } = req.body;
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is admin
    const isAdmin = company.admins.some(admin =>
      admin.user.equals(req.user._id) &&
      ['super_admin', 'admin'].includes(admin.role)
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can add employees' });
    }

    // Check if employee already exists
    const existingEmployee = company.employees.find(emp =>
      emp.user.equals(userId) && emp.isCurrent
    );

    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    company.employees.push({
      user: userId,
      position,
      department,
      startDate: startDate || new Date(),
      isCurrent: true
    });

    company.employeeCount += 1;
    await company.save();

    // Add to user's experience
    const user = await User.findById(userId);
    user.experience.push({
      title: position,
      company: company.name,
      location: company.headquarters.city || '',
      startDate: startDate || new Date(),
      current: true,
      description: `${position} at ${company.name}`
    });

    await user.save();

    res.json({ message: 'Employee added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update company
router.put('/:companyId', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is admin
    const isAdmin = company.admins.some(admin =>
      admin.user.equals(req.user._id) &&
      ['super_admin', 'admin', 'content_admin'].includes(admin.role)
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can update company' });
    }

    const updateData = { ...req.body };

    if (req.files?.logo?.[0]) {
      updateData.logo = req.files.logo[0].path;
    }

    if (req.files?.coverImage?.[0]) {
      updateData.coverImage = req.files.coverImage[0].path;
    }

    // Parse JSON fields
    ['headquarters', 'locations', 'socialLinks', 'contactInfo'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          delete updateData[field];
        }
      }
    });

    if (updateData.specialties && typeof updateData.specialties === 'string') {
      updateData.specialties = updateData.specialties.split(',').map(s => s.trim());
    }

    Object.assign(company, updateData);
    await company.save();

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add admin to company
router.post('/:companyId/admins', authMiddleware, async (req, res) => {
  try {
    const { userId, role = 'admin' } = req.body;
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is super admin
    const isSuperAdmin = company.admins.some(admin =>
      admin.user.equals(req.user._id) && admin.role === 'super_admin'
    );

    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Only super admins can add admins' });
    }

    // Check if user is already an admin
    const existingAdmin = company.admins.find(admin =>
      admin.user.equals(userId)
    );

    if (existingAdmin) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    company.admins.push({
      user: userId,
      role
    });

    await company.save();

    // Add company to user's company pages
    await User.findByIdAndUpdate(userId, {
      $addToSet: { companyPages: company._id }
    });

    // Create notification
    const notification = new Notification({
      recipient: userId,
      sender: req.user._id,
      type: 'company_update',
      title: 'Company Admin Access',
      message: `You have been added as ${role} for ${company.name}`,
      relatedCompany: company._id
    });

    await notification.save();

    res.json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove admin from company
router.delete('/:companyId/admins/:userId', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is super admin
    const isSuperAdmin = company.admins.some(admin =>
      admin.user.equals(req.user._id) && admin.role === 'super_admin'
    );

    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Only super admins can remove admins' });
    }

    // Find and remove admin
    const adminIndex = company.admins.findIndex(admin =>
      admin.user.equals(req.params.userId)
    );

    if (adminIndex === -1) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent removing the last super admin
    const adminToRemove = company.admins[adminIndex];
    if (adminToRemove.role === 'super_admin') {
      const superAdmins = company.admins.filter(admin => admin.role === 'super_admin');
      if (superAdmins.length === 1) {
        return res.status(400).json({ message: 'Cannot remove the last super admin' });
      }
    }

    company.admins.splice(adminIndex, 1);
    await company.save();

    // Remove company from user's company pages
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { companyPages: company._id }
    });

    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's companies
router.get('/user/managed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'companyPages',
      populate: {
        path: 'admins.user',
        select: 'name avatar'
      }
    });

    res.json(user.companyPages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company analytics
router.get('/:companyId/analytics', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is admin
    const isAdmin = company.admins.some(admin =>
      admin.user.equals(req.user._id)
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can view analytics' });
    }

    // Get job application stats
    const jobStats = await Job.aggregate([
      { $match: { company: company._id } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalApplications: { $sum: '$applicantCount' }
        }
      }
    ]);

    // Get post engagement stats
    const postStats = await Post.aggregate([
      { $match: { company: company._id } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$engagement.likesCount' },
          totalComments: { $sum: '$engagement.commentsCount' },
          totalShares: { $sum: '$engagement.sharesCount' }
        }
      }
    ]);

    res.json({
      company: {
        followerCount: company.followerCount,
        employeeCount: company.employeeCount,
        profileViews: company.analytics.profileViews,
        searchAppearances: company.analytics.searchAppearances
      },
      jobs: jobStats[0] || { totalJobs: 0, activeJobs: 0, totalApplications: 0 },
      posts: postStats[0] || { totalPosts: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
