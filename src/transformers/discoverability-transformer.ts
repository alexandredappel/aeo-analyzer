/**
 * DISCOVERABILITY TRANSFORMER - PHASE 2B
 * 
 * Transforms backend discoverability analysis results into UI-ready structure
 * Converts French content to English for frontend display
 * Maps backend data to hierarchical UI components
 */

import { 
  MainSection, 
  DrawerSubSection, 
  MetricCard, 
  PerformanceStatus,
  GlobalPenalty 
} from '@/types/analysis-architecture';
import { DiscoverabilityAnalysisResult } from '@/services/discoverability-analyzer';

type DiscoverabilityInput = DiscoverabilityAnalysisResult;

export class DiscoverabilityTransformer {
  
  /**
   * Transforms backend discoverability results into UI structure
   */
  public transform(rawResult: DiscoverabilityInput): MainSection {
    try {
      return this.transformNewFormat(rawResult);
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Transforms new format with English translation
   */
  private transformNewFormat(result: DiscoverabilityAnalysisResult): MainSection {
    const section = result.section;
    
    // Translate section info to English
    const translatedSection: MainSection = {
      id: section.id,
      name: 'Discoverability',
      emoji: '🔍',
      description: 'Is your website discoverable by AI search engines?',
      weightPercentage: section.weightPercentage,
      totalScore: section.totalScore,
      maxScore: section.maxScore,
      status: this.calculateStatus(section.totalScore, section.maxScore),
      drawers: section.drawers.map(drawer => this.translateDrawer(drawer))
    };

    return translatedSection;
  }



  /**
   * Translates a drawer from French to English
   */
  private translateDrawer(drawer: DrawerSubSection): DrawerSubSection {
    const enhancedCards = drawer.cards.map(card => this.enhanceCard(card));
    
    return {
      ...drawer,
      name: this.translateDrawerName(drawer.id),
      description: this.translateDrawerDescription(drawer.id),
      cards: enhancedCards,
      status: drawer.status
    };
  }

  /**
   * Translates drawer names to English
   */
  private translateDrawerName(drawerId: string): string {
    const translations: Record<string, string> = {
      'foundation': 'Technical Foundation',
      'ai-access': 'AI Access',
      'llm-instructions': 'LLM Instructions',
      'fondations': 'Technical Foundation', // French fallback
      'accès-ia': 'AI Access' // French fallback
    };
    
    return translations[drawerId] || drawerId;
  }

  /**
   * Translates drawer descriptions to English
   */
  private translateDrawerDescription(drawerId: string): string {
    const descriptions: Record<string, string> = {
      'foundation': 'HTTPS protocol and HTTP status',
      'ai-access': 'Accessibility for AI engines and crawlers',
      'llm-instructions': 'Checks for an llm.txt file for advanced AI directives.'
    };
    
    return descriptions[drawerId] || 'Analysis subsection';
  }

  /**
   * Enhances a metric card for UI display
   */
  private enhanceCard(card: MetricCard): MetricCard {
    // This function assumes the card is already in the new format, 
    // as the entire Discoverability module has been refactored.
    return {
      ...card,
      name: this.translateCardName(card.id),
      explanation: this.translateExplanation(card.id),
      status: card.status,
      recommendations: card.recommendations || [], // Ensure recommendations is always an array
      successMessage: (!card.recommendations || card.recommendations.length === 0) 
        ? (card.successMessage || "Excellent! Everything looks good for this metric.")
        : (card.successMessage || "Analysis completed successfully."),
      // Ensure legacy fields are NOT present in the final output
      problems: undefined,
      solutions: undefined,
    };
  }

  /**
   * Translates card names to English
   */
  private translateCardName(cardId: string): string {
    const translations: Record<string, string> = {
      'https-protocol': 'HTTPS Protocol',
      'http-status': 'HTTP Status',
      'ai-bots-access': 'AI Bots Access',
      'sitemap-quality': 'Sitemap Quality',
      'llm-txt-analysis': 'LLM Instructions File'
    };
    
    return translations[cardId] || cardId;
  }

  /**
   * Translates explanations to English
   */
  private translateExplanation(cardId: string): string {
    const explanations: Record<string, string> = {
      'https-protocol': 'HTTPS protocol encrypts data between browser and server, improving security and trust. Google and AI engines prioritize HTTPS sites in their rankings.',
      'http-status': 'HTTP status code indicates if your page is accessible to crawlers. A 200 (success) status is optimal for indexing by search engines and AI.',
      'ai-bots-access': 'AI bot access to your content is crucial for AEO. Robots.txt blocking these bots drastically reduces your visibility in AI responses and can penalize your entire AEO score.',
      'sitemap-quality': 'XML sitemap helps search engines and AI discover and understand your site structure. It accelerates indexing and improves content coverage.',
      'llm-txt-analysis': 'This analysis checks for the presence of an llm.txt or llm-full.txt file, which is an emerging practice for providing AI-specific instructions to advanced crawlers. This is purely informational and does not affect your score.'
    };
    
    return explanations[cardId] || 'Analysis metric for website optimization.';
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
    return {
      id: 'discoverability',
      name: 'Discoverability',
      emoji: '🔍',
      description: 'Is your website discoverable by AI search engines?',
      weightPercentage: 20,
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      drawers: [{
        id: 'error',
        name: 'Error',
        description: 'Analysis could not be completed',
        totalScore: 0,
        maxScore: 100,
        status: 'error',
        cards: [{
          id: 'error-card',
          name: 'Analysis Error',
          score: 0,
          maxScore: 100,
          status: 'error',
          explanation: 'An error occurred during the discoverability analysis.',
          problems: [errorMessage],
          solutions: [
            'Check if the URL is accessible',
            'Verify network connectivity',
            'Try the analysis again'
          ],
          successMessage: 'Analysis completed successfully.'
        }]
      }]
    };
  }
}

// Export singleton instance for easy use
export const discoverabilityTransformer = new DiscoverabilityTransformer();

// Default export
export default DiscoverabilityTransformer; 