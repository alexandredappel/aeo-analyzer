/**
 * ARCHITECTURE D'ANALYSE AEO - PHASE 1: INTERFACES FONDAMENTALES
 * 
 * Architecture hiérarchique: Section → Drawers → Cards
 * Structure: 🔍 MAIN SECTION (XX%) → ✅ Sub-Section (Drawer) → Metric (XX pts)
 */

/**
 * Statuts de performance avec codes couleur
 */
export type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'error';

/**
 * Mapping des couleurs pour chaque statut
 */
export const STATUS_COLORS: Record<PerformanceStatus, string> = {
  excellent: 'green',
  good: 'blue', 
  warning: 'orange',
  error: 'red'
} as const;

/**
 * Carte métrique individuelle - Élément de base de l'architecture
 * Contient les informations détaillées et le contenu éducatif
 */
export interface MetricCard {
  /** Identifiant unique de la métrique */
  id: string;
  
  /** Nom affiché de la métrique */
  name: string;
  
  /** Score obtenu pour cette métrique (en points) */
  score: number;
  
  /** Score maximum possible pour cette métrique */
  maxScore: number;
  
  /** Statut de performance avec code couleur */
  status: PerformanceStatus;
  
  /** Explication détaillée de la métrique et de son importance */
  explanation: string;
  
  /** Liste des problèmes identifiés (vide si aucun problème) */
  problems: string[];
  
  /** Liste des solutions recommandées */
  solutions: string[];
  
  /** Message de succès personnalisé affiché quand aucun problème */
  successMessage: string;
  
  /** Données techniques brutes (optionnel) */
  rawData?: Record<string, any>;
}

/**
 * Section tiroir extensible - Contient plusieurs cartes métriques
 * Représente une sous-catégorie d'analyse
 */
export interface DrawerSubSection {
  /** Identifiant unique du tiroir */
  id: string;
  
  /** Nom affiché du tiroir */
  name: string;
  
  /** Description courte de la sous-section */
  description: string;
  
  /** Score total du tiroir (somme des cartes) */
  totalScore: number;
  
  /** Score maximum possible pour ce tiroir */
  maxScore: number;
  
  /** Statut global du tiroir (basé sur la moyenne des cartes) */
  status: PerformanceStatus;
  
  /** Liste des cartes métriques contenues */
  cards: MetricCard[];
  
  /** État d'expansion du tiroir (pour l'UI) */
  isExpanded?: boolean;
}

/**
 * Section principale - Contient plusieurs tiroirs
 * Représente une catégorie majeure d'analyse AEO
 */
export interface MainSection {
  /** Identifiant unique de la section */
  id: string;
  
  /** Nom affiché de la section */
  name: string;
  
  /** Emoji représentatif de la section */
  emoji: string;
  
  /** Description de la section */
  description: string;
  
  /** Pourcentage de poids dans le score final */
  weightPercentage: number;
  
  /** Score total de la section */
  totalScore: number;
  
  /** Score maximum possible pour cette section */
  maxScore: number;
  
  /** Statut global de la section */
  status: PerformanceStatus;
  
  /** Liste des tiroirs (sous-sections) */
  drawers: DrawerSubSection[];
}

/**
 * Pénalité globale - Système de pénalités affectant le score final
 * Principalement pour robots.txt bloquant les bots IA
 */
export interface GlobalPenalty {
  /** Type de pénalité */
  type: 'robots_txt_blocking' | 'other';
  
  /** Description de la pénalité */
  description: string;
  
  /** Facteur de pénalité (0.0 = aucune pénalité, 0.7 = 70% de pénalité max) */
  penaltyFactor: number;
  
  /** Détails techniques de la pénalité */
  details: string[];
  
  /** Solutions pour corriger la pénalité */
  solutions: string[];
}

/**
 * Résultat final de l'analyse AEO
 * Contient toutes les sections et le calcul du score global
 */
export interface AEOScoreResult {
  /** URL analysée */
  url: string;
  
  /** Timestamp de l'analyse */
  analyzedAt: Date;
  
  /** Version de l'analyseur utilisé */
  analyzerVersion: string;
  
  /** Score brut total (avant pénalités) */
  rawScore: number;
  
  /** Score final (après application des pénalités) */
  finalScore: number;
  
  /** Score maximum possible */
  maxPossibleScore: number;
  
  /** Pourcentage final (0-100) */
  scorePercentage: number;
  
  /** Statut global de l'analyse */
  overallStatus: PerformanceStatus;
  
  /** Les 5 sections principales d'analyse */
  sections: {
    /** Découvrabilité (20%) - Visibilité par les moteurs de recherche et IA */
    discoverability: MainSection;
    
    /** Données structurées (25%) - Schema.org, JSON-LD, métadonnées */
    structuredData: MainSection;
    
    /** Formatage LLM (25%) - Optimisation pour les modèles de langage */
    llmFormatting: MainSection;
    
    /** Accessibilité (15%) - Standards WCAG et utilisabilité */
    accessibility: MainSection;
    
    /** Lisibilité (15%) - Clarté et structure du contenu */
    readability: MainSection;
  };
  
  /** Pénalités globales appliquées */
  globalPenalties: GlobalPenalty[];
  
  /** Résumé exécutif de l'analyse */
  executiveSummary: {
    /** Points forts identifiés */
    strengths: string[];
    
    /** Problèmes critiques à corriger en priorité */
    criticalIssues: string[];
    
    /** Recommandations d'amélioration */
    recommendations: string[];
  };
}

/**
 * Configuration des sections avec leurs poids
 */
export const SECTION_WEIGHTS: Record<keyof AEOScoreResult['sections'], number> = {
  discoverability: 20,
  structuredData: 25,
  llmFormatting: 25,
  accessibility: 15,
  readability: 15
} as const;

/**
 * Constantes pour les seuils de performance
 */
export const PERFORMANCE_THRESHOLDS = {
  excellent: 90, // 90-100%
  good: 70,      // 70-89%
  warning: 50,   // 50-69%
  error: 0       // 0-49%
} as const;

/**
 * Helper type pour la validation des pourcentages de poids
 */
type SectionWeightsSum = typeof SECTION_WEIGHTS[keyof typeof SECTION_WEIGHTS];
// Vérification que la somme des poids = 100%
const _weightsValidation: 100 = (
  SECTION_WEIGHTS.discoverability +
  SECTION_WEIGHTS.structuredData +
  SECTION_WEIGHTS.llmFormatting +
  SECTION_WEIGHTS.accessibility +
  SECTION_WEIGHTS.readability
) as 100; 