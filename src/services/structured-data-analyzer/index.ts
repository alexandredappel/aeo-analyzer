/**
 * STRUCTURED DATA ANALYZER - MAIN ORCHESTRATOR
 * 
 * Modular architecture for structured data analysis
 * Orchestrates JSON-LD, Meta Tags, and Social Meta analyses
 * 
 * Architecture: 📋 STRUCTURED DATA → JSON-LD + Meta Tags + Social Meta → MetricCards
 */

import * as cheerio from 'cheerio';
import { MainSection, DrawerSubSection, PerformanceStatus } from '@/types/analysis-architecture';
import { StructuredDataAnalysisResult, SectionConfig } from './shared/types';
import { SECTION_CONFIG } from './shared/constants';
import { getPerformanceStatus } from './shared/utils';

// Import specialized analyzers
import { analyzeJsonLD } from './json-ld-analysis';
import { analyzeMetaTags } from './meta-tags-analysis';
import { analyzeSocialMeta } from './social-meta-analysis';

/**
 * Complete structured data analysis according to modular architecture
 * 
 * @param html The HTML content to analyze
 * @param url The URL of the page (for context)
 * @returns Complete analysis result with section and raw data
 */
export function analyzeStructuredData(html: string, url: string): StructuredDataAnalysisResult {
  try {
    // Input validation
    if (!html || typeof html !== 'string') {
      throw new Error('HTML content required for structured data analysis');
    }

    // Run specialized analyses
    const jsonLdResult = analyzeJsonLD(html);
    const metaTagsResult = analyzeMetaTags(html);
    const socialMetaCard = analyzeSocialMeta(html);

    // Build drawers (DrawerSubSection)
    const jsonldDrawer: DrawerSubSection = {
      id: 'jsonld-analysis',
      name: 'Semantic Markup Analysis (JSON-LD)',
      description: 'Analyzes the richness and connectivity of your structured data for AI comprehension.',
      totalScore: jsonLdResult.totalScore,
      maxScore: jsonLdResult.maxScore,
      status: getPerformanceStatus(jsonLdResult.totalScore, jsonLdResult.maxScore),
      cards: jsonLdResult.cards,
      perfectItems: jsonLdResult.perfectItems
    };

    const metaTagsDrawer: DrawerSubSection = {
      id: 'meta-tags-analysis',
      name: 'Meta Tags Analysis',
      description: 'Essential metadata for search engines',
      totalScore: metaTagsResult.totalScore,
      maxScore: metaTagsResult.maxScore,
      status: getPerformanceStatus(metaTagsResult.totalScore, metaTagsResult.maxScore),
      cards: metaTagsResult.cards,
      perfectItems: metaTagsResult.perfectItems
    };

    const socialMetaDrawer: DrawerSubSection = {
      id: 'social-meta-analysis',
      name: 'Social Meta Analysis',
      description: 'Open Graph & Twitter Card tags for social sharing.',
      totalScore: socialMetaCard.score,
      maxScore: socialMetaCard.maxScore,
      status: getPerformanceStatus(socialMetaCard.score, socialMetaCard.maxScore),
      cards: [socialMetaCard]
    };

    // NEW WEIGHTED CALCULATION
    const jsonLdContribution = (jsonldDrawer.maxScore > 0) 
      ? (jsonldDrawer.totalScore / jsonldDrawer.maxScore) * 80 
      : 0;

    const socialMetaContribution = (socialMetaDrawer.maxScore > 0) 
      ? (socialMetaDrawer.totalScore / socialMetaDrawer.maxScore) * 20 
      : 0;

    const totalScore = Math.round(jsonLdContribution + socialMetaContribution);

    // Build main section
    const section: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: SECTION_CONFIG.description,
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore,
      maxScore: SECTION_CONFIG.maxScore,
      status: getPerformanceStatus(totalScore, SECTION_CONFIG.maxScore),
      drawers: [jsonldDrawer, metaTagsDrawer, socialMetaDrawer]
    };

    // Raw data for debug/export
    const $ = cheerio.load(html);
    
    // Extract entities for counting
    const scripts = $('script[type="application/ld+json"]');
    const entities: any[] = [];
    const detectedSchemas: string[] = [];

    scripts.each((_, script) => {
      try {
        const content = $(script).html();
        if (!content) return;

        const jsonData = JSON.parse(content);
        
        // Handle different JSON-LD structures
        if (Array.isArray(jsonData)) {
          entities.push(...jsonData);
        } else if (jsonData['@graph']) {
          if (Array.isArray(jsonData['@graph'])) {
            entities.push(...jsonData['@graph']);
          } else {
            entities.push(jsonData['@graph']);
          }
        } else {
          entities.push(jsonData);
        }
      } catch (error) {
        // Skip invalid JSON-LD
      }
    });

    // Extract schema types
    entities.forEach(entity => {
      if (entity['@type']) {
        detectedSchemas.push(entity['@type']);
      }
    });

    const rawData = {
      jsonLdFound: entities.length > 0,
      jsonLdValid: entities.length > 0,
      detectedSchemas: Array.from(new Set(detectedSchemas)),
      totalEntities: entities.length,
      titleTag: {
        present: !!$('title').first().text().trim(),
        length: $('title').first().text().trim().length,
        text: $('title').first().text().trim()
      },
      metaDescription: {
        present: !!$('meta[name="description"]').first().attr('content'),
        length: ($('meta[name="description"]').first().attr('content') || '').length,
        text: $('meta[name="description"]').first().attr('content') || ''
      },
      technicalMeta: {
        viewport: !!$('meta[name="viewport"]').length,
        charset: !!($('meta[charset]').length || $('meta[http-equiv="Content-Type"]').length),
        robots: !!$('meta[name="robots"]').length
      },
      openGraph: {
        title: !!$('meta[property="og:title"]').first().attr('content'),
        description: !!$('meta[property="og:description"]').first().attr('content'),
        image: !!$('meta[property="og:image"]').first().attr('content'),
        url: !!$('meta[property="og:url"]').first().attr('content')
      },
      totalSchemas: entities.filter(entity => entity['@type']).length,
      identityAndStructureScore: jsonLdResult.cards.find(card => card.id === 'identity-and-structure-analysis')?.score || 0,
      mainEntityScore: jsonLdResult.cards.find(card => card.id === 'main-entity-analysis')?.score || 0,
      semanticAnalysisComplete: true
    };

    return {
      section,
      rawData
    };

  } catch (error) {
    // Error handling with minimal section
    const errorSection: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: 'Does your content have proper schema markup for AI understanding?',
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore: 0,
      maxScore: SECTION_CONFIG.maxScore,
      status: 'error',
      drawers: []
    };

    return {
      section: errorSection,
      rawData: {
        jsonLdFound: false,
        jsonLdValid: false,
        detectedSchemas: [],
        totalEntities: 0,
        titleTag: { present: false, length: 0, text: '' },
        metaDescription: { present: false, length: 0, text: '' },
        technicalMeta: { viewport: false, charset: false, robots: false },
        openGraph: { title: false, description: false, image: false, url: false },
        totalSchemas: 0,
        identityAndStructureScore: 0,
        mainEntityScore: 0,
        semanticAnalysisComplete: false,
        error: (error as Error).message
      }
    };
  }
}

// Re-export types and constants for external usage
export type { StructuredDataAnalysisResult } from './shared/types';
export { SECTION_CONFIG } from './shared/constants';

// Re-export individual analyzers for backwards compatibility
export {
  // JSON-LD analyzers
  analyzeIdentityAndStructure,
  analyzeMainEntity,
  analyzeEnrichmentSchemas,
  analyzeGraphConnectivity,
  parseJSONLD,
  analyzeJSONLDPresence,
  analyzeSchemaTypesCompleteness
} from './json-ld-analysis';

export {
  // Meta tags analyzers
  analyzeTitleTag,
  analyzeMetaDescription,
  analyzeTechnicalMeta
} from './meta-tags-analysis';

export {
  // Social meta analyzer
  analyzeSocialMeta
} from './social-meta-analysis';

// Re-export shared utilities
export {
  parseAndNormalizeEntities,
  getPerformanceStatus,
  calculateDiversityBonus
} from './shared/utils';

export {
  SCHEMA_WEIGHTS,
  UNKNOWN_SCHEMA_BONUS,
  REQUIRED_SCHEMA_FIELDS
} from './shared/constants';