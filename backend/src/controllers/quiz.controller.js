const quizService = require('../services/quiz.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const attemptQuiz = asyncHandler(async (req, res) => {
  const attempt = await quizService.attemptQuiz(req.params.lessonId, req.user.id, req.body.answers || {});
  res.status(201).json(new ApiResponse(201, 'Quiz attempted', { attempt }));
});

const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await quizService.getAttemptById(req.params.attemptId, req.user);
  res.status(200).json(new ApiResponse(200, 'Attempt fetched', { attempt }));
});

const getMyAttempts = asyncHandler(async (req, res) => {
  const result = await quizService.getMyAttempts(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, 'Attempts fetched', result.items, result.meta));
});

const createQuestions = asyncHandler(async (req, res) => {
  const questions = await quizService.addQuizQuestions(req.params.lessonId, req.body.questions);
  res.status(201).json(new ApiResponse(201, 'Quiz questions created', { questions }));
});

module.exports = {
  attemptQuiz,
  getAttemptById,
  getMyAttempts,
  createQuestions,
};
