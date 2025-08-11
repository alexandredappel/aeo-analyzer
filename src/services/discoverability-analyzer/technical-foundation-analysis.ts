/**
 * TECHNICAL FOUNDATION ANALYSIS - DISCOVERABILITY ANALYZER
 * 
 * Analyse les prérequis techniques fondamentaux pour la découvrabilité par les LLMs
 * Architecture: 🔒 Technical Foundation (50 pts) → HTTPS Protocol (25 pts) + HTTP Status (25 pts)
 * 
 * Cette analyse vérifie les conditions de base pour qu'un site soit considéré comme
 * fiable et accessible par une IA : protocole sécurisé et page accessible.
 */

import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';

/**
 * Knowledge Base pour l'analyse Technical Foundation
 * Contient tous les problèmes, solutions, explications et impacts possibles
 */
const TECHNICAL_FOUNDATION_KB = {
  insecureProtocol: {
    problem: "Your site uses the insecure HTTP protocol instead of HTTPS.",
    solution: "Install a valid SSL/TLS certificate and configure a permanent redirection from HTTP to HTTPS.",
    explanation: "HTTPS is a fundamental trust signal. AIs and search engines heavily prioritize secure sites to ensure data integrity and user safety.",
    impact: 10
  },
  httpError: {
    problem: (statusCode: number) => `The page is not accessible and returns an HTTP error code: ${statusCode}.`,
    solution: "Investigate your server or page configuration to ensure it returns a 200 OK status.",
    explanation: "An error code is a dead end for an AI crawler. It completely prevents access to your content, making analysis impossible.",
    impact: 10
  },
  httpRedirect: {
    problem: (statusCode: number) => `The page is redirecting (HTTP status ${statusCode}), which can slow down crawlers.`,
    solution: "Ensure this redirection is intended and use a permanent (301) redirect for moved content.",
    explanation: "While crawlers can follow redirects, they consume crawl budget and can signal an outdated site structure if used excessively.",
    impact: 4
  }
};

/**
 * Analyse le protocole HTTPS de l'URL
 * 
 * @param url - URL à analyser
 * @returns MetricCard avec score binaire (25 pts pour HTTPS, 0 pour HTTP)
 */
function analyzeHttpsProtocol(url: string): MetricCard {
  const isSecure = url.startsWith('https://');
  const score = isSecure ? 25 : 0;
  const recommendations: Recommendation[] = [];

  if (!isSecure) {
    recommendations.push({
      problem: TECHNICAL_FOUNDATION_KB.insecureProtocol.problem,
      solution: TECHNICAL_FOUNDATION_KB.insecureProtocol.solution,
      explanation: TECHNICAL_FOUNDATION_KB.insecureProtocol.explanation,
      impact: TECHNICAL_FOUNDATION_KB.insecureProtocol.impact
    });
  }

  return {
    id: 'https-protocol',
    name: 'HTTPS Protocol',
    score,
    maxScore: 25,
    status: getPerformanceStatus(score, 25),
    explanation: 'HTTPS ensures secure, encrypted communication between users and your site. This is a fundamental trust signal that AIs and search engines require.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: 'Excellent! Your site uses HTTPS, providing a secure and trusted connection for users and AI crawlers.',
    rawData: {
      protocol: url.startsWith('https://') ? 'https' : 'http',
      isSecure
    }
  };
}

/**
 * Analyse le statut HTTP de la page
 * 
 * @param htmlData - Données HTML contenant le statut HTTP
 * @returns MetricCard avec score basé sur le code de statut
 */
function analyzeHttpStatus(htmlData: any): MetricCard {
  const statusCode = htmlData?.metadata?.statusCode || 0;
  let score = 0;
  const recommendations: Recommendation[] = [];

  // Analyse du code de statut
  if (statusCode >= 200 && statusCode < 300) {
    // Succès (2xx) - Score complet
    score = 25;
  } else if (statusCode >= 300 && statusCode < 400) {
    // Redirection (3xx) - Score partiel
    score = 15;
    recommendations.push({
      problem: TECHNICAL_FOUNDATION_KB.httpRedirect.problem(statusCode),
      solution: TECHNICAL_FOUNDATION_KB.httpRedirect.solution,
      explanation: TECHNICAL_FOUNDATION_KB.httpRedirect.explanation,
      impact: TECHNICAL_FOUNDATION_KB.httpRedirect.impact
    });
  } else if (statusCode >= 400) {
    // Erreur (4xx/5xx) - Pas de score
    score = 0;
    recommendations.push({
      problem: TECHNICAL_FOUNDATION_KB.httpError.problem(statusCode),
      solution: TECHNICAL_FOUNDATION_KB.httpError.solution,
      explanation: TECHNICAL_FOUNDATION_KB.httpError.explanation,
      impact: TECHNICAL_FOUNDATION_KB.httpError.impact
    });
  } else {
    // Statut inconnu ou invalide
    score = 0;
    recommendations.push({
      problem: `Unable to determine HTTP status code (received: ${statusCode}).`,
      solution: "Ensure your server is properly configured and responding with valid HTTP status codes.",
      explanation: "A valid HTTP status code is essential for AI crawlers to understand if your page is accessible.",
      impact: 8
    });
  }

  return {
    id: 'http-status',
    name: 'HTTP Status',
    score,
    maxScore: 25,
    status: getPerformanceStatus(score, 25),
    explanation: 'The HTTP status code indicates whether your page is accessible. A 200 OK status confirms the page is fully available to AI crawlers.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: 'Perfect! Your page returns a 200 OK status, confirming it\'s fully accessible to AI crawlers.',
    rawData: {
      statusCode,
      isAccessible: statusCode >= 200 && statusCode < 300,
      isRedirect: statusCode >= 300 && statusCode < 400,
      isError: statusCode >= 400
    }
  };
}

/**
 * Fonction orchestratrice principale pour l'analyse Technical Foundation
 * 
 * @param collectedData - Données collectées par le crawler
 * @returns Résultat combiné avec cartes métriques et scores totaux
 */
export function analyzeTechnicalFoundation(collectedData: any): { 
  cards: MetricCard[], 
  totalScore: number, 
  maxScore: number 
} {
  try {
    // Validation des données d'entrée
    if (!collectedData?.url) {
      throw new Error('URL required for technical foundation analysis');
    }

    // Analyses individuelles
    const httpsCard = analyzeHttpsProtocol(collectedData.url);
    const httpStatusCard = analyzeHttpStatus(collectedData.html);

    // Calcul du score total
    const totalScore = httpsCard.score + httpStatusCard.score;
    const maxScore = 50; // 25 + 25

    return {
      cards: [httpsCard, httpStatusCard],
      totalScore,
      maxScore
    };

  } catch (error) {
    console.error('Technical Foundation analysis error:', error);
    
    // Retour d'un résultat d'erreur
    const errorCard: MetricCard = {
      id: 'technical-foundation-error',
      name: 'Technical Foundation',
      score: 0,
      maxScore: 50,
      status: 'error',
      explanation: 'Unable to analyze technical foundation due to an error.',
      recommendations: [{
        problem: 'Technical foundation analysis failed.',
        solution: 'Please check your URL and try again.',
        explanation: 'The analysis encountered an error while processing your site\'s technical foundation.',
        impact: 10
      }],
      successMessage: 'Analysis completed successfully.',
      rawData: { error: error instanceof Error ? error.message : 'Unknown error' }
    };

    return {
      cards: [errorCard],
      totalScore: 0,
      maxScore: 50
    };
  }
}

// Export des fonctions individuelles pour les tests
export { analyzeHttpsProtocol, analyzeHttpStatus };
