/**
 * LLM FORMATTING TRANSFORMER - FINAL VERSION
 * 
 * Transforms backend LLM formatting analysis results into UI-ready structure
 * Converts analyzer results to hierarchical UI components
 * Maps backend data to MainSection → DrawerSubSection → MetricCard structure
 */

import { 
  MainSection, 
  DrawerSubSection, 
  MetricCard, 
  PerformanceStatus 
} from '@/types/analysis-architecture';
import { LLMFormattingAnalysisResult } from '@/services/llm-formatting-analyzer';

export class LLMFormattingTransformer {
  
  /**
   * Transforms backend LLM formatting results into UI structure
   */
  public transform(result: LLMFormattingAnalysisResult): MainSection {
    try {
      // The new analyzer already returns a complete MainSection structure
      // This transformer serves to normalize and enhance the data
      
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
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Enhances drawer with additional processing
   */
  private enhanceDrawer(drawer: DrawerSubSection): DrawerSubSection {
    return {
      ...drawer,
      status: this.calculateStatus(drawer.totalScore, drawer.maxScore),
      cards: drawer.cards.map(card => this.enhanceCard(card))
    };
  }

  /**
   * Enhances card with validation and normalization
   */
  private enhanceCard(card: MetricCard): MetricCard {
    return {
      ...card,
      status: this.calculateStatus(card.score, card.maxScore),
      recommendations: card.recommendations || [], // Ensure recommendations is always an array
      // Conditionally set the success message
      successMessage: (!card.recommendations || card.recommendations.length === 0) 
        ? card.successMessage || "Excellent! Everything looks good for this metric." 
        : "",
      // Ensure legacy fields are NOT present in the final output
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
   * Creates error section when transformation fails
   */
  private createErrorSection(errorMessage: string): MainSection {
    const errorCard: MetricCard = {
      id: 'llm-formatting-error',
      name: 'Analysis Error',
      score: 0,
      maxScore: 100,
      status: 'error',
      explanation: "An error occurred during LLM formatting analysis.",
      problems: [`Error: ${errorMessage}`],
      solutions: [
        "Check if the page HTML is valid and accessible",
        "Verify that the URL is correct and reachable",
        "Try running the analysis again",
        "Ensure the page contains sufficient content for analysis"
      ],
      successMessage: "Analysis completed successfully!",
      rawData: { error: errorMessage }
    };

    const errorDrawer: DrawerSubSection = {
      id: 'error-drawer',
      name: 'Analysis Error',
      description: 'Error occurred during analysis',
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      cards: [errorCard]
    };

    return {
      id: 'llm-formatting',
      name: 'LLM Formatting',
      emoji: '🤖',
      description: 'Is your content structured for optimal LLM parsing?',
      weightPercentage: 25,
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      drawers: [errorDrawer]
    };
  }
}

// Export default instance for easy usage
export default LLMFormattingTransformer; 