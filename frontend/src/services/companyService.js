import api from './api';

class CompanyService {
  // Company management
  async createCompany(companyData) {
    const formData = new FormData();

    // Add company details
    Object.keys(companyData).forEach(key => {
      if (key === 'logo' || key === 'coverImage') {
        if (companyData[key]) {
          formData.append(key, companyData[key]);
        }
      } else if (typeof companyData[key] === 'object') {
        formData.append(key, JSON.stringify(companyData[key]));
      } else {
        formData.append(key, companyData[key]);
      }
    });

    const response = await api.post('/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async updateCompany(companyId, companyData) {
    const formData = new FormData();

    Object.keys(companyData).forEach(key => {
      if (key === 'logo' || key === 'coverImage') {
        if (companyData[key]) {
          formData.append(key, companyData[key]);
        }
      } else if (typeof companyData[key] === 'object') {
        formData.append(key, JSON.stringify(companyData[key]));
      } else {
        formData.append(key, companyData[key]);
      }
    });

    const response = await api.put(`/companies/${companyId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async deleteCompany(companyId) {
    const response = await api.delete(`/companies/${companyId}`);
    return response;
  }

  // Get companies
  async getCompanies(page = 1, limit = 20, filters = {}) {
    const response = await api.get('/companies', {
      params: { page, limit, ...filters }
    });
    return response;
  }

  async getCompany(companyId) {
    const response = await api.get(`/companies/${companyId}`);
    return response;
  }

  async getUserCompanies() {
    const response = await api.get('/companies/user/my-companies');
    return response;
  }

  // Company following
  async followCompany(companyId) {
    const response = await api.post(`/companies/${companyId}/follow`);
    return response;
  }

  async getFollowedCompanies() {
    const response = await api.get('/companies/user/following');
    return response;
  }

  // Company employees
  async addEmployee(companyId, userId, position) {
    const response = await api.post(`/companies/${companyId}/employees`, {
      userId,
      position
    });
    return response;
  }

  async removeEmployee(companyId, userId) {
    const response = await api.delete(`/companies/${companyId}/employees/${userId}`);
    return response;
  }

  async getCompanyEmployees(companyId, page = 1, limit = 20) {
    const response = await api.get(`/companies/${companyId}/employees`, {
      params: { page, limit }
    });
    return response;
  }

  // Company admins
  async addAdmin(companyId, userId, role) {
    const response = await api.post(`/companies/${companyId}/admins`, {
      userId,
      role
    });
    return response;
  }

  async removeAdmin(companyId, userId) {
    const response = await api.delete(`/companies/${companyId}/admins/${userId}`);
    return response;
  }

  // Company posts
  async getCompanyPosts(companyId, page = 1, limit = 20) {
    const response = await api.get(`/posts/company/${companyId}`, {
      params: { page, limit }
    });
    return response;
  }

  // Company jobs
  async getCompanyJobs(companyId, page = 1, limit = 20) {
    const response = await api.get(`/jobs/company/${companyId}`, {
      params: { page, limit }
    });
    return response;
  }

  // Search companies
  async searchCompanies(query, filters = {}) {
    const response = await api.get('/companies/search', {
      params: { q: query, ...filters }
    });
    return response;
  }

  // Company analytics
  async getCompanyAnalytics(companyId) {
    const response = await api.get(`/companies/${companyId}/analytics`);
    return response;
  }
}

export const companyService = new CompanyService();
export default companyService;
