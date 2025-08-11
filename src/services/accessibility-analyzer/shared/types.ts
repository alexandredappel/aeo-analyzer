/**
 * ACCESSIBILITY ANALYZER - SHARED TYPES
 * 
 * Types partagés pour toutes les analyses d'accessibilité
 */

import * as cheerio from 'cheerio';
import { SharedSemanticHTML5Result } from '../../shared/semantic-html5-analyzer';
import { MetricCard, DrawerSubSection, MainSection, PerformanceStatus } from '../../../types/analysis-architecture';

// ===== INTERFACES PRINCIPALES =====

export interface AccessibilityAnalysisResult {
  category: 'accessibility';
  score: number;
  maxScore: number;
  weightPercentage: 15;
  
  section: MainSection;
  
  sharedMetrics: {
    semanticHTML5Analysis: SharedSemanticHTML5Result;
  };
  
  rawData: {
    contentAccessibility: {
      staticContentAvailability?: Record<string, any>;
      imageAccessibility?: Record<string, any>;
      totalScore: number;
      maxScore: number;
    };
    technicalAccessibility: {
      performanceScore?: number;
      coreWebVitals?: {
        lcp: number;
        fid: number;
        cls: number;
      };
      imageOptimization?: Record<string, any>;
    };
    navigationalAccessibility: {
      navElementsCount: number;
      staticLinksInNav: number;
      breadcrumbsDetected: boolean;
      navWithAriaLabels: number;
    };
  };
}

// ===== TYPES POUR CRITICAL DOM =====

export interface ContentRatioAnalysis {
  contentRatio: number;
  textLength: number;
  jsRatio: number;
  totalElements: number;
  jsElements: number;
}

export interface NavigationAccessAnalysis {
  navElements: number;
  staticLinks: number;
  jsOnlyButtons: number;
  staticNavCount: number;
}

export interface CriticalDOMRawData {
  contentRatio: number;
  navigationAccess: number;
  semanticStructure: SharedSemanticHTML5Result;
}

// ===== TYPES POUR PERFORMANCE =====

export interface PageSpeedAnalysis {
  pageSpeedScore?: number;
  coreWebVitals?: {
    lcp: number;
    fid: number;
    cls: number;
  };
  analysisTime?: number;
  retryCount?: number;
  api?: string;
  pageSpeedError?: string;
  timeoutOccurred?: boolean;
}

export interface CoreWebVitalsAnalysis {
  lcp: number;
  fid: number;
  cls: number;
}

export interface PerformanceRawData {
  pageSpeedScore?: number;
  coreWebVitals?: CoreWebVitalsAnalysis;
}



// ===== TYPES POUR LES ANALYSEURS =====

export interface AccessibilityAnalyzerInterface {
  analyze(html: string, url?: string): Promise<AccessibilityAnalysisResult>;
}

export interface CriticalDOMAnalyzerInterface {
  analyzeContentRatio($: cheerio.CheerioAPI): MetricCard;
  analyzeNavigationAccess($: cheerio.CheerioAPI): MetricCard;
  createSemanticStructureCard(sharedResult: SharedSemanticHTML5Result): MetricCard;
}

export interface PerformanceAnalyzerInterface {
  analyzePageSpeed(url?: string): Promise<MetricCard>;
  analyzeCoreWebVitals(url?: string): Promise<MetricCard>;
}



// ===== TYPES POUR LES UTILITAIRES =====

export interface ErrorResult {
  score: number;
  status: PerformanceStatus;
  problems: string[];
  solutions: string[];
  successMessage: string;
  rawData: any;
}

export interface AnalysisContext {
  html: string;
  url?: string;
  $: cheerio.CheerioAPI;
}
