import React from 'react';
import { ImpactBadge } from './ImpactBadge';

/**
 * Composant de démonstration des nouveaux badges d'impact
 * Montre les 4 niveaux : Critical, High, Medium, Low
 */
export const ImpactBadgeDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Démonstration des Badges d'Impact</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Niveau CRITICAL (Sévérité = 10/10)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Priorité absolue - toujours affiché même si le score calculé est faible
          </p>
          <div className="flex gap-2">
            <ImpactBadge impact={10} sectionWeight={20} subsectionWeight={25} />
            <span className="text-sm text-muted-foreground">
              Ex: Robots.txt bloquant (Discoverability 20% × HTTPS 25% × Sévérité 10 = 50 points)
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Niveau HIGH (Score &gt; 70)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Problème majeur qui nuit fondamentalement à la compréhension par les LLMs
          </p>
          <div className="flex gap-2">
            <ImpactBadge impact={9} sectionWeight={25} subsectionWeight={40} />
            <span className="text-sm text-muted-foreground">
              Ex: JSON-LD manquant (Structured Data 25% × JSON-LD 40% × Sévérité 9 = 90 points) → HIGH
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Niveau MEDIUM (Score 30-70)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Problème qui dégrade la qualité de l'analyse ou manque une opportunité d'optimisation
          </p>
          <div className="flex gap-2">
            <ImpactBadge impact={7} sectionWeight={20} subsectionWeight={30} />
            <span className="text-sm text-muted-foreground">
              Ex: Sitemap manquant (Discoverability 20% × Sitemap 30% × Sévérité 7 = 42 points) → MEDIUM
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Niveau LOW (Score &lt; 30)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Optimisation mineure ou bonne pratique avec faible effet sur la compréhension
          </p>
          <div className="flex gap-2">
            <ImpactBadge impact={4} sectionWeight={15} subsectionWeight={25} />
            <span className="text-sm text-muted-foreground">
              Ex: Amélioration linguistique (Readability 15% × Linguistic 25% × Sévérité 4 = 15 points) → LOW
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Fallback (Sans poids)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Utilise l'ancienne logique si les poids ne sont pas disponibles
          </p>
          <div className="flex gap-2">
            <ImpactBadge impact={8} />
            <span className="text-sm text-muted-foreground">
              Ex: Sévérité 8/10 → HIGH (ancienne logique)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Formule de calcul :</h4>
        <p className="text-sm font-mono">
          Score d'Impact = Poids Section × (Poids Sous-section / 100) × Sévérité (1-10)
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Seuils ajustés :</strong> CRITICAL (sévérité 10) | HIGH (&gt;70) | MEDIUM (30-70) | LOW (&lt;30)
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>Score max possible :</strong> 100 points (Structured Data 25% × JSON-LD 40% × Sévérité 10)
        </p>
      </div>
    </div>
  );
};
