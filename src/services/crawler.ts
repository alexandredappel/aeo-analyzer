/**
 * Crawler Service for AEO Auditor
 * Handles HTML fetching, robots.txt, and sitemap.xml collection
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import logger from '@/utils/logger';

// Configuration constants
export const TIMEOUT_MS = 10000; // 10 seconds timeout
export const USER_AGENT = 'AEO-Auditor-Bot/1.0 (+https://aeo-auditor.com)';
export const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB limit

// Types and interfaces
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
}

interface RequestResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

interface FetchMetadata {
  statusCode?: number;
  contentLength?: number;
  responseTime: number;
  contentType?: string;
}

interface CrawlResult {
  success: boolean;
  data?: string;
  error?: string;
  metadata: FetchMetadata;
}

interface BasicMetadata {
  title: string | null;
  description: string | null;
  charset: string;
  viewport: string | null;
  canonical: string | null;
  robots: string | null;
}

/**
 * Validate and normalize URL
 * @param urlString - URL to validate
 * @returns Normalized URL object
 * @throws Error if URL is invalid
 */
export function validateAndNormalizeUrl(urlString: string): URL {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  // Add protocol if missing
  let normalizedUrl = urlString;
  if (!urlString.match(/^https?:\/\//)) {
    normalizedUrl = 'https://' + urlString;
  }

  try {
    const url = new URL(normalizedUrl);
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`Protocol ${url.protocol} not supported. Only HTTP and HTTPS are allowed.`);
    }

    // Block private/local addresses
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)
    ) {
      throw new Error('Private/local IP addresses are not allowed');
    }

    return url;
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'ERR_INVALID_URL') {
      throw new Error(`Invalid URL format: ${urlString}`);
    }
    throw error;
  }
}

/**
 * Make HTTP request with timeout, size limits, and redirect handling
 * @param url - URL to fetch
 * @param options - Request options
 * @param redirectCount - Current redirect count (for preventing infinite loops)
 * @returns Promise with response data
 */
function makeRequest(url: URL, options: RequestOptions = {}, redirectCount: number = 0): Promise<RequestResponse> {
  const MAX_REDIRECTS = 5;
  
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity', // Disable compression for simplicity
        'Connection': 'close',
        ...options.headers
      },
      timeout: TIMEOUT_MS
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      let size = 0;

      res.on('data', (chunk: Buffer) => {
        size += chunk.length;
        
        if (size > MAX_CONTENT_SIZE) {
          req.destroy();
          reject(new Error(`Content too large. Maximum size is ${MAX_CONTENT_SIZE / 1024 / 1024}MB`));
          return;
        }
        
        data += chunk.toString();
      });

      res.on('end', () => {
        // Handle redirections
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) 
            && res.headers.location) {
          
          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error(`Too many redirects (max ${MAX_REDIRECTS})`));
            return;
          }
          
          try {
            // Handle relative URLs
            const redirectUrl = typeof res.headers.location === 'string' && res.headers.location.startsWith('http') 
              ? new URL(res.headers.location)
              : new URL(res.headers.location as string, url);
            
            // Follow the redirect
            makeRequest(redirectUrl, options, redirectCount + 1)
              .then(resolve)
              .catch(reject);
            return;
          } catch (error) {
            reject(new Error(`Invalid redirect URL: ${res.headers.location}`));
            return;
          }
        }
        
        // Normal response
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: data
        });
      });

      res.on('error', (error: Error) => {
        reject(new Error(`Response error: ${error.message}`));
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    });

    req.on('error', (error: any) => {
      if (error.code === 'ENOTFOUND') {
        reject(new Error(`Domain not found: ${url.hostname}`));
      } else if (error.code === 'ECONNREFUSED') {
        reject(new Error(`Connection refused: ${url.hostname}`));
      } else {
        reject(new Error(`Request error: ${error.message}`));
      }
    });

    req.end();
  });
}

/**
 * Fetch static HTML content from URL
 * @param urlString - URL to fetch
 * @returns Promise with crawl result
 */
