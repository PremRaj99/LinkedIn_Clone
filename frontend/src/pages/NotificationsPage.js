import React, { useState, useEffect, useCallback } from 'react';
import {
  BellIcon,
  UserPlusIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UserGroupIcon,
  CheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '../services/notificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ type: filter !== 'all' ? filter : undefined });
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return <UserPlusIcon className="h-6 w-6 text-blue-600" />;
      case 'connection_accepted':
        return <UserGroupIcon className="h-6 w-6 text-green-600" />;
      case 'job_application':
        return <BriefcaseIcon className="h-6 w-6 text-purple-600" />;
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />;
      case 'like':
        return <HeartIcon className="h-6 w-6 text-red-600" />;
      case 'comment':
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, actor, data } = notification;
    const actorName = actor?.name || 'Someone';

    switch (type) {
      case 'connection_request':
        return `${actorName} sent you a connection request`;
      case 'connection_accepted':
        return `${actorName} accepted your connection request`;
      case 'job_application':
        return `New application for ${data?.jobTitle || 'your job posting'}`;
      case 'message':
        return `${actorName} sent you a message`;
      case 'like':
        return `${actorName} liked your post`;
      case 'comment':
        return `${actorName} commented on your post`;
      case 'group_invitation':
        return `${actorName} invited you to join ${data?.groupName || 'a group'}`;
      case 'post_mention':
        return `${actorName} mentioned you in a post`;
      default:
        return notification.message || 'You have a new notification';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'connection_request', label: 'Connection Requests' },
    { value: 'job_application', label: 'Job Applications' },
    { value: 'message', label: 'Messages' },
    { value: 'like', label: 'Likes & Reactions' },
    { value: 'comment', label: 'Comments' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BellIcon className="h-8 w-8 mr-3" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 px-2 py-1 text-sm bg-blue-600 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Mark all as read
              </button>
            )}
          </div>
          <p className="text-gray-600">Stay updated with your professional network and activities</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-1 overflow-x-auto">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filter === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? "You're all caught up! Check back later for new notifications."
                  : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} found.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Actor Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={notification.actor?.avatar || '/images/default-avatar.png'}
                        alt={notification.actor?.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {getNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons for specific notification types */}
                      {notification.type === 'connection_request' && !notification.data?.responded && (
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Accept
                          </button>
                          <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Decline
                          </button>
                        </div>
                      )}

                      {notification.type === 'group_invitation' && !notification.data?.responded && (
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            Join Group
                          </button>
                          <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Ignore
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {notifications.length > 0 && !loading && (
          <div className="mt-6 text-center">
            <button className="px-6 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
