import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        loading: false,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification._id !== action.payload
      );
      const deletedNotification = state.notifications.find(
        notification => notification._id === action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: deletedNotification && !deletedNotification.isRead
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Set up real-time notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await notificationService.getNotifications();
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          notifications: response.data.notifications,
          unreadCount: response.data.unreadCount,
        },
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch notifications',
      });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Also export as useNotification for backward compatibility
export const useNotification = useNotifications;
