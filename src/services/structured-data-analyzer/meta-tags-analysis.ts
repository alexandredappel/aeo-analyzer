/**
 * META TAGS ANALYSIS MODULE
 * Analyzes HTML meta tags including title, description, and technical meta tags
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';
import { META_TAGS_SCORING } from './shared/constants';

/**
 * Analyzes title tag (15 points)
 */
function analyzeTitleTag(html: string): MetricCard {
  const $ = cheerio.load(html);
  const titleElement = $('title').first();
  const titleText = titleElement.text().trim();
  
  let score = 0;
  let recommendations: Recommendation[] = [];

  if (!titleText) {
    recommendations.push(
      {
        problem: "Title tag is missing or empty",
        solution: "Add a descriptive title tag to your page"
      },
      {
        problem: "Missing keywords in title",
        solution: "Include primary keywords in the title"
      },
      {
        problem: "No title length optimization",
        solution: "Keep title length between 50-60 characters"
      },
      {
        problem: "Title uniqueness not ensured",
        solution: "Make each page title unique"
      }
    );
  } else {
    // Length assessment
    if (titleText.length >= 50 && titleText.length <= 60) {
      score += 10; // Optimal length
    } else if (titleText.length >= 30 && titleText.length <= 70) {
      score += 7; // Good length
    } else if (titleText.length >= 20) {
      score += 5; // Acceptable length
      if (titleText.length < 30) {
        recommendations.push({
          problem: "Title tag is too short (under 30 characters)",
          solution: "Optimize title length for search engines (50-60 characters ideal)"
        });
      } else {
        recommendations.push({
          problem: "Title tag is too long (over 70 characters)",
          solution: "Optimize title length for search engines (50-60 characters ideal)"
        });
      }
    } else {
      recommendations.push({
        problem: "Title tag is very short (under 20 characters)",
        solution: "Write descriptive, compelling titles that users want to click"
      });
    }

    // Content quality assessment
    if (titleText.length > 0) {
      score += 5; // Basic presence bonus
    }

    if (recommendations.length > 0) {
      recommendations.push({
        problem: "Title keyword optimization needed",
        solution: "Include your primary keyword near the beginning"
      });
    }
  }

  return {
    id: 'title-tag',
    name: 'Title Tag',
    score,
    maxScore: META_TAGS_SCORING.TITLE_TAG,
    status: getPerformanceStatus(score, META_TAGS_SCORING.TITLE_TAG),
    explanation: "The title tag is the most important meta element for SEO and AI understanding. It appears in search results and browser tabs, directly influencing click-through rates.",
    recommendations,
    successMessage: "Great! Your title tag is optimized for search engines and AI.",
    rawData: {
      present: !!titleText,
      length: titleText.length,
      text: titleText
    }
  };
}

/**
 * Analyzes meta description (10 points)
 */
function analyzeMetaDescription(html: string): MetricCard {
  const $ = cheerio.load(html);
  const descElement = $('meta[name="description"]').first();
  const descText = descElement.attr('content')?.trim() || '';
  
  let score = 0;
  let recommendations: Recommendation[] = [];

  if (!descText) {
    recommendations.push(
      {
        problem: "Meta description is missing",
        solution: "Add a meta description to your page"
      },
      {
        problem: "Missing compelling description content",
        solution: "Write compelling descriptions that encourage clicks"
      },
      {
        problem: "Keywords not included in description",
        solution: "Include relevant keywords naturally"
      },
      {
        problem: "Description length not optimized",
        solution: "Keep descriptions between 150-160 characters"
      }
    );
  } else {
    // Length assessment
    if (descText.length >= 140 && descText.length <= 160) {
      score += 7; // Optimal length
    } else if (descText.length >= 120 && descText.length <= 170) {
      score += 5; // Good length
    } else if (descText.length >= 50) {
      score += 3; // Acceptable length
      if (descText.length < 120) {
        recommendations.push({
          problem: "Meta description is too short (under 120 characters)",
          solution: "Optimize description length (140-160 characters ideal)"
        });
      } else {
        recommendations.push({
          problem: "Meta description is too long (over 170 characters)",
          solution: "Optimize description length (140-160 characters ideal)"
        });
      }
    } else {
      recommendations.push({
        problem: "Meta description is very short (under 50 characters)",
        solution: "Write unique descriptions for each page"
      });
    }

    // Content quality bonus
    if (descText.length > 0) {
      score += 3; // Basic presence bonus
    }

    if (recommendations.length > 0) {
      recommendations.push({
        problem: "Call-to-action missing in description",
        solution: "Include a clear call-to-action when appropriate"
      });
    }
  }

  return {
    id: 'meta-description',
    name: 'Meta Description',
    score,
    maxScore: META_TAGS_SCORING.META_DESCRIPTION,
    status: getPerformanceStatus(score, META_TAGS_SCORING.META_DESCRIPTION),
    explanation: "Meta descriptions provide concise summaries that appear in search results. Well-crafted descriptions improve click-through rates and help AI understand page content.",
    recommendations,
    successMessage: "Perfect! Your meta description effectively summarizes your content.",
    rawData: {
      present: !!descText,
      length: descText.length,
      text: descText
    }
  };
}

