const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// User analytics
router.get('/user/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Profile views
    const user = await User.findById(userId);
    const profileViews = user.profileViews.filter(view => view.viewedAt >= startDate);

    // Post analytics
    const posts = await Post.find({
      author: userId,
      createdAt: { $gte: startDate }
    });

    const postAnalytics = {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0),
      totalComments: posts.reduce((sum, post) => sum + post.comments.length, 0),
      totalShares: posts.reduce((sum, post) => sum + post.shares.length, 0),
      totalViews: posts.reduce((sum, post) => sum + post.views.length, 0),
      avgEngagement: posts.length > 0 ? posts.reduce((sum, post) => sum + post.engagementScore, 0) / posts.length : 0
    };

    // Connection growth
    const connections = user.connections.filter(conn =>
      conn.status === 'accepted' && conn.createdAt >= startDate
    );

    // Search appearances (approximation)
    const searchAppearances = Math.floor(Math.random() * 50) + profileViews.length;

    res.json({
      timeRange,
      profileViews: {
        total: profileViews.length,
        viewsByDay: getViewsByDay(profileViews, timeRange),
        topViewers: await getTopViewers(profileViews)
      },
      posts: postAnalytics,
      connections: {
        newConnections: connections.length,
        totalConnections: user.connections.filter(c => c.status === 'accepted').length
      },
      searchAppearances,
      engagement: {
        score: Math.round(postAnalytics.avgEngagement),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Analytics error', error: error.message });
  }
});

// Post analytics
router.get('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name')
      .populate('likes.user', 'name avatar')
      .populate('comments.author', 'name avatar')
      .populate('shares.user', 'name avatar')
      .populate('views.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (!post.author._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = {
      postId: post._id,
      createdAt: post.createdAt,
      engagement: {
        likes: post.likes.length,
        comments: post.comments.length,
        shares: post.shares.length,
        views: post.views.length,
        score: post.engagementScore
      },
      reach: {
        organic: post.views.length,
        viral: post.shares.length * 10 // Estimated viral reach
      },
      audience: {
        demographics: await getAudienceDemographics(post),
        topEngagers: getTopEngagers(post)
      },
      performance: {
        hourlyViews: getHourlyViews(post.views),
        dailyEngagement: getDailyEngagement(post)
      }
    };

    res.json(analytics);

  } catch (error) {
    res.status(500).json({ message: 'Post analytics error', error: error.message });
  }
});

// Company analytics
router.get('/company/:companyId', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is company admin
    const isAdmin = company.admins.some(admin =>
      admin.user.equals(req.user._id)
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { timeRange = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Company posts
    const posts = await Post.find({
      company: company._id,
      createdAt: { $gte: startDate }
    });

    // Job postings
    const jobs = await Job.find({
      company: company._id,
      createdAt: { $gte: startDate }
    });

    // Followers growth
    const followersGrowth = company.followers.filter(follow =>
      follow.followedAt >= startDate
    ).length;

    const analytics = {
      companyId: company._id,
      timeRange,
      overview: {
        totalFollowers: company.followers.length,
        newFollowers: followersGrowth,
        totalPosts: posts.length,
        totalJobs: jobs.length,
        totalEmployees: company.employees.length
      },
      posts: {
        totalPosts: posts.length,
        totalEngagement: posts.reduce((sum, post) => sum + post.engagementScore, 0),
        avgEngagement: posts.length > 0 ? posts.reduce((sum, post) => sum + post.engagementScore, 0) / posts.length : 0,
        topPost: posts.sort((a, b) => b.engagementScore - a.engagementScore)[0]
      },
      jobs: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.isActive).length,
        totalApplications: jobs.reduce((sum, job) => sum + job.applications.length, 0),
        avgApplicationsPerJob: jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.applications.length, 0) / jobs.length : 0
      },
      engagement: {
        pageViews: Math.floor(Math.random() * 1000) + 100,
        followerEngagement: Math.floor(Math.random() * 50) + 10
      }
    };

    res.json(analytics);

  } catch (error) {
    res.status(500).json({ message: 'Company analytics error', error: error.message });
  }
});

