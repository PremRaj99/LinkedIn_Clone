import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import {
  Home,
  Users,
  Briefcase,
  MessageCircle,
  Bell,
  BarChart3,
  Search,
  X,
  Menu,
  Plus
} from 'lucide-react';

// Import components with proper default imports
import SearchModal from './SearchModal';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import CreatePostModal from './CreatePostModal';

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const { onlineCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug user object
  useEffect(() => {
    console.log('Header - Current user:', user);
  }, [user]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      iconSolid: Home,
      exact: true
    },
    {
      name: 'My Network',
      path: '/network',
      icon: Users,
      iconSolid: Users,
      badge: user?.pendingConnections?.length
    },
    {
      name: 'Jobs',
      path: '/jobs',
      icon: Briefcase,
      iconSolid: Briefcase
    },
    {
      name: 'Messaging',
      path: '/messages',
      icon: MessageCircle,
      iconSolid: MessageCircle,
      badge: user?.unreadMessages
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      iconSolid: Bell,
      badge: unreadCount,
      onClick: () => setIsNotificationOpen(!isNotificationOpen)
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      iconSolid: BarChart3
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-2">
            {/* Logo and Search */}
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-2xl font-bold text-linkedin-500 hover:opacity-80 transition-opacity"
                >
                  ProConnect
                </button>
              </div>

              {/* Desktop Search */}
              <div className="hidden md:block ml-6 flex-1 max-w-lg">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for people, jobs, companies..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-linkedin-500 focus:border-linkedin-500 text-sm"
                  />
                </form>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                const IconComponent = isActive ? item.iconSolid : item.icon;

                if (item.name === 'Notifications') {
                  return (
                    <div key={item.name} className="relative dropdown-container">
                      <button
                        onClick={item.onClick}
                        className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${isActive || isNotificationOpen
                          ? 'text-linkedin-500 bg-blue-50'
                          : 'text-gray-600 hover:text-linkedin-500 '
                          }`}
                      >
                        <div className="relative">
                          <IconComponent className="h-6 w-6" />
                          {item.badge > 0 && (
                            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="mt-1">{item.name}</span>
                      </button>

                      {isNotificationOpen && NotificationDropdown && (
                        <NotificationDropdown
                          isOpen={isNotificationOpen}
                          onClose={() => setIsNotificationOpen(false)}
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${isActive
                        ? 'text-linkedin-500 bg-blue-50'
                        : 'text-gray-600 hover:text-linkedin-500'
                      }`
                    }
                  >
                    <div className="relative">
                      <IconComponent className="h-6 w-6" />
                      {item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="mt-1">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Profile and Actions */}
            <div className="flex items-center space-x-2">
              {/* Profile Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={user.avatar || '/images/default-avatar.png'}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-900">Me</div>
                    <div className="text-xs text-gray-500">View profile</div>
                  </div>
                </button>

                {isProfileOpen && ProfileDropdown && (
                  <ProfileDropdown
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    user={user}
                    onLogout={handleLogout}
                  />
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-linkedin-500 focus:border-linkedin-500 text-sm"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  if (item.name === 'Notifications') {
                    return (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-linkedin-500 hover:bg-gray-50 rounded-md"
                      >
                        <item.icon className="h-6 w-6 mr-3" />
                        {item.name}
                        {item.badge > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-base font-medium rounded-md ${isActive
                          ? 'text-linkedin-500 bg-blue-50'
                          : 'text-gray-600 hover:text-linkedin-500 hover:bg-gray-50'
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6 mr-3" />
                      {item.name}
                      {item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Mobile Create Post */}
              <button
                onClick={() => {
                  setIsCreatePostOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-linkedin-500 rounded-md hover:bg-linkedin-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </button>

              {/* Online Users Count */}
              {onlineCount > 0 && (
                <div className="mt-4 px-3 py-2 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-700">
                      {onlineCount} users online
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      {SearchModal && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {CreatePostModal && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
        />
      )}
    </>
  );
};

export default Header;