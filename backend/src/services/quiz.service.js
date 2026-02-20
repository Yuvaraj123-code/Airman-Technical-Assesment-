const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/helpers');
const { LESSON_TYPES } = require('../utils/constants');

const calculateQuizResult = (questions, answers) => {
  let correct = 0;
  const incorrectQuestionIds = [];
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswerIndex) {
      correct += 1;
    } else {
      incorrectQuestionIds.push(q.id);
    }
  });
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return { score, incorrectQuestionIds };
};

const attemptQuiz = async (lessonId, studentId, answers) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { questions: true },
  });
  if (!lesson) throw new ApiError(404, 'Lesson not found');
  const { score, incorrectQuestionIds } = calculateQuizResult(lesson.questions, answers || {});
  return prisma.quizAttempt.create({
    data: { lessonId, studentId, answers: answers || {}, score, incorrectQuestionIds },
  });
};

const getAttemptById = async (attemptId, user) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { lesson: true },
  });
  if (!attempt) throw new ApiError(404, 'Attempt not found');
  if (user.role === 'STUDENT' && attempt.studentId !== user.id) throw new ApiError(403, 'Forbidden');
  return attempt;
};

const getMyAttempts = async (studentId, query) => {
  const { page, limit, skip } = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { studentId },
      include: { lesson: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quizAttempt.count({ where: { studentId } }),
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const addQuizQuestions = async (lessonId, questions = []) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, type: true },
  });

  if (!lesson) throw new ApiError(404, 'Lesson not found');
  if (lesson.type !== LESSON_TYPES.QUIZ) throw new ApiError(400, 'Questions can only be added to QUIZ lessons');

  const createdQuestions = await prisma.$transaction(
    questions.map((question) =>
      prisma.quizQuestion.create({
        data: {
          lessonId,
          prompt: question.prompt,
          options: question.options,
          correctAnswerIndex: question.correctAnswerIndex,
        },
      })
    )
  );

  return createdQuestions;
};

module.exports = {
  calculateQuizResult,
  attemptQuiz,
  getAttemptById,
  getMyAttempts,
  addQuizQuestions,
};
