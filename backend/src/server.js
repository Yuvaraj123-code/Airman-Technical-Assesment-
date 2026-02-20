const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const prisma = require('./config/database');
const redis = require('./config/redis');

let server;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Test redis connection
    await redis.ping();
    logger.info('Redis connected successfully');

    // Start server
    server = app.listen(config.PORT, () => {
      logger.info(`
        ################################################
        🚀 Server listening on port: ${config.PORT} 🚀
        ################################################
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing connections...');

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  await prisma.$disconnect();
  logger.info('Database connection closed');

  await redis.quit();
  logger.info('Redis connection closed');

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

module.exports = server;