/**
 * AEO Auditor API Server
 * Fastify-based backend for the AEO analysis application
 */

// Load environment variables
require('dotenv').config();

const fastify = require('fastify');
const cors = require('@fastify/cors');
const logger = require('./utils/logger');
const healthRoutes = require('./routes/health');
const collectDataRoutes = require('./routes/collect-data');

// Configuration
const config = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  environment: process.env.NODE_ENV || 'development'
};

/**
 * Create and configure Fastify server
 */
async function createServer() {
  // Initialize Fastify with logging disabled (we use our custom logger)
  const server = fastify({
    logger: false,
    disableRequestLogging: true,
    trustProxy: true
  });

  try {
    // Register CORS plugin
    await server.register(cors, {
      origin: [
        'http://localhost:3000',  // Next.js development server
        'http://127.0.0.1:3000',  // Alternative localhost
        /^https:\/\/.*\.vercel\.app$/, // Vercel deployments
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    });

    // Add request logging hook
    server.addHook('onRequest', async (request, reply) => {
      request.startTime = process.hrtime.bigint();
    });

    // Add response logging hook
    server.addHook('onResponse', async (request, reply) => {
      if (request.startTime) {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - request.startTime) / 1000000; // Convert to milliseconds
        logger.request(request.method, request.url, reply.statusCode, Math.round(responseTime));
      }
    });

    // Global error handler
    server.setErrorHandler(async (error, request, reply) => {
      logger.error(`Unhandled error on ${request.method} ${request.url}`, error);
      
      // Don't leak internal errors in production
      const isDevelopment = config.environment === 'development';
      
      const errorResponse = {
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
        statusCode: error.statusCode || 500,
        timestamp: new Date().toISOString()
      };

      if (isDevelopment && error.stack) {
        errorResponse.stack = error.stack;
      }

      return reply.status(error.statusCode || 500).send(errorResponse);
    });

    // 404 handler
    server.setNotFoundHandler(async (request, reply) => {
      logger.warn(`Route not found: ${request.method} ${request.url}`);
      
      return reply.status(404).send({
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    });

    // Register routes
    await server.register(healthRoutes);
    await server.register(collectDataRoutes);

    // Root endpoint
    server.get('/', async (request, reply) => {
      return reply.send({
        message: 'AEO Auditor API',
        version: '1.0.0',
        environment: config.environment,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/api/health',
          collectData: '/api/collect-data'
        }
      });
    });

    return server;

  } catch (error) {
    logger.error('Failed to create server', error);
    throw error;
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    const server = await createServer();
    
    // Start listening
    await server.listen({
      port: config.port,
      host: config.host
    });

    logger.success(`🚀 AEO Auditor API server started successfully`);
    logger.info(`📍 Server running at http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
    logger.info(`🌍 Environment: ${config.environment}`);
    logger.info(`📋 Health check: http://localhost:${config.port}/api/health`);
    logger.info(`📊 Data collection: http://localhost:${config.port}/api/collect-data`);

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.info(`📥 Received ${signal}, shutting down gracefully...`);
      
      try {
        await server.close();
        logger.success('✅ Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;

  } catch (error) {
    logger.error('💥 Failed to start server', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer, config }; 