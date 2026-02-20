const { tenantMiddleware } = require('../../src/middleware/tenant.middleware');

describe('Tenant middleware (Level 1 baseline)', () => {
  it('passes through and sets tenantId when header exists', () => {
    const req = { headers: { 'x-tenant-id': 'school-a' } };
    const res = {};
    const next = jest.fn();
    tenantMiddleware(req, res, next);
    expect(req.tenantId).toBe('school-a');
    expect(next).toHaveBeenCalled();
  });
});
