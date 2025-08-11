/**
 * ACCESSIBILITY ANALYZER - SHARED CONSTANTS
 * 
 * Constantes partagées pour toutes les analyses d'accessibilité
 */

// ===== POIDS DES ANALYSES =====

export const CRITICAL_DOM_WEIGHTS = {
  CONTENT_RATIO: 15,
  NAVIGATION_ACCESS: 12,
  SEMANTIC_STRUCTURE: 13
} as const;

export const PERFORMANCE_WEIGHTS = {
  PAGE_SPEED: 20,
  CORE_WEB_VITALS: 15
} as const;



// ===== SEUILS DE PERFORMANCE =====

export const PERFORMANCE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  warning: 50
} as const;

// ===== SEUILS D'ANALYSE =====

export const CONTENT_RATIO_THRESHOLDS = {
  EXCELLENT_TEXT_LENGTH: 1000,
  GOOD_TEXT_LENGTH: 500,
  WARNING_TEXT_LENGTH: 200,
  EXCELLENT_RATIO: 0.8,
  GOOD_RATIO: 0.6,
  WARNING_RATIO: 0.4
} as const;

export const NAVIGATION_THRESHOLDS = {
  EXCELLENT_NAV_ELEMENTS: 1,
  EXCELLENT_STATIC_LINKS: 5,
  GOOD_STATIC_LINKS: 3,
  WARNING_STATIC_LINKS: 2,
  MIN_STATIC_LINKS: 1
} as const;



// ===== MESSAGES D'ERREUR =====

export const ERROR_MESSAGES = {
  CONTENT_RATIO: 'Error analyzing content ratio',
  NAVIGATION_ACCESS: 'Error analyzing navigation access',
  SEMANTIC_STRUCTURE: 'Error analyzing semantic structure',
  PAGE_SPEED: 'Error analyzing page speed',
  CORE_WEB_VITALS: 'Error analyzing Core Web Vitals',
  GENERAL: 'Unknown error'
} as const;

// ===== MESSAGES DE SUCCÈS =====

export const SUCCESS_MESSAGES = {
  CONTENT_RATIO: 'Great! Your content is primarily static and accessible to AI crawlers.',
  NAVIGATION_ACCESS: 'Perfect! Your navigation is accessible without JavaScript execution.',
  SEMANTIC_STRUCTURE: 'Excellent! Your semantic structure enhances content accessibility.',
  PAGE_SPEED: 'Excellent! Your PageSpeed score ensures fast loading for all users.',
  CORE_WEB_VITALS: 'Perfect! Your Core Web Vitals are optimized for excellent user experience.'
} as const;

// ===== EXPLICATIONS =====

export const EXPLANATIONS = {
  CONTENT_RATIO: 'Measures the ratio of static HTML content vs JavaScript-rendered content. High static content ratios ensure AI crawlers and search engines can access your content without executing JavaScript.',
  NAVIGATION_ACCESS: 'Evaluates the accessibility of navigation without JavaScript execution. Static navigation ensures AI crawlers can discover and index all important pages.',
  SEMANTIC_STRUCTURE: 'Assesses the semantic HTML5 structure that enhances content accessibility for both assistive technologies and AI systems. Proper semantic markup improves content understanding.',
  PAGE_SPEED: 'Google PageSpeed Insights score indicates overall page performance. Fast loading pages provide better accessibility for all users and improved LLM processing.',
  CORE_WEB_VITALS: 'Core Web Vitals (LCP, FID, CLS) measure user experience quality. Good vitals indicate fast, responsive, and stable pages that enhance accessibility.'
} as const;

// ===== PROBLÈMES ET SOLUTIONS =====

export const PROBLEMS_AND_SOLUTIONS = {
  HIGH_JS_RATIO: {
    problem: 'High JavaScript-to-content ratio may hinder AI crawler access',
    solutions: [
      'Implement server-side rendering (SSR) for critical content',
      'Use progressive enhancement to ensure basic content is available without JS'
    ]
  },
  LIMITED_TEXT_CONTENT: {
    problem: 'Limited static text content available for analysis',
    solutions: [
      'Ensure meaningful content is rendered in static HTML',
      'Add meta descriptions and structured content'
    ]
  },
  NO_NAV_ELEMENTS: {
    problem: 'No semantic <nav> elements found for navigation',
    solutions: [
      'Wrap navigation menus in <nav> elements',
      'Use semantic HTML5 navigation structure'
    ]
  },
  LIMITED_STATIC_LINKS: {
    problem: 'Limited static navigation links may reduce crawlability',
    solutions: [
      'Ensure primary navigation uses <a href="..."> links',
      'Avoid JavaScript-only navigation for important pages'
    ]
  },
  JS_HEAVY_NAVIGATION: {
    problem: 'Navigation relies heavily on JavaScript interaction',
    solutions: [
      'Implement progressive enhancement for navigation',
      'Provide static link fallbacks for JS-enhanced navigation'
    ]
  },

} as const;
