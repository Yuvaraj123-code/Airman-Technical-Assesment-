const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { BOOKING_STATUS, ROLES } = require('../utils/constants');
const { getPagination } = require('../utils/helpers');

const hasBookingConflict = async ({ instructorId, startTime, endTime, excludeId }) => {
  const where = {
    instructorId,
    status: { in: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.COMPLETED] },
    startTime: { lt: new Date(endTime) },
    endTime: { gt: new Date(startTime) },
  };
  if (excludeId) where.id = { not: excludeId };
  const exists = await prisma.booking.findFirst({ where });
  return Boolean(exists);
};

const createAvailability = async (instructorId, payload) => {
  return prisma.availability.create({
    data: { instructorId, startTime: new Date(payload.startTime), endTime: new Date(payload.endTime) },
  });
};

const listAvailability = async (user, query) => {
  const { page, limit, skip } = getPagination(query);
  const where = user.role === ROLES.INSTRUCTOR ? { instructorId: user.id } : {};
  const [items, total] = await Promise.all([
    prisma.availability.findMany({ where, skip, take: limit, orderBy: { startTime: 'asc' } }),
    prisma.availability.count({ where }),
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const createBookingRequest = async (studentId, payload) => {
  let instructorId = payload.instructorId || null;
  let startTime = new Date(payload.startTime);
  let endTime = new Date(payload.endTime);
  let availabilityId = null;

  if (payload.availabilityId) {
    const availability = await prisma.availability.findUnique({ where: { id: payload.availabilityId } });
    if (!availability) throw new ApiError(404, 'Availability not found');
    instructorId = availability.instructorId;
    startTime = availability.startTime;
    endTime = availability.endTime;
    availabilityId = availability.id;
  }

  return prisma.booking.create({
    data: {
      studentId,
      instructorId,
      availabilityId,
      startTime,
      endTime,
      notes: payload.notes || null,
      status: BOOKING_STATUS.REQUESTED,
    },
  });
};

const listBookings = async (user, query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.from) {
    const from = new Date(query.from);
    if (Number.isNaN(from.getTime())) throw new ApiError(400, 'Invalid from datetime');
    where.endTime = { gt: from };
  }

  if (query.to) {
    const to = new Date(query.to);
    if (Number.isNaN(to.getTime())) throw new ApiError(400, 'Invalid to datetime');
    where.startTime = { lt: to };
  }

  if (user.role === ROLES.STUDENT) where.studentId = user.id;
  if (user.role === ROLES.INSTRUCTOR) where.instructorId = user.id;

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { student: { select: { id: true, email: true } }, instructor: { select: { id: true, email: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const approveBooking = async (bookingId, adminId, instructorId) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking not found');
  const assignInstructorId = instructorId || booking.instructorId;
  if (!assignInstructorId) throw new ApiError(400, 'Instructor is required for approval');
  const conflict = await hasBookingConflict({
    instructorId: assignInstructorId,
    startTime: booking.startTime,
    endTime: booking.endTime,
    excludeId: booking.id,
  });
  if (conflict) throw new ApiError(409, 'Booking conflict detected');

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BOOKING_STATUS.APPROVED, approvedBy: adminId, instructorId: assignInstructorId },
  });
};

const completeBooking = async (bookingId) =>
  prisma.booking.update({ where: { id: bookingId }, data: { status: BOOKING_STATUS.COMPLETED } });

const cancelBooking = async (bookingId) =>
  prisma.booking.update({ where: { id: bookingId }, data: { status: BOOKING_STATUS.CANCELLED } });

module.exports = {
  hasBookingConflict,
  createAvailability,
  listAvailability,
  createBookingRequest,
  listBookings,
  approveBooking,
  completeBooking,
  cancelBooking,
};
