import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    location: profile.location || '',
    industry: profile.industry || '',
    website: profile.website || '',
    skills: profile.skills || [],
    experience: profile.experience || [],
    education: profile.education || [],
    languages: profile.languages || []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    school: '',
    startYear: '',
    endYear: '',
    description: ''
  });
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    proficiency: 'elementary'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience }]
      }));
      setNewExperience({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
    }
  };

  const handleRemoveExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.school) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }));
      setNewEducation({
        degree: '',
        school: '',
        startYear: '',
        endYear: '',
        description: ''
      });
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.name) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { ...newLanguage }]
      }));
      setNewLanguage({
        name: '',
        proficiency: 'Beginner'
      });
    }
  };

  const handleRemoveLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await onSave(formData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-linkedin-500 to-linkedin-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <div className="flex space-x-0 overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic Info', icon: '👤' },
              { id: 'skills', label: 'Skills', icon: '⚡' },
              { id: 'experience', label: 'Experience', icon: '💼' },
              { id: 'education', label: 'Education', icon: '🎓' },
              { id: 'languages', label: 'Languages', icon: '🌐' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-colors ${activeTab === tab.id
                  ? 'border-linkedin-500 text-linkedin-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., New York, NY"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer at Tech Company"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://your-website.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Skills</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-6 py-3 bg-linkedin-500 text-white font-semibold rounded-xl hover:bg-linkedin-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-linkedin-500 to-linkedin-600 text-white rounded-full group hover:from-linkedin-600 hover:to-linkedin-700 transition-all">
                      <span className="font-medium">{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Experience</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Start Date (e.g., Jan 2020)"
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                        disabled={newExperience.current}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors disabled:bg-gray-100"
                      />
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExperience.current}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked }))}
                        className="w-4 h-4 text-linkedin-500 bg-gray-100 border-gray-300 rounded focus:ring-linkedin-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">I currently work here</span>
                    </label>
                    <textarea
                      placeholder="Description"
                      value={newExperience.description}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                    >
                      Add Experience
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="p-6 border-2 border-gray-200 rounded-xl hover:border-linkedin-500 transition-colors bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-gray-900">{exp.title} at {exp.company}</h5>
                          <p className="text-gray-600 mb-2">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                          {exp.description && <p className="text-gray-700">{exp.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(index)}
                          className="ml-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Education</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="School"
                        value={newEducation.school}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, school: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Start Year"
                        value={newEducation.startYear}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, startYear: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="End Year"
                        value={newEducation.endYear}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, endYear: e.target.value }))}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newEducation.description}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                    >
                      Add Education
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-colors bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-gray-900">{edu.degree}</h5>
                          <p className="text-green-600 font-medium mb-1">{edu.school}</p>
                          <p className="text-gray-600 mb-2">{edu.startYear} - {edu.endYear}</p>
                          {edu.description && <p className="text-gray-700">{edu.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(index)}
                          className="ml-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'languages' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Language</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Language"
                      value={newLanguage.name}
                      onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    />
                    <select
                      value={newLanguage.proficiency}
                      onChange={(e) => setNewLanguage(prev => ({ ...prev, proficiency: e.target.value }))}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-linkedin-500 focus:ring-2 focus:ring-linkedin-500 focus:ring-opacity-20 transition-colors"
                    >
                      <option value="elementary">Elementary</option>
                      <option value="limited">Limited Working</option>
                      <option value="professional">Professional Working</option>
                      <option value="full">Full Professional</option>
                      <option value="native">Native</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">🌐</span>
                        <span className="font-semibold">{lang.name} - {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className="ml-3 px-3 py-1 bg-white bg-opacity-20 text-white text-sm font-medium rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          {errors.submit && (
            <div className="flex items-center text-red-600 text-sm font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.submit}
            </div>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-6 py-3 font-semibold rounded-xl transition-colors flex items-center ${isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-linkedin-500 text-white hover:bg-linkedin-600'
                }`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;