/**
 * SHARED UTILITIES for Structured Data Analysis
 * Common helper functions used across all analysis modules
 */

import * as cheerio from 'cheerio';
import { PerformanceStatus } from '@/types/analysis-architecture';
import { DIVERSITY_BONUS_THRESHOLD, REQUIRED_SCHEMA_FIELDS, SCHEMA_WEIGHTS, UNKNOWN_SCHEMA_BONUS, MAX_SCHEMA_POINTS } from './constants';
import { JSONLDData, SchemaEntity } from './types';

/**
 * Determines performance status based on score
 */
export function getPerformanceStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

/**
 * NEW PARSER: Extracts and normalizes all Schema.org entities from JSON-LD scripts
 * 
 * This function has a single responsibility: find all JSON-LD scripts, parse them,
 * and return a flat list of all Schema.org entities without any scoring or completeness calculation.
 * 
 * @param html The HTML content to parse
 * @returns Array of normalized Schema.org entities
 */
export function parseAndNormalizeEntities(html: string): SchemaEntity[] {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  const entities: SchemaEntity[] = [];

  scripts.each((_, script) => {
    try {
      const content = $(script).html();
      if (!content) return;

      const jsonData = JSON.parse(content);
      
      // Handle different JSON-LD structures
      if (Array.isArray(jsonData)) {
        // Case 1: Direct array of entities
        entities.push(...jsonData);
      } else if (jsonData['@graph']) {
        // Case 2: Object with @graph property containing entities
        if (Array.isArray(jsonData['@graph'])) {
          entities.push(...jsonData['@graph']);
        } else {
          entities.push(jsonData['@graph']);
        }
      } else {
        // Case 3: Single entity object
        entities.push(jsonData);
      }
    } catch (error) {
      // Robust error handling: log the error but continue processing other scripts
      console.warn('Failed to parse JSON-LD script:', error);
      // Don't throw - just skip this invalid script and continue
    }
  });

  return entities;
}

/**
 * Parses and validates JSON-LD structured data (legacy support)
 */
export function parseJSONLD(html: string): JSONLDData {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  
  const result: JSONLDData = {
    scripts: [],
    validSchemas: [],
    invalidSchemas: [],
    totalScripts: scripts.length,
    schemaCompleteness: {}
  };

  scripts.each((_, script) => {
    try {
      const content = $(script).html();
      if (!content) return;

      const jsonData = JSON.parse(content);
      const schemas = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      schemas.forEach(schema => {
        if (schema['@type']) {
          const schemaType = schema['@type'];
          result.validSchemas.push(schemaType);
          result.scripts.push(schema);
          
          // Calculate completeness for known schemas
          if (REQUIRED_SCHEMA_FIELDS[schemaType as keyof typeof REQUIRED_SCHEMA_FIELDS]) {
            const required = REQUIRED_SCHEMA_FIELDS[schemaType as keyof typeof REQUIRED_SCHEMA_FIELDS];
            const present = required.filter(field => schema[field] !== undefined);
            result.schemaCompleteness[schemaType] = (present.length / required.length) * 100;
          }
        }
      });
    } catch (error) {
      result.invalidSchemas.push('Invalid JSON-LD');
    }
  });

  return result;
}

/**
 * Calculates schema diversity bonus
 */
export function calculateDiversityBonus(schemas: string[]): number {
  const uniqueSchemas = new Set(schemas);
  return uniqueSchemas.size >= DIVERSITY_BONUS_THRESHOLD ? 2 : 0; // 2 point bonus
}

/**
 * Calculates weighted score for schema types
 */
export function calculateSchemaScore(validSchemas: string[], schemaCompleteness: Record<string, number>): number {
  let weightedScore = 0;
  const processedSchemas = new Set<string>();
  
  validSchemas.forEach(schemaType => {
    if (processedSchemas.has(schemaType)) return; // Avoid double counting
    processedSchemas.add(schemaType);
    
    // Get weight for this schema type
    const weight = SCHEMA_WEIGHTS[schemaType as keyof typeof SCHEMA_WEIGHTS] || UNKNOWN_SCHEMA_BONUS;
    let schemaScore = weight * 10; // Base score
    
    // Apply completeness multiplier
    const completeness = schemaCompleteness[schemaType] || 100;
    schemaScore *= (completeness / 100);
    
    weightedScore += schemaScore;
  });
  
  // Cap at 18 points, add diversity bonus (2 points max)
  const cappedScore = Math.min(weightedScore, 18);
  const diversityBonus = calculateDiversityBonus(validSchemas);
  return Math.min(cappedScore + diversityBonus, MAX_SCHEMA_POINTS);
}