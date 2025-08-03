import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [filter, setFilter] = useState('all'); // all, unread, mentions
  const dropdownRef = useRef(null);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <span className="text-red-500">❤️</span>;
      case 'comment':
        return <span className="text-blue-500">💬</span>;
      case 'share':
        return <span className="text-green-500">🔄</span>;
      case 'connection_request':
      case 'connection_accepted':
        return <span className="text-linkedin-blue">👥</span>;
      case 'job_application':
      case 'job_update':
        return <span className="text-purple-500">💼</span>;
      case 'group_invite':
      case 'group_post':
        return <span className="text-orange-500">👥</span>;
      default:
        return <span className="text-gray-300">🔔</span>;
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, data } = notification;

    switch (type) {
      case 'like':
        return `${data.userName} liked your post`;
      case 'comment':
        return `${data.userName} commented on your post`;
      case 'share':
        return `${data.userName} shared your post`;
      case 'connection_request':
        return `${data.userName} sent you a connection request`;
      case 'connection_accepted':
        return `${data.userName} accepted your connection request`;
      case 'job_application':
        return `New application for ${data.jobTitle}`;
      case 'job_update':
        return `Update on your application for ${data.jobTitle}`;
      case 'mention':
        return `${data.userName} mentioned you in a post`;
      case 'group_invite':
        return `${data.userName} invited you to join ${data.groupName}`;
      case 'group_post':
        return `New post in ${data.groupName}`;
      default:
        return notification.message || 'New notification';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'mentions') return notification.type === 'mention';
    return true;
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate to related content
    if (notification.data?.postId) {
      window.location.href = `/posts/${notification.data.postId}`;
    } else if (notification.data?.userId) {
      window.location.href = `/profile/${notification.data.userId}`;
    } else if (notification.data?.jobId) {
      window.location.href = `/jobs/${notification.data.jobId}`;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-linkedin-blue hover:underline"
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mt-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-sm font-medium ${filter === 'all'
              ? 'text-linkedin-blue border-b-2 border-linkedin-blue'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-sm font-medium ${filter === 'unread'
              ? 'text-linkedin-blue border-b-2 border-linkedin-blue'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('mentions')}
            className={`text-sm font-medium ${filter === 'mentions'
              ? 'text-linkedin-blue border-b-2 border-linkedin-blue'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Mentions
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <div className="text-sm">
              {filter === 'unread'
                ? "You're all caught up!"
                : filter === 'mentions'
                  ? 'No mentions yet'
                  : 'No notifications yet'
              }
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3">
                {/* Notification Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="h-2 w-2 bg-linkedin-blue rounded-full ml-2 mt-1"></div>
                    )}
                  </div>

                  {/* Action buttons for connection requests */}
                  {notification.type === 'connection_request' && !notification.data?.responded && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="flex items-center px-3 py-1 text-xs font-medium text-white bg-linkedin-blue rounded-md hover:bg-linkedin-blue-dark transition-colors">
                        <span className="mr-1">✓</span>
                        Accept
                      </button>
                      <button className="flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                        <span className="mr-1">✕</span>
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                >
                  <span>✕</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              window.location.href = '/notifications';
              onClose();
            }}
            className="w-full text-center text-sm text-linkedin-blue hover:underline"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
