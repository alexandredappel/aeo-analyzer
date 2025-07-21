/**
 * Data Collection Route for AEO Auditor
 * Orchestrates HTML, robots.txt, and sitemap.xml collection
 */

const crawler = require('../services/crawler');
const { analyzeDiscoverability } = require('../services/discoverability-analyzer');
const StructuredDataAnalyzer = require('../services/structured-data-analyzer');
const LLMFormattingAnalyzer = require('../services/llm-formatting-analyzer');
const AccessibilityAnalyzer = require('../services/accessibility-analyzer');
const ReadabilityAnalyzer = require('../services/readability-analyzer');
const AEOScoreCalculator = require('../services/aeo-score-calculator');
const logger = require('../utils/logger');

/**
 * Custom logger that captures logs for response
 */
class ResponseLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  log(level, message) {
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
        logger.success(message);
        break;
      case 'warn':
        logger.warn(message);
        break;
      case 'error':
        logger.error(message);
        break;
    }
  }

  info(message) { this.log('info', message); }
  success(message) { this.log('success', message); }
  warn(message) { this.log('warn', message); }
  error(message) { this.log('error', message); }
}

/**
 * Request validation schema
 */
const collectDataSchema = {
  body: {
    type: 'object',
    required: ['url'],
    properties: {
      url: {
        type: 'string',
        minLength: 1,
        maxLength: 2048,
        description: 'URL to analyze for AEO optimization'
      }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            html: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
                error: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            robotsTxt: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
                error: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            sitemap: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
                error: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            metadata: { type: 'object' }
          }
        },
        logs: {
          type: 'array',
          items: { type: 'string' }
        },
        summary: {
          type: 'object',
          properties: {
            totalTime: { type: 'number' },
            successCount: { type: 'number' },
            failureCount: { type: 'number' },
            partialSuccess: { type: 'boolean' },
            analysisCompleted: { type: 'boolean' }
          }
        },
        analysis: {
          type: 'object',
          properties: {
            discoverability: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                maxScore: { type: 'number' },
                breakdown: {
                  type: 'object',
                  properties: {
                    httpsProtocol: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    httpStatus: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    robotsTxtAiBots: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    sitemapPresent: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            structuredData: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                maxScore: { type: 'number' },
                breakdown: {
                  type: 'object',
                  properties: {
                    jsonLd: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    metaTags: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    openGraph: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            llmFormatting: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                maxScore: { type: 'number' },
                breakdown: {
                  type: 'object',
                  properties: {
                    headingStructure: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    semanticElements: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    structuredContent: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    citationsReferences: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            accessibility: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                maxScore: { type: 'number' },
                breakdown: {
                  type: 'object',
                  properties: {
                    criticalDOM: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    performance: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    images: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            readability: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                maxScore: { type: 'number' },
                breakdown: {
                  type: 'object',
                  properties: {
                    fleschScore: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    sentenceComplexity: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    },
                    contentDensity: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        maxScore: { type: 'number' },
                        status: { type: 'string' },
                        details: { type: 'string' }
                      }
                    }
                  }
                },
                details: {
                  type: 'object',
                  properties: {
                    fleschLevel: { type: 'string' },
                    averageSentenceLength: { type: 'number' },
                    wordCount: { type: 'number' },
                    uniqueWords: { type: 'number' },
                    contentDensityRatio: { type: 'number' }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            aeoScore: {
              type: 'object',
              properties: {
                totalScore: { type: 'number' },
                maxScore: { type: 'number' },
                breakdown: {
                  type: 'object',
                  properties: {
                    discoverability: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        weight: { type: 'number' },
                        contribution: { type: 'number' }
                      }
                    },
                    structuredData: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        weight: { type: 'number' },
                        contribution: { type: 'number' }
                      }
                    },
                    llmFormatting: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        weight: { type: 'number' },
                        contribution: { type: 'number' }
                      }
                    },
                    accessibility: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        weight: { type: 'number' },
                        contribution: { type: 'number' }
                      }
                    },
                    readability: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        weight: { type: 'number' },
                        contribution: { type: 'number' }
                      }
                    }
                  }
                },
                completeness: { type: 'string' },
                metadata: {
                  type: 'object',
                  properties: {
                    totalWeight: { type: 'number' },
                    completedAnalyses: { type: 'number' },
                    totalAnalyses: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        statusCode: { type: 'number' },
        timestamp: { type: 'string' }
      }
    }
  }
};

