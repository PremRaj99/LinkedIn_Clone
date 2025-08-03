import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account Settings
    account: {
      email: user?.email || '',
      phone: user?.phone || '',
      language: 'english',
      timezone: 'UTC-8',
      emailVerified: user?.emailVerified || false,
      phoneVerified: user?.phoneVerified || false
    },
    // Privacy Settings
    privacy: {
      profileVisibility: 'public', // public, connections, private
      showActivity: true,
      showConnections: true,
      showEmail: false,
      showPhone: false,
      allowMessages: 'everyone', // everyone, connections, nobody
      allowConnectionRequests: true,
      searchableByEmail: true,
      searchableByPhone: false
    },
    // Notification Settings
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      connectionRequests: true,
      messages: true,
      postLikes: false,
      postComments: true,
      jobAlerts: true,
      weeklyDigest: true,
      promotionalEmails: false
    },
    // Security Settings
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      activeDevices: [],
      passwordLastChanged: new Date('2024-01-15'),
      downloadData: false,
      deleteAccount: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Load user settings
    if (user) {
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          email: user.email || '',
          phone: user.phone || '',
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false
        }
      }));
    }
  }, [user]);

  const tabs = [
    { id: 'account', label: 'Account', icon: CogIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async (category) => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setMessage({
        text: `${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`,
        type: 'success'
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({
        text: 'Failed to save settings. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex">
              <input
                type="email"
                value={settings.account.email}
                onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md">
                {settings.account.emailVerified ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </div>
            {!settings.account.emailVerified && (
              <p className="text-sm text-yellow-600 mt-1">Email not verified</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex">
              <input
                type="tel"
                value={settings.account.phone}
                onChange={(e) => handleSettingChange('account', 'phone', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md">
                {settings.account.phoneVerified ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.account.language}
            onChange={(e) => handleSettingChange('account', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="german">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.account.timezone}
            onChange={(e) => handleSettingChange('account', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UTC-8">Pacific Time (UTC-8)</option>
            <option value="UTC-7">Mountain Time (UTC-7)</option>
            <option value="UTC-6">Central Time (UTC-6)</option>
            <option value="UTC-5">Eastern Time (UTC-5)</option>
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => saveSettings('account')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Account Settings'}
        </button>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <EyeIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can see your profile
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">Everyone</option>
                <option value="connections">My connections only</option>
                <option value="private">Only me</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Show my connections list</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showConnections}
                onChange={(e) => handleSettingChange('privacy', 'showConnections', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Show my activity status</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showActivity}
                onChange={(e) => handleSettingChange('privacy', 'showActivity', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Show my email address</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Show my phone number</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showPhone}
                onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => saveSettings('privacy')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Push Notifications</span>
              <p className="text-xs text-gray-500">Receive push notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Connection Requests</span>
              <p className="text-xs text-gray-500">New connection requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.connectionRequests}
                onChange={(e) => handleSettingChange('notifications', 'connectionRequests', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Messages</span>
              <p className="text-xs text-gray-500">New direct messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.messages}
                onChange={(e) => handleSettingChange('notifications', 'messages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Job Alerts</span>
              <p className="text-xs text-gray-500">New job opportunities matching your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.jobAlerts}
                onChange={(e) => handleSettingChange('notifications', 'jobAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => saveSettings('notifications')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${settings.security.twoFactorEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
            >
              {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm font-medium text-gray-700">Change Password</span>
                <p className="text-xs text-gray-500">
                  Last changed {settings.security.passwordLastChanged.toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
              Change
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <TrashIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm font-medium text-gray-700">Download Your Data</span>
                <p className="text-xs text-gray-500">Get a copy of your data</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Request
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <span className="text-sm font-medium text-red-700">Delete Account</span>
                <p className="text-xs text-red-600">Permanently delete your account and all data</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => saveSettings('security')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CogIcon className="h-8 w-8 mr-3" />
            Settings & Privacy
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings, privacy preferences, and security options
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'account' && renderAccountSettings()}
              {activeTab === 'privacy' && renderPrivacySettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
