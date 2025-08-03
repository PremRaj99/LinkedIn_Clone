export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  SHARE: 'share',
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  MESSAGE: 'message',
  JOB_APPLICATION: 'job_application',
  JOB_UPDATE: 'job_update',
  PROFILE_VIEW: 'profile_view',
  MENTION: 'mention',
  TAG: 'tag',
  GROUP_INVITE: 'group_invite',
  GROUP_POST: 'group_post',
  COMPANY_UPDATE: 'company_update',
  POST_APPROVED: 'post_approved',
  POST_REJECTED: 'post_rejected'
};

export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  POLL: 'poll',
  ARTICLE: 'article',
  DOCUMENT: 'document',
  LINK: 'link'
};

export const POST_VISIBILITY = {
  PUBLIC: 'public',
  CONNECTIONS: 'connections',
  PRIVATE: 'private'
};

export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
};

export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  FREELANCE: 'freelance',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary'
};

export const LOCATION_TYPES = {
  ON_SITE: 'on-site',
  REMOTE: 'remote',
  HYBRID: 'hybrid'
};

export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  EXECUTIVE: 'executive'
};

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

export const USER_ROLES = {
  USER: 'user',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
};

export const COMPANY_SIZES = {
  STARTUP: '1-10',
  SMALL: '11-50',
  MEDIUM: '51-200',
  LARGE: '201-1000',
  ENTERPRISE: '1000+'
};

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Communications',
  'Government',
  'Non-profit',
  'Real Estate',
  'Transportation',
  'Energy',
  'Agriculture',
  'Entertainment',
  'Legal',
  'Architecture',
  'Fashion',
  'Food & Beverage',
  'Sports & Recreation'
];

export const SKILLS_CATEGORIES = {
  TECHNICAL: 'Technical',
  SOFT: 'Soft Skills',
  LANGUAGE: 'Languages',
  CERTIFICATION: 'Certifications',
  TOOLS: 'Tools & Software'
};

export const LANGUAGE_PROFICIENCY = {
  ELEMENTARY: 'elementary',
  LIMITED: 'limited',
  PROFESSIONAL: 'professional',
  FULL: 'full',
  NATIVE: 'native'
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  VOICE: 'voice',
  SYSTEM: 'system'
};

export const GROUP_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SECRET: 'secret'
};

export const GROUP_ROLES = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  OWNER: 'owner'
};

export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  LAUGH: 'laugh',
  WOW: 'wow',
  SAD: 'sad',
  ANGRY: 'angry'
};

export const PRIVACY_SETTINGS = {
  PROFILE_VISIBILITY: {
    PUBLIC: 'public',
    CONNECTIONS: 'connections',
    PRIVATE: 'private'
  },
  SHOW_ACTIVITY: 'showActivity',
  SHOW_CONNECTIONS: 'showConnections'
};

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
    VERIFY_EMAIL: '/users/verify-email'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    SEARCH: '/users/search',
    SUGGESTIONS: '/users/suggestions',
    CONNECTIONS: '/users/connections',
    FOLLOW: '/users/follow',
    BLOCK: '/users/block'
  },
  POSTS: {
    CREATE: '/posts',
    GET_FEED: '/posts',
    LIKE: '/posts/:id/like',
    COMMENT: '/posts/:id/comment',
    SHARE: '/posts/:id/share',
    SAVE: '/users/save-post/:id'
  },
  JOBS: {
    CREATE: '/jobs',
    SEARCH: '/jobs',
    APPLY: '/jobs/:id/apply',
    SAVE: '/jobs/:id/save'
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    SEND: '/messages/conversations/:id/messages',
    SEARCH: '/messages/search'
  },
  NOTIFICATIONS: {
    GET: '/notifications',
    MARK_READ: '/notifications/:id/read',
    PREFERENCES: '/notifications/preferences'
  }
};

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  TYPING: 'typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NOTIFICATION: 'notification',
  CALL_INITIATE: 'call_initiate',
  CALL_ACCEPT: 'call_accept',
  CALL_REJECT: 'call_reject'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file.'
};

export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  CONNECTION_SENT: 'Connection request sent!',
  MESSAGE_SENT: 'Message sent successfully!',
  JOB_APPLIED: 'Job application submitted successfully!',
  FILE_UPLOADED: 'File uploaded successfully!'
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{10,}$/,
  URL: /(https?:\/\/[^\s]+)/g,
  HASHTAG: /#[\w]+/g,
  MENTION: /@[\w]+/g,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

export const DATE_FORMATS = {
  SHORT: 'MMM d',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a'
};

export const KEYBOARD_SHORTCUTS = {
  NEW_POST: 'Ctrl+Shift+P',
  SEARCH: 'Ctrl+K',
  NOTIFICATIONS: 'Ctrl+Shift+N',
  MESSAGES: 'Ctrl+Shift+M',
  PROFILE: 'Ctrl+Shift+U'
};
