const { body } = require('express-validator');

const createQuizQuestionsValidation = [
  body('questions').isArray({ min: 1 }).withMessage('questions must be a non-empty array'),
  body('questions.*.prompt').trim().notEmpty().withMessage('question prompt is required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('question options must have at least 2 choices'),
  body('questions.*.correctAnswerIndex').isInt({ min: 0 }).withMessage('correctAnswerIndex must be >= 0'),
  body('questions').custom((questions) => {
    const invalid = questions.some(
      (question) =>
        !Array.isArray(question.options) ||
        question.correctAnswerIndex < 0 ||
        question.correctAnswerIndex >= question.options.length
    );

    if (invalid) {
      throw new Error('correctAnswerIndex must point to a valid option');
    }

    return true;
  }),
];

module.exports = {
  createQuizQuestionsValidation,
};
