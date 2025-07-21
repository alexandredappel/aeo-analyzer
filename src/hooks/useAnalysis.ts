import { useState, useCallback } from 'react';

type AnalysisState = 'idle' | 'running' | 'completed' | 'error';

interface AnalysisBreakdown {
  score: number;
  maxScore: number;
  status: 'pass' | 'partial' | 'fail';
  details: string;
}

interface DiscoverabilityAnalysis {
  score: number;
  maxScore: number;
  breakdown: {
    httpsProtocol?: AnalysisBreakdown;
    httpStatus?: AnalysisBreakdown;
    robotsTxtAiBots?: AnalysisBreakdown;
    sitemapPresent?: AnalysisBreakdown;
  };
  recommendations: string[];
}

interface StructuredDataAnalysis {
  category: string;
  score: number;
  maxScore: number;
  breakdown: {
    jsonLd: AnalysisBreakdown;
    metaTags: AnalysisBreakdown;
    openGraph: AnalysisBreakdown;
  };
  recommendations: string[];
}

interface LLMFormattingAnalysis {
  score: number;
  maxScore: number;
  breakdown: {
    headingStructure: AnalysisBreakdown;
    semanticElements: AnalysisBreakdown;
    structuredContent: AnalysisBreakdown;
    citationsReferences: AnalysisBreakdown;
  };
  recommendations: string[];
  validation?: {
    valid: boolean;
    issues: string[];
    warnings: string[];
  };
}

interface AccessibilityAnalysis {
  score: number;
  maxScore: number;
  breakdown: {
    criticalDOM: AnalysisBreakdown;
    performance: AnalysisBreakdown;
    images: AnalysisBreakdown;
  };
  recommendations: string[];
}

interface AnalysisResults {
  discoverability?: DiscoverabilityAnalysis;
  structuredData?: StructuredDataAnalysis;
  llmFormatting?: LLMFormattingAnalysis;
  accessibility?: AccessibilityAnalysis;
}

interface CollectionResult {
  success: boolean;
  data?: string;
  error?: string;
  metadata?: {
    statusCode?: number;
    contentLength?: number;
    responseTime?: number;
    contentType?: string;
  };
}

interface CollectionData {
  url: string;
  html: CollectionResult;
  robotsTxt: CollectionResult;
  sitemap: CollectionResult;
  metadata?: {
    basic?: {
      title?: string;
      description?: string;
      charset?: string;
      viewport?: string;
      canonical?: string;
      robots?: string;
    };
  };
}

interface AnalysisResponse {
  success: boolean;
  data: CollectionData;
  logs: string[];
  summary: {
    totalTime: number;
    successCount: number;
    failureCount: number;
    partialSuccess: boolean;
    analysisCompleted?: boolean;
  };
  analysis?: AnalysisResults;
}

export function useAnalysis() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [collectionResults, setCollectionResults] = useState<CollectionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalysisResponse['summary'] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const startAnalysis = useCallback(async (url: string) => {
    // Reset state
    setAnalysisState('running');
    setLogs([]);
    setCollectionResults(null);
    setError(null);
    setSummary(null);
    setAnalysisResults(null);

    // Add initial log
    const initialLog = `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] INFO: Starting analysis for: ${url}`;
    setLogs([initialLog]);

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/collect-data' 
        : 'http://localhost:3001/api/collect-data';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AnalysisResponse = await response.json();

      if (result.success) {
        setCollectionResults(result.data);
        setLogs(result.logs);
        setSummary(result.summary);
        setAnalysisResults(result.analysis || null);
        setAnalysisState('completed');
      } else {
        throw new Error(result.logs?.join('\n') || 'Analysis failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Add error to logs
      const errorLog = `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] ERROR: ${errorMessage}`;
      setLogs(prev => [...prev, errorLog]);
      
      setError(errorMessage);
      setAnalysisState('error');
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisState('idle');
    setLogs([]);
    setCollectionResults(null);
    setError(null);
    setSummary(null);
    setAnalysisResults(null);
  }, []);

  return {
    analysisState,
    logs,
    collectionResults,
    error,
    summary,
    analysisResults,
    startAnalysis,
    resetAnalysis,
    isLoading: analysisState === 'running',
    isCompleted: analysisState === 'completed',
    hasError: analysisState === 'error',
  };
} 