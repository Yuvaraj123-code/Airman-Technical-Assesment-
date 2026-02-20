const express = require('express');
const controller = require('../../controllers/quiz.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { allowRoles } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const { createQuizQuestionsValidation } = require('../../validations/quiz.validation');

const router = express.Router();

router.use(authMiddleware);
router.post(
  '/:lessonId/questions',
  allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR),
  createQuizQuestionsValidation,
  validate,
  controller.createQuestions
);
router.post('/:lessonId/attempt', allowRoles(ROLES.STUDENT), controller.attemptQuiz);
router.get('/attempts/:attemptId', controller.getAttemptById);
router.get('/my-attempts', allowRoles(ROLES.STUDENT), controller.getMyAttempts);

module.exports = router;
