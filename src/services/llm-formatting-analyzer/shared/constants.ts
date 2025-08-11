/**
 * LLM FORMATTING ANALYZER - SHARED CONSTANTS
 * 
 * Constants used across all LLM formatting analysis modules
 */

/**
 * Authoritative domain patterns for external link scoring
 */
export const AUTHORITATIVE_DOMAINS = [
  // Academic & Research
  '.edu', '.gov', '.org',
  // Major tech companies
  'github.com', 'stackoverflow.com', 'developer.mozilla.org',
  // News & Media
  'reuters.com', 'bbc.com', 'cnn.com', 'nytimes.com',
  // Professional
  'linkedin.com', 'medium.com'
];

/**
 * Non-descriptive link text patterns to avoid
 */
export const NON_DESCRIPTIVE_PATTERNS = [
  /^(click here|read more|learn more|more|here|this|that)$/i,
  /^(download|link|url|website|page|article)$/i,
  /^(continue|next|previous|back|home)$/i
];

/**
 * Section configuration for LLM Formatting
 */
export const SECTION_CONFIG = {
  id: 'llm-formatting',
  name: 'LLM Formatting',
  emoji: '🤖',
  description: 'Is your content structured for optimal LLM parsing?',
  weightPercentage: 25,
  maxScore: 100
};

/**
 * Generic heading patterns to avoid
 */
export const GENERIC_HEADING_PATTERNS = /^(introduction|content|about|info|data|text|section)/i;
