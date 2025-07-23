/**
 * STRUCTURED DATA ANALYZER - PHASE 3A: NEW HIERARCHICAL ARCHITECTURE
 * 
 * Analyzes structured data for search engines and AI (25% of total score)
 * Architecture: 📋 STRUCTURED DATA → JSON-LD + Meta Tags + Social Meta → MetricCards
 * 
 * FIXES: Math inconsistencies, extensible schema weights, diversity bonuses
 */

import * as cheerio from 'cheerio';
import { 
  MetricCard, 
  DrawerSubSection, 
  MainSection, 
  PerformanceStatus 
} from '@/types/analysis-architecture';

// ===== INTERFACES AND TYPES =====

interface StructuredDataAnalysisResult {
  section: MainSection;
  rawData: {
    jsonLdFound: boolean;
    jsonLdValid: boolean;
    detectedSchemas: string[];
    schemaCompleteness: Record<string, number>;
    titleTag: {
      present: boolean;
      length: number;
      text: string;
    };
    metaDescription: {
      present: boolean;
      length: number;
      text: string;
    };
    technicalMeta: {
      viewport: boolean;
      charset: boolean;
      robots: boolean;
    };
    openGraph: {
      title: boolean;
      description: boolean;
      image: boolean;
      url: boolean;
    };
    totalSchemas: number;
    diversityBonus: boolean;
    error?: string;
  };
}

interface JSONLDData {
  scripts: any[];
  validSchemas: string[];
  invalidSchemas: string[];
  totalScripts: number;
  schemaCompleteness: Record<string, number>;
}

// ===== CONSTANTS =====

const SECTION_CONFIG = {
  id: 'structured-data',
  name: 'Structured Data',
  emoji: '📋',
  description: 'Does your content have proper schema markup for AI understanding?',
  weightPercentage: 25,
  maxScore: 100
};

/**
 * Extensible schema weights system - easy to add new schemas
 */
const SCHEMA_WEIGHTS = {
  // Core schemas (high priority)
  Organization: 1.0,     // 10 pts max
  WebSite: 0.8,         // 8 pts max
  Article: 0.9,         // 9 pts max
  Product: 0.9,         // 9 pts max
  LocalBusiness: 1.0,   // 10 pts max
  
  // Content schemas (medium priority)
  BlogPosting: 0.8,     // 8 pts max
  NewsArticle: 0.8,     // 8 pts max
  Recipe: 0.7,          // 7 pts max
  Event: 0.7,           // 7 pts max
  FAQPage: 0.8,         // 8 pts max
  
  // Enhancement schemas (lower priority)
  BreadcrumbList: 0.6,  // 6 pts max
  AggregateRating: 0.5, // 5 pts max
  Review: 0.5,          // 5 pts max
  Person: 0.7,          // 7 pts max
} as const;

const UNKNOWN_SCHEMA_BONUS = 0.4; // 4 pts for new/unknown schemas
const DIVERSITY_BONUS_THRESHOLD = 3; // 3+ different schemas get bonus
const MAX_SCHEMA_POINTS = 20; // Schema Types & Completeness max points

/**
 * Required fields for schema completeness validation
 */
const REQUIRED_SCHEMA_FIELDS = {
  Organization: ['@type', 'name'],
  WebSite: ['@type', 'name', 'url'],
  Article: ['@type', 'headline', 'author'],
  Product: ['@type', 'name', 'description'],
  LocalBusiness: ['@type', 'name', 'address'],
  BlogPosting: ['@type', 'headline', 'author', 'datePublished'],
  NewsArticle: ['@type', 'headline', 'author', 'datePublished'],
  Recipe: ['@type', 'name', 'recipeIngredient', 'recipeInstructions'],
  Event: ['@type', 'name', 'startDate', 'location'],
  FAQPage: ['@type', 'mainEntity'],
  BreadcrumbList: ['@type', 'itemListElement'],
  Person: ['@type', 'name'],
} as const;

// ===== UTILITIES =====

/**
 * Determines performance status based on score
 */
function getPerformanceStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

/**
 * Parses and validates JSON-LD structured data
 */
