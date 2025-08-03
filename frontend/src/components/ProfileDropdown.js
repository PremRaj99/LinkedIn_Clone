import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  BarChart3,
  Building2,
  Users,
  Bookmark,
  HelpCircle,
  LogOut
} from 'lucide-react';

const ProfileDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const menuItems = [
    {
      icon: User,
      label: 'View Profile',
      action: () => {
        console.log('ProfileDropdown - Navigating to profile with user ID:', user.id);
        navigate(`/profile/${user.id}`);
      },
    },
    {
      icon: Settings,
      label: 'Settings & Privacy',
      action: () => navigate('/settings'),
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      action: () => navigate('/analytics'),
      visible: user.role === 'admin' || user.isPremium
    },
    {
      icon: Building2,
      label: 'Company Pages',
      action: () => navigate('/companies'),
      visible: user.companies?.length > 0 || user.role === 'company_admin'
    },
    {
      icon: Users,
      label: 'Groups',
      action: () => navigate('/groups'),
    },
    {
      icon: Bookmark,
      label: 'Saved Posts',
      action: () => navigate('/saved'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => navigate('/help'),
    }
  ].filter(item => item.visible !== false);

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

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar || '/images/default-avatar.png'}
            alt={user.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {user.headline || user.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleItemClick(() => navigate(`/profile/${user.id}`))}
          className="mt-3 w-full text-center py-2 text-sm font-medium text-linkedin-blue border border-linkedin-blue rounded-md hover:bg-blue-50 transition-colors"
        >
          View Profile
        </button>
      </div>

      {/* Account Section */}
      <div className="py-2">
        <div className="px-4 py-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Account
          </h4>
        </div>

        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item.action)}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <IconComponent className="text-gray-400 mr-3 h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Premium Section (if applicable) */}
      {!user.isPremium && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Try Premium for free
              </h4>
              <p className="text-xs text-gray-600">
                Unlock exclusive features
              </p>
            </div>
            <button
              onClick={() => handleItemClick(() => navigate('/premium'))}
              className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-md hover:bg-yellow-300 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Admin Section */}
      {user.role === 'admin' && (
        <div className="py-2 border-t border-gray-200">
          <div className="px-4 py-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Administration
            </h4>
          </div>

          <button
            onClick={() => handleItemClick(() => navigate('/admin'))}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="text-gray-400 mr-3 h-4 w-4" />
            Admin Dashboard
          </button>
        </div>
      )}

      {/* Sign Out */}
      <div className="py-2 border-t border-gray-200">
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="text-red-500 mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;