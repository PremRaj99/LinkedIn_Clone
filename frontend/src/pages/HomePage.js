import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllPosts, likePost, addComment } from '../services/postService';

// Import component with proper default import
import CreatePostModal from '../components/CreatePostModal';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const { token, user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      // Extract posts array from the response object and filter out any null/undefined posts
      const postsArray = data.posts || data || [];
      const validPosts = Array.isArray(postsArray) ? postsArray.filter(post => post && post._id) : [];
      setPosts(validPosts);
      setError('');
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
      setPosts([]); // Ensure posts is always an array
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    if (newPost && newPost._id) {
      setPosts(prev => [newPost, ...prev]);
    }
  };

  const handleLike = async (postId) => {
    if (!postId || !token) return;

    try {
      const updatedPost = await likePost(postId, token);
      if (updatedPost && updatedPost._id) {
        setPosts(prev => prev.map(post =>
          post && post._id === postId ? updatedPost : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim() || !postId || !token) return;

    try {
      const updatedPost = await addComment(postId, content, token);
      if (updatedPost && updatedPost._id) {
        setPosts(prev => prev.map(post =>
          post && post._id === postId ? updatedPost : post
        ));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const isLikedByUser = (post) => {
    if (!post?.likes || !user?.id) return false;
    return post.likes.some(like => like?.user?._id === user.id || like?.user === user.id);
  };

  const renderAvatar = (userObj, className = "author-avatar") => {
    if (!userObj) return <div className={`mini-default-avatar ${className}`}>?</div>;

    if (userObj.avatar) {
      return <img src={userObj.avatar} alt={userObj.name || 'User'} className={className} />;
    }

    return (
      <div className={`mini-default-avatar ${className}`}>
        {userObj.name?.charAt(0) || '?'}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="home-container">
        <div className="main-feed">
          <div className="error-message">Please log in to view posts.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-banner-mini"></div>
          <div className="profile-info-mini">
            {renderAvatar(user, "mini-avatar")}
            <h3>{user?.name || 'User'}</h3>
            <p>Welcome to your professional community</p>
            <Link to={`/profile/${user?.id}`} className="view-profile-btn">
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="main-feed">
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Loading Message */}
        {loading && <div className="loading-message">Loading posts...</div>}

        {/* Create Post Button */}
        <div className="create-post">
          <div className="create-post-header">
            {renderAvatar(user)}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="start-post-btn"
            >
              Start a post
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {!loading && posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts
            .filter(post => post && post._id && post.author)
            .map(post => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <Link to={`/profile/${post.author._id}`} className="author-link">
                    {renderAvatar(post.author)}
                  </Link>
                  <div className="author-info">
                    <Link to={`/profile/${post.author._id}`} className="author-link">
                      <h4>{post.author.name || 'Unknown User'}</h4>
                    </Link>
                    <p className="author-headline">{post.author.headline || 'Professional'}</p>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                <div className="post-content">
                  <p>{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post content"
                      className="post-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Post Stats */}
                <div className="post-stats">
                  <span>👍 {post.likes?.length || 0}</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>

                {/* Post Actions */}
                <div className="post-actions">
                  <button
                    className={`action-button ${isLikedByUser(post) ? 'liked' : ''}`}
                    onClick={() => handleLike(post._id)}
                  >
                    👍 Like
                  </button>
                  <button className="action-button">
                    💬 Comment
                  </button>
                  <button className="action-button">
                    🔄 Share
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="comments-section">
                    {post.comments
                      .filter(comment => comment && comment.author)
                      .map((comment, index) => (
                        <div key={comment._id || `comment-${index}`} className="comment">
                          {renderAvatar(comment.author, "comment-avatar")}
                          <div className="comment-content">
                            <div className="comment-author">
                              {comment.author.name || 'Unknown User'}
                            </div>
                            <div className="comment-text">{comment.content}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="add-comment">
                  <div className="comment-input-container">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                      className="comment-input"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="comment-submit-btn"
                      disabled={!commentInputs[post._id]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Right Sidebar */}
      <div className="sidebar">
        <div className="suggestions">
          <h3>People you may know</h3>
          <div className="suggestion-list">
            <div className="suggestion-item">
              <div className="suggestion-avatar">👤</div>
              <div className="suggestion-info">
                <h4>John Doe</h4>
                <p>Software Engineer</p>
                <button className="connect-btn">Connect</button>
              </div>
            </div>
            <div className="suggestion-item">
              <div className="suggestion-avatar">👩</div>
              <div className="suggestion-info">
                <h4>Jane Smith</h4>
                <p>Product Manager</p>
                <button className="connect-btn">Connect</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {CreatePostModal && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default HomePage;