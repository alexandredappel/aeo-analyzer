/**
 * ACCESSIBILITY ANALYZER - SHARED UTILS
 * 
 * Utilitaires partagés pour toutes les analyses d'accessibilité
 */

import { PerformanceStatus } from '../../../types/analysis-architecture';
import { PERFORMANCE_THRESHOLDS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

// ===== UTILITAIRES DE CALCUL =====

/**
 * Calcule le statut de performance basé sur le score
 */
export function calculateStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
  if (percentage >= PERFORMANCE_THRESHOLDS.good) return 'good';
  if (percentage >= PERFORMANCE_THRESHOLDS.warning) return 'warning';
  return 'error';
}

/**
 * Calcule le ratio de contenu statique
 */
export function calculateContentRatio(textLength: number, jsElements: number, totalElements: number): number {
  const jsRatio = jsElements / Math.max(totalElements, 1);
  return Math.max(0, 1 - jsRatio);
}



// ===== UTILITAIRES DE CRÉATION DE CARTES =====

/**
 * Crée une carte d'erreur standardisée
 */
export function createErrorCard(
  id: string, 
  name: string, 
  maxScore: number, 
  errorMessage: string
): import('../../../types/analysis-architecture').MetricCard {
  return {
    id,
    name,
    score: 0,
    maxScore,
    status: 'error' as PerformanceStatus,
    explanation: 'An error occurred during analysis.',
    problems: [errorMessage],
    solutions: ['Please try again or check your content'],
    successMessage: 'Analysis completed successfully.',
    rawData: { error: errorMessage }
  };
}

/**
 * Crée un résultat d'erreur pour l'analyse complète
 */
export function createErrorResult(errorMessage: string): import('./types').AccessibilityAnalysisResult {
  const errorCard = createErrorCard('error', 'Analysis Error', 100, errorMessage);
  const errorDrawer: import('../../../types/analysis-architecture').DrawerSubSection = {
    id: 'error',
    name: 'Error',
    description: 'Analysis could not be completed',
    totalScore: 0,
    maxScore: 100,
    status: 'error',
    cards: [errorCard],
    isExpanded: false
  };
  
  const errorSection: import('../../../types/analysis-architecture').MainSection = {
    id: 'accessibility',
    name: 'Accessibility',
    emoji: '♿',
    description: 'Can AI bots easily access and crawl your content?',
    weightPercentage: 15,
    totalScore: 0,
    maxScore: 100,
    status: 'error',
    drawers: [errorDrawer]
  };
  
  return {
    category: 'accessibility',
    score: 0,
    maxScore: 100,
    weightPercentage: 15,
    section: errorSection,
    sharedMetrics: {
      semanticHTML5Analysis: {
        structuralScore: 0,
        accessibilityScore: 0,
        contentFlowScore: 0,
        semanticRatio: 0,
        elements: {
          structural: [],
          content: [],
          accessibility: 0,
          totalElements: 0,
          semanticElements: 0
        },
        details: {
          structuralAnalysis: {
            main: { count: 0, present: false },
            header: { count: 0, present: false },
            nav: { count: 0, present: false },
            footer: { count: 0, present: false },
            score: 0,
            issues: [errorMessage]
          },
          accessibilityAnalysis: {
            ariaLabels: 0,
            ariaDescribedBy: 0,
            ariaLabelledBy: 0,
            landmarks: 0,
            roles: 0,
            altTexts: 0,
            score: 0,
            issues: [errorMessage]
          },
          contentFlowAnalysis: {
            article: { count: 0, nested: false },
            section: { count: 0, nested: false },
            aside: { count: 0, present: false },
            score: 0,
            issues: [errorMessage]
          }
        }
      }
    },
    rawData: {
      contentAccessibility: {
        staticContentAvailability: {},
        imageAccessibility: {},
        totalScore: 0,
        maxScore: 40
      },
      technicalAccessibility: {},
      navigationalAccessibility: {
        navElementsCount: 0,
        staticLinksInNav: 0,
        breadcrumbsDetected: false,
        navWithAriaLabels: 0
      }
    }
  };
}

// ===== UTILITAIRES DE CRÉATION DE DRAWERS =====

/**
 * Crée un drawer Content Accessibility
 */
export function createCriticalDOMDrawer(cards: import('../../../types/analysis-architecture').MetricCard[]): import('../../../types/analysis-architecture').DrawerSubSection {
  const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
  const maxScore = 40; // Static Content Availability (20) + Image Accessibility (20)
  
  return {
    id: 'content-accessibility',
    name: 'Content Accessibility',
    description: 'Text content availability and image accessibility for LLMs',
    totalScore,
    maxScore,
    status: calculateStatus(totalScore, maxScore),
    cards,
    isExpanded: false
  };
}

/**
 * Crée un drawer Performance
 */
export function createPerformanceDrawer(cards: import('../../../types/analysis-architecture').MetricCard[]): import('../../../types/analysis-architecture').DrawerSubSection {
  const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
  const maxScore = cards.reduce((sum, card) => sum + card.maxScore, 0);
  
  return {
    id: 'technical-accessibility-performance',
    name: 'Technical Accessibility & Performance',
    description: 'Page speed, Core Web Vitals, and image optimization for optimal user experience and AI accessibility',
    totalScore,
    maxScore,
    status: calculateStatus(totalScore, maxScore),
    cards,
    isExpanded: false
  };
}



/**
 * Crée la section principale
 */
export function createMainSection(drawers: import('../../../types/analysis-architecture').DrawerSubSection[]): import('../../../types/analysis-architecture').MainSection {
  const totalScore = drawers.reduce((sum, drawer) => sum + drawer.totalScore, 0);
  const maxScore: number = 100; // Total accessibility score
  
  return {
    id: 'accessibility',
    name: 'Accessibility',
    emoji: '♿',
    description: 'Can AI bots easily access and crawl your content?',
    weightPercentage: 15,
    totalScore,
    maxScore,
    status: calculateStatus(totalScore, maxScore),
    drawers
  };
}

// ===== UTILITAIRES DE VALIDATION =====

/**
 * Valide qu'une URL est valide
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valide que le HTML n'est pas vide
 */
export function isValidHTML(html: string): boolean {
  return Boolean(html && html.trim().length > 0);
}

// ===== UTILITAIRES DE LOGGING =====

/**
 * Log les résultats d'analyse
 */
export function logAnalysisResults(
  analyzerName: string, 
  score: number, 
  maxScore: number, 
  duration: number
): void {
  const percentage = Math.round((score / maxScore) * 100);
  console.log(`📊 ${analyzerName}: ${score}/${maxScore} (${percentage}%) - ${duration}ms`);
}

/**
 * Log les erreurs d'analyse
 */
export function logAnalysisError(analyzerName: string, error: Error): void {
  console.error(`❌ ${analyzerName} error:`, error.message);
}
