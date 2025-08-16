import React from 'react';
import { DrawerSubSection as DrawerSubSectionType, PerformanceStatus } from '@/types/analysis-architecture';
import { StatusIcon } from './StatusIcon';
import { MetricCard } from './MetricCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { LiaFlaskSolid } from 'react-icons/lia';

interface SubSectionAnalysisProps {
  drawer: DrawerSubSectionType;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  /** Variante AI Labs: n'influe pas sur le score global, affiche un badge explicatif */
  isAiLabs?: boolean;
}

export const SubSectionAnalysis: React.FC<SubSectionAnalysisProps> = ({ 
  drawer, 
  isExpanded, 
  onToggle, 
  className = '',
  isAiLabs = false
}) => {
  const getStatusTintClass = (status: PerformanceStatus) => {
    if (status === 'excellent' || status === 'good') return 'bg-emerald-500/30';
    if (status === 'warning') return 'bg-amber-500/30';
    return 'bg-red-500/30';
  };
  const headerTint = getStatusTintClass(drawer.status);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={`bg-card text-card-foreground rounded-[var(--radius)] overflow-hidden transition-all duration-300 ${className}`}>
        {/* Header cliquable */}
        <CollapsibleTrigger asChild>
          <button
            className={`w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left transition-colors duration-200 focus:outline-none ${headerTint}`}
            aria-expanded={isExpanded}
            aria-controls={`drawer-content-${drawer.id}`}
          >
            {/* Partie gauche - Statut et nom */}
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <StatusIcon status={drawer.status} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold truncate">{drawer.name}</h3>
                <p className="text-sm text-foreground whitespace-normal break-words">{drawer.description}</p>
                {isAiLabs && (
                  <div className="mt-1 md:mt-1.5 flex items-center gap-2 flex-wrap" aria-label="AI Labs notice">
                    <Badge className="border bg-violet-600/20 text-violet-700 border-violet-700">
                      <LiaFlaskSolid className="size-3.5" aria-hidden />
                      AI Labs - Not included in global score
                    </Badge>
                    <span className="text-xs text-violet-700">
                      Get ahead in AI indexing — this practice isn’t official yet but is likely to be adopted by major AI systems.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Partie droite - Indicateur d'expansion uniquement */}
            <div className="flex items-center gap-4 ml-4">
              {/* Icône d'expansion */}
              <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Contenu repliable */}
        <CollapsibleContent id={`drawer-content-${drawer.id}`}>
          <div className="bg-card">
            {/* Séparateur */}
            <div className="border-t border-border mb-4 md:mb-6" />

            {/* Cartes métriques empilées verticalement */}
            {drawer.cards.length > 0 ? (
              <div className="space-y-4">
                {drawer.cards.map((card) => (
                  <MetricCard 
                    key={card.id} 
                    card={card}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune métrique disponible pour cette section</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}; 


