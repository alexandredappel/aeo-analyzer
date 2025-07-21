/**
 * Advanced Structured Data Analyzer for AEO Auditor
 * Analyzes JSON-LD, meta tags, OpenGraph, micro-data, and RDFa
 * Version 2.0 - Enhanced with advanced validation and context-aware recommendations
 */

import * as cheerio from 'cheerio';
import logger from '@/utils/logger';
import https from 'https';
import http from 'http';

// Types and interfaces
interface CriteriaWeights {
  jsonLd: {
    presence: number;
    validity: number;
    schemaTypes: number;
    completeness: number;
  };
  metaTags: {
    title: number;
    description: number;
    technical: number;
  };
  openGraph: {
    basic: number;
    image: number;
  };
  microData: {
    bonus: number;
  };
}

interface SchemaTypes {
  [key: string]: number;
}

interface RequiredFields {
  [schemaType: string]: string[];
}

interface ValidationDetails {
  validSchemas: string[];
  invalidSchemas: string[];
  completenessScores: Record<string, CompletenessValidation>;
  totalScripts: number;
}

interface CompletenessValidation {
  score: number;
  required: string[];
  present: string[];
  missing: string[];
  percentage: number;
}

interface AnalysisResult {
  score: number;
  maxScore: number;
  status: string;
  details: string;
  validationDetails?: ValidationDetails;
  breakdown?: any;
}

interface TitleAnalysis {
  score: number;
  maxScore: number;
  status: string;
  details: {
    length: number;
    text: string;
    assessment: string;
    warning?: string;
  };
}

interface DescriptionAnalysis {
  score: number;
  maxScore: number;
  status: string;
  details: {
    length: number;
    text: string;
    assessment: string;
    uniqueness: number;
  };
}

interface TechnicalMetaAnalysis {
  score: number;
  maxScore: number;
  details: {
    viewport: { present: boolean; content?: string };
    charset: { present: boolean; value?: string };
    robots: { 
      present: boolean; 
      content?: string; 
      analysis?: {
        index: boolean;
        follow: boolean;
        archive: boolean;
        snippet: boolean;
        directives: string[];
      };
    };
  };
}

interface ImageValidation {
  score: number;
  maxScore: number;
  details: {
    present: boolean;
    url?: string;
    validUrl?: boolean;
    protocol?: string;
    format?: string;
    supportedFormat?: boolean;
    assessment?: string;
    warning?: string;
    error?: string;
  };
}

interface UrlContext {
  type: 'ecommerce' | 'blog' | 'business' | 'general';
  confidence: number;
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  impact: string;
}

interface StructuredDataResult {
  category: string;
  score: number;
  maxScore: number;
  breakdown: {
    jsonLd: AnalysisResult;
    metaTags: AnalysisResult;
    openGraph: AnalysisResult;
    microData: AnalysisResult;
  };
  recommendations: string[];
  metadata: {
    analyzedAt: string;
    version: string;
    features: string[];
  };
  error?: string;
}

export class StructuredDataAnalyzer {
  private maxScore: number;
  private criteria: CriteriaWeights;
  private schemaTypes: SchemaTypes;
  private requiredFields: RequiredFields;
  private schemaCache: Map<string, any>;
  private imageCache: Map<string, ImageValidation>;

