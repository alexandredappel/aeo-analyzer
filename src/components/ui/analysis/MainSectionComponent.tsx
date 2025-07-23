import React, { useState } from 'react';
import { MainSection, GlobalPenalty } from '@/types/analysis-architecture';
import { StatusIcon } from './StatusIcon';
import { DrawerSubSection } from './DrawerSubSection';

interface MainSectionComponentProps {
  section: MainSection;
  globalPenalties?: GlobalPenalty[];
  className?: string;
}

export const MainSectionComponent: React.FC<MainSectionComponentProps> = ({ 
  section, 
  globalPenalties = [], 
  className = '' 
}) => {
  // État d'expansion des tiroirs (par ID)
  const [expandedDrawers, setExpandedDrawers] = useState<Set<string>>(new Set());
  
  const toggleDrawer = (drawerId: string) => {
    setExpandedDrawers(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(drawerId)) {
        newExpanded.delete(drawerId);
      } else {
        newExpanded.add(drawerId);
      }
      return newExpanded;
    });
  };

  const scorePercentage = Math.round((section.totalScore / section.maxScore) * 100);
  
  // Filtrer les pénalités pertinentes pour cette section
  const relevantPenalties = globalPenalties.filter(penalty => 
    penalty.type === 'robots_txt_blocking' && section.id === 'discoverability'
  );

  return (
    <div className={`bg-gray-950 rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* En-tête de la section principale */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {/* Partie gauche - Emoji, titre et description */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="text-4xl" role="img" aria-label={section.name}>
              {section.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white truncate">{section.name}</h2>
                <StatusIcon status={section.status} size="lg" />
              </div>
              <p className="text-gray-300">{section.description}</p>
            </div>
          </div>

          {/* Partie droite - Score uniquement */}
          <div className="text-right ml-6">
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(section.totalScore)}<span className="text-lg text-gray-400">/{section.maxScore}</span>
            </div>
          </div>
        </div>

        {/* Alertes de pénalités globales */}
        {relevantPenalties.length > 0 && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl mt-0.5">⚠️</span>
              <div className="flex-1">
                <h4 className="text-red-400 font-semibold mb-2">Pénalités globales détectées</h4>
                {relevantPenalties.map((penalty, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <p className="text-red-300 text-sm">{penalty.description}</p>
                    <p className="text-red-400 text-xs">
                      Impact: -{Math.round(penalty.penaltyFactor * 100)}% du score final
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des tiroirs */}
      <div className="p-3">
        {section.drawers.length > 0 ? (
          <div className="space-y-4">
            {section.drawers.map((drawer) => (
              <DrawerSubSection
                key={drawer.id}
                drawer={drawer}
                isExpanded={expandedDrawers.has(drawer.id)}
                onToggle={() => toggleDrawer(drawer.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">{section.emoji}</div>
            <h3 className="text-xl font-semibold mb-2">Section en cours de développement</h3>
            <p>Les métriques pour {section.name} seront bientôt disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 