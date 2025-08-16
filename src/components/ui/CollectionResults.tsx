import { useState } from 'react';
import { MainSectionAnalysis } from '@/components/ui/analysis/MainSectionAnalysis';
import { MainSection } from '@/types/analysis-architecture';
import { AEOScoreDisplay } from '@/components/ui/AEOScoreDisplay';

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

interface AnalysisBreakdown {
  score: number;
  maxScore: number;
  status: 'pass' | 'partial' | 'fail';
  details: string;
}

// Legacy DiscoverabilityAnalysis interface - kept for backward compatibility
// New discoverability uses MainSection from analysis-architecture
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









interface AnalysisResults {
  discoverability?: MainSection;    // New hierarchical structure
  structuredData?: MainSection;     // New hierarchical structure
  llmFormatting?: MainSection;      // New hierarchical structure
  accessibility?: MainSection;      // New hierarchical structure
  readability?: MainSection;        // New hierarchical structure
  aeoScore?: AEOScore;
}

interface CollectionResultsProps {
  data: CollectionData | null;
  analysisResults: AnalysisResults | null;
  isLoading: boolean;
  isAnalysisCompleted: boolean;
  onRunAgain?: () => void;
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

function StatusIcon({ success, error }: { success: boolean; error?: string }) {
  if (success) {
    return <span className="text-green-400">✅</span>;
  } else if (error?.includes('not found') || error?.includes('404')) {
    return <span className="text-yellow-400">⚠️</span>;
  } else {
    return <span className="text-red-400">❌</span>;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'text-green-400';
  if (percentage >= 50) return 'text-orange-400';
  return 'text-red-400';
}

function getScoreLabel(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Poor';
}

function getProgressBarClass(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'bg-green-400';
  if (percentage >= 50) return 'bg-orange-400';
  return 'bg-red-400';
}

function getStatusIcon(status: 'pass' | 'partial' | 'fail'): string {
  switch (status) {
    case 'pass': return '✅';
    case 'partial': return '⚠️';
    case 'fail': return '❌';
    default: return '❓';
  }
}

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
}

function ScoreDisplay({ score, maxScore }: ScoreDisplayProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const widthClass = `w-[${percentage}%]`;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-200 font-medium">Overall Score:</span>
        <span className={`font-bold ${getScoreColor(score, maxScore)}`}>
          {score}/{maxScore} ({percentage}%) - {getScoreLabel(score, maxScore)}
        </span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${getProgressBarClass(score, maxScore)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// Legacy BreakdownSection - replaced by hierarchical MainSectionComponent
// Keeping for potential backward compatibility needs
/*
interface BreakdownSectionProps {
  breakdown: DiscoverabilityAnalysis['breakdown'];
}

function BreakdownSection({ breakdown }: BreakdownSectionProps) {
  const breakdownItems = [
    { key: 'httpsProtocol', label: 'HTTPS Protocol' },
    { key: 'httpStatus', label: 'HTTP Status Code' },
    { key: 'robotsTxtAiBots', label: 'AI Bot Access' },
    { key: 'sitemapPresent', label: 'XML Sitemap' }
  ] as const;

  return (
    <div className="mb-6">
      <h4 className="text-gray-200 font-medium mb-3">📋 Breakdown:</h4>
      <div className="space-y-2">
        {breakdownItems.map(({ key, label }) => {
          const item = breakdown[key];
          if (!item) return null;
          
          return (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(item.status)}</span>
                <span className="text-gray-200">{label}</span>
              </div>
              <div className="text-right">
                <span className={`font-medium ${getScoreColor(item.score, item.maxScore)}`}>
                  {item.score}/{item.maxScore}
                </span>
                <div className="text-xs text-gray-400">{item.details}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
*/

interface RecommendationsListProps {
  recommendations: string[];
}

function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (!recommendations.length) return null;

  return (
    <div>
      <h4 className="text-gray-200 font-medium mb-3">💡 Recommendations:</h4>
      <div className="space-y-1">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>{recommendation}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BreakdownItemProps {
  icon: string;
  label: string;
  score: number;
  maxScore: number;
  details: string;
}

function BreakdownItem({ icon, label, score, maxScore, details }: BreakdownItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-gray-200">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-medium ${getScoreColor(score, maxScore)}`}>
          {score}/{maxScore}
        </span>
        <div className="text-xs text-gray-400">{details}</div>
      </div>
    </div>
  );
}









export function CollectionResults({ data, analysisResults, isLoading, isAnalysisCompleted, onRunAgain }: CollectionResultsProps) {
  // State management for hierarchical drawer expansion
  const [expandedDrawers, setExpandedDrawers] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      if (!data || !analysisResults) return;
      setIsExporting(true);

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.url,
          metadata: data.metadata ?? null,
          analysis: analysisResults
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObject;
      a.download = (() => {
        try {
          const u = new URL(data.url);
          const now = new Date();
          const yyyy = String(now.getFullYear());
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const dd = String(now.getDate()).padStart(2, '0');
          return `GEO Report - ${u.hostname} - ${yyyy}-${mm}-${dd}.pdf`;
        } catch {
          return 'GEO Report - report.pdf';
        }
      })();
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlObject);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleDrawer = (sectionId: string, drawerId: string) => {
    const key = `${sectionId}-${drawerId}`;
    setExpandedDrawers(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(key)) {
        newExpanded.delete(key);
      } else {
        newExpanded.add(key);
      }
      return newExpanded;
    });
  };

  if (isLoading && !data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Global AEO Score Section (nouvelle mise en page avec métadonnées) */}
      <AEOScoreDisplay
        aeoScore={analysisResults?.aeoScore}
        isLoading={isLoading && !analysisResults?.aeoScore}
        title={data?.metadata?.basic?.title}
        description={data?.metadata?.basic?.description}
        url={data?.url}
        isCompleted={isAnalysisCompleted}
        onRunAgain={onRunAgain}
        onExport={isAnalysisCompleted && !isExporting ? handleExport : undefined}
      />
      
      {/* New Hierarchical Discoverability Section */}
      {isAnalysisCompleted && analysisResults?.discoverability && (
        <MainSectionAnalysis
          section={analysisResults.discoverability}
          globalPenalties={[]}
          className="mb-6"
        />
      )}

      {/* New Hierarchical Structured Data */}
      {isAnalysisCompleted && analysisResults?.structuredData && (
        <MainSectionAnalysis
          section={analysisResults.structuredData}
        />
      )}

      {/* New Hierarchical LLM Formatting */}
      {isAnalysisCompleted && analysisResults?.llmFormatting && (
        <MainSectionAnalysis
          section={analysisResults.llmFormatting}
        />
      )}

      {/* New Hierarchical Accessibility */}
      {isAnalysisCompleted && analysisResults?.accessibility && (
        <MainSectionAnalysis
          section={analysisResults.accessibility}
        />
      )}

      {/* New Hierarchical Readability */}
      {isAnalysisCompleted && analysisResults?.readability && (
        <MainSectionAnalysis
          section={analysisResults.readability}
        />
      )}

      {/* Loading UI removed: handled by parent page */}
    </div>
  );
} 