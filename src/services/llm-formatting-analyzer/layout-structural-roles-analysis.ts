/**
 * LAYOUT & STRUCTURAL ROLES ANALYSIS - LLM FORMATTING ANALYZER
 * 
 * Analyse la mise en page et les rôles structurels pour optimiser la compréhension par les LLMs
 * 
 * Objectif : Évaluer l'utilisation des balises sémantiques HTML5 pour délimiter les grandes régions fonctionnelles
 * - Définition du contenu principal (20 points) : Unicité et placement du <main>
 * - Identification des rôles sémantiques (10 points) : <nav>, <aside>, aria-label
 * 
 * Total : 30 points
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';

/**
 * Knowledge Base pour les problèmes et solutions de Layout & Structural Roles
 */
const LAYOUT_STRUCTURAL_KNOWLEDGE_BASE = {
  // Définition du Contenu Principal (Main Content Definition)
  missingMainTag: {
    problem: "The page is missing a <main> tag.",
    solution: "Wrap the primary, unique content of your page within a single <main> element.",
    explanation: "The <main> tag is the strongest signal to tell AIs which part of the page is the most important. Without it, the AI has to guess, which can lead to less accurate summaries and analysis.",
    impact: 9
  },
  multipleMainTags: {
    problem: (count: number) => `Multiple <main> tags (total: ${count}) were found. A page must only have one.`,
    solution: "Ensure there is only one <main> tag on the page. Use <div> or <section> tags for other content blocks.",
    explanation: "Using more than one <main> tag creates a major ambiguity, as the AI no longer knows which content is truly the primary focus. This can lead to incorrect content extraction.",
    impact: 9
  },
  incorrectMainNesting: {
    problem: (parentTag: string) => `The <main> tag is nested incorrectly inside another element like <${parentTag}>.`,
    solution: "The <main> tag should not be a descendant of an <article>, <aside>, <footer>, <header>, or <nav> element. Place it as a direct child of <body>.",
    explanation: "An incorrectly nested <main> tag breaks the semantic structure of the page, confusing AIs about the document's architectural layout.",
    impact: 7
  },
  
  // Identification des Rôles Sémantiques (Semantic Region Tagging)
  // Note: Les recommendations sont maintenant générées inline dans analyzeSemanticRegionTagging()
};

/**
 * Analyse la définition du contenu principal (20 points)
 * - Unicité du <main> (10 points)
 * - Placement correct du <main> (10 points)
 */
export function analyzeMainContentDefinition($: cheerio.CheerioAPI): MetricCard {
  let score = 0;
  const recommendations: Recommendation[] = [];
  
  // 1. Vérification de l'unicité du <main> (10 points)
  const mainElements = $('main');
  const mainCount = mainElements.length;
  
  if (mainCount === 0) {
    // Aucun <main> trouvé
    recommendations.push({
      problem: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.missingMainTag.problem,
      solution: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.missingMainTag.solution,
      impact: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.missingMainTag.impact
    });
  } else if (mainCount > 1) {
    // Plusieurs <main> trouvés
    recommendations.push({
      problem: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.multipleMainTags.problem(mainCount),
      solution: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.multipleMainTags.solution,
      impact: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.multipleMainTags.impact
    });
  } else {
    // Exactement un <main> - 10 points
    score += 10;
  }
  
     // 2. Vérification du placement correct du <main> (10 points)
   if (mainCount === 1) {
     const mainElement = mainElements.first();
     const parent = mainElement.parent();
     const parentTag = parent.prop('tagName')?.toLowerCase() || '';
     
     // Vérifier que le <main> n'est pas imbriqué dans des éléments interdits
     const forbiddenParents = ['article', 'aside', 'footer', 'header', 'nav'];
     const isInForbiddenParent = forbiddenParents.includes(parentTag);
     
     // Vérifier aussi s'il y a des ancêtres interdits plus haut dans l'arbre
     const hasForbiddenAncestor = mainElement.parents(forbiddenParents.join(',')).length > 0;
     
     if (isInForbiddenParent || hasForbiddenAncestor) {
       const actualParent = isInForbiddenParent ? parentTag : mainElement.parents(forbiddenParents.join(',')).first().prop('tagName')?.toLowerCase() || 'unknown';
       recommendations.push({
         problem: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.incorrectMainNesting.problem(actualParent),
         solution: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.incorrectMainNesting.solution,
         impact: LAYOUT_STRUCTURAL_KNOWLEDGE_BASE.incorrectMainNesting.impact
       });
     } else {
       // Placement correct - 10 points
       score += 10;
     }
   }
  
  return {
    id: 'main-content-definition',
    name: 'Main Content Definition',
    score,
    maxScore: 20,
    status: score >= 16 ? 'excellent' : score >= 12 ? 'good' : score >= 8 ? 'warning' : 'error',
    explanation: 'Analyzes the proper use of the <main> tag to define the primary content area. A correctly placed and unique <main> tag is crucial for AI to focus on the most important content.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: 'Excellent! Your page uses a single, unique <main> tag correctly, providing a clear focus for AI analysis.',
    rawData: {
      mainCount,
      mainPresent: mainCount > 0,
      mainUnique: mainCount === 1,
      mainCorrectlyPlaced: score === 20,
      uniquenessScore: mainCount === 1 ? 10 : 0,
      placementScore: score >= 10 ? 10 : 0
    }
  };
}

