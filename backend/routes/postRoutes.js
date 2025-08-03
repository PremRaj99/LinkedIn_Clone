const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Create post
router.post('/', authMiddleware, upload.array('media', 5), async (req, res) => {
  try {
    const {
      content,
      postType = 'text',
      visibility = 'public',
      poll,
      linkPreview,
      hashtags,
      mentions,
      taggedUsers,
      groupId,
      companyId,
      originalPost,
      repostContent
    } = req.body;

    if (!content && (!req.files || req.files.length === 0) && !poll) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    // Process media files
    const media = req.files ? req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' :
        file.mimetype.startsWith('video/') ? 'video' : 'document',
      url: file.path,
      fileName: file.originalname,
      fileSize: file.size,
      thumbnail: file.mimetype.startsWith('video/') ? file.path : null
    })) : [];

    // Extract hashtags from content
    const hashtagsFromContent = content ?
      content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [] : [];

    // Extract mentions from content  
    const mentionsFromContent = content ?
      content.match(/@[a-zA-Z0-9_]+/g)?.map(mention => mention.slice(1)) || [] : [];

    const post = new Post({
      author: req.user._id,
      content: content || '',
      postType,
      media,
      poll: poll ? JSON.parse(poll) : null,
      linkPreview: linkPreview ? JSON.parse(linkPreview) : null,
      hashtags: [...hashtagsFromContent, ...(hashtags ? hashtags.split(',').map(tag => tag.trim()) : [])],
      mentions: mentions ? mentions.split(',') : [],
      taggedUsers: taggedUsers ? taggedUsers.split(',') : [],
      visibility,
      group: groupId || null,
      company: companyId || null,
      originalPost: originalPost || null,
      repostContent: repostContent || ''
    });

    // Resolve mentions to user IDs
    if (mentionsFromContent.length > 0) {
      const mentionedUsers = await User.find({
        $or: [
          { customUrl: { $in: mentionsFromContent } },
          { name: { $in: mentionsFromContent } }
        ]
      });
      post.mentions = mentionedUsers.map(user => user._id);
    }

    await post.save();
    await post.populate([
      { path: 'author', select: 'name email avatar headline customUrl' },
      { path: 'mentions', select: 'name customUrl' },
      { path: 'taggedUsers', select: 'name customUrl' },
      { path: 'group', select: 'name' },
      { path: 'company', select: 'name logo' },
      { path: 'originalPost', populate: { path: 'author', select: 'name avatar' } }
    ]);

    // Create notifications for mentions and tagged users
    const notificationRecipients = [
      ...post.mentions,
      ...post.taggedUsers
    ].filter(userId => !userId.equals(req.user._id));

    const notifications = notificationRecipients.map(userId => ({
      recipient: userId,
      sender: req.user._id,
      type: post.mentions.includes(userId) ? 'mention' : 'tag',
      title: post.mentions.includes(userId) ? 'You were mentioned' : 'You were tagged',
      message: `${req.user.name} ${post.mentions.includes(userId) ? 'mentioned' : 'tagged'} you in a post`,
      relatedPost: post._id,
      relatedUser: req.user._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Update engagement count
    post.updateEngagement();
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      visibility = 'public',
      postType,
      hashtag,
      author
    } = req.query;

    const query = {
      isArchived: false,
      visibility: { $in: visibility.split(',') }
    };

    if (postType) {
      query.postType = postType;
    }

    if (hashtag) {
      query.hashtags = { $in: [hashtag] };
    }

    if (author) {
      query.author = author;
    }

    // If user is authenticated, show posts they can see based on connections
    if (req.user) {
      const user = await User.findById(req.user._id);
      const connectionIds = user.connections
        .filter(conn => conn.status === 'accepted')
        .map(conn => conn.user);

      query.$or = [
        { visibility: 'public' },
        { author: req.user._id },
        {
          visibility: 'connections',
          author: { $in: connectionIds }
        }
      ];
    } else {
      query.visibility = 'public';
    }

    const posts = await Post.find(query)
      .populate('author', 'name email avatar headline customUrl')
      .populate('mentions', 'name customUrl')
      .populate('taggedUsers', 'name customUrl')
      .populate('group', 'name image')
      .populate('company', 'name logo')
      .populate('originalPost', 'content author createdAt')
      .populate('likes.user', 'name')
      .populate('comments.author', 'name avatar')
      .populate('shares.user', 'name')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out posts with missing or invalid author data
    const validPosts = posts.filter(post => post && post.author && post.author._id);

    const total = await Post.countDocuments(query);

    res.json({
      posts: validPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({
      author: req.params.userId,
      isArchived: false
    })
      .populate('author', 'name email avatar headline customUrl')
      .populate('mentions', 'name customUrl')
      .populate('taggedUsers', 'name customUrl')
      .populate('group', 'name')
      .populate('company', 'name logo')
      .populate('originalPost', 'content author')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out posts with missing or invalid author data
    const validPosts = posts.filter(post => post && post.author && post.author._id);

    const total = await Post.countDocuments({
      author: req.params.userId,
      isArchived: false
    });

    res.json({
      posts: validPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name email avatar headline customUrl')
      .populate('mentions', 'name customUrl')
      .populate('taggedUsers', 'name customUrl')
      .populate('group', 'name image')
      .populate('company', 'name logo')
      .populate('originalPost')
      .populate('likes.user', 'name avatar')
      .populate('comments.author', 'name avatar')
      .populate('comments.replies.author', 'name avatar')
      .populate('shares.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add view if user is authenticated and different from author
    if (req.user && !req.user._id.equals(post.author._id)) {
      const existingView = post.views.find(view =>
        view.user.equals(req.user._id)
      );

      if (!existingView) {
        post.views.push({ user: req.user._id });
        post.updateEngagement();
        await post.save();
      }
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/react to post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const { reactionType = 'like' } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(like =>
      like.user.equals(req.user._id)
    );

    if (existingLike) {
      if (existingLike.reactionType === reactionType) {
        // Remove like
        post.likes.pull(existingLike._id);
      } else {
        // Update reaction type
        existingLike.reactionType = reactionType;
      }
    } else {
      // Add new like
      post.likes.push({
        user: req.user._id,
        reactionType
      });

      // Create notification for post author
      if (!post.author.equals(req.user._id)) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          title: 'Post Reaction',
          message: `${req.user.name} reacted to your post`,
          relatedPost: post._id,
          relatedUser: req.user._id
        });
        await notification.save();
      }
    }

    post.updateEngagement();
    await post.save();

    res.json({
      message: 'Post reaction updated successfully',
      likesCount: post.likes.length,
      userReaction: existingLike?.reactionType || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment
router.post('/:postId/comment', authMiddleware, async (req, res) => {
  try {
    const { content, replyTo } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Extract mentions from comment
    const mentions = content.match(/@[a-zA-Z0-9_]+/g)?.map(mention => mention.slice(1)) || [];
    const mentionedUsers = await User.find({
      $or: [
        { customUrl: { $in: mentions } },
        { name: { $in: mentions } }
      ]
    });

    const comment = {
      author: req.user._id,
      content,
      mentions: mentionedUsers.map(user => user._id)
    };

    if (replyTo) {
      // Find parent comment and add reply
      const parentComment = post.comments.id(replyTo);
      if (parentComment) {
        parentComment.replies.push({
          author: req.user._id,
          content
        });
      } else {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    } else {
      post.comments.push(comment);
    }

    post.updateEngagement();
    await post.save();

    await post.populate('comments.author', 'name avatar');

    // Create notifications
    const notifications = [];

    // Notify post author
    if (!post.author.equals(req.user._id)) {
      notifications.push({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.name} commented on your post`,
        relatedPost: post._id,
        relatedUser: req.user._id
      });
    }

    // Notify mentioned users
    mentionedUsers.forEach(user => {
      if (!user._id.equals(req.user._id)) {
        notifications.push({
          recipient: user._id,
          sender: req.user._id,
          type: 'mention',
          title: 'Mentioned in Comment',
          message: `${req.user.name} mentioned you in a comment`,
          relatedPost: post._id,
          relatedUser: req.user._id
        });
      }
    });

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like comment
router.post('/:postId/comment/:commentId/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(like =>
      like.user.equals(req.user._id)
    );

    if (existingLike) {
      comment.likes.pull(existingLike._id);
    } else {
      comment.likes.push({ user: req.user._id });

      // Create notification
      if (!comment.author.equals(req.user._id)) {
        const notification = new Notification({
          recipient: comment.author,
          sender: req.user._id,
          type: 'like',
          title: 'Comment Liked',
          message: `${req.user.name} liked your comment`,
          relatedPost: post._id,
          relatedUser: req.user._id
        });
        await notification.save();
      }
    }

    await post.save();

    res.json({
      message: 'Comment like updated successfully',
      likesCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Share/repost
router.post('/:postId/share', authMiddleware, async (req, res) => {
  try {
    const { shareType = 'repost', content = '' } = req.body;
    const originalPost = await Post.findById(req.params.postId);

    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (shareType === 'repost') {
      // Create new post as repost
      const repost = new Post({
        author: req.user._id,
        content: content,
        postType: 'repost',
        originalPost: originalPost._id,
        repostContent: content,
        visibility: 'public'
      });

      await repost.save();
      await repost.populate([
        { path: 'author', select: 'name avatar headline' },
        { path: 'originalPost', populate: { path: 'author', select: 'name avatar' } }
      ]);

      // Add to original post shares
      originalPost.shares.push({
        user: req.user._id,
        shareType: 'repost'
      });
    } else {
      // Just track the share
      originalPost.shares.push({
        user: req.user._id,
        shareType
      });
    }

    originalPost.updateEngagement();
    await originalPost.save();

    // Create notification for original author
    if (!originalPost.author.equals(req.user._id)) {
      const notification = new Notification({
        recipient: originalPost.author,
        sender: req.user._id,
        type: 'share',
        title: 'Post Shared',
        message: `${req.user.name} shared your post`,
        relatedPost: originalPost._id,
        relatedUser: req.user._id
      });
      await notification.save();
    }

    res.json({
      message: 'Post shared successfully',
      repost: shareType === 'repost' ? repost : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on poll
router.post('/:postId/poll/vote', authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.poll) {
      return res.status(400).json({ message: 'This post does not have a poll' });
    }

    if (post.poll.expiresAt && new Date() > post.poll.expiresAt) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    if (optionIndex >= post.poll.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    // Check if user already voted
    const hasVoted = post.poll.options.some(option =>
      option.votes.some(vote => vote.user.equals(req.user._id))
    );

    if (hasVoted && !post.poll.allowMultiple) {
      // Remove previous vote
      post.poll.options.forEach(option => {
        option.votes = option.votes.filter(vote => !vote.user.equals(req.user._id));
      });
    }

    // Add new vote
    post.poll.options[optionIndex].votes.push({
      user: req.user._id
    });

    await post.save();

    res.json({
      message: 'Vote recorded successfully',
      poll: post.poll
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update post
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const { content, visibility, hashtags } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    if (content !== undefined) post.content = content;
    if (visibility !== undefined) post.visibility = visibility;
    if (hashtags !== undefined) {
      post.hashtags = hashtags.split(',').map(tag => tag.trim());
    }

    // Re-extract hashtags from content if content was updated
    if (content) {
      const hashtagsFromContent = content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [];
      post.hashtags = [...new Set([...post.hashtags, ...hashtagsFromContent])];
    }

    await post.save();

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isArchived = true;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pin/unpin post
router.post('/:postId/pin', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to pin this post' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      message: post.isPinned ? 'Post pinned successfully' : 'Post unpinned successfully',
      isPinned: post.isPinned
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report post
router.post('/:postId/report', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.reportReasons.includes(reason)) {
      post.reportReasons.push(reason);
    }

    if (!post.isReported) {
      post.isReported = true;
    }

    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trending hashtags
router.get('/hashtags/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingHashtags = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          isArchived: false
        }
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          posts: { $addToSet: '$_id' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          hashtag: '$_id',
          count: 1,
          postCount: { $size: '$posts' }
        }
      }
    ]);

    res.json(trendingHashtags);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      hashtag,
      author,
      postType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const searchQuery = { isArchived: false };

    if (query) {
      searchQuery.$or = [
        { content: { $regex: query, $options: 'i' } },
        { hashtags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    if (hashtag) {
      searchQuery.hashtags = { $in: [hashtag] };
    }

    if (author) {
      searchQuery.author = author;
    }

    if (postType) {
      searchQuery.postType = postType;
    }

    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
    }

    const posts = await Post.find(searchQuery)
      .populate('author', 'name avatar headline')
      .populate('group', 'name')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(searchQuery);

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

module.exports = router;
