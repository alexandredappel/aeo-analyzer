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

// Structured Data Analyzer (3A)
export {
  analyzeStructuredData,
  SCHEMA_WEIGHTS,
  UNKNOWN_SCHEMA_BONUS,
  REQUIRED_SCHEMA_FIELDS,
  parseJSONLD,
  calculateDiversityBonus,
  analyzeJSONLDPresence,
  analyzeSchemaTypesCompleteness,
  analyzeTitleTag,
  analyzeMetaDescription,
  analyzeTechnicalMeta,
  analyzeOpenGraphBasic,
  analyzeOpenGraphImage
} from './structured-data-analyzer';

export type {
  StructuredDataAnalysisResult,
  JSONLDData
} from './structured-data-analyzer';

// Accessibility Analyzer (5A) - Performance-focused with SharedSemanticHTML5Analyzer
export { 
  AccessibilityAnalyzer,
  analyzeAccessibility,
  CRITICAL_DOM_WEIGHTS,
  PERFORMANCE_WEIGHTS,
  IMAGES_WEIGHTS
} from './accessibility-analyzer';

export type {
  AccessibilityAnalysisResult
} from './accessibility-analyzer';

// Discoverability Analyzer (2C)
export {
  analyzeDiscoverability,
  analyzeHTTPS,
  analyzeHTTPStatus,
  analyzeRobotsAIBots,
  analyzeSitemapQuality,
  parseRobotsTxt,
  isBotAllowed,
  AI_BOTS
} from './discoverability-analyzer';

export type {
  DiscoverabilityAnalysisResult,
  CollectedData,
  RobotRules
} from './discoverability-analyzer';

// LLM Formatting Analyzer (4A)
export {
  analyzeLLMFormatting,
  AUTHORITATIVE_DOMAINS,
  NON_DESCRIPTIVE_PATTERNS,
  analyzeHeadingHierarchy,
  analyzeHeadingQuality,
  analyzeHeadingSemanticValue,
  analyzeStructuralElements,
  analyzeAccessibilityFeatures,
  analyzeContentFlow,
  analyzeInternalLinks,
  analyzeExternalLinks,
  analyzeLinkContextQuality,
  analyzeCleanMarkup,
  analyzeNavigationStructure
} from './llm-formatting-analyzer';

// Shared Analyzers (4A)
export {
  SharedSemanticHTML5Analyzer,
  SEMANTIC_ELEMENTS,
  STRUCTURAL_WEIGHTS,
  CONTENT_FLOW_WEIGHTS
} from './shared/semantic-html5-analyzer';

export type {
  LLMFormattingAnalysisResult,
  HeadingAnalysis,
  LinkQualityAnalysis,
  TechnicalStructureAnalysis
} from './llm-formatting-analyzer';

// Shared Analyzer Types (4A)
export type {
  SharedSemanticHTML5Result,
  StructuralElementAnalysis,
  AccessibilityFeatureAnalysis,
  ContentFlowAnalysis
} from './shared/semantic-html5-analyzer';

// Readability Analyzer (6A) - Editorial content quality for content creators
export { 
  ReadabilityAnalyzer,
  analyzeReadability,
  TEXT_COMPLEXITY_WEIGHTS,
  CONTENT_ORGANIZATION_WEIGHTS,
  SENTENCE_QUALITY_WEIGHTS
} from './readability-analyzer';

export type {
  ReadabilityAnalysisResult
} from './readability-analyzer';

// 🎉 ALL SERVICES MIGRATED - Migration Complete! 🎉 