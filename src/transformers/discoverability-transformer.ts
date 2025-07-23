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

// Legacy format support (for backward compatibility)
interface LegacyDiscoverabilityResult {
  category: string;
  score: number;
  maxScore: number;
  breakdown: {
    https: { score: number; status: string; message: string };
    httpStatus: { score: number; status: string; message: string };
    robotsAiBots: { score: number; status: string; message: string };
    sitemap: { score: number; status: string; message: string };
  };
  recommendations: string[];
  error?: string;
}

type DiscoverabilityInput = DiscoverabilityAnalysisResult | LegacyDiscoverabilityResult;

export class DiscoverabilityTransformer {
  
  /**
   * Transforms backend discoverability results into UI structure
   */
  public transform(rawResult: DiscoverabilityInput): MainSection {
    try {
      // Check if it's the new format
      if (this.isNewFormat(rawResult)) {
        return this.transformNewFormat(rawResult as DiscoverabilityAnalysisResult);
      } else {
        return this.transformLegacyFormat(rawResult as LegacyDiscoverabilityResult);
      }
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Determines if the input is the new DiscoverabilityAnalysisResult format
   */
  private isNewFormat(result: DiscoverabilityInput): boolean {
    return 'section' in result && 'globalPenalties' in result;
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
      description: 'Visibility and accessibility for search engines and AI',
      weightPercentage: 20,
      totalScore: section.totalScore,
      maxScore: section.maxScore,
      status: this.calculateStatus(section.totalScore, section.maxScore),
      drawers: section.drawers.map(drawer => this.translateDrawer(drawer))
    };

    return translatedSection;
  }

  /**
   * Transforms legacy format into new UI structure
   */
  private transformLegacyFormat(result: LegacyDiscoverabilityResult): MainSection {
    const foundationCards = [
      this.createHTTPSCard(result.breakdown.https),
      this.createHTTPStatusCard(result.breakdown.httpStatus)
    ];

    const aiAccessCards = [
      this.createAIBotsCard(result.breakdown.robotsAiBots),
      this.createSitemapCard(result.breakdown.sitemap)
    ];

    const foundationDrawer: DrawerSubSection = {
      id: 'foundation',
      name: 'Technical Foundation',
      description: 'HTTPS protocol and basic accessibility',
      totalScore: foundationCards.reduce((sum, card) => sum + card.score, 0),
      maxScore: 50,
      status: this.calculateStatus(
        foundationCards.reduce((sum, card) => sum + card.score, 0), 
        50
      ),
      cards: foundationCards
    };

    const aiAccessDrawer: DrawerSubSection = {
      id: 'ai-access',
      name: 'AI Access',
      description: 'Accessibility for AI engines and crawlers',
      totalScore: aiAccessCards.reduce((sum, card) => sum + card.score, 0),
      maxScore: 50,
      status: this.calculateStatus(
        aiAccessCards.reduce((sum, card) => sum + card.score, 0), 
        50
      ),
      cards: aiAccessCards
    };

    return {
      id: 'discoverability',
      name: 'Discoverability',
      emoji: '🔍',
      description: 'Visibility and accessibility for search engines and AI',
      weightPercentage: 20,
      totalScore: result.score,
      maxScore: result.maxScore,
      status: this.calculateStatus(result.score, result.maxScore),
      drawers: [foundationDrawer, aiAccessDrawer]
    };
  }

  /**
   * Translates a drawer from French to English
   */
  private translateDrawer(drawer: DrawerSubSection): DrawerSubSection {
    const translatedCards = drawer.cards.map(card => this.translateCard(card));
    
    return {
      ...drawer,
      name: this.translateDrawerName(drawer.id),
      description: this.translateDrawerDescription(drawer.id),
      cards: translatedCards,
      status: this.calculateStatus(drawer.totalScore, drawer.maxScore)
    };
  }

  /**
   * Translates drawer names to English
   */
  private translateDrawerName(drawerId: string): string {
    const translations: Record<string, string> = {
      'foundation': 'Technical Foundation',
      'ai-access': 'AI Access',
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
      'foundation': 'HTTPS protocol and basic accessibility',
      'ai-access': 'Accessibility for AI engines and crawlers'
    };
    
    return descriptions[drawerId] || 'Analysis subsection';
  }

  /**
   * Translates a metric card from French to English
   */
  private translateCard(card: MetricCard): MetricCard {
    return {
      ...card,
      name: this.translateCardName(card.id),
      explanation: this.translateExplanation(card.id),
      problems: this.translateProblems(card.id, card.problems),
      solutions: this.translateSolutions(card.id, card.solutions),
      status: this.calculateStatus(card.score, card.maxScore)
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
      'sitemap-quality': 'Sitemap Quality'
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
      'sitemap-quality': 'XML sitemap helps search engines and AI discover and understand your site structure. It accelerates indexing and improves content coverage.'
    };
    
    return explanations[cardId] || 'Analysis metric for website optimization.';
  }

  /**
   * Translates problems array to English
   */
  private translateProblems(cardId: string, problems: string[]): string[] {
    if (problems.length === 0) return [];

    const problemTranslations: Record<string, string[]> = {
      'https-protocol': [
        'Your site uses HTTP instead of HTTPS',
        'Data is not encrypted in transit',
        'Negative impact on SEO rankings',
        'Loss of trust from users and AI crawlers'
      ],
      'http-status': [
        'Page is not accessible',
        'Connection error or server issue',
        'AI crawlers cannot analyze the content'
      ],
      'ai-bots-access': [
        'Robots.txt file not found',
        'AI bots may have unpredictable access',
        'Risk of default blocking by some crawlers',
        'Some AI bots are blocked by robots.txt',
        'Reduced visibility in AI search results'
      ],
      'sitemap-quality': [
        'XML sitemap file not found',
        'Crawlers cannot discover all pages',
        'Slower and less complete indexing'
      ]
    };

    return problemTranslations[cardId] || problems;
  }

  /**
   * Translates solutions array to English
   */
  private translateSolutions(cardId: string, solutions: string[]): string[] {
    if (solutions.length === 0) return [];

    const solutionTranslations: Record<string, string[]> = {
      'https-protocol': [
        'Install a valid SSL/TLS certificate',
        'Configure automatic HTTP → HTTPS redirection',
        'Update all internal links to HTTPS',
        'Add HSTS (HTTP Strict Transport Security)'
      ],
      'http-status': [
        'Verify web server is running correctly',
        'Check DNS configuration',
        'Test accessibility from different networks',
        'Fix server errors and restore missing content'
      ],
      'ai-bots-access': [
        'Create robots.txt file at site root',
        'Explicitly allow important AI bots',
        'Test accessibility with Google Search Console',
        'Modify robots.txt to allow AI bots',
        'Use \'Allow: /\' for specific AI User-agents',
        'Avoid \'Disallow: /\' in global rules'
      ],
      'sitemap-quality': [
        'Create XML sitemap at site root',
        'Auto-generate sitemap with your CMS',
        'Submit sitemap via Google Search Console',
        'Add sitemap reference in robots.txt',
        'Maintain sitemap automatically',
        'Include all important pages'
      ]
    };

    return solutionTranslations[cardId] || solutions;
  }

  /**
   * Creates HTTPS card from legacy format
   */
  private createHTTPSCard(httpsData: any): MetricCard {
    const isHttps = httpsData.score > 0;
    
    return {
      id: 'https-protocol',
      name: 'HTTPS Protocol',
      score: httpsData.score,
      maxScore: 25,
      status: this.calculateStatus(httpsData.score, 25),
      explanation: this.translateExplanation('https-protocol'),
      problems: isHttps ? [] : this.translateProblems('https-protocol', []),
      solutions: this.translateSolutions('https-protocol', []),
      successMessage: "Great! Your site uses HTTPS protocol for secure connections.",
      rawData: { isSecure: isHttps }
    };
  }

  /**
   * Creates HTTP Status card from legacy format
   */
  private createHTTPStatusCard(statusData: any): MetricCard {
    return {
      id: 'http-status',
      name: 'HTTP Status',
      score: statusData.score,
      maxScore: 25,
      status: this.calculateStatus(statusData.score, 25),
      explanation: this.translateExplanation('http-status'),
      problems: statusData.score < 25 ? this.translateProblems('http-status', []) : [],
      solutions: this.translateSolutions('http-status', []),
      successMessage: "Perfect! Your site returns a valid HTTP 200 status code.",
      rawData: { message: statusData.message }
    };
  }

  /**
   * Creates AI Bots card from legacy format
   */
  private createAIBotsCard(robotsData: any): MetricCard {
    return {
      id: 'ai-bots-access',
      name: 'AI Bots Access',
      score: robotsData.score,
      maxScore: 30,
      status: this.calculateStatus(robotsData.score, 30),
      explanation: this.translateExplanation('ai-bots-access'),
      problems: robotsData.score < 30 ? this.translateProblems('ai-bots-access', []) : [],
      solutions: this.translateSolutions('ai-bots-access', []),
      successMessage: "Excellent! All AI bots can access your content for better AEO.",
      rawData: { message: robotsData.message }
    };
  }

  /**
   * Creates Sitemap card from legacy format
   */
  private createSitemapCard(sitemapData: any): MetricCard {
    return {
      id: 'sitemap-quality',
      name: 'Sitemap Quality',
      score: sitemapData.score,
      maxScore: 20,
      status: this.calculateStatus(sitemapData.score, 20),
      explanation: this.translateExplanation('sitemap-quality'),
      problems: sitemapData.score === 0 ? this.translateProblems('sitemap-quality', []) : [],
      solutions: this.translateSolutions('sitemap-quality', []),
      successMessage: "Great! Your sitemap is properly configured and accessible.",
      rawData: { message: sitemapData.message }
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
    return {
      id: 'discoverability',
      name: 'Discoverability',
      emoji: '🔍',
      description: 'Analysis error occurred',
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