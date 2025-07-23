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
  PerformanceStatus 
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
    const textComplexityDrawer = this.createLegacyTextComplexityDrawer(result);
    const contentOrganizationDrawer = this.createLegacyContentOrganizationDrawer(result);
    const sentenceQualityDrawer = this.createLegacySentenceQualityDrawer(result);

    const totalScore = textComplexityDrawer.totalScore + contentOrganizationDrawer.totalScore + sentenceQualityDrawer.totalScore;
    
    return {
      id: 'readability',
      name: 'Readability',
      emoji: '📖',
      description: 'Is your content readable and well-structured for AI comprehension?',
      weightPercentage: 15,
      totalScore,
      maxScore: 100,
      status: this.calculateStatus(totalScore, 100),
      drawers: [textComplexityDrawer, contentOrganizationDrawer, sentenceQualityDrawer]
    };
  }

  /**
   * Creates Text Complexity drawer for legacy format
   */
  private createLegacyTextComplexityDrawer(result: LegacyReadabilityResult): DrawerSubSection {
    const score = result.breakdown?.fleschScore?.score || 0;
    const maxScore = 40;
    
    // Create fallback card when detailed data isn't available
    const fleschScoreCard: MetricCard = {
      id: 'flesch-score',
      name: 'Flesch Score',
      score: Math.round(score * 0.4), // Convert to 40pt scale
      maxScore: 40,
      status: this.calculateStatus(score * 0.4, 40),
      explanation: 'Measures content readability using the Flesch Reading Ease formula. Optimal scores (60-80) ensure content is accessible to both human readers and AI systems for better comprehension and engagement.',
      problems: score < 60 ? ['Content complexity may be too high for optimal comprehension'] : [],
      solutions: score < 60 ? ['Shorten sentences to 15-25 words for better clarity', 'Use simpler vocabulary where possible', 'Break down complex ideas into smaller, digestible parts'] : [],
      successMessage: 'Excellent! Your content readability is optimized for both humans and AI.',
      rawData: { 
        legacyScore: score,
        fleschLevel: result.details?.fleschLevel || 'Unknown'
      }
    };

    return {
      id: 'text-complexity',
      name: 'Text Complexity',
      description: 'Flesch readability score optimized for human and AI comprehension',
      totalScore: Math.round(score * 0.4),
      maxScore,
      status: this.calculateStatus(score * 0.4, maxScore),
      cards: [fleschScoreCard],
      isExpanded: false
    };
  }

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
   * Creates Sentence Quality drawer for legacy format
   */
  private createLegacySentenceQualityDrawer(result: LegacyReadabilityResult): DrawerSubSection {
    const fleschScore = result.breakdown?.fleschScore?.score || 0;
    const totalScore = Math.round(fleschScore * 0.25); // Convert to 25pt scale
    const maxScore = 25;
    
    const averageLengthCard: MetricCard = {
      id: 'average-length',
      name: 'Average Length',
      score: Math.round(fleschScore * 0.15), // 15/100 of flesch score
      maxScore: 15,
      status: this.calculateStatus(fleschScore * 0.15, 15),
      explanation: 'Evaluates the average length of sentences for optimal comprehension. Sentences in the 15-25 word range provide the best balance of information density and readability for both human readers and AI systems.',
      problems: fleschScore < 60 ? ['Sentence length may need optimization'] : [],
      solutions: fleschScore < 60 ? ['Aim for 15-25 words per sentence for optimal readability', 'Break long sentences into shorter, clearer statements'] : [],
      successMessage: 'Excellent! Your sentence length is optimal for comprehension.',
      rawData: { 
        legacyScore: fleschScore,
        averageSentenceLength: result.details?.averageSentenceLength || 0
      }
    };

    const vocabularyDiversityCard: MetricCard = {
      id: 'vocabulary-diversity',
      name: 'Vocabulary Diversity',
      score: Math.round(fleschScore * 0.1), // 10/100 of flesch score
      maxScore: 10,
      status: this.calculateStatus(fleschScore * 0.1, 10),
      explanation: 'Measures the diversity of vocabulary used in the content. Rich vocabulary diversity engages readers and demonstrates expertise while maintaining accessibility and avoiding unnecessary complexity.',
      problems: fleschScore < 60 ? ['Vocabulary diversity could be enhanced'] : [],
      solutions: fleschScore < 60 ? ['Use varied vocabulary while maintaining accessibility', 'Replace repeated words with synonyms where appropriate'] : [],
      successMessage: 'Great! Your vocabulary diversity engages readers while staying accessible.',
      rawData: { 
        legacyScore: fleschScore,
        uniqueWords: result.details?.uniqueWords || 0,
        totalWords: result.details?.wordCount || 0
      }
    };

    return {
      id: 'sentence-quality',
      name: 'Sentence Quality',
      description: 'Sentence length and vocabulary diversity for clear communication',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards: [averageLengthCard, vocabularyDiversityCard],
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
      explanation: 'An error occurred during readability analysis.',
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