function parseJSONLD(html: string): JSONLDData {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  
  const result: JSONLDData = {
    scripts: [],
    validSchemas: [],
    invalidSchemas: [],
    totalScripts: scripts.length,
    schemaCompleteness: {}
  };

  scripts.each((_, script) => {
    try {
      const content = $(script).html();
      if (!content) return;

      const jsonData = JSON.parse(content);
      const schemas = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      schemas.forEach(schema => {
        if (schema['@type']) {
          const schemaType = schema['@type'];
          result.validSchemas.push(schemaType);
          result.scripts.push(schema);
          
          // Calculate completeness for known schemas
          if (REQUIRED_SCHEMA_FIELDS[schemaType as keyof typeof REQUIRED_SCHEMA_FIELDS]) {
            const required = REQUIRED_SCHEMA_FIELDS[schemaType as keyof typeof REQUIRED_SCHEMA_FIELDS];
            const present = required.filter(field => schema[field] !== undefined);
            result.schemaCompleteness[schemaType] = (present.length / required.length) * 100;
          }
        }
      });
    } catch (error) {
      result.invalidSchemas.push('Invalid JSON-LD');
    }
  });

  return result;
}

/**
 * Calculates schema diversity bonus
 */
function calculateDiversityBonus(schemas: string[]): number {
  const uniqueSchemas = new Set(schemas);
  return uniqueSchemas.size >= DIVERSITY_BONUS_THRESHOLD ? 2 : 0; // 2 point bonus
}

// ===== METRIC ANALYZERS =====

/**
 * Analyzes JSON-LD presence and validity (20 points)
 */
function analyzeJSONLDPresence(jsonldData: JSONLDData): MetricCard {
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  // Presence check (10 points)
  if (jsonldData.totalScripts > 0) {
    score += 10;
  } else {
    problems.push("No JSON-LD structured data found on the page");
  }

  // Validity check (10 points)
  if (jsonldData.validSchemas.length > 0) {
    score += 10;
  } else if (jsonldData.totalScripts > 0) {
    problems.push("JSON-LD scripts found but contain invalid JSON syntax");
    solutions.push("Validate JSON-LD syntax using Google's Structured Data Testing Tool");
  }

  // Add solutions if problems exist
  if (problems.length > 0) {
    solutions.push(
      "Add JSON-LD structured data to your page head section",
      "Use Schema.org vocabulary for better search engine understanding",
      "Test your structured data with Google Search Console",
      "Consider using a CMS plugin for automatic schema generation"
    );
  }

  return {
    id: 'jsonld-presence',
    name: 'JSON-LD Presence & Validity',
    score,
    maxScore: 20,
    status: getPerformanceStatus(score, 20),
    explanation: "JSON-LD structured data helps search engines and AI understand your content context and purpose. Valid JSON-LD improves rich snippet eligibility and content comprehension.",
    problems,
    solutions,
    successMessage: "Perfect! Your JSON-LD structured data is valid and well-formed.",
    rawData: {
      totalScripts: jsonldData.totalScripts,
      validSchemas: jsonldData.validSchemas,
      invalidSchemas: jsonldData.invalidSchemas
    }
  };
}

/**
 * Analyzes schema types and completeness (20 points) - FIXED MATH
 */
