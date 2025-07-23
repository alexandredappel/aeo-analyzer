/**
 * Performance Configuration & Testing - Phase 7C
 * Realistic timeouts, retry strategies, and fallback mechanisms for production
 */

import logger from '@/utils/logger';

// ===== PERFORMANCE CONFIGURATION =====

export const PERFORMANCE_CONFIG = {
  // Core analysis timeouts (without external APIs)
  CORE_TIMEOUT: 15000,           // 15 seconds for core analysis
  
  // PageSpeed API configuration
  PAGESPEED: {
    TIMEOUT: 60000,              // 60 seconds per attempt
    RETRIES: 1,                  // 1 retry if first attempt fails
    TOTAL_MAX_TIME: 120000,      // 2 minutes maximum total
    FALLBACK_ON_FAILURE: true,   // Continue analysis without PageSpeed if fails
    API_KEY: process.env.GOOGLE_PAGESPEED_API_KEY, // Optional API key for higher limits
    STRATEGY: 'desktop'          // 'mobile' or 'desktop'
  },
  
  // HTTP requests (robots.txt, sitemap, HTML)
  HTTP_TIMEOUT: 10000,           // 10 seconds (existing)
  HTTP_RETRIES: 1,               // 1 retry for network issues
  
  // Memory and resource limits
  MAX_HTML_SIZE: 10 * 1024 * 1024,  // 10MB HTML limit
  MAX_MEMORY_USAGE: 500 * 1024 * 1024, // 500MB per analysis
  
  // Concurrent analysis limits
  MAX_CONCURRENT_ANALYSES: 3,    // Maximum simultaneous analyses
  QUEUE_TIMEOUT: 300000,         // 5 minutes queue timeout
  
  // Performance benchmarks
  BENCHMARKS: {
    CORE_ANALYSIS_TARGET: 8000,          // < 8 seconds for core analysis
    COMPLETE_ANALYSIS_OPTIMAL: 25000,    // < 25 seconds with PageSpeed (best case)
    COMPLETE_ANALYSIS_MAX: 90000,        // < 90 seconds with retries (worst case)
    ANALYSIS_WITHOUT_PAGESPEED: 10000,   // < 10 seconds fallback mode
    MEMORY_USAGE_TARGET: 500 * 1024 * 1024, // < 500MB per analysis
  }
} as const;

// ===== PERFORMANCE TIMER =====

export interface PerformancePhases {
  dataCollection: number;     // HTML, robots, sitemap
  discoverability: number;
  structuredData: number;
  llmFormatting: number;
  accessibility: number;      // Including PageSpeed
  readability: number;
  scoreCalculation: number;
  transformation: number;     // All transformers
}

class PerformanceTimer {
  private startTime: number;
  private phaseStartTime: number;
  public phases: PerformancePhases;

  constructor() {
    this.startTime = Date.now();
    this.phaseStartTime = this.startTime;
    this.phases = {
      dataCollection: 0,
      discoverability: 0,
      structuredData: 0,
      llmFormatting: 0,
      accessibility: 0,
      readability: 0,
      scoreCalculation: 0,
      transformation: 0
    };
  }

  startPhase(phase: keyof PerformancePhases): void {
    this.phaseStartTime = Date.now();
  }

  endPhase(phase: keyof PerformancePhases): void {
    const duration = Date.now() - this.phaseStartTime;
    this.phases[phase] = duration;
    logger.info(`⚡ ${phase} completed in ${duration}ms`);
  }

  getTotalTime(): number {
    return Date.now() - this.startTime;
  }

  getReport(): PerformanceReport {
    const totalTime = this.getTotalTime();
    const memoryUsage = process.memoryUsage();
    
    return {
      totalTime,
      phases: { ...this.phases },
      memoryPeak: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      memoryTotal: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      benchmarkStatus: this.evaluateBenchmarks(totalTime, memoryUsage.heapUsed),
      timestamp: new Date().toISOString()
    };
  }

  private evaluateBenchmarks(totalTime: number, memoryUsed: number): BenchmarkStatus {
    const { BENCHMARKS } = PERFORMANCE_CONFIG;
    
    return {
      totalTime: totalTime <= BENCHMARKS.COMPLETE_ANALYSIS_MAX ? 'pass' : 'fail',
      memory: memoryUsed <= BENCHMARKS.MEMORY_USAGE_TARGET ? 'pass' : 'fail',
      coreAnalysis: this.getCoreAnalysisTime() <= BENCHMARKS.CORE_ANALYSIS_TARGET ? 'pass' : 'fail'
    };
  }

  private getCoreAnalysisTime(): number {
    // Core analysis = everything except accessibility (which includes PageSpeed)
    return this.phases.dataCollection + 
           this.phases.discoverability + 
           this.phases.structuredData + 
           this.phases.llmFormatting + 
           this.phases.readability + 
           this.phases.scoreCalculation + 
           this.phases.transformation;
  }
}

// ===== PERFORMANCE TYPES =====

export interface PerformanceReport {
  totalTime: number;
  phases: PerformancePhases;
  memoryPeak: number; // MB
  memoryTotal: number; // MB
  benchmarkStatus: BenchmarkStatus;
  timestamp: string;
}

export interface BenchmarkStatus {
  totalTime: 'pass' | 'fail';
  memory: 'pass' | 'fail';
  coreAnalysis: 'pass' | 'fail';
}

export interface PageSpeedResult {
  success: boolean;
  score?: number;
  metrics?: {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    cls?: number; // Cumulative Layout Shift
    fid?: number; // First Input Delay
  };
  error?: string;
  timeoutOccurred?: boolean;
  retryCount?: number;
  totalTime?: number;
}

// ===== PAGESPEED API INTEGRATION =====

