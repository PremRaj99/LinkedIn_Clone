import api from './api';

class AdminService {
  // Dashboard
  async getDashboard(timeRange = '30') {
    try {
      const response = await api.get(`/admin/dashboard?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      throw error;
    }
  }

  // User management
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async updateUserStatus(userId, statusData) {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Content management
  async getPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/posts?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  }

  async moderatePost(postId, moderationData) {
    try {
      const response = await api.patch(`/admin/posts/${postId}/moderate`, moderationData);
      return response.data;
    } catch (error) {
      console.error('Moderate post error:', error);
      throw error;
    }
  }

  // Reports management
  async getReports(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/reports?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  }

  // Job management
  async getJobs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/jobs?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get jobs error:', error);
      throw error;
    }
  }

  // Company management
  async getCompanies(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/companies?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  }

  async verifyCompany(companyId, verificationData) {
    try {
      const response = await api.patch(`/admin/companies/${companyId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Verify company error:', error);
      throw error;
    }
  }

  // System settings
  async getSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Get settings error:', error);
      throw error;
    }
  }

  async updateSettings(category, settings) {
    try {
      const response = await api.patch('/admin/settings', { category, settings });
      return response.data;
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  }

  // Bulk actions
  async performBulkAction(action, type, ids, data = {}) {
    try {
      const response = await api.post('/admin/bulk-actions', {
        action,
        type,
        ids,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Bulk action error:', error);
      throw error;
    }
  }

  // Utility methods
  getUserStatusBadge(user) {
    if (user.isSuspended) {
      return { color: 'red', text: 'Suspended' };
    }
    if (!user.isActive) {
      return { color: 'gray', text: 'Inactive' };
    }
    if (user.isVerified) {
      return { color: 'green', text: 'Verified' };
    }
    return { color: 'blue', text: 'Active' };
  }

  getPostStatusBadge(post) {
    if (post.isDeleted) {
      return { color: 'red', text: 'Deleted' };
    }
    if (post.isHidden) {
      return { color: 'orange', text: 'Hidden' };
    }
    if (post.isFlagged) {
      return { color: 'yellow', text: 'Flagged' };
    }
    if (post.reports && post.reports.length > 0) {
      return { color: 'purple', text: 'Reported' };
    }
    return { color: 'green', text: 'Active' };
  }

  getCompanyStatusBadge(company) {
    if (!company.isActive) {
      return { color: 'gray', text: 'Inactive' };
    }
    if (company.isVerified) {
      return { color: 'green', text: 'Verified' };
    }
    return { color: 'blue', text: 'Pending' };
  }

  formatUserData(users) {
    return users.map(user => ({
      ...user,
      displayName: user.name || 'Unknown User',
      joinDate: new Date(user.createdAt).toLocaleDateString(),
      lastActive: user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never',
      connectionCount: user.connections ? user.connections.filter(c => c.status === 'accepted').length : 0,
      postCount: user.postCount || 0,
      status: this.getUserStatusBadge(user)
    }));
  }

  formatPostData(posts) {
    return posts.map(post => ({
      ...post,
      authorName: post.author?.name || 'Unknown Author',
      publishDate: new Date(post.createdAt).toLocaleDateString(),
      engagementCount: (post.likes?.length || 0) + (post.comments?.length || 0) + (post.shares?.length || 0),
      viewCount: post.views?.length || 0,
      status: this.getPostStatusBadge(post),
      excerpt: this.truncateText(post.content, 100)
    }));
  }

  formatCompanyData(companies) {
    return companies.map(company => ({
      ...company,
      foundedYear: company.foundedYear || 'N/A',
      employeeCount: company.employees?.length || 0,
      followerCount: company.followers?.length || 0,
      jobCount: company.jobCount || 0,
      status: this.getCompanyStatusBadge(company)
    }));
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  generateReportSummary(reports) {
    const summary = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length,
      byType: {}
    };

    reports.forEach(report => {
      summary.byType[report.type] = (summary.byType[report.type] || 0) + 1;
    });

    return summary;
  }

  calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  formatGrowthRate(rate) {
    const formattedRate = Math.abs(rate).toFixed(1);
    const sign = rate >= 0 ? '+' : '-';
    return `${sign}${formattedRate}%`;
  }

  getGrowthTrend(rate) {
    if (rate > 0) return { trend: 'up', color: 'green' };
    if (rate < 0) return { trend: 'down', color: 'red' };
    return { trend: 'neutral', color: 'gray' };
  }

  generateQuickActions() {
    return [
      {
        id: 'suspend-users',
        title: 'Suspend Users',
        description: 'Suspend multiple users at once',
        icon: 'UserMinus',
        type: 'destructive'
      },
      {
        id: 'verify-companies',
        title: 'Verify Companies',
        description: 'Bulk verify company accounts',
        icon: 'Shield',
        type: 'primary'
      },
      {
        id: 'moderate-posts',
        title: 'Moderate Posts',
        description: 'Review and moderate reported posts',
        icon: 'Flag',
        type: 'warning'
      },
      {
        id: 'export-data',
        title: 'Export Data',
        description: 'Download platform analytics',
        icon: 'Download',
        type: 'secondary'
      }
    ];
  }

  generateActivityFeed(recentActivity) {
    const activities = [];

    // Recent users
    if (recentActivity.users) {
      recentActivity.users.forEach(user => {
        activities.push({
          id: `user-${user._id}`,
          type: 'user',
          title: 'New User Registration',
          description: `${user.name} joined the platform`,
          timestamp: user.createdAt,
          avatar: user.avatar,
          severity: 'info'
        });
      });
    }

    // Recent posts
    if (recentActivity.posts) {
      recentActivity.posts.forEach(post => {
        activities.push({
          id: `post-${post._id}`,
          type: 'post',
          title: 'New Post Created',
          description: `${post.author?.name} shared a post`,
          timestamp: post.createdAt,
          severity: 'info'
        });
      });
    }

    // Recent jobs
    if (recentActivity.jobs) {
      recentActivity.jobs.forEach(job => {
        activities.push({
          id: `job-${job._id}`,
          type: 'job',
          title: 'New Job Posted',
          description: `${job.company?.name} posted ${job.title}`,
          timestamp: job.createdAt,
          severity: 'info'
        });
      });
    }

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  exportUserData(users, filename = 'users') {
    const csvData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      'Join Date': new Date(user.createdAt).toLocaleDateString(),
      Status: user.isActive ? 'Active' : 'Inactive',
      Verified: user.isVerified ? 'Yes' : 'No',
      Connections: user.connections?.filter(c => c.status === 'accepted').length || 0,
      'Last Seen': user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never'
    }));

    this.downloadCSV(csvData, filename);
  }

  exportPostData(posts, filename = 'posts') {
    const csvData = posts.map(post => ({
      Author: post.author?.name || 'Unknown',
      Content: this.truncateText(post.content, 100),
      'Created Date': new Date(post.createdAt).toLocaleDateString(),
      Likes: post.likes?.length || 0,
      Comments: post.comments?.length || 0,
      Shares: post.shares?.length || 0,
      Views: post.views?.length || 0,
      Status: post.isHidden ? 'Hidden' : post.isFlagged ? 'Flagged' : 'Active'
    }));

    this.downloadCSV(csvData, filename);
  }

  downloadCSV(data, filename) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

const adminService = new AdminService();
export default adminService;
