/**
 * LINGUISTIC PRECISION ANALYSIS - READABILITY ANALYZER MODULE
 * 
 * Analyzes linguistic precision with two key metrics:
 * 1. Sentence Length Variance (15 pts) - Natural rhythm and parseable statements
 * 2. CTA Context Clarity (10 pts) - Descriptive links for AI understanding
 * 
 * Weight: 25 points (25% of total readability score)
 * 
 * Architecture: Two metric cards using the new Recommendation structure
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { LinguisticPrecisionAnalysisResult } from './shared/types';
import { 
  extractTextMetrics,
  calculateStatus,
  createErrorCard 
} from './shared/utils';

// ===== KNOWLEDGE BASE =====

const LINGUISTIC_PRECISION_KB = {
  // Sentence Length Variance Issues
  sentenceTooLong: {
    problem: "Your average sentence length is [avgLength] words, which is above the recommended maximum of 25.",
    solution: "Review sentences that exceed 25 words and split them into shorter, more concise statements.",
    impact: 7
  },
  sentenceTooShort: {
    problem: "Your average sentence length is [avgLength] words, which is below the recommended minimum of 15.",
    solution: "Combine related short sentences to create more fluid and context-rich statements.",
    impact: 4
  },
  sentenceMonotonous: {
    problem: "Your sentence length is monotonous (standard deviation is only [stdDev]).",
    solution: "Vary your sentence structure by mixing shorter, impactful sentences with longer, more descriptive ones.",
    impact: 3
  },
  
  // CTA Context Clarity Issues
  genericLinkText: {
    problem: "[count] links/buttons with generic text like '[text]' were found.",
    solution: "Add a descriptive 'aria-label' attribute to these elements to provide clear context for AIs and assistive tech.",
    impact: 9
  },
  emptyLink: {
    problem: "[count] links/buttons have no text content or descriptive 'aria-label'.",
    solution: "Ensure every '<a>' and '<button>' element has either visible text or a comprehensive 'aria-label'.",
    impact: 10
  }
} as const;

// Generic terms that indicate poor CTA context
const GENERIC_CTA_TERMS = [
  'click here', 'learn more', 'read more', 'get started', 'sign up', 
  'subscribe', 'download', 'buy now', 'shop now', 'view more',
  'continue', 'next', 'previous', 'back', 'forward', 'submit',
  'ok', 'yes', 'no', 'cancel', 'close', 'open', 'menu', 'search'
];

/**
 * Analyzes linguistic precision including sentence variance and CTA clarity
 */
export function analyzeLinguisticPrecision(text: string, $: cheerio.CheerioAPI): LinguisticPrecisionAnalysisResult {
  try {
    // Extract text metrics
    const { words, sentences } = extractTextMetrics(text);
    
    if (words.length === 0 || sentences.length === 0) {
      const errorCard = createErrorCard(
        'linguistic-precision', 
        'Linguistic Precision', 
        25, // 15 + 10
        'Insufficient text for linguistic analysis'
      );
      
      return {
        totalScore: 0,
        maxScore: 25,
        cards: [errorCard],
        rawData: {
          averageLength: 0,
          vocabularyDiversity: 0,
          uniqueWords: 0,
          totalWords: 0,
          totalSentences: 0
        }
      };
    }
    
    // Analyze sentence length variance
    const sentenceVarianceCard = createSentenceVarianceCard(text);
    
    // Analyze CTA context clarity
    const ctaClarityCard = createCtaClarityCard($);
    
    // Calculate total score
    const totalScore = sentenceVarianceCard.score + ctaClarityCard.score;
    const maxScore = 25; // 15 + 10
    
    return {
      totalScore,
      maxScore,
      cards: [sentenceVarianceCard, ctaClarityCard],
      rawData: {
        averageLength: sentenceVarianceCard.rawData?.averageLength || 0,
        vocabularyDiversity: 0, // Not used in new structure
        uniqueWords: 0, // Not used in new structure
        totalWords: words.length,
        totalSentences: sentences.length
      }
    };
    
  } catch (error) {
    console.error('Error in linguistic precision analysis:', error);
    
    const errorCard = createErrorCard(
      'linguistic-precision', 
      'Linguistic Precision', 
      25, // 15 + 10
      'Error analyzing linguistic precision'
    );
    
    return {
      totalScore: 0,
      maxScore: 25,
      cards: [errorCard],
      rawData: {
        averageLength: 0,
        vocabularyDiversity: 0,
        uniqueWords: 0,
        totalWords: 0,
        totalSentences: 0
      }
    };
  }
}

