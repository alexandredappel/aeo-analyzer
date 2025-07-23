/**
 * COMPOSANTS D'ANALYSE AEO - PHASE 1
 * 
 * Composants React pour l'architecture hiérarchique de l'AEO Auditor
 * Structure: Section → Drawers → Cards
 */

// Composants de base
export { StatusIcon } from './StatusIcon';
export { MetricCard } from './MetricCard';
export { DrawerSubSection } from './DrawerSubSection';
export { MainSectionComponent } from './MainSectionComponent';

// Types réexportés pour faciliter l'utilisation
export type {
  PerformanceStatus,
  MetricCard as MetricCardType,
  DrawerSubSection as DrawerSubSectionType,
  MainSection,
  GlobalPenalty,
  AEOScoreResult
} from '@/types/analysis-architecture'; 