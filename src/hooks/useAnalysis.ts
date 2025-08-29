import { useState, useCallback } from 'react';
import { trackAnalysisComplete, trackAnalysisError } from '@/utils/analytics';
import { MainSection } from '@/types/analysis-architecture';

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









interface ScoreContribution {
  score: number;
  weight: number;
  contribution: number;
}

interface AEOScore {
  totalScore: number;
  maxScore: number;
  breakdown: {
    discoverability: ScoreContribution;
    structuredData: ScoreContribution;
    llmFormatting: ScoreContribution;
    accessibility: ScoreContribution;
    readability: ScoreContribution;
  };
  completeness: string;
  metadata: {
    totalWeight: number;
    completedAnalyses: number;
    totalAnalyses: number;
  };
}

interface AnalysisResults {
  discoverability?: MainSection; // New hierarchical structure
  structuredData?: MainSection; // New hierarchical structure
  llmFormatting?: MainSection; // New hierarchical structure
  accessibility?: MainSection; // New hierarchical structure
  readability?: MainSection; // New hierarchical structure
  aeoScore?: AEOScore;
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
  const [isCreditLimitOpen, setIsCreditLimitOpen] = useState<boolean>(false);

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
      // Use Next.js API Routes (available in both development and production)
      const response = await fetch('/api/collect-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        // Handle credit limit (402 Payment Required)
        if (response.status === 402) {
          setAnalysisState('idle');
          setIsCreditLimitOpen(true);
          setError('Payment Required (402): Credit limit reached');
          return; // Stop further processing
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AnalysisResponse = await response.json();

      if (result.success) {
        setCollectionResults(result.data);
        setLogs(result.logs);
        setSummary(result.summary);
        setAnalysisResults(result.analysis || null);
        setAnalysisState('completed');
        
        // Track successful analysis completion
        // Note: aeoScore might be in result directly, not in result.analysis
        const aeoScore = (result as any).aeoScore?.totalScore || undefined;
        trackAnalysisComplete(url, aeoScore);
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
      
      // Track analysis error
      trackAnalysisError(url, errorMessage);
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
    isCreditLimitOpen,
    setIsCreditLimitOpen,
    isLoading: analysisState === 'running',
    isCompleted: analysisState === 'completed',
    hasError: analysisState === 'error',
  };
} 