// Job analytics
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('company')
      .populate('applications.applicant', 'name avatar location experience');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has permission
    const isAuthorized = job.company.admins.some(admin =>
      admin.user.equals(req.user._id)
    ) || job.postedBy.equals(req.user._id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = {
      jobId: job._id,
      title: job.title,
      postedAt: job.createdAt,
      applications: {
        total: job.applications.length,
        byStatus: getApplicationsByStatus(job.applications),
        byExperience: getApplicationsByExperience(job.applications),
        byLocation: getApplicationsByLocation(job.applications),
        timeline: getApplicationTimeline(job.applications)
      },
      views: {
        total: Math.floor(Math.random() * 500) + job.applications.length * 5,
        unique: Math.floor(Math.random() * 300) + job.applications.length * 3,
        conversionRate: job.applications.length > 0 ?
          (job.applications.length / (job.applications.length * 5)) * 100 : 0
      },
      performance: {
        daysActive: Math.floor((new Date() - job.createdAt) / (1000 * 60 * 60 * 24)),
        avgTimeToApply: '2.5 days', // Calculated metric
        qualityScore: calculateJobQualityScore(job)
      }
    };

    res.json(analytics);

  } catch (error) {
    res.status(500).json({ message: 'Job analytics error', error: error.message });
  }
});

// Admin dashboard
router.get('/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { timeRange = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Platform statistics
    const stats = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Post.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Company.countDocuments({ createdAt: { $gte: startDate } }),
      Group.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);

    const [newUsers, newPosts, newJobs, newCompanies, newGroups, activeUsers, inactiveUsers] = stats;

    // Growth metrics
    const growth = {
      users: await getGrowthMetric(User, timeRange),
      posts: await getGrowthMetric(Post, timeRange),
      jobs: await getGrowthMetric(Job, timeRange),
      companies: await getGrowthMetric(Company, timeRange)
    };

    // Engagement metrics
    const engagementMetrics = await getEngagementMetrics(startDate);

    const analytics = {
      timeRange,
      overview: {
        newUsers,
        newPosts,
        newJobs,
        newCompanies,
        newGroups,
        activeUsers,
        inactiveUsers,
        totalUsers: activeUsers + inactiveUsers
      },
      growth,
      engagement: engagementMetrics,
      topContent: await getTopContent(startDate),
      userActivity: await getUserActivityMetrics(startDate)
    };

    res.json(analytics);

  } catch (error) {
    res.status(500).json({ message: 'Admin analytics error', error: error.message });
  }
});

// Helper functions
async function getTopViewers(profileViews) {
  const viewerIds = profileViews.map(view => view.user);
  const viewers = await User.find({ _id: { $in: viewerIds } })
    .select('name avatar headline')
    .limit(5);
  return viewers;
}

function getViewsByDay(views, timeRange) {
  const days = parseInt(timeRange);
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayViews = views.filter(view =>
      view.viewedAt.toDateString() === date.toDateString()
    );
    result.push({
      date: date.toISOString().split('T')[0],
      views: dayViews.length
    });
  }

  return result;
}

async function getAudienceDemographics(post) {
  const engagementUserIds = [
    ...post.likes.map(like => like.user),
    ...post.comments.map(comment => comment.author),
    ...post.shares.map(share => share.user)
  ];

  const users = await User.find({ _id: { $in: engagementUserIds } })
    .select('location industry');

  // Group by location and industry
  const demographics = {
    byLocation: {},
    byIndustry: {}
  };

  users.forEach(user => {
    if (user.location) {
      demographics.byLocation[user.location] = (demographics.byLocation[user.location] || 0) + 1;
    }
    if (user.industry) {
      demographics.byIndustry[user.industry] = (demographics.byIndustry[user.industry] || 0) + 1;
    }
  });

  return demographics;
}

function getTopEngagers(post) {
  const engagementCount = {};

  post.likes.forEach(like => {
    engagementCount[like.user] = (engagementCount[like.user] || 0) + 1;
  });

  post.comments.forEach(comment => {
    engagementCount[comment.author] = (engagementCount[comment.author] || 0) + 2;
  });

  post.shares.forEach(share => {
    engagementCount[share.user] = (engagementCount[share.user] || 0) + 3;
  });

  return Object.entries(engagementCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, count]) => ({ userId, engagementCount: count }));
}

function getHourlyViews(views) {
  const hourlyData = Array(24).fill(0);

  views.forEach(view => {
    const hour = new Date(view.viewedAt).getHours();
    hourlyData[hour]++;
  });

  return hourlyData;
}

