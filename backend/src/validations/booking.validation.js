const { body, query } = require('express-validator');

const createAvailabilityValidation = [
  body('startTime').isISO8601().withMessage('startTime must be a valid ISO datetime'),
  body('endTime').isISO8601().withMessage('endTime must be a valid ISO datetime'),
];

const createBookingValidation = [
  body('availabilityId').optional().isString(),
  body('instructorId').optional().isString(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
];

const approveBookingValidation = [body('instructorId').optional().isString()];

const listBookingsValidation = [
  query('from').optional().isISO8601().withMessage('from must be a valid ISO datetime'),
  query('to').optional().isISO8601().withMessage('to must be a valid ISO datetime'),
];

module.exports = {
  createAvailabilityValidation,
  createBookingValidation,
  approveBookingValidation,
  listBookingsValidation,
};
