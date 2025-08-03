import React, { createContext, useContext, useReducer, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: true
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          const user = JSON.parse(localStorage.getItem('user'));
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user }
          });
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await loginUser(email, password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await registerUser(name, email, password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
