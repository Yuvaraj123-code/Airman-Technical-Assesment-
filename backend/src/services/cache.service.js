const redis = require('../config/redis');

const get = async (key) => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

const set = async (key, value, ttl = 60) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

const del = async (key) => redis.del(key);

module.exports = {
  get,
  set,
  del,
};
