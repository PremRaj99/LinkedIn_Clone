import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BriefcaseIcon,
  MapPinIcon,
  GlobeAltIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { companyService } from '../services/companyService';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [location, setLocation] = useState('');

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        ...(searchQuery && { search: searchQuery }),
        ...(industry && { industry }),
        ...(companySize && { size: companySize }),
        ...(location && { location })
      };
      const response = await companyService.getCompanies(filters);
      setCompanies(response.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, industry, companySize, location]);

  const fetchFollowedCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyService.getFollowedCompanies();
      setFollowedCompanies(response.companies || []);
    } catch (error) {
      console.error('Error fetching followed companies:', error);
      setFollowedCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchCompanies();
    } else {
      fetchFollowedCompanies();
    }
  }, [activeTab, fetchCompanies, fetchFollowedCompanies]);

  const handleFollowCompany = async (companyId) => {
    try {
      await companyService.followCompany(companyId);
      // Update the companies list
      setCompanies(prev =>
        prev.map(company =>
          company._id === companyId
            ? { ...company, isFollowing: true, followerCount: (company.followerCount || 0) + 1 }
            : company
        )
      );
    } catch (error) {
      console.error('Error following company:', error);
    }
  };

  const handleUnfollowCompany = async (companyId) => {
    try {
      await companyService.unfollowCompany(companyId);
      // Update the companies list
      setCompanies(prev =>
        prev.map(company =>
          company._id === companyId
            ? { ...company, isFollowing: false, followerCount: Math.max((company.followerCount || 0) - 1, 0) }
            : company
        )
      );
      // Remove from followed companies if on that tab
      if (activeTab === 'following') {
        setFollowedCompanies(prev => prev.filter(c => c._id !== companyId));
      }
    } catch (error) {
      console.error('Error unfollowing company:', error);
    }
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Media & Entertainment',
    'Real Estate',
    'Transportation',
    'Energy',
    'Consulting',
    'Non-profit'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1001-5000 employees',
    '5001+ employees'
  ];

  const filteredCompanies = activeTab === 'discover' ? companies : followedCompanies;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <Link
              to="/companies/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Company
            </Link>
          </div>
          <p className="text-gray-600">Discover and follow companies to stay updated with their latest news and job opportunities</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'discover'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Discover Companies
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'following'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Following ({followedCompanies.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Companies
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Company name or keyword..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sizes</option>
                {companySizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'discover' ? 'No companies found' : 'Not following any companies yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'discover'
                ? 'Try adjusting your search criteria to find relevant companies.'
                : 'Start following companies to stay updated with their latest news and job openings.'
              }
            </p>
            {activeTab === 'following' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Discover Companies
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                {/* Company Header */}
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={company.logo || '/images/default-company.png'}
                      alt={company.name}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/companies/${company._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {company.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {company.industry}
                      </p>

                      {/* Rating */}
                      {company.rating && (
                        <div className="flex items-center mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              i < Math.floor(company.rating) ? (
                                <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                              ) : (
                                <StarIcon key={i} className="h-4 w-4 text-gray-300" />
                              )
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            {company.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {company.description}
                  </p>

                  {/* Company Details */}
                  <div className="space-y-2 mb-4">
                    {company.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {company.location}
                      </div>
                    )}

                    {company.size && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        {company.size}
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <GlobeAltIcon className="h-4 w-4 mr-2" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      {company.followerCount || 0} followers
                    </div>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {company.jobCount || 0} open jobs
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {company.isFollowing ? (
                      <button
                        onClick={() => handleUnfollowCompany(company._id)}
                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowCompany(company._id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Follow
                      </button>
                    )}

                    <Link
                      to={`/companies/${company._id}/jobs`}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      View Jobs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Companies */}
        {activeTab === 'discover' && !loading && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Companies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-3">
                    <BuildingOfficeIcon className="h-10 w-10 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Tech Corp</h3>
                      <p className="text-xs text-gray-500">Technology</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Leading technology company focused on innovation
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>1.2k followers</span>
                    <span>15 jobs</span>
                  </div>
                  <button className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
