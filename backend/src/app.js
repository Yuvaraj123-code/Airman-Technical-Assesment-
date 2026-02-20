const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config/env');
const { errorConverter, errorHandler } = require('./middleware/error.middleware');
const { correlationId } = require('./middleware/audit.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Correlation ID
app.use(correlationId);

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Resource not found',
    path: req.path,
  });
});

// Error handling
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;