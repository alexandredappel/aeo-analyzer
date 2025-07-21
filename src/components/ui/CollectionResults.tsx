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

interface ReadabilityAnalysis {
  score: number;
  maxScore: number;
  breakdown: {
    fleschScore: AnalysisBreakdown;
    sentenceComplexity: AnalysisBreakdown;
    contentDensity: AnalysisBreakdown;
  };
  details: {
    fleschLevel: string;
    averageSentenceLength: number;
    wordCount: number;
    uniqueWords: number;
    contentDensityRatio: number;
  };
  recommendations: string[];
}

interface AnalysisResults {
  discoverability?: DiscoverabilityAnalysis;
  structuredData?: StructuredDataAnalysis;
  llmFormatting?: LLMFormattingAnalysis;
  accessibility?: AccessibilityAnalysis;
  readability?: ReadabilityAnalysis;
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

interface StructuredDataBreakdownSectionProps {
  breakdown: StructuredDataAnalysis['breakdown'];
}

function StructuredDataBreakdownSection({ breakdown }: StructuredDataBreakdownSectionProps) {
  const breakdownItems = [
    { key: 'jsonLd', label: 'JSON-LD Schema' },
    { key: 'metaTags', label: 'Meta Tags' },
    { key: 'openGraph', label: 'OpenGraph Tags' }
  ] as const;

  return (
    <div className="mb-6">
      <h4 className="text-gray-200 font-medium mb-3">📋 Breakdown:</h4>
      <div className="space-y-2">
        {breakdownItems.map(({ key, label }) => {
          const item = breakdown[key];
          if (!item) return null;
          
          return (
            <BreakdownItem
              key={key}
              icon={getStatusIcon(item.status)}
              label={label}
              score={item.score}
              maxScore={item.maxScore}
              details={item.details}
            />
          );
        })}
      </div>
    </div>
  );
}

interface LLMFormattingBreakdownSectionProps {
  breakdown: LLMFormattingAnalysis['breakdown'];
}

function LLMFormattingBreakdownSection({ breakdown }: LLMFormattingBreakdownSectionProps) {
  const breakdownItems = [
    {
      key: 'headingStructure',
      icon: '📋',
      label: 'Heading Structure'
    },
    {
      key: 'semanticElements',
      icon: '🏗️',
      label: 'Semantic HTML5'
    },
    {
      key: 'structuredContent',
      icon: '📊',
      label: 'Structured Content'
    },
    {
      key: 'citationsReferences',
      icon: '🔗',
      label: 'Citations & Links'
    }
  ] as const;

  return (
    <div className="mb-6">
      <h4 className="text-gray-200 font-medium mb-3">📋 Breakdown:</h4>
      <div className="space-y-2">
        {breakdownItems.map(({ key, icon, label }) => {
          const item = breakdown[key];
          if (!item) return null;
          
          return (
            <BreakdownItem
              key={key}
              icon={icon}
              label={label}
              score={item.score}
              maxScore={item.maxScore}
              details={item.details}
            />
          );
        })}
      </div>
    </div>
  );
}

function AccessibilityBreakdownSection({ breakdown }: { breakdown: AccessibilityAnalysis['breakdown'] }) {
  const items = [
    { key: 'criticalDOM', icon: '🔍', label: 'Critical DOM' },
    { key: 'performance', icon: '⚡', label: 'Performance' },
    { key: 'images', icon: '🖼️', label: 'Images Accessibility' }
  ] as const;

  return (
    <div className="mb-6">
      <h4 className="text-gray-200 font-medium mb-3">📋 Breakdown:</h4>
      <div className="space-y-2">
        {items.map(({ key, icon, label }) => {
          const item = breakdown[key];
          if (!item) return null;
          return (
            <BreakdownItem
              key={key}
              icon={icon}
              label={label}
              score={item.score}
              maxScore={item.maxScore}
              details={item.details}
            />
          );
        })}
      </div>
    </div>
  );
}

function ReadabilityBreakdownSection({ breakdown }: { breakdown: ReadabilityAnalysis['breakdown'] }) {
  const items = [
    { key: 'fleschScore', icon: '📖', label: 'Flesch-Kincaid Score' },
    { key: 'sentenceComplexity', icon: '🔤', label: 'Sentence Complexity' },
    { key: 'contentDensity', icon: '📊', label: 'Content Density' }
  ] as const;

  return (
    <div className="mb-6">
      <h4 className="text-gray-200 font-medium mb-3">📋 Breakdown:</h4>
      <div className="space-y-2">
        {items.map(({ key, icon, label }) => {
          const item = breakdown[key];
          if (!item) return null;
          return (
            <BreakdownItem
              key={key}
              icon={icon}
              label={label}
              score={item.score}
              maxScore={item.maxScore}
              details={item.details}
            />
          );
        })}
      </div>
    </div>
  );
}

function GlobalAEOScoreSection({ aeoScore, isLoading }: { aeoScore?: AEOScore; isLoading: boolean }) {
  if (isLoading && !aeoScore) {
    return (
      <div className="bg-gray-800 border border-blue-700 rounded-lg p-6 mb-6 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mb-4"></div>
        <span className="text-blue-400 text-xl font-bold">Calculating global AEO score...</span>
      </div>
    );
  }
  if (!aeoScore) return null;

  const { totalScore, maxScore, breakdown, completeness } = aeoScore;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const items = [
    { key: 'discoverability', label: 'Discoverability', color: getScoreColor(breakdown.discoverability.score, 100), value: breakdown.discoverability.score },
    { key: 'structuredData', label: 'Structured', color: getScoreColor(breakdown.structuredData.score, 100), value: breakdown.structuredData.score },
    { key: 'llmFormatting', label: 'Formatting', color: getScoreColor(breakdown.llmFormatting.score, 100), value: breakdown.llmFormatting.score },
    { key: 'accessibility', label: 'Accessibility', color: getScoreColor(breakdown.accessibility.score, 100), value: breakdown.accessibility.score },
    { key: 'readability', label: 'Readability', color: getScoreColor(breakdown.readability.score, 100), value: breakdown.readability.score },
  ];

  return (
    <div className="bg-gray-800 border border-blue-700 rounded-lg p-6 mb-6">
      <div className="flex flex-col items-center mb-4">
        <span className="text-4xl md:text-5xl font-extrabold text-blue-400 mb-2 tracking-tight">
          {totalScore}/{maxScore}
        </span>
        <div className="w-full bg-gray-600 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressBarClass(totalScore, maxScore)}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-300 font-medium">{completeness}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
        {items.map(({ key, label, color, value }) => (
          <div key={key} className="flex flex-col items-center bg-gray-700 rounded p-2">
            <span className={`font-bold text-lg ${color}`}>{value}</span>
            <span className="text-xs text-gray-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CollectionResults({ data, analysisResults, isLoading, isAnalysisCompleted }: CollectionResultsProps) {
  if (isLoading && !data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Global AEO Score Section */}
      <GlobalAEOScoreSection
        aeoScore={analysisResults?.aeoScore}
        isLoading={isLoading && !analysisResults?.aeoScore}
      />
      {/* Data Collection Results */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          📊 Data Collection Results
        </h3>

      {isLoading ? (
        <div className="space-y-3">
          {['HTML Content', 'Robots.txt', 'Sitemap.xml'].map((item) => (
            <div key={item} className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
              <div className="w-4 h-4 bg-gray-500 rounded animate-pulse"></div>
              <span className="text-gray-300">{item}: Checking...</span>
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-3">
          {/* HTML Content */}
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
            <StatusIcon success={data.html.success} error={data.html.error} />
            <div className="flex-1">
              <span className="text-gray-200 font-medium">HTML Content:</span>
              {data.html.success ? (
                <span className="text-green-400 ml-2">
                  Retrieved ({data.html.metadata?.contentLength ? formatBytes(data.html.metadata.contentLength) : 'Unknown size'})
                </span>
              ) : (
                <span className="text-red-400 ml-2">
                  Failed ({data.html.error || 'Unknown error'})
                </span>
              )}
            </div>
            {data.html.metadata?.responseTime && (
              <span className="text-gray-400 text-sm">
                {data.html.metadata.responseTime}ms
              </span>
            )}
          </div>

          {/* Robots.txt */}
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
            <StatusIcon success={data.robotsTxt.success} error={data.robotsTxt.error} />
            <div className="flex-1">
              <span className="text-gray-200 font-medium">Robots.txt:</span>
              {data.robotsTxt.success ? (
                <span className="text-green-400 ml-2">
                  Found ({data.robotsTxt.metadata?.contentLength ? formatBytes(data.robotsTxt.metadata.contentLength) : 'Unknown size'})
                </span>
              ) : data.robotsTxt.error?.includes('not found') ? (
                <span className="text-yellow-400 ml-2">Not Found (acceptable)</span>
              ) : (
                <span className="text-red-400 ml-2">
                  Error ({data.robotsTxt.error || 'Unknown error'})
                </span>
              )}
            </div>
            {data.robotsTxt.metadata?.responseTime && (
              <span className="text-gray-400 text-sm">
                {data.robotsTxt.metadata.responseTime}ms
              </span>
            )}
          </div>

          {/* Sitemap */}
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
            <StatusIcon success={data.sitemap.success} error={data.sitemap.error} />
            <div className="flex-1">
              <span className="text-gray-200 font-medium">Sitemap.xml:</span>
              {data.sitemap.success ? (
                <span className="text-green-400 ml-2">
                  Found ({data.sitemap.metadata?.contentLength ? formatBytes(data.sitemap.metadata.contentLength) : 'Unknown size'})
                </span>
              ) : data.sitemap.error?.includes('not found') ? (
                <span className="text-yellow-400 ml-2">Not Found (acceptable)</span>
              ) : (
                <span className="text-red-400 ml-2">
                  Error ({data.sitemap.error || 'Unknown error'})
                </span>
              )}
            </div>
            {data.sitemap.metadata?.responseTime && (
              <span className="text-gray-400 text-sm">
                {data.sitemap.metadata.responseTime}ms
              </span>
            )}
          </div>

          {/* Basic Metadata */}
          {data.metadata?.basic && (
            <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
              <h4 className="text-gray-200 font-medium mb-2">📝 Basic Metadata:</h4>
              <div className="space-y-1 text-sm">
                {data.metadata.basic.title && (
                  <div><span className="text-gray-400">Title:</span> <span className="text-gray-200">{data.metadata.basic.title}</span></div>
                )}
                {data.metadata.basic.description && (
                  <div><span className="text-gray-400">Description:</span> <span className="text-gray-200">{data.metadata.basic.description}</span></div>
                )}
                {data.metadata.basic.charset && (
                  <div><span className="text-gray-400">Charset:</span> <span className="text-gray-200">{data.metadata.basic.charset}</span></div>
                )}
                {data.metadata.basic.viewport && (
                  <div><span className="text-gray-400">Viewport:</span> <span className="text-gray-200">{data.metadata.basic.viewport}</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
      </div>

      {/* Discoverability Analysis Section */}
      {isAnalysisCompleted && analysisResults?.discoverability && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            🔍 Discoverability Analysis
          </h3>
          
          <ScoreDisplay 
            score={analysisResults.discoverability.score} 
            maxScore={analysisResults.discoverability.maxScore} 
          />
          
          <BreakdownSection breakdown={analysisResults.discoverability.breakdown} />
          
          <RecommendationsList recommendations={analysisResults.discoverability.recommendations} />
        </div>
      )}

      {/* Structured Data Analysis Section */}
      {isAnalysisCompleted && analysisResults?.structuredData && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            📊 Structured Data Analysis
          </h3>
          
          <ScoreDisplay 
            score={analysisResults.structuredData.score} 
            maxScore={analysisResults.structuredData.maxScore} 
          />
          
          <StructuredDataBreakdownSection breakdown={analysisResults.structuredData.breakdown} />
          
          <RecommendationsList recommendations={analysisResults.structuredData.recommendations} />
        </div>
      )}

      {/* LLM Formatting Analysis Section */}
      {isAnalysisCompleted && analysisResults?.llmFormatting && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            ⚡ LLM-Friendly Formatting Analysis
          </h3>
          
          <ScoreDisplay 
            score={analysisResults.llmFormatting.score} 
            maxScore={analysisResults.llmFormatting.maxScore} 
          />
          
          <LLMFormattingBreakdownSection breakdown={analysisResults.llmFormatting.breakdown} />
          
          <RecommendationsList recommendations={analysisResults.llmFormatting.recommendations} />

          {analysisResults.llmFormatting.validation && !analysisResults.llmFormatting.validation.valid && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <div className="flex items-center text-red-400 text-sm font-medium mb-2">
                <span className="mr-2">⚠️</span>
                <span>Validation Issues:</span>
              </div>
              <ul className="text-red-300 text-sm space-y-1">
                {analysisResults.llmFormatting.validation.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Analysis */}
      {isAnalysisCompleted && analysisResults?.accessibility && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            ♿ Accessibility Analysis
          </h3>
          
          <ScoreDisplay 
            score={analysisResults.accessibility.score} 
            maxScore={analysisResults.accessibility.maxScore} 
          />
          
          <AccessibilityBreakdownSection breakdown={analysisResults.accessibility.breakdown} />
          <RecommendationsList recommendations={analysisResults.accessibility.recommendations} />

          {/* Critical DOM Warning */}
          {analysisResults.accessibility.breakdown.criticalDOM.score < 70 && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center text-yellow-400 text-sm font-medium mb-2">
                <span className="mr-2">⚠️</span>
                <span>Critical DOM Warning:</span>
              </div>
              <p className="text-yellow-300 text-sm">
                Content heavily relies on JavaScript. Consider server-side rendering for better LLM accessibility.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Readability Analysis */}
      {isAnalysisCompleted && analysisResults?.readability && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            📖 Readability Analysis
          </h3>
          
          <ScoreDisplay 
            score={analysisResults.readability.score} 
            maxScore={analysisResults.readability.maxScore} 
          />

          {/* Readability Level Badge */}
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 border border-blue-700 text-blue-300">
              <span className="mr-2">📚</span>
              {analysisResults.readability.details.fleschLevel} Level
            </div>
          </div>

          {/* Readability Details */}
          <div className="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
            <h4 className="text-gray-200 font-medium mb-2">📊 Text Statistics:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-400">Words:</span> <span className="text-gray-200">{analysisResults.readability.details.wordCount.toLocaleString()}</span></div>
              <div><span className="text-gray-400">Unique Words:</span> <span className="text-gray-200">{analysisResults.readability.details.uniqueWords.toLocaleString()}</span></div>
              <div><span className="text-gray-400">Avg. Sentence Length:</span> <span className="text-gray-200">{analysisResults.readability.details.averageSentenceLength} words</span></div>
              <div><span className="text-gray-400">Content Density:</span> <span className="text-gray-200">{(analysisResults.readability.details.contentDensityRatio * 100).toFixed(1)}%</span></div>
            </div>
          </div>
          
          <ReadabilityBreakdownSection breakdown={analysisResults.readability.breakdown} />
          <RecommendationsList recommendations={analysisResults.readability.recommendations} />

          {/* Readability Level Warning */}
          {analysisResults.readability.details.fleschLevel === 'Expert' && analysisResults.readability.score < 70 && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center text-yellow-400 text-sm font-medium mb-2">
                <span className="mr-2">⚠️</span>
                <span>Complexity Warning:</span>
              </div>
              <p className="text-yellow-300 text-sm">
                Content is at Expert level complexity. Consider simplifying language for better LLM understanding and broader audience accessibility.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analysis in Progress */}
      {isLoading && !isAnalysisCompleted && (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              🔍 Discoverability Analysis
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
              <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
              <span className="text-gray-300">Analysis in progress...</span>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              📊 Structured Data Analysis
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
              <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
              <span className="text-gray-300">Analysis in progress...</span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              ⚡ LLM-Friendly Formatting Analysis
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
              <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
              <span className="text-gray-300">Analysis in progress...</span>
            </div>
          </div>

          {/* Loading - Accessibility */}
          {isLoading && !isAnalysisCompleted && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">♿ Accessibility Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
                  <span className="text-gray-300">Launching Puppeteer browser...</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="w-4 h-4 bg-purple-500 rounded animate-pulse"></div>
                  <span className="text-gray-300">Analyzing Critical DOM...</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading - Readability */}
          {isLoading && !isAnalysisCompleted && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">📖 Readability Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="w-4 h-4 bg-green-500 rounded animate-pulse"></div>
                  <span className="text-gray-300">Analyzing text readability...</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
                  <span className="text-gray-300">Calculating Flesch-Kincaid score...</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="w-4 h-4 bg-purple-500 rounded animate-pulse"></div>
                  <span className="text-gray-300">Analyzing sentence complexity...</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 