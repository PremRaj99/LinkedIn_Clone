import api from './api';

class GroupService {
  // Group management
  async createGroup(groupData) {
    const formData = new FormData();

    // Add group details
    Object.keys(groupData).forEach(key => {
      if (key === 'image' || key === 'coverImage') {
        if (groupData[key]) {
          formData.append(key, groupData[key]);
        }
      } else if (Array.isArray(groupData[key])) {
        formData.append(key, groupData[key].join(','));
      } else {
        formData.append(key, groupData[key]);
      }
    });

    const response = await api.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async updateGroup(groupId, groupData) {
    const formData = new FormData();

    Object.keys(groupData).forEach(key => {
      if (key === 'image' || key === 'coverImage') {
        if (groupData[key]) {
          formData.append(key, groupData[key]);
        }
      } else if (Array.isArray(groupData[key])) {
        formData.append(key, groupData[key].join(','));
      } else {
        formData.append(key, groupData[key]);
      }
    });

    const response = await api.put(`/groups/${groupId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async deleteGroup(groupId) {
    const response = await api.delete(`/groups/${groupId}`);
    return response;
  }

  // Get groups
  async getGroups(page = 1, limit = 20, filters = {}) {
    const response = await api.get('/groups', {
      params: { page, limit, ...filters }
    });
    return response;
  }

  async getGroup(groupId) {
    const response = await api.get(`/groups/${groupId}`);
    return response;
  }

  async getUserGroups() {
    const response = await api.get('/groups/user/my-groups');
    return response;
  }

  // Group membership
  async joinGroup(groupId) {
    const response = await api.post(`/groups/${groupId}/join`);
    return response;
  }

  async leaveGroup(groupId) {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response;
  }

  async inviteToGroup(groupId, userIds, message = '') {
    const response = await api.post(`/groups/${groupId}/invite`, {
      userIds,
      message
    });
    return response;
  }

  async respondToGroupInvite(groupId, action) {
    const response = await api.put(`/groups/${groupId}/invite/${action}`);
    return response;
  }

  // Group members
  async getGroupMembers(groupId, page = 1, limit = 20) {
    const response = await api.get(`/groups/${groupId}/members`, {
      params: { page, limit }
    });
    return response;
  }

  async removeMember(groupId, userId) {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response;
  }

  async updateMemberRole(groupId, userId, role) {
    const response = await api.put(`/groups/${groupId}/members/${userId}`, { role });
    return response;
  }

  // Group posts
  async getGroupPosts(groupId, page = 1, limit = 20) {
    const response = await api.get(`/posts/group/${groupId}`, {
      params: { page, limit }
    });
    return response;
  }

  async createGroupPost(groupId, postData) {
    const formData = new FormData();

    formData.append('content', postData.content);
    formData.append('groupId', groupId);

    if (postData.media && postData.media.length > 0) {
      postData.media.forEach((file) => {
        formData.append('media', file);
      });
    }

    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  // Group events
  async createGroupEvent(groupId, eventData) {
    const response = await api.post(`/groups/${groupId}/events`, eventData);
    return response;
  }

  async getGroupEvents(groupId) {
    const response = await api.get(`/groups/${groupId}/events`);
    return response;
  }

  // Search groups
  async searchGroups(query, filters = {}) {
    const response = await api.get('/groups/search', {
      params: { q: query, ...filters }
    });
    return response;
  }

  async getRecommendedGroups(limit = 10) {
    const response = await api.get('/groups/recommendations', {
      params: { limit }
    });
    return response;
  }
}

export const groupService = new GroupService();
export default groupService;
