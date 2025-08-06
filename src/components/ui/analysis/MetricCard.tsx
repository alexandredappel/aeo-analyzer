import React from 'react';
import { MetricCard as MetricCardType } from '@/types/analysis-architecture';
import { StatusIcon } from './StatusIcon';

interface MetricCardProps {
  card: MetricCardType;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ card, className = '' }) => {
  const scorePercentage = Math.round((card.score / card.maxScore) * 100);
  
  // Protection et conversion des structures de données
  const recommendations = card.recommendations || [];
  const hasOldStructure = card.problems && card.solutions;
  const hasNewStructure = recommendations.length > 0;
  const hasProblems = hasOldStructure || hasNewStructure;
  
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-4 transition-all duration-200 hover:border-gray-600 hover:shadow-lg ${className}`}>
      {/* En-tête avec titre uniquement */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <StatusIcon status={card.status} size="md" />
          <h3 className="text-lg font-semibold text-white">{card.name}</h3>
        </div>
      </div>

      {/* Explication */}
      <div className="mb-3">
        <p className="text-gray-300 leading-relaxed">{card.explanation}</p>
      </div>

      {/* Conditional display logic */}
      {!hasProblems ? (
        <div className="flex items-center text-green-400 text-sm">
          <span className="mr-2">✅</span>
          <span>{card.successMessage}</span>
        </div>
      ) : (
        <>
          {/* Nouvelle structure - Recommendations */}
          {hasNewStructure && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                <span>🔍</span>
                Recommendations
              </h4>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 border-l-4 border-orange-500">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Problem:</span>
                      <p className="text-sm text-gray-300 mt-1">{recommendation.problem}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Solution:</span>
                      <p className="text-sm text-gray-300 mt-1">{recommendation.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ancienne structure - Problems & Solutions */}
          {hasOldStructure && (
            <>
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  Problems Identified
                </h4>
                <ul className="space-y-1">
                  {card.problems!.map((problem, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-red-500">
                      {problem}
                    </li>
                  ))}
                </ul>
              </div>

              {card.solutions && card.solutions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Recommended Solutions
                  </h4>
                  <ul className="space-y-1">
                    {card.solutions.map((solution, index) => (
                      <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-green-500">
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Données brutes (accordéon pour développeurs) */}
    </div>
  );
};