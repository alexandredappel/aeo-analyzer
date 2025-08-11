/**
 * READABILITY ANALYZER - SHARED CONSTANTS
 * 
 * Constants, weights, and thresholds for readability analysis
 */

// ===== SECTION CONFIGURATION =====

export const SECTION_CONFIG = {
  id: 'readability',
  name: 'Readability',
  emoji: '📖',
  description: 'Is your content readable and well-structured for AI comprehension?',
  weightPercentage: 15,
  maxScore: 100
} as const;

// ===== WEIGHT DISTRIBUTIONS =====

export const TEXT_CLARITY_WEIGHTS = {
  FLESCH_SCORE: 25,
  PASSIVE_VOICE: 20
} as const;

export const CONTENT_ORGANIZATION_WEIGHTS = {
  PARAGRAPH_STRUCTURE: 25,
  CONTENT_DENSITY: 15
} as const;

export const LINGUISTIC_PRECISION_WEIGHTS = {
  SENTENCE_LENGTH_VARIANCE: 15
} as const;

// ===== FLESCH READING EASE LEVELS =====

export const FLESCH_LEVELS = {
  90: 'Very Easy',
  80: 'Easy', 
  70: 'Fairly Easy',
  60: 'Standard',
  50: 'Fairly Difficult',
  30: 'Difficult',
  0: 'Very Difficult'
} as const;

// ===== PERFORMANCE THRESHOLDS =====

export const PERFORMANCE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  warning: 50
} as const;

// ===== OPTIMAL RANGES =====

export const OPTIMAL_RANGES = {
  FLESCH_SCORE: {
    optimal: { min: 60, max: 80 },
    good: { min: 50, max: 90 },
    fair: { min: 40, max: 95 }
  },
  PARAGRAPH_LENGTH: {
    optimal: { min: 50, max: 150 },
    good: { min: 30, max: 200 }
  },
  SENTENCE_LENGTH: {
    optimal: { min: 15, max: 25 },
    good: { min: 12, max: 30 },
    fair: { min: 8, max: 35 }
  },
  VOCABULARY_DIVERSITY: {
    excellent: 0.6,
    good: 0.5,
    moderate: 0.4,
    limited: 0.3
  },
  CONTENT_DENSITY: {
    high: 0.3,
    good: 0.2,
    fair: 0.15,
    low: 0.1
  }
} as const;

// ===== SCORING CONFIGURATIONS =====

export const SCORING_CONFIG = {
  FLESCH_SCORE: {
    optimal: 40,    // 60-80 range
    good: 35,       // 50-90 range
    fair: 25,       // 40-95 range
    poor: 15,       // 30+ range
    veryPoor: 5     // <30 range
  },
  PARAGRAPH_STRUCTURE: {
    excellent: 20,  // 80%+ well-structured
    good: 16,       // 60-79% well-structured
    fair: 12,       // 40-59% well-structured
    poor: 8,        // 20-39% well-structured
    veryPoor: 4     // <20% well-structured
  },
  CONTENT_DENSITY: {
    high: 15,       // 30%+ ratio
    good: 12,       // 20-29% ratio
    fair: 9,        // 15-19% ratio
    low: 6,         // 10-14% ratio
    veryLow: 3      // <10% ratio
  },
  SENTENCE_LENGTH: {
    optimal: 15,    // 15-25 words
    good: 12,       // 12-30 words
    fair: 9,        // 8-35 words
    poor: 6,        // 5+ words
    veryPoor: 3     // <5 words
  },
  VOCABULARY_DIVERSITY: {
    excellent: 10,  // 60%+ diversity
    good: 8,        // 50-59% diversity
    moderate: 6,    // 40-49% diversity
    limited: 4,     // 30-39% diversity
    poor: 2         // <30% diversity
  }
} as const; 