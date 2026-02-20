const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, 'Registered successfully. Await admin approval.', { user }));
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.status(200).json(new ApiResponse(200, 'Login successful', data));
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.body.refreshToken);
  res.status(200).json(new ApiResponse(200, 'Token refreshed', data));
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.status(200).json(new ApiResponse(200, 'Logout successful'));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  res.status(200).json(new ApiResponse(200, 'Profile fetched', { user }));
});

module.exports = { register, login, refresh, logout, me };