  constructor() {
    this.maxScore = 100;
    
    // Enhanced granular scoring system
    this.criteria = {
      jsonLd: {
        presence: 15,        // JSON-LD exists
        validity: 10,        // Valid JSON syntax
        schemaTypes: 10,     // Relevant schema types
        completeness: 5      // Complete required fields
      },
      metaTags: {
        title: 15,           // Title tag optimization
        description: 15,     // Description optimization
        technical: 5         // viewport, charset, robots
      },
      openGraph: {
        basic: 15,           // og:title, og:description
        image: 10            // og:image with validation
      },
      microData: {
        bonus: 5             // Additional structured data formats
      }
    };

    // Schema types with scoring weights
    this.schemaTypes = {
      Organization: 15,
      WebSite: 10,
      Article: 12,
      Product: 12,
      FAQPage: 8,
      BreadcrumbList: 8,
      Person: 10,
      LocalBusiness: 12,
      Corporation: 12,
      BlogPosting: 10,
      NewsArticle: 12,
      Recipe: 10,
      Event: 10,
      Place: 8
    };

    // Required fields for schema completeness validation
    this.requiredFields = {
      Organization: ['name', 'url'],
      WebSite: ['name', 'url'],
      Article: ['headline', 'author', 'datePublished'],
      Product: ['name', 'description', 'offers'],
      Person: ['name'],
      LocalBusiness: ['name', 'address', 'telephone'],
      BlogPosting: ['headline', 'author', 'datePublished'],
      NewsArticle: ['headline', 'author', 'datePublished'],
      Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
      Event: ['name', 'startDate', 'location']
    };

    // Performance cache for schema validation
    this.schemaCache = new Map();
    this.imageCache = new Map();
  }

