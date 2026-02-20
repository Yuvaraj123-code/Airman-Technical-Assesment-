jest.mock('../../src/config/database', () => ({
  booking: {
    findFirst: jest.fn(),
  },
}));

const prisma = require('../../src/config/database');
const { hasBookingConflict } = require('../../src/services/booking.service');

describe('Booking conflict detection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns true when overlap exists', async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
    const conflict = await hasBookingConflict({
      instructorId: 'i1',
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T11:00:00.000Z',
    });
    expect(conflict).toBe(true);
  });

  it('returns false when no overlap', async () => {
    prisma.booking.findFirst.mockResolvedValue(null);
    const conflict = await hasBookingConflict({
      instructorId: 'i1',
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T11:00:00.000Z',
    });
    expect(conflict).toBe(false);
  });
});
