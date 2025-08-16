/**
 * JSON-LD ANALYSIS MODULE
 * Comprehensive semantic analysis of JSON-LD structured data
 * Includes identity, main entity, enrichment schemas, and graph connectivity analysis.
 * This is the refactored version with a full Knowledge Base.
 */

import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { 
  parseAndNormalizeEntities,
  getPerformanceStatus 
} from './shared/utils';
import { 
  JSON_LD_SCORING, 
  MAIN_ENTITY_TYPES
} from './shared/constants';
import { SchemaEntity, MainEntityType } from './shared/types';

// ===================================================================================
// KNOWLEDGE BASE FOR JSON-LD ANALYSIS
// ===================================================================================

const JSON_LD_KNOWLEDGE_BASE = {
  // Identity & Structure
  noOwner: {
    problem: "No 'Organization' or 'Person' entity was found to define the site owner.",
    solution: "Add an 'Organization' schema for a company or a 'Person' schema for an individual.",
    explanation: "Defining the owner is crucial for establishing identity and trust, which are key signals for AIs.",
    impact: 9
  },
  ownerMissingName: {
    problem: (ownerType: string) => `The '${ownerType}' entity is missing a 'name'.`,
    solution: (ownerType: string) => `Provide a 'name' for your '${ownerType}' to state who you are.`,
    explanation: "The name is the most basic identifier for your entity. Without it, AIs don't know who is behind the content.",
    impact: 8
  },
  ownerMissingUrl: {
    problem: (ownerType: string) => `The '${ownerType}' entity is missing a 'url'.`,
    solution: "Add a 'url' property pointing to your homepage to link your entity to your site.",
    explanation: "The URL property creates a direct, verifiable link between your schema entity and your actual website.",
    impact: 7
  },
  orgMissingLogo: {
    problem: "The 'Organization' entity is missing a 'logo'.",
    solution: "Add a 'logo' property with a full URL to your logo image to improve brand recognition.",
    explanation: "The logo reinforces brand identity and is a strong visual signal for AIs that can process images.",
    impact: 6
  },
  ownerMissingSameAs: {
    problem: (ownerType: string) => `The '${ownerType}' entity is missing 'sameAs' links to social or professional profiles.`,
    solution: "Add a 'sameAs' array with URLs to your social profiles to consolidate your identity.",
    explanation: "'sameAs' links help AIs connect your website entity to your other official profiles, building a stronger and more trustworthy identity graph.",
    impact: 8
  },
  noWebsite: {
    problem: "No 'WebSite' entity was found.",
    solution: "Add a 'WebSite' schema to describe the site itself and its functionalities.",
    explanation: "The 'WebSite' schema is fundamental for defining the site as an entity and specifying features like its internal search engine.",
    impact: 9
  },
  noSearchAction: {
    problem: "The 'WebSite' entity is missing a 'SearchAction'.",
    solution: "Add a 'potentialAction' of type 'SearchAction' to define your internal site search.",
    explanation: "A 'SearchAction' explicitly tells AIs how your site search works, allowing them to potentially use it or understand your site's structure better.",
    impact: 6
  },
  noBreadcrumb: {
    problem: "No 'BreadcrumbList' entity was found on this page.",
    solution: "Implement a 'BreadcrumbList' to show the page's location within the site hierarchy.",
    explanation: "Breadcrumbs are a clear roadmap for AIs, helping them understand the page's context and its relation to the rest of the site.",
    impact: 7
  },

  // Main Entity
  noMainEntity: {
    problem: "No main entity (e.g., Article, Product) was found on this page.",
    solution: "Add a primary schema that accurately describes the main content of this page.",
    explanation: "The main entity is the core subject of the page. Without it, an AI doesn't know what the page is fundamentally about.",
    impact: 9
  },
  articleMissingHeadline: {
    problem: (articleType: string) => `The '${articleType}' is missing a 'headline'.`,
    solution: "Add a 'headline' property with the main title of the content.",
    explanation: "The headline is the primary textual identifier for an article, crucial for summaries and topic identification.",
    impact: 9
  },
  authorIsText: {
    problem: (articleType: string) => `The '${articleType}' author is plain text instead of a linked 'Person' entity.`,
    solution: "Change the 'author' from a simple name to a nested 'Person' schema to establish expertise.",
    explanation: "Linking to a 'Person' entity for the author creates a connection to a real-world expert, a very strong signal of authority (E-E-A-T) for AIs.",
    impact: 9
  },
   publisherIsText: {
    problem: (articleType: string) => `The '${articleType}' publisher is plain text instead of a linked 'Organization' entity.`,
    solution: "Change the 'publisher' to a nested 'Organization' schema to clarify who published the content.",
    explanation: "Linking to an 'Organization' entity for the publisher clearly establishes the responsible entity, another key trust signal.",
    impact: 8
  },
  productMissingOffers: {
    problem: "The 'Product' is missing the 'offers' property.",
    solution: "Add an 'offers' property containing an 'Offer' schema to provide price and availability.",
    explanation: "The 'offers' property is what makes a product actionable for an AI. It provides the critical commercial data like price and stock status.",
    impact: 9
  },

  // Enrichment Schemas
  faqMalformed: {
    problem: "The 'FAQPage' exists but is missing well-structured questions and answers.",
    solution: "Add a 'mainEntity' array containing 'Question' entities, each with an 'acceptedAnswer' property.",
    explanation: "A correctly structured FAQPage allows AIs to directly extract question-answer pairs, which can be used to answer user queries.",
    impact: 7
  },
  howToMalformed: {
    problem: "The 'HowTo' guide is missing its sequence of 'step's.",
    solution: "Add a 'step' property containing an array of 'HowToStep' items to outline the process.",
    explanation: "The 'step' property is essential for AIs to understand the sequential nature of a tutorial and present it correctly.",
    impact: 7
  },
  
  // Graph Connectivity
  missingId: {
    problem: (entityType: string) => `The '${entityType}' entity is missing a unique identifier ('@id').`,
    solution: "Add a unique '@id' with the page's unique URL to this entity. Think of it as a unique 'address' that allows other schemas to connect to it.",
    explanation: "The '@id' is the glue of the Knowledge Graph. It allows you to create an interconnected web of data, rather than a list of isolated items, which is far more powerful for AI comprehension.",
    impact: 9
  },
  noConnectivity: {
    problem: "Entities are not linking to each other using '@id' references.",
    solution: "Use '@id' properties to create connections between related entities (e.g., an 'Article's 'author' property should link to the '@id' of a 'Person' entity).",
    explanation: "Creating explicit links between your entities transforms your data from a simple list into a rich, interconnected graph that AIs can traverse and understand.",
    impact: 8
  }
};


