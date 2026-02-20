const express = require('express');
const controller = require('../../controllers/auth.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { registerValidation, loginValidation, refreshValidation } = require('../../validations/auth.validation');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, controller.register);
router.post('/login', authLimiter, loginValidation, validate, controller.login);
router.post('/refresh', authLimiter, refreshValidation, validate, controller.refresh);
router.post('/logout', authMiddleware, controller.logout);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
