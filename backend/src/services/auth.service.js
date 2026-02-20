const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const { ROLES, USER_STATUS } = require('../utils/constants');

const generateAccessToken = (user) =>
  jwt.sign({ role: user.role }, config.JWT_SECRET, { subject: user.id, expiresIn: config.JWT_EXPIRES_IN });

const generateRefreshToken = (user) =>
  jwt.sign({ type: 'refresh' }, config.REFRESH_TOKEN_SECRET, {
    subject: user.id,
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  });

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  status: user.status,
});

const register = async ({ email, password }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ApiError(409, 'Email already registered');
  const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: ROLES.STUDENT,
      status: USER_STATUS.PENDING,
    },
  });
  return sanitizeUser(user);
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials');
  if (user.status !== USER_STATUS.ACTIVE) throw new ApiError(403, 'User not approved yet');

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHash = await bcrypt.hash(refreshToken, config.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });
  return { token, refreshToken, user: sanitizeUser(user) };
};

const refresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user?.refreshTokenHash) throw new ApiError(401, 'Refresh token not found');
  const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!valid) throw new ApiError(401, 'Invalid refresh token');
  const token = generateAccessToken(user);
  return { token };
};

const logout = async (userId) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
};

const me = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');
  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