// ===================================================================================
// ANALYSIS FUNCTIONS
// ===================================================================================

/**
 * Analyzes Identity & Structure Foundation (30 points)
 */
function analyzeIdentityAndStructure(entities: SchemaEntity[]): MetricCard {
  let score = 0;
  const recommendations: Recommendation[] = [];

  const ownerEntity = entities.find(e => e['@type'] === 'Organization' || e['@type'] === 'Person');
  const ownerType = ownerEntity ? ownerEntity['@type'] : null;

  if (ownerEntity && ownerType) {
    score += 5;
    if (!ownerEntity.name) {
      const kbEntry = JSON_LD_KNOWLEDGE_BASE.ownerMissingName;
      recommendations.push({
        problem: kbEntry.problem(ownerType),
        solution: kbEntry.solution(ownerType),
        explanation: kbEntry.explanation,
        impact: kbEntry.impact,
      });
    }
    if (!ownerEntity.url) {
       const kbEntry = JSON_LD_KNOWLEDGE_BASE.ownerMissingUrl;
       recommendations.push({
         problem: kbEntry.problem(ownerType),
         solution: kbEntry.solution,
         explanation: kbEntry.explanation,
         impact: kbEntry.impact,
       });
    }
    if (ownerType === 'Organization') {
      if (ownerEntity.logo) score += 3;
      else recommendations.push(JSON_LD_KNOWLEDGE_BASE.orgMissingLogo);
    }
    if (ownerEntity.sameAs && (Array.isArray(ownerEntity.sameAs) ? ownerEntity.sameAs.length > 0 : true)) {
      score += 5;
    } else {
      const kbEntry = JSON_LD_KNOWLEDGE_BASE.ownerMissingSameAs;
      recommendations.push({
        problem: kbEntry.problem(ownerType),
        solution: kbEntry.solution,
        explanation: kbEntry.explanation,
        impact: kbEntry.impact,
      });
    }
    const bonusFields = ['address', 'contactPoint', 'description', 'foundingDate', 'founder'];
    if (bonusFields.some(field => ownerEntity[field])) {
      score += 2;
    }
  } else {
    recommendations.push(JSON_LD_KNOWLEDGE_BASE.noOwner);
  }

  const websiteEntity = entities.find(e => e['@type'] === 'WebSite');
  if (websiteEntity) {
    score += 5;
    const hasSearchAction = Array.isArray(websiteEntity.potentialAction)
      ? websiteEntity.potentialAction.some((a: any) => a['@type'] === 'SearchAction')
      : websiteEntity.potentialAction?.['@type'] === 'SearchAction';
    if (hasSearchAction) {
      score += 5;
    } else {
      recommendations.push(JSON_LD_KNOWLEDGE_BASE.noSearchAction);
    }
  } else {
    recommendations.push(JSON_LD_KNOWLEDGE_BASE.noWebsite);
  }

  const breadcrumbEntity = entities.find(e => e['@type'] === 'BreadcrumbList');
  if (breadcrumbEntity) {
    score += 5;
  } else {
    recommendations.push(JSON_LD_KNOWLEDGE_BASE.noBreadcrumb);
  }

  const finalScore = Math.min(score, JSON_LD_SCORING.IDENTITY_AND_STRUCTURE);
  return {
    id: 'identity-and-structure-analysis',
    name: 'Identity & Structure Foundation',
    score: finalScore,
    maxScore: JSON_LD_SCORING.IDENTITY_AND_STRUCTURE,
    status: getPerformanceStatus(finalScore, JSON_LD_SCORING.IDENTITY_AND_STRUCTURE),
    explanation: "Analyzes if your website clearly introduces itself (Who you are, what the site is, and its structure). This is the foundation of trust for AIs.",
    recommendations,
    successMessage: "Excellent! Your site's core identity and structure are clearly defined.",
    rawData: { /* raw data can be added here */ }
  };
}

