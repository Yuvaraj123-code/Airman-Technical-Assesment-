const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createInstructor = asyncHandler(async (req, res) => {
  const instructor = await userService.createInstructor(req.body);
  res.status(201).json(new ApiResponse(201, 'Instructor created', { instructor }));
});

const approveStudent = asyncHandler(async (req, res) => {
  const user = await userService.approveStudent(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Student approved', { user }));
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json(new ApiResponse(200, 'Users fetched', result.items, result.meta));
});

module.exports = {
  createInstructor,
  approveStudent,
  listUsers,
};
