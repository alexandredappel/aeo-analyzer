/**
 * READABILITY ANALYZER - SHARED UTILITIES
 * 
 * Common utility functions for readability analysis modules
 */

import * as cheerio from 'cheerio';
import { PerformanceStatus } from '@/types/analysis-architecture';
import { PERFORMANCE_THRESHOLDS, FLESCH_LEVELS } from './constants';
import { TextExtractionResult, FleschAnalysisData } from './types';

// ===== TEXT EXTRACTION UTILITIES =====

/**
 * Extracts clean text content from HTML
 */
export function extractTextContent($: cheerio.CheerioAPI): string {
  // Remove script and style elements
  $('script, style, noscript').remove();
  
  // Extract text from main content areas
  const mainContent = $('main, article, .content, #content, .post, #post').first();
  if (mainContent.length > 0) {
    return mainContent.text().trim();
  }
  
  // Fallback to body text
  return $('body').text().trim();
}

/**
 * Extracts words from text content
 */
export function extractWords(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Extracts sentences from text content
 */
export function extractSentences(text: string): string[] {
  return text.split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
}

/**
 * Comprehensive text extraction with all metrics
 */
export function extractTextMetrics(text: string): TextExtractionResult {
  const words = extractWords(text);
  const sentences = extractSentences(text);
  const syllables = countSyllables(words);
  
  return {
    words,
    sentences,
    syllables
  };
}

// ===== SYLLABLE COUNTING =====

/**
 * Counts total syllables in an array of words
 */
export function countSyllables(words: string[]): number {
  return words.reduce((total, word) => {
    return total + syllablesInWord(word);
  }, 0);
}

/**
 * Counts syllables in a single word
 */
export function syllablesInWord(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let syllables = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < cleanWord.length; i++) {
    const isVowel = vowels.includes(cleanWord[i]);
    if (isVowel && !previousWasVowel) {
      syllables++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (cleanWord.endsWith('e')) {
    syllables--;
  }
  
  return Math.max(1, syllables);
}

// ===== FLESCH SCORE CALCULATION =====

/**
 * Calculates Flesch Reading Ease score and related metrics
 */
export function calculateFleschScore(words: string[], sentences: string[]): FleschAnalysisData {
  if (words.length === 0 || sentences.length === 0) {
    return {
      score: 0,
      level: 'Unknown',
      avgSentenceLength: 0,
      avgSyllablesPerWord: 0
    };
  }
  
  const syllables = countSyllables(words);
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Calculate Flesch Reading Ease score
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const normalizedScore = Math.max(0, Math.min(100, fleschScore));
  
  // Get readability level
  const fleschLevel = getFleschLevel(normalizedScore);
  
  return {
    score: normalizedScore,
    level: fleschLevel,
    avgSentenceLength,
    avgSyllablesPerWord
  };
}

/**
 * Gets Flesch readability level from score
 */
export function getFleschLevel(score: number): string {
  for (const [threshold, level] of Object.entries(FLESCH_LEVELS)) {
    if (score >= parseInt(threshold)) {
      return level;
    }
  }
  return 'Very Difficult';
}

// ===== PERFORMANCE CALCULATION =====

/**
 * Calculates performance status based on score percentage
 */
export function calculateStatus(score: number, maxScore: number): PerformanceStatus {
  if (maxScore === 0) return 'error';
  
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
  if (percentage >= PERFORMANCE_THRESHOLDS.good) return 'good';
  if (percentage >= PERFORMANCE_THRESHOLDS.warning) return 'warning';
  return 'error';
}

// ===== ERROR HANDLING =====

/**
 * Creates a standardized error card
 */
export function createErrorCard(
  id: string, 
  name: string, 
  maxScore: number, 
  errorMessage: string
): any {
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

// ===== SCORING UTILITIES =====

/**
 * Calculates Flesch score based on optimal ranges
 */
export function calculateFleschScorePoints(score: number): number {
  if (score >= 60 && score <= 80) return 40;      // Optimal for LLMs
  if (score >= 50 && score <= 90) return 35;      // Good
  if (score >= 40 && score <= 95) return 25;      // Fair
  if (score >= 30) return 15;                     // Poor
  return 5;                                       // Very poor
}

/**
 * Calculates paragraph structure score
 */
export function calculateParagraphStructureScore(wellStructuredRatio: number): number {
  if (wellStructuredRatio >= 0.8) return 20;      // 80%+ well-structured
  if (wellStructuredRatio >= 0.6) return 16;      // 60-79% well-structured
  if (wellStructuredRatio >= 0.4) return 12;      // 40-59% well-structured
  if (wellStructuredRatio >= 0.2) return 8;       // 20-39% well-structured
  return 4;                                       // <20% well-structured
}

/**
 * Calculates content density score
 */
export function calculateContentDensityScore(textToHTMLRatio: number): number {
  if (textToHTMLRatio >= 0.3) return 15;          // High density (30%+)
  if (textToHTMLRatio >= 0.2) return 12;          // Good density (20-29%)
  if (textToHTMLRatio >= 0.15) return 9;          // Fair density (15-19%)
  if (textToHTMLRatio >= 0.1) return 6;           // Low density (10-14%)
  return 3;                                       // Very low density (<10%)
}

/**
 * Calculates sentence length score
 */
export function calculateSentenceLengthScore(averageLength: number): number {
  if (averageLength >= 15 && averageLength <= 25) return 15;      // Optimal range
  if (averageLength >= 12 && averageLength <= 30) return 12;      // Good range
  if (averageLength >= 8 && averageLength <= 35) return 9;        // Fair range
  if (averageLength >= 5) return 6;                               // Poor range
  return 3;                                                       // Very poor
}

/**
 * Calculates vocabulary diversity score
 */
export function calculateVocabularyDiversityScore(vocabularyDiversity: number): number {
  if (vocabularyDiversity >= 0.6) return 10;      // Very diverse (60%+)
  if (vocabularyDiversity >= 0.5) return 8;       // Diverse (50-59%)
  if (vocabularyDiversity >= 0.4) return 6;       // Moderate (40-49%)
  if (vocabularyDiversity >= 0.3) return 4;       // Limited (30-39%)
  return 2;                                       // Poor diversity (<30%)
} 