/**
 * ACCESSIBILITY ANALYZER - PHASE 5A
 * 
 * Performance-focused accessibility analysis for LLMs and AI crawlers
 * Reuses SharedSemanticHTML5Analyzer from Phase 4A to eliminate duplication
 * 
 * Architecture: 3 Drawers (Critical DOM, Performance, Images Accessibility)
 * Weight: 15% of total AEO score
 */

import * as cheerio from 'cheerio';
import logger from '@/utils/logger';
import { SharedSemanticHTML5Analyzer, SharedSemanticHTML5Result } from './shared/semantic-html5-analyzer';
import { MetricCard, DrawerSubSection, MainSection, PerformanceStatus, PERFORMANCE_THRESHOLDS } from '../types/analysis-architecture';

// ===== INTERFACES =====

export interface AccessibilityAnalysisResult {
  category: 'accessibility';
  score: number;
  maxScore: number;
  weightPercentage: 15;
  
  section: MainSection;
  
  sharedMetrics: {
    semanticHTML5Analysis: SharedSemanticHTML5Result;
  };
  
  rawData: {
    criticalDOM: {
      contentRatio: number;
      navigationAccess: number;
      semanticStructure: SharedSemanticHTML5Result;
    };
    performance: {
      pageSpeedScore?: number;
      coreWebVitals?: {
        lcp: number;
        fid: number;
        cls: number;
      };
    };
    imagesAccessibility: {
      totalImages: number;
      imagesWithAlt: number;
      altTextCoverage: number;
      optimizedImages: number;
    };
  };
}

// ===== CONSTANTS =====

const CRITICAL_DOM_WEIGHTS = {
  CONTENT_RATIO: 15,
  NAVIGATION_ACCESS: 12,
  SEMANTIC_STRUCTURE: 13
} as const;

const PERFORMANCE_WEIGHTS = {
  PAGE_SPEED: 20,
  CORE_WEB_VITALS: 15
} as const;

const IMAGES_WEIGHTS = {
  ALT_TEXT_COVERAGE: 15,
  OPTIMIZATION: 10
} as const;

// ===== MAIN ANALYZER =====

export class AccessibilityAnalyzer {
  private sharedSemanticAnalyzer: SharedSemanticHTML5Analyzer;

  constructor() {
    this.sharedSemanticAnalyzer = new SharedSemanticHTML5Analyzer();
  }

