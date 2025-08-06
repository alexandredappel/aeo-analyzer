/**
 * JSON-LD ANALYSIS MODULE
 * Comprehensive semantic analysis of JSON-LD structured data
 * Includes identity, main entity, enrichment schemas, and graph connectivity analysis
 */

import { MetricCard, Recommendation, DrawerSubSection } from '@/types/analysis-architecture';
import { 
  parseAndNormalizeEntities, 
  parseJSONLD, 
  getPerformanceStatus, 
  calculateDiversityBonus,
  calculateSchemaScore
} from './shared/utils';
import { 
  JSON_LD_SCORING, 
  MAIN_ENTITY_TYPES, 
  SCHEMA_WEIGHTS, 
  UNKNOWN_SCHEMA_BONUS, 
  MAX_SCHEMA_POINTS,
  REQUIRED_SCHEMA_FIELDS
} from './shared/constants';
import { JSONLDData, SchemaEntity, MainEntityType } from './shared/types';

/**
 * NEW ANALYZER: Identity & Structure Foundation
 * 
 * Analyzes if the website clearly introduces itself: Who you are (Organization),
 * what the site is (WebSite), and its structure (BreadcrumbList).
 * This is the foundation of trust and understanding for AIs.
 * 
 * @param entities Array of normalized Schema.org entities
 * @returns MetricCard with identity and structure analysis
 */
function analyzeIdentityAndStructure(entities: SchemaEntity[]): MetricCard {
  let score = 0;
  let recommendations: Recommendation[] = [];

  // Owner entity analysis (Organization or Person) - 15 points max
  const organizationEntity = entities.find(entity => entity['@type'] === 'Organization');
  const personEntity = entities.find(entity => entity['@type'] === 'Person');
  const ownerEntity = organizationEntity || personEntity;
  const ownerType = organizationEntity ? 'Organization' : (personEntity ? 'Person' : null);

  if (ownerEntity && ownerType) {
    score += 5; // Base points for having owner entity

    // Check for name
    if (!ownerEntity.name) {
      recommendations.push({
        problem: `The '${ownerType}' entity is missing a 'name'.`,
        solution: `Provide a 'name' for your '${ownerType}' to state who you are.`
      });
    }

    // Check for url
    if (!ownerEntity.url) {
      recommendations.push({
        problem: `The '${ownerType}' entity is missing a 'url'.`,
        solution: `Add a 'url' property pointing to your homepage to link your entity to your site.`
      });
    }

    // Check for logo (Organization only) (+3 points)
    if (ownerType === 'Organization') {
      if (ownerEntity.logo) {
        score += 3;
      } else {
        recommendations.push({
          problem: "The 'Organization' entity is missing a 'logo'.",
          solution: "Add a 'logo' property with a full URL to your logo image to improve brand recognition."
        });
      }
    }

    // Check for sameAs (+5 points)
    if (ownerEntity.sameAs && Array.isArray(ownerEntity.sameAs) && ownerEntity.sameAs.length > 0) {
      score += 5;
    } else if (ownerEntity.sameAs && typeof ownerEntity.sameAs === 'string') {
      score += 5;
    } else {
      recommendations.push({
        problem: `The '${ownerType}' entity is missing 'sameAs' links to social or professional profiles.`,
        solution: `Add a 'sameAs' array with URLs to your social profiles to consolidate your identity.`
      });
    }

    // Bonus for additional fields (+2 points)
    const bonusFields = ['address', 'contactPoint', 'description', 'foundingDate', 'founder'];
    const presentBonusFields = bonusFields.filter(field => ownerEntity[field]);
    if (presentBonusFields.length > 0) {
      score += 2;
    }
  } else {
    recommendations.push({
      problem: "No 'Organization' or 'Person' entity was found to define the site owner.",
      solution: "Add an 'Organization' schema for a company or a 'Person' schema for an individual."
    });
  }

  // WebSite analysis (10 points max)
  const websiteEntity = entities.find(entity => entity['@type'] === 'WebSite');
  if (websiteEntity) {
    score += 5; // Base points for having WebSite entity

    // Check for potentialAction
    if (websiteEntity.potentialAction) {
      const searchAction = Array.isArray(websiteEntity.potentialAction) 
        ? websiteEntity.potentialAction.find((action: any) => action['@type'] === 'SearchAction')
        : (websiteEntity.potentialAction['@type'] === 'SearchAction' ? websiteEntity.potentialAction : null);
      
      if (searchAction) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'WebSite' entity's 'potentialAction' is not a 'SearchAction'.",
          solution: "Ensure the 'potentialAction' property contains an object with '@type': 'SearchAction'."
        });
      }
    } else {
      recommendations.push({
        problem: "The 'WebSite' entity is missing the 'potentialAction' property.",
        solution: "Add a 'potentialAction' property containing a 'SearchAction' to define your internal site search."
      });
    }
  } else {
    recommendations.push({
      problem: "No 'WebSite' entity was found.",
      solution: "Add a 'WebSite' schema to describe the site itself and its functionalities."
    });
  }

  // BreadcrumbList analysis (5 points max)
  const breadcrumbEntity = entities.find(entity => entity['@type'] === 'BreadcrumbList');
  if (breadcrumbEntity) {
    score += 5;
  } else {
    recommendations.push({
      problem: "No 'BreadcrumbList' entity was found on this page.",
      solution: "Implement a 'BreadcrumbList' to show the page's location within the site hierarchy."
    });
  }

  // Ensure score doesn't exceed maximum
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
    rawData: {
      organizationFound: !!organizationEntity,
      personFound: !!personEntity,
      ownerEntityLogo: !!(ownerEntity?.logo),
      ownerEntitySameAs: !!(ownerEntity?.sameAs),
      websiteFound: !!websiteEntity,
      websiteSearchAction: !!(websiteEntity?.potentialAction),
      breadcrumbFound: !!breadcrumbEntity,
      totalEntities: entities.length
    }
  };
}

