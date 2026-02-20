const tenantMiddleware = (req, res, next) => {
  req.tenantId = req.headers['x-tenant-id'] || null;
  next();
};

const enforceTenantIsolation = (req, res, next) => next();

module.exports = { tenantMiddleware, enforceTenantIsolation };
