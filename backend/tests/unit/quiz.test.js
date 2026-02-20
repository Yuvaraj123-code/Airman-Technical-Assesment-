const { calculateQuizResult } = require('../../src/services/quiz.service');
const { quizQuestions } = require('../fixtures/test-data');

describe('Quiz scoring', () => {
  it('calculates score and incorrect questions', () => {
    const answers = { q1: 1, q2: 3, q3: 2 };
    const result = calculateQuizResult(quizQuestions, answers);
    expect(result.score).toBe(67);
    expect(result.incorrectQuestionIds).toEqual(['q2']);
  });
});
