/**
 * DISCOVERABILITY ANALYZER - SHARED UTILITIES
 * 
 * Utility functions used across all discoverability analysis modules
 */

import { PerformanceStatus } from '@/types/analysis-architecture';
import { 
  PERFORMANCE_THRESHOLDS, 
  GLOBAL_PENALTY_THRESHOLDS, 
  PENALTY_FACTORS 
} from './constants';

/**
 * Determines performance status based on score
 */
export function getPerformanceStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  if (percentage >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
  if (percentage >= PERFORMANCE_THRESHOLDS.good) return 'good';
  if (percentage >= PERFORMANCE_THRESHOLDS.warning) return 'warning';
  return 'error';
}

/**
 * Parses robots.txt content into structured rules
 */
export function parseRobotsTxt(robotsContent: string): Record<string, { allows: string[]; disallows: string[] }> {
  const rules: Record<string, { allows: string[]; disallows: string[] }> = {};
  const lines = robotsContent.split('\n').map(line => line.trim());
  
  let currentUserAgent: string | null = null;
  
  for (const line of lines) {
    if (line.startsWith('#') || line === '') continue;
    
    if (line.toLowerCase().startsWith('user-agent:')) {
      currentUserAgent = line.substring(11).trim().toLowerCase();
      if (!rules[currentUserAgent]) {
        rules[currentUserAgent] = { allows: [], disallows: [] };
      }
    } else if (currentUserAgent && line.toLowerCase().startsWith('disallow:')) {
      const path = line.substring(9).trim();
      rules[currentUserAgent].disallows.push(path);
    } else if (currentUserAgent && line.toLowerCase().startsWith('allow:')) {
      const path = line.substring(6).trim();
      rules[currentUserAgent].allows.push(path);
    }
  }
  
  return rules;
}

/**
 * Checks if an AI bot is allowed according to robots.txt
 */
export function isBotAllowed(rules: Record<string, { allows: string[]; disallows: string[] }>, botName: string): boolean {
  const botNameLower = botName.toLowerCase();
  
  // Check bot-specific rules
  if (rules[botNameLower]) {
    const botRules = rules[botNameLower];
    if (botRules.disallows.includes('/')) return false;
    return true;
  }
  
  // Check wildcard rules (User-agent: *)
  if (rules['*']) {
    const wildcardRules = rules['*'];
    if (wildcardRules.disallows.includes('/')) return false;
    return true;
  }
  
  // Default to allowed if no rules found
  return true;
}

/**
 * Validates URL format and extracts protocol
 */
export function validateAndParseUrl(url: string): { isValid: boolean; protocol?: string; error?: string } {
  try {
    const urlObj = new URL(url);
    return {
      isValid: true,
      protocol: urlObj.protocol
    };
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message
    };
  }
}

/**
 * Calculates global penalty factor based on blocked AI bots percentage
 */
export function calculateGlobalPenaltyFactor(blockedBots: string[], totalBots: number): number {
  const blockedPercentage = blockedBots.length / totalBots;
  
  if (blockedPercentage >= GLOBAL_PENALTY_THRESHOLDS.allBotsBlocked) {
    return PENALTY_FACTORS.allBlocked;
  } else if (blockedPercentage > GLOBAL_PENALTY_THRESHOLDS.majorityBlocked) {
    return PENALTY_FACTORS.majorityBlocked;
  }
  
  return 0;
}
