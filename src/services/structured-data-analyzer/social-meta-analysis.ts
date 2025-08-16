/**
 * SOCIAL META ANALYSIS MODULE
 * Analyzes Open Graph and Twitter Card meta tags for LLM optimization
 * 
 * New unified architecture with 100-point scoring system
 * Based on: NOUVELLE-STRUCTURE-SOCIAL-META-ANALYSIS.md
 * Knowledge Base: PROBLEMES-SOLUTIONS-META-SOCIAL-ANALYSIS.md
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';

// ===== KNOWLEDGE BASE =====

const SOCIAL_META_KB = {
  // Core Content
  missingOgTitle: {
    problem: "Open Graph title (`og:title`) is missing.",
    solution: "Add the `<meta property=\"og:title\" content=\"Your Page Title\">` tag to your page's `<head>`.",
    explanation: "This tag explicitly tells AIs the primary subject of your content when it's shared, acting as a concise and reliable title.",
    impact: 9
  },
  missingOgDescription: {
    problem: "Open Graph description (`og:description`) is missing.",
    solution: "Add the `<meta property=\"og:description\" content=\"A concise summary of your page.\">` tag.",
    explanation: "This provides a short, trustworthy summary for AIs to quickly understand the page's purpose without parsing the whole content.",
    impact: 9
  },
  missingOgImage: {
    problem: "Open Graph image (`og:image`) is missing.",
    solution: "Add the `<meta property=\"og:image\" content=\"https://your-site.com/image.jpg\">` tag with a full, absolute URL.",
    explanation: "The OG image provides crucial visual context. For multimodal AIs, it's a primary element for content representation.",
    impact: 9
  },
  missingOgUrl: {
    problem: "Open Graph URL (`og:url`) is missing.",
    solution: "Add the `<meta property=\"og:url\" content=\"https://your-site.com/your-canonical-page\">` tag.",
    explanation: "This tag acts as the permanent identifier (permalink) of the content, preventing AI confusion from duplicate or parameterized URLs.",
    impact: 7
  },

  // Context & Classification
  missingOgType: {
    problem: "Open Graph type (`og:type`) is missing.",
    solution: "Add the `<meta property=\"og:type\" content=\"article\">` tag (or `website`, `product`).",
    explanation: "This is a fundamental classification that tells AIs whether your content is an article, a product, or something else, guiding its analysis.",
    impact: 9
  },
  missingTwitterCard: {
    problem: "Twitter Card type (`twitter:card`) is missing.",
    solution: "Add the `<meta name=\"twitter:card\" content=\"summary_large_image\">` tag for maximum visual impact.",
    explanation: "This tag is the master switch for controlling how your content is summarized on a major platform, signaling a well-configured page to AIs.",
    impact: 8
  },
  missingOgImageAlt: {
    problem: "`og:image` is present, but its descriptive text (`og:image:alt`) is missing.",
    solution: "Add a companion `<meta property=\"og:image:alt\" content=\"A description of the image's content.\">` tag.",
    explanation: "This provides a direct textual description of the visual content, which is invaluable for AIs to understand the image's context.",
    impact: 6
  },

  // Attribution & Technical Quality
  missingSiteName: {
    problem: "Website name (`og:site_name`) is missing.",
    solution: "Add the `<meta property=\"og:site_name\" content=\"Your Website Name\">` tag.",
    explanation: "This tag consistently reinforces the identity of the publishing entity (`Organization`) across all shared content, strengthening trust signals for AIs.",
    impact: 4
  },
  missingTwitterSite: {
    problem: "The site's main Twitter handle (`twitter:site`) is missing.",
    solution: "Add the `<meta name=\"twitter:site\" content=\"@YourSiteHandle\">` tag.",
    explanation: "This creates a strong, verifiable link between the content and the site's official Twitter entity in the knowledge graph.",
    impact: 4
  },
  missingTwitterCreator: {
    problem: "The author's Twitter handle (`twitter:creator`) is missing for an article-type page.",
    solution: "Add the `<meta name=\"twitter:creator\" content=\"@AuthorHandle\">` tag.",
    explanation: "This links the content directly to the author's (`Person`) entity, strengthening signals of expertise (E-E-A-T) for AIs.",
    impact: 5
  },
  missingImageDimensions: {
    problem: "Image dimensions (`og:image:width` and `og:image:height`) are missing.",
    solution: "Add `<meta property=\"og:image:width\" content=\"1200\">` and `<meta property=\"og:image:height\" content=\"630\">` tags.",
    explanation: "Providing image dimensions is a technical best practice that signals a well-structured, high-quality implementation to crawlers.",
    impact: 3
  }
};

/**
 * Extracts all Open Graph and Twitter Card meta tags from HTML
 * Returns a simple key-value object for easy access
 */
