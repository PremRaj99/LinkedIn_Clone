import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { jobService } from '../services/jobService';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experience, setExperience] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filters = {
          page: currentPage,
          limit: 10,
          ...(searchQuery && { search: searchQuery }),
          ...(location && { location }),
          ...(jobType && { jobType }),
          ...(experience && { experienceLevel: experience })
        };

        const response = await jobService.getJobs(filters);
        setJobs(response.jobs || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    if (currentPage === 1) {
      fetchSavedJobs();
    }
  }, [currentPage, searchQuery, location, jobType, experience]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(location && { location }),
        ...(jobType && { jobType }),
        ...(experience && { experienceLevel: experience })
      };

      const response = await jobService.getJobs(filters);
      setJobs(response.jobs || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await jobService.getSavedJobs();
      const savedJobIds = new Set(response.jobs?.map(job => job._id) || []);
      setSavedJobs(savedJobIds);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobs.has(jobId)) {
        await jobService.unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await jobService.saveJob(jobId);
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      await jobService.applyJob(jobId, {
        coverLetter: '', // You might want to add a modal for this
        resume: null
      });
      // Refresh jobs to update application status
      fetchJobs();
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Trigger useEffect by changing dependencies
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-yellow-100 text-yellow-800',
      'internship': 'bg-purple-100 text-purple-800',
      'freelance': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Jobs</h1>
          <p className="text-gray-600">Discover career opportunities that match your skills and interests</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Job Title/Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title or Keywords
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Software Engineer, Marketing..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State or Remote"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search Jobs
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setLocation('');
                  setJobType('');
                  setExperience('');
                  setCurrentPage(1);
                }}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Job Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Link
                              to={`/jobs/${job._id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                              {job.jobType?.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 mb-2">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            <Link
                              to={`/companies/${job.company?._id}`}
                              className="font-medium hover:text-blue-600 transition-colors"
                            >
                              {job.company?.name || 'Company Name'}
                            </Link>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              {formatSalary(job.salary?.min, job.salary?.max)}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSaveJob(job._id)}
                          className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {savedJobs.has(job._id) ? (
                            <BookmarkSolidIcon className="h-5 w-5 text-blue-600" />
                          ) : (
                            <BookmarkIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {job.skills?.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleApplyJob(job._id)}
                            disabled={job.hasApplied}
                            className={`px-4 py-2 rounded-md transition-colors ${job.hasApplied
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                          >
                            {job.hasApplied ? 'Applied' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-md ${currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-900 mb-1">Frontend Developer</h4>
                    <p className="text-sm text-gray-600 mb-2">Tech Company • Remote</p>
                    <p className="text-xs text-gray-500">Posted 2 days ago</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Search Tips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Search Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Update your profile regularly</li>
                <li>• Use relevant keywords</li>
                <li>• Network with professionals</li>
                <li>• Apply early to new postings</li>
                <li>• Customize your applications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
