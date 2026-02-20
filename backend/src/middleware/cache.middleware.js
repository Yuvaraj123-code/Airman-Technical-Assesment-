const redis = require('../config/redis');

const cacheGet = (prefix, ttl = 60) => async (req, res, next) => {
  const key = `${prefix}:${req.originalUrl}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.set(key, JSON.stringify(body), 'EX', ttl).catch(() => null);
      return originalJson(body);
    };
    return next();
  } catch (error) {
    return next();
  }
};

module.exports = { cacheGet };
