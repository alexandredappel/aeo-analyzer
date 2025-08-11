/**
 * DISCOVERABILITY ANALYZER - SHARED CONSTANTS
 * 
 * Constants used across all discoverability analysis modules
 */

export const AI_BOTS: string[] = [
  'GPTBot',
  'Google-Extended', 
  'ChatGPT-User',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'CCBot'
];

export const SECTION_CONFIG = {
  id: 'discoverability',
  name: 'Discoverability',
  emoji: '🔍',
  description: 'Visibility and accessibility for search engines and AI',
  weightPercentage: 20,
  maxScore: 100
};

export const METRIC_WEIGHTS = {
  httpsProtocol: 25,
  httpStatus: 25,
  aiBotsAccess: 30,
  sitemapQuality: 20
};

export const PERFORMANCE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  warning: 50
};

export const GLOBAL_PENALTY_THRESHOLDS = {
  allBotsBlocked: 1.0,    // 100% blocked = 70% penalty
  majorityBlocked: 0.5    // >50% blocked = 40% penalty
};

export const PENALTY_FACTORS = {
  allBlocked: 0.7,        // 70% penalty
  majorityBlocked: 0.4    // 40% penalty
};
