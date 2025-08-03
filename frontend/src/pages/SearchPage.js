import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  UserIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  HashtagIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    experience: '',
    sortBy: 'relevance'
  });
  const [results, setResults] = useState({
    people: [],
    jobs: [],
    companies: [],
    posts: [],
    groups: []
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Mock search results for development
      const mockResults = {
        people: [
          {
            _id: '1',
            firstName: 'John',
            lastName: 'Doe',
            title: 'Software Engineer',
            company: 'TechCorp',
            location: 'San Francisco, CA',
            profilePicture: '',
            connectionStatus: 'not_connected',
            mutualConnections: 5
          },
          {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            title: 'Product Manager',
            company: 'StartupXYZ',
            location: 'New York, NY',
            profilePicture: '',
            connectionStatus: 'pending',
            mutualConnections: 12
          }
        ],
        jobs: [
          {
            _id: '1',
            title: 'Senior Software Engineer',
            company: { name: 'TechCorp', logo: '' },
            location: 'San Francisco, CA',
            type: 'Full-time',
            experience: 'Senior',
            postedAt: '2023-12-01T10:00:00Z',
            applicationsCount: 25
          },
          {
            _id: '2',
            title: 'Product Manager',
            company: { name: 'StartupXYZ', logo: '' },
            location: 'Remote',
            type: 'Full-time',
            experience: 'Mid-level',
            postedAt: '2023-11-30T15:00:00Z',
            applicationsCount: 18
          }
        ],
        companies: [
          {
            _id: '1',
            name: 'TechCorp',
            industry: 'Technology',
            size: '1001-5000 employees',
            location: 'San Francisco, CA',
            logo: '',
            followersCount: 15000,
            jobOpenings: 45,
            isFollowing: false
          },
          {
            _id: '2',
            name: 'StartupXYZ',
            industry: 'Software',
            size: '51-200 employees',
            location: 'New York, NY',
            logo: '',
            followersCount: 2500,
            jobOpenings: 8,
            isFollowing: true
          }
        ],
        posts: [
          {
            _id: '1',
            content: 'Excited to share insights about the latest developments in AI technology...',
            author: {
              firstName: 'Alice',
              lastName: 'Johnson',
              title: 'AI Researcher',
              profilePicture: ''
            },
            createdAt: '2023-12-01T12:00:00Z',
            likesCount: 125,
            commentsCount: 28
          }
        ],
        groups: [
          {
            _id: '1',
            name: 'Software Engineers Network',
            description: 'A community for software engineers to share knowledge and connect',
            membersCount: 25000,
            postsCount: 1250,
            isPrivate: false,
            isMember: false
          }
        ]
      };

      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: MagnifyingGlassIcon },
    { id: 'people', label: 'People', icon: UserIcon },
    { id: 'jobs', label: 'Jobs', icon: BriefcaseIcon },
    { id: 'companies', label: 'Companies', icon: BuildingOfficeIcon },
    { id: 'posts', label: 'Posts', icon: HashtagIcon },
    { id: 'groups', label: 'Groups', icon: UserGroupIcon }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery.trim());
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConnectionStatusButton = (person) => {
    switch (person.connectionStatus) {
      case 'connected':
        return (
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Message
          </button>
        );
      case 'pending':
        return (
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Pending
          </button>
        );
      default:
        return (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Connect
          </button>
        );
    }
  };

  const filteredResults = () => {
    if (activeTab === 'all') {
      return {
        people: results.people.slice(0, 3),
        jobs: results.jobs.slice(0, 3),
        companies: results.companies.slice(0, 3),
        posts: results.posts.slice(0, 2),
        groups: results.groups.slice(0, 2)
      };
    }
    return { [activeTab]: results[activeTab] || [] };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people, jobs, companies..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Industries</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Most Recent</option>
                    <option value="connections">Most Connected</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const count = results[tab.id]?.length || 0;

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
                    {count > 0 && tab.id !== 'all' && (
                      <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredResults()).map(([type, items]) => {
              if (!items || items.length === 0) return null;

              return (
                <div key={type}>
                  {activeTab === 'all' && (
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                      {type}
                    </h2>
                  )}

                  <div className="space-y-4">
                    {type === 'people' && items.map((person) => (
                      <div key={person._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {person.firstName} {person.lastName}
                              </h3>
                              <p className="text-gray-600">{person.title}</p>
                              <p className="text-sm text-gray-500">{person.company} • {person.location}</p>
                              {person.mutualConnections > 0 && (
                                <p className="text-sm text-blue-600">
                                  {person.mutualConnections} mutual connections
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {getConnectionStatusButton(person)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {type === 'jobs' && items.map((job) => (
                      <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                            <p className="text-gray-600">{job.company.name}</p>
                            <p className="text-sm text-gray-500">
                              {job.location} • {job.type} • {job.experience}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Posted {formatDate(job.postedAt)} • {job.applicationsCount} applicants
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}

                    {type === 'companies' && items.map((company) => (
                      <div key={company._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                              <p className="text-gray-600">{company.industry}</p>
                              <p className="text-sm text-gray-500">
                                {company.size} • {company.location}
                              </p>
                              <p className="text-sm text-gray-500">
                                {company.followersCount.toLocaleString()} followers • {company.jobOpenings} jobs
                              </p>
                            </div>
                          </div>
                          <button className={`px-4 py-2 rounded-md text-sm font-medium ${company.isFollowing
                              ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}>
                            {company.isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      </div>
                    ))}

                    {type === 'posts' && items.map((post) => (
                      <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start space-x-3">
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {post.author.firstName} {post.author.lastName}
                              </h4>
                              <span className="text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                            </div>
                            <p className="text-gray-600 mb-3">{post.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{post.likesCount} likes</span>
                              <span>{post.commentsCount} comments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {type === 'groups' && items.map((group) => (
                      <div key={group._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <UserGroupIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                              <p className="text-gray-600">{group.description}</p>
                              <p className="text-sm text-gray-500">
                                {group.membersCount.toLocaleString()} members • {group.postsCount} posts
                                {group.isPrivate && ' • Private'}
                              </p>
                            </div>
                          </div>
                          <button className={`px-4 py-2 rounded-md text-sm font-medium ${group.isMember
                              ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}>
                            {group.isMember ? 'Joined' : 'Join'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeTab === 'all' && type !== 'posts' && type !== 'groups' && items.length >= 3 && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() => setActiveTab(type)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        See all {type}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {!loading && Object.values(filteredResults()).every(items => !items || items.length === 0) && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
