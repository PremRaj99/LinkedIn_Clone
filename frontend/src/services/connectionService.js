import api from './api';

class ConnectionService {
  // Send connection request
  async sendConnectionRequest(userId, message = '') {
    const response = await api.post(`/users/connect/${userId}`, { message });
    return response;
  }

  // Accept/decline connection request
  async respondToConnectionRequest(userId, action) {
    const response = await api.put(`/users/connect/${userId}/${action}`);
    return response;
  }

  // Get connections
  async getConnections(status = 'accepted', page = 1, limit = 20) {
    const response = await api.get('/users/connections', {
      params: { status, page, limit }
    });
    return response;
  }

  // Remove connection
  async removeConnection(userId) {
    const response = await api.delete(`/users/connections/${userId}`);
    return response;
  }

  // Get mutual connections
  async getMutualConnections(userId) {
    const response = await api.get(`/users/mutual-connections/${userId}`);
    return response;
  }

  // Follow/unfollow user
  async followUser(userId) {
    const response = await api.post(`/users/follow/${userId}`);
    return response;
  }

  // Block/unblock user
  async blockUser(userId) {
    const response = await api.post(`/users/block/${userId}`);
    return response;
  }

  // Get suggested connections
  async getSuggestedConnections(limit = 10) {
    const response = await api.get('/users/suggestions', {
      params: { limit }
    });
    return response;
  }

  // Search users
  async searchUsers(query, filters = {}) {
    const response = await api.get('/users/search', {
      params: { q: query, ...filters }
    });
    return response;
  }
}

export const connectionService = new ConnectionService();
export default connectionService;
