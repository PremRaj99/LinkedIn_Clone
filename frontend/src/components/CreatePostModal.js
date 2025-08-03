import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';
import { Camera } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      setError('Please add some content or an image');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newPost = await createPost(content.trim(), image, token);

      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call callback if provided
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Create a post</h3>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {/* User Info */}
            <div className="modal-user-info">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="user-details">
                <div className="user-name">
                  {user?.name}
                </div>
                <div className="user-subtitle">
                  Share with your professional network
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Text Content */}
            <div className="form-group">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  adjustTextareaHeight();
                  setError('');
                }}
                placeholder="What do you want to talk about?"
                className="post-textarea"
                maxLength={3000}
              />
              <div className="character-count">
                {content.length}/3000 characters
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </form>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="modal-actions">
            <div className="action-buttons-left">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="photo-btn"
                title="Add photo"
              >
                <Camera className="icon" />
              </button>
            </div>

            <div className="action-buttons-right">
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={(!content.trim() && !image) || isSubmitting}
                className={`post-btn ${(!content.trim() && !image) || isSubmitting ? 'disabled' : ''}`}
              >
                {isSubmitting && (
                  <span className="loading-spinner">⟳</span>
                )}
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
