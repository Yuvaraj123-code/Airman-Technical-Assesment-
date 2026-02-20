const ApiError = require('../utils/ApiError');
const { PERMISSIONS } = require('../utils/constants');

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Forbidden'));
  return next();
};

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'));
  const granted = PERMISSIONS[req.user.role] || [];
  if (!granted.includes(permission) && !granted.includes('view:all')) {
    return next(new ApiError(403, 'Forbidden'));
  }
  return next();
};

module.exports = {
  allowRoles,
  requirePermission,
};
