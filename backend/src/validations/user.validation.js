const { body, param } = require('express-validator');

const createInstructorValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const approveUserValidation = [param('id').isString().notEmpty().withMessage('User id is required')];

module.exports = {
  createInstructorValidation,
  approveUserValidation,
};
