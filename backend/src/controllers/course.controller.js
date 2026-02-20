const courseService = require('../services/course.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, 'Course created', { course }));
});

const listCourses = asyncHandler(async (req, res) => {
  const result = await courseService.listCourses(req.query);
  res.status(200).json(new ApiResponse(200, 'Courses fetched', result.items, result.meta));
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Course fetched', { course }));
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, 'Course updated', { course }));
});

const createModule = asyncHandler(async (req, res) => {
  const moduleItem = await courseService.createModule(req.params.id, req.body);
  res.status(201).json(new ApiResponse(201, 'Module created', { module: moduleItem }));
});

const createLesson = asyncHandler(async (req, res) => {
  const lesson = await courseService.createLesson(req.params.id, req.body);
  res.status(201).json(new ApiResponse(201, 'Lesson created', { lesson }));
});

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  createModule,
  createLesson,
};
