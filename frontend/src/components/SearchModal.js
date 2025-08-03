import React, { useState, useRef, useEffect } from 'react';
import searchService from '../services/searchService';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);

  // Load recent and popular searches
  useEffect(() => {
    if (isOpen) {
      loadRecentSearches();
      loadPopularSearches();
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults({});
    }
  }, [debouncedQuery]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  };

  const loadPopularSearches = async () => {
    try {
      const popular = await searchService.getPopularSearches();
      setPopularSearches(popular);
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const searchResults = await searchService.globalSearch({
        query: searchQuery,
        limit: 5
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({});
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchQuery, ...recent.filter(item => item !== searchQuery)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (type, id) => {
    saveRecentSearch(query);
    onClose();

    switch (type) {
      case 'user':
        navigate(`/profile/${id}`);
        break;
      case 'post':
        navigate(`/posts/${id}`);
        break;
      case 'job':
        navigate(`/jobs/${id}`);
        break;
      case 'company':
        navigate(`/company/${id}`);
        break;
      case 'group':
        navigate(`/groups/${id}`);
        break;
      default:
        break;
    }
  };

  const handleQuickSearch = (searchQuery) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-4 pt-16">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

        <div
          ref={modalRef}
          className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for people, jobs, companies, posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
              />
            </div>
            <button
              onClick={onClose}
              className="ml-3 p-2 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <span className="text-gray-400">✕</span>
            </button>
          </div>

          {/* Search Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-linkedin-blue"></div>
              </div>
            ) : query.trim() && Object.keys(results).length > 0 ? (
              /* Search Results */
              <div className="py-4">
                {/* Users */}
                {results.users?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      People
                    </h3>
                    {results.users.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleResultClick('user', user._id)}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={user.avatar || '/images/default-avatar.png'}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.headline || user.location}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Companies */}
                {results.companies?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Companies
                    </h3>
                    {results.companies.map((company) => (
                      <button
                        key={company._id}
                        onClick={() => handleResultClick('company', company._id)}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={company.logo || '/images/default-company-logo.png'}
                          alt={company.name}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {company.industry} • {company.location}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Jobs */}
                {results.jobs?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Jobs
                    </h3>
                    {results.jobs.map((job) => (
                      <button
                        key={job._id}
                        onClick={() => handleResultClick('job', job._id)}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded mr-3 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {job.title.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {job.company?.name} • {job.location}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Posts */}
                {results.posts?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Posts
                    </h3>
                    {results.posts.map((post) => (
                      <button
                        key={post._id}
                        onClick={() => handleResultClick('post', post._id)}
                        className="w-full flex items-start px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={post.author?.avatar || '/images/default-avatar.png'}
                          alt={post.author?.name}
                          className="h-8 w-8 rounded-full object-cover mr-3 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {post.author?.name}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {post.content}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : query.trim() ? (
              /* No Results */
              <div className="py-8 text-center text-gray-500">
                <span className="mx-auto text-6xl text-gray-300">🔍</span>
                <div className="mt-2 text-sm">No results found for "{query}"</div>
              </div>
            ) : (
              /* Recent & Popular Searches */
              <div className="py-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between px-4 mb-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-gray-400 mr-3">🔍</span>
                        <span className="text-sm text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <div>
                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Popular Searches
                    </h3>
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="h-4 w-4 bg-gray-300 rounded mr-3"></div>
                        <span className="text-sm text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Search Suggestions */}
                {recentSearches.length === 0 && popularSearches.length === 0 && (
                  <div className="px-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Quick Searches
                    </h3>
                    {['JavaScript Developer', 'Product Manager', 'Data Scientist', 'UI/UX Designer'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleQuickSearch(suggestion)}
                        className="w-full flex items-center py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-gray-400 mr-3">🔍</span>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {query.trim() && Object.keys(results).length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  saveRecentSearch(query);
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="w-full text-center text-sm text-linkedin-blue hover:underline"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
