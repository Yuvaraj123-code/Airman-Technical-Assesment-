const ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
};

const USER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
};

const LESSON_TYPES = {
  TEXT: 'TEXT',
  QUIZ: 'QUIZ',
};

const BOOKING_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['create:instructor', 'approve:student', 'approve:booking', 'view:all'],
  [ROLES.INSTRUCTOR]: ['create:content', 'assign:quiz', 'manage:availability', 'complete:booking'],
  [ROLES.STUDENT]: ['view:content', 'attempt:quiz', 'request:booking'],
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  USER_STATUS,
  LESSON_TYPES,
  BOOKING_STATUS,
  PERMISSIONS,
  PAGINATION,
};
