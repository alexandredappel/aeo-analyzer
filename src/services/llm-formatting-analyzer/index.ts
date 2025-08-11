/**
 * LLM FORMATTING ANALYZER - MAIN MODULE
 * 
 * Orchestrates all LLM formatting analysis components
 * Architecture: 🤖 LLM FORMATTING → Content Hierarchy + Layout & Structural Roles + Inline Semantics → MetricCards
 */

import * as cheerio from 'cheerio';
import { 
  DrawerSubSection, 
  MainSection 
} from '@/types/analysis-architecture';

import { SECTION_CONFIG } from './shared/constants';
import { getPerformanceStatus } from './shared/utils';
import { LLMFormattingAnalysisResult } from './shared/types';

// Import all analysis modules
import {
  analyzeContentHierarchy
} from './content-hierarchy-analysis';

import {
  analyzeLayoutAndStructuralRoles
} from './layout-structural-roles-analysis';

import {
  analyzeInlineSemantics
} from './inline-semantics-analysis';



/**
 * Complete LLM formatting analysis according to new architecture
 */
export function analyzeLLMFormatting(html: string, url: string): LLMFormattingAnalysisResult {
  try {
    // Input validation
    if (!html || typeof html !== 'string') {
      throw new Error('HTML content required for LLM formatting analysis');
    }

    // Initialize Cheerio for HTML parsing
    const $ = cheerio.load(html);

    // Individual metric analyses
    const contentHierarchyResult = analyzeContentHierarchy($);
    const layoutResult = analyzeLayoutAndStructuralRoles($);
    const inlineSemanticsCard = analyzeInlineSemantics($);

    // Build drawers (DrawerSubSection)
    const contentHierarchyDrawer: DrawerSubSection = {
      id: 'content-hierarchy',
      name: 'Content Hierarchy',
      description: 'Analyzes the logical structure of headings and data groups for AI comprehension.',
      totalScore: contentHierarchyResult.totalScore,
      maxScore: contentHierarchyResult.maxScore,
      status: getPerformanceStatus(contentHierarchyResult.totalScore, contentHierarchyResult.maxScore),
      cards: contentHierarchyResult.cards,
    };

    const layoutAndStructuralRolesDrawer: DrawerSubSection = {
      id: 'layout-structural-roles',
      name: 'Layout & Structural Roles',
      description: 'Analyzes the use of semantic tags to define the main functional regions of the page.',
      totalScore: layoutResult.totalScore,
      maxScore: layoutResult.maxScore,
      status: getPerformanceStatus(layoutResult.totalScore, layoutResult.maxScore),
      cards: layoutResult.cards,
    };

    const inlineSemanticsDrawer: DrawerSubSection = {
      id: 'cta-context-clarity',
      name: 'CTA Context Clarity',
      description: 'Analyzes the contextual clarity of interactive elements like links and buttons.',
      totalScore: inlineSemanticsCard.score,
      maxScore: inlineSemanticsCard.maxScore,
      status: getPerformanceStatus(inlineSemanticsCard.score, inlineSemanticsCard.maxScore),
      cards: [inlineSemanticsCard],
    };

    // Total section score
    const totalScore = contentHierarchyDrawer.totalScore + layoutAndStructuralRolesDrawer.totalScore + 
                      inlineSemanticsDrawer.totalScore;

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
      drawers: [contentHierarchyDrawer, layoutAndStructuralRolesDrawer, inlineSemanticsDrawer]
    };

    const rawData = {
      contentHierarchy: {
        totalScore: contentHierarchyResult.totalScore,
        maxScore: contentHierarchyResult.maxScore,
        cards: contentHierarchyResult.cards.map(card => ({
          id: card.id,
          score: card.score,
          maxScore: card.maxScore,
          status: card.status
        }))
      },
      layoutAndStructuralRoles: {
        totalScore: layoutResult.totalScore,
        maxScore: layoutResult.maxScore,
        cards: layoutResult.cards.map(card => ({
          id: card.id,
          score: card.score,
          maxScore: card.maxScore,
          status: card.status
        }))
      },
      ctaContextClarity: {
        totalScore: inlineSemanticsCard.score,
        maxScore: inlineSemanticsCard.maxScore,
        totalLinks: inlineSemanticsCard.rawData?.totalLinks || 0,
        clearLinks: inlineSemanticsCard.rawData?.clearLinks || 0,
        clarityRatio: inlineSemanticsCard.rawData?.clarityRatio || 0
      },
      totalScore
    };

    return {
      section,
      rawData
    };

  } catch (error) {
    // Error handling with minimal section
    const errorSection: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: 'Is your content structured for optimal LLM parsing?',
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore: 0,
      maxScore: SECTION_CONFIG.maxScore,
      status: 'error',
      drawers: []
    };

    return {
      section: errorSection,
      rawData: {
        contentHierarchy: { totalScore: 0, maxScore: 50, cards: [] },
        layoutAndStructuralRoles: {
          totalScore: 0,
          maxScore: 30,
          cards: []
        },
        ctaContextClarity: { totalScore: 0, maxScore: 20, totalLinks: 0, clearLinks: 0, clarityRatio: 0 },
        totalScore: 0,
        error: (error as Error).message
      }
    };
  }
}

// Export all individual analysis functions for external use
export {
  // Content Hierarchy analysis
  analyzeContentHierarchy,
  
  // Layout & Structural Roles analysis
  analyzeLayoutAndStructuralRoles,
  
  // Inline Semantics analysis
  analyzeInlineSemantics
};

// Export types for external use
export type { LLMFormattingAnalysisResult } from './shared/types';


