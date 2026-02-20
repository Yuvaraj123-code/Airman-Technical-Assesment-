const express = require('express');
const controller = require('../../controllers/course.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { allowRoles } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createCourseValidation,
  updateCourseValidation,
  createModuleValidation,
  createLessonValidation,
} = require('../../validations/course.validation');
const { ROLES } = require('../../utils/constants');

const router = express.Router();

router.get('/', authMiddleware, controller.listCourses);
router.get('/:id', authMiddleware, controller.getCourseById);
router.post('/', authMiddleware, allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR), createCourseValidation, validate, controller.createCourse);
router.patch('/:id', authMiddleware, allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR), updateCourseValidation, validate, controller.updateCourse);
router.post('/:id/modules', authMiddleware, allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR), createModuleValidation, validate, controller.createModule);
router.post('/modules/:id/lessons', authMiddleware, allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR), createLessonValidation, validate, controller.createLesson);

module.exports = router;