/**
 * NEW ANALYZER: Main Entity Analysis
 * 
 * Intelligently detects the main topic of the page (Article, Product, etc.) and performs
 * a deep, context-aware analysis of that specific schema. Focuses on semantic richness
 * and connectivity between entities - crucial for AI understanding.
 * 
 * @param entities Array of normalized Schema.org entities
 * @returns MetricCard with main entity analysis
 */
function analyzeMainEntity(entities: SchemaEntity[]): MetricCard {
  // Find the first main entity
  const mainEntity = entities.find(entity => MAIN_ENTITY_TYPES.includes(entity['@type'] as MainEntityType));
  
  // If no main entity found, return error card
  if (!mainEntity) {
    return {
      id: 'main-entity-analysis',
      name: 'Main Entity Analysis',
      score: 0,
      maxScore: JSON_LD_SCORING.MAIN_ENTITY,
      status: 'error',
      explanation: "No main entity detected. A clear main entity (Article, Product, etc.) is critical for AI understanding of your page's purpose.",
      recommendations: [{
        problem: "No main entity (e.g., Article, Product, Service) was found on this page.",
        solution: "Add a primary schema that accurately describes the main content of this page."
      }],
      successMessage: "A main entity schema has been properly implemented.",
      rawData: {
        mainEntityFound: false,
        mainEntityType: null,
        totalEntities: entities.length
      }
    };
  }

  const entityType = mainEntity['@type'];
  let score = 10; // Base points for detecting a main entity
  let recommendations: Recommendation[] = [];

  // Switch analysis based on entity type
  switch (entityType) {
    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      // Headline check (+10 points)
      if (mainEntity.headline) {
        score += 10;
      } else {
        recommendations.push({
          problem: `The '${entityType}' is missing a 'headline'.`,
          solution: "Add a 'headline' property with the main title of the content."
        });
      }

      // Image check (+5 points)
      if (mainEntity.image) {
        score += 5;
      } else {
        recommendations.push({
          problem: `The '${entityType}' is missing an 'image'.`,
          solution: "Add an 'image' property with a URL to a relevant high-quality image."
        });
      }

      // Author connectivity check (+15 points)
      if (mainEntity.author && typeof mainEntity.author === 'object') {
        score += 15;
      } else if (mainEntity.author && typeof mainEntity.author === 'string') {
        recommendations.push({
          problem: `The '${entityType}' author is plain text instead of a linked 'Person' entity.`,
          solution: "Change the 'author' from a simple name to a nested 'Person' schema to establish expertise."
        });
      } else {
        recommendations.push({
          problem: `The '${entityType}' is missing an 'author'.`,
          solution: "Specify the content's 'author' using a nested 'Person' schema."
        });
      }

      // Publisher connectivity check (+10 points)
      if (mainEntity.publisher && typeof mainEntity.publisher === 'object') {
        score += 10;
      } else if (mainEntity.publisher && typeof mainEntity.publisher === 'string') {
        recommendations.push({
          problem: `The '${entityType}' publisher is plain text instead of a linked 'Organization' entity.`,
          solution: "Change the 'publisher' to a nested 'Organization' schema to clarify who published the content."
        });
      } else {
        recommendations.push({
          problem: `The '${entityType}' is missing a 'publisher'.`,
          solution: "Specify the content's 'publisher' using a nested 'Organization' schema."
        });
      }

      // Optional datePublished check (+5 points)
      if (mainEntity.datePublished) {
        score += 5;
      } else {
        recommendations.push({
          problem: `The '${entityType}' is missing 'datePublished' information.`,
          solution: "Add a 'datePublished' property in ISO 8601 format (e.g., '2023-10-28T12:00:00Z')."
        });
      }
      break;

    case 'Product':
      // Name check (+5 points)
      if (mainEntity.name) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'Product' is missing a 'name'.",
          solution: "Add a 'name' property with the full name of the product."
        });
      }

      // Description check (+5 points)
      if (mainEntity.description) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'Product' is missing a 'description'.",
          solution: "Add a 'description' property with a compelling summary of the product."
        });
      }

      // Image check (+5 points)
      if (mainEntity.image) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'Product' is missing an 'image'.",
          solution: "Add an 'image' property with a URL to a high-quality product photo."
        });
      }

      // Offers check (+20 points - CRUCIAL)
      if (mainEntity.offers) {
        score += 20;
        
        const offers = Array.isArray(mainEntity.offers) ? mainEntity.offers[0] : mainEntity.offers;
        
        // Check price within offers
        if (!offers.price && !offers.priceRange) {
          recommendations.push({
            problem: "The 'Offer' within the 'Product' is missing a 'price'.",
            solution: "Add a 'price' property inside your 'Offer' schema."
          });
        }

        // Check priceCurrency
        if (!offers.priceCurrency) {
          recommendations.push({
            problem: "The 'Offer' within the 'Product' is missing its 'priceCurrency'.",
            solution: "Add a 'priceCurrency' property (e.g., 'USD', 'EUR') inside your 'Offer' schema."
          });
        }

        // Check availability
        if (!offers.availability) {
          recommendations.push({
            problem: "The 'Offer' within the 'Product' is missing 'availability' information.",
            solution: "Add an 'availability' property with a valid Schema URL (e.g., 'InStock')."
          });
        }
      } else {
        recommendations.push({
          problem: "The 'Product' is missing the 'offers' property.",
          solution: "Add an 'offers' property containing an 'Offer' schema to provide price and availability."
        });
      }

      // AggregateRating check (+5 points)
      if (mainEntity.aggregateRating || mainEntity.review) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'Product' is missing 'aggregateRating' or 'review' information.",
          solution: "Add an 'aggregateRating' or 'review' schema to display customer feedback."
        });
      }

      // Brand check (+5 points)
      if (mainEntity.brand) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'Product' is missing a 'brand'.",
          solution: "Add a 'brand' property, ideally as a nested 'Organization' schema."
        });
      }
      break;

    case 'LocalBusiness':
      // Name check (+5 points)
      if (mainEntity.name) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'LocalBusiness' is missing a 'name'.",
          solution: "Add a 'name' property with the official name of the business."
        });
      }

      // Address check (+15 points)
      if (mainEntity.address) {
        score += 15;
      } else {
        recommendations.push({
          problem: "The 'LocalBusiness' is missing an 'address'.",
          solution: "Add an 'address' property, ideally as a nested 'PostalAddress' schema."
        });
      }

      // Telephone check (+10 points)
      if (mainEntity.telephone) {
        score += 10;
      } else {
        recommendations.push({
          problem: "The 'LocalBusiness' is missing a 'telephone' number.",
          solution: "Add a 'telephone' property with your primary business phone number."
        });
      }

      // OpeningHours check (+10 points)
      if (mainEntity.openingHours) {
        score += 10;
      } else {
        recommendations.push({
          problem: "The 'LocalBusiness' is missing its 'openingHours'.",
          solution: "Add an 'openingHours' property to specify your hours of operation."
        });
      }
      break;

    case 'Service':
      // Name check (+10 points)
      if (mainEntity.name) {
        score += 10;
      } else {
        recommendations.push({
          problem: "The 'Service' is missing a 'name'.",
          solution: "Add a 'name' property to clearly state the name of the service offered."
        });
      }

      // Description check (+10 points)
      if (mainEntity.description) {
        score += 10;
      } else {
        recommendations.push({
          problem: "The 'Service' is missing a 'description'.",
          solution: "Add a 'description' property to explain what the service entails."
        });
      }

      // Provider connectivity check (+15 points - CRUCIAL)
      if (mainEntity.provider && typeof mainEntity.provider === 'object') {
        score += 15;
      } else {
        recommendations.push({
          problem: "The 'Service' 'provider' should be a linked 'Organization' or 'Person' entity.",
          solution: "Change the 'provider' property to link to your main 'Organization' or 'Person' entity."
        });
      }

      // AreaServed check (+5 points)
      if (mainEntity.areaServed) {
        score += 5;
      } else {
        recommendations.push({
          problem: "The 'Service' is missing an 'areaServed' property.",
          solution: "Specify the geographic area you serve using the 'areaServed' property."
        });
      }
      break;

    default:
      // Fallback for other entity types
      score += 20; // Basic bonus for having any other main entity
      break;
  }

  // Ensure score doesn't exceed maximum
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
    rawData: {
      mainEntityFound: true,
      mainEntityType: entityType,
      hasHeadline: !!(mainEntity.headline),
      hasImage: !!(mainEntity.image),
      authorIsObject: !!(mainEntity.author && typeof mainEntity.author === 'object'),
      publisherIsObject: !!(mainEntity.publisher && typeof mainEntity.publisher === 'object'),
      hasOffers: !!(mainEntity.offers),
      hasAggregateRating: !!(mainEntity.aggregateRating),
      hasBrand: !!(mainEntity.brand),
      hasDescription: !!(mainEntity.description),
      totalEntities: entities.length
    }
  };
}