function analyzeSchemaTypesCompleteness(jsonldData: JSONLDData): MetricCard {
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  if (jsonldData.validSchemas.length === 0) {
    problems.push("No valid schema types detected");
    solutions.push(
      "Add relevant schema types for your content",
      "Use Organization schema for company information",
      "Add Article or BlogPosting schema for content pages",
      "Include Product schema for e-commerce items"
    );
  } else {
    // Calculate weighted score for schema types (max 18 points)
    let weightedScore = 0;
    const processedSchemas = new Set<string>();
    
    jsonldData.validSchemas.forEach(schemaType => {
      if (processedSchemas.has(schemaType)) return; // Avoid double counting
      processedSchemas.add(schemaType);
      
      // Get weight for this schema type
      const weight = SCHEMA_WEIGHTS[schemaType as keyof typeof SCHEMA_WEIGHTS] || UNKNOWN_SCHEMA_BONUS;
      let schemaScore = weight * 10; // Base score
      
      // Apply completeness multiplier
      const completeness = jsonldData.schemaCompleteness[schemaType] || 100;
      schemaScore *= (completeness / 100);
      
      weightedScore += schemaScore;
    });
    
    // Cap at 18 points, add diversity bonus (2 points max)
    const cappedScore = Math.min(weightedScore, 18);
    const diversityBonus = calculateDiversityBonus(jsonldData.validSchemas);
    score = Math.min(cappedScore + diversityBonus, MAX_SCHEMA_POINTS);
    
    // Generate problems for incomplete schemas
    Object.entries(jsonldData.schemaCompleteness).forEach(([schemaType, completeness]) => {
      if (completeness < 80) {
        problems.push(`${schemaType} schema is incomplete (${Math.round(completeness)}% complete)`);
      }
    });
    
    if (problems.length > 0) {
      solutions.push(
        "Add missing required fields to your schema markup",
        "Use Google's Rich Results Test to validate completeness",
        "Refer to Schema.org documentation for field requirements"
      );
    }
  }

  return {
    id: 'schema-types-completeness',
    name: 'Schema Types & Completeness',
    score,
    maxScore: 20,
    status: getPerformanceStatus(score, 20),
    explanation: "Comprehensive schema types with complete field information help AI understand your content's specific context and relationships. Multiple schema types demonstrate content richness.",
    problems,
    solutions,
    successMessage: "Excellent! You have comprehensive schema types covering your content.",
    rawData: {
      detectedSchemas: Array.from(new Set(jsonldData.validSchemas)),
      completenessScores: jsonldData.schemaCompleteness,
      diversityBonus: calculateDiversityBonus(jsonldData.validSchemas) > 0
    }
  };
}

/**
 * Analyzes title tag (15 points)
 */
function analyzeTitleTag(html: string): MetricCard {
  const $ = cheerio.load(html);
  const titleElement = $('title').first();
  const titleText = titleElement.text().trim();
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  if (!titleText) {
    problems.push("Title tag is missing or empty");
    solutions.push(
      "Add a descriptive title tag to your page",
      "Include primary keywords in the title",
      "Keep title length between 50-60 characters",
      "Make each page title unique"
    );
  } else {
    // Length assessment
    if (titleText.length >= 50 && titleText.length <= 60) {
      score += 10; // Optimal length
    } else if (titleText.length >= 30 && titleText.length <= 70) {
      score += 7; // Good length
    } else if (titleText.length >= 20) {
      score += 5; // Acceptable length
      if (titleText.length < 30) {
        problems.push("Title tag is too short (under 30 characters)");
      } else {
        problems.push("Title tag is too long (over 70 characters)");
      }
    } else {
      problems.push("Title tag is very short (under 20 characters)");
    }

    // Content quality assessment
    if (titleText.length > 0) {
      score += 5; // Basic presence bonus
    }

    if (problems.length > 0) {
      solutions.push(
        "Optimize title length for search engines (50-60 characters ideal)",
        "Include your primary keyword near the beginning",
        "Write descriptive, compelling titles that users want to click"
      );
    }
  }

  return {
    id: 'title-tag',
    name: 'Title Tag',
    score,
    maxScore: 15,
    status: getPerformanceStatus(score, 15),
    explanation: "The title tag is the most important meta element for SEO and AI understanding. It appears in search results and browser tabs, directly influencing click-through rates.",
    problems,
    solutions,
    successMessage: "Great! Your title tag is optimized for search engines and AI.",
    rawData: {
      present: !!titleText,
      length: titleText.length,
      text: titleText
    }
  };
}

/**
 * Analyzes meta description (10 points)
 */