/**
 * Register data collection routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
async function collectDataRoutes(fastify) {
  
  /**
   * POST /api/collect-data
   * Collect HTML, robots.txt, and sitemap.xml data for AEO analysis
   */
  fastify.post('/api/collect-data', {
    schema: collectDataSchema,
    preValidation: async (request, reply) => {
      // Additional URL validation
      const { url } = request.body;
      
      try {
        // Test URL validation
        crawler.validateAndNormalizeUrl(url);
      } catch (error) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: error.message,
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, async (request, reply) => {
    const responseLogger = new ResponseLogger();
    const startTime = Date.now();
    
    try {
      const { url } = request.body;
      
      responseLogger.info(`Starting data collection for: ${url}`);
      
      // Normalize URL for consistent processing
      const normalizedUrl = crawler.validateAndNormalizeUrl(url);
      responseLogger.info(`Normalized URL: ${normalizedUrl.href}`);
      
      // Collect data in parallel for better performance
      responseLogger.info('Starting parallel data collection...');
      
      const [htmlResult, robotsResult, sitemapResult] = await Promise.allSettled([
        (async () => {
          responseLogger.info('Fetching HTML content...');
          const result = await crawler.fetchStaticHTML(normalizedUrl.href);
          if (result.success) {
            responseLogger.success(`HTML collected: ${result.metadata.contentLength} bytes`);
          } else {
            responseLogger.error(`HTML collection failed: ${result.error}`);
          }
          return result;
        })(),
        
        (async () => {
          responseLogger.info('Fetching robots.txt...');
          const result = await crawler.fetchRobotsTxt(normalizedUrl.href);
          if (result.success) {
            responseLogger.success(`robots.txt collected: ${result.metadata.contentLength} bytes`);
          } else {
            responseLogger.warn(`robots.txt collection failed: ${result.error}`);
          }
          return result;
        })(),
        
        (async () => {
          responseLogger.info('Fetching sitemap.xml...');
          const result = await crawler.fetchSitemap(normalizedUrl.href);
          if (result.success) {
            responseLogger.success(`sitemap.xml collected: ${result.metadata.contentLength} bytes`);
          } else {
            responseLogger.warn(`sitemap.xml collection failed: ${result.error}`);
          }
          return result;
        })()
      ]);

      // Process results
      const htmlData = htmlResult.status === 'fulfilled' ? htmlResult.value : { 
        success: false, 
        error: htmlResult.reason?.message || 'Unknown error' 
      };
      
      const robotsData = robotsResult.status === 'fulfilled' ? robotsResult.value : { 
        success: false, 
        error: robotsResult.reason?.message || 'Unknown error' 
      };
      
      const sitemapData = sitemapResult.status === 'fulfilled' ? sitemapResult.value : { 
        success: false, 
        error: sitemapResult.reason?.message || 'Unknown error' 
      };

      // Calculate success metrics
      const successCount = [htmlData, robotsData, sitemapData].filter(result => result.success).length;
      const totalCount = 3;
      const failureCount = totalCount - successCount;
      const partialSuccess = successCount > 0 && successCount < totalCount;
      
      const totalTime = Date.now() - startTime;
      
      // Extract basic metadata if HTML was successful
      let basicMetadata = {};
      if (htmlData.success) {
        try {
          basicMetadata = crawler.extractBasicMetadata(htmlData.data);
          responseLogger.info(`Extracted basic metadata: ${Object.keys(basicMetadata).length} fields`);
        } catch (error) {
          responseLogger.warn(`Failed to extract metadata: ${error.message}`);
        }
      }

      // Determine overall success
      const overallSuccess = htmlData.success; // HTML is critical for some analyses
      
      if (overallSuccess) {
        responseLogger.success(`Data collection completed in ${totalTime}ms`);
      } else {
        responseLogger.warn(`Partial data collection - HTML fetch unsuccessful but continuing analysis`);
      }
      
      // Log summary
      responseLogger.info(`Summary: ${successCount}/${totalCount} successful, ${failureCount} failed, partial: ${partialSuccess}`);

      // Perform AEO analyses
      let analysisResults = {};
      let analysisCompleted = false;
      
      responseLogger.info(`Starting analysis check - overallSuccess: ${overallSuccess}`);
      
      // Discoverability analysis can work with just URL, robots.txt, and sitemap
      const canAnalyzeDiscoverability = true; // Always attempt discoverability analysis
      
      if (canAnalyzeDiscoverability) {
        try {
          responseLogger.info('Starting discoverability analysis...');
          
          const collectedData = {
            url: normalizedUrl.href,
            html: htmlData,
            robotsTxt: robotsData,
            sitemap: sitemapData
          };
          
          responseLogger.info(`Collected data structure: url=${collectedData.url}, html.success=${htmlData.success}, robots.success=${robotsData.success}, sitemap.success=${sitemapData.success}`);
          
          const discoverabilityResult = analyzeDiscoverability(collectedData);
          analysisResults.discoverability = discoverabilityResult;
          
          responseLogger.success(`Discoverability analysis completed! Score: ${discoverabilityResult.score}/100`);
          responseLogger.info(`Analysis result structure: category=${discoverabilityResult.category}, score=${discoverabilityResult.score}`);
          
        } catch (error) {
          responseLogger.error(`Discoverability analysis failed: ${error.message}`);
          responseLogger.error(`Error stack: ${error.stack}`);
        }
      }
      
      // Structured data analysis requires HTML content
      if (htmlData.success && htmlData.data) {
        try {
          responseLogger.info('Starting structured data analysis...');
          
          const structuredDataAnalyzer = new StructuredDataAnalyzer();
          const structuredDataResult = await structuredDataAnalyzer.analyze(htmlData.data, normalizedUrl.href);
          analysisResults.structuredData = structuredDataResult;
          
          responseLogger.success(`Structured data analysis completed! Score: ${structuredDataResult.score}/100`);
          responseLogger.info(`Structured data breakdown: JSON-LD=${structuredDataResult.breakdown.jsonLd.score}, Meta=${structuredDataResult.breakdown.metaTags.score}, OG=${structuredDataResult.breakdown.openGraph.score}`);
          
        } catch (error) {
          responseLogger.error(`Structured data analysis failed: ${error.message}`);
          responseLogger.error(`Error stack: ${error.stack}`);
        }
        
        // LLM formatting analysis
        try {
          responseLogger.info('Starting LLM-friendly formatting analysis...');
          
          const llmFormattingAnalyzer = new LLMFormattingAnalyzer();
          const llmFormattingResult = await llmFormattingAnalyzer.analyze(htmlData.data, normalizedUrl.href);
          analysisResults.llmFormatting = llmFormattingResult;
          
          responseLogger.success(`LLM formatting analysis completed! Score: ${llmFormattingResult.score}/100`);
          responseLogger.info(`LLM formatting breakdown: Headings=${llmFormattingResult.breakdown.headingStructure.score}, Semantic=${llmFormattingResult.breakdown.semanticElements.score}, Structured=${llmFormattingResult.breakdown.structuredContent.score}, Citations=${llmFormattingResult.breakdown.citationsReferences.score}`);
          
        } catch (error) {
          responseLogger.error(`LLM formatting analysis failed: ${error.message}`);
          responseLogger.error(`Error stack: ${error.stack}`);
        }
        
        // Accessibility analysis
        try {
          responseLogger.info('Starting accessibility analysis...');
          
          const accessibilityAnalyzer = new AccessibilityAnalyzer();
          const accessibilityResult = await accessibilityAnalyzer.analyze(htmlData.data, normalizedUrl.href);
          analysisResults.accessibility = accessibilityResult;
          
          responseLogger.success(`Accessibility analysis completed! Score: ${accessibilityResult.score}/100`);
          responseLogger.info(`Accessibility breakdown: Critical DOM=${accessibilityResult.breakdown.criticalDOM.score}, Performance=${accessibilityResult.breakdown.performance.score}, Images=${accessibilityResult.breakdown.images.score}`);
          
        } catch (error) {
          responseLogger.error(`Accessibility analysis failed: ${error.message}`);
          responseLogger.error(`Error stack: ${error.stack}`);
        }
        
        // Readability analysis
        try {
          responseLogger.info('Starting readability analysis...');
          
          const readabilityAnalyzer = new ReadabilityAnalyzer();
          const readabilityResult = await readabilityAnalyzer.analyze(htmlData.data, normalizedUrl.href);
          analysisResults.readability = readabilityResult;
          
          responseLogger.success(`Readability analysis completed! Score: ${readabilityResult.score}/100`);
          responseLogger.info(`Readability breakdown: Flesch=${readabilityResult.breakdown.fleschScore}, Complexity=${readabilityResult.breakdown.sentenceComplexity}, Density=${readabilityResult.breakdown.contentDensity}`);
          
        } catch (error) {
          responseLogger.error(`Readability analysis failed: ${error.message}`);
          responseLogger.error(`Error stack: ${error.stack}`);
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
          responseLogger.info(`${type} score: ${analysisResults[type].score}/${analysisResults[type].maxScore}`);
        });
      }

      // Recalculate total time to include analysis time
      const finalTotalTime = Date.now() - startTime;

      const response = {
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
              userAgent: crawler.USER_AGENT,
              timeout: crawler.TIMEOUT_MS,
              maxContentSize: crawler.MAX_CONTENT_SIZE
            }
          }
        },
        logs: responseLogger.logs,
        summary: {
          totalTime: finalTotalTime,
          successCount,
          failureCount,
          partialSuccess,
          analysisCompleted
        }
      };

      // Add analysis results if available
      if (Object.keys(analysisResults).length > 0) {
        response.analysis = analysisResults;
      } else {
        response.analysis = null;
      }

      // Calculate AEO score if analysis results are available
      if (Object.keys(analysisResults).length > 0) {
        try {
          responseLogger.info('Starting AEO score calculation...');
          
          const aeoScoreCalculator = new AEOScoreCalculator();
          

          
          const aeoScoreResult = aeoScoreCalculator.calculateAEOScore(analysisResults);
          
          response.analysis.aeoScore = aeoScoreResult;
          
          responseLogger.success(`AEO score calculation completed: ${aeoScoreResult.totalScore}/100`);
          responseLogger.info(`AEO score breakdown: ${aeoScoreResult.completeness}`);

          
        } catch (error) {
          responseLogger.error(`AEO score calculation failed: ${error.message}`);
          responseLogger.error(`Error stack: ${error.stack}`);
        }
      } else {
        responseLogger.info('Skipping AEO score calculation - no analysis results available');
      }

      // Debug final response structure
      responseLogger.info(`Final response analysis field: ${response.analysis ? 'present' : 'null'}`);
      if (response.analysis) {
        Object.keys(response.analysis).forEach(analysisType => {
          responseLogger.info(`${analysisType} score in response: ${response.analysis[analysisType].score}`);
        });
      }
      responseLogger.info(`Summary analysisCompleted: ${response.summary.analysisCompleted}`);

      // Log final request
      logger.request(request.method, request.url, 200, totalTime);
      
      return reply.code(200).send(response);
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      responseLogger.error(`Data collection failed: ${error.message}`);
      
      const errorResponse = {
        success: false,
        error: 'Collection Error',
        message: error.message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        logs: responseLogger.logs,
        summary: {
          totalTime,
          successCount: 0,
          failureCount: 3,
          partialSuccess: false,
          analysisCompleted: false
        }
      };

      // Log error request
      logger.request(request.method, request.url, 500, totalTime);
      
      return reply.code(500).send(errorResponse);
    }
  });

  /**
   * GET /api/collect-data/test
   * Test endpoint for validating URLs before collection
   */
  fastify.get('/api/collect-data/test', {
    schema: {
      querystring: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            normalizedUrl: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const { url } = request.query;
      
      const normalizedUrl = crawler.validateAndNormalizeUrl(url);
      
      const response = {
        valid: true,
        normalizedUrl: normalizedUrl.href,
        message: 'URL is valid and ready for collection'
      };

      const elapsed = Date.now() - startTime;
      logger.request(request.method, request.url, 200, elapsed);
      
      return reply.code(200).send(response);
      
    } catch (error) {
      const response = {
        valid: false,
        normalizedUrl: null,
        message: error.message
      };

      const elapsed = Date.now() - startTime;
      logger.request(request.method, request.url, 200, elapsed);
      
      return reply.code(200).send(response);
    }
  });
}

module.exports = collectDataRoutes; 