/**
 * Analyzes sentence length variance (15 pts)
 * Evaluates natural rhythm and parseable statements for AI
 */
function createSentenceVarianceCard(text: string): MetricCard {
  try {
    const { words, sentences } = extractTextMetrics(text);
    const averageLength = words.length / sentences.length;
    
    // Calculate standard deviation of sentence lengths
    const sentenceLengths = sentences.map(sentence => 
      sentence.trim().split(/\s+/).filter(word => word.length > 0).length
    );
    const variance = calculateVariance(sentenceLengths);
    const standardDeviation = Math.sqrt(variance);
    
    // Generate recommendations based on knowledge base
    const recommendations: Recommendation[] = [];
    let score = 15; // Start with full score
    
    // Check for too long sentences
    if (averageLength > 25) {
      recommendations.push({
        problem: replacePlaceholders(LINGUISTIC_PRECISION_KB.sentenceTooLong.problem, {
          avgLength: Math.round(averageLength * 10) / 10
        }),
        solution: LINGUISTIC_PRECISION_KB.sentenceTooLong.solution,
        impact: LINGUISTIC_PRECISION_KB.sentenceTooLong.impact
      });
      score -= 5; // Penalty for long sentences
    }
    
    // Check for too short sentences
    if (averageLength < 15) {
      recommendations.push({
        problem: replacePlaceholders(LINGUISTIC_PRECISION_KB.sentenceTooShort.problem, {
          avgLength: Math.round(averageLength * 10) / 10
        }),
        solution: LINGUISTIC_PRECISION_KB.sentenceTooShort.solution,
        impact: LINGUISTIC_PRECISION_KB.sentenceTooShort.impact
      });
      score -= 3; // Penalty for short sentences
    }
    
    // Check for monotonous sentence length (low variance)
    if (standardDeviation < 3) {
      recommendations.push({
        problem: replacePlaceholders(LINGUISTIC_PRECISION_KB.sentenceMonotonous.problem, {
          stdDev: Math.round(standardDeviation * 10) / 10
        }),
        solution: LINGUISTIC_PRECISION_KB.sentenceMonotonous.solution,
        impact: LINGUISTIC_PRECISION_KB.sentenceMonotonous.impact
      });
      score -= 2; // Penalty for monotonous structure
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      id: 'sentence-length-variance',
      name: 'Sentence Length Variance',
      score,
      maxScore: 15,
      status: calculateStatus(score, 15),
      explanation: 'Evaluates the natural rhythm of your sentences. Good variance creates engaging reading flow and provides clear, parseable statements for AI systems.',
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      successMessage: 'Excellent! Your sentence length is well-balanced. This creates a natural rhythm for readers and provides clear, parseable statements for AI systems.',
      rawData: {
        averageLength: Math.round(averageLength * 10) / 10,
        standardDeviation: Math.round(standardDeviation * 10) / 10,
        totalWords: words.length,
        totalSentences: sentences.length
      }
    };
    
  } catch (error) {
    console.error('Error in sentence length variance analysis:', error);
    return createErrorCard(
      'sentence-length-variance', 
      'Sentence Length Variance', 
      15, 
      'Error analyzing sentence length variance'
    );
  }
}

/**
 * Analyzes CTA context clarity (10 pts)
 * Evaluates descriptive links and buttons for AI understanding
 */
