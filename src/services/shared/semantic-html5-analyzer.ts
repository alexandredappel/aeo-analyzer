/**
 * SHARED SEMANTIC HTML5 ANALYZER - PHASE 4A
 * 
 * Centralized semantic HTML5 analysis to eliminate duplication between
 * LLM Formatting and Accessibility sections
 * 
 * Analyzes: Structural elements, Accessibility features, Content flow
 */

import * as cheerio from 'cheerio';

// ===== INTERFACES =====

export interface SharedSemanticHTML5Result {
  structuralScore: number;     // nav, main, header, footer (0-12 pts)
  accessibilityScore: number;  // aria-*, landmarks (0-8 pts)
  contentFlowScore: number;    // article, section (0-10 pts)
  semanticRatio: number;       // semantic elements / total elements (0-1)
  elements: {
    structural: string[];      // ['main', 'header', 'nav', 'footer']
    content: string[];         // ['article', 'section', 'aside']
    accessibility: number;     // aria features count
    totalElements: number;     // total HTML elements
    semanticElements: number;  // semantic HTML5 elements
  };
  details: {
    structuralAnalysis: StructuralElementAnalysis;
    accessibilityAnalysis: AccessibilityFeatureAnalysis;
    contentFlowAnalysis: ContentFlowAnalysis;
  };
}

interface StructuralElementAnalysis {
  main: { count: number; present: boolean };
  header: { count: number; present: boolean };
  nav: { count: number; present: boolean };
  footer: { count: number; present: boolean };
  score: number;
  issues: string[];
}

interface AccessibilityFeatureAnalysis {
  ariaLabels: number;
  ariaDescribedBy: number;
  ariaLabelledBy: number;
  landmarks: number;
  roles: number;
  altTexts: number;
  score: number;
  issues: string[];
}

interface ContentFlowAnalysis {
  article: { count: number; nested: boolean };
  section: { count: number; nested: boolean };
  aside: { count: number; present: boolean };
  score: number;
  issues: string[];
}

// ===== CONSTANTS =====

/**
 * Semantic HTML5 elements for ratio calculation
 */
const SEMANTIC_ELEMENTS = [
  // Structural
  'main', 'header', 'nav', 'footer',
  // Content sectioning
  'article', 'section', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Text content
  'figure', 'figcaption', 'blockquote', 'address',
  // Inline text
  'time', 'mark', 'code', 'kbd', 'samp', 'var',
  // Forms
  'fieldset', 'legend', 'label', 'output',
  // Interactive
  'details', 'summary', 'dialog'
];

/**
 * Structural element scoring weights
 */
const STRUCTURAL_WEIGHTS = {
  main: 4,    // Most important for page structure
  header: 3,  // Important for navigation/branding
  nav: 3,     // Critical for site navigation
  footer: 2   // Useful but less critical
}; // Total: 12 points maximum

/**
 * Content flow scoring weights
 */
const CONTENT_FLOW_WEIGHTS = {
  article: 4,   // Main content organization
  section: 3,   // Content grouping
  aside: 3      // Supplementary content
}; // Total: 10 points maximum

// ===== SHARED SEMANTIC HTML5 ANALYZER =====

export class SharedSemanticHTML5Analyzer {
  
  /**
   * Analyzes semantic HTML5 usage in the provided content
   */
  public analyze($: cheerio.CheerioAPI): SharedSemanticHTML5Result {
    try {
      // Individual analyses
      const structuralAnalysis = this.analyzeStructuralElements($);
      const accessibilityAnalysis = this.analyzeAccessibilityFeatures($);
      const contentFlowAnalysis = this.analyzeContentFlow($);
      const semanticRatio = this.calculateSemanticRatio($);
      
      // Element collection
      const elements = this.collectElements($);
      
      return {
        structuralScore: structuralAnalysis.score,
        accessibilityScore: accessibilityAnalysis.score,
        contentFlowScore: contentFlowAnalysis.score,
        semanticRatio,
        elements,
        details: {
          structuralAnalysis,
          accessibilityAnalysis,
          contentFlowAnalysis
        }
      };
      
    } catch (error) {
      // Return minimal valid result on error
      return this.createErrorResult((error as Error).message);
    }
  }