function analyzeMetaDescription(html: string): MetricCard {
  const $ = cheerio.load(html);
  const descElement = $('meta[name="description"]').first();
  const descText = descElement.attr('content')?.trim() || '';
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  if (!descText) {
    problems.push("Meta description is missing");
    solutions.push(
      "Add a meta description to your page",
      "Write compelling descriptions that encourage clicks",
      "Include relevant keywords naturally",
      "Keep descriptions between 150-160 characters"
    );
  } else {
    // Length assessment
    if (descText.length >= 140 && descText.length <= 160) {
      score += 7; // Optimal length
    } else if (descText.length >= 120 && descText.length <= 170) {
      score += 5; // Good length
    } else if (descText.length >= 50) {
      score += 3; // Acceptable length
      if (descText.length < 120) {
        problems.push("Meta description is too short (under 120 characters)");
      } else {
        problems.push("Meta description is too long (over 170 characters)");
      }
    } else {
      problems.push("Meta description is very short (under 50 characters)");
    }

    // Content quality bonus
    if (descText.length > 0) {
      score += 3; // Basic presence bonus
    }

    if (problems.length > 0) {
      solutions.push(
        "Optimize description length (140-160 characters ideal)",
        "Write unique descriptions for each page",
        "Include a clear call-to-action when appropriate"
      );
    }
  }

  return {
    id: 'meta-description',
    name: 'Meta Description',
    score,
    maxScore: 10,
    status: getPerformanceStatus(score, 10),
    explanation: "Meta descriptions provide concise summaries that appear in search results. Well-crafted descriptions improve click-through rates and help AI understand page content.",
    problems,
    solutions,
    successMessage: "Perfect! Your meta description effectively summarizes your content.",
    rawData: {
      present: !!descText,
      length: descText.length,
      text: descText
    }
  };
}

/**
 * Analyzes technical meta tags (10 points)
 */
function analyzeTechnicalMeta(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  // Viewport meta (4 points)
  const viewport = $('meta[name="viewport"]').first();
  if (viewport.length && viewport.attr('content')) {
    score += 4;
  } else {
    problems.push("Viewport meta tag is missing or empty");
  }

  // Charset declaration (3 points)
  const charset = $('meta[charset]').first();
  if (charset.length || $('meta[http-equiv="Content-Type"]').length) {
    score += 3;
  } else {
    problems.push("Character encoding declaration is missing");
  }

  // Robots meta (3 points)
  const robots = $('meta[name="robots"]').first();
  if (robots.length && robots.attr('content')) {
    score += 3;
  } else {
    problems.push("Robots meta tag is missing (optional but recommended)");
  }

  if (problems.length > 0) {
    solutions.push(
      "Add viewport meta tag for mobile responsiveness",
      "Include charset declaration for proper text encoding",
      "Consider adding robots meta tag for crawling directives",
      "Use HTML5 doctype and modern meta tag syntax"
    );
  }

  return {
    id: 'technical-meta',
    name: 'Technical Meta Tags',
    score,
    maxScore: 10,
    status: getPerformanceStatus(score, 10),
    explanation: "Technical meta tags ensure proper page rendering and crawling behavior. They provide essential instructions to browsers and search engines.",
    problems,
    solutions,
    successMessage: "Excellent! Your technical meta tags are properly configured.",
    rawData: {
      viewport: !!viewport.length,
      charset: !!(charset.length || $('meta[http-equiv="Content-Type"]').length),
      robots: !!robots.length
    }
  };
}

/**
 * Analyzes Open Graph basic tags (15 points)
 */