/**
 * Analyzes enrichment schemas (FAQPage, HowTo) for bonus content (20 points)
 * These are "bonus" schemas that add rich, interactive context to the page.
 * 
 * @param entities Array of normalized Schema.org entities
 * @returns MetricCard with enrichment analysis or null if none found
 */
function analyzeEnrichmentSchemas(entities: SchemaEntity[]): MetricCard | null {
  let score = 0;
  let recommendations: Recommendation[] = [];
  const foundSchemas: string[] = [];

  // Check for FAQPage
  const faqPage = entities.find(entity => entity['@type'] === 'FAQPage');
  if (faqPage) {
    foundSchemas.push('FAQPage');
    
    // Validate FAQPage structure
    if (faqPage.mainEntity && Array.isArray(faqPage.mainEntity) && faqPage.mainEntity.length > 0) {
      score += 10;
    } else {
      score += 5; // Partial points for presence
      recommendations.push({
        problem: "The 'FAQPage' exists but is missing well-structured questions and answers.",
        solution: "Add a 'mainEntity' array containing 'Question' entities with 'acceptedAnswer' properties."
      });
    }
  }

  // Check for HowTo
  const howTo = entities.find(entity => entity['@type'] === 'HowTo');
  if (howTo) {
    foundSchemas.push('HowTo');
    
    // Validate HowTo structure  
    if (howTo.step && Array.isArray(howTo.step) && howTo.step.length > 0) {
      score += 10;
      
      // Check if steps are well-formed
      const firstStep = howTo.step[0];
      if (!firstStep || (!firstStep.text && !firstStep.name)) {
        recommendations.push({
          problem: "A 'HowToStep' is missing its 'text' or 'name' description.",
          solution: "Ensure every item in your 'step' array has a 'text' property describing the instruction."
        });
      }
      
      // Check for totalTime
      if (!howTo.totalTime) {
        recommendations.push({
          problem: "The 'HowTo' guide is missing the 'totalTime' property.",
          solution: "Add a 'totalTime' property in ISO 8601 duration format (e.g., 'PT2H30M')."
        });
      }
    } else {
      score += 5; // Partial points for presence
      recommendations.push({
        problem: "The 'HowTo' guide is missing its sequence of 'step's.",
        solution: "Add a 'step' property containing an array of 'HowToStep' items."
      });
    }
  }

  // If no enrichment schemas found, return null
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
    rawData: {
      foundSchemas,
      hasFAQPage: !!faqPage,
      hasHowTo: !!howTo,
      totalSchemas: foundSchemas.length
    }
  };
}

