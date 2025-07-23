/**
 * ACCESSIBILITY TRANSFORMER - PHASE 5B
 * 
 * Transforms backend accessibility analysis results into UI-ready structure
 * Converts analyzer results to hierarchical UI components
 * Maps backend data to MainSection → DrawerSubSection → MetricCard structure
 * 
 * Supports both new AccessibilityAnalysisResult and legacy formats
 */

import { 
  MainSection, 
  DrawerSubSection, 
  MetricCard, 
  PerformanceStatus 
} from '@/types/analysis-architecture';
import { AccessibilityAnalysisResult } from '@/services/accessibility-analyzer';
import { SharedSemanticHTML5Result } from '@/services/shared/semantic-html5-analyzer';

// Legacy format support (for backward compatibility with old API responses)
interface LegacyAccessibilityResult {
  score: number;
  maxScore: number;
  breakdown?: {
    criticalDOM?: { score: number; status: string; details: string };
    performance?: { score: number; status: string; details: string };
    images?: { score: number; status: string; details: string };
  };
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    version: string;
    validComponents?: number;
    totalComponents?: number;
  };
  error?: string;
}

type AccessibilityInput = AccessibilityAnalysisResult | LegacyAccessibilityResult;

export class AccessibilityTransformer {
  
  /**
   * Transforms backend accessibility results into UI structure
   */
  public transform(rawResult: AccessibilityInput): MainSection {
    try {
      // Check if it's the new format (has section property)
      if (this.isNewFormat(rawResult)) {
        return this.transformNewFormat(rawResult as AccessibilityAnalysisResult);
      } else {
        return this.transformLegacyFormat(rawResult as LegacyAccessibilityResult);
      }
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Checks if the result is in new hierarchical format
   */
  private isNewFormat(result: AccessibilityInput): boolean {
    return 'section' in result && 'rawData' in result;
  }

  /**
   * Transforms new format (AccessibilityAnalysisResult) to MainSection
   */
  private transformNewFormat(result: AccessibilityAnalysisResult): MainSection {
    // The new analyzer already returns a complete MainSection structure
    // This transformer serves to normalize and potentially enhance the data
    
    const section = result.section;
    
    // Validate and enhance the section structure
    return {
      id: section.id,
      name: section.name,
      emoji: section.emoji,
      description: section.description,
      weightPercentage: section.weightPercentage,
      totalScore: section.totalScore,
      maxScore: section.maxScore,
      status: this.calculateStatus(section.totalScore, section.maxScore),
      drawers: section.drawers.map(drawer => this.enhanceDrawer(drawer))
    };
  }

  /**
   * Transforms legacy format to MainSection structure
   */
  private transformLegacyFormat(result: LegacyAccessibilityResult): MainSection {
    // Reconstruct complete structure from legacy data
    const criticalDOMDrawer = this.createLegacyCriticalDOMDrawer(result);
    const performanceDrawer = this.createLegacyPerformanceDrawer(result);
    const imagesDrawer = this.createLegacyImagesDrawer(result);

    const totalScore = criticalDOMDrawer.totalScore + performanceDrawer.totalScore + imagesDrawer.totalScore;
    
    return {
      id: 'accessibility',
      name: 'Accessibility',
      emoji: '♿',
      description: 'Performance and accessibility for search engines and AI',
      weightPercentage: 15,
      totalScore,
      maxScore: 100,
      status: this.calculateStatus(totalScore, 100),
      drawers: [criticalDOMDrawer, performanceDrawer, imagesDrawer]
    };
  }

  /**
   * Creates Critical DOM drawer for legacy format
   */
  private createLegacyCriticalDOMDrawer(result: LegacyAccessibilityResult): DrawerSubSection {
    const score = result.breakdown?.criticalDOM?.score || 0;
    const maxScore = 40;
    
    // Create fallback cards when detailed data isn't available
    const contentRatioCard: MetricCard = {
      id: 'content-ratio',
      name: 'Content Ratio',
      score: Math.round(score * 0.375), // 15/40 of total score
      maxScore: 15,
      status: this.calculateStatus(score * 0.375, 15),
      explanation: 'Measures the ratio of static HTML content vs JavaScript-rendered content. High static content ratios ensure AI crawlers and search engines can access your content without executing JavaScript.',
      problems: score < 30 ? ['Limited static content detected'] : [],
      solutions: score < 30 ? ['Implement server-side rendering (SSR) for critical content', 'Use progressive enhancement to ensure basic content is available without JS'] : [],
      successMessage: 'Great! Your content is primarily static and accessible to AI crawlers.',
      rawData: { legacyScore: score }
    };

    const navigationAccessCard: MetricCard = {
      id: 'navigation-access',
      name: 'Navigation Access',
      score: Math.round(score * 0.3), // 12/40 of total score
      maxScore: 12,
      status: this.calculateStatus(score * 0.3, 12),
      explanation: 'Evaluates the accessibility of navigation without JavaScript execution. Static navigation ensures AI crawlers can discover and index all important pages.',
      problems: score < 30 ? ['Navigation may require JavaScript'] : [],
      solutions: score < 30 ? ['Ensure primary navigation uses <a href="..."> links', 'Avoid JavaScript-only navigation for important pages'] : [],
      successMessage: 'Perfect! Your navigation is accessible without JavaScript execution.',
      rawData: { legacyScore: score }
    };

    const semanticStructureCard: MetricCard = {
      id: 'semantic-structure',
      name: 'Semantic Structure',
      score: Math.round(score * 0.325), // 13/40 of total score
      maxScore: 13,
      status: this.calculateStatus(score * 0.325, 13),
      explanation: 'Assesses the semantic HTML5 structure that enhances content accessibility for both assistive technologies and AI systems. Proper semantic markup improves content understanding.',
      problems: score < 30 ? ['Limited semantic HTML5 structure'] : [],
      solutions: score < 30 ? ['Use semantic HTML5 elements (header, nav, main, aside, footer)', 'Implement proper ARIA landmarks and labels'] : [],
      successMessage: 'Excellent! Your semantic structure enhances content accessibility.',
      rawData: { legacyScore: score }
    };

    return {
      id: 'critical-dom',
      name: 'Critical DOM',
      description: 'Static content and navigation accessibility for AI crawlers',
      totalScore: score,
      maxScore,
      status: this.calculateStatus(score, maxScore),
      cards: [contentRatioCard, navigationAccessCard, semanticStructureCard],
      isExpanded: false
    };
  }

  /**
   * Creates Performance drawer for legacy format
   */
  private createLegacyPerformanceDrawer(result: LegacyAccessibilityResult): DrawerSubSection {
    const score = result.breakdown?.performance?.score || 0;
    const maxScore = 35;
    
    const pageSpeedCard: MetricCard = {
      id: 'page-speed',
      name: 'Page Speed Score',
      score: Math.round(score * 0.571), // 20/35 of total score
      maxScore: 20,
      status: this.calculateStatus(score * 0.571, 20),
      explanation: 'Google PageSpeed Insights score indicates overall page performance. Fast loading pages provide better accessibility for all users and improved LLM processing.',
      problems: score < 25 ? ['Page speed may be slow'] : [],
      solutions: score < 25 ? ['Optimize images and enable compression', 'Minify CSS and JavaScript files', 'Use browser caching and CDN'] : [],
      successMessage: 'Great! Your page speed score indicates fast loading for all users.',
      rawData: { legacyScore: score }
    };

    const coreWebVitalsCard: MetricCard = {
      id: 'core-web-vitals',
      name: 'Core Web Vitals',
      score: Math.round(score * 0.429), // 15/35 of total score
      maxScore: 15,
      status: this.calculateStatus(score * 0.429, 15),
      explanation: 'Core Web Vitals (LCP, FID, CLS) measure user experience quality. Good vitals indicate fast, responsive, and stable pages that enhance accessibility.',
      problems: score < 25 ? ['Core Web Vitals may need optimization'] : [],
      solutions: score < 25 ? ['Optimize images and lazy loading', 'Minimize JavaScript execution time', 'Avoid layout shifts with proper sizing'] : [],
      successMessage: 'Perfect! Your Core Web Vitals are optimized for excellent user experience.',
      rawData: { legacyScore: score }
    };

    return {
      id: 'performance',
      name: 'Performance',
      description: 'Page speed and Core Web Vitals for optimal user experience',
      totalScore: score,
      maxScore,
      status: this.calculateStatus(score, maxScore),
      cards: [pageSpeedCard, coreWebVitalsCard],
      isExpanded: false
    };
  }

  /**
   * Creates Images Accessibility drawer for legacy format
   */
  private createLegacyImagesDrawer(result: LegacyAccessibilityResult): DrawerSubSection {
    const score = result.breakdown?.images?.score || 0;
    const maxScore = 25;
    
    const altTextCoverageCard: MetricCard = {
      id: 'alt-text-coverage',
      name: 'Alt Text Coverage',
      score: Math.round(score * 0.6), // 15/25 of total score
      maxScore: 15,
      status: this.calculateStatus(score * 0.6, 15),
      explanation: 'Measures the percentage of images with descriptive alt text. Proper alt text ensures accessibility for screen readers and provides context for AI systems.',
      problems: score < 20 ? ['Some images may be missing alt text'] : [],
      solutions: score < 20 ? ['Add descriptive alt text to all content images', 'Use empty alt="" for decorative images', 'Ensure alt text describes the image content and context'] : [],
      successMessage: 'Excellent! All your images have descriptive alt text for accessibility.',
      rawData: { legacyScore: score }
    };

    const optimizationCard: MetricCard = {
      id: 'image-optimization',
      name: 'Image Optimization',
      score: Math.round(score * 0.4), // 10/25 of total score
      maxScore: 10,
      status: this.calculateStatus(score * 0.4, 10),
      explanation: 'Evaluates image optimization techniques like lazy loading and modern formats. Optimized images improve page performance and accessibility.',
      problems: score < 20 ? ['Images could be better optimized'] : [],
      solutions: score < 20 ? ['Add loading="lazy" attribute to images below the fold', 'Convert images to WebP or AVIF format', 'Use <picture> element with format fallbacks'] : [],
      successMessage: 'Great! Your images are optimized for fast loading and accessibility.',
      rawData: { legacyScore: score }
    };

    return {
      id: 'images-accessibility',
      name: 'Images Accessibility',
      description: 'Alt text coverage and image optimization for accessibility',
      totalScore: score,
      maxScore,
      status: this.calculateStatus(score, maxScore),
      cards: [altTextCoverageCard, optimizationCard],
      isExpanded: false
    };
  }

  /**
   * Enhances drawer with additional validation and normalization
   */
  private enhanceDrawer(drawer: DrawerSubSection): DrawerSubSection {
    return {
      ...drawer,
      // Ensure all cards have proper structure
      cards: drawer.cards.map(card => this.enhanceCard(card)),
      // Recalculate status based on actual scores
      status: this.calculateStatus(drawer.totalScore, drawer.maxScore)
    };
  }

  /**
   * Enhances individual card with validation
   */
  private enhanceCard(card: MetricCard): MetricCard {
    return {
      ...card,
      // Ensure status is calculated correctly
      status: this.calculateStatus(card.score, card.maxScore),
      // Ensure all required fields are present
      problems: card.problems || [],
      solutions: card.solutions || [],
      successMessage: card.successMessage || 'Analysis completed successfully.'
    };
  }

  /**
   * Calculates performance status based on score percentage
   */
  private calculateStatus(score: number, maxScore: number): PerformanceStatus {
    if (maxScore === 0) return 'error';
    
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 85) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'warning';
    return 'error';
  }

  /**
   * Creates an error section when transformation fails
   */
  private createErrorSection(errorMessage: string): MainSection {
    const errorCard: MetricCard = {
      id: 'error',
      name: 'Analysis Error',
      score: 0,
      maxScore: 100,
      status: 'error',
      explanation: 'An error occurred during accessibility analysis.',
      problems: [errorMessage],
      solutions: ['Please try the analysis again', 'Check your input data for validity'],
      successMessage: 'Analysis will complete successfully when the error is resolved.',
      rawData: { error: errorMessage }
    };

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

    return {
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
  }
}

// Export default instance for convenience
export default new AccessibilityTransformer(); 