/**
 * ACCESSIBILITY ANALYZER - PHASE 5B
 * 
 * Performance-focused accessibility analysis for LLMs and AI crawlers
 * Reuses SharedSemanticHTML5Analyzer from Phase 4A to eliminate duplication
 * 
 * Architecture: 3 Drawers (Content Accessibility, Technical Accessibility, Navigational Accessibility)
 * Weight: 15% of total AEO score
 */

import * as cheerio from 'cheerio';
import logger from '@/utils/logger';
import { SharedSemanticHTML5Analyzer } from '../shared/semantic-html5-analyzer';
import { analyzeContentAccessibility } from './content-accessibility-analysis';
import { analyzeTechnicalAccessibility } from './technical-accessibility-performance-analysis';
import { analyzeNavigationalAccessibility } from './navigational-accessibility-analysis';
import { AccessibilityAnalysisResult } from './shared/types';
import { 
  createMainSection, 
  createErrorResult 
} from './shared/utils';
import { DrawerSubSection } from '../../types/analysis-architecture';

// ===== FONCTIONS UTILITAIRES =====

/**
 * Calcule le statut de performance basé sur le score
 */
function getPerformanceStatus(score: number, maxScore: number): 'excellent' | 'good' | 'warning' | 'error' {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

// ===== ANALYSEUR PRINCIPAL D'ACCESSIBILITÉ =====

export class AccessibilityAnalyzer {
  private sharedSemanticAnalyzer: SharedSemanticHTML5Analyzer;

  constructor() {
    this.sharedSemanticAnalyzer = new SharedSemanticHTML5Analyzer();
  }

  /**
   * Méthode d'analyse principale
   */
  async analyze(html: string, url?: string): Promise<AccessibilityAnalysisResult> {
    try {
      const $ = cheerio.load(html);
      
      // Obtient l'analyse sémantique HTML5 partagée
      const semanticHTML5Analysis = this.sharedSemanticAnalyzer.analyze($);
      
      // Analyse Content Accessibility (remplace Critical DOM)
      const contentAccessibilityResult = analyzeContentAccessibility($);
      
      // Analyse Technical Accessibility & Performance
      const technicalAccessibilityResult = await analyzeTechnicalAccessibility(html, url || '');
      
      // Analyse Navigational Accessibility
      const navigationalAccessibilityCard = analyzeNavigationalAccessibility($);
      
      // Crée les drawers
      const contentAccessibilityDrawer: DrawerSubSection = {
        id: 'content-accessibility',
        name: 'Content Accessibility',
        description: 'Analyzes the availability of static text and the accessibility of images for AI comprehension.',
        totalScore: contentAccessibilityResult.totalScore,
        maxScore: contentAccessibilityResult.maxScore,
        status: getPerformanceStatus(contentAccessibilityResult.totalScore, contentAccessibilityResult.maxScore),
        cards: contentAccessibilityResult.cards,
      };
      
      const technicalAccessibilityDrawer: DrawerSubSection = {
        id: 'technical-accessibility-performance',
        name: 'Technical Accessibility & Performance',
        description: 'Analyzes page speed and technical best practices for images.',
        totalScore: technicalAccessibilityResult.totalScore,
        maxScore: technicalAccessibilityResult.maxScore,
        status: getPerformanceStatus(technicalAccessibilityResult.totalScore, technicalAccessibilityResult.maxScore),
        cards: technicalAccessibilityResult.cards,
      };
      
      const navigationalAccessibilityDrawer: DrawerSubSection = {
        id: 'navigational-accessibility',
        name: 'Navigational Accessibility',
        description: 'Analyzes the ability of AI systems to understand and crawl your site\'s navigation structure.',
        totalScore: navigationalAccessibilityCard.score,
        maxScore: navigationalAccessibilityCard.maxScore,
        status: navigationalAccessibilityCard.status,
        cards: [navigationalAccessibilityCard],
      };
      
      // Crée la section principale
      const section = createMainSection([
        contentAccessibilityDrawer,
        technicalAccessibilityDrawer,
        navigationalAccessibilityDrawer
      ]);
      
      // Calcule les données brutes
      const rawData = {
        contentAccessibility: {
          staticContentAvailability: contentAccessibilityResult.cards[0].rawData,
          imageAccessibility: contentAccessibilityResult.cards[1].rawData,
          totalScore: contentAccessibilityResult.totalScore,
          maxScore: contentAccessibilityResult.maxScore
        },
        technicalAccessibility: {
          performanceScore: technicalAccessibilityResult.cards[0]?.rawData?.performanceScore,
          coreWebVitals: technicalAccessibilityResult.cards[0]?.rawData?.coreWebVitals,
          imageOptimization: technicalAccessibilityResult.cards[1]?.rawData
        },
        navigationalAccessibility: {
          navElementsCount: navigationalAccessibilityCard.rawData?.navElementsCount || 0,
          staticLinksInNav: navigationalAccessibilityCard.rawData?.staticLinksInNav || 0,
          breadcrumbsDetected: navigationalAccessibilityCard.rawData?.breadcrumbsDetected || false,
          navWithAriaLabels: navigationalAccessibilityCard.rawData?.navWithAriaLabels || 0
        }
      };
      
      return {
        category: 'accessibility',
        score: section.totalScore,
        maxScore: section.maxScore,
        weightPercentage: 15,
        section,
        sharedMetrics: {
          semanticHTML5Analysis
        },
        rawData
      };
      
    } catch (error) {
      console.error('Error in accessibility analysis:', error);
      return createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// ===== FONCTION AUTONOME =====

/**
 * Fonction d'analyse d'accessibilité autonome pour l'intégration API
 * Suit le même modèle que les autres fonctions d'analyse
 */
export async function analyzeAccessibility(
  html: string,
  url?: string
): Promise<AccessibilityAnalysisResult> {
  const analyzer = new AccessibilityAnalyzer();
  return analyzer.analyze(html, url);
}

// ===== EXPORTS =====

export { 
  TECHNICAL_ACCESSIBILITY_WEIGHTS
} from './technical-accessibility-performance-analysis';

export type { AccessibilityAnalysisResult } from './shared/types';
