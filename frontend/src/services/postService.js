import api from './api';

class PostService {
  // Create and manage posts
  async createPost(postData) {
    const formData = new FormData();

    // Add text content
    if (postData.content) formData.append('content', postData.content);
    if (postData.postType) formData.append('postType', postData.postType);
    if (postData.visibility) formData.append('visibility', postData.visibility);
    if (postData.hashtags) formData.append('hashtags', postData.hashtags);
    if (postData.mentions) formData.append('mentions', postData.mentions);
    if (postData.taggedUsers) formData.append('taggedUsers', postData.taggedUsers);
    if (postData.groupId) formData.append('groupId', postData.groupId);
    if (postData.companyId) formData.append('companyId', postData.companyId);

    // Add media files
    if (postData.media && postData.media.length > 0) {
      postData.media.forEach((file) => {
        formData.append('media', file);
      });
    }

    // Add poll data
    if (postData.poll) {
      formData.append('poll', JSON.stringify(postData.poll));
    }

    // Add link preview
    if (postData.linkPreview) {
      formData.append('linkPreview', JSON.stringify(postData.linkPreview));
    }

    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async createPostWithFiles(formData) {
    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updatePost(postId, postData) {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  }

  async deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  }

  // Get posts
  async getFeedPosts(page = 1, limit = 20, filters = {}) {
    const response = await api.get('/posts', {
      params: { page, limit, ...filters }
    });
    return response.data;
  }

  async getPost(postId) {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  }

  async getUserPosts(userId, page = 1, limit = 20) {
    const response = await api.get(`/posts/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getGroupPosts(groupId, page = 1, limit = 20) {
    const response = await api.get(`/posts/group/${groupId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getCompanyPosts(companyId, page = 1, limit = 20) {
    const response = await api.get(`/posts/company/${companyId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  // Interactions
  async likePost(postId, reactionType = 'like') {
    const response = await api.post(`/posts/${postId}/like`, { reactionType });
    return response.data;
  }

  async commentOnPost(postId, content, replyTo = null) {
    const response = await api.post(`/posts/${postId}/comment`, {
      content,
      replyTo
    });
    return response.data;
  }

  async likeComment(postId, commentId) {
    const response = await api.post(`/posts/${postId}/comment/${commentId}/like`);
    return response.data;
  }

  async sharePost(postId, shareType = 'share', repostContent = '') {
    const response = await api.post(`/posts/${postId}/share`, {
      shareType,
      repostContent
    });
    return response.data;
  }

  async savePost(postId) {
    const response = await api.post(`/users/save-post/${postId}`);
    return response.data;
  }

  async getSavedPosts(page = 1, limit = 20) {
    const response = await api.get('/users/saved-posts', {
      params: { page, limit }
    });
    return response.data;
  }

  // Poll interactions
  async voteOnPoll(postId, optionIndex) {
    const response = await api.post(`/posts/${postId}/poll/vote`, {
      optionIndex
    });
    return response.data;
  }

  // Post management
  async pinPost(postId) {
    const response = await api.post(`/posts/${postId}/pin`);
    return response.data;
  }

  async reportPost(postId, reason) {
    const response = await api.post(`/posts/${postId}/report`, { reason });
    return response.data;
  }

  // Search and hashtags
  async searchPosts(query, filters = {}) {
    const response = await api.get('/posts/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  }

  async getTrendingHashtags(limit = 10) {
    const response = await api.get('/posts/hashtags/trending', {
      params: { limit }
    });
    return response.data;
  }

  async getPostsByHashtag(hashtag, page = 1, limit = 20) {
    const response = await api.get('/posts', {
      params: { hashtag, page, limit }
    });
    return response.data;
  }
}

export const postService = new PostService();

// Legacy exports for backward compatibility
export const createPost = (content, image) => {
  const postData = { content };
  if (image) postData.media = [image];
  return postService.createPost(postData);
};

export const getAllPosts = (page = 1, limit = 20) => {
  return postService.getFeedPosts(page, limit);
};

export const getUserPosts = (userId, page = 1, limit = 20) => {
  return postService.getUserPosts(userId, page, limit);
};

export const likePost = (postId) => {
  return postService.likePost(postId);
};

export const addComment = (postId, content) => {
  return postService.commentOnPost(postId, content);
};

export const getSavedPosts = (page = 1, limit = 20) => {
  return postService.getSavedPosts(page, limit);
};

export const toggleSavePost = (postId) => {
  return postService.savePost(postId);
};

export default postService;
