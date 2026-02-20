const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('Auth integration', () => {
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('register, login, me flow works', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      email: 'student1@test.com',
      password: 'secret123',
    });
    expect(registerRes.status).toBe(201);

    const user = await prisma.user.findUnique({ where: { email: 'student1@test.com' } });
    await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'student1@test.com',
      password: 'secret123',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.data.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('student1@test.com');
  });
});