function extractMetaTags(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  const metaTags: Record<string, string> = {};

  // Extract Open Graph tags (property attribute)
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr('property');
    const content = $(element).attr('content');
    if (property && content) {
      metaTags[property] = content;
    }
  });

  // Extract Twitter Card tags (name attribute)
  $('meta[name^="twitter:"]').each((_, element) => {
    const name = $(element).attr('name');
    const content = $(element).attr('content');
    if (name && content) {
      metaTags[name] = content;
    }
  });

  return metaTags;
}

/**
 * Main Social Meta analysis function
 * Unified analysis with 100-point scoring system
 * Returns a single MetricCard with comprehensive recommendations
 */
export function analyzeSocialMeta(html: string): MetricCard {
  const metaTags = extractMetaTags(html);
  let score = 0;
  const recommendations: Recommendation[] = [];

  // ========================================
  // FONDAMENTAUX DU CONTENU (65 points)
  // ========================================

  // Check og:title (20 points)
  const ogTitle = metaTags['og:title'];
  if (ogTitle && ogTitle.trim()) {
    score += 20;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingOgTitle.problem,
      solution: SOCIAL_META_KB.missingOgTitle.solution,
      explanation: SOCIAL_META_KB.missingOgTitle.explanation,
      impact: SOCIAL_META_KB.missingOgTitle.impact
    });
  }

  // Check og:description (15 points)
  const ogDescription = metaTags['og:description'];
  if (ogDescription && ogDescription.trim()) {
    score += 15;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingOgDescription.problem,
      solution: SOCIAL_META_KB.missingOgDescription.solution,
      explanation: SOCIAL_META_KB.missingOgDescription.explanation,
      impact: SOCIAL_META_KB.missingOgDescription.impact
    });
  }

  // Check og:image (20 points)
  const ogImage = metaTags['og:image'];
  if (ogImage && ogImage.trim()) {
    score += 20;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingOgImage.problem,
      solution: SOCIAL_META_KB.missingOgImage.solution,
      explanation: SOCIAL_META_KB.missingOgImage.explanation,
      impact: SOCIAL_META_KB.missingOgImage.impact
    });
  }

  // Check og:url (10 points)
  const ogUrl = metaTags['og:url'];
  if (ogUrl && ogUrl.trim()) {
    score += 10;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingOgUrl.problem,
      solution: SOCIAL_META_KB.missingOgUrl.solution,
      explanation: SOCIAL_META_KB.missingOgUrl.explanation,
      impact: SOCIAL_META_KB.missingOgUrl.impact
    });
  }

  // ========================================
  // CONTEXTE & CLASSIFICATION (35 points)
  // ========================================

  // Check og:type (15 points)
  const ogType = metaTags['og:type'];
  if (ogType && ogType.trim()) {
    score += 15;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingOgType.problem,
      solution: SOCIAL_META_KB.missingOgType.solution,
      explanation: SOCIAL_META_KB.missingOgType.explanation,
      impact: SOCIAL_META_KB.missingOgType.impact
    });
  }

  // Check twitter:card (10 points)
  const twitterCard = metaTags['twitter:card'];
  if (twitterCard && twitterCard.trim()) {
    score += 10;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingTwitterCard.problem,
      solution: SOCIAL_META_KB.missingTwitterCard.solution,
      explanation: SOCIAL_META_KB.missingTwitterCard.explanation,
      impact: SOCIAL_META_KB.missingTwitterCard.impact
    });
  }

  // Check og:image:alt (5 points) - only if og:image exists
  const ogImageAlt = metaTags['og:image:alt'];
  if (ogImage && ogImageAlt && ogImageAlt.trim()) {
    score += 5;
  } else if (ogImage && !ogImageAlt) {
    recommendations.push({
      problem: SOCIAL_META_KB.missingOgImageAlt.problem,
      solution: SOCIAL_META_KB.missingOgImageAlt.solution,
      explanation: SOCIAL_META_KB.missingOgImageAlt.explanation,
      impact: SOCIAL_META_KB.missingOgImageAlt.impact
    });
  }

  // ========================================
  // ATTRIBUTION & QUALITÉ TECHNIQUE (5 points total)
  // ========================================

  // New, clearer logic for attribution
  const ATTRIBUTION_MAX_POINTS = 5;
  let attributionScore = 0;

  // Check og:site_name (1 point)
  if (metaTags['og:site_name']?.trim()) {
    attributionScore += 1;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingSiteName.problem,
      solution: SOCIAL_META_KB.missingSiteName.solution,
      explanation: SOCIAL_META_KB.missingSiteName.explanation,
      impact: SOCIAL_META_KB.missingSiteName.impact
    });
  }

  // Check twitter:site (2 points)
  if (metaTags['twitter:site']?.trim()) {
    attributionScore += 2;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingTwitterSite.problem,
      solution: SOCIAL_META_KB.missingTwitterSite.solution,
      explanation: SOCIAL_META_KB.missingTwitterSite.explanation,
      impact: SOCIAL_META_KB.missingTwitterSite.impact
    });
  }

  // Check twitter:creator (2 points)
  if (metaTags['twitter:creator']?.trim()) {
    attributionScore += 2;
  } else {
    recommendations.push({
      problem: SOCIAL_META_KB.missingTwitterCreator.problem,
      solution: SOCIAL_META_KB.missingTwitterCreator.solution,
      explanation: SOCIAL_META_KB.missingTwitterCreator.explanation,
      impact: SOCIAL_META_KB.missingTwitterCreator.impact
    });
  }

  score += Math.min(attributionScore, ATTRIBUTION_MAX_POINTS);

  // Check image dimensions (bonus validation)
  const ogImageWidth = metaTags['og:image:width'];
  const ogImageHeight = metaTags['og:image:height'];
  
  if (ogImage && (!ogImageWidth || !ogImageHeight)) {
    recommendations.push({
      problem: SOCIAL_META_KB.missingImageDimensions.problem,
      solution: SOCIAL_META_KB.missingImageDimensions.solution,
      explanation: SOCIAL_META_KB.missingImageDimensions.explanation,
      impact: SOCIAL_META_KB.missingImageDimensions.impact
    });
  }

  return {
    id: 'social-meta-analysis',
    name: 'Social Meta Tags (Open Graph & Twitter)',
    score,
    maxScore: 100,
    status: getPerformanceStatus(score, 100),
    explanation: "This analysis evaluates the quality of your Open Graph and Twitter Card tags. These meta tags are crucial for social media sharing and provide high-quality, explicit metadata for AI understanding. They serve as a 'summary for robots' that corroborates and complements your JSON-LD and page content.",
    recommendations,
    successMessage: "Excellent! Your social meta tags provide comprehensive metadata for AI understanding and optimal social sharing.",
    rawData: {
      metaTags,
      scoreBreakdown: {
        fundamentals: score <= 65 ? score : 65,
        context: score > 65 ? score - 65 : 0
      }
    }
  };
}