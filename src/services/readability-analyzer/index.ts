/**
 * READABILITY ANALYZER - MAIN ORCHESTRATOR
 * 
 * Modular architecture for readability analysis
 * Orchestrates Text Clarity, Content Organization, and Linguistic Precision analyses
 * 
 * Architecture: 📖 READABILITY → Text Clarity + Content Organization + Linguistic Precision → MetricCards
 */

import * as cheerio from 'cheerio';
import { MainSection, DrawerSubSection, PerformanceStatus, MetricCard } from '@/types/analysis-architecture';
import { ReadabilityAnalysisResult } from './shared/types';
import { SECTION_CONFIG } from './shared/constants';
import { calculateStatus, extractTextContent } from './shared/utils';

// Import specialized analyzers
import { analyzeTextClarity } from './text-clarity-analysis';
import { analyzeContentOrganization } from './content-organization-analysis';
import { analyzeLinguisticPrecision } from './linguistic-precision-analysis';

/**
 * Complete readability analysis according to modular architecture
 * 
 * @param html The HTML content to analyze
 * @param url The URL of the page (for context)
 * @returns Complete analysis result with section and raw data
 */
export async function analyzeReadability(html: string, url?: string): Promise<ReadabilityAnalysisResult> {
  try {
    // Input validation
    if (!html || typeof html !== 'string') {
      throw new Error('HTML content required for readability analysis');
    }

    const $ = cheerio.load(html);
    const textContent = extractTextContent($);

    // Run specialized analyses (textClarity is now async)
    const textClarityResult = await analyzeTextClarity(textContent);
    const contentOrganizationResult = analyzeContentOrganization($);
    const linguisticPrecisionResult = analyzeLinguisticPrecision(textContent, $);

    // Build drawers (DrawerSubSection)
    const textClarityDrawer: DrawerSubSection = {
      id: 'text-clarity',
      name: 'Text Clarity',
      description: 'Flesch readability score and passive voice analysis for optimal AI comprehension',
      totalScore: textClarityResult.totalScore,
      maxScore: textClarityResult.maxScore,
      status: calculateStatus(textClarityResult.totalScore, textClarityResult.maxScore),
      cards: textClarityResult.cards,
      isExpanded: false
    };

    const contentOrganizationDrawer: DrawerSubSection = {
      id: 'content-organization',
      name: 'Content Organization',
      description: 'Paragraph structure and content density for optimal readability',
      totalScore: contentOrganizationResult.totalScore,
      maxScore: contentOrganizationResult.maxScore,
      status: calculateStatus(contentOrganizationResult.totalScore, contentOrganizationResult.maxScore),
      cards: contentOrganizationResult.cards,
      isExpanded: false
    };

    const linguisticPrecisionDrawer: DrawerSubSection = {
      id: 'linguistic-precision',
      name: 'Linguistic Precision',
      description: 'Analyzes sentence structure and the clarity of interactive elements',
      totalScore: linguisticPrecisionResult.totalScore,
      maxScore: linguisticPrecisionResult.maxScore,
      status: calculateStatus(linguisticPrecisionResult.totalScore, linguisticPrecisionResult.maxScore),
      cards: linguisticPrecisionResult.cards,
      isExpanded: false
    };

    // Calculate total score
    const totalScore = textClarityResult.totalScore + contentOrganizationResult.totalScore + linguisticPrecisionResult.totalScore;

    // Build main section
    const section: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: SECTION_CONFIG.description,
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore,
      maxScore: SECTION_CONFIG.maxScore,
      status: calculateStatus(totalScore, SECTION_CONFIG.maxScore),
      drawers: [textClarityDrawer, contentOrganizationDrawer, linguisticPrecisionDrawer]
    };

    // Raw data for debug/export
    const rawData = {
      textComplexity: {
        fleschScore: textClarityResult.rawData.fleschScore || 0,
        fleschLevel: getFleschLevel(textClarityResult.rawData.fleschScore || 0),
        totalWords: textClarityResult.rawData.totalWords || 0,
        totalSentences: textClarityResult.rawData.totalSentences || 0
      },
      contentOrganization: {
        paragraphStructure: {
          totalParagraphs: contentOrganizationResult.rawData.paragraphStructure.totalParagraphs,
          averageWordsPerParagraph: contentOrganizationResult.rawData.paragraphStructure.averageWordsPerParagraph,
          wellStructuredRatio: contentOrganizationResult.rawData.paragraphStructure.wellStructuredRatio
        },
        contentDensity: {
          textToHTMLRatio: contentOrganizationResult.rawData.contentDensity.textToHTMLRatio,
          readableText: contentOrganizationResult.rawData.contentDensity.readableText,
          totalMarkup: contentOrganizationResult.rawData.contentDensity.totalMarkup
        }
      },
      linguisticPrecision: {
        averageSentenceLength: linguisticPrecisionResult.rawData.averageLength,
        vocabularyDiversity: linguisticPrecisionResult.rawData.vocabularyDiversity,
        uniqueWords: linguisticPrecisionResult.rawData.uniqueWords,
        totalWords: linguisticPrecisionResult.rawData.totalWords
      }
    };

    return {
      category: 'readability',
      score: totalScore,
      maxScore: SECTION_CONFIG.maxScore,
      weightPercentage: SECTION_CONFIG.weightPercentage,
      section,
      rawData
    };

  } catch (error) {
    console.error('Error in readability analysis:', error);
    return createErrorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Helper function to get Flesch level from score
 */
function getFleschLevel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

/**
 * Creates an error result when analysis fails
 */
function createErrorResult(errorMessage: string): ReadabilityAnalysisResult {
  const errorCard: MetricCard = {
    id: 'error',
    name: 'Analysis Error',
    score: 0,
    maxScore: 100,
    status: 'error' as PerformanceStatus,
    explanation: 'An error occurred during analysis.',
    recommendations: [{
      problem: errorMessage,
      solution: 'Please try again or check your content',
      impact: 10
    }],
    successMessage: 'Analysis completed successfully.',
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

  const errorSection: MainSection = {
    id: SECTION_CONFIG.id,
    name: SECTION_CONFIG.name,
    emoji: SECTION_CONFIG.emoji,
    description: SECTION_CONFIG.description,
    weightPercentage: SECTION_CONFIG.weightPercentage,
    totalScore: 0,
    maxScore: SECTION_CONFIG.maxScore,
    status: 'error',
    drawers: [errorDrawer]
  };

  return {
    category: 'readability',
    score: 0,
    maxScore: SECTION_CONFIG.maxScore,
    weightPercentage: SECTION_CONFIG.weightPercentage,
    section: errorSection,
    rawData: {
      textComplexity: {
        fleschScore: 0,
        fleschLevel: 'Unknown',
        totalWords: 0,
        totalSentences: 0
      },
      contentOrganization: {
        paragraphStructure: {
          totalParagraphs: 0,
          averageWordsPerParagraph: 0,
          wellStructuredRatio: 0
        },
        contentDensity: {
          textToHTMLRatio: 0,
          readableText: 0,
          totalMarkup: 0
        }
      },
      linguisticPrecision: {
        averageSentenceLength: 0,
        vocabularyDiversity: 0,
        uniqueWords: 0,
        totalWords: 0
      }
    }
  };
}

// ===== STANDALONE FUNCTION =====

/**
 * Standalone readability analysis function for API integration
 * Follows the same pattern as other analysis functions
 */
export async function analyzeReadabilityAsync(
  html: string,
  url?: string
): Promise<ReadabilityAnalysisResult> {
  return analyzeReadability(html, url);
}

// ===== EXPORTS =====

export { 
  analyzeTextClarity,
  analyzeContentOrganization,
  analyzeLinguisticPrecision
};

export * from './shared/types';
export * from './shared/constants';
export * from './shared/utils'; 