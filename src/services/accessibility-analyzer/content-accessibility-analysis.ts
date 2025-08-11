/**
 * CONTENT ACCESSIBILITY ANALYSIS - ACCESSIBILITY ANALYZER
 * 
 * Analyse de l'accessibilité du contenu pour les LLMs
 * Poids total: 40 points (Static Content Availability: 20, Image Accessibility: 20)
 * 
 * Cette analyse répond à la question fondamentale : une IA peut-elle lire et comprendre 
 * le contenu textuel et visuel de base de la page ?
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '../../types/analysis-architecture';

// ===== CONSTANTES ET SEUILS =====

const CONTENT_ACCESSIBILITY_WEIGHTS = {
  STATIC_CONTENT_AVAILABILITY: 20,
  IMAGE_ACCESSIBILITY: 20
} as const;

const STATIC_CONTENT_THRESHOLDS = {
  MIN_WORD_COUNT: 300,
  MIN_TEXT_HTML_RATIO: 15
} as const;

// ===== BASE DE CONNAISSANCES =====

const CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE = {
  // Accessibilité du Texte (Static Content Availability)
  insufficientWordCount: {
    problem: (wordCount: number) => `The page contains very little text (${wordCount} words), which is below the recommended minimum of 300.`,
    solution: "Expand your content to provide at least 300 words of valuable, descriptive text.",
    explanation: "Pages with under 300 words risk being considered 'thin content' by AIs, which may reduce their perceived authority and value.",
    impact: 9
  },
  lowTextHtmlRatio: {
    problem: (ratio: number) => `The text-to-HTML ratio is low at ${ratio.toFixed(1)}%. The target is above 15%.`,
    solution: "Increase the amount of unique, descriptive text, or simplify the HTML structure by removing unnecessary container elements.",
    explanation: "A low ratio can signal that your valuable content is 'drowned out' by code, making it harder for AIs to determine the page's primary substance.",
    impact: 7
  },
  // Accessibilité des Images (Image Accessibility)
  missingAltText: {
    problem: (count: number, percent: number) => `${count} images (${percent.toFixed(1)}%) are missing a descriptive 'alt' attribute.`,
    solution: "Add a descriptive 'alt' attribute to every <img> tag that conveys information.",
    explanation: "The 'alt' text is the primary way for an AI to understand the content of an image. Missing 'alt' tags create significant gaps in the AI's comprehension of your page.",
    impact: 10
  }
} as const;

// ===== FONCTIONS UTILITAIRES =====

/**
 * Calcule le nombre de mots dans le texte
 */
function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calcule le ratio texte/HTML
 */
function calculateTextHtmlRatio(textLength: number, htmlLength: number): number {
  return htmlLength > 0 ? (textLength / htmlLength) * 100 : 0;
}

/**
 * Calcule le statut de performance basé sur le score
 */
