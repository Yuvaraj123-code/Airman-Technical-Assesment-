const prisma = require('../config/database');
const { getPagination } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

const createCourse = (data, userId) =>
  prisma.course.create({
    data: { title: data.title, description: data.description || null, createdBy: userId },
  });

const listCourses = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          {
            modules: {
              some: {
                title: { contains: search, mode: 'insensitive' },
              },
            },
          },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { modules: { include: { lessons: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getCourseById = async (id) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              questions: {
                select: {
                  id: true,
                  prompt: true,
                  options: true,
                },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!course) throw new ApiError(404, 'Course not found');
  return course;
};

const updateCourse = async (id, data) => {
  return prisma.course.update({
    where: { id },
    data: { title: data.title, description: data.description },
  });
};

const createModule = async (courseId, data) => {
  return prisma.module.create({
    data: { courseId, title: data.title, order: Number(data.order || 1) },
  });
};

const createLesson = async (moduleId, data) => {
  return prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      type: data.type,
      content: data.content || null,
    },
  });
};

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  createModule,
  createLesson,
};