class PageSpeedAnalyzer {
  private static instance: PageSpeedAnalyzer;
  
  static getInstance(): PageSpeedAnalyzer {
    if (!PageSpeedAnalyzer.instance) {
      PageSpeedAnalyzer.instance = new PageSpeedAnalyzer();
    }
    return PageSpeedAnalyzer.instance;
  }

  async analyzePageSpeed(url: string): Promise<PageSpeedResult> {
    const startTime = Date.now();
    let retryCount = 0;
    
    logger.info(`🚀 Starting PageSpeed analysis for ${url}`);

    // Try main analysis with retries
    while (retryCount <= PERFORMANCE_CONFIG.PAGESPEED.RETRIES) {
      try {
        const result = await this.performPageSpeedAnalysis(url, retryCount);
        
        if (result.success) {
          const totalTime = Date.now() - startTime;
          logger.info(`✅ PageSpeed analysis completed in ${totalTime}ms (attempt ${retryCount + 1})`);
          return { ...result, retryCount, totalTime };
        }
        
      } catch (error) {
        logger.warn(`⚠️ PageSpeed attempt ${retryCount + 1} failed: ${(error as Error).message}`);
      }
      
      retryCount++;
      
      // Check if we've exceeded total timeout
      if (Date.now() - startTime > PERFORMANCE_CONFIG.PAGESPEED.TOTAL_MAX_TIME) {
        logger.warn(`⏰ PageSpeed total timeout exceeded (${PERFORMANCE_CONFIG.PAGESPEED.TOTAL_MAX_TIME}ms)`);
        break;
      }
      
      // Short delay before retry
      if (retryCount <= PERFORMANCE_CONFIG.PAGESPEED.RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const totalTime = Date.now() - startTime;
    logger.warn(`❌ PageSpeed analysis failed after ${retryCount} attempts in ${totalTime}ms`);
    
    return {
      success: false,
      error: `PageSpeed analysis failed after ${retryCount} attempts`,
      timeoutOccurred: totalTime > PERFORMANCE_CONFIG.PAGESPEED.TOTAL_MAX_TIME,
      retryCount: retryCount - 1,
      totalTime
    };
  }

  private async performPageSpeedAnalysis(url: string, attempt: number): Promise<PageSpeedResult> {
    // TODO: Implement actual Google PageSpeed API call
    // This is a placeholder that simulates API behavior
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`PageSpeed API timeout after ${PERFORMANCE_CONFIG.PAGESPEED.TIMEOUT}ms`));
      }, PERFORMANCE_CONFIG.PAGESPEED.TIMEOUT);

      // Simulate API call
      setTimeout(() => {
        clearTimeout(timeout);
        
        // Simulate occasional failures for testing
        if (attempt === 0 && Math.random() < 0.2) {
          reject(new Error('Simulated API failure'));
          return;
        }
        
        // Simulate successful response
        resolve({
          success: true,
          score: Math.floor(Math.random() * 40) + 60, // 60-100 score
          metrics: {
            fcp: Math.random() * 2 + 1, // 1-3 seconds
            lcp: Math.random() * 3 + 2, // 2-5 seconds
            cls: Math.random() * 0.1,   // 0-0.1
            fid: Math.random() * 100    // 0-100ms
          }
        });
      }, Math.random() * 3000 + 1000); // 1-4 second simulation
    });
  }
}

// ===== FALLBACK STRATEGY =====

class FallbackStrategy {
  static handlePageSpeedFailure(url?: string): {
    score: number;
    status: 'warning';
    problems: string[];
    solutions: string[];
    successMessage: string;
    rawData: any;
  } {
    logger.warn(`📉 Using PageSpeed fallback strategy for ${url || 'unknown URL'}`);
    
    return {
      score: 10, // Partial score when PageSpeed unavailable
      status: 'warning' as const,
      problems: [
        'PageSpeed analysis temporarily unavailable',
        'Performance metrics could not be retrieved'
      ],
      solutions: [
        'Test your site manually with Google PageSpeed Insights',
        'Use GTmetrix or similar tools for performance analysis',
        'Optimize images, minify CSS/JS, and enable compression',
        'Monitor Core Web Vitals in Google Search Console'
      ],
      successMessage: 'Page speed analysis will complete when API is available.',
      rawData: {
        fallbackUsed: true,
        reason: 'PageSpeed API timeout or failure',
        timestamp: new Date().toISOString()
      }
    };
  }

  static handleNetworkFailure(resource: string, error: string): {
    success: boolean;
    error: string;
    fallbackUsed: boolean;
  } {
    logger.warn(`🌐 Network fallback for ${resource}: ${error}`);
    
    return {
      success: false,
      error: `${resource} temporarily unavailable: ${error}`,
      fallbackUsed: true
    };
  }
}

// ===== MEMORY OPTIMIZATION =====

class MemoryOptimizer {
  static cleanup(objects: any[]): void {
    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        // Clear large objects
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string' && obj[key].length > 10000) {
            obj[key] = null;
          }
        });
      }
    });
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  static checkMemoryUsage(): { used: number; total: number; percentage: number } {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.rss / 1024 / 1024);
    const percentage = Math.round((usage.heapUsed / usage.rss) * 100);
    
    if (usedMB > PERFORMANCE_CONFIG.BENCHMARKS.MEMORY_USAGE_TARGET / 1024 / 1024) {
      logger.warn(`⚠️ High memory usage: ${usedMB}MB (${percentage}% of ${totalMB}MB)`);
    }
    
    return { used: usedMB, total: totalMB, percentage };
  }
}

// ===== EXPORTS =====

export {
  PerformanceTimer,
  PageSpeedAnalyzer,
  FallbackStrategy,
  MemoryOptimizer
};

// Types are exported via the interfaces above 