/**
 * Analyzes knowledge graph connectivity through @id usage (10 points)
 * Checks if entities use @id properties to create reliable entity links.
 * 
 * @param entities Array of normalized Schema.org entities
 * @returns MetricCard with graph connectivity analysis
 */
function analyzeGraphConnectivity(entities: SchemaEntity[]): MetricCard {
  let score = 0;
  let recommendations: Recommendation[] = [];
  const checkedEntities: string[] = [];

  // Check Organization/Person
  const owner = entities.find(entity => 
    entity['@type'] === 'Organization' || entity['@type'] === 'Person'
  );
  if (owner) {
    const ownerType = owner['@type'];
    checkedEntities.push(ownerType);
    
    if (owner['@id']) {
      score += 2;
    } else {
      recommendations.push({
        problem: `The '${ownerType}' entity is missing a unique identifier ('@id').`,
        solution: "Add an '@id' with the page's unique URL to this entity. Think of it as a unique 'address' that allows other schemas (like an author linking to an article or organization linking to its homepage) to connect to it, creating a rich knowledge graph for AIs."
      });
    }
  }

  // Check WebSite
  const website = entities.find(entity => entity['@type'] === 'WebSite');
  if (website) {
    checkedEntities.push('WebSite');
    
    if (website['@id']) {
      score += 2;
    } else {
      recommendations.push({
        problem: "The 'WebSite' entity is missing a unique identifier ('@id').",
        solution: "Add an '@id' with the page's unique URL to this entity. Think of it as a unique 'address' that allows other schemas (like an author linking to an article or organization linking to its homepage) to connect to it, creating a rich knowledge graph for AIs."
      });
    }
  }

  // Check main entity (Article, Product, Service, etc.)
  const mainEntity = entities.find(entity => MAIN_ENTITY_TYPES.includes(entity['@type'] as MainEntityType));
  if (mainEntity) {
    const entityType = mainEntity['@type'];
    checkedEntities.push(entityType);
    
    if (mainEntity['@id']) {
      score += 2;
    } else {
      recommendations.push({
        problem: `The '${entityType}' entity is missing a unique identifier ('@id').`,
        solution: "Add an '@id' with the page's unique URL to this entity. Think of it as a unique 'address' that allows other schemas (like an author linking to an article or organization linking to its homepage) to connect to it, creating a rich knowledge graph for AIs."
      });
    }
  }

  // Check BreadcrumbList
  const breadcrumb = entities.find(entity => entity['@type'] === 'BreadcrumbList');
  if (breadcrumb) {
    checkedEntities.push('BreadcrumbList');
    
    if (breadcrumb['@id']) {
      score += 2;
    } else {
      recommendations.push({
        problem: "The 'BreadcrumbList' entity is missing a unique identifier ('@id').",
        solution: "Add an '@id' with the page's unique URL to this entity. Think of it as a unique 'address' that allows other schemas (like an author linking to an article or organization linking to its homepage) to connect to it, creating a rich knowledge graph for AIs."
      });
    }
  }

  // Additional connectivity bonus: Check if any entity references others by @id
  const hasConnectivity = entities.some(entity => {
    return Object.values(entity).some(value => {
      if (typeof value === 'object' && value !== null && '@id' in value) {
        return true;
      }
      return false;
    });
  });

  if (hasConnectivity) {
    score += 2;
  } else if (checkedEntities.length > 1) {
    recommendations.push({
      problem: "Entities are not linking to each other using '@id' references.",
      solution: "Use '@id' properties to create connections between related entities (e.g., author linking to Organization)."
    });
  }

  return {
    id: 'graph-connectivity-analysis',
    name: 'Knowledge Graph Connectivity',
    score,
    maxScore: JSON_LD_SCORING.GRAPH_CONNECTIVITY,
    status: getPerformanceStatus(score, JSON_LD_SCORING.GRAPH_CONNECTIVITY),
    explanation: "A web page is a graph of connected things (the company, the article, the author). This section checks if you are using '@id' properties to create these crucial links.",
    recommendations,
    successMessage: "Excellent! Your entities are properly connected through '@id' properties.",
    rawData: {
      checkedEntities,
      entitiesWithId: entities.filter(e => e['@id']).length,
      totalEntities: entities.length,
      hasEntityConnectivity: hasConnectivity
    }
  };
}

