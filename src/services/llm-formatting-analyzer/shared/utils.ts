/**
 * LLM FORMATTING ANALYZER - SHARED UTILITIES
 * 
 * Utility functions used across all LLM formatting analysis modules
 */

import { PerformanceStatus } from '@/types/analysis-architecture';
import { AUTHORITATIVE_DOMAINS, NON_DESCRIPTIVE_PATTERNS } from './constants';

/**
 * Determines performance status based on score
 */
export function getPerformanceStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

/**
 * Checks if link text is descriptive
 */
export function isDescriptiveLinkText(text: string): boolean {
  const cleanText = text.trim().toLowerCase();
  if (cleanText.length < 3) return false;
  
  return !NON_DESCRIPTIVE_PATTERNS.some(pattern => pattern.test(cleanText));
}

/**
 * Checks if domain is authoritative
 */
export function isAuthoritativeDomain(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return AUTHORITATIVE_DOMAINS.some(auth => domain.includes(auth));
  } catch {
    return false;
  }
}

/**
 * Analyzes heading hierarchy validity
 */
export function analyzeHeadingHierarchyStructure(headings: Array<{ level: number; text: string }>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  let valid = true;
  
  if (headings.length === 0) {
    return { valid: false, issues: ['No headings found'] };
  }
  
  // Check for logical progression
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    if (index === 0 && heading.level !== 1) {
      issues.push('Page should start with H1 heading');
      valid = false;
    }
    
    if (heading.level > previousLevel + 1) {
      issues.push(`Heading level jumps from H${previousLevel} to H${heading.level}`);
      valid = false;
    }
    
    previousLevel = heading.level;
  });
  
  return { valid, issues };
}

/**
 * Analyzes heading quality metrics
 */
export function analyzeHeadingQualityMetrics(headings: Array<{ level: number; text: string; descriptive: boolean }>): { score: number; issues: string[] } {
  const issues: string[] = [];
  
  if (headings.length === 0) {
    return { score: 0, issues: ['No headings to analyze'] };
  }
  
  const descriptiveCount = headings.filter(h => h.descriptive).length;
  const descriptiveRatio = descriptiveCount / headings.length;
  
  let score = descriptiveRatio * 10;
  
  if (descriptiveRatio < 0.7) {
    issues.push(`${headings.length - descriptiveCount} headings are too short or generic`);
  }
  
  // Check for generic headings
  const genericPatterns = /^(introduction|content|about|info|data|text|section)/i;
  const genericCount = headings.filter(h => genericPatterns.test(h.text)).length;
  
  if (genericCount > 0) {
    issues.push(`${genericCount} headings use generic text`);
    score -= genericCount * 1;
  }
  
  return { score: Math.max(0, Math.round(score)), issues };
}

/**
 * Analyzes heading semantic value metrics
 */
export function analyzeHeadingSemanticMetrics(headings: Array<{ level: number; text: string }>): { score: number; issues: string[] } {
  const issues: string[] = [];
  
  if (headings.length === 0) {
    return { score: 0, issues: ['No headings to analyze semantic value'] };
  }
  
  // Score based on informativeness
  const informativeCount = headings.filter(h => h.text.length > 20).length;
  const keywordRichCount = headings.filter(h => h.text.split(' ').length >= 3).length;
  
  let score = 0;
  
  // Length bonus (informative headings)
  score += (informativeCount / headings.length) * 5;
  
  // Keyword richness bonus
  score += (keywordRichCount / headings.length) * 5;
  
  if (informativeCount < headings.length * 0.5) {
    issues.push('Many headings lack informative content');
  }
  
  if (keywordRichCount < headings.length * 0.3) {
    issues.push('Headings could include more relevant keywords');
  }
  
  return { score: Math.round(score), issues };
}
