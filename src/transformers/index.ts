/**
 * TRANSFORMERS INDEX
 * 
 * Centralized exports for all data transformers
 * Converts backend analysis results to UI-ready structures
 */

// Discoverability Transformer (Phase 2B)
export { DiscoverabilityTransformer } from './discoverability-transformer';

// Structured Data Transformer (Phase 3B)
export { StructuredDataTransformer } from './structured-data-transformer';

// LLM Formatting Transformer (Phase 4B)
export { LLMFormattingTransformer } from './llm-formatting-transformer';

// Accessibility Transformer (Phase 5B)
export { AccessibilityTransformer } from './accessibility-transformer';

// Readability Transformer (Phase 6B)
export { ReadabilityTransformer } from './readability-transformer';

// Re-export types for convenience
export type { 
  MainSection, 
  DrawerSubSection, 
  MetricCard, 
  PerformanceStatus 
} from '@/types/analysis-architecture'; 