/**
 * NAVIGATIONAL ACCESSIBILITY ANALYSIS
 * 
 * Analyse la capacité d'une IA à comprendre et parcourir la structure de navigation d'un site
 * Score total: 25 points
 * 
 * Objectif: Vérifier si la navigation principale est construite avec des balises sémantiques claires
 * et des liens statiques directement lisibles pour les crawlers IA
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '../../types/analysis-architecture';

// ===== KNOWLEDGE BASE =====

const NAVIGATIONAL_ACCESSIBILITY_KB = {
  noNavTag: {
    problem: "No semantic <nav> tag was found on the page.",
    solution: "Wrap your main navigation menus (header, footer, sidebar) within <nav> tags.",
    explanation: "The <nav> tag is the strongest semantic signal to tell an AI 'this is a menu'. Without it, the AI has to guess which group of links is for navigation, which can lead to a poor understanding of your site's structure.",
    impact: 9
  },
  noStaticLinksInNav: {
    problem: "A <nav> tag was found, but it contains no static <a> links with an 'href' attribute.",
    solution: "Ensure your navigation includes standard <a> links with 'href' attributes, even if you use JavaScript for functionality.",
    explanation: "While modern JavaScript navigation works for users, some AI crawlers rely on simple, static <a> links to discover other pages. Providing them as a baseline ensures maximum crawlability of your site.",
    impact: 7
  },
  noBreadcrumbs: {
    problem: "No breadcrumb navigation was detected on the page.",
    solution: "Implement a breadcrumb trail, especially for pages deep within your site's structure.",
    explanation: "A breadcrumb (e.g., Home > Blog > Article) is an extremely useful signal for AIs, as it instantly tells them where the current page fits into your site's overall hierarchy.",
    impact: 6
  },
  multipleNavWithoutLabels: {
    problem: (navCount: number, navWithoutLabels: number) => `${navWithoutLabels} of ${navCount} <nav> tags were found, but they lack differentiating 'aria-label' attributes.`,
    solution: "Add a unique and descriptive 'aria-label' to each <nav> tag to define its specific purpose (e.g., <nav aria-label=\"Main Website Navigation\">).",
    explanation: "When multiple navigations exist, an 'aria-label' is essential for an AI to understand the distinct role of each (e.g., main menu vs. footer menu), leading to a more accurate site map.",
    impact: 5
  }
};

// ===== FONCTION D'ANALYSE PRINCIPALE =====

export function analyzeNavigationalAccessibility($: cheerio.CheerioAPI): MetricCard {
  let score = 25; // Score de départ (maximum)
  const recommendations: Recommendation[] = [];

  // === CHECK 1: Présence d'au moins une balise <nav> (15 points) ===
  const navElements = $('nav');
  const navCount = navElements.length;

  // === CHECK 3: Détection des breadcrumbs ===
  const breadcrumbSelectors = [
    '[aria-label*="breadcrumb" i]',
    '[class*="breadcrumb" i]',
    '[id*="breadcrumb" i]',
    'nav[aria-label*="breadcrumb" i]',
    '.breadcrumb',
    '#breadcrumb'
  ];

  if (navCount === 0) {
    // Problème critique: aucune balise <nav> trouvée
    score -= 15;
    recommendations.push({
      problem: NAVIGATIONAL_ACCESSIBILITY_KB.noNavTag.problem,
      solution: NAVIGATIONAL_ACCESSIBILITY_KB.noNavTag.solution,
      explanation: NAVIGATIONAL_ACCESSIBILITY_KB.noNavTag.explanation,
      impact: NAVIGATIONAL_ACCESSIBILITY_KB.noNavTag.impact
    });
  } else {
    // === CHECK 2: Présence de liens statiques dans <nav> (10 points) ===
    let totalStaticLinks = 0;
    let navWithStaticLinks = 0;

    navElements.each((index, navElement) => {
      const $nav = $(navElement);
      const staticLinks = $nav.find('a[href]').length;
      totalStaticLinks += staticLinks;
      
      if (staticLinks > 0) {
        navWithStaticLinks++;
      }
    });

    if (navWithStaticLinks === 0) {
      // Problème: balises <nav> présentes mais aucun lien statique
      score -= 10;
      recommendations.push({
        problem: NAVIGATIONAL_ACCESSIBILITY_KB.noStaticLinksInNav.problem,
        solution: NAVIGATIONAL_ACCESSIBILITY_KB.noStaticLinksInNav.solution,
        explanation: NAVIGATIONAL_ACCESSIBILITY_KB.noStaticLinksInNav.explanation,
        impact: NAVIGATIONAL_ACCESSIBILITY_KB.noStaticLinksInNav.impact
      });
    }

    let breadcrumbsFound = false;
    for (const selector of breadcrumbSelectors) {
      if ($(selector).length > 0) {
        breadcrumbsFound = true;
        break;
      }
    }

    if (!breadcrumbsFound) {
      // Problème optionnel: pas de breadcrumbs détectés
      recommendations.push({
        problem: NAVIGATIONAL_ACCESSIBILITY_KB.noBreadcrumbs.problem,
        solution: NAVIGATIONAL_ACCESSIBILITY_KB.noBreadcrumbs.solution,
        explanation: NAVIGATIONAL_ACCESSIBILITY_KB.noBreadcrumbs.explanation,
        impact: NAVIGATIONAL_ACCESSIBILITY_KB.noBreadcrumbs.impact
      });
    }

    // === CHECK 4: Multiple <nav> sans aria-label ===
    if (navCount > 1) {
      let navWithLabels = 0;
      
      navElements.each((index, navElement) => {
        const $nav = $(navElement);
        const hasAriaLabel = $nav.attr('aria-label') || $nav.attr('aria-labelledby');
        
        if (hasAriaLabel) {
          navWithLabels++;
        }
      });

      if (navWithLabels < navCount) {
        // Problème: plusieurs <nav> mais pas toutes avec aria-label
        const navWithoutLabels = navCount - navWithLabels;
        recommendations.push({
          problem: NAVIGATIONAL_ACCESSIBILITY_KB.multipleNavWithoutLabels.problem(navCount, navWithoutLabels),
          solution: NAVIGATIONAL_ACCESSIBILITY_KB.multipleNavWithoutLabels.solution,
          explanation: NAVIGATIONAL_ACCESSIBILITY_KB.multipleNavWithoutLabels.explanation,
          impact: NAVIGATIONAL_ACCESSIBILITY_KB.multipleNavWithoutLabels.impact
        });
      }
    }
  }

  // === CALCUL DU STATUT ===
  const percentage = (score / 25) * 100;
  let status: 'excellent' | 'good' | 'warning' | 'error';
  
  if (percentage >= 90) status = 'excellent';
  else if (percentage >= 70) status = 'good';
  else if (percentage >= 50) status = 'warning';
  else status = 'error';

  // === DONNÉES BRUTES ===
  const rawData = {
    navElementsCount: navCount,
    staticLinksInNav: navCount > 0 ? $('nav a[href]').length : 0,
    breadcrumbsDetected: breadcrumbSelectors.some((selector: string) => $(selector).length > 0),
    navWithAriaLabels: navCount > 0 ? navElements.filter((index, element) => {
      const $nav = $(element);
      return !!(($nav.attr('aria-label') || $nav.attr('aria-labelledby')));
    }).length : 0
  };

  return {
    id: 'navigational-accessibility',
    name: 'Navigational Accessibility',
    score,
    maxScore: 25,
    status,
    explanation: 'Evaluates the ability of AI systems to understand and crawl your site\'s navigation structure. Focuses on semantic navigation elements and static link availability for maximum crawlability.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage: 'Excellent! Your navigation structure is optimized for AI comprehension with clear semantic signals and crawlable links.',
    rawData
  };
}

// ===== FONCTION DE TEST (pour validation) =====

/**
 * Fonction de test pour valider le module d'analyse
 * À utiliser uniquement en développement
 */
