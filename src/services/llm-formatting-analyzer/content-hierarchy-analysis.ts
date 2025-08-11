/**
 * CONTENT HIERARCHY ANALYSIS - LLM FORMATTING ANALYZER
 * 
 * Analyse la hiérarchie du contenu pour optimiser la compréhension par les LLMs
 * 
 * Objectif : Évaluer l'organisation logique et sémantique de l'information
 * - Structure des titres (35 points) : Unicité H1 + Séquentialité
 * - Groupement des données (15 points) : Utilisation des balises sémantiques
 * 
 * Total : 50 points
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';

/**
 * Knowledge Base pour les problèmes et solutions de Content Hierarchy
 * (Heading Structure uniquement - Data Grouping utilise maintenant l'architecture moderne)
 */
const CONTENT_HIERARCHY_KNOWLEDGE_BASE = {
  // Structure des Titres (Heading Structure)
  noH1Found: {
    problem: "No H1 tag was found on this page.",
    solution: "Add a single, unique <h1> tag that represents the main, descriptive title of your page.",
    explanation: "The unique <h1> is the strongest signal for an AI about the page's main topic. Its absence forces the AI to 'guess' the theme, which can seriously harm its ability to classify and summarize your content.",
    impact: 10
  },
  multipleH1Found: {
    problem: (count: number, texts: string[]) => `Multiple H1 tags (total: ${count}) were found, creating confusion about the main topic. Found H1 texts: "${texts.join('", "')}"`,
    solution: "Keep only the most relevant <h1> tag as the unique main title and convert the others to <h2> tags or a lower level.",
    explanation: "Having multiple <h1> tags sends conflicting signals to an AI about the page's primary subject, which can lead to an incorrect synthesis of the information.",
    impact: 10
  },
  headingSequenceBreak: {
    problem: (parentTag: string, childTag: string) => `The heading hierarchy is not sequential. A <${parentTag}> tag is directly followed by a <${childTag}> tag, where an intermediate level is expected.`,
    solution: "Reorganize your heading structure to follow a logical progression (an H2 can only be followed by another H2 or an H3).",
    explanation: "A logical hierarchy allows an AI to understand your tree of ideas. A sequence break disrupts this understanding and prevents it from correctly linking a sub-topic to its main theme.",
    impact: 8
  }
};

/**
 * Analyse la structure des titres (35 points)
 * - Unicité du H1 (15 points)
 * - Séquentialité des titres (20 points)
 */
