/**
 * Simple ping endpoint for basic connectivity test
 */

import logger from '@/utils/logger';

interface PingResponse {
  message: string;
}

interface ErrorResponse {
  status: string;
  timestamp: string;
  message: string;
}

/**
 * GET /api/health/ping
 * Simple ping endpoint for basic connectivity test
 */
export async function GET(): Promise<Response> {
  const startTime = process.hrtime.bigint();
  
  try {
    const response: PingResponse = { message: 'pong' };
    
    // Calculate response time
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000;
    
    // Log the request
    logger.info(`GET /api/health/ping - 200 - ${Math.round(responseTime)}ms`);
    
    return Response.json(response);
    
  } catch (error) {
    logger.error(`Ping failed: ${(error as Error).message}`);
    
    const errorResponse: ErrorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Ping failed'
    };
    
    return Response.json(errorResponse, { status: 500 });
  }
} 