export function testNavigationalAccessibilityAnalysis() {
  const testCases = [
    {
      name: 'Page sans navigation',
      html: '<html><body><h1>Test</h1></body></html>',
      expectedScore: 10 // 25 - 15 (pas de nav)
    },
    {
      name: 'Page avec nav mais sans liens',
      html: '<html><body><nav><span>Menu</span></nav></body></html>',
      expectedScore: 15 // 25 - 10 (pas de liens statiques)
    },
    {
      name: 'Page avec nav et liens statiques',
      html: '<html><body><nav><a href="/home">Home</a><a href="/about">About</a></nav></body></html>',
      expectedScore: 25 // Score parfait
    },
    {
      name: 'Page avec breadcrumbs',
      html: '<html><body><nav><a href="/home">Home</a></nav><nav aria-label="breadcrumb"><a href="/home">Home</a> > <a href="/blog">Blog</a></nav></body></html>',
      expectedScore: 25 // Score parfait avec breadcrumbs
    }
  ];

  console.log('🧭 Testing Navigational Accessibility Analysis...');
  
  testCases.forEach((testCase, index) => {
    const $ = cheerio.load(testCase.html);
    const result = analyzeNavigationalAccessibility($);
    
    const passed = result.score === testCase.expectedScore;
    console.log(`${passed ? '✅' : '❌'} Test ${index + 1}: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expectedScore}, Got: ${result.score}`);
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`   Recommendations: ${result.recommendations.length}`);
    }
  });
  
  console.log('🧭 Navigational Accessibility Analysis test completed!');
}
