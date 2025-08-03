import api from './api';

class AnalyticsService {
  // Profile analytics
  async getProfileAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/profile', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile analytics:', error);
      // Return mock data for development
      return {
        profileViews: {
          totalViews: 1250,
          changePercent: 15.5,
          chartData: [
            { label: 'Week 1', value: 200 },
            { label: 'Week 2', value: 280 },
            { label: 'Week 3', value: 320 },
            { label: 'Week 4', value: 450 }
          ],
          sources: [
            { name: 'Search', percentage: 45 },
            { name: 'Profile Links', percentage: 30 },
            { name: 'Posts', percentage: 25 }
          ]
        },
        connectionGrowth: {
          newConnections: 28,
          changePercent: 12.3,
          chartData: [
            { label: 'Week 1', value: 5 },
            { label: 'Week 2', value: 8 },
            { label: 'Week 3', value: 10 },
            { label: 'Week 4', value: 5 }
          ]
        },
        postMetrics: {
          totalEngagement: 892,
          changePercent: 8.7,
          chartData: [
            { label: 'Week 1', value: 150 },
            { label: 'Week 2', value: 220 },
            { label: 'Week 3', value: 280 },
            { label: 'Week 4', value: 242 }
          ],
          breakdown: {
            likes: 450,
            comments: 220,
            shares: 222
          }
        },
        searchAppearances: {
          total: 2150,
          changePercent: 22.1,
          chartData: [
            { label: 'Week 1', value: 400 },
            { label: 'Week 2', value: 520 },
            { label: 'Week 3', value: 680 },
            { label: 'Week 4', value: 550 }
          ]
        },
        topPosts: [
          {
            _id: '1',
            content: 'Excited to share my thoughts on the future of AI in healthcare...',
            views: 2500,
            likes: 125,
            comments: 34,
            shares: 18
          },
          {
            _id: '2',
            content: 'Just completed an amazing project with my team at TechCorp...',
            views: 1800,
            likes: 98,
            comments: 22,
            shares: 12
          },
          {
            _id: '3',
            content: 'Reflecting on my journey from startup to enterprise...',
            views: 1500,
            likes: 87,
            comments: 19,
            shares: 8
          }
        ]
      };
    }
  }

  // User analytics
  async getUserDashboard(timeRange = '30') {
    try {
      const response = await api.get(`/analytics/user/dashboard?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Get user dashboard error:', error);
      throw error;
    }
  }

  // Post analytics
  async getPostAnalytics(postId) {
    try {
      const response = await api.get(`/analytics/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get post analytics error:', error);
      throw error;
    }
  }

  // Company analytics
  async getCompanyAnalytics(companyId, timeRange = '30') {
    try {
      const response = await api.get(`/analytics/company/${companyId}?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Get company analytics error:', error);
      throw error;
    }
  }

  // Job analytics
  async getJobAnalytics(jobId) {
    try {
      const response = await api.get(`/analytics/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Get job analytics error:', error);
      throw error;
    }
  }

  // Admin analytics
  async getAdminDashboard(timeRange = '30') {
    try {
      const response = await api.get(`/analytics/admin/dashboard?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      throw error;
    }
  }

  // Analytics utilities
  formatEngagementData(data) {
    return {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Likes',
          data: data.map(item => item.likes),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Comments',
          data: data.map(item => item.comments),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Shares',
          data: data.map(item => item.shares),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  formatViewsData(data) {
    return {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Profile Views',
          data: data.map(item => item.views),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  formatHourlyData(hourlyData) {
    const hours = Array.from({ length: 24 }, (_, i) =>
      `${i.toString().padStart(2, '0')}:00`
    );

    return {
      labels: hours,
      datasets: [
        {
          label: 'Hourly Views',
          data: hourlyData,
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  formatDemographicsData(demographics) {
    const locationData = {
      labels: Object.keys(demographics.byLocation || {}),
      datasets: [
        {
          data: Object.values(demographics.byLocation || {}),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }
      ]
    };

    const industryData = {
      labels: Object.keys(demographics.byIndustry || {}),
      datasets: [
        {
          data: Object.values(demographics.byIndustry || {}),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }
      ]
    };

    return { locationData, industryData };
  }

  formatGrowthData(growthData) {
    return {
      labels: Object.keys(growthData),
      datasets: [
        {
          label: 'Current Period',
          data: Object.values(growthData).map(item => item.current),
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        },
        {
          label: 'Previous Period',
          data: Object.values(growthData).map(item => item.previous),
          backgroundColor: 'rgba(156, 163, 175, 0.8)'
        }
      ]
    };
  }

  formatApplicationsData(applications) {
    const timelineData = {
      labels: applications.timeline.map(item => item.date),
      datasets: [
        {
          label: 'Applications',
          data: applications.timeline.map(item => item.applications),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const statusData = {
      labels: Object.keys(applications.byStatus),
      datasets: [
        {
          data: Object.values(applications.byStatus),
          backgroundColor: [
            '#3B82F6', // Applied
            '#F59E0B', // Under Review
            '#10B981', // Interviewed
            '#EF4444', // Rejected
            '#8B5CF6'  // Hired
          ]
        }
      ]
    };

    return { timelineData, statusData };
  }

  calculateEngagementRate(analytics) {
    const { likes, comments, shares, views } = analytics.engagement;
    const totalEngagement = likes + comments + shares;
    return views > 0 ? ((totalEngagement / views) * 100).toFixed(2) : 0;
  }

  calculateViralityScore(analytics) {
    const { shares, views } = analytics.engagement;
    return views > 0 ? ((shares / views) * 100).toFixed(2) : 0;
  }

  getEngagementTrend(currentData, previousData) {
    if (!previousData || previousData === 0) {
      return { trend: 'neutral', percentage: 0 };
    }

    const change = ((currentData - previousData) / previousData) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    };
  }

  formatMetricValue(value, type = 'number') {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }

  getTopPerformers(data, metric = 'engagementScore', limit = 5) {
    return data
      .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
      .slice(0, limit);
  }

  calculateAverageEngagement(posts) {
    if (!posts || posts.length === 0) return 0;

    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.likes?.length || 0) +
        (post.comments?.length || 0) +
        (post.shares?.length || 0);
    }, 0);

    return Math.round(totalEngagement / posts.length);
  }

  getBestPostingTimes(hourlyData) {
    const hourlyEngagement = hourlyData.map((value, hour) => ({ hour, value }));
    return hourlyEngagement
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(item => `${item.hour.toString().padStart(2, '0')}:00`);
  }

  generateInsights(analytics) {
    const insights = [];

    // Engagement insights
    const engagementRate = this.calculateEngagementRate(analytics);
    if (engagementRate > 5) {
      insights.push({
        type: 'success',
        title: 'High Engagement',
        message: `Your content has a ${engagementRate}% engagement rate, which is excellent!`
      });
    } else if (engagementRate < 2) {
      insights.push({
        type: 'warning',
        title: 'Low Engagement',
        message: 'Consider posting more interactive content to boost engagement.'
      });
    }

    // Virality insights
    const viralityScore = this.calculateViralityScore(analytics);
    if (viralityScore > 10) {
      insights.push({
        type: 'success',
        title: 'Viral Content',
        message: `Your content has a ${viralityScore}% share rate - it's going viral!`
      });
    }

    // Timing insights
    if (analytics.performance?.hourlyViews) {
      const bestTimes = this.getBestPostingTimes(analytics.performance.hourlyViews);
      insights.push({
        type: 'info',
        title: 'Optimal Posting Times',
        message: `Your audience is most active at: ${bestTimes.join(', ')}`
      });
    }

    return insights;
  }

  exportAnalytics(data, filename = 'analytics') {
    const csvContent = this.convertToCSV(data);
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
    }
  }

  convertToCSV(data) {
    if (!data || !Array.isArray(data)) return '';

    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
