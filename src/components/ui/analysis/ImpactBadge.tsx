import React from 'react';
import { Badge } from '../badge';
import { cn } from '@/lib/utils';

interface ImpactBadgeProps {
  impact?: number | null;
  sectionWeight?: number;
  subsectionWeight?: number;
  className?: string;
}

function calculateImpactScore(
  sectionWeight: number,
  subsectionWeight: number,
  severityImpact: number
): number {
  return sectionWeight * (subsectionWeight / 100) * severityImpact;
}

function getImpactLevel(severityImpact: number, calculatedScore: number | null): 'critical' | 'high' | 'medium' | 'low' {
  // CRITICAL : Sévérité = 10/10 (priorité absolue)
  if (severityImpact === 10) return 'critical';
  
  // Si on a un score calculé, utiliser les nouveaux seuils ajustés
  if (calculatedScore !== null) {
    if (calculatedScore > 70) return 'high';
    if (calculatedScore >= 30) return 'medium';
    return 'low';
  }
  
  // Fallback sur l'ancienne logique si pas de poids
  if (severityImpact >= 7) return 'high';
  if (severityImpact >= 4) return 'medium';
  return 'low';
}

export const ImpactBadge: React.FC<ImpactBadgeProps> = ({ 
  impact, 
  sectionWeight, 
  subsectionWeight, 
  className 
}) => {
  if (impact == null || Number.isNaN(impact)) return null;

  const value = Math.max(1, Math.min(10, Math.round(impact)));
  
  // Calculer le score d'impact si on a les poids
  let calculatedScore: number | null = null;
  if (sectionWeight && subsectionWeight) {
    calculatedScore = calculateImpactScore(sectionWeight, subsectionWeight, value);
  }
  
  const level = getImpactLevel(value, calculatedScore);

  const styles: Record<typeof level, string> = {
    critical: 'bg-red-600/20 text-red-800 border-red-600/30 font-bold',
    high: 'bg-red-500/15 text-red-700 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
    low: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
  } as const;

  const label: Record<typeof level, string> = {
    critical: 'Critical',
    high: 'High impact',
    medium: 'Medium impact',
    low: 'Low impact',
  } as const;

  return (
    <Badge variant="outline" className={cn('px-2 py-0.5', styles[level], className)}>
      {label[level]}
    </Badge>
  );
};


