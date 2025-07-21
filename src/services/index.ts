/**
 * Services exports
 * Core services for AEO Auditor
 */

// Crawler service
export {
  validateAndNormalizeUrl,
  fetchStaticHTML,
  fetchRobotsTxt,
  fetchSitemap,
  extractBasicMetadata,
  TIMEOUT_MS,
  USER_AGENT,
  MAX_CONTENT_SIZE
} from './crawler';

export type {
  CrawlResult,
  BasicMetadata,
  FetchMetadata,
  RequestOptions,
  RequestResponse
} from './crawler';

// AEO Score Calculator
export { AEOScoreCalculator as default } from './aeo-score-calculator';
export { AEOScoreCalculator } from './aeo-score-calculator';

export type {
  AEOScoreResult,
  ScoreBreakdown,
  CategoryBreakdown,
  WeightConfig,
  AnalysisResults,
  AnalysisResult,
  ScoreStatus,
  ScoreLevel,
  ScoreMetadata
} from './aeo-score-calculator';

// Structured Data Analyzer (2C)
export { StructuredDataAnalyzer } from './structured-data-analyzer';
export { default as structuredDataAnalyzer } from './structured-data-analyzer';

export type {
  StructuredDataResult,
  CriteriaWeights as StructuredDataCriteriaWeights,
  CompletenessValidation,
  ValidationDetails,
  TitleAnalysis,
  DescriptionAnalysis,
  TechnicalMetaAnalysis,
  ImageValidation,
  UrlContext,
  Recommendation as StructuredDataRecommendation
} from './structured-data-analyzer';

// Accessibility Analyzer (2C)
export { AccessibilityAnalyzer } from './accessibility-analyzer';
export { default as accessibilityAnalyzer } from './accessibility-analyzer';

export type {
  AccessibilityResult,
  AnalysisBreakdown,
  CriticalDOMResult,
  PageSpeedResult,
  ImageResult,
  AccessibilityElements,
  CoreWebVitals,
  Opportunity,
  AccessibilityIssue,
  ImageIssue
} from './accessibility-analyzer';

// Discoverability Analyzer (2C)
export {
  analyzeDiscoverability,
  analyzeHttps,
  analyzeHttpStatus,
  analyzeRobotsAiBots,
  analyzeSitemap,
  parseRobotsTxt,
  isBotAllowed,
  AI_BOTS
} from './discoverability-analyzer';

export type {
  DiscoverabilityResult,
  DiscoverabilityBreakdown,
  CollectedData,
  RobotRules
} from './discoverability-analyzer';

// LLM Formatting Analyzer (2D)
export { LLMFormattingAnalyzer } from './llm-formatting-analyzer';
export { default as llmFormattingAnalyzer } from './llm-formatting-analyzer';

export type {
  LLMFormattingResult,
  CriteriaWeights as LLMCriteriaWeights,
  ContentType,
  HierarchyAnalysis,
  HeadingContentAnalysis,
  HeadingContentAdvanced,
  HeadingSemanticValue,
  SemanticStructureAnalysis,
  AccessibilityFeatures,
  ContentFlow,
  StructureAnalysis,
  ReadabilityAnalysis as LLMReadabilityAnalysis,
  DensityAnalysis,
  LinkAnalysis,
  AccessibilityValidation,
  LLMOptimization,
  Recommendation as LLMRecommendation,
  ValidationResult
} from './llm-formatting-analyzer';

// Readability Analyzer (2D)
export { ReadabilityAnalyzer } from './readability-analyzer';
export { default as readabilityAnalyzer } from './readability-analyzer';

export type {
  ReadabilityResult,
  ReadabilityWeights,
  ReadabilityBreakdown,
  ReadabilityDetails,
  ReadabilityRecommendation,
  AnalysisOptions,
  ComplexityMetric,
  ScoreAnalysis
} from './readability-analyzer';

// 🎉 ALL SERVICES MIGRATED - Migration Complete! 🎉 