import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateAvatar } from '../services/authService';
import { getUserPosts } from '../services/postService';
import EditProfileModal from '../components/EditProfileModal';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Use current user's ID if userId is undefined (when viewing own profile)
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);

      // Check if we have a valid target user ID
      if (!targetUserId) {
        setError('User ID not found');
        return;
      }

      console.log('Fetching profile for targetUserId:', targetUserId);
      const [profileData, postsData] = await Promise.all([
        getUserProfile(targetUserId),
        getUserPosts(targetUserId)
      ]);

      console.log('Profile data received:', profileData);
      console.log('Posts data received:', postsData);
      setProfile(profileData);
      setPosts(postsData.posts || postsData || []); // Handle different response formats
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile');
      setPosts([]); // Ensure posts is always an array even on error
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const updatedUser = await updateAvatar(file, token);
      setProfile(updatedUser);

      if (isOwnProfile) {
        updateUser(updatedUser);
      }
    } catch (error) {
      setError('Failed to update avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      setError('');
      const { updateProfile } = await import('../services/authService');
      const response = await updateProfile(updatedData);

      // Update local state
      setProfile(response.user || response);

      if (isOwnProfile) {
        updateUser(response.user || response);
      }

      setShowEditModal(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
              {/* Banner */}
              <div
                className="h-48 lg:h-56 bg-gradient-to-br from-linkedin-500 via-linkedin-600 to-linkedin-700 relative overflow-hidden"
                style={{
                  backgroundImage: profile.bannerImage ? `url(${profile.bannerImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>

              {/* Profile Info */}
              <div className="relative px-6 lg:px-8 pb-8">
                {/* Avatar */}
                <div className="absolute -top-16 left-6 lg:left-8">
                  <div className="relative group">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name || 'User'}
                        className="w-32 h-32 lg:w-36 lg:h-36 rounded-full border-4 border-white shadow-xl object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-linkedin-500 to-linkedin-600 flex items-center justify-center text-white text-4xl lg:text-5xl font-bold hover:scale-105 transition-transform duration-300">
                        {profile.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Edit Photo Icon - Only for authenticated user's own profile */}
                    {isOwnProfile && currentUser && currentUser.id === targetUserId && (
                      <div className="absolute -bottom-2 -right-2">
                        <label htmlFor="avatar-upload" className="relative cursor-pointer group/icon">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-linkedin-500 hover:bg-linkedin-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl">
                            {uploading ? (
                              <svg className="animate-spin w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            {uploading ? 'Uploading...' : 'Change Photo'}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>

                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="pt-20 lg:pt-24">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div className="flex-1 lg:pr-8">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                        {profile.name || 'Unknown User'}
                      </h1>

                      {profile.headline && (
                        <p className="text-xl text-gray-700 mb-4 font-medium leading-relaxed">
                          {profile.headline}
                        </p>
                      )}

                      <div className="space-y-2 mb-6">
                        {profile.location && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">{profile.location}</span>
                          </div>
                        )}

                        {profile.industry && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">{profile.industry}</span>
                          </div>
                        )}

                        {profile.website && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-linkedin-500 hover:text-linkedin-600 hover:underline transition-colors"
                            >
                              {profile.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {profile.bio && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border-l-4 border-linkedin-500 mb-6">
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {profile.bio}
                          </p>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-linkedin-500">
                            {profile.connections?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Connections</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-linkedin-500">
                            {profile.followers?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-linkedin-500">
                            {profile.following?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Following</div>
                        </div>
                      </div>
                    </div>

                    {isOwnProfile && currentUser && currentUser.id === targetUserId && (
                      <div className="flex-shrink-0 mt-6 lg:mt-0">
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="inline-flex items-center px-6 py-3 bg-linkedin-500 text-white font-semibold rounded-xl hover:bg-linkedin-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-linkedin-500 to-linkedin-600 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-linkedin-500 to-linkedin-600 text-white text-sm font-semibold rounded-full hover:from-linkedin-600 hover:to-linkedin-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-linkedin-500 to-linkedin-600 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
                </div>
                <div className="space-y-6">
                  {profile.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="relative p-6 border-2 border-gray-200 rounded-xl hover:border-linkedin-500 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-linkedin-500 to-linkedin-600 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-linkedin-600 transition-colors">
                          {exp.title}
                        </h3>
                        <svg className="w-6 h-6 text-gray-300 group-hover:text-linkedin-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2m8 0H8m8 0v6m-8-6v6m8 0v6H8v-6" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-linkedin-600 mb-2">{exp.company}</p>
                      <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full mb-3">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3M8 7v5h8V7" />
                        </svg>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                </div>
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div
                      key={index}
                      className="relative p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg group"
                    >
                      <div className="absolute right-6 top-6 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                        🎓
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                        {edu.degree}
                      </h3>
                      <p className="text-lg font-semibold text-green-600 mb-2">{edu.school}</p>
                      <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full mb-3">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3M8 7v5h8V7" />
                        </svg>
                        {edu.startYear} - {edu.endYear}
                      </div>
                      {edu.description && (
                        <p className="text-gray-700 leading-relaxed">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Languages</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.languages.map((lang, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">🌐</span>
                        <span className="font-semibold">{lang.name}</span>
                      </div>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Profile
                </button>
                <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Profile
                </button>
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Strength</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Profile Completeness</span>
                    <span className="font-semibold text-linkedin-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-linkedin-500 to-linkedin-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Add more skills to reach 100% completion!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-linkedin-500 to-linkedin-600 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isOwnProfile ? 'Your Posts' : `${profile.name || 'User'}'s Posts`}
              </h2>
            </div>

            {!Array.isArray(posts) || posts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xl text-gray-500 mb-2">No posts yet</p>
                <p className="text-gray-400">
                  {isOwnProfile ? "Start sharing your thoughts and experiences!" : "This user hasn't posted anything yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <div key={post._id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-linkedin-500 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3M8 7v5h8V7" />
                        </svg>
                        {formatDate(post.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-800 text-lg leading-relaxed">{post.content}</p>
                      {post.image && (
                        <div className="rounded-xl overflow-hidden">
                          <img
                            src={post.image}
                            alt="Post content"
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center animate-bounce">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditModal(false)}
            onSave={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;