/**
 * META TAGS ANALYSIS MODULE
 * Analyzes HTML meta tags including title, description, technical meta tags, and metadata consistency
 * 
 * New unified analysis with 35-point scoring system:
 * - Title Tag Quality: 10 points
 * - Meta Description Quality: 10 points  
 * - Metadata Consistency: 5 points
 * - Technical Health: 10 points
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';

/**
 * Calculates semantic similarity between two text strings
 * Simple implementation using keyword overlap
 */
function calculateSemanticSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  // Normalize texts: lowercase, remove punctuation, split into words
  const normalizeText = (text: string): string[] => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short words
  };
  
  const words1 = normalizeText(text1);
  const words2 = normalizeText(text2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Calculate intersection
  const intersection = words1.filter(word => words2.includes(word));
  
  // Calculate similarity as intersection / union
  const union = new Set([...words1, ...words2]);
  return intersection.length / union.size;
}

/**
 * Unified meta tags analysis function
 * Produces a single MetricCard with 35-point scoring system
 */
export function analyzeMetaTags(html: string): MetricCard {
  const $ = cheerio.load(html);
  let totalScore = 0;
  let recommendations: Recommendation[] = [];
  
  // Step A: Extraction
  const titleText = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').first().attr('content')?.trim() || '';
  const ogTitle = $('meta[property="og:title"]').first().attr('content')?.trim() || '';
  const ogDescription = $('meta[property="og:description"]').first().attr('content')?.trim() || '';
  const viewport = $('meta[name="viewport"]').first();
  const charset = $('meta[charset]').first();
  const robots = $('meta[name="robots"]').first();
  
  // Step B: Title Tag Quality (10 points)
  let titleScore = 0;
  if (!titleText) {
    recommendations.push({
      problem: "The <title> tag is missing.",
      solution: "Add a <title> tag inside the <head> to define your page's main title for search engines.",
      explanation: "The <title> tag is the strongest signal about your page's main topic for both search engines and AIs. Its absence is a fundamental SEO error.",
      impact: 10
    });
  } else {
    titleScore += 5; // Basic presence
    
    // Length assessment
    if (titleText.length >= 50 && titleText.length <= 60) {
      titleScore += 5; // Optimal length
    } else if (titleText.length >= 30 && titleText.length <= 70) {
      titleScore += 3; // Good length
      if (titleText.length < 30) {
        recommendations.push({
          problem: "The <title> tag is too short (under 30 characters).",
          solution: "Extend your title to be more descriptive; the ideal length is 50-60 characters.",
          explanation: "A title that is too short may lack descriptive context, weakening its relevance for user queries and AI comprehension.",
          impact: 5
        });
      } else {
        recommendations.push({
          problem: "The <title> tag is too long (over 70 characters).",
          solution: "Shorten your title to ensure it displays correctly in search results; 50-60 characters is ideal.",
          explanation: "An overly long title will be truncated in search results, harming the user experience and potentially diluting the impact of your primary keywords.",
          impact: 5
        });
      }
    } else {
      if (titleText.length < 30) {
        recommendations.push({
          problem: "The <title> tag is too short (under 30 characters).",
          solution: "Extend your title to be more descriptive; the ideal length is 50-60 characters.",
          explanation: "A title that is too short may lack descriptive context, weakening its relevance for user queries and AI comprehension.",
          impact: 5
        });
      } else {
        recommendations.push({
          problem: "The <title> tag is too long (over 70 characters).",
          solution: "Shorten your title to ensure it displays correctly in search results; 50-60 characters is ideal.",
          explanation: "An overly long title will be truncated in search results, harming the user experience and potentially diluting the impact of your primary keywords.",
          impact: 5
        });
      }
    }
  }
  totalScore += titleScore;
  
  // Step C: Meta Description Quality (10 points)
  let descriptionScore = 0;
  if (!metaDescription) {
    recommendations.push({
      problem: "The <meta name=\"description\"> tag is missing.",
      solution: "Add a <meta name=\"description\" content=\"...\"> tag to provide a unique summary for search engine snippets.",
      explanation: "The meta description is your page's 'advertisement' in search results. Its absence allows search engines to pick a snippet for you, which is often less compelling.",
      impact: 9
    });
  } else {
    descriptionScore += 5; // Basic presence
    
    // Length assessment
    if (metaDescription.length >= 140 && metaDescription.length <= 160) {
      descriptionScore += 5; // Optimal length
    } else if (metaDescription.length >= 120 && metaDescription.length <= 170) {
      descriptionScore += 3; // Good length
      if (metaDescription.length < 120) {
        recommendations.push({
          problem: "The <meta description> is too short (under 120 characters).",
          solution: "Expand your meta description to be more compelling and informative; aim for 140-160 characters.",
          explanation: "A description that is too short is a missed opportunity to persuade users to click and to provide a rich, contextual summary for AIs.",
          impact: 4
        });
      } else {
        recommendations.push({
          problem: "The <meta description> is too long (over 170 characters).",
          solution: "Condense your meta description to fit within the recommended 140-160 character limit for search engines.",
          explanation: "A description that is too long will be cut off in search results, creating a frustrating user experience.",
          impact: 4
        });
      }
    } else {
      if (metaDescription.length < 120) {
        recommendations.push({
          problem: "The <meta description> is too short (under 120 characters).",
          solution: "Expand your meta description to be more compelling and informative; aim for 140-160 characters.",
          explanation: "A description that is too short is a missed opportunity to persuade users to click and to provide a rich, contextual summary for AIs.",
          impact: 4
        });
      } else {
        recommendations.push({
          problem: "The <meta description> is too long (over 170 characters).",
          solution: "Condense your meta description to fit within the recommended 140-160 character limit for search engines.",
          explanation: "A description that is too long will be cut off in search results, creating a frustrating user experience.",
          impact: 4
        });
      }
    }
  }
  totalScore += descriptionScore;
  
  // Step D: Metadata Consistency (5 points)
  let consistencyScore = 0;
  let titleConsistency = true;
  let descriptionConsistency = true;
  
  // Check title consistency
  if (titleText && ogTitle) {
    const titleSimilarity = calculateSemanticSimilarity(titleText, ogTitle);
    if (titleSimilarity < 0.5) {
      titleConsistency = false;
      recommendations.push({
        problem: "The <title> tag and the og:title tag are inconsistent.",
        solution: "Ensure your <title> tag and og:title tag have similar content to send a clear, consistent signal about your page's topic to all crawlers.",
        explanation: "Inconsistency between titles creates ambiguity for AIs about the page's true topic. Consistency is a strong signal of semantic reliability and trust.",
        impact: 7
      });
    }
  }
  
  // Check description consistency
  if (metaDescription && ogDescription) {
    const descSimilarity = calculateSemanticSimilarity(metaDescription, ogDescription);
    if (descSimilarity < 0.5) {
      descriptionConsistency = false;
      recommendations.push({
        problem: "The meta description and the og:description are inconsistent.",
        solution: "Ensure your meta description and og:description are consistent to provide a unified summary of your page across all platforms.",
        explanation: "Having divergent summaries for SEO and social platforms can weaken the clarity of your page's overall message for AIs that analyze all sources.",
        impact: 6
      });
    }
  }
  
  // Award points for consistency
  if (titleConsistency && descriptionConsistency) {
    consistencyScore = 5;
  } else if (titleConsistency || descriptionConsistency) {
    consistencyScore = 2;
  }
  totalScore += consistencyScore;
  
  // Step E: Technical Health (10 points)
  let technicalScore = 0;
  
  // Viewport meta (4 points)
  if (viewport.length && viewport.attr('content')) {
    technicalScore += 4;
  } else {
    recommendations.push({
      problem: "The viewport meta tag is missing.",
      solution: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"> to ensure your page is mobile-friendly.",
      explanation: "The absence of the viewport tag is a very negative signal for mobile SEO, indicating that the page is not optimized for smartphones.",
      impact: 8
    });
  }
  
  // Charset declaration (3 points)
  if (charset.length || $('meta[http-equiv="Content-Type"]').length) {
    technicalScore += 3;
  } else {
    recommendations.push({
      problem: "The charset declaration is missing.",
      solution: "Add <meta charset=\"UTF-8\"> at the beginning of your <head> to ensure correct text rendering on all browsers.",
      explanation: "Without a character encoding declaration, text may render incorrectly on some browsers, making the content unreadable.",
      impact: 6
    });
  }
  
  // Robots meta (3 points)
  if (robots.length && robots.attr('content')) {
    technicalScore += 3;
  } else {
    recommendations.push({
      problem: "The robots meta tag is missing.",
      solution: "Add a <meta name=\"robots\" content=\"index, follow\"> tag to give clear crawling and indexing instructions to search engines.",
      explanation: "While search engines typically index pages by default, omitting this tag is a missed opportunity to give explicit and clear crawling instructions.",
      impact: 3
    });
  }
  
  totalScore += technicalScore;
  
  // Step F: Final Score (already calculated as totalScore)
  
  // Generate success message based on performance
  let successMessage = "";
  if (totalScore >= 30) {
    successMessage = "Excellent! Your meta tags are well-optimized for search engines and AI understanding.";
  } else if (totalScore >= 20) {
    successMessage = "Good! Your meta tags provide solid foundation for SEO and AI comprehension.";
  } else {
    successMessage = "Your meta tags need improvement to better support search engines and AI understanding.";
  }
  
  return {
    id: 'meta-tags-analysis',
    name: 'Meta Tags Analysis',
    score: totalScore,
    maxScore: 35,
    status: getPerformanceStatus(totalScore, 35),
    explanation: "Meta tags are the fundamental building blocks that define your page's identity, summary, and technical behavior. For AI systems, these tags provide the first contextual information they encounter, making their quality and consistency crucial for reliable understanding.",
    recommendations,
    successMessage,
    rawData: {
      titleTag: {
        present: !!titleText,
        length: titleText.length,
        text: titleText,
        score: titleScore
      },
      metaDescription: {
        present: !!metaDescription,
        length: metaDescription.length,
        text: metaDescription,
        score: descriptionScore
      },
      consistency: {
        titleConsistency,
        descriptionConsistency,
        score: consistencyScore
      },
      technicalMeta: {
        viewport: !!viewport.length,
        charset: !!(charset.length || $('meta[http-equiv="Content-Type"]').length),
        robots: !!robots.length,
        score: technicalScore
      },
      totalScore
    }
  };
}

/**
 * Generates perfect items list for Meta Tags drawer
 * Returns empty array since we now have a single unified card
 */
export function generateMetaTagsPerfectItems(cards: MetricCard[]): string[] {
  // This function is kept for backwards compatibility but returns empty array
  // since we now have a single unified analysis
  return [];
}

// Legacy export for backwards compatibility
export function analyzeMetaTagsLegacy(html: string): {
  cards: MetricCard[];
  perfectItems: string[];
  totalScore: number;
  maxScore: number;
} {
  const mainCard = analyzeMetaTags(html);
  return {
    cards: [mainCard],
    perfectItems: [],
    totalScore: mainCard.score,
    maxScore: mainCard.maxScore
  };
}