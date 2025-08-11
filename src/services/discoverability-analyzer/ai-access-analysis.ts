/**
 * DISCOVERABILITY ANALYZER - AI ACCESS ANALYSIS
 * 
 * Analyzes AI access through robots.txt and sitemap.xml (50 points total)
 * Merges robots.txt analysis (25 points) and sitemap analysis (25 points)
 * Part of AI Access drawer - GLOBAL PENALTY SOURCE
 */

import { MetricCard, GlobalPenalty, Recommendation } from '@/types/analysis-architecture';
import { 
  getPerformanceStatus, 
  parseRobotsTxt, 
  isBotAllowed,
  calculateGlobalPenaltyFactor 
} from './shared/utils';
import { AI_BOTS } from './shared/constants';
import * as cheerio from 'cheerio';

/**
 * Knowledge Base for AI Access Analysis
 * Contains all problems, solutions, explanations, and impacts
 */
const KNOWLEDGE_BASE = {
  // ROBOTS.TXT ISSUES
  robotsNotFound: {
    problem: "The robots.txt file could not be found.",
    solution: "Create a robots.txt file at your domain's root to provide clear crawling instructions.",
    explanation: "While most bots crawl by default if this file is missing, its absence creates uncertainty and prevents you from setting important rules.",
    impact: 5
  },
  allBotsBlocked: {
    problem: "The robots.txt file is blocking all major AI crawlers.",
    solution: "Remove the 'Disallow: /' rule for key AI user-agents (like GPTBot) in your robots.txt.",
    explanation: "This is the most severe barrier to discoverability, as it explicitly forbids AIs from accessing your content, making any AEO impossible.",
    impact: 10
  },
  someBotsBlocked: {
    problem: "The robots.txt file is blocking some AI crawlers: [blockedBotsList].",
    solution: "Review your robots.txt and add specific 'Allow' rules for the blocked bots to ensure full visibility.",
    explanation: "Blocking specific AIs prevents them from using your content, limiting your reach on their respective platforms.",
    impact: 7
  },
  sitemapNotReferenced: {
    problem: "The sitemap.xml file is not referenced in your robots.txt.",
    solution: "Add a new line 'Sitemap: https://your-domain.com/sitemap.xml' to your robots.txt file.",
    explanation: "Providing the sitemap location in robots.txt is a strong, standardized signal that helps crawlers find your site's map immediately.",
    impact: 4
  },

  // SITEMAP ISSUES
  sitemapNotFound: {
    problem: "No sitemap.xml file was found.",
    solution: "Create and submit an XML sitemap.",
    explanation: "A sitemap is the most effective way to tell AIs about all the pages on your site, ensuring more complete and efficient crawling.",
    impact: 8
  },
  missingLastmodTags: {
    problem: "The sitemap.xml does not appear to contain content freshness information (<lastmod> tags).",
    solution: "Ensure your sitemap generation process includes the <lastmod> tag for each URL.",
    explanation: "The <lastmod> tag is a crucial hint for AIs, telling them when content has changed and helping them prioritize re-crawling of updated pages.",
    impact: 6
  }
};

/**
 * Analyzes robots.txt for AI bot access and sitemap reference
 * 
 * @param robotsData - Robots.txt response data
 * @returns Object containing MetricCard and optional GlobalPenalty
 */
export function analyzeRobotsTxt(robotsData: any): { card: MetricCard; globalPenalty?: GlobalPenalty } {
  let score = 0;
  let recommendations: Recommendation[] = [];
  let blockedBots: string[] = [];
  let allowedBots: string[] = [];
  let globalPenalty: GlobalPenalty | undefined;

  if (!robotsData?.success) {
    score = 0;
    recommendations.push({
      problem: KNOWLEDGE_BASE.robotsNotFound.problem,
      solution: KNOWLEDGE_BASE.robotsNotFound.solution,
      explanation: KNOWLEDGE_BASE.robotsNotFound.explanation,
      impact: KNOWLEDGE_BASE.robotsNotFound.impact
    });
  } else {
    const robotsContent = robotsData.data || '';
    
    if (robotsContent.trim() === '') {
      // Empty robots.txt = all bots allowed
      score = 25;
      allowedBots = [...AI_BOTS];
    } else {
      const rules = parseRobotsTxt(robotsContent);
      
      // Check AI bot access
      for (const bot of AI_BOTS) {
        if (isBotAllowed(rules, bot)) {
          allowedBots.push(bot);
        } else {
          blockedBots.push(bot);
        }
      }
      
      const allowedPercentage = allowedBots.length / AI_BOTS.length;
      score = Math.round(25 * allowedPercentage);
      
      if (blockedBots.length > 0) {
        if (blockedBots.length === AI_BOTS.length) {
          // All bots blocked - critical issue
          recommendations.push({
            problem: KNOWLEDGE_BASE.allBotsBlocked.problem,
            solution: KNOWLEDGE_BASE.allBotsBlocked.solution,
            explanation: KNOWLEDGE_BASE.allBotsBlocked.explanation,
            impact: KNOWLEDGE_BASE.allBotsBlocked.impact
          });
        } else {
          // Some bots blocked
          recommendations.push({
            problem: KNOWLEDGE_BASE.someBotsBlocked.problem.replace('[blockedBotsList]', blockedBots.join(', ')),
            solution: KNOWLEDGE_BASE.someBotsBlocked.solution,
            explanation: KNOWLEDGE_BASE.someBotsBlocked.explanation,
            impact: KNOWLEDGE_BASE.someBotsBlocked.impact
          });
        }

        // GLOBAL PENALTY CALCULATION
        const penaltyFactor = calculateGlobalPenaltyFactor(blockedBots, AI_BOTS.length);
        
        if (penaltyFactor > 0) {
          const blockedPercentage = blockedBots.length / AI_BOTS.length;
          globalPenalty = {
            type: 'robots_txt_blocking',
            description: `Robots.txt blocks ${blockedBots.length}/${AI_BOTS.length} major AI bots`,
            penaltyFactor,
            details: [
              `Blocked bots: ${blockedBots.join(', ')}`,
              `Blocked percentage: ${Math.round(blockedPercentage * 100)}%`,
              `Impact on final score: -${Math.round(penaltyFactor * 100)}%`
            ],
            solutions: [
              "Allow AI bots in robots.txt",
              "Use 'Allow: /' for GPTBot, Claude-Web, etc.",
              "Avoid global blocking with 'User-agent: *' and 'Disallow: /'"
            ]
          };
        }
      }
    }

    // Check for sitemap reference in robots.txt
    const hasSitemapReference = robotsContent.toLowerCase().includes('sitemap:');
    if (!hasSitemapReference) {
      recommendations.push({
        problem: KNOWLEDGE_BASE.sitemapNotReferenced.problem,
        solution: KNOWLEDGE_BASE.sitemapNotReferenced.solution,
        explanation: KNOWLEDGE_BASE.sitemapNotReferenced.explanation,
        impact: KNOWLEDGE_BASE.sitemapNotReferenced.impact
      });
    }
  }

  const card: MetricCard = {
    id: 'ai-bots-access',
    name: 'AI Bots Access',
    score,
    maxScore: 25,
    status: getPerformanceStatus(score, 25),
    explanation: "AI bot access to your content is crucial for AEO. Robots.txt blocking these bots drastically reduces your visibility in AI responses and can penalize your entire AEO score.",
    recommendations,
    successMessage: "Excellent! All AI bots can access your content for better AEO.",
    rawData: {
      robotsContent: robotsData?.data || '',
      blockedBots,
      allowedBots,
      totalBots: AI_BOTS.length,
      hasSitemapReference: robotsData?.success ? robotsData.data.toLowerCase().includes('sitemap:') : false
    }
  };

  return { card, globalPenalty };
}

