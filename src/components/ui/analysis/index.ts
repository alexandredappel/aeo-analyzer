/**
 * COMPOSANTS D'ANALYSE AEO - PHASE 1
 * 
 * Composants React pour l'architecture hiérarchique de l'AEO Auditor
 * Structure: Section → Drawers → Cards
 */

// Composants d'analyse
export { SubSectionAnalysis } from './SubSectionAnalysis';
export { MainSectionAnalysis } from './MainSectionAnalysis';
export { ImpactBadge } from './ImpactBadge';
export { ImpactBadgeDemo } from './ImpactBadgeDemo';

// Types réexportés pour faciliter l'utilisation
export type {
  MainSection,
  DrawerSubSection,
  MetricCard,
  Recommendation,
  PerformanceStatus
} from '@/types/analysis-architecture';