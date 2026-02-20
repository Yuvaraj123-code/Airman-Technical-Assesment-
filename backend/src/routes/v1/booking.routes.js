const express = require('express');
const controller = require('../../controllers/booking.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { allowRoles } = require('../../middleware/rbac.middleware');
const { bookingLimiter } = require('../../middleware/rateLimit.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createAvailabilityValidation,
  createBookingValidation,
  approveBookingValidation,
  listBookingsValidation,
} = require('../../validations/booking.validation');
const { ROLES } = require('../../utils/constants');

const router = express.Router();

router.use(authMiddleware);

router.post('/availability', allowRoles(ROLES.INSTRUCTOR), createAvailabilityValidation, validate, controller.createAvailability);
router.get('/availability', controller.listAvailability);
router.post('/', bookingLimiter, allowRoles(ROLES.STUDENT), createBookingValidation, validate, controller.createBooking);
router.get('/', listBookingsValidation, validate, controller.listBookings);
router.patch('/:id/approve', allowRoles(ROLES.ADMIN), approveBookingValidation, validate, controller.approveBooking);
router.patch('/:id/complete', allowRoles(ROLES.ADMIN, ROLES.INSTRUCTOR), controller.completeBooking);
router.patch('/:id/cancel', allowRoles(ROLES.ADMIN, ROLES.STUDENT), controller.cancelBooking);

module.exports = router;
