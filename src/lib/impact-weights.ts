/**
 * Configuration des poids pour le calcul des scores d'impact
 * Basé sur l'architecture AEO avec 5 sections principales
 */

// Poids des sections principales (en pourcentage)
export const SECTION_WEIGHTS = {
  discoverability: 20,      // 20% du score final
  structuredData: 25,       // 25% du score final
  llmFormatting: 25,        // 25% du score final
  accessibility: 15,        // 15% du score final
  readability: 15,          // 15% du score final
} as const;

// Poids des sous-sections (en pourcentage de leur section)
export const SUBSECTION_WEIGHTS = {
  // Discoverability (20%)
  'https-protocol': 25,           // 25% de 20% = 5% du total
  'http-status': 20,              // 20% de 20% = 4% du total
  'robots-txt-ai-bots': 30,       // 30% de 20% = 6% du total
  'sitemap-present': 25,          // 25% de 20% = 5% du total
  
  // Structured Data (25%)
  'json-ld-analysis': 40,         // 40% de 25% = 10% du total
  'meta-tags-analysis': 30,       // 30% de 25% = 7.5% du total
  'social-meta-analysis': 30,     // 30% de 25% = 7.5% du total
  
  // LLM Formatting (25%)
  'content-hierarchy': 35,        // 35% de 25% = 8.75% du total
  'inline-semantics': 35,        // 35% de 25% = 8.75% du total
  'layout-structural-roles': 30,  // 30% de 25% = 7.5% du total
  
  // Accessibility (15%)
  'content-accessibility': 40,    // 40% de 15% = 6% du total
  'navigational-accessibility': 35, // 35% de 15% = 5.25% du total
  'technical-accessibility': 25,  // 25% de 15% = 3.75% du total
  
  // Readability (15%)
  'text-clarity': 40,             // 40% de 15% = 6% du total
  'content-organization': 35,     // 35% de 15% = 5.25% du total
  'linguistic-precision': 25,     // 25% de 15% = 3.75% du total
} as const;

/**
 * Récupère le poids d'une section principale par son nom
 */
export function getSectionWeight(sectionName: string): number | null {
  const normalizedName = sectionName.toLowerCase().replace(/[^a-z]/g, '');
  
  // Mapping direct des noms de sections
  const sectionMapping: Record<string, keyof typeof SECTION_WEIGHTS> = {
    'discoverability': 'discoverability',
    'structureddata': 'structuredData',
    'llmformatting': 'llmFormatting',
    'accessibility': 'accessibility',
    'readability': 'readability',
  };
  
  for (const [key, sectionKey] of Object.entries(sectionMapping)) {
    if (normalizedName.includes(key)) {
      return SECTION_WEIGHTS[sectionKey];
    }
  }
  
  return null;
}

/**
 * Récupère le poids d'une sous-section par son ID
 */
export function getSubsectionWeight(subsectionId: string): number | null {
  const normalizedId = subsectionId.toLowerCase().replace(/[^a-z-]/g, '');
  
  // Mapping des patterns d'ID vers les clés de sous-sections
  const idPatterns: Record<string, keyof typeof SUBSECTION_WEIGHTS> = {
    'https': 'https-protocol',
    'http': 'http-status',
    'robots': 'robots-txt-ai-bots',
    'sitemap': 'sitemap-present',
    'jsonld': 'json-ld-analysis',
    'json': 'json-ld-analysis',
    'metatags': 'meta-tags-analysis',
    'meta': 'meta-tags-analysis',
    'social': 'social-meta-analysis',
    'og': 'social-meta-analysis',
    'hierarchy': 'content-hierarchy',
    'semantics': 'inline-semantics',
    'structural': 'layout-structural-roles',
    'layout': 'layout-structural-roles',
    'contentaccessibility': 'content-accessibility',
    'navigational': 'navigational-accessibility',
    'technicalaccessibility': 'technical-accessibility',
    'textclarity': 'text-clarity',
    'contentorganization': 'content-organization',
    'linguistic': 'linguistic-precision',
  };
  
  for (const [pattern, subsectionKey] of Object.entries(idPatterns)) {
    if (normalizedId.includes(pattern)) {
      return SUBSECTION_WEIGHTS[subsectionKey];
    }
  }
  
  return null;
}
