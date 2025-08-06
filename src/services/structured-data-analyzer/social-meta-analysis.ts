/**
 * SOCIAL META ANALYSIS MODULE
 * Analyzes Open Graph and social media meta tags
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';
import { SOCIAL_META_SCORING } from './shared/constants';

/**
 * Analyzes Open Graph basic tags (15 points)
 */
function analyzeOpenGraphBasic(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let recommendations: Recommendation[] = [];

  // OG Title (4 points)
  const ogTitle = $('meta[property="og:title"]').first();
  if (ogTitle.length && ogTitle.attr('content')) {
    score += 4;
  } else {
    recommendations.push({
      problem: "Open Graph title is missing",
      solution: "Add Open Graph title for social sharing optimization"
    });
  }

  // OG Description (4 points)
  const ogDesc = $('meta[property="og:description"]').first();
  if (ogDesc.length && ogDesc.attr('content')) {
    score += 4;
  } else {
    recommendations.push({
      problem: "Open Graph description is missing",
      solution: "Include Open Graph description for social previews"
    });
  }

  // OG Type (3 points)
  const ogType = $('meta[property="og:type"]').first();
  if (ogType.length && ogType.attr('content')) {
    score += 3;
  } else {
    recommendations.push({
      problem: "Open Graph type is missing",
      solution: "Set appropriate Open Graph type (article, website, etc.)"
    });
  }

  // OG URL (4 points)
  const ogUrl = $('meta[property="og:url"]').first();
  if (ogUrl.length && ogUrl.attr('content')) {
    score += 4;
  } else {
    recommendations.push({
      problem: "Open Graph URL is missing",
      solution: "Specify canonical URL with og:url property"
    });
  }

  return {
    id: 'open-graph-basic',
    name: 'Open Graph Basic Tags',
    score,
    maxScore: SOCIAL_META_SCORING.OPEN_GRAPH_BASIC,
    status: getPerformanceStatus(score, SOCIAL_META_SCORING.OPEN_GRAPH_BASIC),
    explanation: "Open Graph tags control how your content appears when shared on social media platforms. They're also used by AI for content understanding and categorization.",
    recommendations,
    successMessage: "Great! Your Open Graph tags are complete for social sharing.",
    rawData: {
      title: !!(ogTitle.length && ogTitle.attr('content')),
      description: !!(ogDesc.length && ogDesc.attr('content')),
      type: !!(ogType.length && ogType.attr('content')),
      url: !!(ogUrl.length && ogUrl.attr('content'))
    }
  };
}

/**
 * Analyzes Open Graph image (10 points)
 */
function analyzeOpenGraphImage(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let recommendations: Recommendation[] = [];

  // OG Image (7 points)
  const ogImage = $('meta[property="og:image"]').first();
  if (ogImage.length && ogImage.attr('content')) {
    score += 7;
    
    // Image dimensions bonus (3 points)
    const ogImageWidth = $('meta[property="og:image:width"]').first();
    const ogImageHeight = $('meta[property="og:image:height"]').first();
    if (ogImageWidth.length && ogImageHeight.length) {
      score += 3;
    } else {
      recommendations.push({
        problem: "Open Graph image dimensions are missing",
        solution: "Include image dimensions (og:image:width, og:image:height)"
      });
    }
  } else {
    recommendations.push({
      problem: "Open Graph image is missing",
      solution: "Add Open Graph image for better social media appearance"
    });
  }

  if (recommendations.length > 0) {
    recommendations.push(
      {
        problem: "Image quality not optimized for social sharing",
        solution: "Use high-quality images (minimum 1200x630 pixels recommended)"
      },
      {
        problem: "Image accessibility not ensured",
        solution: "Ensure image URLs are absolute and accessible"
      }
    );
  }

  return {
    id: 'open-graph-image',
    name: 'Open Graph Image',
    score,
    maxScore: SOCIAL_META_SCORING.OPEN_GRAPH_IMAGE,
    status: getPerformanceStatus(score, SOCIAL_META_SCORING.OPEN_GRAPH_IMAGE),
    explanation: "Open Graph images significantly improve social media engagement and help AI understand visual content context. Proper image metadata ensures consistent display across platforms.",
    recommendations,
    successMessage: "Perfect! Your Open Graph image is properly configured.",
    rawData: {
      image: !!(ogImage.length && ogImage.attr('content')),
      dimensions: !!($('meta[property="og:image:width"]').length && $('meta[property="og:image:height"]').length)
    }
  };
}

/**
 * Generates perfect items list for Open Graph drawer
 */
export function generateOpenGraphPerfectItems(cards: MetricCard[]): string[] {
  const perfectItems: string[] = [];
  
  cards.forEach(card => {
    if (!card.recommendations || card.recommendations.length === 0) {
      switch (card.id) {
        case 'open-graph-basic':
          perfectItems.push('Open Graph basic tags complete for social sharing');
          break;
        case 'open-graph-image':
          perfectItems.push('Open Graph image properly configured with dimensions');
          break;
      }
    }
  });
  
  return perfectItems;
}

/**
 * Main social meta analysis function
 * Orchestrates all Open Graph analyses and returns results
 */
export function analyzeSocialMeta(html: string): {
  cards: MetricCard[];
  perfectItems: string[];
  totalScore: number;
  maxScore: number;
} {
  // Individual Open Graph analyses
  const ogBasicCard = analyzeOpenGraphBasic(html);
  const ogImageCard = analyzeOpenGraphImage(html);

  const cards = [ogBasicCard, ogImageCard];
  const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
  const maxScore = cards.reduce((sum, card) => sum + card.maxScore, 0);
  const perfectItems = generateOpenGraphPerfectItems(cards);

  return {
    cards,
    perfectItems,
    totalScore,
    maxScore
  };
}

// Export individual analyzers for backwards compatibility
export {
  analyzeOpenGraphBasic,
  analyzeOpenGraphImage
};