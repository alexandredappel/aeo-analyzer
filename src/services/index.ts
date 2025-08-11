/**
 * SERVICES - MAIN EXPORT MODULE
 * 
 * Central export point for all analysis services
 */

// ===== CRAWLER & CONFIG =====
export { fetchStaticHTML, fetchRobotsTxt, fetchSitemap, validateAndNormalizeUrl, extractBasicMetadata, TIMEOUT_MS, USER_AGENT, MAX_CONTENT_SIZE } from './crawler';
export type { CrawlResult } from './crawler';

// ===== ANALYSIS SERVICES =====

// Structured Data Analysis
export { analyzeStructuredData } from './structured-data-analyzer';
export type { StructuredDataAnalysisResult } from './structured-data-analyzer';

// LLM Formatting Analysis
export { analyzeLLMFormatting } from './llm-formatting-analyzer';
export type { LLMFormattingAnalysisResult } from './llm-formatting-analyzer';

// Accessibility Analysis
export { analyzeAccessibility } from './accessibility-analyzer';
export type { AccessibilityAnalysisResult } from './accessibility-analyzer';

// Readability Analysis
export { analyzeReadability } from './readability-analyzer';
export type { ReadabilityAnalysisResult } from './readability-analyzer';

// Discoverability Analysis
export { analyzeDiscoverability } from './discoverability-analyzer';
export type { DiscoverabilityAnalysisResult } from './discoverability-analyzer';

// ===== AEO SCORE CALCULATOR =====
export { AEOScoreCalculator } from './aeo-score-calculator';
export type { AEOScoreResult } from './aeo-score-calculator';
