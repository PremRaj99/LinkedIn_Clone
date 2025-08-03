import api from './api';

class NotificationService {
  // Get notifications
  async getNotifications(page = 1, limit = 20, filters = {}) {
    const response = await api.get('/notifications', {
      params: { page, limit, ...filters }
    });
    return response;
  }

  async getNotificationStats() {
    const response = await api.get('/notifications/stats');
    return response;
  }

  // Mark notifications as read
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response;
  }

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response;
  }

  // Delete notifications
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  }

  // Update notification preferences
  async updatePreferences(preferences) {
    const response = await api.put('/notifications/preferences', preferences);
    return response;
  }

  async getPreferences() {
    const response = await api.get('/notifications/preferences');
    return response;
  }

  // Create notification (for admin/system use)
  async createNotification(notificationData) {
    const response = await api.post('/notifications/create', notificationData);
    return response;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
