import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';

const SocketContext = createContext();

const initialState = {
  socket: null,
  connected: false,
  onlineUsers: [],
  typingUsers: {},
};

const socketReducer = (state, action) => {
  switch (action.type) {
    case 'SOCKET_CONNECT':
      return {
        ...state,
        socket: action.payload,
        connected: true,
      };
    case 'SOCKET_DISCONNECT':
      return {
        ...state,
        socket: null,
        connected: false,
        onlineUsers: [],
        typingUsers: {},
      };
    case 'SET_ONLINE_USERS':
      return {
        ...state,
        onlineUsers: action.payload,
      };
    case 'USER_ONLINE':
      return {
        ...state,
        onlineUsers: [...state.onlineUsers, action.payload],
      };
    case 'USER_OFFLINE':
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter(userId => userId !== action.payload),
      };
    case 'SET_TYPING':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: {
            ...state.typingUsers[action.payload.conversationId],
            [action.payload.userId]: action.payload.isTyping,
          },
        },
      };
    default:
      return state;
  }
};

export const SocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(socketReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = socketService.connect(user._id);

      socket.on('connect', () => {
        dispatch({ type: 'SOCKET_CONNECT', payload: socket });
      });

      socket.on('disconnect', () => {
        dispatch({ type: 'SOCKET_DISCONNECT' });
      });

      socket.on('onlineUsers', (users) => {
        dispatch({ type: 'SET_ONLINE_USERS', payload: users });
      });

      socket.on('userOnline', (userId) => {
        dispatch({ type: 'USER_ONLINE', payload: userId });
      });

      socket.on('userOffline', (userId) => {
        dispatch({ type: 'USER_OFFLINE', payload: userId });
      });

      socket.on('typing', (data) => {
        dispatch({ type: 'SET_TYPING', payload: data });
      });

      return () => {
        socketService.disconnect();
        dispatch({ type: 'SOCKET_DISCONNECT' });
      };
    }
  }, [isAuthenticated, user]);

  const emitTyping = (conversationId, isTyping) => {
    if (state.socket) {
      state.socket.emit('typing', { conversationId, isTyping });
    }
  };

  const value = {
    ...state,
    emitTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