function createCtaClarityCard($: cheerio.CheerioAPI): MetricCard {
  try {
    const recommendations: Recommendation[] = [];
    let score = 10; // Start with full score
    
    // Counters for aggregated recommendations
    let genericLinksCount = 0;
    let emptyLinksCount = 0;
    const genericTextExamples: Record<string, number> = {};
    
    // Find all links and buttons
    const links = $('a');
    const buttons = $('button');
    
    // Check links
    links.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim().toLowerCase();
      const ariaLabel = $element.attr('aria-label')?.trim().toLowerCase();
      
      // Check for empty or very short text
      if (!text || text.length < 2) {
        if (!ariaLabel || ariaLabel.length < 10) {
          emptyLinksCount++;
        }
      }
      // Check for generic text without descriptive aria-label
      else if (GENERIC_CTA_TERMS.includes(text) && (!ariaLabel || ariaLabel.length < 15)) {
        genericLinksCount++;
        genericTextExamples[text] = (genericTextExamples[text] || 0) + 1;
      }
    });
    
    // Check buttons
    buttons.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim().toLowerCase();
      const ariaLabel = $element.attr('aria-label')?.trim().toLowerCase();
      
      // Check for empty or very short text
      if (!text || text.length < 2) {
        if (!ariaLabel || ariaLabel.length < 10) {
          emptyLinksCount++;
        }
      }
      // Check for generic text without descriptive aria-label
      else if (GENERIC_CTA_TERMS.includes(text) && (!ariaLabel || ariaLabel.length < 15)) {
        genericLinksCount++;
        genericTextExamples[text] = (genericTextExamples[text] || 0) + 1;
      }
    });
    
    // Generate aggregated recommendations based on counters
    if (genericLinksCount > 0) {
      // Create examples string from the most common generic texts
      const examples = Object.entries(genericTextExamples)
        .sort(([,a], [,b]) => b - a) // Sort by frequency
        .slice(0, 3) // Take top 3
        .map(([text, count]) => `'${text}'${count > 1 ? ` (${count}x)` : ''}`)
        .join(', ');
      
      recommendations.push({
        problem: replacePlaceholders(LINGUISTIC_PRECISION_KB.genericLinkText.problem, {
          count: genericLinksCount,
          text: examples
        }),
        solution: LINGUISTIC_PRECISION_KB.genericLinkText.solution,
        impact: LINGUISTIC_PRECISION_KB.genericLinkText.impact
      });
      score -= Math.min(genericLinksCount, 5); // Cap penalty at 5 points
    }
    
    if (emptyLinksCount > 0) {
      recommendations.push({
        problem: replacePlaceholders(LINGUISTIC_PRECISION_KB.emptyLink.problem, {
          count: emptyLinksCount
        }),
        solution: LINGUISTIC_PRECISION_KB.emptyLink.solution,
        impact: LINGUISTIC_PRECISION_KB.emptyLink.impact
      });
      score -= Math.min(emptyLinksCount * 2, 5); // Cap penalty at 5 points
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      id: 'cta-context-clarity',
      name: 'CTA Context Clarity',
      score,
      maxScore: 10,
      status: calculateStatus(score, 10),
      explanation: 'Evaluates the clarity of your call-to-action elements. Descriptive links and buttons help both users and AI systems understand your site\'s navigational structure.',
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      successMessage: 'Great! Your links and buttons use descriptive text. This is excellent for usability and allows AIs to understand the navigational structure of your site.',
      rawData: {
        totalLinks: links.length,
        totalButtons: buttons.length,
        genericLinksCount,
        emptyLinksCount,
        genericTextExamples,
        issuesFound: recommendations.length
      }
    };
    
  } catch (error) {
    console.error('Error in CTA context clarity analysis:', error);
    return createErrorCard(
      'cta-context-clarity', 
      'CTA Context Clarity', 
      10, 
      'Error analyzing CTA context clarity'
    );
  }
}

/**
 * Calculates variance of an array of numbers
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  
  return variance;
}

/**
 * Replaces placeholders in a string with actual values
 */
function replacePlaceholders(text: string, replacements: Record<string, string | number>): string {
  let result = text;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(`[${placeholder}]`, String(value));
  }
  return result;
} 