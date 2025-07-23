import React from 'react';

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

interface AEOScoreDisplayProps {
  aeoScore?: AEOScore;
  isLoading: boolean;
}

function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'text-green-400';
  if (percentage >= 50) return 'text-orange-400';
  return 'text-red-400';
}

export function AEOScoreDisplay({ aeoScore, isLoading }: AEOScoreDisplayProps) {
  if (isLoading && !aeoScore) {
    return (
      <div className="bg-gray-800 border border-blue-700 rounded-lg p-6 mb-6 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mb-4"></div>
        <span className="text-blue-400 text-xl font-bold">Calculating global AEO score...</span>
      </div>
    );
  }
  
  if (!aeoScore) return null;

  const { totalScore, maxScore, breakdown } = aeoScore;
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
      {/* Modern Dashboard Score Display */}
      <div className="flex flex-col items-center mb-4">
        {/* Large Score Display */}
        <div className="mb-4">
          <span className={`text-6xl md:text-7xl font-extrabold tracking-tight ${percentage >= 70 ? "text-green-400" : percentage >= 50 ? "text-orange-400" : "text-red-400"}`}>
            {totalScore}
          </span>
          <span className="text-2xl text-gray-400 font-medium">/100</span>
        </div>
        {/* Horizontal Progress Bar */}
        <div className="w-full max-w-md mb-4">
          <div className="w-full bg-gray-600 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                percentage >= 70 ? "bg-green-400" : percentage >= 50 ? "bg-orange-400" : "bg-red-400"
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Sub-scores Grid */}
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