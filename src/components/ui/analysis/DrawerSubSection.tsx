import React from 'react';
import { DrawerSubSection as DrawerSubSectionType } from '@/types/analysis-architecture';
import { StatusIcon } from './StatusIcon';
import { MetricCard } from './MetricCard';

interface DrawerSubSectionProps {
  drawer: DrawerSubSectionType;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export const DrawerSubSection: React.FC<DrawerSubSectionProps> = ({ 
  drawer, 
  isExpanded, 
  onToggle, 
  className = '' 
}) => {
  const scorePercentage = Math.round((drawer.totalScore / drawer.maxScore) * 100);
  
  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header cliquable */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls={`drawer-content-${drawer.id}`}
      >
        {/* Partie gauche - Statut et nom */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <StatusIcon status={drawer.status} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white truncate">{drawer.name}</h3>
            <p className="text-sm text-gray-400 truncate">{drawer.description}</p>
          </div>
        </div>

        {/* Partie droite - Indicateur d'expansion uniquement */}
        <div className="flex items-center gap-4 ml-4">
          {/* Icône d'expansion */}
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Contenu extensible */}
      <div
        id={`drawer-content-${drawer.id}`}
        className={`transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
        style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
      >
        <div className="px-3 pb-3">
          {/* Séparateur */}
          <div className="border-t border-gray-700 mb-6"></div>
          
          {/* Section "What's perfect" */}
          {drawer.perfectItems && drawer.perfectItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <span>✨</span>
                What's Perfect
              </h4>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <ul className="space-y-2">
                  {drawer.perfectItems.map((item, index) => (
                    <li key={index} className="text-sm text-green-300 flex items-start gap-2">
                      <span className="text-green-400 text-xs mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Cartes métriques empilées verticalement */}
          {drawer.cards.length > 0 ? (
            <div className="space-y-2">
              {drawer.cards.map((card) => (
                <MetricCard 
                  key={card.id} 
                  card={card}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Aucune métrique disponible pour cette section</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 