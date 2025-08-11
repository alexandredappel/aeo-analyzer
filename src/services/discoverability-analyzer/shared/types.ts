/**
 * DISCOVERABILITY ANALYZER - SHARED TYPES
 * 
 * Type definitions used across all discoverability analysis modules
 */

import { 
  MetricCard, 
  DrawerSubSection, 
  MainSection, 
  GlobalPenalty, 
  PerformanceStatus 
} from '@/types/analysis-architecture';

export interface CollectedData {
  url: string;
  html?: {
    success: boolean;
    error?: string;
    metadata?: {
      statusCode?: number;
    };
  };
  robotsTxt?: {
    success: boolean;
    data?: string;
    error?: string;
  };
  sitemap?: {
    success: boolean;
    error?: string;
    data?: string;
  };
  llmTxt?: {
    success: boolean;
    data?: string;
    error?: string;
  };
}

export interface RobotRules {
  [userAgent: string]: {
    allows: string[];
    disallows: string[];
  };
}

export interface DiscoverabilityAnalysisResult {
  section: MainSection;
  globalPenalties: GlobalPenalty[];
  rawData: {
    httpsEnabled: boolean;
    httpStatusCode: number;
    robotsContent: string;
    sitemapPresent: boolean;
    blockedAIBots: string[];
    allowedAIBots: string[];
    llmTxtFound: boolean;
    llmTxtContent: string | null;
    error?: string;
  };
}

export interface HTTPSAnalysisData {
  protocol: string;
  isSecure: boolean;
  error?: string;
}

export interface HTTPStatusAnalysisData {
  statusCode: number;
  success: boolean;
  error?: string;
}

export interface AIBotsAnalysisData {
  robotsContent: string;
  blockedBots: string[];
  allowedBots: string[];
  totalBots: number;
}

export interface SitemapAnalysisData {
  sitemapFound: boolean;
  error?: string;
  content?: string;
}

// Re-export types from analysis-architecture for convenience
export type {
  MetricCard,
  DrawerSubSection,
  MainSection,
  GlobalPenalty,
  PerformanceStatus
};