  /**
   * Analyzes structural HTML5 elements (nav, main, header, footer)
   */
  private analyzeStructuralElements($: cheerio.CheerioAPI): StructuralElementAnalysis {
    const analysis: StructuralElementAnalysis = {
      main: { count: 0, present: false },
      header: { count: 0, present: false },
      nav: { count: 0, present: false },
      footer: { count: 0, present: false },
      score: 0,
      issues: []
    };

    // Analyze each structural element
    Object.keys(STRUCTURAL_WEIGHTS).forEach(element => {
      const elements = $(element);
      const count = elements.length;
      const present = count > 0;
      
      analysis[element as keyof typeof STRUCTURAL_WEIGHTS] = { count, present };
      
      if (present) {
        analysis.score += STRUCTURAL_WEIGHTS[element as keyof typeof STRUCTURAL_WEIGHTS];
      } else {
        analysis.issues.push(`Missing ${element} element for proper page structure`);
      }
      
      // Check for multiple main elements (should be unique)
      if (element === 'main' && count > 1) {
        analysis.issues.push(`Multiple main elements found (${count}). Should be unique per page.`);
        analysis.score -= 2; // Penalty for invalid structure
      }
    });

    // Ensure score doesn't go below 0
    analysis.score = Math.max(0, analysis.score);

    return analysis;
  }

  /**
   * Analyzes accessibility features (aria-*, landmarks, alt texts)
   */
  private analyzeAccessibilityFeatures($: cheerio.CheerioAPI): AccessibilityFeatureAnalysis {
    const analysis: AccessibilityFeatureAnalysis = {
      ariaLabels: 0,
      ariaDescribedBy: 0,
      ariaLabelledBy: 0,
      landmarks: 0,
      roles: 0,
      altTexts: 0,
      score: 0,
      issues: []
    };

    // Count ARIA attributes
    analysis.ariaLabels = $('[aria-label]').length;
    analysis.ariaDescribedBy = $('[aria-describedby]').length;
    analysis.ariaLabelledBy = $('[aria-labelledby]').length;
    analysis.roles = $('[role]').length;
    
    // Count landmark roles
    const landmarkRoles = ['banner', 'main', 'navigation', 'complementary', 'contentinfo', 'search', 'form'];
    landmarkRoles.forEach(role => {
      analysis.landmarks += $(`[role="${role}"]`).length;
    });
    
    // Count alt texts on images
    const images = $('img');
    const imagesWithAlt = $('img[alt]');
    analysis.altTexts = imagesWithAlt.length;
    
    // Score calculation (0-8 points)
    let score = 0;
    
    // ARIA labels (2 points max)
    if (analysis.ariaLabels > 0) score += Math.min(2, analysis.ariaLabels * 0.5);
    
    // ARIA relationships (2 points max)
    const ariaRelationships = analysis.ariaDescribedBy + analysis.ariaLabelledBy;
    if (ariaRelationships > 0) score += Math.min(2, ariaRelationships * 0.5);
    
    // Landmark roles (2 points max)
    if (analysis.landmarks > 0) score += Math.min(2, analysis.landmarks * 0.4);
    
    // Alt texts (2 points max)
    if (images.length > 0) {
      const altRatio = analysis.altTexts / images.length;
      score += altRatio * 2;
      
      if (altRatio < 0.8) {
        analysis.issues.push(`${images.length - analysis.altTexts} images missing alt text`);
      }
    }
    
    // Issues detection
    if (analysis.ariaLabels === 0 && analysis.roles === 0) {
      analysis.issues.push('No ARIA attributes found for enhanced accessibility');
    }
    
    if (analysis.landmarks === 0) {
      analysis.issues.push('No landmark roles found for screen reader navigation');
    }

    analysis.score = Math.round(score * 10) / 10; // Round to 1 decimal
    
    return analysis;
  }

