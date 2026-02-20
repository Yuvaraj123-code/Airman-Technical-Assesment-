jest.mock('../../src/config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const bcrypt = require('bcrypt');
const prisma = require('../../src/config/database');
const authService = require('../../src/services/auth.service');

describe('Auth Service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('register hashes password and creates student', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'student@test.com',
      role: 'STUDENT',
      status: 'PENDING',
    });
    const user = await authService.register({ email: 'student@test.com', password: 'secret123' });
    expect(user.email).toBe('student@test.com');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('login fails with wrong password', async () => {
    const hash = await bcrypt.hash('right-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u2',
      email: 'instructor@test.com',
      passwordHash: hash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
    });
    await expect(authService.login({ email: 'instructor@test.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('refresh returns new access token for valid refresh token', async () => {
    const loginHash = await bcrypt.hash('pass1234', 10);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'u3',
      email: 'admin@test.com',
      passwordHash: loginHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    prisma.user.update.mockResolvedValue({});

    const loggedIn = await authService.login({ email: 'admin@test.com', password: 'pass1234' });

    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'u3',
      email: 'admin@test.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      refreshTokenHash: await bcrypt.hash(loggedIn.refreshToken, 10),
    });

    const refreshed = await authService.refresh(loggedIn.refreshToken);
    expect(refreshed.token).toBeDefined();
  });
});