export function analyzeHeadingStructure($: cheerio.CheerioAPI): MetricCard {
  let score = 0;
  const recommendations: Recommendation[] = [];
  
  // NOUVELLE APPROCHE: Parcours séquentiel du DOM
  const headings: Array<{ level: number; text: string; tag: string; position: number }> = [];
  let position = 0;

  // Parcourir TOUS les headings dans l'ordre DOM
  $('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const $element = $(element);
    const tagName = element.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1));
    
    headings.push({
      level,
      text: $element.text().trim(),
      tag: tagName,
      position: position++
    });
  });
  
  // 1. Vérification de l'unicité du H1 (15 points)
  const h1Elements = headings.filter(h => h.level === 1);
  
  if (h1Elements.length === 0) {
    // Aucun H1 trouvé
    recommendations.push({
      problem: CONTENT_HIERARCHY_KNOWLEDGE_BASE.noH1Found.problem,
      solution: CONTENT_HIERARCHY_KNOWLEDGE_BASE.noH1Found.solution,
      impact: CONTENT_HIERARCHY_KNOWLEDGE_BASE.noH1Found.impact
    });
  } else if (h1Elements.length > 1) {
    // Plusieurs H1 trouvés
    const h1Texts = h1Elements.map(h => h.text);
    recommendations.push({
      problem: CONTENT_HIERARCHY_KNOWLEDGE_BASE.multipleH1Found.problem(h1Elements.length, h1Texts),
      solution: CONTENT_HIERARCHY_KNOWLEDGE_BASE.multipleH1Found.solution,
      impact: CONTENT_HIERARCHY_KNOWLEDGE_BASE.multipleH1Found.impact
    });
  } else {
    // Exactement un H1 - 15 points
    score += 15;
  }
  
  // 2. Vérification de la séquentialité des titres (20 points)
  let sequenceScore = 20;
  
  // Les headings sont déjà dans l'ordre DOM
  for (let i = 0; i < headings.length - 1; i++) {
    const current = headings[i];
    const next = headings[i + 1];
    
    // Vérifier s'il y a un saut de niveau (ex: H2 → H4)
    if (next.level > current.level + 1) {
      sequenceScore -= 5;
      recommendations.push({
        problem: CONTENT_HIERARCHY_KNOWLEDGE_BASE.headingSequenceBreak.problem(current.tag, next.tag),
        solution: CONTENT_HIERARCHY_KNOWLEDGE_BASE.headingSequenceBreak.solution,
        impact: CONTENT_HIERARCHY_KNOWLEDGE_BASE.headingSequenceBreak.impact
      });
    }
  }
  
  score += Math.max(0, sequenceScore);
  
  return {
    id: 'heading-structure-analysis',
    name: 'Heading Structure',
    score,
    maxScore: 35,
    status: score >= 30 ? 'excellent' : score >= 20 ? 'good' : score >= 10 ? 'warning' : 'error',
    explanation: 'Analyzes the logical hierarchy of headings (H1-H6) to ensure proper content structure for AI understanding. A clear heading hierarchy is essential for LLMs to build an accurate knowledge tree of your content.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: 'Excellent! Your heading structure provides clear content hierarchy for AI comprehension.',
    rawData: {
      totalHeadings: headings.length,
      h1Count: h1Elements.length,
      headingLevels: headings.map(h => ({ level: h.level, text: h.text })),
      sequenceScore,
      uniquenessScore: h1Elements.length === 1 ? 15 : 0,
      // DEBUG: Ordre des headings pour validation
      domOrder: headings.map(h => ({ level: h.level, text: h.text.substring(0, 30), position: h.position }))
    }
  };
}

/**
 * Analyse le groupement des données (15 points)
 * Détecte les listes et tableaux simulés avec du texte brut
 */
/**
 * Types pour l'analyse Data Grouping moderne
 */
interface SimulatedStructure {
  type: 'list' | 'table';
  confidence: number;
  sample: string;
  itemCount: number;
}

interface DataGroupingMetrics {
  totalListStructures: number;
  semanticLists: number;
  simulatedLists: number;
  totalTableStructures: number;
  semanticTables: number;
  simulatedTables: number;
}

/**
 * Détecte les structures simulées avec validation contextuelle STRICTE
 */
function detectSimulatedStructures($: cheerio.CheerioAPI): SimulatedStructure[] {
  const structures: SimulatedStructure[] = [];
  
  // Analyser paragraphes et divs sans contenu sémantique
  $('p, div').each((_, element) => {
    const $el = $(element);
    
    // Skip si contient déjà du HTML sémantique
    if ($el.find('ul, ol, table').length > 0) return;
    
    const text = $el.text().trim();
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // VALIDATION: Au moins 2 lignes pour être une structure
    if (lines.length >= 2) {
      // Détecter listes simulées avec VALIDATION STRICTE
      const listStructure = detectSimulatedList(lines, $el);
      if (listStructure) structures.push(listStructure);
      
      // Détecter tableaux simulés avec VALIDATION STRICTE
      const tableStructure = detectSimulatedTable(lines, $el);
      if (tableStructure) structures.push(tableStructure);
    }
  });
  
  return structures;
}

/**
 * Détecte les listes simulées avec validation contextuelle STRICTE
 */