/**
 * Analyzes the Main Entity (50 points)
 */
function analyzeMainEntity(entities: SchemaEntity[]): MetricCard {
  const mainEntity = entities.find(e => MAIN_ENTITY_TYPES.includes(e['@type'] as MainEntityType));
  
  if (!mainEntity) {
    return {
      id: 'main-entity-analysis',
      name: 'Main Entity Analysis',
      score: 0,
      maxScore: JSON_LD_SCORING.MAIN_ENTITY,
      status: 'error',
      explanation: "No main entity detected. A clear main entity (Article, Product, etc.) is critical for AI understanding of your page's purpose.",
      recommendations: [JSON_LD_KNOWLEDGE_BASE.noMainEntity],
      successMessage: "",
      rawData: { mainEntityFound: false }
    };
  }

  const entityType = mainEntity['@type'];
  let score = 10; // Base score for presence
  const recommendations: Recommendation[] = [];

  switch (entityType) {
    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      if (mainEntity.headline) {
        score += 10;
      } else {
        const kbEntry = JSON_LD_KNOWLEDGE_BASE.articleMissingHeadline;
        recommendations.push({
          problem: kbEntry.problem(entityType),
          solution: kbEntry.solution,
          explanation: kbEntry.explanation,
          impact: kbEntry.impact
        });
      }
      
      if (mainEntity.author && typeof mainEntity.author === 'object') {
        score += 15;
      } else {
        const kbEntry = JSON_LD_KNOWLEDGE_BASE.authorIsText;
        recommendations.push({
          problem: kbEntry.problem(entityType),
          solution: kbEntry.solution,
          explanation: kbEntry.explanation,
          impact: kbEntry.impact
        });
      }
      
      if (mainEntity.publisher && typeof mainEntity.publisher === 'object') {
        score += 10;
      } else {
        const kbEntry = JSON_LD_KNOWLEDGE_BASE.publisherIsText;
        recommendations.push({
          problem: kbEntry.problem(entityType),
          solution: kbEntry.solution,
          explanation: kbEntry.explanation,
          impact: kbEntry.impact
        });
      }

      if (mainEntity.image) score += 5; // Other minor checks
      break;

    case 'Product':
      if (mainEntity.name) score += 5;
      if (mainEntity.description) score += 5;
      if (mainEntity.image) score += 5;
      
      if (mainEntity.offers) {
        score += 20;
      } else {
        recommendations.push(JSON_LD_KNOWLEDGE_BASE.productMissingOffers);
      }

      if (mainEntity.aggregateRating || mainEntity.review) score += 5;
      break;
    
    // Other cases for Service, LocalBusiness, etc. can be added here
  }

  const finalScore = Math.min(score, JSON_LD_SCORING.MAIN_ENTITY);
  return {
    id: 'main-entity-analysis',
    name: `Main Entity Analysis (${entityType})`,
    score: finalScore,
    maxScore: JSON_LD_SCORING.MAIN_ENTITY,
    status: getPerformanceStatus(finalScore, JSON_LD_SCORING.MAIN_ENTITY),
    explanation: `In-depth analysis of the page's main subject (${entityType}). Its richness and connectivity are vital for AI comprehension.`,
    recommendations,
    successMessage: `Excellent! Your '${entityType}' entity is rich and well-structured.`,
    rawData: { mainEntityFound: true, mainEntityType: entityType }
  };
}


/**
 * Analyzes Enrichment Schemas (20 points)
 */
