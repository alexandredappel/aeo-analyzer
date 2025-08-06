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
      problem: "Open Graph title (`og:title`) is missing.",
      solution: "Add the `<meta property=\"og:title\" content=\"Your Page Title\">` tag to your page's `<head>`.",
      impact: 10
    });
  }

  // Check og:description (15 points)
  const ogDescription = metaTags['og:description'];
  if (ogDescription && ogDescription.trim()) {
    score += 15;
  } else {
    recommendations.push({
      problem: "Open Graph description (`og:description`) is missing.",
      solution: "Add the `<meta property=\"og:description\" content=\"A concise summary of your page.\">` tag.",
      impact: 9
    });
  }

  // Check og:image (20 points)
  const ogImage = metaTags['og:image'];
  if (ogImage && ogImage.trim()) {
    score += 20;
  } else {
    recommendations.push({
      problem: "Open Graph image (`og:image`) is missing.",
      solution: "Add the `<meta property=\"og:image\" content=\"https://your-site.com/image.jpg\">` tag with a full, absolute URL.",
      impact: 10
    });
  }

  // Check og:url (10 points)
  const ogUrl = metaTags['og:url'];
  if (ogUrl && ogUrl.trim()) {
    score += 10;
  } else {
    recommendations.push({
      problem: "Open Graph URL (`og:url`) is missing.",
      solution: "Add the `<meta property=\"og:url\" content=\"https://your-site.com/your-canonical-page\">` tag.",
      impact: 7
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
      problem: "Open Graph type (`og:type`) is missing.",
      solution: "Add the `<meta property=\"og:type\" content=\"article\">` tag (or `website`, `product`).",
      impact: 9
    });
  }

  // Check twitter:card (10 points)
  const twitterCard = metaTags['twitter:card'];
  if (twitterCard && twitterCard.trim()) {
    score += 10;
  } else {
    recommendations.push({
      problem: "Twitter Card type (`twitter:card`) is missing.",
      solution: "Add the `<meta name=\"twitter:card\" content=\"summary_large_image\">` tag for maximum visual impact.",
      impact: 8
    });
  }

  // Check og:image:alt (5 points) - only if og:image exists
  const ogImageAlt = metaTags['og:image:alt'];
  if (ogImage && ogImageAlt && ogImageAlt.trim()) {
    score += 5;
  } else if (ogImage && !ogImageAlt) {
    recommendations.push({
      problem: "`og:image` is present, but its descriptive text (`og:image:alt`) is missing.",
      solution: "Add a companion `<meta property=\"og:image:alt\" content=\"A description of the image's content.\">` tag.",
      impact: 6
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
      problem: "Website name (`og:site_name`) is missing.",
      solution: "Add the `<meta property=\"og:site_name\" content=\"Your Website Name\">` tag.",
      impact: 4
    });
  }

  // Check twitter:site (2 points)
  if (metaTags['twitter:site']?.trim()) {
    attributionScore += 2;
  } else {
    recommendations.push({
      problem: "The site's main Twitter handle (`twitter:site`) is missing.",
      solution: "Add the `<meta name=\"twitter:site\" content=\"@YourSiteHandle\">` tag.",
      impact: 4
    });
  }

  // Check twitter:creator (2 points)
  if (metaTags['twitter:creator']?.trim()) {
    attributionScore += 2;
  } else {
    recommendations.push({
      problem: "The author's Twitter handle (`twitter:creator`) is missing for an article-type page.",
      solution: "Add the `<meta name=\"twitter:creator\" content=\"@AuthorHandle\">` tag.",
      impact: 5
    });
  }

  score += Math.min(attributionScore, ATTRIBUTION_MAX_POINTS);

  // Check image dimensions (bonus validation)
  const ogImageWidth = metaTags['og:image:width'];
  const ogImageHeight = metaTags['og:image:height'];
  
  if (ogImage && (!ogImageWidth || !ogImageHeight)) {
    recommendations.push({
      problem: "Image dimensions (`og:image:width` and `og:image:height`) are missing.",
      solution: "Add `<meta property=\"og:image:width\" content=\"1200\">` and `<meta property=\"og:image:height\" content=\"630\">` tags.",
      impact: 3
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