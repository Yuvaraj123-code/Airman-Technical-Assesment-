const express = require('express');
const controller = require('../../controllers/user.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { allowRoles } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createInstructorValidation, approveUserValidation } = require('../../validations/user.validation');
const { ROLES } = require('../../utils/constants');

const router = express.Router();

router.use(authMiddleware, allowRoles(ROLES.ADMIN));
router.post('/instructors', createInstructorValidation, validate, controller.createInstructor);
router.patch('/:id/approve', approveUserValidation, validate, controller.approveStudent);
router.get('/', controller.listUsers);

module.exports = router;