function analyzeOpenGraphBasic(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  // OG Title (4 points)
  const ogTitle = $('meta[property="og:title"]').first();
  if (ogTitle.length && ogTitle.attr('content')) {
    score += 4;
  } else {
    problems.push("Open Graph title is missing");
  }

  // OG Description (4 points)
  const ogDesc = $('meta[property="og:description"]').first();
  if (ogDesc.length && ogDesc.attr('content')) {
    score += 4;
  } else {
    problems.push("Open Graph description is missing");
  }

  // OG Type (3 points)
  const ogType = $('meta[property="og:type"]').first();
  if (ogType.length && ogType.attr('content')) {
    score += 3;
  } else {
    problems.push("Open Graph type is missing");
  }

  // OG URL (4 points)
  const ogUrl = $('meta[property="og:url"]').first();
  if (ogUrl.length && ogUrl.attr('content')) {
    score += 4;
  } else {
    problems.push("Open Graph URL is missing");
  }

  if (problems.length > 0) {
    solutions.push(
      "Add Open Graph title for social sharing optimization",
      "Include Open Graph description for social previews",
      "Set appropriate Open Graph type (article, website, etc.)",
      "Specify canonical URL with og:url property"
    );
  }

  return {
    id: 'open-graph-basic',
    name: 'Open Graph Basic Tags',
    score,
    maxScore: 15,
    status: getPerformanceStatus(score, 15),
    explanation: "Open Graph tags control how your content appears when shared on social media platforms. They're also used by AI for content understanding and categorization.",
    problems,
    solutions,
    successMessage: "Great! Your Open Graph tags are complete for social sharing.",
    rawData: {
      title: !!(ogTitle.length && ogTitle.attr('content')),
      description: !!(ogDesc.length && ogDesc.attr('content')),
      type: !!(ogType.length && ogType.attr('content')),
      url: !!(ogUrl.length && ogUrl.attr('content'))
    }
  };
}

/**
 * Analyzes Open Graph image (10 points)
 */
function analyzeOpenGraphImage(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  // OG Image (7 points)
  const ogImage = $('meta[property="og:image"]').first();
  if (ogImage.length && ogImage.attr('content')) {
    score += 7;
    
    // Image dimensions bonus (3 points)
    const ogImageWidth = $('meta[property="og:image:width"]').first();
    const ogImageHeight = $('meta[property="og:image:height"]').first();
    if (ogImageWidth.length && ogImageHeight.length) {
      score += 3;
    } else {
      problems.push("Open Graph image dimensions are missing");
    }
  } else {
    problems.push("Open Graph image is missing");
  }

  if (problems.length > 0) {
    solutions.push(
      "Add Open Graph image for better social media appearance",
      "Include image dimensions (og:image:width, og:image:height)",
      "Use high-quality images (minimum 1200x630 pixels recommended)",
      "Ensure image URLs are absolute and accessible"
    );
  }

  return {
    id: 'open-graph-image',
    name: 'Open Graph Image',
    score,
    maxScore: 10,
    status: getPerformanceStatus(score, 10),
    explanation: "Open Graph images significantly improve social media engagement and help AI understand visual content context. Proper image metadata ensures consistent display across platforms.",
    problems,
    solutions,
    successMessage: "Perfect! Your Open Graph image is properly configured.",
    rawData: {
      image: !!(ogImage.length && ogImage.attr('content')),
      dimensions: !!($('meta[property="og:image:width"]').length && $('meta[property="og:image:height"]').length)
    }
  };
}

// ===== MAIN ANALYZER =====

/**
 * Complete structured data analysis according to new architecture
 */