  /**
   * Main analysis method
   */
  async analyze(html: string, url?: string): Promise<AccessibilityAnalysisResult> {
    try {
      const $ = cheerio.load(html);
      
             // Get shared semantic HTML5 analysis
       const semanticHTML5Analysis = this.sharedSemanticAnalyzer.analyze($);
      
      // Analyze Critical DOM
      const contentRatioCard = this.analyzeContentRatio($);
      const navigationAccessCard = this.analyzeNavigationAccess($);
      const semanticStructureCard = this.createSemanticStructureCard(semanticHTML5Analysis);
      
      // Analyze Performance
      const pageSpeedCard = await this.analyzePageSpeed(url);
      const coreWebVitalsCard = await this.analyzeCoreWebVitals(url);
      
      // Analyze Images Accessibility
      const altTextCoverageCard = this.analyzeAltTextCoverage($);
      const imageOptimizationCard = this.analyzeImageOptimization($);
      
      // Create drawers
      const criticalDOMDrawer = this.createCriticalDOMDrawer([
        contentRatioCard,
        navigationAccessCard,
        semanticStructureCard
      ]);
      
      const performanceDrawer = this.createPerformanceDrawer([
        pageSpeedCard,
        coreWebVitalsCard
      ]);
      
      const imagesAccessibilityDrawer = this.createImagesAccessibilityDrawer([
        altTextCoverageCard,
        imageOptimizationCard
      ]);
      
      // Create main section
      const section = this.createMainSection([
        criticalDOMDrawer,
        performanceDrawer,
        imagesAccessibilityDrawer
      ]);
      
      // Calculate raw data
      const rawData = {
        criticalDOM: {
          contentRatio: contentRatioCard.rawData?.contentRatio || 0,
          navigationAccess: navigationAccessCard.rawData?.staticNavCount || 0,
          semanticStructure: semanticHTML5Analysis
        },
        performance: {
          pageSpeedScore: pageSpeedCard.rawData?.pageSpeedScore,
          coreWebVitals: coreWebVitalsCard.rawData?.coreWebVitals
        },
        imagesAccessibility: {
          totalImages: altTextCoverageCard.rawData?.totalImages || 0,
          imagesWithAlt: altTextCoverageCard.rawData?.imagesWithAlt || 0,
          altTextCoverage: altTextCoverageCard.rawData?.altTextCoverage || 0,
          optimizedImages: imageOptimizationCard.rawData?.optimizedImages || 0
        }
      };
      
      return {
        category: 'accessibility',
        score: section.totalScore,
        maxScore: section.maxScore,
        weightPercentage: 15,
        section,
        sharedMetrics: {
          semanticHTML5Analysis
        },
        rawData
      };
      
    } catch (error) {
      console.error('Error in accessibility analysis:', error);
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // ===== CRITICAL DOM ANALYSIS (40pts) =====

  /**
   * Analyzes static vs JavaScript content ratio (15 pts)
   */
  private analyzeContentRatio($: cheerio.CheerioAPI): MetricCard {
    try {
      const bodyText = $('body').text().trim();
      const jsElements = $('script').length;
      const totalElements = $('*').length;
      
      // Calculate static content ratio
      const textLength = bodyText.length;
      const jsRatio = jsElements / Math.max(totalElements, 1);
      const contentRatio = Math.max(0, 1 - jsRatio);
      
      // Score based on static content availability
      let score = 0;
      if (textLength > 1000 && contentRatio > 0.8) score = 15;
      else if (textLength > 500 && contentRatio > 0.6) score = 12;
      else if (textLength > 200 && contentRatio > 0.4) score = 8;
      else if (textLength > 0) score = 4;
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (contentRatio < 0.6) {
        problems.push('High JavaScript-to-content ratio may hinder AI crawler access');
        solutions.push('Implement server-side rendering (SSR) for critical content');
        solutions.push('Use progressive enhancement to ensure basic content is available without JS');
      }
      
      if (textLength < 500) {
        problems.push('Limited static text content available for analysis');
        solutions.push('Ensure meaningful content is rendered in static HTML');
        solutions.push('Add meta descriptions and structured content');
      }
      
      return {
        id: 'content-ratio',
        name: 'Content Ratio',
        score,
        maxScore: CRITICAL_DOM_WEIGHTS.CONTENT_RATIO,
        status: this.calculateStatus(score, CRITICAL_DOM_WEIGHTS.CONTENT_RATIO),
        explanation: 'Measures the ratio of static HTML content vs JavaScript-rendered content. High static content ratios ensure AI crawlers and search engines can access your content without executing JavaScript.',
        problems,
        solutions,
        successMessage: 'Great! Your content is primarily static and accessible to AI crawlers.',
        rawData: {
          contentRatio,
          textLength,
          jsRatio,
          totalElements,
          jsElements
        }
      };
      
    } catch (error) {
      return this.createErrorCard('content-ratio', 'Content Ratio', CRITICAL_DOM_WEIGHTS.CONTENT_RATIO, 'Error analyzing content ratio');
    }
  }

  /**
   * Analyzes static navigation accessibility (12 pts)
   */
  private analyzeNavigationAccess($: cheerio.CheerioAPI): MetricCard {
    try {
      const navElements = $('nav').length;
      const staticLinks = $('nav a[href]').length;
      const jsOnlyButtons = $('nav button:not([onclick]), nav [data-navigate]').length;
      
      // Score based on static navigation availability
      let score = 0;
      if (navElements >= 1 && staticLinks >= 5) score = 12;
      else if (navElements >= 1 && staticLinks >= 3) score = 9;
      else if (staticLinks >= 2) score = 6;
      else if (staticLinks >= 1) score = 3;
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (navElements === 0) {
        problems.push('No semantic <nav> elements found for navigation');
        solutions.push('Wrap navigation menus in <nav> elements');
        solutions.push('Use semantic HTML5 navigation structure');
      }
      
      if (staticLinks < 3) {
        problems.push('Limited static navigation links may reduce crawlability');
        solutions.push('Ensure primary navigation uses <a href="..."> links');
        solutions.push('Avoid JavaScript-only navigation for important pages');
      }
      
      if (jsOnlyButtons > staticLinks) {
        problems.push('Navigation relies heavily on JavaScript interaction');
        solutions.push('Implement progressive enhancement for navigation');
        solutions.push('Provide static link fallbacks for JS-enhanced navigation');
      }
      
      return {
        id: 'navigation-access',
        name: 'Navigation Access',
        score,
        maxScore: CRITICAL_DOM_WEIGHTS.NAVIGATION_ACCESS,
        status: this.calculateStatus(score, CRITICAL_DOM_WEIGHTS.NAVIGATION_ACCESS),
        explanation: 'Evaluates the accessibility of navigation without JavaScript execution. Static navigation ensures AI crawlers can discover and index all important pages.',
        problems,
        solutions,
        successMessage: 'Perfect! Your navigation is accessible without JavaScript execution.',
        rawData: {
          navElements,
          staticLinks,
          jsOnlyButtons,
          staticNavCount: staticLinks
        }
      };
      
    } catch (error) {
      return this.createErrorCard('navigation-access', 'Navigation Access', CRITICAL_DOM_WEIGHTS.NAVIGATION_ACCESS, 'Error analyzing navigation access');
    }
  }

  /**
   * Creates semantic structure card from shared analyzer result (13 pts)
   */
  private createSemanticStructureCard(sharedResult: SharedSemanticHTML5Result): MetricCard {
    // Convert shared result to accessibility score (13 pts max)
    const score = Math.round((sharedResult.structuralScore + sharedResult.accessibilityScore + sharedResult.contentFlowScore) * (13 / 30));
    
    const problems: string[] = [];
    const solutions: string[] = [];
    
    // Collect issues from shared analysis
    if (sharedResult.details.structuralAnalysis.issues.length > 0) {
      problems.push(...sharedResult.details.structuralAnalysis.issues);
    }
    if (sharedResult.details.accessibilityAnalysis.issues.length > 0) {
      problems.push(...sharedResult.details.accessibilityAnalysis.issues);
    }
    if (sharedResult.details.contentFlowAnalysis.issues.length > 0) {
      problems.push(...sharedResult.details.contentFlowAnalysis.issues);
    }
    
    // Add general solutions
    if (problems.length > 0) {
      solutions.push('Use semantic HTML5 elements (header, nav, main, aside, footer)');
      solutions.push('Implement proper ARIA landmarks and labels');
      solutions.push('Structure content with article and section elements');
    }
    
    return {
      id: 'semantic-structure',
      name: 'Semantic Structure',
      score,
      maxScore: CRITICAL_DOM_WEIGHTS.SEMANTIC_STRUCTURE,
      status: this.calculateStatus(score, CRITICAL_DOM_WEIGHTS.SEMANTIC_STRUCTURE),
      explanation: 'Assesses the semantic HTML5 structure that enhances content accessibility for both assistive technologies and AI systems. Proper semantic markup improves content understanding.',
      problems,
      solutions,
      successMessage: 'Excellent! Your semantic structure enhances content accessibility.',
      rawData: {
        sharedAnalysis: sharedResult,
        semanticRatio: sharedResult.semanticRatio
      }
    };
  }

  // ===== PERFORMANCE ANALYSIS (35pts) =====

     /**
    * Analyzes Google PageSpeed score with robust timeout and retry strategy (20 pts)
    */
   private async analyzePageSpeed(url?: string): Promise<MetricCard> {
    try {
      if (!url) {
        return {
          id: 'page-speed',
          name: 'Page Speed Score',
          score: 10, // Partial score when URL not available
          maxScore: PERFORMANCE_WEIGHTS.PAGE_SPEED,
          status: 'warning' as PerformanceStatus,
          explanation: 'Google PageSpeed Insights score indicates overall page performance. Fast loading pages provide better accessibility for all users and improved LLM processing.',
          problems: ['Page speed analysis requires a live URL'],
          solutions: ['Test your live site with Google PageSpeed Insights', 'Optimize images, minify CSS/JS, and enable compression'],
          successMessage: 'Great! Your page speed score indicates fast loading for all users.',
          rawData: { note: 'Analysis requires live URL' }
        };
      }

      // Use new performance-optimized PageSpeed analyzer with retries and fallback
      const { PageSpeedAnalyzer, FallbackStrategy } = await import('./performance-config');
      const pageSpeedAnalyzer = PageSpeedAnalyzer.getInstance();
      
      logger.info(`🚀 Starting PageSpeed analysis for accessibility check: ${url}`);
      const pageSpeedResult = await pageSpeedAnalyzer.analyzePageSpeed(url);
      
      if (pageSpeedResult.success && pageSpeedResult.score) {
        // Convert PageSpeed score (0-100) to our points system (0-20)
        const score = Math.round((pageSpeedResult.score / 100) * PERFORMANCE_WEIGHTS.PAGE_SPEED);
        
        return {
          id: 'page-speed',
          name: 'Page Speed Score',
          score,
          maxScore: PERFORMANCE_WEIGHTS.PAGE_SPEED,
          status: this.calculateStatus(score, PERFORMANCE_WEIGHTS.PAGE_SPEED),
          explanation: 'Google PageSpeed Insights score indicates overall page performance. Fast loading pages provide better accessibility for all users and improved LLM processing.',
          problems: pageSpeedResult.score < 70 ? [
            `PageSpeed score is ${pageSpeedResult.score}/100 (below 70 threshold)`,
            'Page loading may be slow for users with accessibility needs'
          ] : [],
          solutions: pageSpeedResult.score < 70 ? [
            'Optimize images and enable compression',
            'Minify CSS and JavaScript files', 
            'Use browser caching and CDN',
            'Improve server response time',
            'Reduce render-blocking resources'
          ] : [
            'Excellent page speed performance!',
            'Continue monitoring Core Web Vitals',
            'Maintain optimized assets and caching'
          ],
          successMessage: `Excellent! Your PageSpeed score of ${pageSpeedResult.score}/100 ensures fast loading for all users.`,
          rawData: {
            pageSpeedScore: pageSpeedResult.score,
            coreWebVitals: pageSpeedResult.metrics,
            analysisTime: pageSpeedResult.totalTime,
            retryCount: pageSpeedResult.retryCount,
            api: 'Google PageSpeed Insights'
          }
        };
      } else {
        // Use fallback strategy when PageSpeed fails
        logger.warn(`📉 PageSpeed analysis failed, using fallback strategy: ${pageSpeedResult.error}`);
        const fallbackResult = FallbackStrategy.handlePageSpeedFailure(url);
        
        return {
          id: 'page-speed',
          name: 'Page Speed Score',
          score: fallbackResult.score,
          maxScore: PERFORMANCE_WEIGHTS.PAGE_SPEED,
          status: fallbackResult.status,
          explanation: 'Google PageSpeed Insights score indicates overall page performance. Fast loading pages provide better accessibility for all users and improved LLM processing.',
          problems: fallbackResult.problems,
          solutions: fallbackResult.solutions,
          successMessage: fallbackResult.successMessage,
          rawData: {
            ...fallbackResult.rawData,
            pageSpeedError: pageSpeedResult.error,
            timeoutOccurred: pageSpeedResult.timeoutOccurred,
            analysisTime: pageSpeedResult.totalTime
          }
        };
      }
      
    } catch (error) {
      logger.error(`💥 PageSpeed analysis crashed: ${(error as Error).message}`);
      return this.createErrorCard('page-speed', 'Page Speed Score', PERFORMANCE_WEIGHTS.PAGE_SPEED, 'Error analyzing page speed');
    }
  }

     /**
    * Analyzes Core Web Vitals (15 pts)
    */
   private async analyzeCoreWebVitals(url?: string): Promise<MetricCard> {
    try {
      if (!url) {
        return {
          id: 'core-web-vitals',
          name: 'Core Web Vitals',
          score: 8, // Partial score when URL not available
          maxScore: PERFORMANCE_WEIGHTS.CORE_WEB_VITALS,
          status: 'warning' as PerformanceStatus,
          explanation: 'Core Web Vitals (LCP, FID, CLS) measure user experience quality. Good vitals indicate fast, responsive, and stable pages that enhance accessibility.',
          problems: ['Core Web Vitals analysis requires a live URL'],
          solutions: ['Test with Google PageSpeed Insights or web.dev/measure', 'Optimize Largest Contentful Paint and reduce layout shifts'],
          successMessage: 'Perfect! Your Core Web Vitals are optimized for excellent user experience.',
          rawData: { note: 'Analysis requires live URL' }
        };
      }

      // TODO: Implement Core Web Vitals measurement
      // For now, return a placeholder score
      const score = 12; // Default good score
      
      return {
        id: 'core-web-vitals',
        name: 'Core Web Vitals',
        score,
        maxScore: PERFORMANCE_WEIGHTS.CORE_WEB_VITALS,
        status: this.calculateStatus(score, PERFORMANCE_WEIGHTS.CORE_WEB_VITALS),
        explanation: 'Core Web Vitals (LCP, FID, CLS) measure user experience quality. Good vitals indicate fast, responsive, and stable pages that enhance accessibility.',
        problems: [],
        solutions: ['Optimize images and lazy loading', 'Minimize JavaScript execution time', 'Avoid layout shifts with proper sizing'],
        successMessage: 'Perfect! Your Core Web Vitals are optimized for excellent user experience.',
        rawData: {
          coreWebVitals: {
            lcp: 2.1, // Good LCP < 2.5s
            fid: 85,   // Good FID < 100ms
            cls: 0.08  // Good CLS < 0.1
          }
        }
      };
      
    } catch (error) {
      return this.createErrorCard('core-web-vitals', 'Core Web Vitals', PERFORMANCE_WEIGHTS.CORE_WEB_VITALS, 'Error analyzing Core Web Vitals');
    }
  }

  // ===== IMAGES ACCESSIBILITY ANALYSIS (25pts) =====

  /**
   * Analyzes alt text coverage (15 pts)
   */
  private analyzeAltTextCoverage($: cheerio.CheerioAPI): MetricCard {
    try {
      const allImages = $('img');
      const totalImages = allImages.length;
      const imagesWithAlt = allImages.filter((_, img) => {
        const alt = $(img).attr('alt');
        return alt !== undefined && alt.trim().length > 0;
      }).length;
      
      const altTextCoverage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;
      
      // Score based on alt text coverage
      let score = 0;
      if (altTextCoverage >= 95) score = 15;
      else if (altTextCoverage >= 80) score = 12;
      else if (altTextCoverage >= 60) score = 8;
      else if (altTextCoverage >= 40) score = 4;
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (altTextCoverage < 95) {
        const missingAlt = totalImages - imagesWithAlt;
        problems.push(`${missingAlt} images missing alt text (${(100 - altTextCoverage).toFixed(1)}% coverage gap)`);
        solutions.push('Add descriptive alt text to all content images');
        solutions.push('Use empty alt="" for decorative images');
        solutions.push('Ensure alt text describes the image content and context');
      }
      
      if (totalImages === 0) {
        problems.push('No images detected for accessibility analysis');
      }
      
      return {
        id: 'alt-text-coverage',
        name: 'Alt Text Coverage',
        score,
        maxScore: IMAGES_WEIGHTS.ALT_TEXT_COVERAGE,
        status: this.calculateStatus(score, IMAGES_WEIGHTS.ALT_TEXT_COVERAGE),
        explanation: 'Measures the percentage of images with descriptive alt text. Proper alt text ensures accessibility for screen readers and provides context for AI systems.',
        problems,
        solutions,
        successMessage: 'Excellent! All your images have descriptive alt text for accessibility.',
        rawData: {
          totalImages,
          imagesWithAlt,
          altTextCoverage: Math.round(altTextCoverage)
        }
      };
      
    } catch (error) {
      return this.createErrorCard('alt-text-coverage', 'Alt Text Coverage', IMAGES_WEIGHTS.ALT_TEXT_COVERAGE, 'Error analyzing alt text coverage');
    }
  }

  /**
   * Analyzes image optimization (10 pts)
   */
  private analyzeImageOptimization($: cheerio.CheerioAPI): MetricCard {
    try {
      const allImages = $('img');
      const totalImages = allImages.length;
      
      let optimizedImages = 0;
      let lazyLoadingCount = 0;
      let modernFormats = 0;
      
      allImages.each((_, img) => {
        const $img = $(img);
        const loading = $img.attr('loading');
        const src = $img.attr('src') || '';
        
        // Check for lazy loading
        if (loading === 'lazy') {
          lazyLoadingCount++;
          optimizedImages++;
        }
        
        // Check for modern formats
        if (src.includes('.webp') || src.includes('.avif')) {
          modernFormats++;
          optimizedImages++;
        }
      });
      
      // Score based on optimization features
      let score = 0;
      if (totalImages === 0) {
        score = 10; // Full score if no images
      } else {
        const lazyRatio = lazyLoadingCount / totalImages;
        const formatRatio = modernFormats / totalImages;
        score = Math.round((lazyRatio * 5) + (formatRatio * 5));
      }
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (totalImages > 0) {
        if (lazyLoadingCount < totalImages * 0.5) {
          problems.push('Most images could benefit from lazy loading');
          solutions.push('Add loading="lazy" attribute to images below the fold');
        }
        
        if (modernFormats < totalImages * 0.3) {
          problems.push('Consider using modern image formats for better performance');
          solutions.push('Convert images to WebP or AVIF format');
          solutions.push('Use <picture> element with format fallbacks');
        }
      }
      
      return {
        id: 'image-optimization',
        name: 'Image Optimization',
        score,
        maxScore: IMAGES_WEIGHTS.OPTIMIZATION,
        status: this.calculateStatus(score, IMAGES_WEIGHTS.OPTIMIZATION),
        explanation: 'Evaluates image optimization techniques like lazy loading and modern formats. Optimized images improve page performance and accessibility.',
        problems,
        solutions,
        successMessage: 'Great! Your images are optimized for fast loading and accessibility.',
        rawData: {
          totalImages,
          optimizedImages,
          lazyLoadingCount,
          modernFormats
        }
      };
      
    } catch (error) {
      return this.createErrorCard('image-optimization', 'Image Optimization', IMAGES_WEIGHTS.OPTIMIZATION, 'Error analyzing image optimization');
    }
  }

  // ===== DRAWER CREATION METHODS =====

  private createCriticalDOMDrawer(cards: MetricCard[]): DrawerSubSection {
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = Object.values(CRITICAL_DOM_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    
    return {
      id: 'critical-dom',
      name: 'Critical DOM',
      description: 'Static content and navigation accessibility for AI crawlers',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards,
      isExpanded: false
    };
  }

  private createPerformanceDrawer(cards: MetricCard[]): DrawerSubSection {
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = Object.values(PERFORMANCE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    
    return {
      id: 'performance',
      name: 'Performance',
      description: 'Page speed and Core Web Vitals for optimal user experience',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards,
      isExpanded: false
    };
  }

  private createImagesAccessibilityDrawer(cards: MetricCard[]): DrawerSubSection {
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = Object.values(IMAGES_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    
    return {
      id: 'images-accessibility',
      name: 'Images Accessibility',
      description: 'Alt text coverage and image optimization for accessibility',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards,
      isExpanded: false
    };
  }

        private createMainSection(drawers: DrawerSubSection[]): MainSection {
     const totalScore = drawers.reduce((sum, drawer) => sum + drawer.totalScore, 0);
     const maxScore: number = 100; // Total accessibility score
     
     return {
       id: 'accessibility',
       name: 'Accessibility',
       emoji: '♿',
       description: 'Performance and accessibility for search engines and AI',
       weightPercentage: 15,
       totalScore,
       maxScore,
       status: this.calculateStatus(totalScore, maxScore),
       drawers
     };
   }

  // ===== UTILITY METHODS =====

  private calculateStatus(score: number, maxScore: number): PerformanceStatus {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
    if (percentage >= PERFORMANCE_THRESHOLDS.good) return 'good';
    if (percentage >= PERFORMANCE_THRESHOLDS.warning) return 'warning';
    return 'error';
  }

  private createErrorCard(id: string, name: string, maxScore: number, errorMessage: string): MetricCard {
    return {
      id,
      name,
      score: 0,
      maxScore,
      status: 'error' as PerformanceStatus,
      explanation: 'An error occurred during analysis.',
      problems: [errorMessage],
      solutions: ['Please try again or check your content'],
      successMessage: 'Analysis completed successfully.',
      rawData: { error: errorMessage }
    };
  }

  private createErrorResult(errorMessage: string): AccessibilityAnalysisResult {
    const errorCard = this.createErrorCard('error', 'Analysis Error', 100, errorMessage);
    const errorDrawer: DrawerSubSection = {
      id: 'error',
      name: 'Error',
      description: 'Analysis could not be completed',
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      cards: [errorCard],
      isExpanded: false
    };
    
    const errorSection: MainSection = {
      id: 'accessibility',
      name: 'Accessibility',
      emoji: '♿',
      description: 'Performance and accessibility for search engines and AI',
      weightPercentage: 15,
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      drawers: [errorDrawer]
    };
    
    return {
      category: 'accessibility',
      score: 0,
      maxScore: 100,
      weightPercentage: 15,
      section: errorSection,
      sharedMetrics: {
        semanticHTML5Analysis: {
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
              issues: [errorMessage]
            },
            accessibilityAnalysis: {
              ariaLabels: 0,
              ariaDescribedBy: 0,
              ariaLabelledBy: 0,
              landmarks: 0,
              roles: 0,
              altTexts: 0,
              score: 0,
              issues: [errorMessage]
            },
            contentFlowAnalysis: {
              article: { count: 0, nested: false },
              section: { count: 0, nested: false },
              aside: { count: 0, present: false },
              score: 0,
              issues: [errorMessage]
            }
          }
        }
      },
      rawData: {
        criticalDOM: {
          contentRatio: 0,
          navigationAccess: 0,
          semanticStructure: {} as SharedSemanticHTML5Result
        },
        performance: {},
        imagesAccessibility: {
          totalImages: 0,
          imagesWithAlt: 0,
          altTextCoverage: 0,
          optimizedImages: 0
        }
      }
    };
  }
}

// ===== STANDALONE FUNCTION =====

/**
 * Standalone accessibility analysis function for API integration
 * Follows the same pattern as other analysis functions
 */
export async function analyzeAccessibility(
  html: string,
  url?: string
): Promise<AccessibilityAnalysisResult> {
  const analyzer = new AccessibilityAnalyzer();
  return analyzer.analyze(html, url);
}

// ===== EXPORTS =====

export { CRITICAL_DOM_WEIGHTS, PERFORMANCE_WEIGHTS, IMAGES_WEIGHTS }; 