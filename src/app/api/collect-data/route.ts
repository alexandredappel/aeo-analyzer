/**
 * Data Collection Route for AEO Auditor
 * Orchestrates HTML, robots.txt, and sitemap.xml collection using all migrated services
 */

import logger from '@/utils/logger';
import {
  // Services Core
  validateAndNormalizeUrl,
  fetchStaticHTML,
  fetchRobotsTxt,
  fetchSitemap,
  extractBasicMetadata,
  AEOScoreCalculator,
  TIMEOUT_MS,
  USER_AGENT,
  MAX_CONTENT_SIZE,
  
  // Analyseurs
  analyzeStructuredData,
  analyzeLLMFormatting,
  analyzeAccessibility,
  analyzeReadability,
  
  // Types
  type CrawlResult,
  type StructuredDataAnalysisResult,
  type AccessibilityAnalysisResult,
  type LLMFormattingAnalysisResult,
  type ReadabilityAnalysisResult,
  type AEOScoreResult
} from '@/services';

// New Discoverability System
import { 
  analyzeDiscoverability,
  type DiscoverabilityAnalysisResult 
} from '@/services/discoverability-analyzer';
import { 
  DiscoverabilityTransformer,
  discoverabilityTransformer 
} from '@/transformers/discoverability-transformer';

// New Structured Data System
import { StructuredDataTransformer } from '@/transformers/structured-data-transformer';

// New LLM Formatting System
import { LLMFormattingTransformer } from '@/transformers/llm-formatting-transformer';

// New Accessibility System
import { AccessibilityTransformer } from '@/transformers/accessibility-transformer';

// New Readability System
import { ReadabilityTransformer } from '@/transformers/readability-transformer';

import { MainSection } from '@/types/analysis-architecture';

/**
 * Custom logger that captures logs for response
 */