/**
 * Analyse l'identification des rôles sémantiques (10 points)
 * Détecte les simulations de navigation/sidebar et vérifie les aria-label
 */
export function analyzeSemanticRegionTagging($: cheerio.CheerioAPI): MetricCard {
  let score = 10; // Commence parfait
  const recommendations: Recommendation[] = [];
  
  // 1. Détecter les simulations de navigation avec patterns PRÉCIS
  const navPatterns = [
    /\bnav\b/i,              // Mot "nav" isolé
    /\bnavigation\b/i,       // Mot "navigation" isolé
    /\bmain-menu\b/i,        // Menu principal
    /\bnav-menu\b/i,         // Menu de navigation
    /\bprimary-nav\b/i       // Navigation primaire
  ];
  
  // 2. Détecter les simulations de sidebar avec patterns SÉPARÉS
  const sidebarPatterns = [
    /\bsidebar\b/i,          // Mot "sidebar" isolé
    /\baside\b/i,            // Mot "aside" isolé
    /\bside-content\b/i      // Contenu latéral
  ];
  
  // Chercher dans les IDs et classes des divs
  $('div').each((_, element) => {
    const $element = $(element);
    const id = $element.attr('id') || '';
    const className = $element.attr('class') || '';
    const combined = `${id} ${className}`.toLowerCase();
    
    // Vérifier si ce div simule une navigation
    const hasNavPattern = navPatterns.some(pattern => pattern.test(combined));
    const hasNavigationContent = $element.find('a[href]').length >= 2;
    const isInNavTag = $element.closest('nav').length > 0;
    
    // Vérifier si ce div simule une sidebar
    const hasSidebarPattern = sidebarPatterns.some(pattern => pattern.test(combined));
    const hasSidebarContent = $element.text().trim().length > 20;
    const isInAsideTag = $element.closest('aside').length > 0;
    
    // Navigation simulée
    if (hasNavPattern && hasNavigationContent && !isInNavTag) {
      score -= 3;
      const offendingElement = `<div id="${id}" class="${className}">`;
      recommendations.push({
        problem: `A block that appears to be a primary navigation menu is not wrapped in a <nav> tag. Offending element: ${offendingElement}`,
        solution: "Wrap this navigation block in a <nav> tag to semantically define its role.",
        impact: 5
      });
    }
    
    // Sidebar simulée  
    if (hasSidebarPattern && hasSidebarContent && !isInAsideTag) {
      score -= 2;
      const offendingElement = `<div id="${id}" class="${className}">`;
      recommendations.push({
        problem: `A block that appears to be a sidebar is not wrapped in an <aside> tag. Offending element: ${offendingElement}`,
        solution: "Wrap this sidebar content in an <aside> tag.",
        impact: 4
      });
    }
  });
  
  // 3. Vérifier les <nav> multiples et leurs aria-label
  const navElements = $('nav');
  const navCount = navElements.length;
  
  if (navCount > 1) {
    let allHaveLabels = true;
    
    navElements.each((_, element) => {
      const $nav = $(element);
      const ariaLabel = $nav.attr('aria-label');
      
      if (!ariaLabel || ariaLabel.trim() === '') {
        allHaveLabels = false;
      }
    });
    
    if (!allHaveLabels) {
      score -= 5;
      recommendations.push({
        problem: "This page contains multiple <nav> tags, but they do not have 'aria-label' attributes to differentiate them.",
        solution: "Add a unique and descriptive 'aria-label' to each <nav> tag to define its specific purpose.",
        impact: 7
      });
    }
  }
  
  // S'assurer que le score ne descend pas en dessous de 0
  score = Math.max(0, score);
  
  return {
    id: 'semantic-region-tagging',
    name: 'Semantic Region Tagging',
    score,
    maxScore: 10,
    status: score >= 8 ? 'excellent' : score >= 6 ? 'good' : score >= 4 ? 'warning' : 'error',
    explanation: 'Evaluates the proper use of semantic tags like <nav> and <aside> to identify page regions.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: 'Clear navigational roles! Navigation blocks are correctly identified with semantic tags.',
    rawData: {
      navCount,
      totalIssues: recommendations.length
    }
  };
}

/**
 * Orchestrateur principal pour l'analyse Layout & Structural Roles
 * Combine les deux analyses et retourne le résultat global
 */
export function analyzeLayoutAndStructuralRoles($: cheerio.CheerioAPI): { 
  cards: MetricCard[], 
  totalScore: number, 
  maxScore: number 
} {
  // Exécuter les deux analyses
  const mainContentCard = analyzeMainContentDefinition($);
  const semanticRegionCard = analyzeSemanticRegionTagging($);
  
  // Calculer le score total
  const totalScore = mainContentCard.score + semanticRegionCard.score;
  const maxScore = mainContentCard.maxScore + semanticRegionCard.maxScore;
  
  return {
    cards: [mainContentCard, semanticRegionCard],
    totalScore,
    maxScore
  };
}
