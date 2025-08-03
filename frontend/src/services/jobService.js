import api from './api';

class JobService {
  // Job posting management
  async createJob(jobData) {
    const response = await api.post('/jobs', jobData);
    return response;
  }

  async updateJob(jobId, jobData) {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response;
  }

  async deleteJob(jobId) {
    const response = await api.delete(`/jobs/${jobId}`);
    return response;
  }

  // Get jobs
  async getJobs(page = 1, limit = 20, filters = {}) {
    const response = await api.get('/jobs', {
      params: { page, limit, ...filters }
    });
    return response;
  }

  async getJob(jobId) {
    const response = await api.get(`/jobs/${jobId}`);
    return response;
  }

  async getJobsByCompany(companyId, page = 1, limit = 10) {
    const response = await api.get(`/jobs/company/${companyId}`, {
      params: { page, limit }
    });
    return response;
  }

  // Job applications
  async applyToJob(jobId, applicationData) {
    const formData = new FormData();

    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter);
    }

    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }

    const response = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async updateApplicationStatus(jobId, applicationId, status, notes) {
    const response = await api.put(`/jobs/${jobId}/applications/${applicationId}`, {
      status,
      notes
    });
    return response;
  }

  // User job interactions
  async getUserApplications() {
    const response = await api.get('/jobs/user/applications');
    return response;
  }

  async saveJob(jobId) {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response;
  }

  async getSavedJobs() {
    const response = await api.get('/jobs/user/saved');
    return response;
  }

  // Job search
  async searchJobs(query, filters = {}) {
    const response = await api.get('/jobs/search', {
      params: { q: query, ...filters }
    });
    return response;
  }

  async getJobRecommendations(limit = 10) {
    const response = await api.get('/jobs/recommendations', {
      params: { limit }
    });
    return response;
  }

  // Job alerts
  async createJobAlert(alertData) {
    const response = await api.post('/jobs/alerts', alertData);
    return response;
  }

  async getJobAlerts() {
    const response = await api.get('/jobs/alerts');
    return response;
  }

  async updateJobAlert(alertId, alertData) {
    const response = await api.put(`/jobs/alerts/${alertId}`, alertData);
    return response;
  }

  async deleteJobAlert(alertId) {
    const response = await api.delete(`/jobs/alerts/${alertId}`);
    return response;
  }
}

export const jobService = new JobService();
export default jobService;