class ResponseLogger {
  private logs: string[];
  private startTime: number;

  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  log(level: string, message: string): void {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const elapsed = Date.now() - this.startTime;
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message} (+${elapsed}ms)`;
    
    this.logs.push(logEntry);
    
    // Also log to console
    switch (level) {
      case 'info':
        logger.info(message);
        break;
      case 'success':
        logger.info(`✅ ${message}`);
        break;
      case 'warn':
        logger.warn(message);
        break;
      case 'error':
        logger.error(message);
        break;
    }
  }

  info(message: string): void { this.log('info', message); }
  success(message: string): void { this.log('success', message); }
  warn(message: string): void { this.log('warn', message); }
  error(message: string): void { this.log('error', message); }
  
  getLogs(): string[] { return this.logs; }
}

// Interfaces for type safety
interface CollectDataRequest {
  url: string;
}

interface CollectedData {
  url: string;
  html: CrawlResult;
  robotsTxt: CrawlResult;
  sitemap: CrawlResult;
}

interface AnalysisResults {
  discoverability?: MainSection;
  structuredData?: MainSection; // New hierarchical structure
  llmFormatting?: MainSection; // New hierarchical structure
  accessibility?: MainSection; // New hierarchical structure
  readability?: MainSection; // New hierarchical structure
  aeoScore?: AEOScoreResult;
}

interface CollectDataResponse {
  success: boolean;
  data: {
    url: string;
    html: CrawlResult;
    robotsTxt: CrawlResult;
    sitemap: CrawlResult;
    metadata: {
      basic: any;
      collection: {
        timestamp: string;
        userAgent: string;
        timeout: number;
        maxContentSize: number;
      };
    };
  };
  logs: string[];
  summary: {
    totalTime: number;
    successCount: number;
    failureCount: number;
    partialSuccess: boolean;
    analysisCompleted: boolean;
  };
  analysis: AnalysisResults | null;
  error?: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  logs: string[];
  summary: {
    totalTime: number;
    successCount: number;
    failureCount: number;
    partialSuccess: boolean;
    analysisCompleted: boolean;
  };
}

/**
 * POST /api/collect-data
 * Collect HTML, robots.txt, and sitemap.xml data for AEO analysis
 */
export async function POST(request: Request): Promise<Response> {
  const responseLogger = new ResponseLogger();
  const startTime = Date.now();
  
  // Initialize performance timer for comprehensive measurement
  const { PerformanceTimer, MemoryOptimizer } = await import('@/services/performance-config');
  const performanceTimer = new PerformanceTimer();
  
  responseLogger.info('🚀 AEO Analysis started with performance monitoring');
  
  try {
    // Parse request body
    const body: CollectDataRequest = await request.json();
    const { url } = body;
    
    // Validate required fields
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return Response.json({
        error: 'Validation Error',
        message: 'URL is required and must be a non-empty string',
        statusCode: 400,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    if (url.length > 2048) {
      return Response.json({
        error: 'Validation Error',
        message: 'URL must be less than 2048 characters',
        statusCode: 400,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    responseLogger.info(`Starting data collection for: ${url}`);
    
    // Normalize URL for consistent processing
    let normalizedUrl: URL;
    try {
      normalizedUrl = validateAndNormalizeUrl(url);
      responseLogger.info(`Normalized URL: ${normalizedUrl.href}`);
    } catch (error) {
      return Response.json({
        error: 'Validation Error',
        message: (error as Error).message,
        statusCode: 400,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Collect data in parallel for better performance
    responseLogger.info('Starting parallel data collection...');
    performanceTimer.startPhase('dataCollection');
    
    const [htmlResult, robotsResult, sitemapResult] = await Promise.allSettled([
      (async () => {
        responseLogger.info('Fetching HTML content...');
        const result = await fetchStaticHTML(normalizedUrl.href);
        if (result.success) {
          responseLogger.success(`HTML collected: ${result.metadata?.contentLength || 0} bytes`);
        } else {
          responseLogger.error(`HTML collection failed: ${result.error}`);
        }
        return result;
      })(),
      
      (async () => {
        responseLogger.info('Fetching robots.txt...');
        const result = await fetchRobotsTxt(normalizedUrl.href);
        if (result.success) {
          responseLogger.success(`robots.txt collected: ${result.metadata?.contentLength || 0} bytes`);
        } else {
          responseLogger.warn(`robots.txt collection failed: ${result.error}`);
        }
        return result;
      })(),
      
      (async () => {
        responseLogger.info('Fetching sitemap.xml...');
        const result = await fetchSitemap(normalizedUrl.href);
        if (result.success) {
          responseLogger.success(`sitemap.xml collected: ${result.metadata?.contentLength || 0} bytes`);
        } else {
          responseLogger.warn(`sitemap.xml collection failed: ${result.error}`);
        }
        return result;
      })()
    ]);

    // Process results
    const htmlData: CrawlResult = htmlResult.status === 'fulfilled' ? htmlResult.value : { 
      success: false, 
      error: htmlResult.reason?.message || 'Unknown error',
      metadata: { responseTime: 0 }
    };
    
    const robotsData: CrawlResult = robotsResult.status === 'fulfilled' ? robotsResult.value : { 
      success: false, 
      error: robotsResult.reason?.message || 'Unknown error',
      metadata: { responseTime: 0 }
    };
    
    const sitemapData: CrawlResult = sitemapResult.status === 'fulfilled' ? sitemapResult.value : { 
      success: false, 
      error: sitemapResult.reason?.message || 'Unknown error',
      metadata: { responseTime: 0 }
    };

    // Calculate success metrics
    const successCount = [htmlData, robotsData, sitemapData].filter(result => result.success).length;
    const totalCount = 3;
    const failureCount = totalCount - successCount;
    const partialSuccess = successCount > 0 && successCount < totalCount;
    
    const collectionTime = Date.now() - startTime;
    performanceTimer.endPhase('dataCollection');
    
    // Extract basic metadata if HTML was successful
    let basicMetadata = {};
    if (htmlData.success && htmlData.data) {
      try {
        basicMetadata = extractBasicMetadata(htmlData.data);
        responseLogger.info(`Extracted basic metadata: ${Object.keys(basicMetadata).length} fields`);
      } catch (error) {
        responseLogger.warn(`Failed to extract metadata: ${(error as Error).message}`);
      }
    }

    // Determine overall success
    const overallSuccess = htmlData.success; // HTML is critical for most analyses
    
    if (overallSuccess) {
      responseLogger.success(`Data collection completed in ${collectionTime}ms`);
    } else {
      responseLogger.warn(`Partial data collection - HTML fetch unsuccessful but continuing analysis`);
    }
    
    // Log summary
    responseLogger.info(`Summary: ${successCount}/${totalCount} successful, ${failureCount} failed, partial: ${partialSuccess}`);

    // Perform AEO analyses
    const analysisResults: AnalysisResults = {};
    let analysisCompleted = false;
    
    responseLogger.info(`Starting analysis phase - overallSuccess: ${overallSuccess}`);
    
    // Prepare collected data for discoverability analysis
    const collectedData: CollectedData = {
      url: normalizedUrl.href,
      html: htmlData,
      robotsTxt: robotsData,
      sitemap: sitemapData
    };
    
    // Discoverability analysis can work with just URL, robots.txt, and sitemap
    try {
      responseLogger.info('Starting discoverability analysis...');
      performanceTimer.startPhase('discoverability');
      
      // Use new hierarchical discoverability analyzer
      const discoverabilityAnalysisResult = analyzeDiscoverability(collectedData);
      
      // Transform to UI structure
      const transformedDiscoverability = discoverabilityTransformer.transform(discoverabilityAnalysisResult);
      analysisResults.discoverability = transformedDiscoverability;
      
      responseLogger.success(`Discoverability analysis completed! Score: ${transformedDiscoverability.totalScore}/${transformedDiscoverability.maxScore}`);
      responseLogger.info(`Analysis result structure: section=${transformedDiscoverability.name}, drawers=${transformedDiscoverability.drawers.length}`);
      
      // Log global penalties if any
      if (discoverabilityAnalysisResult.globalPenalties.length > 0) {
        responseLogger.warn(`Global penalties detected: ${discoverabilityAnalysisResult.globalPenalties.length} penalties`);
        discoverabilityAnalysisResult.globalPenalties.forEach(penalty => {
          responseLogger.warn(`Penalty: ${penalty.description} (${Math.round(penalty.penaltyFactor * 100)}% impact)`);
        });
      }
      
      performanceTimer.endPhase('discoverability');
      
    } catch (error) {
      responseLogger.error(`Discoverability analysis failed: ${(error as Error).message}`);
      performanceTimer.endPhase('discoverability');
    }
    
    // Structured data analysis requires HTML content
    if (htmlData.success && htmlData.data) {
      try {
        responseLogger.info('🏗️ Starting structured data analysis...');
        performanceTimer.startPhase('structuredData');
        
        // New structured data analysis
        const structuredDataResult = analyzeStructuredData(htmlData.data, normalizedUrl.href);
        
        // Transform to UI structure
        const structuredDataTransformer = new StructuredDataTransformer();
        const transformedStructuredData = structuredDataTransformer.transform(structuredDataResult);
        
        // Add to results
        analysisResults.structuredData = transformedStructuredData;
        
        // Enhanced logging
        responseLogger.success(`Structured data analysis completed! Score: ${transformedStructuredData.totalScore}/${transformedStructuredData.maxScore}`);
        responseLogger.info(`🏗️ Structured Data Details: JSON-LD=${structuredDataResult.rawData?.jsonLdFound ? 'Yes' : 'No'}, Schemas=${structuredDataResult.rawData?.detectedSchemas?.length || 0}, Title=${structuredDataResult.rawData?.titleTag?.length || 0}chars, Description=${structuredDataResult.rawData?.metaDescription?.length || 0}chars, OG=${structuredDataResult.rawData?.openGraph?.title && structuredDataResult.rawData?.openGraph?.description ? 'Complete' : 'Incomplete'}, Drawers=${transformedStructuredData.drawers.length}`);
        
        performanceTimer.endPhase('structuredData');
        
      } catch (error) {
        responseLogger.error(`Structured data analysis failed: ${(error as Error).message}`);
        performanceTimer.endPhase('structuredData');
      }
      
      // LLM formatting analysis requires HTML content
      if (htmlData.success && htmlData.data) {
        try {
          responseLogger.info('🤖 Starting LLM formatting analysis...');
          performanceTimer.startPhase('llmFormatting');
          
          // New LLM formatting analysis
          const llmFormattingResult = analyzeLLMFormatting(htmlData.data, normalizedUrl.href);
          
          // Transform to UI structure
          const llmFormattingTransformer = new LLMFormattingTransformer();
          const transformedLLMFormatting = llmFormattingTransformer.transform(llmFormattingResult);
          
          // Add to results
          analysisResults.llmFormatting = transformedLLMFormatting;
          
          // Enhanced logging
          responseLogger.success(`LLM formatting analysis completed! Score: ${transformedLLMFormatting.totalScore}/${transformedLLMFormatting.maxScore}`);
          responseLogger.info(`🤖 LLM Formatting Details: ContentHierarchy=${llmFormattingResult.rawData?.contentHierarchy?.totalScore || 0}/${llmFormattingResult.rawData?.contentHierarchy?.maxScore || 50}, LayoutRoles=${llmFormattingResult.rawData?.layoutAndStructuralRoles?.totalScore || 0}/${llmFormattingResult.rawData?.layoutAndStructuralRoles?.maxScore || 30}, CTAContextClarity=${llmFormattingResult.rawData?.ctaContextClarity?.totalScore || 0}/${llmFormattingResult.rawData?.ctaContextClarity?.maxScore || 20}, Drawers=${transformedLLMFormatting.drawers.length}`);
          
          performanceTimer.endPhase('llmFormatting');
          
        } catch (error) {
          responseLogger.error(`LLM formatting analysis failed: ${(error as Error).message}`);
          performanceTimer.endPhase('llmFormatting');
        }
      }
      
      // Accessibility analysis
      try {
        responseLogger.info('♿ Starting accessibility analysis...');
        performanceTimer.startPhase('accessibility');
        
        // New accessibility analysis
        const accessibilityResult = await analyzeAccessibility(htmlData.data, normalizedUrl.href);
        
        // Transform to UI structure
        const accessibilityTransformer = new AccessibilityTransformer();
        const transformedAccessibility = accessibilityTransformer.transform(accessibilityResult);
        
        // Add to results
        analysisResults.accessibility = transformedAccessibility;
        
        // Enhanced logging
        responseLogger.success(`Accessibility analysis completed! Score: ${transformedAccessibility.totalScore}/${transformedAccessibility.maxScore}`);
        responseLogger.info(`♿ Accessibility Details: ContentScore=${accessibilityResult.rawData?.contentAccessibility?.totalScore || 0}/${accessibilityResult.rawData?.contentAccessibility?.maxScore || 0}, PageSpeed=${accessibilityResult.rawData?.technicalAccessibility?.performanceScore || 'N/A'}, CoreWebVitals=${accessibilityResult.rawData?.technicalAccessibility?.coreWebVitals ? 'Available' : 'Unavailable'}, Navigation=${accessibilityResult.rawData?.navigationalAccessibility?.navElementsCount || 0} nav elements, Drawers=${transformedAccessibility.drawers.length}`);
        
        performanceTimer.endPhase('accessibility');
        
      } catch (error) {
        responseLogger.error(`Accessibility analysis failed: ${(error as Error).message}`);
        performanceTimer.endPhase('accessibility');
      }
      
      // Readability analysis
      try {
        responseLogger.info('📖 Starting readability analysis...');
        performanceTimer.startPhase('readability');
        
        // New readability analysis
        const readabilityResult = await analyzeReadability(htmlData.data, normalizedUrl.href);
        
        // Transform to UI structure
        const readabilityTransformer = new ReadabilityTransformer();
        const transformedReadability = readabilityTransformer.transform(readabilityResult);
        
        // Add to results
        analysisResults.readability = transformedReadability;
        
        // Enhanced logging
        responseLogger.success(`Readability analysis completed! Score: ${transformedReadability.totalScore}/${transformedReadability.maxScore}`);
        responseLogger.info(`📖 Readability Details: FleschScore=${readabilityResult.rawData?.textComplexity?.fleschScore || 'N/A'}, AvgSentence=${readabilityResult.rawData?.linguisticPrecision?.averageSentenceLength || 0}words, ContentDensity=${Math.round((readabilityResult.rawData?.contentOrganization?.contentDensity?.textToHTMLRatio || 0) * 100)}%, VocabDiversity=${Math.round((readabilityResult.rawData?.linguisticPrecision?.vocabularyDiversity || 0) * 100)}%, Paragraphs=${readabilityResult.rawData?.contentOrganization?.paragraphStructure?.totalParagraphs || 0}, Drawers=${transformedReadability.drawers.length}`);
        
        performanceTimer.endPhase('readability');
        
      } catch (error) {
        responseLogger.error(`Readability analysis failed: ${(error as Error).message}`);
        performanceTimer.endPhase('readability');
      }
    } else {
      responseLogger.info('Skipping structured data, LLM formatting, accessibility, and readability analysis - HTML content not available');
    }
    
    // Mark analysis as completed if any analysis was successful
    analysisCompleted = Object.keys(analysisResults).length > 0;
    
    responseLogger.info(`Analysis completed flag: ${analysisCompleted}`);
    responseLogger.info(`Analysis results: ${Object.keys(analysisResults).length > 0 ? 'present' : 'null'}`);
    if (Object.keys(analysisResults).length > 0) {
      const analysisTypes = Object.keys(analysisResults);
      responseLogger.info(`Analysis types completed: ${analysisTypes.join(', ')}`);
      analysisTypes.forEach(type => {
        const result = analysisResults[type as keyof AnalysisResults];
        if (result && 'score' in result && 'maxScore' in result) {
          responseLogger.info(`${type} score: ${result.score}/${result.maxScore}`);
        } else if (result && 'totalScore' in result && 'maxScore' in result) {
          responseLogger.info(`${type} score: ${result.totalScore}/${result.maxScore}`);
        }
      });
    }

    // Calculate AEO score if analysis results are available
    if (Object.keys(analysisResults).length > 0) {
      try {
        responseLogger.info('Starting AEO score calculation...');
        performanceTimer.startPhase('scoreCalculation');
        
        const aeoScoreCalculator = new AEOScoreCalculator();
        const aeoScoreResult = aeoScoreCalculator.calculateAEOScore(analysisResults);
        
        analysisResults.aeoScore = aeoScoreResult;
        
        responseLogger.success(`AEO score calculation completed: ${aeoScoreResult.totalScore}/100`);
        responseLogger.info(`AEO score breakdown: ${aeoScoreResult.completeness}`);
        
        performanceTimer.endPhase('scoreCalculation');
        
      } catch (error) {
        responseLogger.error(`AEO score calculation failed: ${(error as Error).message}`);
        performanceTimer.endPhase('scoreCalculation');
      }
    } else {
      responseLogger.info('Skipping AEO score calculation - no analysis results available');
    }

    // Mark transformation phase as completed (transformers were run within each analysis)
    performanceTimer.startPhase('transformation');
    performanceTimer.endPhase('transformation');

    // Generate comprehensive performance report
    const performanceReport = performanceTimer.getReport();
    const memoryReport = MemoryOptimizer.checkMemoryUsage();
    
    // Log performance summary
    responseLogger.info(`⚡ Performance Report: Total=${performanceReport.totalTime}ms, Memory=${memoryReport.used}MB (${memoryReport.percentage}%), Benchmarks: ${performanceReport.benchmarkStatus.totalTime === 'pass' ? '✅' : '❌'} Time, ${performanceReport.benchmarkStatus.memory === 'pass' ? '✅' : '❌'} Memory, ${performanceReport.benchmarkStatus.coreAnalysis === 'pass' ? '✅' : '❌'} Core`);
    responseLogger.info(`⚡ Phase Breakdown: Collection=${performanceReport.phases.dataCollection}ms, Discoverability=${performanceReport.phases.discoverability}ms, StructuredData=${performanceReport.phases.structuredData}ms, LLM=${performanceReport.phases.llmFormatting}ms, Accessibility=${performanceReport.phases.accessibility}ms, Readability=${performanceReport.phases.readability}ms, Score=${performanceReport.phases.scoreCalculation}ms`);
    
    // Memory cleanup
    MemoryOptimizer.cleanup([htmlData, robotsData, sitemapData, analysisResults]);

    // Calculate final total time
    const finalTotalTime = Date.now() - startTime;

    const response: CollectDataResponse = {
      success: overallSuccess,
      data: {
        url: normalizedUrl.href,
        html: htmlData,
        robotsTxt: robotsData,
        sitemap: sitemapData,
        metadata: {
          basic: basicMetadata,
          collection: {
            timestamp: new Date().toISOString(),
            userAgent: USER_AGENT,
            timeout: TIMEOUT_MS,
            maxContentSize: MAX_CONTENT_SIZE
          }
        }
      },
      logs: responseLogger.getLogs(),
      summary: {
        totalTime: finalTotalTime,
        successCount,
        failureCount,
        partialSuccess,
        analysisCompleted
      },
      analysis: Object.keys(analysisResults).length > 0 ? analysisResults : null
    };

    // Debug final response structure
    responseLogger.info(`Final response analysis field: ${response.analysis ? 'present' : 'null'}`);
    if (response.analysis) {
      Object.keys(response.analysis).forEach(analysisType => {
        const result = response.analysis![analysisType as keyof AnalysisResults];
        if (result && 'score' in result) {
          responseLogger.info(`${analysisType} score in response: ${result.score}`);
        } else if (result && 'totalScore' in result) {
          responseLogger.info(`${analysisType} score in response: ${result.totalScore}`);
        }
      });
    }
    responseLogger.info(`Summary analysisCompleted: ${response.summary.analysisCompleted}`);

    // Log final request
    logger.info(`POST /api/collect-data - 200 - ${finalTotalTime}ms`);
    
    return Response.json(response);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    responseLogger.error(`Data collection failed: ${(error as Error).message}`);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Collection Error',
      message: (error as Error).message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      logs: responseLogger.getLogs(),
      summary: {
        totalTime,
        successCount: 0,
        failureCount: 3,
        partialSuccess: false,
        analysisCompleted: false
      }
    };

    // Log error request
    logger.error(`POST /api/collect-data - 500 - ${totalTime}ms`);
    
    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/collect-data
 * Test endpoint for validating URLs before collection
 */
export async function GET(request: Request): Promise<Response> {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return Response.json({
        valid: false,
        normalizedUrl: null,
        message: 'URL parameter is required'
      }, { status: 400 });
    }
    
    const normalizedUrl = validateAndNormalizeUrl(url);
    
    const response = {
      valid: true,
      normalizedUrl: normalizedUrl.href,
      message: 'URL is valid and ready for collection'
    };

    const elapsed = Date.now() - startTime;
    logger.info(`GET /api/collect-data - 200 - ${elapsed}ms`);
    
    return Response.json(response);
    
  } catch (error) {
    const response = {
      valid: false,
      normalizedUrl: null,
      message: (error as Error).message
    };

    const elapsed = Date.now() - startTime;
    logger.info(`GET /api/collect-data - 200 - ${elapsed}ms`);
    
    return Response.json(response);
  }
} 