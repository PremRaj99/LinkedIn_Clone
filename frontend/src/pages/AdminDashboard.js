import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentUsers: [],
    recentPosts: [],
    recentJobs: [],
    recentCompanies: [],
    systemHealth: {}
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAdminDashboard(selectedTimeRange);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      // Mock data for development
      setDashboardData({
        stats: {
          totalUsers: 12450,
          totalPosts: 8920,
          totalJobs: 3200,
          totalCompanies: 890,
          newUsersToday: 45,
          activeUsers: 3200,
          totalConnections: 45600,
          totalMessages: 156000
        },
        recentUsers: [
          {
            _id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            createdAt: '2023-12-01T10:00:00Z',
            isActive: true
          },
          {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            createdAt: '2023-12-01T09:30:00Z',
            isActive: true
          }
        ],
        recentPosts: [
          {
            _id: '1',
            content: 'Excited to announce my new role at TechCorp!',
            author: { firstName: 'Alice', lastName: 'Johnson' },
            createdAt: '2023-12-01T11:00:00Z',
            likesCount: 25,
            commentsCount: 8
          }
        ],
        recentJobs: [
          {
            _id: '1',
            title: 'Senior Software Engineer',
            company: { name: 'TechCorp' },
            location: 'San Francisco, CA',
            createdAt: '2023-12-01T08:00:00Z',
            applicationsCount: 12
          }
        ],
        recentCompanies: [
          {
            _id: '1',
            name: 'TechStartup Inc.',
            industry: 'Technology',
            createdAt: '2023-11-30T14:00:00Z',
            followersCount: 150
          }
        ],
        systemHealth: {
          status: 'healthy',
          uptime: '99.9%',
          responseTime: '120ms',
          activeConnections: 3200,
          lastBackup: '2023-12-01T02:00:00Z'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'content', label: 'Content', icon: PencilIcon },
    { id: 'system', label: 'System', icon: CheckCircleIcon }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUserAction = async (userId, action) => {
    try {
      // Implementation for user actions (activate, deactivate, delete)
      console.log(`${action} user ${userId}`);
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const handleContentAction = async (contentId, contentType, action) => {
    try {
      // Implementation for content actions (approve, delete, moderate)
      console.log(`${action} ${contentType} ${contentId}`);
    } catch (error) {
      console.error('Error performing content action:', error);
    }
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.totalUsers)}
                        </p>
                      </div>
                      <UsersIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.totalPosts)}
                        </p>
                      </div>
                      <PencilIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.totalJobs)}
                        </p>
                      </div>
                      <BriefcaseIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Companies</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.totalCompanies)}
                        </p>
                      </div>
                      <BuildingOfficeIcon className="h-8 w-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.activeUsers)}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Users Today</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData.stats.newUsersToday}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Connections</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.totalConnections)}
                        </p>
                      </div>
                      <UsersIcon className="h-8 w-8 text-indigo-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Messages</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(dashboardData.stats.totalMessages)}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-green-600 capitalize">
                        {dashboardData.systemHealth.status}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="font-medium text-gray-900">
                        {dashboardData.systemHealth.uptime}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="font-medium text-gray-900">
                        {dashboardData.systemHealth.responseTime}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Active Connections</p>
                      <p className="font-medium text-gray-900">
                        {formatNumber(dashboardData.systemHealth.activeConnections)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recentUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUserAction(user._id, 'view')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                                className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                              >
                                {user.isActive ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, 'delete')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Posts */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
                  </div>
                  <div className="p-6">
                    {dashboardData.recentPosts.map((post) => (
                      <div key={post._id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                        <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            By {post.author.firstName} {post.author.lastName}
                          </span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{post.likesCount} likes</span>
                          <span>{post.commentsCount} comments</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleContentAction(post._id, 'post', 'view')}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleContentAction(post._id, 'post', 'delete')}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Jobs */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                  </div>
                  <div className="p-6">
                    {dashboardData.recentJobs.map((job) => (
                      <div key={job._id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                        <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company.name}</p>
                        <p className="text-sm text-gray-500">{job.location}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <span>{job.applicationsCount} applications</span>
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleContentAction(job._id, 'job', 'view')}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleContentAction(job._id, 'job', 'delete')}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Server Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Healthy
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="text-sm text-gray-900">{dashboardData.systemHealth.uptime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="text-sm text-gray-900">{dashboardData.systemHealth.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Database</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Backup</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(dashboardData.systemHealth.lastBackup)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Connections</span>
                        <span className="text-sm text-gray-900">
                          {formatNumber(dashboardData.systemHealth.activeConnections)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
