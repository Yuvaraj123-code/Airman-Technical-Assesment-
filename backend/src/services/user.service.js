const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const config = require('../config/env');
const { getPagination } = require('../utils/helpers');
const { ROLES, USER_STATUS } = require('../utils/constants');
const ApiError = require('../utils/ApiError');

const createInstructor = async ({ email, password }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ApiError(409, 'Email already exists');
  const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
  return prisma.user.create({
    data: { email, passwordHash, role: ROLES.INSTRUCTOR, status: USER_STATUS.ACTIVE },
    select: { id: true, email: true, role: true, status: true, createdAt: true },
  });
};

const approveStudent = async (id) => {
  return prisma.user.update({
    where: { id },
    data: { status: USER_STATUS.ACTIVE },
    select: { id: true, email: true, role: true, status: true },
  });
};

const listUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = query.search
    ? { email: { contains: query.search, mode: 'insensitive' } }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

module.exports = {
  createInstructor,
  approveStudent,
  listUsers,
};