function detectSimulatedList(lines: string[], $el: cheerio.Cheerio<any>): SimulatedStructure | null {
  const listPatterns = [
    /^\s*[•▪▫▸▹►‣⁃]\s+\w/,           // Unicode bullets + word
    /^\s*[\*\-+]\s+\w{2,}/,           // -, *, + followed by 2+ chars
    /^\s*\d+[\.\)]\s+\w{2,}/,         // 1. or 1) followed by 2+ chars
    /^\s*[a-zA-Z][\.\)]\s+\w{2,}/,    // a. or a) followed by 2+ chars
    /^\s*[ivxlcdm]+[\.\)]\s+\w{2,}/i  // Roman numerals
  ];
  
  const matchingLines = lines.filter(line => 
    listPatterns.some(pattern => pattern.test(line)) &&
    line.length > 10 // VALIDATION: Éviter faux positifs sur texte court
  );
  
  // VALIDATION STRICTE: Au moins 2 lignes ET 50% du contenu
  if (matchingLines.length >= 2 && matchingLines.length / lines.length >= 0.5) {
    return {
      type: 'list',
      confidence: matchingLines.length / lines.length,
      sample: matchingLines[0].substring(0, 50),
      itemCount: matchingLines.length
    };
  }
  
  return null;
}

/**
 * Détecte les tableaux simulés avec validation contextuelle STRICTE
 */
function detectSimulatedTable(lines: string[], $el: cheerio.Cheerio<any>): SimulatedStructure | null {
  const tablePatterns = [
    /\|\s*\w+\s*\|\s*\w+\s*\|/,     // |col1|col2| with multiple columns
    /\w+\s{4,}\w+\s{4,}\w+/,        // Multiple columns with 4+ spaces
    /\w+\t+\w+\t+\w+/               // Tab-separated columns (3+ columns)
  ];
  
  const matchingLines = lines.filter(line => {
    // Test each pattern
    for (const pattern of tablePatterns) {
      if (pattern.test(line)) {
        // VALIDATION SUPPLÉMENTAIRE: Vérifier nombre de colonnes
        let columnCount = 0;
        if (line.includes('|')) {
          columnCount = line.split('|').filter(cell => cell.trim()).length;
        } else if (line.includes('\t')) {
          columnCount = line.split('\t').filter(cell => cell.trim()).length;
        } else {
          // Pour les espaces, compter les groupes de mots séparés par 4+ espaces
          columnCount = line.split(/\s{4,}/).filter(cell => cell.trim()).length;
        }
        
        // VALIDATION: Au moins 2 colonnes
        return columnCount >= 2;
      }
    }
    return false;
  });
  
  // VALIDATION STRICTE: Au moins 2 lignes avec structure tabulaire
  if (matchingLines.length >= 2) {
    return {
      type: 'table',
      confidence: matchingLines.length / lines.length,
      sample: matchingLines[0].substring(0, 50),
      itemCount: matchingLines.length
    };
  }
  
  return null;
}

/**
 * Calcule le score progressif basé sur les métriques
 */
function calculateProgressiveScore(metrics: DataGroupingMetrics): number {
  let score = 15;
  
  // Pénalité pour les structures simulées
  const simulatedListPenalty = metrics.simulatedLists * 3; // 3 points par liste simulée
  const simulatedTablePenalty = metrics.simulatedTables * 3; // 3 points par tableau simulé
  
  score -= simulatedListPenalty + simulatedTablePenalty;
  
  // Bonus pour les structures sémantiques (max 2 points)
  const semanticBonus = Math.min(2, (metrics.semanticLists + metrics.semanticTables) * 0.5);
  score += semanticBonus;
  
  return Math.max(0, Math.round(score));
}

/**
 * Calcule le ratio sémantique
 */
function calculateSemanticRatio(metrics: DataGroupingMetrics): number {
  const totalStructures = metrics.totalListStructures + metrics.totalTableStructures;
  if (totalStructures === 0) return 1; // Aucune structure = parfait
  
  const semanticStructures = metrics.semanticLists + metrics.semanticTables;
  return semanticStructures / totalStructures;
}

/**
 * Génère le message de succès dynamique
 */