  /**
   * Main analysis method with enhanced features
   * @param htmlContent - HTML content to analyze
   * @param url - URL being analyzed
   * @returns Enhanced analysis results with advanced scoring and recommendations
   */
  async analyze(htmlContent: string, url: string): Promise<StructuredDataResult> {
    logger.info('Starting advanced structured data analysis...');
    
    try {
      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('Invalid HTML content provided');
      }

      const $ = cheerio.load(htmlContent);
      
      // Enhanced parallel analysis
      const [jsonLdResult, metaTagsResult, openGraphResult, microDataResult] = await Promise.allSettled([
        this.analyzeEnhancedJsonLd($, url),
        this.analyzeEnhancedMetaTags($),
        this.analyzeEnhancedOpenGraph($, url),
        this.analyzeMicroData($)
      ]);

      // Extract results from Promise.allSettled
      const jsonLd = jsonLdResult.status === 'fulfilled' ? jsonLdResult.value : this.getFailureResult('jsonLd');
      const metaTags = metaTagsResult.status === 'fulfilled' ? metaTagsResult.value : this.getFailureResult('metaTags');
      const openGraph = openGraphResult.status === 'fulfilled' ? openGraphResult.value : this.getFailureResult('openGraph');
      const microData = microDataResult.status === 'fulfilled' ? microDataResult.value : this.getFailureResult('microData');
      
      // Calculate total score with bonus for micro-data
      const totalScore = Math.min(jsonLd.score + metaTags.score + openGraph.score + microData.score, this.maxScore);
      
      // Generate smart context-aware recommendations
      const recommendations = await this.generateSmartRecommendations(jsonLd, metaTags, openGraph, microData, url);
      
      logger.info(`Advanced structured data analysis completed. Score: ${totalScore}/${this.maxScore}`);
      
      return {
        category: 'structured-data',
        score: totalScore,
        maxScore: this.maxScore,
        breakdown: {
          jsonLd,
          metaTags,
          openGraph,
          microData
        },
        recommendations,
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '2.0',
          features: ['enhanced-validation', 'micro-data', 'context-aware-recommendations']
        }
      };
      
    } catch (error) {
      logger.error(`Advanced structured data analysis failed: ${(error as Error).message}`);
      
      return {
        category: 'structured-data',
        score: 0,
        maxScore: this.maxScore,
        breakdown: {
          jsonLd: this.getFailureResult('jsonLd', (error as Error).message),
          metaTags: this.getFailureResult('metaTags', (error as Error).message),
          openGraph: this.getFailureResult('openGraph', (error as Error).message),
          microData: this.getFailureResult('microData', (error as Error).message)
        },
        recommendations: [`❌ Structured data analysis failed: ${(error as Error).message}`],
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '2.0',
          features: ['error-recovery']
        },
        error: (error as Error).message
      };
    }
  }

  /**
   * Enhanced JSON-LD analysis with schema completeness validation
   * @param $ - Cheerio instance
   * @param url - URL for context
   * @returns Enhanced JSON-LD analysis result
   */
  async analyzeEnhancedJsonLd($: cheerio.CheerioAPI, url: string): Promise<AnalysisResult> {
    const maxScore = Object.values(this.criteria.jsonLd).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = 'No JSON-LD structured data found';
    let validationDetails: ValidationDetails = {
      validSchemas: [],
      invalidSchemas: [],
      completenessScores: {},
      totalScripts: 0
    };
    
    try {
      const jsonLdScripts = $('script[type="application/ld+json"]');
      
      if (jsonLdScripts.length === 0) {
        return { score, maxScore, status, details, validationDetails };
      }
      
      let validSchemas: string[] = [];
      let invalidSchemas: string[] = [];
      let completenessScores: Record<string, CompletenessValidation> = {};
      
      // Presence score
      score += this.criteria.jsonLd.presence;
      
      for (let i = 0; i < jsonLdScripts.length; i++) {
        try {
          const content = $(jsonLdScripts[i]).html();
          if (!content) continue;
          
          const jsonLd = JSON.parse(content);
          
          // Validity score
          score += this.criteria.jsonLd.validity / jsonLdScripts.length;
          
          // Handle arrays of schema objects
          const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
          
          for (const schema of schemas) {
            if (schema['@type']) {
              const schemaType = schema['@type'];
              validSchemas.push(schemaType);
              
              // Schema type scoring
              if (this.schemaTypes[schemaType]) {
                score += Math.min(this.criteria.jsonLd.schemaTypes, this.schemaTypes[schemaType]);
              }
              
              // Completeness validation
              const completeness = this.validateSchemaCompleteness(schema, schemaType);
              completenessScores[schemaType] = completeness;
              
              if (completeness.score > 0.7) {
                score += this.criteria.jsonLd.completeness;
              } else if (completeness.score > 0.4) {
                score += this.criteria.jsonLd.completeness * 0.5;
              }
            }
          }
          
        } catch (parseError) {
          logger.warn(`Invalid JSON-LD found: ${(parseError as Error).message}`);
          invalidSchemas.push((parseError as Error).message);
        }
      }
      
      // Determine status and details
      if (validSchemas.length > 0) {
        status = score >= maxScore * 0.7 ? 'pass' : 'partial';
        details = `Found ${validSchemas.length} valid schema(s): ${Array.from(new Set(validSchemas)).join(', ')}`;
        
        if (invalidSchemas.length > 0) {
          details += ` (${invalidSchemas.length} invalid)`;
        }
      }
      
      validationDetails = {
        validSchemas: Array.from(new Set(validSchemas)),
        invalidSchemas,
        completenessScores,
        totalScripts: jsonLdScripts.length
      };
      
    } catch (error) {
      logger.error(`Enhanced JSON-LD analysis error: ${(error as Error).message}`);
      details = `JSON-LD analysis error: ${(error as Error).message}`;
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, validationDetails };
  }

  /**
   * Enhanced meta tags analysis including technical tags
   * @param $ - Cheerio instance
   * @returns Enhanced meta tags analysis result
   */
  analyzeEnhancedMetaTags($: cheerio.CheerioAPI): AnalysisResult {
    const maxScore = Object.values(this.criteria.metaTags).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown: any = {};
    
    try {
      // Title analysis (15 points)
      const title = $('title').text().trim();
      const titleAnalysis = this.analyzeTitleTag(title);
      score += titleAnalysis.score;
      breakdown.title = titleAnalysis;
      
      // Description analysis (15 points)
      const description = $('meta[name="description"]').attr('content') || '';
      const descriptionAnalysis = this.analyzeDescriptionTag(description);
      score += descriptionAnalysis.score;
      breakdown.description = descriptionAnalysis;
      
      // Technical meta tags analysis (5 points)
      const technicalAnalysis = this.analyzeTechnicalMetaTags($);
      score += technicalAnalysis.score;
      breakdown.technical = technicalAnalysis;
      
      // Generate readable details string
      const titleStatus = titleAnalysis.status || 'fail';
      const descStatus = descriptionAnalysis.status || 'fail';
      const techCount = Object.values(technicalAnalysis.details || {}).filter((item: any) => item.present).length;
      
      details = `Title: ${titleStatus} (${title.length} chars), Description: ${descStatus} (${description.length} chars), Technical tags: ${techCount}/3`;
      
      // Determine overall status
      if (score >= maxScore * 0.8) {
        status = 'pass';
      } else if (score >= maxScore * 0.5) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Enhanced meta tags analysis error: ${(error as Error).message}`);
      details = `Meta tags analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Enhanced OpenGraph analysis with image validation
   * @param $ - Cheerio instance
   * @param url - URL for context
   * @returns Enhanced OpenGraph analysis result
   */
  async analyzeEnhancedOpenGraph($: cheerio.CheerioAPI, url: string): Promise<AnalysisResult> {
    const maxScore = Object.values(this.criteria.openGraph).reduce((a, b) => a + b, 0);
    let score = 0;
    let status = 'fail';
    let details = '';
    let breakdown: any = {};
    
    try {
      const ogTags = {
        title: $('meta[property="og:title"]').attr('content') || '',
        description: $('meta[property="og:description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
        url: $('meta[property="og:url"]').attr('content') || '',
        type: $('meta[property="og:type"]').attr('content') || '',
        siteName: $('meta[property="og:site_name"]').attr('content') || ''
      };
      
      // Basic OpenGraph analysis (15 points)
      let basicScore = 0;
      if (ogTags.title) basicScore += 7;
      if (ogTags.description) basicScore += 8;
      
      score += Math.min(basicScore, this.criteria.openGraph.basic);
      breakdown.basic = {
        title: !!ogTags.title,
        description: !!ogTags.description,
        score: basicScore
      };
      
      // Image validation (10 points)
      const imageValidation = await this.validateOpenGraphImage(ogTags.image);
      score += imageValidation.score;
      breakdown.image = imageValidation;
      
      // Bonus for complete setup
      const completeFields = Object.values(ogTags).filter(Boolean).length;
      let completeness = '';
      if (completeFields >= 4) {
        completeness = 'complete';
      } else if (completeFields >= 2) {
        completeness = 'partial';
      } else {
        completeness = 'minimal';
      }
      breakdown.completeness = completeness;
      
      // Generate readable details string
      const foundTags: string[] = [];
      if (ogTags.title) foundTags.push('title');
      if (ogTags.description) foundTags.push('description');
      if (ogTags.image) foundTags.push('image');
      if (ogTags.url) foundTags.push('url');
      if (ogTags.type) foundTags.push('type');
      
      details = foundTags.length > 0 
        ? `OpenGraph tags: ${foundTags.join(', ')} (${completeness} setup)`
        : 'No OpenGraph tags found';
      
      // Determine status
      if (score >= maxScore * 0.8) {
        status = 'pass';
      } else if (score >= maxScore * 0.4) {
        status = 'partial';
      }
      
    } catch (error) {
      logger.error(`Enhanced OpenGraph analysis error: ${(error as Error).message}`);
      details = `OpenGraph analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score: Math.min(score, maxScore), maxScore, status, details, breakdown };
  }

  /**
   * Analyze micro-data and RDFa support
   * @param $ - Cheerio instance
   * @returns Micro-data analysis result
   */
  analyzeMicroData($: cheerio.CheerioAPI): AnalysisResult {
    const maxScore = this.criteria.microData.bonus;
    let score = 0;
    let status = 'none';
    let details = '';
    let breakdown: any = {};
    
    try {
      // Detect itemscope/itemtype attributes (micro-data)
      const microDataItems = $('[itemscope]');
      const microDataTypes: string[] = [];
      
      microDataItems.each((i, element) => {
        const itemType = $(element).attr('itemtype');
        if (itemType) {
          microDataTypes.push(itemType.split('/').pop() || '');
        }
      });
      
      // Detect RDFa attributes
      const rdfaItems = $('[typeof]');
      const rdfaTypes: string[] = [];
      
      rdfaItems.each((i, element) => {
        const typeOf = $(element).attr('typeof');
        if (typeOf) {
          rdfaTypes.push(typeOf);
        }
      });
      
      // Scoring for additional structured data formats
      if (microDataItems.length > 0 || rdfaItems.length > 0) {
        score = maxScore;
        status = 'present';
      }
      
      breakdown = {
        microData: {
          count: microDataItems.length,
          types: Array.from(new Set(microDataTypes))
        },
        rdfa: {
          count: rdfaItems.length,
          types: Array.from(new Set(rdfaTypes))
        }
      };
      
      // Generate readable details string
      const totalItems = microDataItems.length + rdfaItems.length;
      if (totalItems > 0) {
        const parts: string[] = [];
        if (microDataItems.length > 0) parts.push(`${microDataItems.length} micro-data items`);
        if (rdfaItems.length > 0) parts.push(`${rdfaItems.length} RDFa items`);
        details = `Found ${parts.join(' and ')}`;
      } else {
        details = 'No micro-data or RDFa found';
      }
      
    } catch (error) {
      logger.error(`Micro-data analysis error: ${(error as Error).message}`);
      details = `Micro-data analysis error: ${(error as Error).message}`;
      breakdown = { error: (error as Error).message };
    }
    
    return { score, maxScore, status, details, breakdown };
  }

  /**
   * Validate schema completeness
   * @param schema - Schema object to validate
   * @param schemaType - Type of schema
   * @returns Completeness validation result
   */
  validateSchemaCompleteness(schema: any, schemaType: string): CompletenessValidation {
    const required = this.requiredFields[schemaType] || [];
    const present = required.filter(field => schema[field] && schema[field] !== '');
    
    const score = required.length > 0 ? present.length / required.length : 1;
    
    return {
      score,
      required,
      present,
      missing: required.filter(field => !present.includes(field)),
      percentage: Math.round(score * 100)
    };
  }

  /**
   * Analyze title tag with enhanced validation
   * @param title - Title text
   * @returns Title analysis result
   */
  analyzeTitleTag(title: string): TitleAnalysis {
    const maxScore = this.criteria.metaTags.title;
    let score = 0;
    let status = 'fail';
    let details: TitleAnalysis['details'] = {
      length: 0,
      text: '',
      assessment: ''
    };
    
    if (title) {
      const length = title.length;
      details.length = length;
      details.text = title;
      
      if (length >= 30 && length <= 60) {
        score = maxScore;
        status = 'optimal';
        details.assessment = 'Perfect length for search results';
      } else if (length >= 20 && length <= 80) {
        score = maxScore * 0.8;
        status = 'good';
        details.assessment = 'Good length, minor optimization possible';
      } else if (length > 0) {
        score = maxScore * 0.5;
        status = 'suboptimal';
        details.assessment = length < 30 ? 'Too short, may not be descriptive enough' : 'Too long, may be truncated in search results';
      }
      
      // Check for keyword stuffing
      const words = title.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > uniqueWords.size * 1.5) {
        details.warning = 'Possible keyword stuffing detected';
      }
    } else {
      details.assessment = 'Title tag is missing';
    }
    
    return { score, maxScore, status, details };
  }

  /**
   * Analyze description tag with enhanced validation
   * @param description - Description text
   * @returns Description analysis result
   */
  analyzeDescriptionTag(description: string): DescriptionAnalysis {
    const maxScore = this.criteria.metaTags.description;
    let score = 0;
    let status = 'fail';
    let details: DescriptionAnalysis['details'] = {
      length: 0,
      text: '',
      assessment: '',
      uniqueness: 0
    };
    
    if (description) {
      const length = description.length;
      details.length = length;
      details.text = description;
      
      if (length >= 120 && length <= 160) {
        score = maxScore;
        status = 'optimal';
        details.assessment = 'Perfect length for search snippets';
      } else if (length >= 100 && length <= 180) {
        score = maxScore * 0.8;
        status = 'good';
        details.assessment = 'Good length, minor optimization possible';
      } else if (length > 0) {
        score = maxScore * 0.5;
        status = 'suboptimal';
        details.assessment = length < 120 ? 'Too short, add more descriptive content' : 'Too long, may be truncated in search results';
      }
      
      // Check for uniqueness (basic duplicate detection)
      const words = description.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      details.uniqueness = Math.round((uniqueWords.size / words.length) * 100);
      
    } else {
      details.assessment = 'Meta description is missing';
    }
    
    return { score, maxScore, status, details };
  }

  /**
   * Analyze technical meta tags
   * @param $ - Cheerio instance
   * @returns Technical meta tags analysis result
   */
  analyzeTechnicalMetaTags($: cheerio.CheerioAPI): TechnicalMetaAnalysis {
    const maxScore = this.criteria.metaTags.technical;
    let score = 0;
    let details: TechnicalMetaAnalysis['details'] = {
      viewport: { present: false },
      charset: { present: false },
      robots: { present: false }
    };
    
    // Viewport meta tag
    const viewport = $('meta[name="viewport"]').attr('content');
    if (viewport) {
      score += 2;
      details.viewport = { present: true, content: viewport };
    } else {
      details.viewport = { present: false };
    }
    
    // Charset declaration
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content');
    if (charset) {
      score += 1;
      details.charset = { present: true, value: charset };
    } else {
      details.charset = { present: false };
    }
    
    // Robots meta tag
    const robots = $('meta[name="robots"]').attr('content');
    if (robots) {
      score += 2;
      details.robots = { 
        present: true, 
        content: robots,
        analysis: this.parseRobotsMetaTag(robots)
      };
    } else {
      details.robots = { present: false };
    }
    
    return { score, maxScore, details };
  }

  /**
   * Parse robots meta tag
   * @param robotsContent - Robots meta tag content
   * @returns Parsed robots directives
   */
  parseRobotsMetaTag(robotsContent: string) {
    const directives = robotsContent.toLowerCase().split(',').map(d => d.trim());
    
    return {
      index: !directives.includes('noindex'),
      follow: !directives.includes('nofollow'),
      archive: !directives.includes('noarchive'),
      snippet: !directives.includes('nosnippet'),
      directives
    };
  }

  /**
   * Validate OpenGraph image with accessibility check
   * @param ogImageUrl - OpenGraph image URL
   * @returns Image validation result
   */
  async validateOpenGraphImage(ogImageUrl: string): Promise<ImageValidation> {
    const maxScore = this.criteria.openGraph.image;
    let score = 0;
    let details: ImageValidation['details'] = {
      present: !!ogImageUrl,
      url: ogImageUrl
    };
    
    if (!ogImageUrl) {
      details.assessment = 'No OpenGraph image specified';
      return { score, maxScore, details };
    }
    
    // Check cache first
    if (this.imageCache.has(ogImageUrl)) {
      const cached = this.imageCache.get(ogImageUrl);
      if (cached) return cached;
    }
    
    try {
      // Basic scoring for presence
      score += 5;
      
      // Validate URL format
      try {
        const url = new URL(ogImageUrl);
        details.validUrl = true;
        details.protocol = url.protocol;
        
        // Check if HTTPS (preferred)
        if (url.protocol === 'https:') {
          score += 2;
        }
        
        // Check file extension
        const extension = url.pathname.split('.').pop()?.toLowerCase() || '';
        const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        
        if (supportedFormats.includes(extension)) {
          score += 3;
          details.format = extension;
          details.supportedFormat = true;
        } else {
          details.supportedFormat = false;
          details.warning = 'Image format may not be supported by all social platforms';
        }
        
      } catch (urlError) {
        details.validUrl = false;
        details.error = 'Invalid image URL format';
      }
      
    } catch (error) {
      details.error = `Image validation failed: ${(error as Error).message}`;
    }
    
    const result: ImageValidation = { score: Math.min(score, maxScore), maxScore, details };
    
    // Cache result (with TTL simulation)
    this.imageCache.set(ogImageUrl, result);
    
    return result;
  }

  /**
   * Generate smart, context-aware recommendations
   * @param jsonLd - JSON-LD analysis result
   * @param metaTags - Meta tags analysis result
   * @param openGraph - OpenGraph analysis result
   * @param microData - Micro-data analysis result
   * @param url - URL for context detection
   * @returns Array of prioritized recommendations
   */
  async generateSmartRecommendations(
    jsonLd: AnalysisResult, 
    metaTags: AnalysisResult, 
    openGraph: AnalysisResult, 
    microData: AnalysisResult, 
    url: string
  ): Promise<string[]> {
    const recommendations: Recommendation[] = [];
    const context = this.detectUrlContext(url);
    
    // Critical issues first
    if ((metaTags.breakdown as any)?.title?.status === 'fail') {
      recommendations.push({
        priority: 'critical',
        category: 'meta-tags',
        message: '❌ Add title tag (recommended: 30-60 characters)',
        impact: 'High impact on search visibility'
      });
    }
    
    if ((metaTags.breakdown as any)?.description?.status === 'fail') {
      recommendations.push({
        priority: 'critical',
        category: 'meta-tags',
        message: '❌ Add meta description (recommended: 120-160 characters)',
        impact: 'Essential for search result snippets'
      });
    }
    
    // JSON-LD recommendations based on context
    if (jsonLd.status === 'fail') {
      const contextualSchema = this.getContextualSchemaRecommendation(context);
      recommendations.push({
        priority: 'high',
        category: 'json-ld',
        message: `❌ Add JSON-LD structured data with ${contextualSchema} schema`,
        impact: 'Improves AI search engine understanding'
      });
    } else if (jsonLd.status === 'partial') {
      const missingSchemas = this.getMissingSchemas(jsonLd.validationDetails?.validSchemas || [], context);
      if (missingSchemas.length > 0) {
        recommendations.push({
          priority: 'medium',
          category: 'json-ld',
          message: `⚠️ Consider adding ${missingSchemas.join(', ')} schema(s) for better context`,
          impact: 'Enhanced entity recognition by AI engines'
        });
      }
    }
    
    // OpenGraph recommendations
    if (openGraph.status === 'fail') {
      recommendations.push({
        priority: 'medium',
        category: 'social',
        message: '❌ Add OpenGraph tags (og:title, og:description, og:image) for social sharing',
        impact: 'Essential for social media visibility'
      });
    } else if (!(openGraph.breakdown as any)?.image?.details?.present) {
      recommendations.push({
        priority: 'medium',
        category: 'social',
        message: '⚠️ Add og:image for visual social media previews',
        impact: 'Significantly improves social engagement'
      });
    }
    
    // Technical improvements
    if (!(metaTags.breakdown as any)?.technical?.details?.viewport?.present) {
      recommendations.push({
        priority: 'medium',
        category: 'technical',
        message: '⚠️ Add viewport meta tag for mobile optimization',
        impact: 'Essential for mobile search ranking'
      });
    }
    
    // Micro-data bonus recommendations
    if (microData.status === 'none' && jsonLd.status === 'pass') {
      recommendations.push({
        priority: 'low',
        category: 'enhancement',
        message: '💡 Consider adding micro-data attributes for additional structured data support',
        impact: 'Provides fallback for older crawlers'
      });
    }
    
    // Context-specific advanced recommendations
    if (context.type === 'ecommerce') {
      recommendations.push({
        priority: 'high',
        category: 'ecommerce',
        message: '🛒 Implement Product schema with offers, reviews, and availability',
        impact: 'Critical for shopping search results'
      });
    } else if (context.type === 'blog') {
      recommendations.push({
        priority: 'medium',
        category: 'content',
        message: '📝 Add Article/BlogPosting schema with author and publish date',
        impact: 'Improves content discovery and attribution'
      });
    } else if (context.type === 'business') {
      recommendations.push({
        priority: 'medium',
        category: 'business',
        message: '🏢 Enhance Organization schema with contact information and social profiles',
        impact: 'Better local search and knowledge panel presence'
      });
    }
    
    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Convert to simple strings for backward compatibility, but include priority info
    return recommendations.map(rec => 
      `${rec.message} ${rec.impact ? `(${rec.impact})` : ''}`
    );
  }

  /**
   * Detect URL context for smart recommendations
   * @param url - URL to analyze
   * @returns Context information
   */
  detectUrlContext(url: string): UrlContext {
    const urlLower = url.toLowerCase();
    
    // E-commerce indicators
    if (urlLower.includes('shop') || urlLower.includes('store') || 
        urlLower.includes('product') || urlLower.includes('cart') ||
        urlLower.includes('amazon') || urlLower.includes('ebay')) {
      return { type: 'ecommerce', confidence: 0.8 };
    }
    
    // Blog indicators
    if (urlLower.includes('blog') || urlLower.includes('article') || 
        urlLower.includes('news') || urlLower.includes('post')) {
      return { type: 'blog', confidence: 0.7 };
    }
    
    // Business/company indicators
    if (urlLower.includes('about') || urlLower.includes('company') || 
        urlLower.includes('contact') || urlLower.includes('service')) {
      return { type: 'business', confidence: 0.6 };
    }
    
    return { type: 'general', confidence: 0.5 };
  }

  /**
   * Get contextual schema recommendation
   * @param context - URL context
   * @returns Recommended schema type
   */
  getContextualSchemaRecommendation(context: UrlContext): string {
    switch (context.type) {
      case 'ecommerce':
        return 'Product/Organization';
      case 'blog':
        return 'Article/BlogPosting';
      case 'business':
        return 'Organization/LocalBusiness';
      default:
        return 'Organization/WebSite';
    }
  }

  /**
   * Get missing schemas based on context
   * @param currentSchemas - Currently detected schemas
   * @param context - URL context
   * @returns Missing schema recommendations
   */
  getMissingSchemas(currentSchemas: string[], context: UrlContext): string[] {
    const missing: string[] = [];
    
    if (context.type === 'ecommerce' && !currentSchemas.includes('Product')) {
      missing.push('Product');
    }
    
    if (context.type === 'blog' && !currentSchemas.includes('Article') && !currentSchemas.includes('BlogPosting')) {
      missing.push('Article');
    }
    
    if (!currentSchemas.includes('Organization') && !currentSchemas.includes('LocalBusiness')) {
      missing.push('Organization');
    }
    
    if (!currentSchemas.includes('WebSite')) {
      missing.push('WebSite');
    }
    
    return missing;
  }

  /**
   * Get failure result for error handling
   * @param category - Category that failed
   * @param error - Error message
   * @returns Failure result object
   */
  getFailureResult(category: string, error: string = 'Analysis failed'): AnalysisResult {
    const maxScores: Record<string, number> = {
      jsonLd: Object.values(this.criteria.jsonLd).reduce((a, b) => a + b, 0),
      metaTags: Object.values(this.criteria.metaTags).reduce((a, b) => a + b, 0),
      openGraph: Object.values(this.criteria.openGraph).reduce((a, b) => a + b, 0),
      microData: this.criteria.microData.bonus
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
  StructuredDataResult,
  CriteriaWeights,
  CompletenessValidation,
  ValidationDetails,
  AnalysisResult,
  TitleAnalysis,
  DescriptionAnalysis,
  TechnicalMetaAnalysis,
  ImageValidation,
  UrlContext,
  Recommendation
};

export default StructuredDataAnalyzer; 