  /**
   * Analyzes content flow organization (article, section, aside)
   */
  private analyzeContentFlow($: cheerio.CheerioAPI): ContentFlowAnalysis {
    const analysis: ContentFlowAnalysis = {
      article: { count: 0, nested: false },
      section: { count: 0, nested: false },
      aside: { count: 0, present: false },
      score: 0,
      issues: []
    };

    // Analyze articles
    const articles = $('article');
    analysis.article.count = articles.length;
    analysis.article.nested = $('article article').length > 0;
    
    // Analyze sections
    const sections = $('section');
    analysis.section.count = sections.length;
    analysis.section.nested = $('section section').length > 0;
    
    // Analyze aside elements
    const asides = $('aside');
    analysis.aside.count = asides.length;
    analysis.aside.present = asides.length > 0;

    // Score calculation (0-10 points)
    let score = 0;
    
    // Article scoring (4 points max)
    if (analysis.article.count > 0) {
      score += Math.min(4, analysis.article.count * 2);
      if (analysis.article.nested) {
        score += 1; // Bonus for proper nesting
      }
    } else {
      analysis.issues.push('No article elements found for main content organization');
    }
    
    // Section scoring (3 points max)
    if (analysis.section.count > 0) {
      score += Math.min(3, analysis.section.count * 1);
      if (analysis.section.nested) {
        score += 0.5; // Bonus for proper nesting
      }
    } else {
      analysis.issues.push('No section elements found for content grouping');
    }
    
    // Aside scoring (3 points max)
    if (analysis.aside.present) {
      score += Math.min(3, analysis.aside.count * 1.5);
    } else {
      analysis.issues.push('No aside elements found for supplementary content');
    }

    analysis.score = Math.round(score * 10) / 10; // Round to 1 decimal
    
    return analysis;
  }

  /**
   * Calculates semantic HTML5 to total element ratio
   */
  private calculateSemanticRatio($: cheerio.CheerioAPI): number {
    const allElements = $('*').length;
    let semanticCount = 0;
    
    SEMANTIC_ELEMENTS.forEach(element => {
      semanticCount += $(element).length;
    });
    
    return allElements > 0 ? Math.round((semanticCount / allElements) * 100) / 100 : 0;
  }

  /**
   * Collects element counts and lists
   */
  private collectElements($: cheerio.CheerioAPI): SharedSemanticHTML5Result['elements'] {
    const structural: string[] = [];
    const content: string[] = [];
    
    // Collect structural elements
    ['main', 'header', 'nav', 'footer'].forEach(element => {
      if ($(element).length > 0) {
        structural.push(element);
      }
    });
    
    // Collect content elements
    ['article', 'section', 'aside'].forEach(element => {
      if ($(element).length > 0) {
        content.push(element);
      }
    });
    
    // Count accessibility features
    const accessibility = $('[aria-label], [aria-describedby], [aria-labelledby], [role]').length;
    
    // Count total and semantic elements
    const totalElements = $('*').length;
    let semanticElements = 0;
    SEMANTIC_ELEMENTS.forEach(element => {
      semanticElements += $(element).length;
    });
    
    return {
      structural,
      content,
      accessibility,
      totalElements,
      semanticElements
    };
  }

  /**
   * Creates error result when analysis fails
   */
  private createErrorResult(errorMessage: string): SharedSemanticHTML5Result {
    return {
      structuralScore: 0,
      accessibilityScore: 0,
      contentFlowScore: 0,
      semanticRatio: 0,
      elements: {
        structural: [],
        content: [],
        accessibility: 0,
        totalElements: 0,
        semanticElements: 0
      },
      details: {
        structuralAnalysis: {
          main: { count: 0, present: false },
          header: { count: 0, present: false },
          nav: { count: 0, present: false },
          footer: { count: 0, present: false },
          score: 0,
          issues: [`Analysis error: ${errorMessage}`]
        },
        accessibilityAnalysis: {
          ariaLabels: 0,
          ariaDescribedBy: 0,
          ariaLabelledBy: 0,
          landmarks: 0,
          roles: 0,
          altTexts: 0,
          score: 0,
          issues: [`Analysis error: ${errorMessage}`]
        },
        contentFlowAnalysis: {
          article: { count: 0, nested: false },
          section: { count: 0, nested: false },
          aside: { count: 0, present: false },
          score: 0,
          issues: [`Analysis error: ${errorMessage}`]
        }
      }
    };
  }
}

// ===== EXPORTS =====

export {
  SEMANTIC_ELEMENTS,
  STRUCTURAL_WEIGHTS,
  CONTENT_FLOW_WEIGHTS
};

export type {
  StructuralElementAnalysis,
  AccessibilityFeatureAnalysis,
  ContentFlowAnalysis
}; 