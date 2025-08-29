"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { ReportLayout } from "@/components/layouts/ReportLayout";
import { ErrorMessage, BackButton, AnalysisLogs, CollectionResults, LoadingSpinner, AnalysisProgress, CreditLimitDialog } from "@/components/ui";
import { useAnalysis } from "@/hooks/useAnalysis";
import { HeroHeader } from "@/components/header";
import { normalizeAndValidate } from "@/utils/url";
import { AUTH_FLAG_PARAM } from "@/lib/constants";
import { stripAuthFlag } from "@/utils/urlGuards";

// URL validation function (kept for compatibility if needed elsewhere)
function isValidUrl(urlString: string): boolean {
  return !!normalizeAndValidate(urlString);
}

// Main report content component
function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
  const authFlag = searchParams.get(AUTH_FLAG_PARAM) === '1';
  const hasAutoStarted = useRef(false);
  
  const {
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
    isLoading,
    isCompleted,
    hasError,
  } = useAnalysis();

  const handleBackToHome = () => {
    router.push('/');
  };

  // Auto-start analysis when arriving with a valid URL, unless returning from auth (?auth=1)
  useEffect(() => {
    if (urlParam && !authFlag && !hasAutoStarted.current && analysisState === 'idle') {
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        const normalized = normalizeAndValidate(decodedUrl);
        if (normalized) {
          hasAutoStarted.current = true;
          startAnalysis(normalized);
        }
      } catch {
        // Invalid URL encoding - will be handled by validation below
      }
    }
  }, [urlParam, authFlag, analysisState, startAnalysis]);

  // Optional: clean up ?auth=1 from the URL for nicer UX
  useEffect(() => {
    if (authFlag && typeof window !== 'undefined') {
      const cleaned = stripAuthFlag(window.location.pathname + window.location.search);
      router.replace(cleaned);
    }
  }, [authFlag, router]);

  // Handle missing URL parameter
  if (!urlParam) {
    return (
      <div className="space-y-6">
        <BackButton onClick={handleBackToHome} />
        <ErrorMessage
          title="No URL provided for analysis"
          message="Please provide a valid URL to analyze. Go back to the homepage and enter a website URL."
        />
      </div>
    );
  }

  // Decode and validate URL
  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(urlParam);
  } catch {
    return (
      <div className="space-y-6">
        <BackButton onClick={handleBackToHome} />
        <ErrorMessage
          title="Invalid URL encoding"
          message="The URL parameter appears to be malformed. Please try again with a valid URL."
        />
      </div>
    );
  }

  // Normalize and validate URL format
  const normalizedUrl = normalizeAndValidate(decodedUrl);
  if (!normalizedUrl) {
    return (
      <div className="space-y-6">
        <BackButton onClick={handleBackToHome} />
        <ErrorMessage
          title="Invalid URL format provided"
          message={`"${decodedUrl}" is not a valid URL. Please enter a full domain or page URL.`}
        />
      </div>
    );
  }

  // Handle analysis start (manual trigger)
  const handleStartAnalysis = () => {
    startAnalysis(normalizedUrl);
  };

  // Handle retry
  const handleRetry = () => {
    hasAutoStarted.current = false; // Reset auto-start flag for retry
    resetAnalysis();
  };

  // Determine connection error vs analysis error
  const isConnectionError = error?.includes('Failed to fetch') || 
                           error?.includes('NetworkError') || 
                           error?.includes('ERR_NETWORK') ||
                           error?.includes('HTTP 500') ||
                           error?.includes('HTTP 503');

  return (
    <div className="space-y-6">
      <CreditLimitDialog
        isOpen={isCreditLimitOpen}
        onOpenChange={setIsCreditLimitOpen}
        onMaybeLater={() => router.push('/')}
      />
      {/* Bloc URL + métadonnées fusionné dans AEOScoreDisplay désormais. */}

      {/* Error handling for connection issues */}
      {hasError && isConnectionError && (
        <ErrorMessage
          title="Unable to connect to analysis service"
          message={`Failed to connect to the backend API. Please ensure the API server is running on port 3001. Error: ${error}`}
        />
      )}

      {/* Error handling for analysis issues */}
      {hasError && !isConnectionError && (
        <ErrorMessage
          title="Analysis failed"
          message={error || 'An unknown error occurred during analysis'}
        />
      )}

      {/* Analysis progress or placeholder */}
      

      {analysisState === 'running' && (
        <AnalysisProgress />
      )}

      {/* Real-time analysis logs */}
      {/* <AnalysisLogs logs={logs} isRunning={isLoading} /> */}

      {/* Collection results */}
      <CollectionResults 
        data={collectionResults} 
        analysisResults={analysisResults}
        isLoading={isLoading}
        isAnalysisCompleted={summary?.analysisCompleted || false}
        onRunAgain={handleRetry}
      />

      {/* Analysis summary */}
      {/* {isCompleted && summary && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-3"> 4c8 Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-2xl font-bold text-blue-400">{summary.totalTime}ms</div>
              <div className="text-sm text-gray-400">Total Time</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-2xl font-bold text-green-400">{summary.successCount}</div>
              <div className="text-sm text-gray-400">Successful</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-2xl font-bold text-red-400">{summary.failureCount}</div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-2xl font-bold text-yellow-400">
                {summary.partialSuccess ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-400">Partial Success</div>
            </div>
          </div>
        </div>
      )} */}

      {/* Next steps placeholder */}
      {/* {isCompleted && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-xl"> 6a1</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-400">
              Data collection complete!
            </h3>
            <p className="text-gray-300">
              AEO analysis algorithms will be implemented in the next step to process this data 
              and provide optimization recommendations.
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
}

// Loading component
function ReportLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded w-32 mb-6"></div>
        <div className="h-32 bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  );
}

// Main page component
export default function ReportPage() {
  return (
    <ReportLayout>
      <Suspense fallback={<ReportLoading />}>
        <ReportContent />
      </Suspense>
    </ReportLayout>
  );
} 