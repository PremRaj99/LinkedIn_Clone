const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Global search endpoint
router.get('/global', authMiddleware, async (req, res) => {
  try {
    const {
      q: query,
      type = 'all',
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(query, 'i');
    const results = {};

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { headline: searchRegex },
          { bio: searchRegex },
          { skills: { $in: [searchRegex] } },
          { location: searchRegex },
          { industry: searchRegex }
        ],
        isActive: true
      })
        .select('name avatar headline location industry customUrl')
        .limit(type === 'users' ? limit * page : 10)
        .sort(sortBy === 'recent' ? { createdAt: -1 } : { name: 1 });

      results.users = users;
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { content: searchRegex },
          { hashtags: { $in: [searchRegex] } }
        ],
        isArchived: false,
        visibility: 'public'
      })
        .populate('author', 'name avatar headline')
        .limit(type === 'posts' ? limit * page : 10)
        .sort(sortBy === 'recent' ? { createdAt: -1 } : { engagementScore: -1 });

      results.posts = posts;
    }

    // Search jobs
    if (type === 'all' || type === 'jobs') {
      const jobs = await Job.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { skills: { $in: [searchRegex] } },
          { location: searchRegex },
          { category: searchRegex }
        ],
        isActive: true
      })
        .populate('company', 'name logo')
        .limit(type === 'jobs' ? limit * page : 10)
        .sort(sortBy === 'recent' ? { createdAt: -1 } : { title: 1 });

      results.jobs = jobs;
    }

    // Search companies
    if (type === 'all' || type === 'companies') {
      const companies = await Company.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { industry: searchRegex },
          { specialties: { $in: [searchRegex] } }
        ],
        isActive: true
      })
        .select('name logo description industry website')
        .limit(type === 'companies' ? limit * page : 10)
        .sort(sortBy === 'recent' ? { createdAt: -1 } : { name: 1 });

      results.companies = companies;
    }

    // Search groups
    if (type === 'all' || type === 'groups') {
      const groups = await Group.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { category: searchRegex }
        ],
        isActive: true,
        $or: [
          { isPrivate: false },
          { members: { $elemMatch: { user: req.user._id } } }
        ]
      })
        .select('name image description category memberCount')
        .limit(type === 'groups' ? limit * page : 10)
        .sort(sortBy === 'recent' ? { createdAt: -1 } : { memberCount: -1 });

      results.groups = groups;
    }

    // Add search analytics (for admin/insights)
    const searchLog = {
      query,
      type,
      userId: req.user._id,
      resultsCount: Object.values(results).reduce((total, arr) => total + arr.length, 0),
      timestamp: new Date()
    };

    res.json({
      query,
      type,
      results,
      totalResults: Object.values(results).reduce((total, arr) => total + arr.length, 0),
      page: parseInt(page),
      hasMore: Object.values(results).some(arr => arr.length === (type === 'all' ? 10 : limit))
    });

  } catch (error) {
    res.status(500).json({ message: 'Search error', error: error.message });
  }
});

