import React, { useState } from 'react';
import { MainSection, GlobalPenalty } from '@/types/analysis-architecture';
import { SubSectionAnalysis } from './SubSectionAnalysis';
import { 
  LiaSearchSolid, 
  LiaSitemapSolid, 
  LiaFileAltSolid, 
  LiaUniversalAccessSolid, 
  LiaBookReaderSolid 
} from 'react-icons/lia';
import { CircularScore } from '@/components/customized/progress/CircularScore';

interface MainSectionAnalysisProps {
  section: MainSection;
  globalPenalties?: GlobalPenalty[];
  className?: string;
}

export const MainSectionAnalysis: React.FC<MainSectionAnalysisProps> = ({ 
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

  const renderIcon = () => {
    const id = section.id?.toLowerCase();
    const name = section.name?.toLowerCase();
    if (id?.includes('discoverability') || name?.includes('discoverability')) return <LiaSearchSolid className="size-6" aria-hidden />;
    if (id?.includes('structured') || name?.includes('structured')) return <LiaSitemapSolid className="size-6" aria-hidden />;
    if (id?.includes('llm') || name?.includes('formatting')) return <LiaFileAltSolid className="size-6" aria-hidden />;
    if (id?.includes('access') || name?.includes('accessibility')) return <LiaUniversalAccessSolid className="size-6" aria-hidden />;
    if (id?.includes('readab') || name?.includes('readability')) return <LiaBookReaderSolid className="size-6" aria-hidden />;
    return <LiaFileAltSolid className="size-6" aria-hidden />;
  };

  const percent = Math.round((section.totalScore / section.maxScore) * 100);

  const getRingClasses = (p: number) => {
    if (p >= 70) return { base: 'stroke-emerald-500/25', progress: 'stroke-emerald-600' };
    if (p >= 50) return { base: 'stroke-amber-500/25', progress: 'stroke-amber-600' };
    return { base: 'stroke-red-500/25', progress: 'stroke-red-600' };
  };
  const ring = getRingClasses(percent);
  
  // Filtrer les pénalités pertinentes pour cette section
  const relevantPenalties = globalPenalties.filter(penalty => 
    penalty.type === 'robots_txt_blocking' && section.id === 'discoverability'
  );

  return (
    <div className={`bg-card text-card-foreground rounded-[var(--radius)] overflow-hidden ${className}`}>
      {/* En-tête de la section principale */}
      <div className="px-0 py-6 bg-card">
        {/* Ligne 1: 3 colonnes (icône | H2 | score) */}
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] items-center gap-x-3 md:gap-x-4">
          {/* Col 1 - Icône */}
          <div className="hidden md:flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            {renderIcon()}
          </div>

          {/* Col 2 - H2 + question */}
          <div className="min-w-0">
            <h2 className="text-balance text-3xl md:text-4xl lg:text-5xl font-semibold">
              {section.name}
            </h2>
            <p className="text-foreground mt-1 md:mt-2">{section.description}</p>
          </div>

          {/* Col 3 - Score (circular) */}
          <div className="text-right ml-4 md:ml-6">
            <CircularScore 
              value={percent}
              size={84}
              className={ring.base}
              progressClassName={ring.progress}
              showLabel
              labelClassName={`font-bold ${percent >= 70 ? 'text-emerald-600' : percent >= 50 ? 'text-amber-600' : 'text-red-600'}`}
              renderLabel={(v) => Math.round(v)}
            />
          </div>
        </div>

        {/* Ligne 2 supprimée: question intégrée sous le H2 dans la colonne centrale */}

        {/* Alertes de pénalités globales */}
        {relevantPenalties.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl mt-0.5" aria-hidden>!</span>
              <div className="flex-1">
                <h4 className="text-red-700 font-semibold mb-2">Pénalités globales détectées</h4>
                {relevantPenalties.map((penalty, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <p className="text-red-700 text-sm">{penalty.description}</p>
                    <p className="text-red-600 text-xs">
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
      <div className="py-3 px-0">
        {section.drawers.length > 0 ? (
          <div className="space-y-4">
            {section.drawers.map((drawer) => (
              <SubSectionAnalysis
                key={drawer.id}
                drawer={drawer}
                isExpanded={expandedDrawers.has(drawer.id)}
                onToggle={() => toggleDrawer(drawer.id)}
                isAiLabs={drawer.id === 'llm-instructions'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-xl font-semibold mb-2">Section en cours de développement</h3>
            <p>Les métriques pour {section.name} seront bientôt disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
};


