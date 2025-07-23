import React from 'react';
import { MetricCard as MetricCardType } from '@/types/analysis-architecture';
import { StatusIcon } from './StatusIcon';

interface MetricCardProps {
  card: MetricCardType;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ card, className = '' }) => {
  const scorePercentage = Math.round((card.score / card.maxScore) * 100);
  
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 transition-all duration-200 hover:border-gray-600 hover:shadow-lg ${className}`}>
      {/* En-tête avec titre et score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StatusIcon status={card.status} size="md" />
          <h3 className="text-lg font-semibold text-white">{card.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {card.score}<span className="text-sm text-gray-400">/{card.maxScore}</span>
          </div>
          <div className="text-sm text-gray-400">{scorePercentage}%</div>
        </div>
      </div>

      {/* Explication */}
      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed">{card.explanation}</p>
      </div>

      {/* Conditional display logic */}
      {card.problems.length === 0 ? (
        <div className="flex items-center text-green-400 text-sm">
          <span className="mr-2">✅</span>
          <span>{card.successMessage}</span>
        </div>
      ) : (
        <>
          {/* Problems section */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Problems Identified
            </h4>
            <ul className="space-y-1">
              {card.problems.map((problem, index) => (
                <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-red-500">
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions section */}
          {card.solutions.length > 0 && (
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

      {/* Données brutes (accordéon pour développeurs) */}
      {card.rawData && Object.keys(card.rawData).length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 select-none">
            Données techniques
          </summary>
          <pre className="mt-2 text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-x-auto">
            {JSON.stringify(card.rawData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}; 