function analyzeEnrichmentSchemas(entities: SchemaEntity[]): MetricCard | null {
  let score = 0;
  const recommendations: Recommendation[] = [];
  const foundSchemas: string[] = [];

  const faqPage = entities.find(e => e['@type'] === 'FAQPage');
  if (faqPage) {
    foundSchemas.push('FAQPage');
    if (faqPage.mainEntity && Array.isArray(faqPage.mainEntity) && faqPage.mainEntity.length > 0) {
      score += 10;
    } else {
      score += 5;
      recommendations.push(JSON_LD_KNOWLEDGE_BASE.faqMalformed);
    }
  }

  const howTo = entities.find(e => e['@type'] === 'HowTo');
  if (howTo) {
    foundSchemas.push('HowTo');
    if (howTo.step && Array.isArray(howTo.step) && howTo.step.length > 0) {
      score += 10;
    } else {
      score += 5;
      recommendations.push(JSON_LD_KNOWLEDGE_BASE.howToMalformed);
    }
  }

  if (foundSchemas.length === 0) {
    return null;
  }

  return {
    id: 'enrichment-analysis',
    name: 'Content Enrichment Schemas',
    score,
    maxScore: JSON_LD_SCORING.ENRICHMENT_SCHEMAS,
    status: getPerformanceStatus(score, JSON_LD_SCORING.ENRICHMENT_SCHEMAS),
    explanation: 'Analyzes "bonus" schemas like FAQ and How-To guides that add rich, interactive context to your page.',
    recommendations,
    successMessage: `Excellent! Your enrichment schemas (${foundSchemas.join(', ')}) add valuable interactive content.`,
    rawData: { foundSchemas }
  };
}


/**
 * Analyzes Knowledge Graph Connectivity (10 points)
 */
function analyzeGraphConnectivity(entities: SchemaEntity[]): MetricCard {
  let score = 0;
  const recommendations: Recommendation[] = [];

  const checkId = (entity: SchemaEntity | undefined) => {
    if (entity) {
      if (entity['@id']) {
        score += 2;
      } else {
        const kbEntry = JSON_LD_KNOWLEDGE_BASE.missingId;
        recommendations.push({ 
          problem: kbEntry.problem(entity['@type']),
          solution: kbEntry.solution,
          explanation: kbEntry.explanation,
          impact: kbEntry.impact
        });
      }
    }
  };

  checkId(entities.find(e => e['@type'] === 'Organization' || e['@type'] === 'Person'));
  checkId(entities.find(e => e['@type'] === 'WebSite'));
  checkId(entities.find(e => MAIN_ENTITY_TYPES.includes(e['@type'] as MainEntityType)));
  checkId(entities.find(e => e['@type'] === 'BreadcrumbList'));

  const hasConnectivity = entities.some(entity => Object.values(entity).some(value => 
    typeof value === 'object' && value !== null && '@id' in value
  ));

  if (hasConnectivity) {
    score += 2;
  } else if (entities.length > 1) {
    recommendations.push(JSON_LD_KNOWLEDGE_BASE.noConnectivity);
  }
  
  const finalScore = Math.min(score, JSON_LD_SCORING.GRAPH_CONNECTIVITY);
  return {
    id: 'graph-connectivity-analysis',
    name: 'Knowledge Graph Connectivity',
    score: finalScore,
    maxScore: JSON_LD_SCORING.GRAPH_CONNECTIVITY,
    status: getPerformanceStatus(finalScore, JSON_LD_SCORING.GRAPH_CONNECTIVITY),
    explanation: "A web page is a graph of connected things (the company, the article, the author). This section checks if you are using '@id' properties to create these crucial links.",
    recommendations,
    successMessage: "Excellent! Your entities are properly connected through '@id' properties.",
    rawData: { /* raw data can be added here */ }
  };
}


// ===================================================================================
// MAIN ORCHESTRATOR
// ===================================================================================

/**
 * Main JSON-LD analysis function
 */
export function analyzeJsonLD(html: string): {
  cards: MetricCard[];
  perfectItems: string[]; // Can be deprecated if not used in UI
  totalScore: number;
  maxScore: number;
} {
  const allEntities = parseAndNormalizeEntities(html);
  
  const identityCard = analyzeIdentityAndStructure(allEntities);
  const mainEntityCard = analyzeMainEntity(allEntities);
  const enrichmentCard = analyzeEnrichmentSchemas(allEntities);
  const connectivityCard = analyzeGraphConnectivity(allEntities);
  
  const cards = [identityCard, mainEntityCard, connectivityCard];
  if (enrichmentCard) {
    cards.push(enrichmentCard);
  }
  
  const totalScore = cards.reduce((sum, card) => (card ? sum + card.score : sum), 0);
  const maxScore = cards.reduce((sum, card) => (card ? sum + card.maxScore : sum), 0);
  
  const perfectItems = cards
    .filter(card => card && (!card.recommendations || card.recommendations.length === 0))
    .map(card => `${card.name} is well-configured.`);

  return {
    cards: cards.filter(Boolean) as MetricCard[],
    perfectItems,
    totalScore,
    maxScore
  };
}