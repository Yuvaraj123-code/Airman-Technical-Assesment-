const { body } = require('express-validator');
const { LESSON_TYPES } = require('../utils/constants');

const createCourseValidation = [body('title').trim().notEmpty().withMessage('Title is required')];
const updateCourseValidation = [body('title').optional().trim().notEmpty()];
const createModuleValidation = [body('title').trim().notEmpty().withMessage('Module title is required')];
const createLessonValidation = [
  body('title').trim().notEmpty().withMessage('Lesson title is required'),
  body('type').isIn(Object.values(LESSON_TYPES)).withMessage('Invalid lesson type'),
];

module.exports = {
  createCourseValidation,
  updateCourseValidation,
  createModuleValidation,
  createLessonValidation,
};
