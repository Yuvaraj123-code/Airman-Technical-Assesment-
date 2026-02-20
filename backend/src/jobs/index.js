const logger = require('../utils/logger');

const initJobs = async () => {
  logger.info('Level 1 job runner initialized (stubs only)');
};

module.exports = { initJobs };
