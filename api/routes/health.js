/**
 * Health check route for AEO Auditor API
 * Provides simple endpoint to verify API is running
 */

const logger = require('../utils/logger');

/**
 * Register health check routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
async function healthRoutes(fastify) {
  
  /**
   * GET /api/health
   * Returns API health status with timestamp
   */
  fastify.get('/api/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            environment: { type: 'string' },
            version: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = process.hrtime.bigint();
    
    try {
      // Get current timestamp
      const timestamp = new Date().toISOString();
      
      // Calculate uptime in seconds
      const uptime = Math.floor(process.uptime());
      
      // Get environment and version info
      const environment = process.env.NODE_ENV || 'development';
      const version = process.env.npm_package_version || '1.0.0';
      
      const response = {
        status: 'ok',
        timestamp,
        uptime,
        environment,
        version
      };
      
      // Calculate response time
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      // Log the request
      logger.request(request.method, request.url, 200, Math.round(responseTime));
      
      return reply.code(200).send(response);
      
    } catch (error) {
      logger.error('Health check failed', error);
      
      const errorResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Health check failed'
      };
      
      return reply.code(500).send(errorResponse);
    }
  });
  
  /**
   * GET /api/health/ping
   * Simple ping endpoint for basic connectivity test
   */
  fastify.get('/api/health/ping', {
    schema: {
      description: 'Simple ping endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = process.hrtime.bigint();
    
    const response = { message: 'pong' };
    
    // Calculate response time
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000;
    
    // Log the request
    logger.request(request.method, request.url, 200, Math.round(responseTime));
    
    return reply.code(200).send(response);
  });
}

module.exports = healthRoutes; 