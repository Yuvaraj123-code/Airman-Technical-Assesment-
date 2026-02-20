const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('Booking integration', () => {
  let adminToken;
  let instructorId;
  let studentToken;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.user.deleteMany();

    const [adminHash, instructorHash, studentHash] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('inst1234', 10),
      bcrypt.hash('stud1234', 10),
    ]);

    await prisma.user.create({
      data: { email: 'admin@test.com', passwordHash: adminHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    const instructor = await prisma.user.create({
      data: { email: 'instructor@test.com', passwordHash: instructorHash, role: 'INSTRUCTOR', status: 'ACTIVE' },
    });
    instructorId = instructor.id;
    await prisma.user.create({
      data: { email: 'student@test.com', passwordHash: studentHash, role: 'STUDENT', status: 'ACTIVE' },
    });

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'admin123',
    });
    adminToken = adminLogin.body.data.token;

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'student@test.com',
      password: 'stud1234',
    });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates booking and rejects overlapping approval', async () => {
    const availability = await request(app)
      .post('/api/v1/bookings/availability')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        startTime: '2026-05-01T09:00:00.000Z',
        endTime: '2026-05-01T10:00:00.000Z',
      });

    const firstBooking = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        instructorId,
        startTime: '2026-05-01T09:00:00.000Z',
        endTime: '2026-05-01T10:00:00.000Z',
      });
    expect(firstBooking.status).toBe(201);

    const approveOne = await request(app)
      .patch(`/api/v1/bookings/${firstBooking.body.data.booking.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ instructorId });
    expect(approveOne.status).toBe(200);

    const secondBooking = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        instructorId,
        startTime: '2026-05-01T09:30:00.000Z',
        endTime: '2026-05-01T10:30:00.000Z',
      });
    expect(secondBooking.status).toBe(201);

    const approveTwo = await request(app)
      .patch(`/api/v1/bookings/${secondBooking.body.data.booking.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ instructorId });
    expect(approveTwo.status).toBe(409);
    expect(availability.status).toBe(403);
  });

  it('filters bookings by weekly date range for calendar view', async () => {
    const weekOne = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        instructorId,
        startTime: '2026-05-11T09:00:00.000Z',
        endTime: '2026-05-11T10:00:00.000Z',
      });

    const weekTwo = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        instructorId,
        startTime: '2026-05-25T09:00:00.000Z',
        endTime: '2026-05-25T10:00:00.000Z',
      });

    expect(weekOne.status).toBe(201);
    expect(weekTwo.status).toBe(201);

    const list = await request(app)
      .get('/api/v1/bookings?from=2026-05-11T00:00:00.000Z&to=2026-05-18T00:00:00.000Z')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].id).toBe(weekOne.body.data.booking.id);
  });
});
