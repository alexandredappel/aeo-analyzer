/**
 * LLM-Friendly Formatting Analyzer for AEO Auditor
 * Analyzes content structure to optimize pages for LLM comprehension and parsing
 * Evaluates heading hierarchy, semantic HTML5, structured content, and navigation
 */

const cheerio = require('cheerio');
const logger = require('../utils/logger');

class LLMFormattingAnalyzer {
  constructor() {
    this.maxScore = 100;
    
    // Advanced weighted scoring criteria (total 100 points)
    this.criteria = {
      headingStructure: {
        hierarchy: 15,        // Logical H1-H6 structure
        quality: 10,          // Content quality and descriptiveness
        semanticValue: 10     // Information scent and navigation value
      },
      semanticElements: {
        structure: 12,        // Proper semantic HTML5 usage
        accessibility: 8,     // ARIA labels and landmarks
        contentFlow: 10       // Logical document outline
      },
      contentOrganization: {
        readability: 12,      // Text complexity and clarity
        structure: 8,         // Paragraph and section organization
        density: 5            // Content-to-markup ratio
      },
      linkQuality: {
        internal: 8,          // Internal link structure
        external: 5,          // External link quality
        context: 7            // Link context and relevance
      }
    };

    // Advanced cache with TTL and multi-level support
    this.advancedCache = {
      contentAnalysis: new Map(),
      readabilityMetrics: new Map(),
      accessibilityScores: new Map(),
      linkAnalysis: new Map()
    };
    
    // Cache configuration
    this.cacheConfig = {
      defaultTTL: 3600000, // 1 hour
      maxSize: 1000,
      checkPeriod: 600000  // 10 minutes
    };
    
    // Content type detection patterns
    this.contentTypePatterns = {
      article: {
        selectors: ['article', '[role="article"]', '.post', '.article', '.blog-post'],
        patterns: ['blog', 'news', 'post', 'article', 'story'],
        weight: 0
      },
      product: {
        selectors: ['.product', '[itemtype*="Product"]', '.item', '.price', '.buy-now'],
        patterns: ['shop', 'product', 'item', 'buy', 'price', 'cart', 'store'],
        weight: 0
      },
      documentation: {
        selectors: ['.docs', '.documentation', '.guide', '.api-docs', '.manual'],
        patterns: ['docs', 'guide', 'api', 'reference', 'manual', 'tutorial'],
        weight: 0
      },
      corporate: {
        selectors: ['.about', '.company', '.team', '.corporate'],
        patterns: ['about', 'company', 'team', 'contact', 'corporate', 'business'],
        weight: 0
      }
    };
    
    // Priority weights for recommendations
    this.priorityWeight = { critical: 0, high: 1, medium: 2, low: 3 };
  }

  /**
   * Advanced analysis method for LLM-friendly formatting
   * @param {string} htmlContent - HTML content to analyze
   * @param {string} url - URL being analyzed
   * @returns {Object} Analysis results with scoring and recommendations
   */
  async analyze(htmlContent, url) {
    logger.info('Starting advanced LLM-friendly formatting analysis...');
    
    try {
      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('Invalid HTML content provided');
      }

      // Check advanced cache first
      const cacheKey = `llm-advanced:${url}`;
      if (this.advancedCache.contentAnalysis.has(cacheKey)) {
        const cached = this.advancedCache.contentAnalysis.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheConfig.defaultTTL) {
          logger.info('Returning cached advanced LLM formatting analysis');
          return cached.data;
        }
      }

      const $ = cheerio.load(htmlContent);
      
      // Detect content type for specialized analysis
      const contentType = this.detectContentType(htmlContent, url);
      logger.info(`Detected content type: ${contentType.primary} (confidence: ${contentType.confidence})`);
      
      // Advanced parallel analysis
      const [headingResult, semanticResult, contentOrgResult, linkResult] = await Promise.allSettled([
        this.analyzeHeadingStructureAdvanced($, contentType),
        this.analyzeSemanticElementsAdvanced($),
        this.analyzeContentOrganization($),
        this.analyzeLinkQualityAdvanced($, url)
      ]);

      // Extract results from Promise.allSettled with enhanced error handling
      const headings = headingResult.status === 'fulfilled' ? headingResult.value : this.getFailureResult('headingStructure');
      const semantic = semanticResult.status === 'fulfilled' ? semanticResult.value : this.getFailureResult('semanticElements');
      const contentOrg = contentOrgResult.status === 'fulfilled' ? contentOrgResult.value : this.getFailureResult('contentOrganization');
      const links = linkResult.status === 'fulfilled' ? linkResult.value : this.getFailureResult('linkQuality');
      
      // Advanced validation
      const accessibility = await this.validateContentAccessibility($);
      const llmOptimization = this.validateLLMOptimization({ headings, semantic, contentOrg, links });
      
      // Calculate total score with new criteria
      const totalScore = Math.min(
        headings.score + semantic.score + contentOrg.score + links.score, 
        this.maxScore
      );
      
      // Generate advanced context-aware recommendations
      const recommendations = await this.generateAdvancedRecommendations(
        { headings, semantic, contentOrg, links }, 
        url, 
        contentType
      );
      
      // Create validation object
      const validation = {
        valid: totalScore > 0,
        issues: [],
        warnings: []
      };
      
      // Add validation issues based on scores
      if (headings.score < 20) {
        validation.issues.push('Poor heading structure affects content organization');
      }
      if (semantic.score < 20) {
        validation.issues.push('Insufficient semantic HTML usage');
      }
      if (contentOrg.score < 20) {
        validation.issues.push('Content organization needs improvement');
      }
      if (links.score < 15) {
        validation.warnings.push('Link quality could be enhanced');
      }
      
