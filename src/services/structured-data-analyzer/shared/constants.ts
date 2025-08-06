/**
 * SHARED CONSTANTS for Structured Data Analysis
 * Configuration values and constants used across all analysis modules
 */

import { SectionConfig } from './types';

/**
 * Main section configuration
 */
export const SECTION_CONFIG: SectionConfig = {
  id: 'structured-data',
  name: 'Structured Data',
  emoji: '📋',
  description: 'Does your content have proper schema markup for AI understanding?',
  weightPercentage: 25,
  maxScore: 170  // 110 (JSON-LD: 30+50+20+10) + 35 (Meta) + 25 (Social) = 170
};

/**
 * Extensible schema weights system - easy to add new schemas
 */
export const SCHEMA_WEIGHTS = {
  // Core schemas (high priority)
  Organization: 1.0,     // 10 pts max
  WebSite: 0.8,         // 8 pts max
  Article: 0.9,         // 9 pts max
  Product: 0.9,         // 9 pts max
  LocalBusiness: 1.0,   // 10 pts max
  
  // Content schemas (medium priority)
  BlogPosting: 0.8,     // 8 pts max
  NewsArticle: 0.8,     // 8 pts max
  Recipe: 0.7,          // 7 pts max
  Event: 0.7,           // 7 pts max
  FAQPage: 0.8,         // 8 pts max
  
  // Enhancement schemas (lower priority)
  BreadcrumbList: 0.6,  // 6 pts max
  AggregateRating: 0.5, // 5 pts max
  Review: 0.5,          // 5 pts max
  Person: 0.7,          // 7 pts max
} as const;

/**
 * Schema completeness configuration
 */
export const UNKNOWN_SCHEMA_BONUS = 0.4; // 4 pts for new/unknown schemas
export const DIVERSITY_BONUS_THRESHOLD = 3; // 3+ different schemas get bonus
export const MAX_SCHEMA_POINTS = 20; // Schema Types & Completeness max points

/**
 * Required fields for schema completeness validation
 */
export const REQUIRED_SCHEMA_FIELDS = {
  Organization: ['@type', 'name'],
  WebSite: ['@type', 'name', 'url'],
  Article: ['@type', 'headline', 'author'],
  Product: ['@type', 'name', 'description'],
  LocalBusiness: ['@type', 'name', 'address'],
  BlogPosting: ['@type', 'headline', 'author', 'datePublished'],
  NewsArticle: ['@type', 'headline', 'author', 'datePublished'],
  Recipe: ['@type', 'name', 'recipeIngredient', 'recipeInstructions'],
  Event: ['@type', 'name', 'startDate', 'location'],
  FAQPage: ['@type', 'mainEntity'],
  BreadcrumbList: ['@type', 'itemListElement'],
  Person: ['@type', 'name'],
} as const;

/**
 * Main entity types for detection
 */
export const MAIN_ENTITY_TYPES = ['Article', 'BlogPosting', 'NewsArticle', 'Product', 'LocalBusiness', 'Service'] as const;

/**
 * JSON-LD Analysis scoring configuration
 */
export const JSON_LD_SCORING = {
  IDENTITY_AND_STRUCTURE: 30,
  MAIN_ENTITY: 50,
  ENRICHMENT_SCHEMAS: 20,
  GRAPH_CONNECTIVITY: 10
} as const;

/**
 * Meta Tags scoring configuration
 */
export const META_TAGS_SCORING = {
  TITLE_TAG: 15,
  META_DESCRIPTION: 10,
  TECHNICAL_META: 10
} as const;

/**
 * Social Meta (Open Graph) scoring configuration
 */
export const SOCIAL_META_SCORING = {
  OPEN_GRAPH_BASIC: 15,
  OPEN_GRAPH_IMAGE: 10
} as const;