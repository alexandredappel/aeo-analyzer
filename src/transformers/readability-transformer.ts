/**
 * READABILITY TRANSFORMER - PHASE 6B
 * 
 * Transforms backend readability analysis results into UI-ready structure
 * Converts analyzer results to hierarchical UI components
 * Maps backend data to MainSection → DrawerSubSection → MetricCard structure
 * 
 * Supports both new ReadabilityAnalysisResult and legacy formats
 * Editorial focus for content creators
 */

import { 
  MainSection, 
  DrawerSubSection, 
  MetricCard, 
  PerformanceStatus,
  Recommendation
} from '@/types/analysis-architecture';
import { ReadabilityAnalysisResult } from '@/services/readability-analyzer';

// Legacy format support (for backward compatibility with old API responses)
interface LegacyReadabilityResult {
  score: number;
  maxScore: number;
  breakdown?: {
    fleschScore?: { score: number; status: string; details: string };
    sentenceComplexity?: { score: number; status: string; details: string };
    contentDensity?: { score: number; status: string; details: string };
  };
  details?: {
    fleschLevel?: string;
    averageSentenceLength?: number;
    wordCount?: number;
    uniqueWords?: number;
    contentDensityRatio?: number;
  };
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    version: string;
  };
  error?: string;
}

type ReadabilityInput = ReadabilityAnalysisResult | LegacyReadabilityResult;

export class ReadabilityTransformer {
  
  /**
   * Transforms backend readability results into UI structure
   */
  public transform(rawResult: ReadabilityInput): MainSection {
    try {
      // Check if it's the new format (has section property)
      if (this.isNewFormat(rawResult)) {
        return this.transformNewFormat(rawResult as ReadabilityAnalysisResult);
      } else {
        return this.transformLegacyFormat(rawResult as LegacyReadabilityResult);
      }
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Checks if the result is in new hierarchical format
   */
  private isNewFormat(result: ReadabilityInput): boolean {
    return 'section' in result && 'rawData' in result;
  }

  /**
   * Transforms new format (ReadabilityAnalysisResult) to MainSection
   */
  private transformNewFormat(result: ReadabilityAnalysisResult): MainSection {
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
  private transformLegacyFormat(result: LegacyReadabilityResult): MainSection {
    // Reconstruct complete structure from legacy data
    // Text Complexity drawer removed - replaced by new Text Clarity analysis
    // Sentence Quality drawer removed - replaced by new Linguistic Precision analysis
    const contentOrganizationDrawer = this.createLegacyContentOrganizationDrawer(result);

    const totalScore = contentOrganizationDrawer.totalScore;
    
    return {
      id: 'readability',
      name: 'Readability',
      emoji: '📖',
      description: 'Is your content readable and well-structured for AI comprehension?',
      weightPercentage: 15,
      totalScore,
      maxScore: 100,
      status: this.calculateStatus(totalScore, 100),
      drawers: [contentOrganizationDrawer]
    };
  }

  /**
   * Creates Text Complexity drawer for legacy format
   */

  /**
   * Creates Content Organization drawer for legacy format
   */
  private createLegacyContentOrganizationDrawer(result: LegacyReadabilityResult): DrawerSubSection {
    const complexityScore = result.breakdown?.sentenceComplexity?.score || 0;
    const densityScore = result.breakdown?.contentDensity?.score || 0;
    const totalScore = Math.round((complexityScore + densityScore) * 0.35); // Convert to 35pt scale
    const maxScore = 35;
    
    const paragraphStructureCard: MetricCard = {
      id: 'paragraph-structure',
      name: 'Paragraph Structure',
      score: Math.round(complexityScore * 0.2), // 20/100 of legacy score
      maxScore: 20,
      status: this.calculateStatus(complexityScore * 0.2, 20),
      explanation: 'Evaluates paragraph length and structure for optimal readability. Well-structured paragraphs (50-150 words) improve content scannability and reader engagement while maintaining proper information density.',
      problems: complexityScore < 70 ? ['Paragraph structure may need optimization'] : [],
      solutions: complexityScore < 70 ? ['Aim for 50-150 words per paragraph for better readability', 'Break long paragraphs into smaller, focused sections'] : [],
      successMessage: 'Great! Your paragraphs are well-structured for easy scanning.',
      rawData: { legacyScore: complexityScore }
    };

    const contentDensityCard: MetricCard = {
      id: 'content-density',
      name: 'Content Density',
      score: Math.round(densityScore * 0.15), // 15/100 of legacy score
      maxScore: 15,
      status: this.calculateStatus(densityScore * 0.15, 15),
      explanation: 'Measures the ratio of readable text content to HTML markup. Higher ratios indicate substantial, content-rich pages that provide real value to readers and search engines.',
      problems: densityScore < 70 ? ['Content density could be improved'] : [],
      solutions: densityScore < 70 ? ['Add more meaningful text content', 'Remove unnecessary HTML markup and decorative elements'] : [],
      successMessage: 'Perfect! Your content has high substance-to-markup ratio.',
      rawData: { 
        legacyScore: densityScore,
        contentDensityRatio: result.details?.contentDensityRatio || 0
      }
    };

    return {
      id: 'content-organization',
      name: 'Content Organization',
      description: 'Paragraph structure and content density for optimal readability',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards: [paragraphStructureCard, contentDensityCard],
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
   * Enhances individual card with validation and unified normalization
   * Handles both new Recommendation[] format and legacy problems/solutions format
   */
  private enhanceCard(card: MetricCard): MetricCard {
    // Initialize unified recommendations array
    let unifiedRecommendations: Recommendation[] = [];
    
    // Step 1: Add new format recommendations if they exist
    if (card.recommendations && Array.isArray(card.recommendations)) {
      unifiedRecommendations.push(...card.recommendations);
    }
    
    // Step 2: Convert legacy problems to recommendations if they exist
    if (card.problems && Array.isArray(card.problems)) {
      card.problems.forEach((problem: string) => {
        unifiedRecommendations.push({
          problem: problem,
          solution: "Consult the relevant documentation or use a validation tool.",
          impact: 5
        });
      });
    }
    
    // Step 3: If we have legacy solutions but no problems, create generic recommendations
    if (card.solutions && Array.isArray(card.solutions) && (!card.problems || card.problems.length === 0)) {
      card.solutions.forEach((solution: string) => {
        unifiedRecommendations.push({
          problem: "General improvement opportunity identified.",
          solution: solution,
          impact: 5
        });
      });
    }
    
    // Return normalized card with unified recommendations format
    return {
      ...card,
      // Ensure status is calculated correctly
      status: this.calculateStatus(card.score, card.maxScore),
      // Use unified recommendations array
      recommendations: unifiedRecommendations,
      // Remove legacy fields to ensure clean output
      problems: undefined,
      solutions: undefined,
      // CONDITIONAL SUCCESS MESSAGE LOGIC
      successMessage: (unifiedRecommendations.length === 0) 
        ? card.successMessage || 'Analysis completed successfully.' 
        : ""
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
      explanation: 'An error occurred during readability analysis.',
      recommendations: [{
        problem: errorMessage,
        solution: 'Please try the analysis again or check your input data for validity.',
        impact: 10
      }],
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
      id: 'readability',
      name: 'Readability',
      emoji: '📖',
      description: 'Is your content readable and well-structured for AI comprehension?',
      weightPercentage: 15,
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      drawers: [errorDrawer]
    };
  }
}

// Export default instance for convenience
export default new ReadabilityTransformer(); 