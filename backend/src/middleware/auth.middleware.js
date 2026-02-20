const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) throw new ApiError(401, 'Authentication token is required');

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!user) throw new ApiError(401, 'Invalid token');
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authMiddleware };
