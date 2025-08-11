/**
 * SENTENCE STRUCTURE ANALYSIS - READABILITY ANALYZER MODULE
 * 
 * Analyzes sentence structure with one key metric:
 * 1. Sentence Length Variance (15 pts) - Natural rhythm and parseable statements
 * 
 * Weight: 15 points (15% of total readability score)
 * 
 * Architecture: Single metric card using the new Recommendation structure
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

const SENTENCE_STRUCTURE_KB = {
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
  }
} as const;

/**
 * Analyzes sentence structure focusing on length variance
 */
export function analyzeLinguisticPrecision(text: string, $: cheerio.CheerioAPI): LinguisticPrecisionAnalysisResult {
  try {
    // Extract text metrics
    const { words, sentences } = extractTextMetrics(text);
    
    if (words.length === 0 || sentences.length === 0) {
      const errorCard = createErrorCard(
        'sentence-structure', 
        'Sentence Structure', 
        15,
        'Insufficient text for sentence structure analysis'
      );
      
      return {
        totalScore: 0,
        maxScore: 15,
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
    
    // Calculate total score (now only sentence variance)
    const totalScore = sentenceVarianceCard.score;
    const maxScore = 15;
    
    return {
      totalScore,
      maxScore,
      cards: [sentenceVarianceCard],
      rawData: {
        averageLength: sentenceVarianceCard.rawData?.averageLength || 0,
        vocabularyDiversity: 0, // Not used in new structure
        uniqueWords: 0, // Not used in new structure
        totalWords: words.length,
        totalSentences: sentences.length
      }
    };
    
  } catch (error) {
    console.error('Error in sentence structure analysis:', error);
    
    const errorCard = createErrorCard(
      'sentence-structure', 
      'Sentence Structure', 
      15,
      'Error analyzing sentence structure'
    );
    
    return {
      totalScore: 0,
      maxScore: 15,
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
        problem: replacePlaceholders(SENTENCE_STRUCTURE_KB.sentenceTooLong.problem, {
          avgLength: Math.round(averageLength * 10) / 10
        }),
        solution: SENTENCE_STRUCTURE_KB.sentenceTooLong.solution,
        impact: SENTENCE_STRUCTURE_KB.sentenceTooLong.impact
      });
      score -= 5; // Penalty for long sentences
    }
    
    // Check for too short sentences
    if (averageLength < 15) {
      recommendations.push({
        problem: replacePlaceholders(SENTENCE_STRUCTURE_KB.sentenceTooShort.problem, {
          avgLength: Math.round(averageLength * 10) / 10
        }),
        solution: SENTENCE_STRUCTURE_KB.sentenceTooShort.solution,
        impact: SENTENCE_STRUCTURE_KB.sentenceTooShort.impact
      });
      score -= 3; // Penalty for short sentences
    }
    
    // Check for monotonous sentence length (low variance)
    if (standardDeviation < 3) {
      recommendations.push({
        problem: replacePlaceholders(SENTENCE_STRUCTURE_KB.sentenceMonotonous.problem, {
          stdDev: Math.round(standardDeviation * 10) / 10
        }),
        solution: SENTENCE_STRUCTURE_KB.sentenceMonotonous.solution,
        impact: SENTENCE_STRUCTURE_KB.sentenceMonotonous.impact
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