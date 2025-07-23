import { useState } from 'react';
import { MainSectionComponent } from '@/components/ui/analysis/MainSectionComponent';
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









export function CollectionResults({ data, analysisResults, isLoading, isAnalysisCompleted }: CollectionResultsProps) {
  // State management for hierarchical drawer expansion
  const [expandedDrawers, setExpandedDrawers] = useState<Set<string>>(new Set());

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
      {/* Global AEO Score Section */}
      <AEOScoreDisplay
        aeoScore={analysisResults?.aeoScore}
        isLoading={isLoading && !analysisResults?.aeoScore}
      />
      
      {/* New Hierarchical Discoverability Section */}
      {isAnalysisCompleted && analysisResults?.discoverability && (
        <MainSectionComponent
          section={analysisResults.discoverability}
          globalPenalties={[]} // TODO: Get from API response
          className="mb-6"
        />
      )}

      {/* New Hierarchical Structured Data */}
      {isAnalysisCompleted && analysisResults?.structuredData && (
        <MainSectionComponent
          section={analysisResults.structuredData}
        />
      )}

      {/* New Hierarchical LLM Formatting */}
      {isAnalysisCompleted && analysisResults?.llmFormatting && (
        <MainSectionComponent
          section={analysisResults.llmFormatting}
        />
      )}

      {/* New Hierarchical Accessibility */}
      {isAnalysisCompleted && analysisResults?.accessibility && (
        <MainSectionComponent
          section={analysisResults.accessibility}
        />
      )}

      {/* New Hierarchical Readability */}
      {isAnalysisCompleted && analysisResults?.readability && (
        <MainSectionComponent
          section={analysisResults.readability}
        />
      )}

      {/* Analysis in Progress */}
      {isLoading && !isAnalysisCompleted && (
        <>
          {/* New Hierarchical Discoverability Loading */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔍</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 bg-gray-600 rounded animate-pulse w-48"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                </div>
                <div className="text-right">
                  <div className="h-10 bg-gray-600 rounded animate-pulse w-20 mb-1"></div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-14"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Foundation Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-40 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-56"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* AI Access Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-32 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-48"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-24"></div>
                <div className="h-6 bg-gray-700 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>
          
          {/* New Hierarchical Structured Data Loading */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📋</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 bg-gray-600 rounded animate-pulse w-48"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                </div>
                <div className="text-right">
                  <div className="h-10 bg-gray-600 rounded animate-pulse w-20 mb-1"></div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-14"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* JSON-LD Analysis Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-40 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-56"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Meta Tags Analysis Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-44 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-48"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Social Meta Analysis Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-48 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-52"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Hierarchical LLM Formatting Loading */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🤖</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 bg-gray-600 rounded animate-pulse w-48"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                </div>
                <div className="text-right">
                  <div className="h-10 bg-gray-600 rounded animate-pulse w-20 mb-1"></div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-14"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Heading Structure Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-44 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-60"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Semantic HTML5 Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-40 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-58"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Link Quality Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-36 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-54"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Technical Structure Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-46 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-56"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Hierarchical Accessibility Loading */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-4xl">♿</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 bg-gray-600 rounded animate-pulse w-48"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                </div>
                <div className="text-right">
                  <div className="h-10 bg-gray-600 rounded animate-pulse w-20 mb-1"></div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-14"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Critical DOM Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-36 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Performance Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-32 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-60"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Images Accessibility Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-48 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-58"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Hierarchical Readability Loading */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📖</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 bg-gray-600 rounded animate-pulse w-48"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                </div>
                <div className="text-right">
                  <div className="h-10 bg-gray-600 rounded animate-pulse w-20 mb-1"></div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-14"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Text Complexity Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-40 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-56"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* Content Organization Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-44 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-60"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* Sentence Quality Drawer Loading */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-36 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-52"></div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="h-5 bg-gray-600 rounded animate-pulse w-16 mb-1"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-24"></div>
                <div className="h-6 bg-gray-700 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 