export function analyzeStructuredData(html: string, url: string): StructuredDataAnalysisResult {
  try {
    // Input validation
    if (!html || typeof html !== 'string') {
      throw new Error('HTML content required for structured data analysis');
    }

    // Parse JSON-LD data
    const jsonldData = parseJSONLD(html);

    // Individual metric analyses
    const jsonldPresenceCard = analyzeJSONLDPresence(jsonldData);
    const schemaTypesCard = analyzeSchemaTypesCompleteness(jsonldData);
    const titleCard = analyzeTitleTag(html);
    const descriptionCard = analyzeMetaDescription(html);
    const technicalMetaCard = analyzeTechnicalMeta(html);
    const ogBasicCard = analyzeOpenGraphBasic(html);
    const ogImageCard = analyzeOpenGraphImage(html);

    // Build drawers (DrawerSubSection)
    const jsonldDrawer: DrawerSubSection = {
      id: 'jsonld-analysis',
      name: 'JSON-LD Analysis',
      description: 'Structured data markup for enhanced understanding',
      totalScore: jsonldPresenceCard.score + schemaTypesCard.score,
      maxScore: 40,
      status: getPerformanceStatus(jsonldPresenceCard.score + schemaTypesCard.score, 40),
      cards: [jsonldPresenceCard, schemaTypesCard]
    };

    const metaTagsDrawer: DrawerSubSection = {
      id: 'meta-tags-analysis',
      name: 'Meta Tags Analysis',
      description: 'Essential metadata for search engines',
      totalScore: titleCard.score + descriptionCard.score + technicalMetaCard.score,
      maxScore: 35,
      status: getPerformanceStatus(titleCard.score + descriptionCard.score + technicalMetaCard.score, 35),
      cards: [titleCard, descriptionCard, technicalMetaCard]
    };

    const socialMetaDrawer: DrawerSubSection = {
      id: 'social-meta-analysis',
      name: 'Social Meta Analysis',
      description: 'Open Graph tags for social sharing',
      totalScore: ogBasicCard.score + ogImageCard.score,
      maxScore: 25,
      status: getPerformanceStatus(ogBasicCard.score + ogImageCard.score, 25),
      cards: [ogBasicCard, ogImageCard]
    };

    // Total section score
    const totalScore = jsonldDrawer.totalScore + metaTagsDrawer.totalScore + socialMetaDrawer.totalScore;

    // Build main section
    const section: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: SECTION_CONFIG.description,
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore,
      maxScore: SECTION_CONFIG.maxScore,
      status: getPerformanceStatus(totalScore, SECTION_CONFIG.maxScore),
      drawers: [jsonldDrawer, metaTagsDrawer, socialMetaDrawer]
    };

    // Raw data for debug/export
    const $ = cheerio.load(html);
    const rawData = {
      jsonLdFound: jsonldData.totalScripts > 0,
      jsonLdValid: jsonldData.validSchemas.length > 0,
      detectedSchemas: Array.from(new Set(jsonldData.validSchemas)),
      schemaCompleteness: jsonldData.schemaCompleteness,
      titleTag: {
        present: !!$('title').first().text().trim(),
        length: $('title').first().text().trim().length,
        text: $('title').first().text().trim()
      },
      metaDescription: {
        present: !!$('meta[name="description"]').first().attr('content'),
        length: ($('meta[name="description"]').first().attr('content') || '').length,
        text: $('meta[name="description"]').first().attr('content') || ''
      },
      technicalMeta: {
        viewport: !!$('meta[name="viewport"]').length,
        charset: !!($('meta[charset]').length || $('meta[http-equiv="Content-Type"]').length),
        robots: !!$('meta[name="robots"]').length
      },
      openGraph: {
        title: !!$('meta[property="og:title"]').first().attr('content'),
        description: !!$('meta[property="og:description"]').first().attr('content'),
        image: !!$('meta[property="og:image"]').first().attr('content'),
        url: !!$('meta[property="og:url"]').first().attr('content')
      },
      totalSchemas: jsonldData.validSchemas.length,
      diversityBonus: calculateDiversityBonus(jsonldData.validSchemas) > 0
    };

    return {
      section,
      rawData
    };

  } catch (error) {
    // Error handling with minimal section
    const errorSection: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: 'Does your content have proper schema markup for AI understanding?',
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore: 0,
      maxScore: SECTION_CONFIG.maxScore,
      status: 'error',
      drawers: []
    };

    return {
      section: errorSection,
      rawData: {
        jsonLdFound: false,
        jsonLdValid: false,
        detectedSchemas: [],
        schemaCompleteness: {},
        titleTag: { present: false, length: 0, text: '' },
        metaDescription: { present: false, length: 0, text: '' },
        technicalMeta: { viewport: false, charset: false, robots: false },
        openGraph: { title: false, description: false, image: false, url: false },
        totalSchemas: 0,
        diversityBonus: false,
        error: (error as Error).message
      }
    };
  }
}

// ===== EXPORTS =====

export {
  SCHEMA_WEIGHTS,
  UNKNOWN_SCHEMA_BONUS,
  REQUIRED_SCHEMA_FIELDS,
  parseJSONLD,
  calculateDiversityBonus,
  analyzeJSONLDPresence,
  analyzeSchemaTypesCompleteness,
  analyzeTitleTag,
  analyzeMetaDescription,
  analyzeTechnicalMeta,
  analyzeOpenGraphBasic,
  analyzeOpenGraphImage
};

export type {
  StructuredDataAnalysisResult,
  JSONLDData
}; 