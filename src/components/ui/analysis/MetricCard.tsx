import React from 'react';
import { MetricCard as MetricCardType } from '@/types/analysis-architecture';
import { StatusIcon } from './StatusIcon';
import { ImpactBadge } from './ImpactBadge';
import { getSectionWeight, getSubsectionWeight } from '@/lib/impact-weights';

interface MetricCardProps {
  card: MetricCardType;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ card, className = '' }) => {
  // Protection et conversion des structures de données
  const recommendations = card.recommendations || [];
  const hasOldStructure = card.problems && card.problems.length > 0;
  const hasNewStructure = recommendations.length > 0;
  const hasProblems = hasOldStructure || hasNewStructure;

  // Fonction pour déterminer la section principale basée sur l'ID de la carte
  const getMainSection = (cardId: string): string => {
    if (cardId.includes('discoverability') || cardId.includes('https') || cardId.includes('robots') || cardId.includes('sitemap')) {
      return 'discoverability';
    }
    if (cardId.includes('structured') || cardId.includes('json') || cardId.includes('meta') || cardId.includes('social')) {
      return 'structuredData';
    }
    if (cardId.includes('llm') || cardId.includes('formatting') || cardId.includes('hierarchy') || cardId.includes('semantics')) {
      return 'llmFormatting';
    }
    if (cardId.includes('accessibility') || cardId.includes('wcag') || cardId.includes('navigational')) {
      return 'accessibility';
    }
    if (cardId.includes('readability') || cardId.includes('text') || cardId.includes('content') || cardId.includes('linguistic')) {
      return 'readability';
    }
    return 'discoverability'; // fallback
  };

  const mainSection = getMainSection(card.id);
  const sectionWeight = getSectionWeight(mainSection);

  return (
    <div className={`bg-card rounded-lg border border-primary/15 ${className}`}>
      {/* En-tête (titre + sous-texte) */}
      <div className="bg-primary/15 rounded-t-lg px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <StatusIcon status={card.status} size="lg" />
            <h3 className="text-base md:text-lg font-semibold truncate">{card.name}</h3>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-foreground whitespace-normal break-words">{card.explanation}</p>
        </div>
      </div>

      {/* Contenu (fond blanc) */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* Conditional display logic */}
        {!hasProblems ? (
          <div className="text-sm text-foreground">
            <span>{card.successMessage}</span>
          </div>
        ) : (
          <>
            {/* Nouvelle structure - inline Problem/Solution + séparateurs */}
            {hasNewStructure && (
              <div>
                {recommendations.map((recommendation, index) => {
                  const subsectionWeight = getSubsectionWeight(card.id);
                  
                  return (
                    <div key={index} className="py-2">
                      {typeof recommendation.impact === 'number' && (
                        <div className="mb-3 block md:hidden">
                          <ImpactBadge 
                            impact={recommendation.impact}
                            sectionWeight={sectionWeight || undefined}
                            subsectionWeight={subsectionWeight || undefined}
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3 mb-2 md:mb-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold uppercase">Problem:</span> {recommendation.problem}
                        </p>
                        {typeof recommendation.impact === 'number' && (
                          <div className="hidden md:block">
                            <ImpactBadge 
                              impact={recommendation.impact}
                              sectionWeight={sectionWeight || undefined}
                              subsectionWeight={subsectionWeight || undefined}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-2">
                        <span className="font-semibold uppercase">Solution:</span> {recommendation.solution}
                      </p>
                      {recommendation.explanation && (
                        <p className="text-sm text-foreground mt-2">
                          <span className="font-semibold uppercase">Explanations:</span> {recommendation.explanation}
                        </p>
                      )}
                      {index < recommendations.length - 1 && (
                        <div className="border-t border-primary/15 my-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ancienne structure - Problems & Solutions */}
            {hasOldStructure && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Problems Identified</h4>
                  <ul className="space-y-2">
                    {card.problems!.map((problem, index) => (
                      <li key={index} className="text-sm text-foreground">
                        <span className="font-semibold uppercase">Problem:</span> {problem}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-primary/15 my-4" />

                {card.solutions && card.solutions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Recommended Solutions</h4>
                    <ul className="space-y-2">
                      {card.solutions.map((solution, index) => (
                        <li key={index} className="text-sm text-foreground">
                          <span className="font-semibold uppercase">Solution:</span> {solution}
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
    </div>
  );
};