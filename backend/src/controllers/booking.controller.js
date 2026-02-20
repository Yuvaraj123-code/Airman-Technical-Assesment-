const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createAvailability = asyncHandler(async (req, res) => {
  const availability = await bookingService.createAvailability(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, 'Availability created', { availability }));
});

const listAvailability = asyncHandler(async (req, res) => {
  const result = await bookingService.listAvailability(req.user, req.query);
  res.status(200).json(new ApiResponse(200, 'Availability fetched', result.items, result.meta));
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBookingRequest(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, 'Booking requested', { booking }));
});

const listBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.user, req.query);
  res.status(200).json(new ApiResponse(200, 'Bookings fetched', result.items, result.meta));
});

const approveBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.approveBooking(req.params.id, req.user.id, req.body.instructorId);
  res.status(200).json(new ApiResponse(200, 'Booking approved', { booking }));
});

const completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Booking completed', { booking }));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Booking cancelled', { booking }));
});

module.exports = {
  createAvailability,
  listAvailability,
  createBooking,
  listBookings,
  approveBooking,
  completeBooking,
  cancelBooking,
};