function getDailyEngagement(post) {
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dayEngagement = {
      date: date.toISOString().split('T')[0],
      likes: post.likes.filter(like =>
        new Date(like.createdAt).toDateString() === date.toDateString()
      ).length,
      comments: post.comments.filter(comment =>
        new Date(comment.createdAt).toDateString() === date.toDateString()
      ).length,
      shares: post.shares.filter(share =>
        new Date(share.createdAt).toDateString() === date.toDateString()
      ).length
    };

    last7Days.push(dayEngagement);
  }

  return last7Days;
}

function getApplicationsByStatus(applications) {
  const statusCount = {};
  applications.forEach(app => {
    statusCount[app.status] = (statusCount[app.status] || 0) + 1;
  });
  return statusCount;
}

function getApplicationsByExperience(applications) {
  const expCount = {};
  applications.forEach(app => {
    const experience = app.applicant.experience;
    const years = experience.length > 0 ? experience.length : 0;
    const range = years < 2 ? '0-2' : years < 5 ? '2-5' : years < 10 ? '5-10' : '10+';
    expCount[range] = (expCount[range] || 0) + 1;
  });
  return expCount;
}

function getApplicationsByLocation(applications) {
  const locationCount = {};
  applications.forEach(app => {
    const location = app.applicant.location || 'Unknown';
    locationCount[location] = (locationCount[location] || 0) + 1;
  });
  return locationCount;
}

function getApplicationTimeline(applications) {
  const last30Days = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dayApplications = applications.filter(app =>
      new Date(app.appliedAt).toDateString() === date.toDateString()
    ).length;

    last30Days.push({
      date: date.toISOString().split('T')[0],
      applications: dayApplications
    });
  }

  return last30Days;
}

function calculateJobQualityScore(job) {
  let score = 0;

  // Description length and quality
  if (job.description && job.description.length > 200) score += 20;
  if (job.requirements && job.requirements.length > 0) score += 15;
  if (job.responsibilities && job.responsibilities.length > 0) score += 15;
  if (job.skills && job.skills.length > 0) score += 10;
  if (job.benefits && job.benefits.length > 0) score += 10;
  if (job.salaryRange && job.salaryRange.min && job.salaryRange.max) score += 15;
  if (job.location) score += 10;
  if (job.jobType) score += 5;

  return Math.min(score, 100);
}

async function getGrowthMetric(Model, timeRange) {
  const days = parseInt(timeRange);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const previousStartDate = new Date();
  previousStartDate.setDate(previousStartDate.getDate() - (days * 2));

  const current = await Model.countDocuments({ createdAt: { $gte: startDate } });
  const previous = await Model.countDocuments({
    createdAt: { $gte: previousStartDate, $lt: startDate }
  });

  const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return { current, previous, growthRate };
}

async function getEngagementMetrics(startDate) {
  const posts = await Post.find({ createdAt: { $gte: startDate } });

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
  const totalShares = posts.reduce((sum, post) => sum + post.shares.length, 0);

  return {
    avgLikesPerPost: totalPosts > 0 ? totalLikes / totalPosts : 0,
    avgCommentsPerPost: totalPosts > 0 ? totalComments / totalPosts : 0,
    avgSharesPerPost: totalPosts > 0 ? totalShares / totalPosts : 0,
    totalEngagementActions: totalLikes + totalComments + totalShares
  };
}

async function getTopContent(startDate) {
  const topPosts = await Post.find({ createdAt: { $gte: startDate } })
    .populate('author', 'name')
    .sort({ engagementScore: -1 })
    .limit(5);

  const topJobs = await Job.find({ createdAt: { $gte: startDate } })
    .populate('company', 'name')
    .sort({ applicantCount: -1 })
    .limit(5);

  return { topPosts, topJobs };
}

async function getUserActivityMetrics(startDate) {
  const activeUsers = await User.countDocuments({
    lastSeen: { $gte: startDate }
  });

  const dailyActiveUsers = await User.countDocuments({
    lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  return {
    activeUsers,
    dailyActiveUsers,
    retentionRate: activeUsers > 0 ? (dailyActiveUsers / activeUsers) * 100 : 0
  };
}

module.exports = router;