// Advanced search with filters
router.post('/advanced', authMiddleware, async (req, res) => {
  try {
    const {
      query,
      filters = {},
      type = 'all',
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.body;

    const searchRegex = new RegExp(query, 'i');
    const results = {};

    // Advanced user search
    if (type === 'all' || type === 'users') {
      let userQuery = {
        isActive: true,
        $or: [
          { name: searchRegex },
          { headline: searchRegex },
          { bio: searchRegex },
          { skills: { $in: [searchRegex] } }
        ]
      };

      // Apply filters
      if (filters.location) {
        userQuery.location = new RegExp(filters.location, 'i');
      }
      if (filters.industry) {
        userQuery.industry = filters.industry;
      }
      if (filters.experienceLevel) {
        userQuery['experience.0'] = { $exists: true }; // Has experience
      }
      if (filters.skills && filters.skills.length > 0) {
        userQuery.skills = { $in: filters.skills };
      }

      const users = await User.find(userQuery)
        .select('name avatar headline location industry customUrl experience education')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort(getSortOptions(sortBy, 'user'));

      results.users = users;
    }

    // Advanced job search
    if (type === 'all' || type === 'jobs') {
      let jobQuery = {
        isActive: true,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { skills: { $in: [searchRegex] } }
        ]
      };

      // Apply filters
      if (filters.location) {
        jobQuery.location = new RegExp(filters.location, 'i');
      }
      if (filters.jobType) {
        jobQuery.jobType = filters.jobType;
      }
      if (filters.experienceLevel) {
        jobQuery.experienceLevel = filters.experienceLevel;
      }
      if (filters.salaryRange) {
        if (filters.salaryRange.min) {
          jobQuery['salaryRange.min'] = { $gte: filters.salaryRange.min };
        }
        if (filters.salaryRange.max) {
          jobQuery['salaryRange.max'] = { $lte: filters.salaryRange.max };
        }
      }
      if (filters.isRemote !== undefined) {
        jobQuery.isRemote = filters.isRemote;
      }
      if (filters.company) {
        jobQuery.company = filters.company;
      }

      const jobs = await Job.find(jobQuery)
        .populate('company', 'name logo')
        .populate('postedBy', 'name')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort(getSortOptions(sortBy, 'job'));

      results.jobs = jobs;
    }

    res.json({
      query,
      filters,
      type,
      results,
      page: parseInt(page),
      totalResults: Object.values(results).reduce((total, arr) => total + arr.length, 0)
    });

  } catch (error) {
    res.status(500).json({ message: 'Advanced search error', error: error.message });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { q: query, type = 'all' } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(`^${query}`, 'i');
    const suggestions = [];

    // User suggestions
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        name: searchRegex,
        isActive: true
      })
        .select('name avatar customUrl')
        .limit(5);

      suggestions.push(...users.map(user => ({
        type: 'user',
        id: user._id,
        text: user.name,
        avatar: user.avatar,
        url: `/in/${user.customUrl}`
      })));
    }

    // Company suggestions
    if (type === 'all' || type === 'companies') {
      const companies = await Company.find({
        name: searchRegex,
        isActive: true
      })
        .select('name logo')
        .limit(5);

      suggestions.push(...companies.map(company => ({
        type: 'company',
        id: company._id,
        text: company.name,
        avatar: company.logo,
        url: `/company/${company._id}`
      })));
    }

    // Skill suggestions
    if (type === 'all' || type === 'skills') {
      const skills = await User.aggregate([
        { $unwind: '$skills' },
        { $match: { skills: searchRegex } },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      suggestions.push(...skills.map(skill => ({
        type: 'skill',
        text: skill._id,
        count: skill.count
      })));
    }

    res.json({ suggestions });

  } catch (error) {
    res.status(500).json({ message: 'Suggestions error', error: error.message });
  }
});

// Popular searches
router.get('/popular', async (req, res) => {
  try {
    // This would ideally come from search analytics
    const popularSearches = [
      'Software Engineer',
      'Product Manager',
      'Data Scientist',
      'Marketing Manager',
      'UX Designer',
      'Sales Representative',
      'Business Analyst',
      'Project Manager',
      'DevOps Engineer',
      'Content Creator'
    ];

    res.json({ popularSearches });
  } catch (error) {
    res.status(500).json({ message: 'Popular searches error', error: error.message });
  }
});

// Helper function to get sort options
function getSortOptions(sortBy, entityType) {
  switch (sortBy) {
    case 'recent':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'name':
      return { name: 1 };
    case 'relevance':
    default:
      if (entityType === 'user') {
        return { name: 1 };
      } else if (entityType === 'job') {
        return { createdAt: -1 };
      }
      return { createdAt: -1 };
  }
}

module.exports = router;
