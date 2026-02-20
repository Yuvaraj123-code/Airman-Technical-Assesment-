process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://airman_user:airman_password@localhost:5432/airman_test';
