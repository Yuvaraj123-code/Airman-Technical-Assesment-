const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('Course integration', () => {
  let instructorToken;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.quizAttempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
    const hash = await bcrypt.hash('inst1234', 10);
    await prisma.user.create({
      data: { email: 'instructor2@test.com', passwordHash: hash, role: 'INSTRUCTOR', status: 'ACTIVE' },
    });
    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'instructor2@test.com',
      password: 'inst1234',
    });
    instructorToken = login.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and lists courses with pagination and search', async () => {
    const createRes = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Instrument Rating 101', description: 'Basics' });
    expect(createRes.status).toBe(201);
    const courseId = createRes.body.data.course.id;

    const moduleRes = await request(app)
      .post(`/api/v1/courses/${courseId}/modules`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Navigation', order: 1 });
    expect(moduleRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/v1/courses?search=Instrument&page=1&limit=10')
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);
  });
});
