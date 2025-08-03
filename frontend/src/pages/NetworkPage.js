import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import connectionService from '../services/connectionService';

const NetworkPage = () => {
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'connections':
          await fetchConnections();
          break;
        case 'suggestions':
          await fetchSuggestions();
          break;
        case 'pending':
          await fetchPendingRequests();
          break;
        case 'sent':
          await fetchSentRequests();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchConnections = async () => {
    const response = await connectionService.getConnections();
    setConnections(response.connections || []);
  };

  const fetchSuggestions = async () => {
    const response = await connectionService.getSuggestions();
    setSuggestions(response.suggestions || []);
  };

  const fetchPendingRequests = async () => {
    const response = await connectionService.getPendingRequests();
    setPendingRequests(response.requests || []);
  };

  const fetchSentRequests = async () => {
    const response = await connectionService.getSentRequests();
    setSentRequests(response.requests || []);
  };

  const handleSendRequest = async (userId) => {
    try {
      await connectionService.sendConnectionRequest(userId);
      // Remove from suggestions and add to sent requests
      setSuggestions(prev => prev.filter(s => s._id !== userId));
      await fetchSentRequests();
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await connectionService.acceptConnectionRequest(requestId);
      // Remove from pending and refresh connections
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      await fetchConnections();
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await connectionService.rejectConnectionRequest(requestId);
      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error rejecting connection request:', error);
    }
  };

  const handleWithdrawRequest = async (requestId) => {
    try {
      await connectionService.withdrawConnectionRequest(requestId);
      // Remove from sent requests
      setSentRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error withdrawing connection request:', error);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await connectionService.removeConnection(connectionId);
      // Remove from connections
      setConnections(prev => prev.filter(c => c._id !== connectionId));
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'connections':
        return connections;
      case 'suggestions':
        return suggestions;
      case 'pending':
        return pendingRequests;
      case 'sent':
        return sentRequests;
      default:
        return [];
    }
  };

  const filteredData = getCurrentData().filter(item => {
    const person = item.user || item.sender || item.receiver || item;
    const matchesSearch = person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.headline?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !industryFilter || person.industry === industryFilter;
    const matchesLocation = !locationFilter || person.location?.includes(locationFilter);

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  const tabs = [
    { id: 'connections', label: 'Connections', count: connections.length },
    { id: 'suggestions', label: 'People You May Know', count: suggestions.length },
    { id: 'pending', label: 'Pending Requests', count: pendingRequests.length },
    { id: 'sent', label: 'Sent Requests', count: sentRequests.length }
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Manufacturing',
    'Consulting',
    'Non-profit',
    'Government'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">Manage your professional connections and discover new opportunities</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search People
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or title..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="City, State"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                setSearchQuery('');
                setIndustryFilter('');
                setLocationFilter('');
              }}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </button>

            <span className="text-sm text-gray-500">
              {filteredData.length} results
            </span>
          </div>
        </div>

        {/* People Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'connections' ? 'No connections yet' : 'No results found'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'connections'
                ? 'Start building your network by connecting with colleagues and industry professionals.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((item) => {
              const person = item.user || item.sender || item.receiver || item;
              const isConnection = activeTab === 'connections';
              const isPending = activeTab === 'pending';
              const isSent = activeTab === 'sent';
              const isSuggestion = activeTab === 'suggestions';

              return (
                <div key={person._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {/* Profile Section */}
                  <div className="p-6 text-center">
                    <Link to={`/profile/${person._id}`}>
                      <img
                        src={person.avatar || '/images/default-avatar.png'}
                        alt={person.name}
                        className="h-20 w-20 rounded-full object-cover mx-auto mb-4 hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <Link
                      to={`/profile/${person._id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {person.name}
                    </Link>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {person.headline || 'Professional'}
                    </p>

                    {/* Additional Info */}
                    <div className="mt-3 space-y-1">
                      {person.company && (
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                          {person.company}
                        </div>
                      )}

                      {person.education && (
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <AcademicCapIcon className="h-3 w-3 mr-1" />
                          {person.education}
                        </div>
                      )}

                      {person.location && (
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {person.location}
                        </div>
                      )}
                    </div>

                    {/* Mutual Connections */}
                    {person.mutualConnections > 0 && (
                      <div className="mt-3 text-xs text-blue-600">
                        {person.mutualConnections} mutual connection{person.mutualConnections !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6">
                    {isConnection && (
                      <div className="space-y-2">
                        <Link
                          to={`/messages?user=${person._id}`}
                          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Message
                        </Link>
                        <button
                          onClick={() => handleRemoveConnection(person._id)}
                          className="w-full flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <UserMinusIcon className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      </div>
                    )}

                    {isSuggestion && (
                      <button
                        onClick={() => handleSendRequest(person._id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Connect
                      </button>
                    )}

                    {isPending && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleAcceptRequest(item._id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(item._id)}
                          className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {isSent && (
                      <button
                        onClick={() => handleWithdrawRequest(item._id)}
                        className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Network Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{connections.length}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{suggestions.length}</div>
              <div className="text-sm text-gray-600">Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sentRequests.length}</div>
              <div className="text-sm text-gray-600">Sent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
