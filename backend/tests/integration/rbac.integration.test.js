const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('RBAC negative coverage', () => {
  let adminToken;
  let instructorToken;
  let studentToken;

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

    const [adminHash, instructorHash, studentHash] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('inst1234', 10),
      bcrypt.hash('stud1234', 10),
    ]);

    await prisma.user.create({
      data: { email: 'admin.rbac@test.com', passwordHash: adminHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    await prisma.user.create({
      data: { email: 'instructor.rbac@test.com', passwordHash: instructorHash, role: 'INSTRUCTOR', status: 'ACTIVE' },
    });
    await prisma.user.create({
      data: { email: 'student.rbac@test.com', passwordHash: studentHash, role: 'STUDENT', status: 'ACTIVE' },
    });

    const [adminLogin, instructorLogin, studentLogin] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({ email: 'admin.rbac@test.com', password: 'admin123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'instructor.rbac@test.com', password: 'inst1234' }),
      request(app).post('/api/v1/auth/login').send({ email: 'student.rbac@test.com', password: 'stud1234' }),
    ]);

    adminToken = adminLogin.body.data.token;
    instructorToken = instructorLogin.body.data.token;
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('blocks non-admin from admin-only user management endpoints', async () => {
    const studentCreateInstructor = await request(app)
      .post('/api/v1/users/instructors')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ email: 'x@test.com', password: 'secret123' });

    const instructorListUsers = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(studentCreateInstructor.status).toBe(403);
    expect(instructorListUsers.status).toBe(403);
  });

  it('blocks non-student from student-only quiz attempts', async () => {
    const response = await request(app)
      .post('/api/v1/quizzes/non-existent-lesson/attempt')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ answers: {} });

    expect(response.status).toBe(403);
  });
});
