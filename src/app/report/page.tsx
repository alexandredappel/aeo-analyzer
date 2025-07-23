"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { ReportLayout } from "@/components/layouts/ReportLayout";
import { ErrorMessage, BackButton, AnalysisLogs, CollectionResults, LoadingSpinner } from "@/components/ui";
import { useAnalysis } from "@/hooks/useAnalysis";

// URL validation function
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Main report content component
function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
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
    isLoading,
    isCompleted,
    hasError,
  } = useAnalysis();

  const handleBackToHome = () => {
    router.push('/');
  };

  // Auto-start analysis when arriving with a valid URL
  useEffect(() => {
    if (urlParam && !hasAutoStarted.current && analysisState === 'idle') {
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        if (isValidUrl(decodedUrl)) {
          hasAutoStarted.current = true;
          startAnalysis(decodedUrl);
        }
      } catch {
        // Invalid URL encoding - will be handled by validation below
      }
    }
  }, [urlParam, analysisState, startAnalysis]);

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

  // Validate URL format
  if (!isValidUrl(decodedUrl)) {
    return (
      <div className="space-y-6">
        <BackButton onClick={handleBackToHome} />
        <ErrorMessage
          title="Invalid URL format provided"
          message={`"${decodedUrl}" is not a valid URL. Please ensure the URL starts with http:// or https:// and is properly formatted.`}
        />
      </div>
    );
  }

  // Handle analysis start (manual trigger)
  const handleStartAnalysis = () => {
    startAnalysis(decodedUrl);
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
      {/* Header with back button and URL display */}
      <div className="flex items-center justify-between">
        <BackButton onClick={handleBackToHome} />
        
        {/* Analysis controls */}
        <div className="flex items-center gap-4">
          {analysisState === 'idle' && (
            <button
              onClick={handleStartAnalysis}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Start Analysis
            </button>
          )}
          
          {hasError && (
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Retry Analysis
            </button>
          )}
          
          {isCompleted && (
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Run Again
            </button>
          )}
        </div>
      </div>

      {/* URL Display avec métadonnées */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-200">Analysis for:</h2>
          <div className="flex items-center gap-2">
            {isLoading && <LoadingSpinner size="sm" />}
            <p className="text-blue-400 font-mono text-sm break-all">{decodedUrl}</p>
          </div>
        </div>
        {/* Meta Title and Description */}
        {collectionResults?.metadata?.basic && (
          <div className="space-y-2 mb-3 pl-6 border-l-2 border-gray-600">
            {collectionResults.metadata.basic.title && (
              <div className="text-sm">
                <span className="text-gray-400">Title:</span> 
                <span className="text-gray-200 ml-2">{collectionResults.metadata.basic.title}</span>
              </div>
            )}
            {collectionResults.metadata.basic.description && (
              <div className="text-sm">
                <span className="text-gray-400">Description:</span> 
                <span className="text-gray-200 ml-2">{collectionResults.metadata.basic.description}</span>
              </div>
            )}
          </div>
        )}
      </div>

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
      {analysisState === 'idle' && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-400">
              Preparing analysis...
            </h3>
            <p className="text-gray-300 max-w-md mx-auto">
              Analysis will start automatically. We&apos;re preparing to collect data about your website&apos;s 
              AEO optimization including HTML content, robots.txt, and sitemap.xml.
            </p>
          </div>
        </div>
      )}

      {/* Real-time analysis logs */}
      {/* <AnalysisLogs logs={logs} isRunning={isLoading} /> */}

      {/* Collection results */}
      <CollectionResults 
        data={collectionResults} 
        analysisResults={analysisResults}
        isLoading={isLoading}
        isAnalysisCompleted={summary?.analysisCompleted || false}
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