function generateSuccessMessage(metrics: DataGroupingMetrics): string {
  const semanticRatio = calculateSemanticRatio(metrics);
  
  if (semanticRatio === 1) {
    return "Perfect! All data structures use semantic HTML tags for optimal AI comprehension.";
  } else if (semanticRatio >= 0.8) {
    return "Excellent! Most data structures use semantic HTML tags, with only minor improvements possible.";
  } else if (semanticRatio >= 0.6) {
    return "Good! Many data structures use semantic HTML tags, but some could be improved.";
  } else {
    return "Fair! Some data structures use semantic HTML tags, but significant improvements are needed.";
  }
}

/**
 * Analyse le groupement des données avec architecture moderne (15 points)
 * Utilise des recommendations dynamiques contextuelles comme Heading Structure
 */
export function analyzeDataGrouping($: cheerio.CheerioAPI): MetricCard {
  // 1. Compter structures sémantiques existantes
  const semanticLists = $('ul, ol').length;
  const semanticTables = $('table').length;
  
  // 2. Détecter structures simulées avec contexte
  const simulatedStructures = detectSimulatedStructures($);
  
  // 3. Calculer métriques
  const metrics: DataGroupingMetrics = {
    totalListStructures: semanticLists + simulatedStructures.filter(s => s.type === 'list').length,
    semanticLists,
    simulatedLists: simulatedStructures.filter(s => s.type === 'list').length,
    totalTableStructures: semanticTables + simulatedStructures.filter(s => s.type === 'table').length,
    semanticTables,
    simulatedTables: simulatedStructures.filter(s => s.type === 'table').length
  };
  
  // 4. Scoring progressif
  const score = calculateProgressiveScore(metrics);
  
  // 5. Générer recommendations DYNAMIQUES
  const recommendations: Recommendation[] = simulatedStructures.map(structure => {
    const confidenceLevel = structure.confidence > 0.8 ? 'highly likely' : 'possible';
    const tagSuggestion = structure.type === 'list' ? '<ul> or <ol>' : '<table>';
    
    return {
      problem: `Found ${confidenceLevel} simulated ${structure.type} structure (${structure.itemCount} items): "${structure.sample}..."`,
      solution: `Consider using semantic ${tagSuggestion} tags to properly structure this ${structure.type}.`,
      impact: Math.round(structure.confidence * 6) // 1-6 based on confidence
    };
  });
  
  // 6. Success message dynamique
  const successMessage = generateSuccessMessage(metrics);
  
  return {
    id: 'data-grouping-analysis',
    name: 'Data Grouping Semantics',
    score,
    maxScore: 15,
    status: score >= 13 ? 'excellent' : score >= 10 ? 'good' : score >= 7 ? 'warning' : 'error',
    explanation: 'Evaluates the use of semantic HTML tags for grouping related data. Proper use of <ul>, <ol>, and <table> tags helps AI understand data relationships and groupings.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: recommendations.length === 0 ? successMessage : "",
    rawData: {
      // Nouvelles métriques du refactoring
      totalListStructures: metrics.totalListStructures,
      semanticLists: metrics.semanticLists,
      simulatedLists: metrics.simulatedLists,
      totalTableStructures: metrics.totalTableStructures,
      semanticTables: metrics.semanticTables,
      simulatedTables: metrics.simulatedTables,
      simulatedStructures: simulatedStructures.map(s => ({
        type: s.type,
        confidence: s.confidence,
        sample: s.sample,
        itemCount: s.itemCount
      })),
      semanticRatio: calculateSemanticRatio(metrics)
    }
  };
}

/**
 * Orchestrateur principal pour l'analyse Content Hierarchy
 * Combine les deux analyses et retourne le résultat global
 */
export function analyzeContentHierarchy($: cheerio.CheerioAPI): { 
  cards: MetricCard[], 
  totalScore: number, 
  maxScore: number 
} {
  // Exécuter les deux analyses
  const headingCard = analyzeHeadingStructure($);
  const groupingCard = analyzeDataGrouping($);
  
  // Calculer le score total
  const totalScore = headingCard.score + groupingCard.score;
  const maxScore = headingCard.maxScore + groupingCard.maxScore;
  
  return {
    cards: [headingCard, groupingCard],
    totalScore,
    maxScore
  };
}
