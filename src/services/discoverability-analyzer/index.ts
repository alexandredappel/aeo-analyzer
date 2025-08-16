/**
 * DISCOVERABILITY ANALYZER - MAIN MODULE
 * 
 * Orchestrates all discoverability analysis components
 * Architecture: 🔍 DISCOVERABILITY → Foundation + AI Access → MetricCards
 * 
 * GLOBAL PENALTY: Robots.txt blocking AI bots affects the final global score
 */

import { 
  DrawerSubSection, 
  MainSection, 
  GlobalPenalty 
} from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';
import { SECTION_CONFIG } from './shared/constants';
import { 
  DiscoverabilityAnalysisResult, 
  CollectedData 
} from './shared/types';

// Import individual analyzers
import { analyzeTechnicalFoundation } from './technical-foundation-analysis';
import { analyzeAiAccess } from './ai-access-analysis';
import { analyzeLlmsTxt } from './llms-txt-analysis';

/**
 * Complete discoverability analysis according to new architecture
 * 
 * @param collectedData - Collected data from crawler
 * @returns DiscoverabilityAnalysisResult with section and global penalties
 */
export function analyzeDiscoverability(collectedData: CollectedData): DiscoverabilityAnalysisResult {
  try {
    // Input data validation
    if (!collectedData?.url) {
      throw new Error('URL required for discoverability analysis');
    }

    // Individual metric analyses
    const foundationResult = analyzeTechnicalFoundation(collectedData);
    const aiAccessResult = analyzeAiAccess(collectedData);
    const llmsTxtCard = analyzeLlmsTxt(collectedData.llmsTxt);
    const globalPenalty = aiAccessResult.globalPenalty; // Extract the penalty

    // Build drawers (DrawerSubSection)
    const foundationDrawer: DrawerSubSection = {
      id: 'foundation',
      name: 'Technical Foundation',
      description: 'HTTPS protocol and HTTP status',
      totalScore: foundationResult.totalScore,
      maxScore: foundationResult.maxScore,
      status: getPerformanceStatus(foundationResult.totalScore, foundationResult.maxScore),
      cards: foundationResult.cards,
    };

    const aiAccessDrawer: DrawerSubSection = {
      id: 'ai-access',
      name: 'AI Access',
      description: 'Accessibility for AI engines and crawlers',
      totalScore: aiAccessResult.totalScore,
      maxScore: aiAccessResult.maxScore,
      status: getPerformanceStatus(aiAccessResult.totalScore, aiAccessResult.maxScore),
      cards: aiAccessResult.cards,
    };

    const llmInstructionsDrawer: DrawerSubSection = {
      id: 'llm-instructions',
      name: 'LLM Instructions',
      description: 'Checks for the presence of an llm.txt file for advanced AI directives.',
      totalScore: llmsTxtCard.score,
      maxScore: llmsTxtCard.maxScore,
      status: llmsTxtCard.rawData?.llmTxtFound ? 'excellent' : 'error',
      cards: [llmsTxtCard],
    };

    // Total section score (LLM Instructions not included as it's informational - 0 points)
    const totalScore = foundationDrawer.totalScore + aiAccessDrawer.totalScore;

    // Build main section
    const section: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: SECTION_CONFIG.description,
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore,
      maxScore: SECTION_CONFIG.maxScore,
      status: getPerformanceStatus(totalScore, SECTION_CONFIG.maxScore),
      drawers: [foundationDrawer, aiAccessDrawer, llmInstructionsDrawer]
    };

    // Raw data for debug/export
    const rawData = {
      httpsEnabled: collectedData.url.startsWith('https://'),
      httpStatusCode: collectedData.html?.metadata?.statusCode || 0,
      robotsContent: collectedData.robotsTxt?.data || '',
      sitemapPresent: collectedData.sitemap?.success || false,
      blockedAIBots: aiAccessResult.cards[0]?.rawData?.blockedBots || [],
      allowedAIBots: aiAccessResult.cards[0]?.rawData?.allowedBots || [],
      llmTxtFound: collectedData.llmsTxt?.success || false,
      llmTxtContent: collectedData.llmsTxt?.data || null
    };

    return {
      section,
      globalPenalties: globalPenalty ? [globalPenalty] : [],
      rawData
    };

  } catch (error) {
    // Error handling with minimal section
    const errorSection: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: 'Analysis error occurred',
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore: 0,
      maxScore: SECTION_CONFIG.maxScore,
      status: 'error',
      drawers: []
    };

    return {
      section: errorSection,
      globalPenalties: [],
      rawData: {
        httpsEnabled: false,
        httpStatusCode: 0,
        robotsContent: '',
        sitemapPresent: false,
        blockedAIBots: [],
        allowedAIBots: [],
        llmTxtFound: false,
        llmTxtContent: null,
        error: (error as Error).message
      }
    };
  }
}

// ===== EXPORTS =====

// Individual analyzers for testing/debugging
export { analyzeTechnicalFoundation } from './technical-foundation-analysis';
export { analyzeAiAccess } from './ai-access-analysis';
export { analyzeLlmsTxt } from './llms-txt-analysis';

// Shared utilities and constants
export * from './shared/constants';
export * from './shared/types';
export * from './shared/utils';
