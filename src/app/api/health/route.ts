/**
 * Health check route for AEO Auditor API
 * Provides simple endpoint to verify API is running
 */

import logger from '@/utils/logger';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}



interface ErrorResponse {
  status: string;
  timestamp: string;
  message: string;
}

/**
 * GET /api/health
 * Returns API health status with timestamp
 */
export async function GET(): Promise<Response> {
  const startTime = process.hrtime.bigint();
  
  try {
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Calculate uptime in seconds
    const uptime = Math.floor(process.uptime());
    
    // Get environment and version info
    const environment = process.env.NODE_ENV || 'development';
    const version = process.env.npm_package_version || '1.0.0';
    
    const response: HealthResponse = {
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
    logger.info(`GET /api/health - 200 - ${Math.round(responseTime)}ms`);
    
    return Response.json(response);
    
  } catch (error) {
    logger.error(`Health check failed: ${(error as Error).message}`);
    
    const errorResponse: ErrorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    };
    
    return Response.json(errorResponse, { status: 500 });
  }
}

 