/**
 * Analyzes technical meta tags (10 points)
 */
function analyzeTechnicalMeta(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let recommendations: Recommendation[] = [];

  // Viewport meta (4 points)
  const viewport = $('meta[name="viewport"]').first();
  if (viewport.length && viewport.attr('content')) {
    score += 4;
  } else {
    recommendations.push({
      problem: "Viewport meta tag is missing or empty",
      solution: "Add viewport meta tag for mobile responsiveness"
    });
  }

  // Charset declaration (3 points)
  const charset = $('meta[charset]').first();
  if (charset.length || $('meta[http-equiv="Content-Type"]').length) {
    score += 3;
  } else {
    recommendations.push({
      problem: "Character encoding declaration is missing",
      solution: "Include charset declaration for proper text encoding"
    });
  }

  // Robots meta (3 points)
  const robots = $('meta[name="robots"]').first();
  if (robots.length && robots.attr('content')) {
    score += 3;
  } else {
    recommendations.push({
      problem: "Robots meta tag is missing (optional but recommended)",
      solution: "Consider adding robots meta tag for crawling directives"
    });
  }

  if (recommendations.length > 0) {
    recommendations.push({
      problem: "Modern meta tag syntax not fully implemented",
      solution: "Use HTML5 doctype and modern meta tag syntax"
    });
  }

  return {
    id: 'technical-meta',
    name: 'Technical Meta Tags',
    score,
    maxScore: META_TAGS_SCORING.TECHNICAL_META,
    status: getPerformanceStatus(score, META_TAGS_SCORING.TECHNICAL_META),
    explanation: "Technical meta tags ensure proper page rendering and crawling behavior. They provide essential instructions to browsers and search engines.",
    recommendations,
    successMessage: "Excellent! Your technical meta tags are properly configured.",
    rawData: {
      viewport: !!viewport.length,
      charset: !!(charset.length || $('meta[http-equiv="Content-Type"]').length),
      robots: !!robots.length
    }
  };
}

/**
 * Generates perfect items list for Meta Tags drawer
 */
export function generateMetaTagsPerfectItems(cards: MetricCard[]): string[] {
  const perfectItems: string[] = [];
  
  cards.forEach(card => {
    if (!card.recommendations || card.recommendations.length === 0) {
      switch (card.id) {
        case 'title-tag':
          perfectItems.push('Title tag optimally sized and descriptive');
          break;
        case 'meta-description':
          perfectItems.push('Meta description compelling and well-crafted');
          break;
        case 'technical-meta':
          perfectItems.push('Technical meta tags properly configured');
          break;
      }
    }
  });
  
  return perfectItems;
}

/**
 * Main meta tags analysis function
 * Orchestrates all meta tag analyses and returns results
 */
export function analyzeMetaTags(html: string): {
  cards: MetricCard[];
  perfectItems: string[];
  totalScore: number;
  maxScore: number;
} {
  // Individual meta tag analyses
  const titleCard = analyzeTitleTag(html);
  const descriptionCard = analyzeMetaDescription(html);
  const technicalMetaCard = analyzeTechnicalMeta(html);

  const cards = [titleCard, descriptionCard, technicalMetaCard];
  const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
  const maxScore = cards.reduce((sum, card) => sum + card.maxScore, 0);
  const perfectItems = generateMetaTagsPerfectItems(cards);

  return {
    cards,
    perfectItems,
    totalScore,
    maxScore
  };
}

// Export individual analyzers for backwards compatibility
export {
  analyzeTitleTag,
  analyzeMetaDescription,
  analyzeTechnicalMeta
};