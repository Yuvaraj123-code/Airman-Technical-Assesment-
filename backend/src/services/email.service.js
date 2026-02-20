const logger = require('../utils/logger');

const sendEmail = async ({ to, subject, body }) => {
  logger.info(`Email stub => to:${to} subject:${subject} body:${body}`);
  return { success: true };
};

module.exports = { sendEmail };
