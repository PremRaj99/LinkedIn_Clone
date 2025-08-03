import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        ...(searchQuery && { search: searchQuery }),
        ...(category && { category })
      };
      const response = await groupService.getGroups(filters);
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category]);

  const fetchMyGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await groupService.getUserGroups(user._id);
      setMyGroups(response.groups || []);
    } catch (error) {
      console.error('Error fetching my groups:', error);
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchGroups();
    } else {
      fetchMyGroups();
    }
  }, [activeTab, fetchGroups, fetchMyGroups]);

  const handleJoinGroup = async (groupId) => {
    try {
      await groupService.joinGroup(groupId);
      // Refresh groups
      if (activeTab === 'discover') {
        fetchGroups();
      } else {
        fetchMyGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await groupService.leaveGroup(groupId);
      // Refresh groups
      if (activeTab === 'discover') {
        fetchGroups();
      } else {
        fetchMyGroups();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const categories = [
    'Technology',
    'Business',
    'Healthcare',
    'Education',
    'Arts & Culture',
    'Sports & Recreation',
    'Science',
    'Politics',
    'Travel',
    'Food & Cooking'
  ];

  const filteredGroups = activeTab === 'discover' ? groups : myGroups;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
            <Link
              to="/groups/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Group
            </Link>
          </div>
          <p className="text-gray-600">Connect with like-minded professionals and expand your network</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'discover'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Discover Groups
            </button>
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'my-groups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              My Groups ({myGroups.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Groups
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description, or interests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'discover' ? 'No groups found' : 'You haven\'t joined any groups yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'discover'
                ? 'Try adjusting your search criteria to find relevant groups.'
                : 'Discover groups that match your interests and connect with professionals in your field.'
              }
            </p>
            {activeTab === 'my-groups' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Discover Groups
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                {/* Group Image */}
                <div className="relative">
                  <img
                    src={group.image || '/images/default-group.png'}
                    alt={group.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                      <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Group Info */}
                  <div className="mb-4">
                    <Link
                      to={`/groups/${group._id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {group.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {group.category}
                    </p>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {group.description}
                  </p>

                  {/* Group Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      {group.memberCount || 0} members
                    </div>
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      {group.postCount || 0} posts
                    </div>
                  </div>

                  {/* Recent Activity */}
                  {group.lastActivity && (
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <CalendarDaysIcon className="h-3 w-3 mr-1" />
                      Last activity: {new Date(group.lastActivity).toLocaleDateString()}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex space-x-2">
                    {group.isMember ? (
                      <>
                        <Link
                          to={`/groups/${group._id}`}
                          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View Group
                        </Link>
                        <button
                          onClick={() => handleLeaveGroup(group._id)}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Leave
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group._id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Join Group
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Groups Sidebar */}
        {activeTab === 'my-groups' && myGroups.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-3">
                    <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Tech Innovators</h3>
                      <p className="text-xs text-gray-500">1.2k members</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect with technology leaders and innovators
                  </p>
                  <button className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
