import api from './api';

class AuthService {
  // Authentication
  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response;
  }

  async login(credentials) {
    const response = await api.post('/users/login', credentials);
    return response;
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async forgotPassword(email) {
    const response = await api.post('/users/forgot-password', { email });
    return response;
  }

  async resetPassword(token, password) {
    const response = await api.post('/users/reset-password', { token, password });
    return response;
  }

  async verifyEmail(token) {
    const response = await api.post('/users/verify-email', { token });
    return response;
  }

  // Profile Management
  async getProfile(userId = 'me') {
    const endpoint = userId === 'me' ? '/users/profile' : `/users/profile/${userId}`;
    const response = await api.get(endpoint);
    return response;
  }

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response;
  }

  async updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async updateBanner(file) {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await api.put('/users/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  // Experience Management
  async addExperience(experienceData) {
    const response = await api.post('/users/experience', experienceData);
    return response;
  }

  async updateExperience(experienceId, experienceData) {
    const response = await api.put(`/users/experience/${experienceId}`, experienceData);
    return response;
  }

  async deleteExperience(experienceId) {
    const response = await api.delete(`/users/experience/${experienceId}`);
    return response;
  }

  // Education Management
  async addEducation(educationData) {
    const response = await api.post('/users/education', educationData);
    return response;
  }

  async updateEducation(educationId, educationData) {
    const response = await api.put(`/users/education/${educationId}`, educationData);
    return response;
  }

  async deleteEducation(educationId) {
    const response = await api.delete(`/users/education/${educationId}`);
    return response;
  }

  // Certifications Management
  async addCertification(certificationData) {
    const response = await api.post('/users/certifications', certificationData);
    return response;
  }

  async updateCertification(certificationId, certificationData) {
    const response = await api.put(`/users/certifications/${certificationId}`, certificationData);
    return response;
  }

  async deleteCertification(certificationId) {
    const response = await api.delete(`/users/certifications/${certificationId}`);
    return response;
  }

  // Privacy Settings
  async updatePrivacySettings(privacyData) {
    const response = await api.put('/users/privacy', privacyData);
    return response;
  }

  async updateNotificationSettings(notificationData) {
    const response = await api.put('/notifications/preferences', notificationData);
    return response;
  }

  // Search and Discovery
  async searchUsers(query, filters = {}) {
    const response = await api.get('/users/search', {
      params: { q: query, ...filters }
    });
    return response;
  }

  async getSuggestedConnections(limit = 10) {
    const response = await api.get('/users/suggestions', {
      params: { limit }
    });
    return response;
  }

  async getProfileViews() {
    const response = await api.get('/users/profile-views');
    return response;
  }

  // Utils
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();

// Legacy exports for backward compatibility
export const registerUser = (name, email, password) =>
  authService.register({ name, email, password });

export const loginUser = (email, password) =>
  authService.login({ email, password });

export const getUserProfile = (userId) =>
  authService.getProfile(userId);

export const updateAvatar = (file) =>
  authService.updateAvatar(file);

export default authService;