      const result = {
        score: totalScore,
        maxScore: this.maxScore,
        breakdown: {
          headingStructure: headings,
          semanticElements: semantic,
          structuredContent: contentOrg,
          citationsReferences: links
        },
        recommendations,
        validation,
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '1.0',
          features: ['heading-hierarchy', 'semantic-html5', 'structured-content', 'citations-analysis']
        }
      };
      
      // Cache result
      this.advancedCache.contentAnalysis.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      logger.info(`LLM formatting analysis completed. Score: ${totalScore}/${this.maxScore}`);
      return result;
      
    } catch (error) {
      logger.error(`LLM formatting analysis failed: ${error.message}`);
      
      return {
        score: 0,
        maxScore: this.maxScore,
        breakdown: {
          headingStructure: this.getFailureResult('headingStructure', error.message),
          semanticElements: this.getFailureResult('semanticElements', error.message),
          structuredContent: this.getFailureResult('contentOrganization', error.message),
          citationsReferences: this.getFailureResult('linkQuality', error.message)
        },
        recommendations: [`❌ LLM formatting analysis failed: ${error.message}`],
        validation: { valid: false, issues: [error.message], warnings: [] }
      };
    }
  }

  /**
   * Analyze heading hierarchy structure (H1-H6)
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Heading analysis result
   */
  analyzeHeadingStructure($) {
    const maxScore = Object.values(this.criteria.headingStructure).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      // Count all heading elements
      const headings = {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length,
        h4: $('h4').length,
        h5: $('h5').length,
        h6: $('h6').length
      };
      
      const totalHeadings = Object.values(headings).reduce((a, b) => a + b, 0);
      breakdown.structure = headings;
      
      if (totalHeadings === 0) {
        details = 'No heading elements found';
        breakdown.issues = ['No heading structure'];
        return { score, maxScore, status, details, breakdown };
      }
      
      // Analyze hierarchy quality
      const hierarchyAnalysis = this.validateHeadingHierarchy($);
      breakdown.hierarchy = hierarchyAnalysis;
      
      // Single H1 scoring (5 points)
      if (headings.h1 === 1) {
        score += this.criteria.headingStructure.singleH1;
        breakdown.singleH1 = { pass: true, count: 1 };
      } else if (headings.h1 === 0) {
        breakdown.singleH1 = { pass: false, count: 0, issue: 'Missing H1' };
      } else {
        breakdown.singleH1 = { pass: false, count: headings.h1, issue: 'Multiple H1 tags' };
      }
      
      // Hierarchy scoring (20 points)
      if (hierarchyAnalysis.logicalOrder && hierarchyAnalysis.skipLevels.length === 0) {
        score += this.criteria.headingStructure.hierarchy;
        breakdown.hierarchyScore = 'excellent';
      } else if (hierarchyAnalysis.logicalOrder) {
        score += this.criteria.headingStructure.hierarchy * 0.7;
        breakdown.hierarchyScore = 'good';
      } else {
        score += this.criteria.headingStructure.hierarchy * 0.3;
        breakdown.hierarchyScore = 'poor';
      }
      
      // Content quality scoring (10 points)
      const contentAnalysis = this.analyzeHeadingContent($);
      breakdown.content = contentAnalysis;
      
      if (contentAnalysis.averageLength >= 20 && contentAnalysis.emptyHeadings === 0) {
        score += this.criteria.headingStructure.content;
      } else if (contentAnalysis.averageLength >= 10 && contentAnalysis.emptyHeadings <= 1) {
        score += this.criteria.headingStructure.content * 0.7;
      } else {
        score += this.criteria.headingStructure.content * 0.3;
      }
      
      // Generate details string
      details = `${totalHeadings} headings found. H1: ${headings.h1}, Hierarchy: ${breakdown.hierarchyScore}, Avg length: ${contentAnalysis.averageLength} chars`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Heading structure analysis error: ${error.message}`);
      details = `Heading analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Validate heading hierarchy logic
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Hierarchy validation result
   */
  validateHeadingHierarchy($) {
    const headingElements = $('h1, h2, h3, h4, h5, h6').toArray();
    const headingLevels = headingElements.map(el => parseInt(el.tagName.charAt(1)));
    
    let logicalOrder = true;
    let skipLevels = [];
    let maxDepth = Math.max(...headingLevels) || 0;
    
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      
      // Check for skipped levels (e.g., h2 -> h4)
      if (current > previous + 1) {
        skipLevels.push(`h${previous}->h${current}`);
        logicalOrder = false;
      }
    }
    
    return {
      hasH1: headingLevels.includes(1),
      multipleH1: headingLevels.filter(level => level === 1).length > 1,
      logicalOrder,
      skipLevels: [...new Set(skipLevels)],
      maxDepth,
      sequence: headingLevels
    };
  }

  /**
   * Analyze heading content quality
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Content analysis result
   */
  analyzeHeadingContent($) {
    const headings = $('h1, h2, h3, h4, h5, h6');
    let totalLength = 0;
    let emptyHeadings = 0;
    let tooShort = 0;
    
    headings.each((i, el) => {
      const text = $(el).text().trim();
      totalLength += text.length;
      
      if (text.length === 0) {
        emptyHeadings++;
      } else if (text.length < 10) {
        tooShort++;
      }
    });
    
    return {
      total: headings.length,
      emptyHeadings,
      tooShort,
      averageLength: headings.length > 0 ? Math.round(totalLength / headings.length) : 0
    };
  }

  /**
   * Analyze semantic HTML5 elements usage
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Semantic elements analysis result
   */
  analyzeSemanticElements($) {
    const maxScore = Object.values(this.criteria.semanticElements).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      // Count semantic elements
      const structural = {
        article: $('article').length,
        section: $('section').length,
        nav: $('nav').length,
        aside: $('aside').length,
        header: $('header').length,
        footer: $('footer').length,
        main: $('main').length
      };
      
      const content = {
        figure: $('figure').length,
        figcaption: $('figcaption').length,
        blockquote: $('blockquote').length,
        cite: $('cite').length,
        time: $('time').length,
        address: $('address').length
      };
      
      breakdown.structural = structural;
      breakdown.content = content;
      
      // Calculate semantic ratio
      const semanticCount = Object.values(structural).reduce((a, b) => a + b, 0) + 
                           Object.values(content).reduce((a, b) => a + b, 0);
      const totalElements = $('*').length;
      const semanticRatio = totalElements > 0 ? semanticCount / totalElements : 0;
      
      breakdown.semanticRatio = Math.round(semanticRatio * 100) / 100;
      
      // Usage scoring (15 points)
      if (semanticRatio >= 0.15) {
        score += this.criteria.semanticElements.usage;
      } else if (semanticRatio >= 0.08) {
        score += this.criteria.semanticElements.usage * 0.7;
      } else if (semanticRatio >= 0.03) {
        score += this.criteria.semanticElements.usage * 0.4;
      }
      
      // Structure scoring (10 points)
      const structuralScore = this.evaluateSemanticStructure($, structural);
      score += structuralScore.score;
      breakdown.structureAnalysis = structuralScore;
      
      // Landmarks scoring (5 points)
      const landmarks = this.analyzeLandmarks(structural);
      score += landmarks.score;
      breakdown.landmarks = landmarks;
      
      // Generate details string
      const semanticPercentage = Math.round(semanticRatio * 100);
      details = `${semanticCount} semantic elements (${semanticPercentage}% ratio). Landmarks: ${landmarks.found.join(', ') || 'none'}`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Semantic elements analysis error: ${error.message}`);
      details = `Semantic analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Evaluate semantic structure quality
   * @param {Object} $ - Cheerio instance
   * @param {Object} structural - Structural elements count
   * @returns {Object} Structure evaluation result
   */
  evaluateSemanticStructure($, structural) {
    let score = 0;
    const maxPoints = this.criteria.semanticElements.structure;
    const issues = [];
    
    // Check for proper document structure
    if (structural.main >= 1) {
      score += 3;
    } else {
      issues.push('Missing main element');
    }
    
    if (structural.header >= 1) {
      score += 2;
    } else {
      issues.push('Missing header element');
    }
    
    if (structural.nav >= 1) {
      score += 2;
    } else {
      issues.push('Missing navigation element');
    }
    
    // Check for content organization
    if (structural.article > 0 || structural.section > 0) {
      score += 2;
    } else {
      issues.push('No content organization elements (article/section)');
    }
    
    // Bonus for complete structure
    if (structural.footer >= 1) {
      score += 1;
    }
    
    return {
      score: Math.min(score, maxPoints),
      maxPoints,
      issues,
      complete: issues.length === 0
    };
  }

  /**
   * Analyze landmark elements for accessibility
   * @param {Object} structural - Structural elements count
   * @returns {Object} Landmarks analysis result
   */
  analyzeLandmarks(structural) {
    const landmarks = ['main', 'nav', 'aside', 'header', 'footer'];
    const found = landmarks.filter(landmark => structural[landmark] > 0);
    const maxPoints = this.criteria.semanticElements.landmarks;
    
    let score = 0;
    if (found.length >= 4) {
      score = maxPoints;
    } else if (found.length >= 2) {
      score = maxPoints * 0.7;
    } else if (found.length >= 1) {
      score = maxPoints * 0.4;
    }
    
    return {
      score: Math.min(score, maxPoints),
      maxPoints,
      found,
      total: landmarks.length,
      coverage: Math.round((found.length / landmarks.length) * 100)
    };
  }

  /**
   * Analyze structured content (lists, tables, organization)
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Structured content analysis result
   */
  analyzeStructuredContent($) {
    const maxScore = Object.values(this.criteria.structuredContent).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      // Analyze lists
      const listsAnalysis = this.analyzeLists($);
      breakdown.lists = listsAnalysis;
      score += listsAnalysis.score;
      
      // Analyze tables
      const tablesAnalysis = this.analyzeTables($);
      breakdown.tables = tablesAnalysis;
      score += tablesAnalysis.score;
      
      // Analyze content organization
      const organizationAnalysis = this.analyzeContentOrganization($);
      breakdown.organization = organizationAnalysis;
      score += organizationAnalysis.score;
      
      // Generate details string
      const listCount = listsAnalysis.total;
      const tableCount = tablesAnalysis.total;
      details = `Lists: ${listCount}, Tables: ${tableCount}, Organization: ${organizationAnalysis.level}`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Structured content analysis error: ${error.message}`);
      details = `Structured content analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze lists structure and quality
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Lists analysis result
   */
  analyzeLists($) {
    const maxPoints = this.criteria.structuredContent.lists;
    let score = 0;
    
    const unordered = $('ul');
    const ordered = $('ol');
    const definition = $('dl');
    
    const analysis = {
      unordered: {
        count: unordered.length,
        nested: unordered.find('ul, ol').length,
        averageItems: this.calculateAverageListItems(unordered, $)
      },
      ordered: {
        count: ordered.length,
        nested: ordered.find('ul, ol').length,
        averageItems: this.calculateAverageListItems(ordered, $)
      },
      definition: {
        count: definition.length,
        properStructure: this.validateDefinitionLists($)
      },
      total: unordered.length + ordered.length + definition.length
    };
    
    // Scoring based on list usage and quality
    const totalLists = analysis.total;
    if (totalLists >= 5) {
      score += maxPoints;
    } else if (totalLists >= 3) {
      score += maxPoints * 0.8;
    } else if (totalLists >= 1) {
      score += maxPoints * 0.5;
    }
    
    return { ...analysis, score: Math.min(score, maxPoints), maxPoints };
  }

  /**
   * Calculate average items in lists
   * @param {Object} lists - jQuery list elements
   * @param {Object} $ - Cheerio instance
   * @returns {number} Average number of items
   */
  calculateAverageListItems(lists, $) {
    if (lists.length === 0) return 0;
    
    let totalItems = 0;
    lists.each((i, list) => {
      totalItems += $(list).children('li').length;
    });
    
    return Math.round(totalItems / lists.length);
  }

  /**
   * Validate definition lists structure
   * @param {Object} $ - Cheerio instance
   * @returns {boolean} Whether definition lists are properly structured
   */
  validateDefinitionLists($) {
    const definitionLists = $('dl');
    let valid = true;
    
    definitionLists.each((i, dl) => {
      const terms = $(dl).children('dt').length;
      const definitions = $(dl).children('dd').length;
      
      // Basic validation: should have both terms and definitions
      if (terms === 0 || definitions === 0) {
        valid = false;
      }
    });
    
    return valid;
  }

  /**
   * Analyze tables structure and accessibility
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Tables analysis result
   */
  analyzeTables($) {
    const maxPoints = this.criteria.structuredContent.tables;
    let score = 0;
    
    const tables = $('table');
    const withHeaders = tables.filter((i, table) => $(table).find('th').length > 0).length;
    const withCaption = tables.filter((i, table) => $(table).find('caption').length > 0).length;
    
    const analysis = {
      total: tables.length,
      withHeaders,
      withCaption,
      accessibility: this.analyzeTableAccessibility($),
      responsive: this.checkResponsiveTables($)
    };
    
    if (tables.length === 0) {
      score = maxPoints * 0.5; // Neutral score for no tables
    } else {
      // Score based on table quality
      const headerRatio = withHeaders / tables.length;
      const captionRatio = withCaption / tables.length;
      
      if (headerRatio >= 0.8 && analysis.accessibility.score > 0.7) {
        score = maxPoints;
      } else if (headerRatio >= 0.5) {
        score = maxPoints * 0.7;
      } else {
        score = maxPoints * 0.3;
      }
    }
    
    return { ...analysis, score: Math.min(score, maxPoints), maxPoints };
  }

  /**
   * Analyze table accessibility features
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Table accessibility analysis
   */
  analyzeTableAccessibility($) {
    const tables = $('table');
    let scopeUsage = 0;
    let summaryUsage = 0;
    
    tables.each((i, table) => {
      const $table = $(table);
      
      if ($table.find('[scope]').length > 0) {
        scopeUsage++;
      }
      
      if ($table.attr('summary') || $table.find('caption').length > 0) {
        summaryUsage++;
      }
    });
    
    const totalTables = tables.length;
    
    return {
      scope: totalTables > 0 ? scopeUsage / totalTables : 0,
      summary: totalTables > 0 ? summaryUsage / totalTables : 0,
      score: totalTables > 0 ? (scopeUsage + summaryUsage) / (totalTables * 2) : 0
    };
  }

  /**
   * Check for responsive table implementations
   * @param {Object} $ - Cheerio instance
   * @returns {boolean} Whether tables appear responsive
   */
  checkResponsiveTables($) {
    const tables = $('table');
    let responsiveCount = 0;
    
    tables.each((i, table) => {
      const $table = $(table);
      const classes = $table.attr('class') || '';
      const parent = $table.parent();
      
      // Check for common responsive patterns
      if (classes.includes('responsive') || 
          classes.includes('table-responsive') ||
          parent.hasClass('table-responsive') ||
          parent.hasClass('overflow-x-auto')) {
        responsiveCount++;
      }
    });
    
    return tables.length > 0 ? responsiveCount / tables.length >= 0.5 : true;
  }

  /**
   * Analyze content organization
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Content organization analysis
   */
  analyzeContentOrganization($) {
    const maxPoints = this.criteria.contentOrganization.organization;
    let score = 0;
    
    // Check for content organization patterns
    const articles = $('article').length;
    const sections = $('section').length;
    const paragraphs = $('p').length;
    const divs = $('div').length;
    
    // Calculate organization ratio
    const organizedContent = articles + sections;
    const totalContainers = organizedContent + divs;
    const organizationRatio = totalContainers > 0 ? organizedContent / totalContainers : 0;
    
    let level = 'poor';
    if (organizationRatio >= 0.3) {
      score = maxPoints;
      level = 'excellent';
    } else if (organizationRatio >= 0.15) {
      score = maxPoints * 0.7;
      level = 'good';
    } else if (organizedContent > 0) {
      score = maxPoints * 0.4;
      level = 'basic';
    }
    
    return {
      score: Math.min(score, maxPoints),
      maxPoints,
      level,
      organizationRatio: Math.round(organizationRatio * 100) / 100,
      articles,
      sections,
      paragraphs
    };
  }

  /**
   * Analyze citations and references
   * @param {Object} $ - Cheerio instance
   * @param {string} url - URL for context
   * @returns {Object} Citations and references analysis result
   */
  analyzeCitationsAndReferences($, url) {
    const maxScore = Object.values(this.criteria.citationsReferences).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      // Analyze citations
      const citationsAnalysis = this.analyzeCitations($);
      breakdown.citations = citationsAnalysis;
      score += citationsAnalysis.score;
      
      // Analyze link quality
      const linksAnalysis = this.analyzeLinkQuality($, url);
      breakdown.links = linksAnalysis;
      score += linksAnalysis.score;
      
      // Generate details string
      const citationCount = citationsAnalysis.total;
      const linkCount = linksAnalysis.total;
      const linkQuality = linksAnalysis.descriptiveRatio;
      
      details = `Citations: ${citationCount}, Links: ${linkCount}, Descriptive links: ${Math.round(linkQuality * 100)}%`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Citations and references analysis error: ${error.message}`);
      details = `Citations analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze citation elements
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Citations analysis result
   */
  analyzeCitations($) {
    const maxPoints = this.criteria.citationsReferences.citations;
    let score = 0;
    
    const blockquotes = $('blockquote').length;
    const cites = $('cite').length;
    const qs = $('q').length;
    
    // Check for proper attribution
    let properAttribution = 0;
    $('blockquote').each((i, el) => {
      const $blockquote = $(el);
      if ($blockquote.find('cite').length > 0 || $blockquote.attr('cite')) {
        properAttribution++;
      }
    });
    
    const total = blockquotes + cites + qs;
    const attributionRatio = blockquotes > 0 ? properAttribution / blockquotes : 1;
    
    // Scoring based on citation usage and quality
    if (total >= 3 && attributionRatio >= 0.8) {
      score = maxPoints;
    } else if (total >= 1 && attributionRatio >= 0.5) {
      score = maxPoints * 0.7;
    } else if (total >= 1) {
      score = maxPoints * 0.4;
    } else {
      score = maxPoints * 0.5; // Neutral for no citations
    }
    
    return {
      score: Math.min(score, maxPoints),
      maxPoints,
      total,
      blockquotes,
      cites,
      qs,
      properAttribution,
      attributionRatio: Math.round(attributionRatio * 100) / 100
    };
  }

  /**
   * Analyze link quality and descriptiveness
   * @param {Object} $ - Cheerio instance
   * @param {string} url - Current page URL
   * @returns {Object} Link quality analysis result
   */
  analyzeLinkQuality($, url) {
    const maxPoints = this.criteria.citationsReferences.linkQuality;
    let score = 0;
    
    const links = $('a[href]');
    let descriptive = 0;
    let generic = 0;
    let externalLinks = 0;
    let internalLinks = 0;
    
    // Generic link text patterns
    const genericPatterns = [
      /^click here$/i,
      /^read more$/i,
      /^more$/i,
      /^here$/i,
      /^link$/i,
      /^this$/i,
      /^continue$/i,
      /^go$/i
    ];
    
    links.each((i, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const text = $link.text().trim();
      
      // Classify internal vs external
      if (href.startsWith('http') && !href.includes(new URL(url).hostname)) {
        externalLinks++;
      } else if (href.startsWith('/') || href.includes(new URL(url).hostname)) {
        internalLinks++;
      }
      
      // Check link text quality
      if (text.length >= 3) {
        const isGeneric = genericPatterns.some(pattern => pattern.test(text));
        if (isGeneric) {
          generic++;
        } else if (text.length >= 10) {
          descriptive++;
        }
      }
    });
    
    const total = links.length;
    const descriptiveRatio = total > 0 ? descriptive / total : 0;
    
    // Scoring based on descriptive link ratio
    if (descriptiveRatio >= 0.8) {
      score = maxPoints;
    } else if (descriptiveRatio >= 0.6) {
      score = maxPoints * 0.8;
    } else if (descriptiveRatio >= 0.4) {
      score = maxPoints * 0.6;
    } else if (descriptiveRatio >= 0.2) {
      score = maxPoints * 0.4;
    } else {
      score = maxPoints * 0.2;
    }
    
    return {
      score: Math.min(score, maxPoints),
      maxPoints,
      total,
      descriptive,
      generic,
      externalLinks,
      internalLinks,
      descriptiveRatio: Math.round(descriptiveRatio * 100) / 100
    };
  }

  /**
   * Validate overall content structure
   * @param {Object} analysis - Combined analysis results
   * @returns {Object} Content structure validation
   */
  validateContentStructure(analysis) {
    const issues = [];
    const warnings = [];
    
    // Check heading issues
    if (analysis.headings.breakdown.singleH1 && !analysis.headings.breakdown.singleH1.pass) {
      if (analysis.headings.breakdown.singleH1.count === 0) {
        issues.push('Missing H1 tag - essential for content hierarchy');
      } else {
        issues.push('Multiple H1 tags found - use only one H1 per page');
      }
    }
    
    if (analysis.headings.breakdown.hierarchy && analysis.headings.breakdown.hierarchy.skipLevels.length > 0) {
      warnings.push(`Skipped heading levels: ${analysis.headings.breakdown.hierarchy.skipLevels.join(', ')}`);
    }
    
    // Check semantic structure issues
    if (analysis.semantic.breakdown.structureAnalysis && analysis.semantic.breakdown.structureAnalysis.issues.length > 0) {
      issues.push(...analysis.semantic.breakdown.structureAnalysis.issues.map(issue => `Semantic: ${issue}`));
    }
    
    // Check semantic ratio
    if (analysis.semantic.breakdown.semanticRatio < 0.05) {
      warnings.push('Very low semantic HTML usage - consider using more semantic elements');
    }
    
    // Check structured content
    if (analysis.structured.breakdown.tables && analysis.structured.breakdown.tables.total > 0) {
      const tableHeaderRatio = analysis.structured.breakdown.tables.withHeaders / analysis.structured.breakdown.tables.total;
      if (tableHeaderRatio < 0.5) {
        warnings.push('Many tables without proper headers - affects accessibility');
      }
    }
    
    // Check link quality
    if (analysis.citations.breakdown.links && analysis.citations.breakdown.links.descriptiveRatio < 0.3) {
      warnings.push('Many generic link texts found - use descriptive link text');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings,
      summary: `${issues.length} issues, ${warnings.length} warnings`
    };
  }

  /**
   * Generate context-aware LLM recommendations
   * @param {Object} headings - Heading analysis results
   * @param {Object} semantic - Semantic analysis results
   * @param {Object} structured - Structured content analysis results
   * @param {Object} citations - Citations analysis results
   * @param {string} url - URL for context
   * @returns {Array} Array of prioritized recommendations
   */
  async generateLLMRecommendations(headings, semantic, structured, citations, url) {
    const recommendations = [];
    
    // Critical heading issues
    if (headings.breakdown.singleH1 && !headings.breakdown.singleH1.pass) {
      const priority = headings.breakdown.singleH1.count === 0 ? 'critical' : 'high';
      const action = headings.breakdown.singleH1.count === 0 
        ? 'Add a single H1 tag to establish main topic hierarchy'
        : 'Use only one H1 tag per page - convert additional H1s to H2 or lower';
      
      recommendations.push({
        priority,
        category: 'headings',
        issue: headings.breakdown.singleH1.issue,
        action,
        impact: 'Critical for LLM topic understanding and content hierarchy'
      });
    }
    
    // Heading hierarchy issues
    if (headings.breakdown.hierarchy && headings.breakdown.hierarchy.skipLevels.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'headings',
        issue: `Skipped heading levels: ${headings.breakdown.hierarchy.skipLevels.join(', ')}`,
        action: 'Follow logical heading sequence (H1→H2→H3) without skipping levels',
        impact: 'Improves content structure comprehension by LLMs'
      });
    }
    
    // Semantic HTML recommendations
    if (semantic.breakdown.semanticRatio < 0.1) {
      recommendations.push({
        priority: 'high',
        category: 'semantic',
        issue: 'Very low semantic HTML5 usage',
        action: 'Replace generic divs with semantic elements (article, section, nav, header, footer)',
        impact: 'Significantly enhances LLM content understanding and parsing'
      });
    }
    
    // Missing landmarks
    if (semantic.breakdown.landmarks && semantic.breakdown.landmarks.found.length < 2) {
      recommendations.push({
        priority: 'medium',
        category: 'semantic',
        issue: 'Missing essential landmark elements',
        action: 'Add main, nav, and header elements for better content structure',
        impact: 'Helps LLMs identify content regions and navigation'
      });
    }
    
    // Content organization
    if (structured.breakdown.organization && structured.breakdown.organization.organizationRatio < 0.15) {
      recommendations.push({
        priority: 'medium',
        category: 'structure',
        issue: 'Poor content organization structure',
        action: 'Use article and section elements to organize content logically',
        impact: 'Improves content hierarchy recognition by LLMs'
      });
    }
    
    // Link quality issues
    if (citations.breakdown.links && citations.breakdown.links.descriptiveRatio < 0.5) {
      recommendations.push({
        priority: 'low',
        category: 'links',
        issue: 'Many generic link texts found',
        action: 'Use descriptive link text instead of "click here" or "read more"',
        impact: 'Provides better context for LLM link understanding'
      });
    }
    
    // Table accessibility
    if (structured.breakdown.tables && structured.breakdown.tables.total > 0) {
      const headerRatio = structured.breakdown.tables.withHeaders / structured.breakdown.tables.total;
      if (headerRatio < 0.7) {
        recommendations.push({
          priority: 'medium',
          category: 'tables',
          issue: 'Tables without proper headers',
          action: 'Add th elements and scope attributes to table headers',
          impact: 'Enables better table structure understanding by LLMs'
        });
      }
    }
    
    // Sort by priority
    recommendations.sort((a, b) => this.priorityWeight[a.priority] - this.priorityWeight[b.priority]);
    
    // Convert to simple strings for backward compatibility
    return recommendations.map(rec => 
      `${this.getPriorityIcon(rec.priority)} ${rec.action} (${rec.impact})`
    );
  }

  /**
   * Get priority icon for recommendations
   * @param {string} priority - Priority level
   * @returns {string} Icon representation
   */
  getPriorityIcon(priority) {
    const icons = {
      critical: '🚨',
      high: '❌',
      medium: '⚠️',
      low: '💡'
    };
    return icons[priority] || '💡';
  }

  /**
   * Detect content type based on HTML structure and URL patterns
   * @param {string} htmlContent - HTML content to analyze
   * @param {string} url - URL being analyzed
   * @returns {Object} Content type detection result
   */
  detectContentType(htmlContent, url) {
    const $ = cheerio.load(htmlContent);
    const indicators = JSON.parse(JSON.stringify(this.contentTypePatterns)); // Deep clone
    
    try {
      // Calculate weights for each content type
      Object.keys(indicators).forEach(type => {
        const typeData = indicators[type];
        
        // Weight based on selectors
        typeData.selectors.forEach(selector => {
          if ($(selector).length > 0) {
            typeData.weight += 2;
          }
        });
        
        // Weight based on URL patterns
        typeData.patterns.forEach(pattern => {
          if (url.toLowerCase().includes(pattern)) {
            typeData.weight += 1;
          }
        });
        
        // Weight based on page text content
        const pageText = $('body').text().toLowerCase();
        typeData.patterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'gi');
          const matches = pageText.match(regex);
          if (matches) {
            typeData.weight += Math.min(matches.length * 0.1, 1);
          }
        });
      });
      
      // Sort by weight and return primary type
      const sortedTypes = Object.entries(indicators)
        .sort(([,a], [,b]) => b.weight - a.weight);
      
      return {
        primary: sortedTypes[0][0],
        confidence: sortedTypes[0][1].weight,
        alternatives: sortedTypes.slice(1, 3).map(([type, data]) => ({
          type,
          confidence: data.weight
        }))
      };
      
    } catch (error) {
      logger.warn(`Content type detection failed: ${error.message}`);
      return {
        primary: 'generic',
        confidence: 0,
        alternatives: []
      };
    }
  }

  /**
   * Advanced heading structure analysis with semantic value assessment
   * @param {Object} $ - Cheerio instance
   * @param {Object} contentType - Detected content type
   * @returns {Object} Advanced heading analysis result
   */
  analyzeHeadingStructureAdvanced($, contentType) {
    const maxScore = Object.values(this.criteria.headingStructure).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      const headings = $('h1, h2, h3, h4, h5, h6').toArray();
      
      if (headings.length === 0) {
        details = 'No headings found';
        return { score: 0, maxScore, status, details, breakdown: { noHeadings: true } };
      }
      
      // Basic hierarchy analysis
      const hierarchyAnalysis = this.validateHeadingHierarchy($);
      breakdown.hierarchy = hierarchyAnalysis;
      
      // Content quality analysis
      const contentAnalysis = this.analyzeHeadingContentAdvanced($);
      breakdown.content = contentAnalysis;
      
      // Semantic value analysis
      const semanticAnalysis = this.analyzeHeadingSemanticValue($, contentType);
      breakdown.semantic = semanticAnalysis;
      
      // Hierarchy scoring (15 points)
      if (hierarchyAnalysis.hasH1 && !hierarchyAnalysis.multipleH1 && hierarchyAnalysis.logicalOrder) {
        score += this.criteria.headingStructure.hierarchy;
      } else if (hierarchyAnalysis.hasH1 && hierarchyAnalysis.logicalOrder) {
        score += this.criteria.headingStructure.hierarchy * 0.8;
      } else if (hierarchyAnalysis.hasH1) {
        score += this.criteria.headingStructure.hierarchy * 0.5;
      }
      
      // Quality scoring (10 points)
      if (contentAnalysis.descriptiveness > 80) {
        score += this.criteria.headingStructure.quality;
      } else if (contentAnalysis.descriptiveness > 60) {
        score += this.criteria.headingStructure.quality * 0.8;
      } else if (contentAnalysis.descriptiveness > 40) {
        score += this.criteria.headingStructure.quality * 0.5;
      }
      
      // Semantic value scoring (10 points)
      if (semanticAnalysis.informationScent > 80) {
        score += this.criteria.headingStructure.semanticValue;
      } else if (semanticAnalysis.informationScent > 60) {
        score += this.criteria.headingStructure.semanticValue * 0.8;
      } else if (semanticAnalysis.informationScent > 40) {
        score += this.criteria.headingStructure.semanticValue * 0.5;
      }
      
      // Generate advanced details
      details = `${headings.length} headings. Hierarchy: ${hierarchyAnalysis.logicalOrder ? 'logical' : 'broken'}, Quality: ${Math.round(contentAnalysis.descriptiveness)}%, Semantic value: ${Math.round(semanticAnalysis.informationScent)}%`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Advanced heading analysis error: ${error.message}`);
      details = `Heading analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze heading content quality with advanced metrics
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Advanced content analysis
   */
  analyzeHeadingContentAdvanced($) {
    const headings = $('h1, h2, h3, h4, h5, h6');
    let totalLength = 0;
    let descriptiveCount = 0;
    let duplicates = 0;
    let keywordStuffing = false;
    
    const headingTexts = [];
    
    headings.each((i, el) => {
      const text = $(el).text().trim();
      headingTexts.push(text.toLowerCase());
      totalLength += text.length;
      
      // Check descriptiveness (avoid generic terms)
      const genericTerms = ['click here', 'read more', 'home', 'about', 'contact', 'here', 'more'];
      const isDescriptive = !genericTerms.some(term => text.toLowerCase().includes(term)) && text.length > 5;
      if (isDescriptive) descriptiveCount++;
      
      // Check for keyword stuffing (repeated words)
      const words = text.toLowerCase().split(/\s+/);
      const wordCounts = {};
      words.forEach(word => {
        if (word.length > 3) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          if (wordCounts[word] > 3) keywordStuffing = true;
        }
      });
    });
    
    // Check for duplicates
    const uniqueTexts = new Set(headingTexts);
    duplicates = headingTexts.length - uniqueTexts.size;
    
    const descriptiveness = headings.length > 0 ? (descriptiveCount / headings.length) * 100 : 0;
    
    return {
      total: headings.length,
      averageLength: headings.length > 0 ? Math.round(totalLength / headings.length) : 0,
      descriptiveness,
      duplicates,
      keywordStuffing
    };
  }

  /**
   * Analyze heading semantic value for LLM understanding
   * @param {Object} $ - Cheerio instance
   * @param {Object} contentType - Content type context
   * @returns {Object} Semantic value analysis
   */
  analyzeHeadingSemanticValue($, contentType) {
    const headings = $('h1, h2, h3, h4, h5, h6');
    let informationScent = 0;
    let navigationValue = 0;
    
    // Content type specific analysis
    const expectations = {
      article: ['introduction', 'conclusion', 'summary', 'analysis'],
      documentation: ['overview', 'installation', 'usage', 'examples', 'api'],
      product: ['features', 'specifications', 'pricing', 'reviews'],
      corporate: ['mission', 'team', 'services', 'portfolio']
    };
    
    const expectedTerms = expectations[contentType.primary] || [];
    let expectedTermsFound = 0;
    
    headings.each((i, el) => {
      const text = $(el).text().toLowerCase();
      
      // Check for expected content type terms
      expectedTerms.forEach(term => {
        if (text.includes(term)) expectedTermsFound++;
      });
      
      // Evaluate information scent (how well heading previews content)
      const words = text.split(/\s+/).length;
      if (words >= 3 && words <= 8) {
        informationScent += 20;
      } else if (words >= 2) {
        informationScent += 10;
      }
    });
    
    // Calculate scores
    informationScent = Math.min(informationScent, 100);
    navigationValue = expectedTerms.length > 0 ? (expectedTermsFound / expectedTerms.length) * 100 : 50;
    
    return {
      informationScent,
      navigationValue,
      expectedTermsFound,
      contentTypeAlignment: navigationValue
    };
  }

  /**
   * Advanced semantic elements analysis with accessibility focus
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Advanced semantic analysis result
   */
  analyzeSemanticElementsAdvanced($) {
    const maxScore = Object.values(this.criteria.semanticElements).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      // Enhanced semantic structure analysis
      const structureAnalysis = this.analyzeSemanticStructure($);
      breakdown.structure = structureAnalysis;
      
      // Accessibility analysis
      const accessibilityAnalysis = this.analyzeAccessibilityFeatures($);
      breakdown.accessibility = accessibilityAnalysis;
      
      // Content flow analysis
      const contentFlowAnalysis = this.analyzeContentFlow($);
      breakdown.contentFlow = contentFlowAnalysis;
      
      // Structure scoring (12 points)
      if (structureAnalysis.semanticRatio > 0.15) {
        score += this.criteria.semanticElements.structure;
      } else if (structureAnalysis.semanticRatio > 0.08) {
        score += this.criteria.semanticElements.structure * 0.7;
      } else if (structureAnalysis.semanticRatio > 0.03) {
        score += this.criteria.semanticElements.structure * 0.4;
      }
      
      // Accessibility scoring (8 points)
      if (accessibilityAnalysis.score > 80) {
        score += this.criteria.semanticElements.accessibility;
      } else if (accessibilityAnalysis.score > 60) {
        score += this.criteria.semanticElements.accessibility * 0.7;
      } else if (accessibilityAnalysis.score > 40) {
        score += this.criteria.semanticElements.accessibility * 0.4;
      }
      
      // Content flow scoring (10 points)
      if (contentFlowAnalysis.logicalFlow > 80) {
        score += this.criteria.semanticElements.contentFlow;
      } else if (contentFlowAnalysis.logicalFlow > 60) {
        score += this.criteria.semanticElements.contentFlow * 0.7;
      } else if (contentFlowAnalysis.logicalFlow > 40) {
        score += this.criteria.semanticElements.contentFlow * 0.4;
      }
      
      details = `Semantic ratio: ${Math.round(structureAnalysis.semanticRatio * 100)}%, Accessibility: ${Math.round(accessibilityAnalysis.score)}%, Flow: ${Math.round(contentFlowAnalysis.logicalFlow)}%`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Advanced semantic analysis error: ${error.message}`);
      details = `Semantic analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze semantic structure with enhanced metrics
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Semantic structure analysis
   */
  analyzeSemanticStructure($) {
    const structural = {
      article: $('article').length,
      section: $('section').length,
      nav: $('nav').length,
      aside: $('aside').length,
      header: $('header').length,
      footer: $('footer').length,
      main: $('main').length
    };
    
    const content = {
      figure: $('figure').length,
      figcaption: $('figcaption').length,
      blockquote: $('blockquote').length,
      cite: $('cite').length,
      time: $('time').length,
      address: $('address').length
    };
    
    const semanticCount = Object.values(structural).reduce((a, b) => a + b, 0) + 
                         Object.values(content).reduce((a, b) => a + b, 0);
    const totalElements = $('*').length;
    const semanticRatio = totalElements > 0 ? semanticCount / totalElements : 0;
    
    return {
      structural,
      content,
      semanticCount,
      totalElements,
      semanticRatio
    };
  }

  /**
   * Analyze accessibility features
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Accessibility analysis
   */
  analyzeAccessibilityFeatures($) {
    let score = 0;
    const features = {
      ariaLabels: $('[aria-label]').length,
      ariaDescribedBy: $('[aria-describedby]').length,
      altTexts: $('img[alt]').length,
      totalImages: $('img').length,
      skipLinks: $('a[href^="#"]').filter((i, el) => $(el).text().toLowerCase().includes('skip')).length,
      headingStructure: $('h1').length === 1 && $('h1, h2, h3, h4, h5, h6').length > 0
    };
    
    // Calculate accessibility score
    if (features.ariaLabels > 0) score += 20;
    if (features.totalImages > 0 && features.altTexts / features.totalImages > 0.8) score += 20;
    if (features.skipLinks > 0) score += 15;
    if (features.headingStructure) score += 25;
    if (features.ariaDescribedBy > 0) score += 10;
    
    return { score: Math.min(score, 100), features };
  }

  /**
   * Analyze content flow and logical structure
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Content flow analysis
   */
  analyzeContentFlow($) {
    let logicalFlow = 0;
    const analysis = {
      hasMain: $('main').length > 0,
      hasHeader: $('header').length > 0,
      hasFooter: $('footer').length > 0,
      hasNav: $('nav').length > 0,
      articleStructure: $('article').length > 0 || $('[role="article"]').length > 0,
      sectionHierarchy: $('section').length > 0
    };
    
    // Calculate logical flow score
    Object.values(analysis).forEach(value => {
      if (value) logicalFlow += 16.67; // Each element contributes ~16.67% to 100%
    });
    
    return { logicalFlow: Math.min(logicalFlow, 100), ...analysis };
  }

  /**
   * Analyze content organization and readability
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Content organization analysis
   */
  analyzeContentOrganization($) {
    const maxScore = Object.values(this.criteria.contentOrganization).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      // Structure analysis
      const structureAnalysis = this.analyzeContentStructure($);
      breakdown.structure = structureAnalysis;
      
      // Readability analysis
      const readabilityAnalysis = this.analyzeReadability($);
      breakdown.readability = readabilityAnalysis;
      
      // Density analysis
      const densityAnalysis = this.analyzeContentDensity($);
      breakdown.density = densityAnalysis;
      
      // Readability scoring (12 points)
      if (readabilityAnalysis.score > 80) {
        score += this.criteria.contentOrganization.readability;
      } else if (readabilityAnalysis.score > 60) {
        score += this.criteria.contentOrganization.readability * 0.7;
      } else if (readabilityAnalysis.score > 40) {
        score += this.criteria.contentOrganization.readability * 0.4;
      }
      
      // Structure scoring (8 points)
      if (structureAnalysis.score > 80) {
        score += this.criteria.contentOrganization.structure;
      } else if (structureAnalysis.score > 60) {
        score += this.criteria.contentOrganization.structure * 0.7;
      } else if (structureAnalysis.score > 40) {
        score += this.criteria.contentOrganization.structure * 0.4;
      }
      
      // Density scoring (5 points)
      if (densityAnalysis.ratio > 0.5) {
        score += this.criteria.contentOrganization.density;
      } else if (densityAnalysis.ratio > 0.3) {
        score += this.criteria.contentOrganization.density * 0.7;
      } else if (densityAnalysis.ratio > 0.2) {
        score += this.criteria.contentOrganization.density * 0.4;
      }
      
      details = `Readability: ${readabilityAnalysis.level}, Structure: ${structureAnalysis.score > 70 ? 'good' : 'fair'}, Density: ${Math.round(densityAnalysis.ratio * 100)}%`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Content organization analysis error: ${error.message}`);
      details = `Content analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze content structure quality
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Structure analysis
   */
  analyzeContentStructure($) {
    const paragraphs = $('p');
    let score = 0;
    
    const analysis = {
      paragraphCount: paragraphs.length,
      averageParagraphLength: 0,
      wellStructuredParagraphs: 0
    };
    
    if (paragraphs.length > 0) {
      let totalLength = 0;
      paragraphs.each((i, el) => {
        const text = $(el).text().trim();
        totalLength += text.length;
        
        // Well-structured paragraph: 50-500 characters
        if (text.length >= 50 && text.length <= 500) {
          analysis.wellStructuredParagraphs++;
        }
      });
      
      analysis.averageParagraphLength = Math.round(totalLength / paragraphs.length);
      
      // Score based on paragraph quality
      const wellStructuredRatio = analysis.wellStructuredParagraphs / paragraphs.length;
      score = wellStructuredRatio * 100;
    }
    
    return { score: Math.min(score, 100), ...analysis };
  }

  /**
   * Analyze text readability
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Readability analysis
   */
  analyzeReadability($) {
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = textContent.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return { score: 0, level: 'unknown', complexity: 0 };
    }
    
    // Calculate basic readability metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.estimateSyllables(words);
    
    // Simple readability score (based on Flesch formula concept)
    const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    let level = 'advanced';
    if (readabilityScore > 70) level = 'elementary';
    else if (readabilityScore > 50) level = 'intermediate';
    
    return {
      score: Math.max(0, Math.min(readabilityScore, 100)),
      level,
      complexity: avgWordsPerSentence,
      wordCount: words.length,
      sentenceCount: sentences.length
    };
  }

  /**
   * Estimate syllables in words (simple heuristic)
   * @param {Array} words - Array of words
   * @returns {number} Average syllables per word
   */
  estimateSyllables(words) {
    let totalSyllables = 0;
    
    words.forEach(word => {
      word = word.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length === 0) return;
      
      // Simple syllable counting heuristic
      let syllables = word.split(/[aeiouy]+/).length - 1;
      if (syllables === 0) syllables = 1;
      if (word.endsWith('e')) syllables--;
      totalSyllables += Math.max(1, syllables);
    });
    
    return words.length > 0 ? totalSyllables / words.length : 0;
  }

  /**
   * Analyze content density (text to markup ratio)
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Density analysis
   */
  analyzeContentDensity($) {
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const htmlContent = $.html();
    
    const textLength = textContent.length;
    const htmlLength = htmlContent.length;
    const ratio = htmlLength > 0 ? textLength / htmlLength : 0;
    
    return {
      textLength,
      htmlLength,
      ratio,
      score: Math.min(ratio * 200, 100) // Normalize to 0-100 scale
    };
  }

  /**
   * Advanced link quality analysis
   * @param {Object} $ - Cheerio instance
   * @param {string} url - Base URL for internal link detection
   * @returns {Object} Advanced link analysis
   */
  analyzeLinkQualityAdvanced($, url) {
    const maxScore = Object.values(this.criteria.linkQuality).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown = {};
    
    try {
      const links = $('a[href]');
      const baseHost = new URL(url).hostname;
      
      const analysis = {
        internal: { count: 0, descriptive: 0, contextual: 0 },
        external: { count: 0, descriptive: 0, authority: 0 },
        context: { total: links.length, descriptive: 0, generic: 0 }
      };
      
      // Analyze each link
      links.each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const isDescriptive = this.isDescriptiveLink(text);
        
        if (isDescriptive) {
          analysis.context.descriptive++;
        } else {
          analysis.context.generic++;
        }
        
        try {
          const linkUrl = new URL(href, url);
          if (linkUrl.hostname === baseHost) {
            analysis.internal.count++;
            if (isDescriptive) analysis.internal.descriptive++;
            if (this.hasContextualClues($, el)) analysis.internal.contextual++;
          } else {
            analysis.external.count++;
            if (isDescriptive) analysis.external.descriptive++;
            if (this.isAuthorityDomain(linkUrl.hostname)) analysis.external.authority++;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });
      
      breakdown = analysis;
      
      // Internal links scoring (8 points)
      if (analysis.internal.count > 0) {
        const internalQuality = analysis.internal.descriptive / analysis.internal.count;
        if (internalQuality > 0.8) {
          score += this.criteria.linkQuality.internal;
        } else if (internalQuality > 0.6) {
          score += this.criteria.linkQuality.internal * 0.8;
        } else if (internalQuality > 0.4) {
          score += this.criteria.linkQuality.internal * 0.5;
        }
      }
      
      // External links scoring (5 points)
      if (analysis.external.count > 0) {
        const externalQuality = (analysis.external.descriptive + analysis.external.authority) / (analysis.external.count * 2);
        if (externalQuality > 0.7) {
          score += this.criteria.linkQuality.external;
        } else if (externalQuality > 0.5) {
          score += this.criteria.linkQuality.external * 0.8;
        } else if (externalQuality > 0.3) {
          score += this.criteria.linkQuality.external * 0.5;
        }
      }
      
      // Context scoring (7 points)
      if (analysis.context.total > 0) {
        const contextQuality = analysis.context.descriptive / analysis.context.total;
        if (contextQuality > 0.8) {
          score += this.criteria.linkQuality.context;
        } else if (contextQuality > 0.6) {
          score += this.criteria.linkQuality.context * 0.8;
        } else if (contextQuality > 0.4) {
          score += this.criteria.linkQuality.context * 0.5;
        }
      }
      
      const descriptiveRatio = analysis.context.total > 0 ? Math.round((analysis.context.descriptive / analysis.context.total) * 100) : 0;
      details = `Internal: ${analysis.internal.count}, External: ${analysis.external.count}, Descriptive: ${descriptiveRatio}%`;
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'excellent';
      } else if (score >= maxScore * 0.6) {
        status = 'good';
      } else if (score >= maxScore * 0.3) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Link quality analysis error: ${error.message}`);
      details = `Link analysis error: ${error.message}`;
      breakdown = { error: error.message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Check if link text is descriptive
   * @param {string} text - Link text
   * @returns {boolean} Whether the link is descriptive
   */
  isDescriptiveLink(text) {
    const genericTerms = [
      'click here', 'read more', 'learn more', 'here', 'more', 'link',
      'this', 'continue', 'next', 'previous', 'go', 'see more'
    ];
    
    const lowercaseText = text.toLowerCase().trim();
    return !genericTerms.includes(lowercaseText) && text.length > 3;
  }

  /**
   * Check if link has contextual clues around it
   * @param {Object} $ - Cheerio instance
   * @param {Object} el - Link element
   * @returns {boolean} Whether link has contextual clues
   */
  hasContextualClues($, el) {
    const parent = $(el).parent();
    const siblings = parent.contents();
    
    // Check if there's descriptive text before or after the link
    let hasContext = false;
    siblings.each((i, sibling) => {
      if (sibling.nodeType === 3) { // Text node
        const text = $(sibling).text().trim();
        if (text.length > 10) hasContext = true;
      }
    });
    
    return hasContext;
  }

  /**
   * Check if domain is considered authoritative
   * @param {string} hostname - Domain hostname
   * @returns {boolean} Whether domain is authoritative
   */
  isAuthorityDomain(hostname) {
    const authorityDomains = [
      'wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org',
      'w3.org', 'google.com', 'microsoft.com', 'apple.com', 'adobe.com',
      'npmjs.com', 'jquery.com', 'bootstrap.com'
    ];
    
    return authorityDomains.some(domain => hostname.includes(domain));
  }

  /**
   * Validate content accessibility with WCAG compliance
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Accessibility validation result
   */
  validateContentAccessibility($) {
    const issues = [];
    const warnings = [];
    let wcagCompliance = 100;
    
    try {
      // Check for skip links
      const skipLinks = $('a[href^="#"]').filter((i, el) => 
        $(el).text().toLowerCase().includes('skip') || 
        $(el).text().toLowerCase().includes('jump')
      );
      if (skipLinks.length === 0) {
        issues.push('Missing skip navigation links for accessibility');
        wcagCompliance -= 15;
      }
      
      // Check heading hierarchy
      const h1Count = $('h1').length;
      if (h1Count === 0) {
        issues.push('Missing H1 heading affects document structure');
        wcagCompliance -= 20;
      } else if (h1Count > 1) {
        issues.push('Multiple H1 headings affect document outline');
        wcagCompliance -= 10;
      }
      
      // Check images without alt text
      const imagesWithoutAlt = $('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);
        wcagCompliance -= Math.min(imagesWithoutAlt.length * 5, 20);
      }
      
      // Check semantic structure ratio
      const semanticRatio = this.calculateSemanticRatio($);
      if (semanticRatio < 0.1) {
        warnings.push('Low semantic HTML usage affects assistive technologies');
        wcagCompliance -= 10;
      }
      
    } catch (error) {
      logger.error(`Accessibility validation error: ${error.message}`);
      issues.push(`Accessibility validation failed: ${error.message}`);
      wcagCompliance = 0;
    }
    
    return {
      wcagCompliance: Math.max(0, wcagCompliance),
      issues,
      warnings,
      screenReaderFriendly: wcagCompliance > 70
    };
  }

  /**
   * Calculate semantic HTML ratio
   * @param {Object} $ - Cheerio instance
   * @returns {number} Semantic elements ratio
   */
  calculateSemanticRatio($) {
    const semanticElements = $('article, section, nav, aside, header, footer, main, figure, figcaption, time, address').length;
    const totalElements = $('*').length;
    
    return totalElements > 0 ? semanticElements / totalElements : 0;
  }

  /**
   * Validate LLM optimization
   * @param {Object} analysis - Combined analysis results
   * @returns {Object} LLM optimization validation
   */
  validateLLMOptimization(analysis) {
    const llmIssues = [];
    const optimizations = [];
    let llmOptimizationScore = 100;
    
    try {
      // Text-to-markup ratio
      if (analysis.contentOrg && analysis.contentOrg.breakdown.density.ratio < 0.3) {
        llmIssues.push('Low text-to-markup ratio may confuse LLM parsing');
        optimizations.push('Reduce unnecessary HTML complexity');
        llmOptimizationScore -= 20;
      }
      
      // Heading semantic value
      if (analysis.headings && analysis.headings.breakdown.semantic.informationScent < 60) {
        llmIssues.push('Headings lack semantic value for content understanding');
        optimizations.push('Improve heading descriptiveness and information scent');
        llmOptimizationScore -= 15;
      }
      
      // Link contextual relevance
      if (analysis.links && analysis.links.breakdown.context.descriptive < analysis.links.breakdown.context.total * 0.7) {
        llmIssues.push('Links lack contextual information for relationship understanding');
        optimizations.push('Add more descriptive anchor text and context');
        llmOptimizationScore -= 15;
      }
      
    } catch (error) {
      logger.error(`LLM optimization validation error: ${error.message}`);
      llmIssues.push(`LLM optimization validation failed: ${error.message}`);
      llmOptimizationScore = 0;
    }
    
    return {
      llmOptimizationScore: Math.max(0, llmOptimizationScore),
      llmSpecificIssues: llmIssues,
      optimizationSuggestions: optimizations
    };
  }

  /**
   * Generate advanced context-aware recommendations
   * @param {Object} analysis - Combined analysis results
   * @param {string} url - URL being analyzed
   * @param {Object} contentType - Detected content type
   * @returns {Array} Advanced recommendations
   */
  generateAdvancedRecommendations(analysis, url, contentType) {
    const recommendations = [];
    
    try {
      // Content type specific recommendations
      if (contentType.primary === 'article') {
        if (!analysis.semantic.breakdown.structure.structural.article) {
          recommendations.push({
            priority: 'high',
            category: 'semantic',
            issue: 'Missing article structure',
            action: 'Wrap main content in <article> element with proper sections',
            impact: 'Significantly improves LLM content boundary detection',
            effort: 'low'
          });
        }
      }
      
      // Accessibility-first recommendations
      if (analysis.semantic.breakdown.accessibility.score < 70) {
        recommendations.push({
          priority: 'high',
          category: 'accessibility',
          issue: 'Poor screen reader compatibility',
          action: 'Add ARIA labels and improve heading structure',
          impact: 'Enhances both accessibility and LLM understanding',
          effort: 'medium'
        });
      }
      
      // Semantic HTML recommendations
      if (analysis.semantic.breakdown.structure.semanticRatio < 0.15) {
        recommendations.push({
          priority: 'medium',
          category: 'semantic',
          issue: 'Low semantic HTML usage',
          action: 'Replace generic divs with semantic elements (article, section, nav, header, footer)',
          impact: 'Significantly enhances LLM content understanding and parsing',
          effort: 'medium'
        });
      }
      
      // Sort by priority and limit results
      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      }).slice(0, 6)
        .map(rec => `${this.getPriorityIcon(rec.priority)} ${rec.action} (${rec.impact})`);
      
    } catch (error) {
      logger.error(`Advanced recommendations generation failed: ${error.message}`);
      return ['⚠️ Could not generate recommendations due to analysis error'];
    }
  }

  /**
   * Get failure result for error handling - Updated for new criteria
   * @param {string} category - Category that failed
   * @param {string} error - Error message
   * @returns {Object} Failure result object
   */
  getFailureResult(category, error = 'Analysis failed') {
    const maxScores = {
      headingStructure: Object.values(this.criteria.headingStructure).reduce((a, b) => a + b, 0),
      semanticElements: Object.values(this.criteria.semanticElements).reduce((a, b) => a + b, 0),
      contentOrganization: Object.values(this.criteria.contentOrganization).reduce((a, b) => a + b, 0),
      linkQuality: Object.values(this.criteria.linkQuality).reduce((a, b) => a + b, 0)
    };
    
    return {
      score: 0,
      maxScore: maxScores[category] || 0,
      status: 'fail',
      details: error,
      breakdown: { error }
    };
  }
}

module.exports = LLMFormattingAnalyzer; 