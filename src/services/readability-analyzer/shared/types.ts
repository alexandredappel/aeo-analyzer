/**
 * READABILITY ANALYZER - SHARED TYPES
 * 
 * Common types and interfaces for readability analysis modules
 */

import { MetricCard, DrawerSubSection, MainSection, PerformanceStatus } from '@/types/analysis-architecture';

// ===== MAIN RESULT INTERFACE =====

export interface ReadabilityAnalysisResult {
  category: 'readability';
  score: number;
  maxScore: number;
  weightPercentage: 15;
  
  section: MainSection;
  
  rawData: {
    textComplexity: {
      fleschScore: number;
      fleschLevel: string;
      totalWords: number;
      totalSentences: number;
    };
    contentOrganization: {
      paragraphStructure: {
        totalParagraphs: number;
        averageWordsPerParagraph: number;
        wellStructuredRatio: number;
      };
      contentDensity: {
        textToHTMLRatio: number;
        readableText: number;
        totalMarkup: number;
      };
    };
    linguisticPrecision: {
      averageSentenceLength: number;
      vocabularyDiversity: number;
      uniqueWords: number;
      totalWords: number;
    };
  };
}

// ===== TEXT CLARITY TYPES =====

export interface TextClarityAnalysisResult {
  totalScore: number;
  maxScore: number;
  cards: MetricCard[];
  rawData: {
    fleschScore: number;
    fleschLevel: string;
    avgSentenceLength: number;
    avgSyllablesPerWord: number;
    totalWords: number;
    totalSentences: number;
  };
}

// ===== CONTENT ORGANIZATION TYPES =====

export interface ContentOrganizationAnalysisResult {
  totalScore: number;
  maxScore: number;
  cards: MetricCard[];
  rawData: {
    paragraphStructure: {
      totalParagraphs: number;
      wellStructuredCount: number;
      wellStructuredRatio: number;
      averageWordsPerParagraph: number;
    };
    contentDensity: {
      textToHTMLRatio: number;
      readableText: number;
      totalMarkup: number;
    };
  };
}

// ===== LINGUISTIC PRECISION TYPES =====

export interface LinguisticPrecisionAnalysisResult {
  totalScore: number;
  maxScore: number;
  cards: MetricCard[];
  rawData: {
    averageLength: number;
    vocabularyDiversity: number;
    uniqueWords: number;
    totalWords: number;
    totalSentences: number;
  };
}

// ===== UTILITY TYPES =====

export interface TextExtractionResult {
  words: string[];
  sentences: string[];
  syllables: number;
}

export interface FleschAnalysisData {
  score: number;
  level: string;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
}

export interface ParagraphAnalysisData {
  totalParagraphs: number;
  wellStructuredCount: number;
  wellStructuredRatio: number;
  averageWordsPerParagraph: number;
}

export interface ContentDensityData {
  textToHTMLRatio: number;
  readableText: number;
  totalMarkup: number;
} 