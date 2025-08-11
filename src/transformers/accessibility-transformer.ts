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
  PerformanceStatus,
  Recommendation
} from '@/types/analysis-architecture';
import { AccessibilityAnalysisResult } from '@/services/accessibility-analyzer';
import { SharedSemanticHTML5Result } from '@/services/shared/semantic-html5-analyzer';

// Legacy format support (for backward compatibility with old API responses)
interface LegacyAccessibilityResult {
  score: number;
  maxScore: number;
  breakdown?: {
    contentAccessibility?: { score: number; status: string; details: string };
    performance?: { score: number; status: string; details: string };
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
    // Legacy format is no longer supported as Images Accessibility has been replaced
    // Return an error section indicating the format is obsolete
    return this.createErrorSection('Legacy accessibility format is no longer supported. Please use the new accessibility analyzer.');
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
   * Enhances individual card with validation and unified recommendations logic
   */
  private enhanceCard(card: MetricCard): MetricCard {
    // UNIFIED NORMALIZATION LOGIC
    let unifiedRecommendations: Recommendation[] = [];
    
    // 1. If card.recommendations exists (new format), add its content
    if (card.recommendations && card.recommendations.length > 0) {
      unifiedRecommendations.push(...card.recommendations);
    }
    
    // 2. If card.problems exists (old format), convert each problem into a Recommendation
    if (card.problems && card.problems.length > 0) {
      card.problems.forEach(problem => {
        unifiedRecommendations.push({
          problem: problem,
          solution: 'This issue requires attention to improve accessibility. Please review the specific problem and implement appropriate solutions.',
          impact: 5 // Default impact for legacy problems
        });
      });
    }
    
    return {
      ...card,
      // Ensure status is calculated correctly
      status: this.calculateStatus(card.score, card.maxScore),
      // FINAL UNIFIED RECOMMENDATIONS - only this field should exist
      recommendations: unifiedRecommendations,
      // CONDITIONAL SUCCESS MESSAGE LOGIC
      successMessage: (unifiedRecommendations.length === 0) 
        ? card.successMessage || 'Analysis completed successfully.' 
        : "",
      // Clean up legacy fields - they should not exist in final output
      problems: undefined,
      solutions: undefined,
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
      description: 'Can AI bots easily access and crawl your content?',
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
      description: 'Can AI bots easily access and crawl your content?',
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