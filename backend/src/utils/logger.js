const { createLogger, format, transports } = require('winston');
const config = require('../config/env');

const logger = createLogger({
  level: config.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) =>
      `${timestamp} ${level}: ${stack || message}`
    )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
