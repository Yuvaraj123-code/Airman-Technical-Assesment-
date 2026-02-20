const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('Quiz authoring and attempt integration', () => {
  let instructorToken;
  let studentToken;
  let lessonId;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    const [instructorHash, studentHash] = await Promise.all([
      bcrypt.hash('inst1234', 10),
      bcrypt.hash('stud1234', 10),
    ]);

    await prisma.user.create({
      data: { email: 'instructor.quiz@test.com', passwordHash: instructorHash, role: 'INSTRUCTOR', status: 'ACTIVE' },
    });
    await prisma.user.create({
      data: { email: 'student.quiz@test.com', passwordHash: studentHash, role: 'STUDENT', status: 'ACTIVE' },
    });

    const instructorLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'instructor.quiz@test.com',
      password: 'inst1234',
    });
    instructorToken = instructorLogin.body.data.token;

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'student.quiz@test.com',
      password: 'stud1234',
    });
    studentToken = studentLogin.body.data.token;

    const course = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Quiz Course', description: 'Quiz flow' });

    const module = await request(app)
      .post(`/api/v1/courses/${course.body.data.course.id}/modules`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Module 1', order: 1 });

    const lesson = await request(app)
      .post(`/api/v1/modules/${module.body.data.module.id}/lessons`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Quiz 1', type: 'QUIZ' });

    lessonId = lesson.body.data.lesson.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allows instructor to create quiz questions and student to attempt', async () => {
    const createQuestions = await request(app)
      .post(`/api/v1/quizzes/${lessonId}/questions`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        questions: [
          { prompt: '1 + 1?', options: ['1', '2', '3'], correctAnswerIndex: 1 },
          { prompt: '2 + 2?', options: ['3', '4', '5'], correctAnswerIndex: 1 },
        ],
      });

    expect(createQuestions.status).toBe(201);
    expect(createQuestions.body.data.questions.length).toBe(2);

    const ids = createQuestions.body.data.questions.map((question) => question.id);
    const attempt = await request(app)
      .post(`/api/v1/quizzes/${lessonId}/attempt`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: {
          [ids[0]]: 1,
          [ids[1]]: 0,
        },
      });

    expect(attempt.status).toBe(201);
    expect(attempt.body.data.attempt.score).toBe(50);
    expect(attempt.body.data.attempt.incorrectQuestionIds.length).toBe(1);
  });

  it('rejects student from creating quiz questions', async () => {
    const response = await request(app)
      .post(`/api/v1/quizzes/${lessonId}/questions`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        questions: [{ prompt: 'Denied', options: ['A', 'B'], correctAnswerIndex: 0 }],
      });

    expect(response.status).toBe(403);
  });
});
