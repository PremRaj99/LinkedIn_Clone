import React, { useState, useEffect, useCallback } from 'react';
import {
  BookmarkIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { getSavedPosts, toggleSavePost } from '../services/postService';

const SavedPostsPage = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchSavedPosts = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getSavedPosts(pageNum);

      if (pageNum === 1) {
        setSavedPosts(response.posts || response || []);
      } else {
        setSavedPosts(prev => [...prev, ...(response.posts || response || [])]);
      }

      setHasMore(response.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      setError('Failed to load saved posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const handleUnsavePost = async (postId) => {
    try {
      await toggleSavePost(postId);
      setSavedPosts(prev => prev.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error unsaving post:', error);
      setError('Failed to unsave post');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSavedPosts(page + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookmarkSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Saved Posts</h1>
          </div>
          <p className="text-gray-600">
            Keep track of posts you want to revisit later
          </p>
          {savedPosts.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {savedPosts.length} saved {savedPosts.length === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {savedPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No saved posts yet</h2>
            <p className="text-gray-600 mb-6">
              Start saving posts to easily find them later. Click the bookmark icon on any post to save it.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Posts
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-semibold text-lg">
                            {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {post.author?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnsavePost(post._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <p className="text-gray-800 text-lg leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <EyeIcon className="h-5 w-5 mr-1" />
                        <span>{formatNumber(post.views?.length || 0)} views</span>
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-5 w-5 mr-1" />
                        <span>{formatNumber(post.likes?.length || 0)} likes</span>
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />
                        <span>{formatNumber(post.comments?.length || 0)} comments</span>
                      </div>
                      <div className="flex items-center">
                        <ShareIcon className="h-5 w-5 mr-1" />
                        <span>{formatNumber(post.shares?.length || 0)} shares</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Saved {formatDate(post.savedAt || post.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage;
