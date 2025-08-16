/**
 * INLINE SEMANTICS ANALYSIS - LLM FORMATTING ANALYZER
 * 
 * Analyzes CTA context clarity for AI understanding
 * 
 * This module uses the superior CTA analysis logic from the Readability module
 * to evaluate descriptive links and buttons for AI comprehension.
 * 
 * Weight: 20 points
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';

// ===== KNOWLEDGE BASE =====

const KNOWLEDGE_BASE = {
  // CTA Context Clarity Issues
  genericLinkText: {
    problem: "[count] links/buttons with generic text like '[text]' were found.",
    solution: "Add a descriptive 'aria-label' attribute to these elements to provide clear context for AIs and assistive tech.",
    explanation: "Ambiguous links are semantic dead-ends for AIs. An 'aria-label' provides explicit context about the destination, helping the AI understand the site's structure and user journey.",
    impact: 9
  },
  emptyLink: {
    problem: "[count] links/buttons have no text content or descriptive 'aria-label'.",
    solution: "Ensure every '<a>' and '<button>' element has either visible text or a comprehensive 'aria-label'.",
    explanation: "'Empty' links are invisible to AIs and assistive technologies. They break the navigational graph of your website, preventing crawlers from discovering linked pages.",
    impact: 9
  }
} as const;

// Generic terms that indicate poor CTA context
const GENERIC_CTA_TERMS = [
  'add',
  'back',
  'begin',
  'browse',
  'buy',
  'buy now',
  'cancel',
  'check',
  'click here',
  'close',
  'confirm',
  'continue',
  'delete',
  'discover',
  'download',
  'edit',
  'explore',
  'find',
  'forward',
  'get',
  'go',
  'here',
  'home',
  'learn more',
  'link',
  'menu',
  'more',
  'next',
  'no',
  'ok',
  'open',
  'page',
  'previous',
  'read more',
  'remove',
  'save',
  'search',
  'see',
  'send',
  'shop',
  'shop now',
  'show',
  'sign up',
  'start',
  'submit',
  'subscribe',
  'take',
  'test',
  'that',
  'this',
  'try',
  'url',
  'use',
  'verify',
  'view',
  'view more',
  'website',
  'yes'
];

/**
 * Analyzes CTA context clarity (20 pts)
 * Evaluates descriptive links and buttons for AI understanding
 */
function createCtaClarityCard($: cheerio.CheerioAPI): MetricCard {
  try {
    const recommendations: Recommendation[] = [];
    let score = 20; // Start with full score (adjusted from 10 to 20 for this module)
    
    // Counters for aggregated recommendations
    let genericLinksCount = 0;
    let emptyLinksCount = 0;
    const genericTextExamples: Record<string, number> = {};
    
    // Find all links and buttons
    const links = $('a');
    const buttons = $('button');
    
    // Check links
    links.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim().toLowerCase();
      const ariaLabel = $element.attr('aria-label')?.trim().toLowerCase();
      
      // Check for empty or very short text
      if (!text || text.length < 2) {
        if (!ariaLabel || ariaLabel.length < 10) {
          emptyLinksCount++;
        }
      }
      // Check for generic text without descriptive aria-label
      else if (GENERIC_CTA_TERMS.includes(text) && (!ariaLabel || ariaLabel.length < 15)) {
        genericLinksCount++;
        genericTextExamples[text] = (genericTextExamples[text] || 0) + 1;
      }
    });
    
    // Check buttons
    buttons.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim().toLowerCase();
      const ariaLabel = $element.attr('aria-label')?.trim().toLowerCase();
      
      // Check for empty or very short text
      if (!text || text.length < 2) {
        if (!ariaLabel || ariaLabel.length < 10) {
          emptyLinksCount++;
        }
      }
      // Check for generic text without descriptive aria-label
      else if (GENERIC_CTA_TERMS.includes(text) && (!ariaLabel || ariaLabel.length < 15)) {
        genericLinksCount++;
        genericTextExamples[text] = (genericTextExamples[text] || 0) + 1;
      }
    });
    
    // Generate aggregated recommendations based on counters
    if (genericLinksCount > 0) {
      // Create examples string from the most common generic texts
      const examples = Object.entries(genericTextExamples)
        .sort(([,a], [,b]) => b - a) // Sort by frequency
        .slice(0, 3) // Take top 3
        .map(([text, count]) => `'${text}'${count > 1 ? ` (${count}x)` : ''}`)
        .join(', ');
      
      recommendations.push({
        problem: replacePlaceholders(KNOWLEDGE_BASE.genericLinkText.problem, {
          count: genericLinksCount,
          text: examples
        }),
        solution: KNOWLEDGE_BASE.genericLinkText.solution,
        explanation: KNOWLEDGE_BASE.genericLinkText.explanation,
        impact: KNOWLEDGE_BASE.genericLinkText.impact
      });
      score -= Math.min(genericLinksCount, 10); // Cap penalty at 10 points (adjusted for 20-point scale)
    }
    
    if (emptyLinksCount > 0) {
      recommendations.push({
        problem: replacePlaceholders(KNOWLEDGE_BASE.emptyLink.problem, {
          count: emptyLinksCount
        }),
        solution: KNOWLEDGE_BASE.emptyLink.solution,
        explanation: KNOWLEDGE_BASE.emptyLink.explanation,
        impact: KNOWLEDGE_BASE.emptyLink.impact
      });
      score -= Math.min(emptyLinksCount * 2, 10); // Cap penalty at 10 points (adjusted for 20-point scale)
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      id: 'cta-context-clarity',
      name: 'CTA Context Clarity',
      score,
      maxScore: 20,
      status: score >= 17 ? 'excellent' : score >= 14 ? 'good' : score >= 10 ? 'warning' : 'error',
      explanation: 'Evaluates the clarity of your call-to-action elements. Descriptive links and buttons help both users and AI systems understand your site\'s navigational structure.',
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      successMessage: 'Great! Your links and buttons use descriptive text. This is excellent for usability and allows AIs to understand the navigational structure of your site.',
      rawData: {
        totalLinks: links.length,
        totalButtons: buttons.length,
        genericLinksCount,
        emptyLinksCount,
        genericTextExamples,
        issuesFound: recommendations.length
      }
    };
    
  } catch (error) {
    console.error('Error in CTA context clarity analysis:', error);
    return {
      id: 'cta-context-clarity',
      name: 'CTA Context Clarity',
      score: 0,
      maxScore: 20,
      status: 'error',
      explanation: 'Error analyzing CTA context clarity',
      successMessage: 'Unable to analyze CTA context clarity due to an error.',
      rawData: {
        totalLinks: 0,
        totalButtons: 0,
        genericLinksCount: 0,
        emptyLinksCount: 0,
        genericTextExamples: {},
        issuesFound: 0
      }
    };
  }
}

/**
 * Replaces placeholders in a string with actual values
 */
function replacePlaceholders(text: string, replacements: Record<string, string | number>): string {
  let result = text;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(`[${placeholder}]`, String(value));
  }
  return result;
}

/**
 * Main exported function - wrapper for the superior CTA analysis
 */
export function analyzeInlineSemantics($: cheerio.CheerioAPI): MetricCard {
  return createCtaClarityCard($);
}