/**
 * Legacy JSON-LD analysis functions (for backwards compatibility)
 */
function analyzeJSONLDPresence(jsonldData: JSONLDData): MetricCard {
  let score = 0;
  let recommendations: Recommendation[] = [];

  // Presence check (10 points)
  if (jsonldData.totalScripts > 0) {
    score += 10;
  } else {
    recommendations.push({
      problem: "No JSON-LD structured data found on the page",
      solution: "Add JSON-LD structured data to your page head section"
    });
  }

  // Validity check (10 points)
  if (jsonldData.validSchemas.length > 0) {
    score += 10;
  } else if (jsonldData.totalScripts > 0) {
    recommendations.push({
      problem: "JSON-LD scripts found but contain invalid JSON syntax",
      solution: "Validate JSON-LD syntax using Google's Structured Data Testing Tool"
    });
  }

  return {
    id: 'jsonld-presence',
    name: 'JSON-LD Presence & Validity',
    score,
    maxScore: 20,
    status: getPerformanceStatus(score, 20),
    explanation: "JSON-LD structured data helps search engines and AI understand your content context and purpose. Valid JSON-LD improves rich snippet eligibility and content comprehension.",
    recommendations,
    successMessage: "Perfect! Your JSON-LD structured data is valid and well-formed.",
    rawData: {
      totalScripts: jsonldData.totalScripts,
      validSchemas: jsonldData.validSchemas,
      invalidSchemas: jsonldData.invalidSchemas
    }
  };
}