/**
 * Analyzes sitemap.xml for presence and quality
 * 
 * @param sitemapData - Sitemap response data
 * @param robotsData - Robots.txt data (for context)
 * @returns MetricCard with sitemap analysis results
 */
export function analyzeSitemap(sitemapData: any, robotsData: any): MetricCard {
  let score = 0;
  let recommendations: Recommendation[] = [];

  if (!sitemapData?.success) {
    score = 0;
    recommendations.push({
      problem: KNOWLEDGE_BASE.sitemapNotFound.problem,
      solution: KNOWLEDGE_BASE.sitemapNotFound.solution,
      explanation: KNOWLEDGE_BASE.sitemapNotFound.explanation,
      impact: KNOWLEDGE_BASE.sitemapNotFound.impact
    });
  } else {
    // Base score for sitemap presence
    score = 15;
    
    // Check for lastmod tags in sitemap content
    try {
      const $ = cheerio.load(sitemapData.data, { xmlMode: true });
      const lastmodTags = $('lastmod');
      
      if (lastmodTags.length === 0) {
        recommendations.push({
          problem: KNOWLEDGE_BASE.missingLastmodTags.problem,
          solution: KNOWLEDGE_BASE.missingLastmodTags.solution,
          explanation: KNOWLEDGE_BASE.missingLastmodTags.explanation,
          impact: KNOWLEDGE_BASE.missingLastmodTags.impact
        });
      } else {
        // Award remaining points for having lastmod tags
        score = 25;
      }
    } catch (error) {
      // If XML parsing fails, still give base score but add recommendation
      recommendations.push({
        problem: "The sitemap.xml file could not be parsed properly.",
        solution: "Ensure your sitemap.xml is valid XML and follows the sitemap protocol.",
        explanation: "Invalid XML structure prevents proper analysis of sitemap content and may cause crawler issues.",
        impact: 3
      });
    }
  }

  return {
    id: 'sitemap-quality',
    name: 'Sitemap Quality',
    score,
    maxScore: 25,
    status: getPerformanceStatus(score, 25),
    explanation: "XML sitemap helps search engines and AI discover and understand your site structure. It accelerates indexing and improves content coverage.",
    recommendations,
    successMessage: "Great! Your sitemap is properly configured and accessible.",
    rawData: {
      sitemapFound: sitemapData?.success || false,
      error: sitemapData?.error,
      content: sitemapData?.data,
      hasLastmodTags: sitemapData?.success ? (() => {
        try {
          const $ = cheerio.load(sitemapData.data, { xmlMode: true });
          return $('lastmod').length > 0;
        } catch {
          return false;
        }
      })() : false
    }
  };
}

/**
 * Main orchestrator function for AI Access analysis
 * 
 * @param collectedData - Collected data containing robots.txt and sitemap information
 * @returns Object containing cards, total score, max score, and optional global penalty
 */
export function analyzeAiAccess(collectedData: any): { 
  cards: MetricCard[], 
  totalScore: number, 
  maxScore: number, 
  globalPenalty?: GlobalPenalty 
} {
  const robotsData = collectedData?.robotsTxt;
  const sitemapData = collectedData?.sitemap;

  // Analyze robots.txt
  const robotsResult = analyzeRobotsTxt(robotsData);
  
  // Analyze sitemap
  const sitemapCard = analyzeSitemap(sitemapData, robotsData);

  // Calculate totals
  const totalScore = robotsResult.card.score + sitemapCard.score;
  const maxScore = 50; // 25 + 25

  return {
    cards: [robotsResult.card, sitemapCard],
    totalScore,
    maxScore,
    globalPenalty: robotsResult.globalPenalty
  };
}
