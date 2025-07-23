/**
 * SHARED SERVICES INDEX
 * 
 * Centralized exports for shared analysis components
 * Used by multiple analyzers to eliminate duplication
 */

// Semantic HTML5 Analyzer (Phase 4A)
export {
  SharedSemanticHTML5Analyzer,
  SEMANTIC_ELEMENTS,
  STRUCTURAL_WEIGHTS,
  CONTENT_FLOW_WEIGHTS
} from './semantic-html5-analyzer';

export type {
  SharedSemanticHTML5Result,
  StructuralElementAnalysis,
  AccessibilityFeatureAnalysis,
  ContentFlowAnalysis
} from './semantic-html5-analyzer'; 