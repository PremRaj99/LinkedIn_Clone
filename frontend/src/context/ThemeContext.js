import React, { createContext, useContext, useReducer } from 'react';

const ThemeContext = createContext();

const initialState = {
  darkMode: false,
  theme: 'light',
};

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
        theme: !state.darkMode ? 'dark' : 'light',
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        darkMode: action.payload === 'dark',
      };
    default:
      return state;
  }
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, () => {
    const savedTheme = localStorage.getItem('theme');
    return {
      darkMode: savedTheme === 'dark',
      theme: savedTheme || 'light',
    };
  });

  const toggleDarkMode = () => {
    const newTheme = state.darkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  // Apply theme on mount
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const value = {
    ...state,
    toggleDarkMode,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
