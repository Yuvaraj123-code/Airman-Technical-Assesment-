const { PAGINATION } = require('./constants');

const getPagination = (query = {}) => {
  const page = Math.max(Number(query.page) || PAGINATION.DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(Number(query.limit) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getSearchClause = (search, fields = []) => {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    })),
  };
};

module.exports = {
  getPagination,
  getSearchClause,
};
