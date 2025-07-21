/**
 * LLM-Friendly Formatting Analyzer for AEO Auditor
 * Analyzes content structure to optimize pages for LLM comprehension and parsing
 * Evaluates heading hierarchy, semantic HTML5, structured content, and navigation
 */

import * as cheerio from 'cheerio';
import logger from '@/utils/logger';

// Types and interfaces
interface CriteriaWeights {
  headingStructure: {
    hierarchy: number;
    quality: number;
    semanticValue: number;
  };
  semanticElements: {
    structure: number;
    accessibility: number;
    contentFlow: number;
  };
  contentOrganization: {
    readability: number;
    structure: number;
    density: number;
  };
  linkQuality: {
    internal: number;
    external: number;
    context: number;
  };
}

interface ContentTypePattern {
  selectors: string[];
  patterns: string[];
  weight: number;
}

interface ContentTypePatterns {
  article: ContentTypePattern;
  product: ContentTypePattern;
  documentation: ContentTypePattern;
  corporate: ContentTypePattern;
}

interface AdvancedCache {
  contentAnalysis: Map<string, CacheEntry>;
  readabilityMetrics: Map<string, CacheEntry>;
  accessibilityScores: Map<string, CacheEntry>;
  linkAnalysis: Map<string, CacheEntry>;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  checkPeriod: number;
}

interface PriorityWeight {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ContentType {
  primary: string;
  confidence: number;
  alternatives: Array<{ type: string; confidence: number }>;
}

interface HeadingStructure {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
}

interface HierarchyAnalysis {
  hasH1: boolean;
  multipleH1: boolean;
  logicalOrder: boolean;
  skipLevels: string[];
  maxDepth: number;
  sequence: number[];
}

interface HeadingContentAnalysis {
  total: number;
  emptyHeadings: number;
  tooShort: number;
  averageLength: number;
}

interface AnalysisResult {
  score: number;
  maxScore: number;
  status: string;
  details: string;
  breakdown: any;
}

interface HeadingContentAdvanced {
  total: number;
  averageLength: number;
  descriptiveness: number;
  duplicates: number;
  keywordStuffing: boolean;
}

interface HeadingSemanticValue {
  informationScent: number;
  navigationValue: number;
  expectedTermsFound: number;
  contentTypeAlignment: number;
}

interface SemanticStructureAnalysis {
  structural: Record<string, number>;
  content: Record<string, number>;
  semanticCount: number;
  totalElements: number;
  semanticRatio: number;
}

interface AccessibilityFeatures {
  score: number;
  features: {
    ariaLabels: number;
    ariaDescribedBy: number;
    altTexts: number;
    totalImages: number;
    skipLinks: number;
    headingStructure: boolean;
  };
}

interface ContentFlow {
  logicalFlow: number;
  hasMain: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
  hasNav: boolean;
  articleStructure: boolean;
  sectionHierarchy: boolean;
}

interface StructureAnalysis {
  score: number;
  paragraphCount: number;
  averageParagraphLength: number;
  wellStructuredParagraphs: number;
}

interface ReadabilityAnalysis {
  score: number;
  level: string;
  complexity: number;
  wordCount: number;
  sentenceCount: number;
}

interface DensityAnalysis {
  textLength: number;
  htmlLength: number;
  ratio: number;
  score: number;
}

interface LinkAnalysis {
  internal: { count: number; descriptive: number; contextual: number };
  external: { count: number; descriptive: number; authority: number };
  context: { total: number; descriptive: number; generic: number };
}

interface AccessibilityValidation {
  wcagCompliance: number;
  issues: string[];
  warnings: string[];
  screenReaderFriendly: boolean;
}

interface LLMOptimization {
  llmOptimizationScore: number;
  llmSpecificIssues: string[];
  optimizationSuggestions: string[];
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  action: string;
  impact: string;
  effort?: string;
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

interface LLMFormattingResult {
  score: number;
  maxScore: number;
  breakdown: {
    headingStructure: AnalysisResult;
    semanticElements: AnalysisResult;
    structuredContent: AnalysisResult;
    citationsReferences: AnalysisResult;
  };
  recommendations: string[];
  validation: ValidationResult;
  metadata: {
    analyzedAt: string;
    version: string;
    features: string[];
  };
  error?: string;
}

export class LLMFormattingAnalyzer {
  private maxScore: number;
  private criteria: CriteriaWeights;
  private advancedCache: AdvancedCache;
  private cacheConfig: CacheConfig;
  private contentTypePatterns: ContentTypePatterns;
  private priorityWeight: PriorityWeight;

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
   * @param htmlContent - HTML content to analyze
   * @param url - URL being analyzed
   * @returns Analysis results with scoring and recommendations
   */
  async analyze(htmlContent: string, url: string): Promise<LLMFormattingResult> {
    logger.info('Starting advanced LLM-friendly formatting analysis...');
    
    try {
      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('Invalid HTML content provided');
      }

      // Check advanced cache first
      const cacheKey = `llm-advanced:${url}`;
      if (this.advancedCache.contentAnalysis.has(cacheKey)) {
        const cached = this.advancedCache.contentAnalysis.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheConfig.defaultTTL) {
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
      const validation: ValidationResult = {
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
      
      const result: LLMFormattingResult = {
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
      logger.error(`LLM formatting analysis failed: ${(error as Error).message}`);
      
      return {
        score: 0,
        maxScore: this.maxScore,
        breakdown: {
          headingStructure: this.getFailureResult('headingStructure', (error as Error).message),
          semanticElements: this.getFailureResult('semanticElements', (error as Error).message),
          structuredContent: this.getFailureResult('contentOrganization', (error as Error).message),
          citationsReferences: this.getFailureResult('linkQuality', (error as Error).message)
        },
        recommendations: [`❌ LLM formatting analysis failed: ${(error as Error).message}`],
        validation: { valid: false, issues: [(error as Error).message], warnings: [] },
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '1.0',
          features: ['error-recovery']
        },
        error: (error as Error).message
      };
    }
  }

  /**
   * Validate heading hierarchy logic
   * @param $ - Cheerio instance
   * @returns Hierarchy validation result
   */
  validateHeadingHierarchy($: cheerio.CheerioAPI): HierarchyAnalysis {
    const headingElements = $('h1, h2, h3, h4, h5, h6').toArray();
    const headingLevels = headingElements.map(el => parseInt(el.tagName.charAt(1)));
    
    let logicalOrder = true;
    let skipLevels: string[] = [];
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
      skipLevels: Array.from(new Set(skipLevels)),
      maxDepth,
      sequence: headingLevels
    };
  }

