/**
 * LLM FORMATTING ANALYZER - SHARED TYPES
 * 
 * Type definitions used across all LLM formatting analysis modules
 */

import { 
  MetricCard, 
  DrawerSubSection, 
  MainSection, 
  PerformanceStatus 
} from '@/types/analysis-architecture';
import { SharedSemanticHTML5Result } from '@/services/shared/semantic-html5-analyzer';

/**
 * Main result interface for LLM formatting analysis
 */
export interface LLMFormattingAnalysisResult {
  section: MainSection;
  rawData: {
    contentHierarchy: {
      totalScore: number;
      maxScore: number;
      cards: Array<{
        id: string;
        score: number;
        maxScore: number;
        status: PerformanceStatus;
      }>;
    };
    layoutAndStructuralRoles: {
      totalScore: number;
      maxScore: number;
      cards: Array<{
        id: string;
        score: number;
        maxScore: number;
        status: PerformanceStatus;
      }>;
    };
    ctaContextClarity: {
      totalScore: number;
      maxScore: number;
      totalLinks: number;
      clearLinks: number;
      clarityRatio: number;
    };
    totalScore: number;
    error?: string;
  };
}

/**
 * Heading analysis result structure
 */
export interface HeadingAnalysis {
  hierarchy: { valid: boolean; issues: string[] };
  quality: { score: number; issues: string[] };
  semanticValue: { score: number; issues: string[] };
  h1Count: number;
  totalHeadings: number;
  maxLevel: number;
  headings: Array<{ level: number; text: string; descriptive: boolean }>;
}

/**
 * Link quality analysis result structure
 */
export interface LinkQualityAnalysis {
  internal: { count: number; descriptive: number; score: number; issues: string[] };
  external: { count: number; descriptive: number; authoritative: number; score: number; issues: string[] };
  context: { score: number; issues: string[] };
  totalLinks: number;
  descriptiveRatio: number;
}



/**
 * Heading structure for analysis
 */
export interface HeadingStructure {
  level: number;
  text: string;
  descriptive: boolean;
}