function analyzeSchemaTypesCompleteness(jsonldData: JSONLDData): MetricCard {
  let score = 0;
  let recommendations: Recommendation[] = [];

  if (jsonldData.validSchemas.length === 0) {
    recommendations.push({
      problem: "No valid schema types detected",
      solution: "Add relevant schema types for your content"
    });
  } else {
    // Use the shared utility function
    score = calculateSchemaScore(jsonldData.validSchemas, jsonldData.schemaCompleteness);
    
    // Generate recommendations for incomplete schemas
    Object.entries(jsonldData.schemaCompleteness).forEach(([schemaType, completeness]) => {
      if (completeness < 80) {
        recommendations.push({
          problem: `${schemaType} schema is incomplete (${Math.round(completeness)}% complete)`,
          solution: "Add missing required fields to your schema markup"
        });
      }
    });
  }

  return {
    id: 'schema-types-completeness',
    name: 'Schema Types & Completeness',
    score,
    maxScore: 20,
    status: getPerformanceStatus(score, 20),
    explanation: "Comprehensive schema types with complete field information help AI understand your content's specific context and relationships.",
    recommendations,
    successMessage: "Excellent! You have comprehensive schema types covering your content.",
    rawData: {
      detectedSchemas: Array.from(new Set(jsonldData.validSchemas)),
      completenessScores: jsonldData.schemaCompleteness,
      diversityBonus: calculateDiversityBonus(jsonldData.validSchemas) > 0
    }
  };
}

/**
 * Generates perfect items list for JSON-LD drawer based on successful checks
 */