  /**
   * Analyze heading content quality
   * @param $ - Cheerio instance
   * @returns Content analysis result
   */
  analyzeHeadingContent($: cheerio.CheerioAPI): HeadingContentAnalysis {
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
   * Detect content type based on HTML structure and URL patterns
   * @param htmlContent - HTML content to analyze
   * @param url - URL being analyzed
   * @returns Content type detection result
   */
  detectContentType(htmlContent: string, url: string): ContentType {
    const $ = cheerio.load(htmlContent);
    const indicators = JSON.parse(JSON.stringify(this.contentTypePatterns)); // Deep clone
    
    try {
      // Calculate weights for each content type
      Object.keys(indicators).forEach(type => {
        const typeData = indicators[type as keyof ContentTypePatterns];
        
        // Weight based on selectors
        typeData.selectors.forEach((selector: string) => {
          if ($(selector).length > 0) {
            typeData.weight += 2;
          }
        });
        
        // Weight based on URL patterns
        typeData.patterns.forEach((pattern: string) => {
          if (url.toLowerCase().includes(pattern)) {
            typeData.weight += 1;
          }
        });
        
        // Weight based on page text content
        const pageText = $('body').text().toLowerCase();
        typeData.patterns.forEach((pattern: string) => {
          const regex = new RegExp(pattern, 'gi');
          const matches = pageText.match(regex);
          if (matches) {
            typeData.weight += Math.min(matches.length * 0.1, 1);
          }
        });
      });
      
      // Sort by weight and return primary type
      const sortedTypes = Object.entries(indicators)
        .sort(([,a], [,b]) => (b as ContentTypePattern).weight - (a as ContentTypePattern).weight);
      
      return {
        primary: sortedTypes[0][0],
        confidence: (sortedTypes[0][1] as ContentTypePattern).weight,
        alternatives: sortedTypes.slice(1, 3).map(([type, data]) => ({
          type,
          confidence: (data as ContentTypePattern).weight
        }))
      };
      
    } catch (error) {
      logger.warn(`Content type detection failed: ${(error as Error).message}`);
      return {
        primary: 'generic',
        confidence: 0,
        alternatives: []
      };
    }
  }

  /**
   * Advanced heading structure analysis with semantic value assessment
   * @param $ - Cheerio instance
   * @param contentType - Detected content type
   * @returns Advanced heading analysis result
   */
  analyzeHeadingStructureAdvanced($: cheerio.CheerioAPI, contentType: ContentType): AnalysisResult {
    const maxScore = Object.values(this.criteria.headingStructure).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown: any = {};
    
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
      logger.error(`Advanced heading analysis error: ${(error as Error).message}`);
      details = `Heading analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze heading content quality with advanced metrics
   * @param $ - Cheerio instance
   * @returns Advanced content analysis
   */
  analyzeHeadingContentAdvanced($: cheerio.CheerioAPI): HeadingContentAdvanced {
    const headings = $('h1, h2, h3, h4, h5, h6');
    let totalLength = 0;
    let descriptiveCount = 0;
    let duplicates = 0;
    let keywordStuffing = false;
    
    const headingTexts: string[] = [];
    
    headings.each((i, el) => {
      const text = $(el).text().trim();
      headingTexts.push(text.toLowerCase());
      totalLength += text.length;
      
      // Check descriptiveness (avoid generic terms)
      const genericTerms = ['click here', 'read more', 'learn more', 'here', 'more', 'link',
      'this', 'continue', 'next', 'previous', 'go', 'see more'];
      const isDescriptive = !genericTerms.some(term => text.toLowerCase().includes(term)) && text.length > 5;
      if (isDescriptive) descriptiveCount++;
      
      // Check for keyword stuffing (repeated words)
      const words = text.toLowerCase().split(/\s+/);
      const wordCounts: Record<string, number> = {};
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
   * @param $ - Cheerio instance
   * @param contentType - Content type context
   * @returns Semantic value analysis
   */
  analyzeHeadingSemanticValue($: cheerio.CheerioAPI, contentType: ContentType): HeadingSemanticValue {
    const headings = $('h1, h2, h3, h4, h5, h6');
    let informationScent = 0;
    let navigationValue = 0;
    
    // Content type specific analysis
    const expectations: Record<string, string[]> = {
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
   * @param $ - Cheerio instance
   * @returns Advanced semantic analysis result
   */
  analyzeSemanticElementsAdvanced($: cheerio.CheerioAPI): AnalysisResult {
    const maxScore = Object.values(this.criteria.semanticElements).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown: any = {};
    
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
      logger.error(`Advanced semantic analysis error: ${(error as Error).message}`);
      details = `Semantic analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze semantic structure with enhanced metrics
   * @param $ - Cheerio instance
   * @returns Semantic structure analysis
   */
  analyzeSemanticStructure($: cheerio.CheerioAPI): SemanticStructureAnalysis {
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
   * @param $ - Cheerio instance
   * @returns Accessibility analysis
   */
  analyzeAccessibilityFeatures($: cheerio.CheerioAPI): AccessibilityFeatures {
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
   * @param $ - Cheerio instance
   * @returns Content flow analysis
   */
  analyzeContentFlow($: cheerio.CheerioAPI): ContentFlow {
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
   * @param $ - Cheerio instance
   * @returns Content organization analysis
   */
  analyzeContentOrganization($: cheerio.CheerioAPI): AnalysisResult {
    const maxScore = Object.values(this.criteria.contentOrganization).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown: any = {};
    
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
      logger.error(`Content organization analysis error: ${(error as Error).message}`);
      details = `Content analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze content structure quality
   * @param $ - Cheerio instance
   * @returns Structure analysis
   */
  analyzeContentStructure($: cheerio.CheerioAPI): StructureAnalysis {
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
   * @param $ - Cheerio instance
   * @returns Readability analysis
   */
  analyzeReadability($: cheerio.CheerioAPI): ReadabilityAnalysis {
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = textContent.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return { score: 0, level: 'unknown', complexity: 0, wordCount: 0, sentenceCount: 0 };
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
   * @param words - Array of words
   * @returns Average syllables per word
   */
  estimateSyllables(words: string[]): number {
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
   * @param $ - Cheerio instance
   * @returns Density analysis
   */
  analyzeContentDensity($: cheerio.CheerioAPI): DensityAnalysis {
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
   * @param $ - Cheerio instance
   * @param url - Base URL for internal link detection
   * @returns Advanced link analysis
   */
  analyzeLinkQualityAdvanced($: cheerio.CheerioAPI, url: string): AnalysisResult {
    const maxScore = Object.values(this.criteria.linkQuality).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown: any = {};
    
    try {
      const links = $('a[href]');
      const baseHost = new URL(url).hostname;
      
      const analysis: LinkAnalysis = {
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
          if (href) {
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
      logger.error(`Link quality analysis error: ${(error as Error).message}`);
      details = `Link analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Check if link text is descriptive
   * @param text - Link text
   * @returns Whether the link is descriptive
   */
  isDescriptiveLink(text: string): boolean {
    const genericTerms = [
      'click here', 'read more', 'learn more', 'here', 'more', 'link',
      'this', 'continue', 'next', 'previous', 'go', 'see more'
    ];
    
    const lowercaseText = text.toLowerCase().trim();
    return !genericTerms.includes(lowercaseText) && text.length > 3;
  }

  /**
   * Check if link has contextual clues around it
   * @param $ - Cheerio instance
   * @param el - Link element
   * @returns Whether link has contextual clues
   */
  hasContextualClues($: cheerio.CheerioAPI, el: any): boolean {
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
   * @param hostname - Domain hostname
   * @returns Whether domain is authoritative
   */
  isAuthorityDomain(hostname: string): boolean {
    const authorityDomains = [
      'wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org',
      'w3.org', 'google.com', 'microsoft.com', 'apple.com', 'adobe.com',
      'npmjs.com', 'jquery.com', 'bootstrap.com'
    ];
    
    return authorityDomains.some(domain => hostname.includes(domain));
  }

  /**
   * Validate content accessibility with WCAG compliance
   * @param $ - Cheerio instance
   * @returns Accessibility validation result
   */
  validateContentAccessibility($: cheerio.CheerioAPI): AccessibilityValidation {
    const issues: string[] = [];
    const warnings: string[] = [];
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
      logger.error(`Accessibility validation error: ${(error as Error).message}`);
      issues.push(`Accessibility validation failed: ${(error as Error).message}`);
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
   * @param $ - Cheerio instance
   * @returns Semantic elements ratio
   */
  calculateSemanticRatio($: cheerio.CheerioAPI): number {
    const semanticElements = $('article, section, nav, aside, header, footer, main, figure, figcaption, time, address').length;
    const totalElements = $('*').length;
    
    return totalElements > 0 ? semanticElements / totalElements : 0;
  }

  /**
   * Validate LLM optimization
   * @param analysis - Combined analysis results
   * @returns LLM optimization validation
   */
  validateLLMOptimization(analysis: any): LLMOptimization {
    const llmIssues: string[] = [];
    const optimizations: string[] = [];
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
      logger.error(`LLM optimization validation error: ${(error as Error).message}`);
      llmIssues.push(`LLM optimization validation failed: ${(error as Error).message}`);
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
   * @param analysis - Combined analysis results
   * @param url - URL being analyzed
   * @param contentType - Detected content type
   * @returns Advanced recommendations
   */
  generateAdvancedRecommendations(analysis: any, url: string, contentType: ContentType): string[] {
    const recommendations: Recommendation[] = [];
    
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
      logger.error(`Advanced recommendations generation failed: ${(error as Error).message}`);
      return ['⚠️ Could not generate recommendations due to analysis error'];
    }
  }

  /**
   * Get priority icon for recommendations
   * @param priority - Priority level
   * @returns Icon representation
   */
  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      critical: '🚨',
      high: '❌',
      medium: '⚠️',
      low: '💡'
    };
    return icons[priority] || '💡';
  }

  /**
   * Get failure result for error handling - Updated for new criteria
   * @param category - Category that failed
   * @param error - Error message
   * @returns Failure result object
   */
  getFailureResult(category: string, error: string = 'Analysis failed'): AnalysisResult {
    const maxScores: Record<string, number> = {
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

// Export types for external use
export type {
  LLMFormattingResult,
  CriteriaWeights,
  ContentType,
  AnalysisResult,
  HeadingStructure,
  HierarchyAnalysis,
  HeadingContentAnalysis,
  HeadingContentAdvanced,
  HeadingSemanticValue,
  SemanticStructureAnalysis,
  AccessibilityFeatures,
  ContentFlow,
  StructureAnalysis,
  ReadabilityAnalysis,
  DensityAnalysis,
  LinkAnalysis,
  AccessibilityValidation,
  LLMOptimization,
  Recommendation,
  ValidationResult
};

export default LLMFormattingAnalyzer; 