function calculateStatus(score: number, maxScore: number): 'excellent' | 'good' | 'warning' | 'error' {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

// ===== ANALYSEURS PRINCIPAUX =====

/**
 * Analyse la disponibilité du contenu statique (20 points)
 * Vérifie le volume de texte et le ratio texte/HTML
 */
export function analyzeStaticContentAvailability($: cheerio.CheerioAPI): MetricCard {
  try {
    // Extraction du contenu textuel
    const bodyText = $('body').text().trim();
    const wordCount = calculateWordCount(bodyText);
    
    // Calcul du ratio texte/HTML
    const htmlLength = $.html().length;
    const textLength = bodyText.length;
    const textHtmlRatio = calculateTextHtmlRatio(textLength, htmlLength);
    
    // Calcul du score (10 points pour chaque check)
    let score = 0;
    const recommendations: Recommendation[] = [];
    
    // Check 1: Volume de texte (10 points)
    if (wordCount >= STATIC_CONTENT_THRESHOLDS.MIN_WORD_COUNT) {
      score += 10;
    } else {
      recommendations.push({
        problem: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.insufficientWordCount.problem(wordCount),
        solution: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.insufficientWordCount.solution,
        explanation: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.insufficientWordCount.explanation,
        impact: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.insufficientWordCount.impact
      });
    }
    
    // Check 2: Ratio texte/HTML (10 points)
    if (textHtmlRatio >= STATIC_CONTENT_THRESHOLDS.MIN_TEXT_HTML_RATIO) {
      score += 10;
    } else {
      recommendations.push({
        problem: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.lowTextHtmlRatio.problem(textHtmlRatio),
        solution: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.lowTextHtmlRatio.solution,
        explanation: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.lowTextHtmlRatio.explanation,
        impact: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.lowTextHtmlRatio.impact
      });
    }
    
    return {
      id: 'static-content-availability',
      name: 'Static Content Availability',
      score,
      maxScore: CONTENT_ACCESSIBILITY_WEIGHTS.STATIC_CONTENT_AVAILABILITY,
      status: calculateStatus(score, CONTENT_ACCESSIBILITY_WEIGHTS.STATIC_CONTENT_AVAILABILITY),
      explanation: "Ensures that AIs can access substantial text content directly from the HTML, without requiring JavaScript execution. This is fundamental for content discovery and analysis.",
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      successMessage: "Excellent! Your page provides substantial text content that AIs can easily access and analyze.",
      rawData: {
        wordCount,
        textLength,
        htmlLength,
        textHtmlRatio,
        minWordCountRequired: STATIC_CONTENT_THRESHOLDS.MIN_WORD_COUNT,
        minRatioRequired: STATIC_CONTENT_THRESHOLDS.MIN_TEXT_HTML_RATIO
      }
    };
    
  } catch (error) {
    return {
      id: 'static-content-availability',
      name: 'Static Content Availability',
      score: 0,
      maxScore: CONTENT_ACCESSIBILITY_WEIGHTS.STATIC_CONTENT_AVAILABILITY,
      status: 'error',
      explanation: "Ensures that AIs can access substantial text content directly from the HTML, without requiring JavaScript execution. This is fundamental for content discovery and analysis.",
      recommendations: [{
        problem: "Failed to analyze static content availability due to a technical error.",
        solution: "Please try again or contact support if the issue persists.",
        impact: 5
      }],
      successMessage: "Excellent! Your page provides substantial text content that AIs can easily access and analyze."
    };
  }
}

/**
 * Analyse l'accessibilité des images (20 points)
 * Vérifie la couverture des attributs alt
 */
export function analyzeImageAccessibility($: cheerio.CheerioAPI): MetricCard {
  try {
    // Comptage des images
    const allImages = $('img');
    const totalImages = allImages.length;
    
    // Comptage des images avec alt text
    const imagesWithAlt = allImages.filter((_, element) => {
      const alt = $(element).attr('alt');
      return Boolean(alt && alt.trim().length > 0);
    }).length;
    
    // Calcul du pourcentage de couverture
    const altCoveragePercent = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;
    
    // Score proportionnel à la couverture (20 points max)
    const score = Math.round((altCoveragePercent / 100) * CONTENT_ACCESSIBILITY_WEIGHTS.IMAGE_ACCESSIBILITY);
    
    const recommendations: Recommendation[] = [];
    
    // Génération de recommandation si couverture < 100%
    if (altCoveragePercent < 100) {
      const missingCount = totalImages - imagesWithAlt;
      recommendations.push({
        problem: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.missingAltText.problem(missingCount, 100 - altCoveragePercent),
        solution: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.missingAltText.solution,
        explanation: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.missingAltText.explanation,
        impact: CONTENT_ACCESSIBILITY_KNOWLEDGE_BASE.missingAltText.impact
      });
    }
    
    return {
      id: 'image-accessibility',
      name: 'Image Accessibility',
      score,
      maxScore: CONTENT_ACCESSIBILITY_WEIGHTS.IMAGE_ACCESSIBILITY,
      status: calculateStatus(score, CONTENT_ACCESSIBILITY_WEIGHTS.IMAGE_ACCESSIBILITY),
      explanation: "Ensures that all images have descriptive 'alt' text, allowing AIs to understand visual content. This is critical since AIs cannot 'see' images and rely entirely on text descriptions.",
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      successMessage: "Perfect! All images have descriptive 'alt' text, making your visual content fully accessible to AIs.",
      rawData: {
        totalImages,
        imagesWithAlt,
        imagesWithoutAlt: totalImages - imagesWithAlt,
        altCoveragePercent,
        coverageRatio: altCoveragePercent / 100
      }
    };
    
  } catch (error) {
    return {
      id: 'image-accessibility',
      name: 'Image Accessibility',
      score: 0,
      maxScore: CONTENT_ACCESSIBILITY_WEIGHTS.IMAGE_ACCESSIBILITY,
      status: 'error',
      explanation: "Ensures that all images have descriptive 'alt' text, allowing AIs to understand visual content. This is critical since AIs cannot 'see' images and rely entirely on text descriptions.",
      recommendations: [{
        problem: "Failed to analyze image accessibility due to a technical error.",
        solution: "Please try again or contact support if the issue persists.",
        impact: 5
      }],
      successMessage: "Perfect! All images have descriptive 'alt' text, making your visual content fully accessible to AIs."
    };
  }
}

// ===== FONCTION ORCHESTRATEUR PRINCIPALE =====

/**
 * Fonction principale d'analyse de l'accessibilité du contenu
 * Orchestre les deux analyses et retourne le résultat combiné
 */
export function analyzeContentAccessibility($: cheerio.CheerioAPI): { 
  cards: MetricCard[], 
  totalScore: number, 
  maxScore: number 
} {
  // Exécution des analyses
  const staticContentCard = analyzeStaticContentAvailability($);
  const imageAccessibilityCard = analyzeImageAccessibility($);
  
  // Calcul du score total
  const totalScore = staticContentCard.score + imageAccessibilityCard.score;
  const maxScore = CONTENT_ACCESSIBILITY_WEIGHTS.STATIC_CONTENT_AVAILABILITY + 
                   CONTENT_ACCESSIBILITY_WEIGHTS.IMAGE_ACCESSIBILITY;
  
  return {
    cards: [staticContentCard, imageAccessibilityCard],
    totalScore,
    maxScore
  };
}

// ===== EXPORTS =====

export { CONTENT_ACCESSIBILITY_WEIGHTS };
