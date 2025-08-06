/**
 * SHARED TYPES for Structured Data Analysis
 * Common interfaces and types used across all analysis modules
 */

import { MainSection, MetricCard, DrawerSubSection } from '@/types/analysis-architecture';

/**
 * Result of the complete structured data analysis
 */
export interface StructuredDataAnalysisResult {
  section: MainSection;
  rawData: {
    jsonLdFound: boolean;
    jsonLdValid: boolean;
    detectedSchemas: string[];
    totalEntities: number;
    titleTag: {
      present: boolean;
      length: number;
      text: string;
    };
    metaDescription: {
      present: boolean;
      length: number;
      text: string;
    };
    technicalMeta: {
      viewport: boolean;
      charset: boolean;
      robots: boolean;
    };
    openGraph: {
      title: boolean;
      description: boolean;
      image: boolean;
      url: boolean;
    };
    totalSchemas: number;
    identityAndStructureScore: number;
    mainEntityScore: number;
    semanticAnalysisComplete: boolean;
    error?: string;
  };
}

/**
 * JSON-LD parsing data structure (legacy support)
 */
export interface JSONLDData {
  scripts: any[];
  validSchemas: string[];
  invalidSchemas: string[];
  totalScripts: number;
  schemaCompleteness: Record<string, number>;
}

/**
 * Configuration for the structured data section
 */
export interface SectionConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  weightPercentage: number;
  maxScore: number;
}

/**
 * Analysis function interface for consistent module structure
 */
export interface AnalysisModule {
  analyze: (html: string, entities?: any[]) => MetricCard[];
  generatePerfectItems: (cards: MetricCard[], entities?: any[]) => string[];
  getMaxScore: () => number;
}

/**
 * Entity types for main entity detection
 */
export type MainEntityType = 'Article' | 'BlogPosting' | 'NewsArticle' | 'Product' | 'LocalBusiness' | 'Service';

/**
 * Schema.org entity structure
 */
export interface SchemaEntity {
  '@type': string;
  '@id'?: string;
  [key: string]: any;
}