export async function fetchStaticHTML(urlString: string): Promise<CrawlResult> {
  const startTime = Date.now();
  
  try {
    logger.info(`Fetching HTML from: ${urlString}`);
    
    const url = validateAndNormalizeUrl(urlString);
    const response = await makeRequest(url);
    
    const elapsed = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      logger.success(`HTML fetched successfully (${elapsed}ms, ${response.body.length} bytes)`);
      
      return {
        success: true,
        data: response.body,
        metadata: {
          statusCode: response.statusCode,
          contentLength: response.body.length,
          responseTime: elapsed,
          contentType: (response.headers['content-type'] as string) || 'unknown'
        }
      };
    } else {
      const errorMsg = `HTTP ${response.statusCode} when fetching HTML`;
      logger.warn(errorMsg);
      
      return {
        success: false,
        error: errorMsg,
        metadata: {
          statusCode: response.statusCode,
          responseTime: elapsed
        }
      };
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Failed to fetch HTML from ${urlString}: ${(error as Error).message}`);
    
    return {
      success: false,
      error: (error as Error).message,
      metadata: {
        responseTime: elapsed
      }
    };
  }
}

/**
 * Fetch robots.txt file
 * @param urlString - Base URL to fetch robots.txt from
 * @returns Promise with crawl result
 */
export async function fetchRobotsTxt(urlString: string): Promise<CrawlResult> {
  const startTime = Date.now();
  
  try {
    const baseUrl = validateAndNormalizeUrl(urlString);
    const robotsUrl = new URL('/robots.txt', baseUrl);
    
    logger.info(`Fetching robots.txt from: ${robotsUrl.href}`);
    
    const response = await makeRequest(robotsUrl);
    const elapsed = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      logger.success(`robots.txt fetched successfully (${elapsed}ms)`);
      
      return {
        success: true,
        data: response.body,
        metadata: {
          statusCode: response.statusCode,
          contentLength: response.body.length,
          responseTime: elapsed
        }
      };
    } else if (response.statusCode === 404) {
      logger.warn(`robots.txt not found (404) - this is common and acceptable`);
      
      return {
        success: false,
        error: 'robots.txt not found (404)',
        metadata: {
          statusCode: response.statusCode,
          responseTime: elapsed
        }
      };
    } else {
      const errorMsg = `HTTP ${response.statusCode} when fetching robots.txt`;
      logger.warn(errorMsg);
      
      return {
        success: false,
        error: errorMsg,
        metadata: {
          statusCode: response.statusCode,
          responseTime: elapsed
        }
      };
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Failed to fetch robots.txt from ${urlString}: ${(error as Error).message}`);
    
    return {
      success: false,
      error: (error as Error).message,
      metadata: {
        responseTime: elapsed
      }
    };
  }
}

/**
 * Fetch sitemap.xml file
 * @param urlString - Base URL to fetch sitemap.xml from
 * @returns Promise with crawl result
 */
export async function fetchSitemap(urlString: string): Promise<CrawlResult> {
  const startTime = Date.now();
  
  try {
    const baseUrl = validateAndNormalizeUrl(urlString);
    const sitemapUrl = new URL('/sitemap.xml', baseUrl);
    
    logger.info(`Fetching sitemap.xml from: ${sitemapUrl.href}`);
    
    const response = await makeRequest(sitemapUrl);
    const elapsed = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      logger.success(`sitemap.xml fetched successfully (${elapsed}ms)`);
      
      return {
        success: true,
        data: response.body,
        metadata: {
          statusCode: response.statusCode,
          contentLength: response.body.length,
          responseTime: elapsed
        }
      };
    } else if (response.statusCode === 404) {
      logger.warn(`sitemap.xml not found (404) - this is common and acceptable`);
      
      return {
        success: false,
        error: 'sitemap.xml not found (404)',
        metadata: {
          statusCode: response.statusCode,
          responseTime: elapsed
        }
      };
    } else {
      const errorMsg = `HTTP ${response.statusCode} when fetching sitemap.xml`;
      logger.warn(errorMsg);
      
      return {
        success: false,
        error: errorMsg,
        metadata: {
          statusCode: response.statusCode,
          responseTime: elapsed
        }
      };
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Failed to fetch sitemap.xml from ${urlString}: ${(error as Error).message}`);
    
    return {
      success: false,
      error: (error as Error).message,
      metadata: {
        responseTime: elapsed
      }
    };
  }
}

/**
 * Extract basic metadata from HTML content
 * @param html - HTML content
 * @returns Basic metadata extracted from HTML
 */
export function extractBasicMetadata(html: string): BasicMetadata {
  try {
    const $ = cheerio.load(html);
    
    return {
      title: $('title').text().trim() || null,
      description: $('meta[name="description"]').attr('content') || null,
      charset: $('meta[charset]').attr('charset') || 
               $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([^;]+)/)?.[1] || 
               'unknown',
      viewport: $('meta[name="viewport"]').attr('content') || null,
      canonical: $('link[rel="canonical"]').attr('href') || null,
      robots: $('meta[name="robots"]').attr('content') || null
    };
  } catch (error) {
    logger.warn(`Failed to extract metadata from HTML: ${(error as Error).message}`);
    return {
      title: null,
      description: null,
      charset: 'unknown',
      viewport: null,
      canonical: null,
      robots: null
    };
  }
}

// Export types for external use
export type { CrawlResult, BasicMetadata, FetchMetadata, RequestOptions, RequestResponse }; 