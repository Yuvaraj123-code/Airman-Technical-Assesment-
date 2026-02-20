const express = require('express');
const authRoutes = require('./v1/auth.routes');
const userRoutes = require('./v1/user.routes');
const courseRoutes = require('./v1/course.routes');
const bookingRoutes = require('./v1/booking.routes');
const quizRoutes = require('./v1/quiz.routes');
const auditRoutes = require('./v1/audit.routes');
const courseController = require('../controllers/course.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createLessonValidation } = require('../validations/course.validation');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.post(
  '/modules/:id/lessons',
  authMiddleware,
  allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR),
  createLessonValidation,
  validate,
  courseController.createLesson
);
router.use('/bookings', bookingRoutes);
router.use('/quizzes', quizRoutes);
router.use('/audit', auditRoutes);

module.exports = router;
