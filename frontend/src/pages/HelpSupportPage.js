import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const HelpSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpenIcon },
    { id: 'account', label: 'Account & Profile', icon: UserGroupIcon },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
    { id: 'posting', label: 'Posts & Content', icon: DocumentTextIcon },
    { id: 'connections', label: 'Connections', icon: UserGroupIcon },
    { id: 'jobs', label: 'Jobs & Applications', icon: DocumentTextIcon },
    { id: 'technical', label: 'Technical Issues', icon: ExclamationTriangleIcon }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'You can update your profile by clicking on your profile picture in the top navigation, then selecting "Edit Profile". Here you can modify your name, headline, bio, experience, education, and other details.'
    },
    {
      id: 2,
      category: 'privacy',
      question: 'How do I control who can see my profile?',
      answer: 'Go to Settings > Privacy & Security to control your profile visibility. You can choose to make your profile public, visible to connections only, or private. You can also control specific elements like your activity, connections list, and contact information.'
    },
    {
      id: 3,
      category: 'posting',
      question: 'How do I create and share posts?',
      answer: 'Click the "Start a post" button on your home feed or profile page. You can share text, images, videos, documents, and create polls. Use hashtags to increase visibility and tag relevant connections to engage your network.'
    },
    {
      id: 4,
      category: 'connections',
      question: 'How do I connect with other professionals?',
      answer: 'You can send connection requests by visiting someone\'s profile and clicking "Connect". You can also discover people through the "My Network" page, import contacts, or use the search feature to find professionals in your industry.'
    },
    {
      id: 5,
      category: 'jobs',
      question: 'How do I apply for jobs?',
      answer: 'Visit the Jobs page to browse opportunities. Click on any job to view details and click "Apply" to submit your application. Make sure your profile is complete and upload an updated resume for better chances.'
    },
    {
      id: 6,
      category: 'settings',
      question: 'How do I manage my notification preferences?',
      answer: 'Go to Settings > Notifications to customize what notifications you receive via email, push notifications, and in-app alerts. You can control notifications for connections, messages, job alerts, and more.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'Why can\'t I upload images or videos?',
      answer: 'Check that your file size is under 10MB and in a supported format (JPG, PNG, GIF for images; MP4, MOV for videos). If issues persist, try clearing your browser cache or using a different browser.'
    },
    {
      id: 8,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to Settings > Account > Close Account. Please note that this action is permanent and cannot be undone. All your data, posts, and connections will be permanently removed.'
    }
  ];

  const supportOptions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: ChatBubbleLeftRightIcon,
      action: 'Start Chat',
      available: 'Available 24/7'
    },
    {
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      icon: EnvelopeIcon,
      action: 'Send Email',
      available: 'support@comm-app.com'
    },
    {
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      icon: PhoneIcon,
      action: 'Call Now',
      available: '1-800-COMM-APP'
    },
    {
      title: 'Report Issue',
      description: 'Report bugs or technical problems',
      icon: ExclamationTriangleIcon,
      action: 'Report',
      available: 'Response within 48 hours'
    }
  ];

  const quickLinks = [
    'Getting Started Guide',
    'Privacy Policy',
    'Terms of Service',
    'Community Guidelines',
    'Account Recovery',
    'Mobile App Help',
    'API Documentation',
    'Status Page'
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <QuestionMarkCircleIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the help you need to make the most of your professional network
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mb-2">
                    {option.action}
                  </button>
                  <p className="text-xs text-gray-500">{option.available}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-colors ${selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Frequently Asked Questions
                  {selectedCategory !== 'all' && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      - {categories.find(c => c.id === selectedCategory)?.label}
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 mt-2">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'} found
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <div key={faq.id} className="p-6">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-lg font-medium text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        {expandedFaq === faq.id ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      {expandedFaq === faq.id && (
                        <div className="mt-4 text-gray-600">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or selecting a different category.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Resources */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Still need help?</h3>
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for? Our support team is here to help you succeed.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Contact Support
                </button>
                <button className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                  Schedule Call
                </button>
                <button className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                  Join Community Forum
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
