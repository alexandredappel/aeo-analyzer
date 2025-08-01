/**
 * STRUCTURED DATA TRANSFORMER - PHASE 3B
 * 
 * Transforms backend structured data analysis results into UI-ready structure
 * Converts analyzer results to hierarchical UI components
 * Maps backend data to MainSection → DrawerSubSection → MetricCard structure
 */

import { 
  MainSection, 
  DrawerSubSection, 
  MetricCard, 
  PerformanceStatus 
} from '@/types/analysis-architecture';
import { StructuredDataAnalysisResult } from '@/services/structured-data-analyzer';

// Legacy format support (for backward compatibility with old API responses)
interface LegacyStructuredDataResult {
  score: number;
  maxScore: number;
  status: string;
  breakdown?: {
    jsonLd?: { score: number; status: string };
    metaTags?: { score: number; status: string };
    openGraph?: { score: number; status: string };
  };
  details?: string;
  error?: string;
}

type StructuredDataInput = StructuredDataAnalysisResult | LegacyStructuredDataResult;

export class StructuredDataTransformer {
  
  /**
   * Transforms backend structured data results into UI structure
   */
  public transform(rawResult: StructuredDataInput): MainSection {
    try {
      // Check if it's the new format (has section property)
      if (this.isNewFormat(rawResult)) {
        return this.transformNewFormat(rawResult as StructuredDataAnalysisResult);
      } else {
        return this.transformLegacyFormat(rawResult as LegacyStructuredDataResult);
      }
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Checks if the result is in new hierarchical format
   */
  private isNewFormat(result: StructuredDataInput): boolean {
    return 'section' in result && 'rawData' in result;
  }

  /**
   * Transforms new format (StructuredDataAnalysisResult) to MainSection
   */
  private transformNewFormat(result: StructuredDataAnalysisResult): MainSection {
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
   * Transforms legacy format to new MainSection structure
   */
  private transformLegacyFormat(result: LegacyStructuredDataResult): MainSection {
    // Create cards from legacy breakdown data
    const jsonldCard = this.createJSONLDCard(result.breakdown?.jsonLd);
    const metaTagsCard = this.createMetaTagsCard(result.breakdown?.metaTags);
    const openGraphCard = this.createOpenGraphCard(result.breakdown?.openGraph);

    // Build drawers
    const jsonldDrawer: DrawerSubSection = {
      id: 'jsonld-analysis',
      name: 'JSON-LD Analysis',
      description: 'Structured data markup validation',
      totalScore: jsonldCard.score,
      maxScore: 40,
      status: this.calculateStatus(jsonldCard.score, 40),
      cards: [jsonldCard]
    };

    const metaTagsDrawer: DrawerSubSection = {
      id: 'meta-tags-analysis',
      name: 'Meta Tags Analysis',
      description: 'Essential metadata tags',
      totalScore: metaTagsCard.score,
      maxScore: 35,
      status: this.calculateStatus(metaTagsCard.score, 35),
      cards: [metaTagsCard]
    };

    const socialMetaDrawer: DrawerSubSection = {
      id: 'social-meta-analysis',
      name: 'Social Meta Analysis',
      description: 'Open Graph social sharing tags',
      totalScore: openGraphCard.score,
      maxScore: 25,
      status: this.calculateStatus(openGraphCard.score, 25),
      cards: [openGraphCard]
    };

    const totalScore = jsonldDrawer.totalScore + metaTagsDrawer.totalScore + socialMetaDrawer.totalScore;

    return {
      id: 'structured-data',
      name: 'Structured Data',
      emoji: '\ud83d\udccb',
      description: 'Does your content have proper schema markup for AI understanding?',
      weightPercentage: 25,
      totalScore,
      maxScore: 100,
      status: this.calculateStatus(totalScore, 100),
      drawers: [jsonldDrawer, metaTagsDrawer, socialMetaDrawer]
    };
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
      // Ensure all required fields are present
      problems: card.problems || [],
      solutions: card.solutions || [],
      successMessage: card.successMessage || "Everything looks good for this metric!"
    };
  }

  /**
   * Creates JSON-LD card from legacy data
   */
  private createJSONLDCard(jsonldData?: { score: number; status: string }): MetricCard {
    const score = jsonldData?.score || 0;
    const isGood = score > 20;

    return {
      id: 'jsonld-legacy',
      name: 'JSON-LD Structured Data',
      score,
      maxScore: 40,
      status: this.calculateStatus(score, 40),
      explanation: "JSON-LD structured data helps search engines and AI understand your content context and purpose.",
      problems: isGood ? [] : [
        "JSON-LD structured data is missing or invalid",
        "Search engines cannot properly understand your content",
        "Reduced eligibility for rich snippets"
      ],
      solutions: isGood ? [] : [
        "Add valid JSON-LD structured data to your pages",
        "Use Schema.org vocabulary for better understanding",
        "Test your structured data with Google's Rich Results Test"
      ],
      successMessage: "Great! Your JSON-LD structured data is properly implemented.",
      rawData: { legacy: true, originalData: jsonldData }
    };
  }

  /**
   * Creates meta tags card from legacy data
   */
  private createMetaTagsCard(metaData?: { score: number; status: string }): MetricCard {
    const score = metaData?.score || 0;
    const isGood = score > 20;

    return {
      id: 'meta-tags-legacy',
      name: 'Meta Tags',
      score,
      maxScore: 35,
      status: this.calculateStatus(score, 35),
      explanation: "Meta tags provide essential information about your page to search engines and browsers.",
      problems: isGood ? [] : [
        "Missing or poorly optimized meta tags",
        "Title tag may be too short or too long",
        "Meta description needs optimization"
      ],
      solutions: isGood ? [] : [
        "Optimize title tag length (50-60 characters)",
        "Write compelling meta descriptions (140-160 characters)",
        "Include relevant keywords naturally"
      ],
      successMessage: "Excellent! Your meta tags are well optimized.",
      rawData: { legacy: true, originalData: metaData }
    };
  }

  /**
   * Creates Open Graph card from legacy data
   */
  private createOpenGraphCard(ogData?: { score: number; status: string }): MetricCard {
    const score = ogData?.score || 0;
    const isGood = score > 15;

    return {
      id: 'open-graph-legacy',
      name: 'Open Graph Tags',
      score,
      maxScore: 25,
      status: this.calculateStatus(score, 25),
      explanation: "Open Graph tags control how your content appears when shared on social media platforms.",
      problems: isGood ? [] : [
        "Open Graph tags are missing or incomplete",
        "Social media previews may not display correctly",
        "Reduced social engagement potential"
      ],
      solutions: isGood ? [] : [
        "Add Open Graph title, description, and image tags",
        "Include og:url for canonical URL specification",
        "Use high-quality images for social sharing"
      ],
      successMessage: "Perfect! Your Open Graph tags are complete for social sharing.",
      rawData: { legacy: true, originalData: ogData }
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
      id: 'structured-data-error',
      name: 'Analysis Error',
      score: 0,
      maxScore: 100,
      status: 'error',
      explanation: "An error occurred during structured data analysis.",
      problems: [`Error: ${errorMessage}`],
      solutions: [
        "Check if the page HTML is valid and accessible",
        "Verify that the URL is correct and reachable",
        "Try running the analysis again"
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
      id: 'structured-data',
      name: 'Structured Data',
      emoji: '\ud83d\udccb',
      description: 'Does your content have proper schema markup for AI understanding?',
      weightPercentage: 25,
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      drawers: [errorDrawer]
    };
  }
}

// Export default instance for easy usage
export default StructuredDataTransformer; 