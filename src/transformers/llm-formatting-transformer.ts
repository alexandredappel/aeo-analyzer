/**
 * LLM FORMATTING TRANSFORMER - PHASE 4B
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

// Legacy format support (for backward compatibility with old API responses)
interface LegacyLLMFormattingResult {
  score: number;
  maxScore: number;
  status: string;
  breakdown?: {
    headingStructure?: { score: number; status: string };
    semanticElements?: { score: number; status: string };
    structuredContent?: { score: number; status: string };
    citationsReferences?: { score: number; status: string };
  };
  recommendations?: string[];
  validation?: {
    valid: boolean;
    issues: string[];
    warnings: string[];
  };
  error?: string;
}

type LLMFormattingInput = LLMFormattingAnalysisResult | LegacyLLMFormattingResult;

export class LLMFormattingTransformer {
  
  /**
   * Transforms backend LLM formatting results into UI structure
   */
  public transform(rawResult: LLMFormattingInput): MainSection {
    try {
      // Check if it's the new format (has section property)
      if (this.isNewFormat(rawResult)) {
        return this.transformNewFormat(rawResult as LLMFormattingAnalysisResult);
      } else {
        return this.transformLegacyFormat(rawResult as LegacyLLMFormattingResult);
      }
    } catch (error) {
      return this.createErrorSection((error as Error).message);
    }
  }

  /**
   * Checks if the result is in new hierarchical format
   */
  private isNewFormat(result: LLMFormattingInput): boolean {
    return 'section' in result && 'rawData' in result;
  }

  /**
   * Transforms new format (LLMFormattingAnalysisResult) to MainSection
   */
  private transformNewFormat(result: LLMFormattingAnalysisResult): MainSection {
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
  private transformLegacyFormat(result: LegacyLLMFormattingResult): MainSection {
    // Create cards from legacy breakdown data
    const headingStructureCard = this.createHeadingStructureCard(result.breakdown?.headingStructure);
    const semanticElementsCard = this.createSemanticElementsCard(result.breakdown?.semanticElements);
    const structuredContentCard = this.createStructuredContentCard(result.breakdown?.structuredContent);
    const citationsCard = this.createCitationsCard(result.breakdown?.citationsReferences);

    // Build drawers for legacy format
    const headingDrawer: DrawerSubSection = {
      id: 'heading-structure',
      name: 'Heading Structure',
      description: 'Logical heading hierarchy and quality',
      totalScore: headingStructureCard.score,
      maxScore: 35,
      status: this.calculateStatus(headingStructureCard.score, 35),
      cards: [headingStructureCard]
    };

    const semanticDrawer: DrawerSubSection = {
      id: 'semantic-html5',
      name: 'Semantic HTML5',
      description: 'Structural elements and semantic markup',
      totalScore: semanticElementsCard.score,
      maxScore: 30,
      status: this.calculateStatus(semanticElementsCard.score, 30),
      cards: [semanticElementsCard]
    };

    const contentDrawer: DrawerSubSection = {
      id: 'content-structure',
      name: 'Content Structure',
      description: 'Structured content and citations',
      totalScore: structuredContentCard.score + citationsCard.score,
      maxScore: 35,
      status: this.calculateStatus(structuredContentCard.score + citationsCard.score, 35),
      cards: [structuredContentCard, citationsCard]
    };

    const totalScore = headingDrawer.totalScore + semanticDrawer.totalScore + contentDrawer.totalScore;

    return {
      id: 'llm-formatting',
      name: 'LLM Formatting',
      emoji: '🤖',
      description: 'AI-friendly structure and formatting analysis',
      weightPercentage: 25,
      totalScore,
      maxScore: 100,
      status: this.calculateStatus(totalScore, 100),
      drawers: [headingDrawer, semanticDrawer, contentDrawer]
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
      successMessage: card.successMessage || "Great! This metric is performing well for AI understanding."
    };
  }

  /**
   * Creates heading structure card from legacy data
   */
  private createHeadingStructureCard(headingData?: { score: number; status: string }): MetricCard {
    const score = headingData?.score || 0;
    const isGood = score > 20;

    return {
      id: 'heading-structure-legacy',
      name: 'Heading Structure',
      score,
      maxScore: 35,
      status: this.calculateStatus(score, 35),
      explanation: "Proper heading hierarchy helps AI understand content structure and importance. Logical H1-H6 organization improves both accessibility and AI comprehension.",
      problems: isGood ? [] : [
        "Heading structure may not follow logical hierarchy",
        "Missing or poorly descriptive headings",
        "Inconsistent heading levels or gaps in sequence"
      ],
      solutions: isGood ? [] : [
        "Use proper heading hierarchy (H1 → H2 → H3, etc.)",
        "Make headings descriptive and informative",
        "Ensure logical content flow through headings",
        "Include only one H1 per page for main topic"
      ],
      successMessage: "Excellent! Your heading hierarchy follows logical structure for AI understanding.",
      rawData: { legacy: true, originalData: headingData }
    };
  }

  /**
   * Creates semantic elements card from legacy data
   */
  private createSemanticElementsCard(semanticData?: { score: number; status: string }): MetricCard {
    const score = semanticData?.score || 0;
    const isGood = score > 20;

    return {
      id: 'semantic-elements-legacy',
      name: 'Semantic Elements',
      score,
      maxScore: 30,
      status: this.calculateStatus(score, 30),
      explanation: "Semantic HTML5 elements provide explicit meaning to content structure, helping AI understand page organization and content relationships.",
      problems: isGood ? [] : [
        "Limited use of semantic HTML5 elements",
        "Missing structural elements (main, header, nav, footer)",
        "Poor content organization with generic divs",
        "Lack of ARIA attributes for enhanced accessibility"
      ],
      solutions: isGood ? [] : [
        "Use semantic HTML5 elements (main, section, article, aside)",
        "Add proper structural elements for page organization",
        "Include ARIA attributes for enhanced accessibility",
        "Replace generic divs with meaningful semantic tags"
      ],
      successMessage: "Great! Your semantic HTML5 structure enhances AI content comprehension.",
      rawData: { legacy: true, originalData: semanticData }
    };
  }

  /**
   * Creates structured content card from legacy data
   */
  private createStructuredContentCard(contentData?: { score: number; status: string }): MetricCard {
    const score = contentData?.score || 0;
    const isGood = score > 15;

    return {
      id: 'structured-content-legacy',
      name: 'Content Structure',
      score,
      maxScore: 20,
      status: this.calculateStatus(score, 20),
      explanation: "Well-structured content with clear organization helps AI understand information hierarchy and extract relevant data efficiently.",
      problems: isGood ? [] : [
        "Content lacks clear structural organization",
        "Missing logical content flow and grouping",
        "Poor use of lists, tables, and content sectioning",
        "Inconsistent content formatting patterns"
      ],
      solutions: isGood ? [] : [
        "Organize content with clear logical sections",
        "Use lists and tables for structured information",
        "Group related content with appropriate HTML elements",
        "Maintain consistent formatting patterns throughout"
      ],
      successMessage: "Perfect! Your content structure is well-organized for AI processing.",
      rawData: { legacy: true, originalData: contentData }
    };
  }

  /**
   * Creates citations card from legacy data
   */
  private createCitationsCard(citationsData?: { score: number; status: string }): MetricCard {
    const score = citationsData?.score || 0;
    const isGood = score > 10;

    return {
      id: 'citations-references-legacy',
      name: 'Citations & References',
      score,
      maxScore: 15,
      status: this.calculateStatus(score, 15),
      explanation: "Proper citations and references help AI understand content credibility and provide context for factual information.",
      problems: isGood ? [] : [
        "Missing or poorly formatted citations",
        "Lack of authoritative source references",
        "Inconsistent citation formatting",
        "No links to supporting evidence or sources"
      ],
      solutions: isGood ? [] : [
        "Add proper citations for factual claims",
        "Link to authoritative and relevant sources",
        "Use consistent citation formatting throughout",
        "Include publication dates and author information where relevant"
      ],
      successMessage: "Excellent! Your citations and references support content credibility for AI.",
      rawData: { legacy: true, originalData: citationsData }
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
      description: 'Analysis failed',
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