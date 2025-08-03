import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import { TrendingUpIcon } from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    profileViews: {},
    postMetrics: {},
    connectionGrowth: {},
    searchAppearances: {},
    topPosts: [],
    industryInsights: [],
    hourlyData: [],
    weeklyTrends: [],
    demographicData: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('profileViews');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, trends
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, userDashboard] = await Promise.all([
        analyticsService.getProfileAnalytics({
          timeRange: parseInt(timeRange),
          userId: user._id
        }),
        analyticsService.getUserDashboard(timeRange)
      ]);

      // Combine and enhance the data
      const enhancedAnalytics = {
        ...profileData,
        ...userDashboard,
        // Add computed metrics
        engagementRate: calculateEngagementRate(profileData),
        growthTrend: calculateGrowthTrend(profileData),
        bestPostingTime: findBestPostingTime(profileData.hourlyData),
        audienceInsights: generateAudienceInsights(profileData)
      };

      setAnalytics(enhancedAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, user._id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  // Helper functions for enhanced analytics
  const calculateEngagementRate = (data) => {
    const totalViews = data.profileViews?.total || 0;
    const totalEngagements = data.postMetrics?.totalEngagement || 0;
    return totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(1) : 0;
  };

  const calculateGrowthTrend = (data) => {
    const current = data.profileViews?.total || 0;
    const previous = current / (1 + (data.profileViews?.changePercent || 0) / 100);
    return current > previous ? 'up' : current < previous ? 'down' : 'stable';
  };

  const findBestPostingTime = (hourlyData) => {
    if (!hourlyData || !Array.isArray(hourlyData)) return 'Not available';
    const maxIndex = hourlyData.indexOf(Math.max(...hourlyData));
    return `${maxIndex}:00 - ${maxIndex + 1}:00`;
  };

  const generateAudienceInsights = (data) => {
    const insights = [];

    if (data.profileViews?.changePercent > 20) {
      insights.push({
        type: 'positive',
        title: 'Growing Visibility',
        message: `Your profile views increased by ${data.profileViews.changePercent}% this period`
      });
    }

    if (data.postMetrics?.changePercent > 15) {
      insights.push({
        type: 'positive',
        title: 'Engagement Boost',
        message: `Post engagement is up ${data.postMetrics.changePercent}%`
      });
    }

    if (data.connectionGrowth?.changePercent > 10) {
      insights.push({
        type: 'positive',
        title: 'Network Growth',
        message: `Your network grew by ${data.connectionGrowth.changePercent}%`
      });
    }

    return insights;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  const viewModeOptions = [
    { value: 'overview', label: 'Overview', icon: ChartBarIcon },
    { value: 'detailed', label: 'Detailed', icon: DocumentChartBarIcon },
    { value: 'trends', label: 'Trends', icon: TrendingUpIcon }
  ];

  const metricCards = [
    {
      id: 'profileViews',
      title: 'Profile Views',
      value: analytics.profileViews?.total || analytics.profileViews?.totalViews || 0,
      change: analytics.profileViews?.changePercent || 0,
      icon: EyeIcon,
      color: 'blue',
      description: 'People who viewed your profile'
    },
    {
      id: 'connections',
      title: 'New Connections',
      value: analytics.connectionGrowth?.newConnections || 0,
      change: analytics.connectionGrowth?.changePercent || 0,
      icon: UserGroupIcon,
      color: 'green',
      description: 'New professional connections'
    },
    {
      id: 'postEngagement',
      title: 'Post Engagement',
      value: analytics.postMetrics?.totalEngagement || 0,
      change: analytics.postMetrics?.changePercent || 0,
      icon: HeartIcon,
      color: 'red',
      description: 'Likes, comments, and shares'
    },
    {
      id: 'searchAppearances',
      title: 'Search Appearances',
      value: analytics.searchAppearances?.total || 0,
      change: analytics.searchAppearances?.changePercent || 0,
      icon: ArrowTrendingUpIcon,
      color: 'purple',
      description: 'Times you appeared in search results'
    },
    {
      id: 'engagementRate',
      title: 'Engagement Rate',
      value: analytics.engagementRate || 0,
      change: 0,
      icon: TrendingUpIcon,
      color: 'orange',
      description: 'Engagement per profile view',
      suffix: '%'
    },
    {
      id: 'networkGrowth',
      title: 'Network Reach',
      value: analytics.networkReach || 0,
      change: analytics.networkGrowthPercent || 0,
      icon: UsersIcon,
      color: 'indigo',
      description: 'Extended network connections'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

  const renderChart = () => {
    const data = analytics[selectedMetric]?.chartData || [];
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="h-64 flex items-end space-x-2 p-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
              style={{
                height: `${(item.value / maxValue) * 200}px`,
                minHeight: '4px'
              }}
            ></div>
            <span className="text-xs text-gray-500 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3" />
              Analytics
            </h1>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-gray-600">Track your professional growth and engagement metrics</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metricCards.map((metric) => {
                const IconComponent = metric.icon;
                const isPositive = metric.change >= 0;

                return (
                  <div
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                      <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(metric.value)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {isPositive ? '+' : ''}{metric.change.toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            vs last period
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {metricCards.find(m => m.id === selectedMetric)?.title} Over Time
                  </h2>
                </div>
                <div className="p-6">
                  {renderChart()}
                </div>
              </div>

              {/* Top Posts */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Top Performing Posts</h2>
                </div>
                <div className="p-6">
                  {analytics.topPosts?.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.topPosts.slice(0, 3).map((post, index) => (
                        <div key={post._id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-6 w-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                {formatNumber(post.views)}
                              </div>
                              <div className="flex items-center">
                                <HeartIcon className="h-3 w-3 mr-1" />
                                {formatNumber(post.likes)}
                              </div>
                              <div className="flex items-center">
                                <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                                {formatNumber(post.comments)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No post data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Views Sources */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Profile View Sources</h2>
                </div>
                <div className="p-6">
                  {analytics.profileViews?.sources?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.profileViews.sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{source.name}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${source.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {source.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No source data available</p>
                  )}
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Engagement Breakdown</h2>
                </div>
                <div className="p-6">
                  {analytics.postMetrics?.breakdown ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                          <span className="text-sm text-gray-600">Likes</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(analytics.postMetrics.breakdown.likes)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm text-gray-600">Comments</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(analytics.postMetrics.breakdown.comments)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShareIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-600">Shares</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(analytics.postMetrics.breakdown.shares)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No engagement data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;