export function generateJsonLdPerfectItems(allEntities: SchemaEntity[], cards: MetricCard[]): string[] {
  const perfectItems: string[] = [];
  
  // Check for successful elements from each card
  cards.forEach(card => {
    // Only add perfect items if the card has no recommendations (meaning everything passed)
    if (!card.recommendations || card.recommendations.length === 0) {
      switch (card.id) {
        case 'identity-and-structure-analysis':
          // Check what elements are present and working
          const owner = allEntities.find(e => e['@type'] === 'Organization' || e['@type'] === 'Person');
          if (owner) {
            perfectItems.push(`${owner['@type']} entity with complete identity information`);
          }
          
          const website = allEntities.find(e => e['@type'] === 'WebSite');
          if (website && website.potentialAction) {
            perfectItems.push('WebSite with functional search capability');
          }
          
          const breadcrumb = allEntities.find(e => e['@type'] === 'BreadcrumbList');
          if (breadcrumb) {
            perfectItems.push('BreadcrumbList for clear site navigation');
          }
          break;
          
        case 'main-entity-analysis':
          const mainEntity = allEntities.find(entity => MAIN_ENTITY_TYPES.includes(entity['@type'] as MainEntityType));
          if (mainEntity) {
            perfectItems.push(`Well-structured ${mainEntity['@type']} as main content entity`);
          }
          break;
          
        case 'enrichment-analysis':
          const faq = allEntities.find(e => e['@type'] === 'FAQPage');
          const howto = allEntities.find(e => e['@type'] === 'HowTo');
          if (faq) perfectItems.push('FAQPage providing helpful Q&A content');
          if (howto) perfectItems.push('HowTo guide with clear step-by-step instructions');
          break;
          
        case 'graph-connectivity-analysis':
          const entitiesWithId = allEntities.filter(e => e['@id']).length;
          if (entitiesWithId > 0) {
            perfectItems.push(`${entitiesWithId} entities with proper @id identifiers for connectivity`);
          }
          break;
      }
    } else {
      // Even if there are some recommendations, we can still highlight partial successes
      switch (card.id) {
        case 'identity-and-structure-analysis':
          const owner = allEntities.find(e => e['@type'] === 'Organization' || e['@type'] === 'Person');
          if (owner && owner.name) {
            perfectItems.push(`${owner['@type']} entity found and properly named`);
          }
          break;
          
        case 'main-entity-analysis':
          const mainEntity = allEntities.find(entity => MAIN_ENTITY_TYPES.includes(entity['@type'] as MainEntityType));
          if (mainEntity) {
            perfectItems.push(`${mainEntity['@type']} detected as main page content`);
          }
          break;
      }
    }
  });
  
  return perfectItems;
}

/**
 * Main JSON-LD analysis function
 * Orchestrates all JSON-LD analyses and returns results
 */
export function analyzeJsonLD(html: string): {
  cards: MetricCard[];
  perfectItems: string[];
  totalScore: number;
  maxScore: number;
} {
  // Parse entities once for all analyses
  const allEntities = parseAndNormalizeEntities(html);
  
  // Run new semantic analyses (4 distinct parts)
  const identityCard = analyzeIdentityAndStructure(allEntities);
  const mainEntityCard = analyzeMainEntity(allEntities);
  const enrichmentCard = analyzeEnrichmentSchemas(allEntities); // Might be null
  const connectivityCard = analyzeGraphConnectivity(allEntities);
  
  // Calculate total semantic analysis scores
  const cards = [identityCard, mainEntityCard, connectivityCard];
  if (enrichmentCard) {
    cards.push(enrichmentCard);
  }
  
  const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
  const maxScore = cards.reduce((sum, card) => sum + card.maxScore, 0);
  const perfectItems = generateJsonLdPerfectItems(allEntities, cards);

  return {
    cards,
    perfectItems,
    totalScore,
    maxScore
  };
}

// Export legacy functions for backwards compatibility
export {
  parseJSONLD,
  analyzeJSONLDPresence,
  analyzeSchemaTypesCompleteness,
  analyzeIdentityAndStructure,
  analyzeMainEntity,
  analyzeEnrichmentSchemas,
  analyzeGraphConnectivity
};