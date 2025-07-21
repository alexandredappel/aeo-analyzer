/**
 * Discoverability Analyzer for AEO Auditor
 * Analyzes website discoverability for AI search engines
 * 
 * Scoring Criteria (100 points total):
 * - HTTPS Protocol: 25 points
 * - HTTP Status: 25 points  
 * - Robots.txt AI Bots: 30 points
 * - Sitemap Present: 20 points
 */

// Types and interfaces
interface AnalysisResult {
  score: number;
  status: 'pass' | 'partial' | 'fail';
  message: string;
}

interface RobotRules {
  [userAgent: string]: {
    allows: string[];
    disallows: string[];
  };
}

interface CollectedData {
  url: string;
  html?: {
    success: boolean;
    error?: string;
    metadata?: {
      statusCode?: number;
    };
  };
  robotsTxt?: {
    success: boolean;
    data?: string;
    error?: string;
  };
  sitemap?: {
    success: boolean;
    error?: string;
  };
}

interface DiscoverabilityBreakdown {
  https: AnalysisResult;
  httpStatus: AnalysisResult;
  robotsAiBots: AnalysisResult;
  sitemap: AnalysisResult;
}

interface DiscoverabilityResult {
  category: string;
  score: number;
  maxScore: number;
  breakdown: DiscoverabilityBreakdown;
  recommendations: string[];
  error?: string;
}

// AI bots to check in robots.txt
const AI_BOTS: string[] = [
  'GPTBot',
  'Google-Extended', 
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot'
];

/**
 * Analyzes HTTPS protocol usage
 * @param url - The website URL
 * @returns Analysis result with score and details
 */
function analyzeHttps(url: string): AnalysisResult {
  try {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    
    return {
      score: isHttps ? 25 : 0,
      status: isHttps ? 'pass' : 'fail',
      message: isHttps ? 'HTTPS enabled' : 'HTTP only - upgrade to HTTPS recommended'
    };
  } catch (error) {
    return {
      score: 0,
      status: 'fail',
      message: 'Invalid URL format'
    };
  }
}

/**
 * Analyzes HTTP status code
 * @param htmlData - HTML collection data with metadata
 * @returns Analysis result with score and details
 */
function analyzeHttpStatus(htmlData: CollectedData['html']): AnalysisResult {
  try {
    if (!htmlData?.success) {
      return {
        score: 0,
        status: 'fail',
        message: `HTTP error: ${htmlData?.error || 'Unknown error'}`
      };
    }
    
    const statusCode = htmlData.metadata?.statusCode || 200;
    const isSuccessful = statusCode >= 200 && statusCode < 300;
    
    return {
      score: isSuccessful ? 25 : 0,
      status: isSuccessful ? 'pass' : 'fail',
      message: isSuccessful ? `Returns ${statusCode} OK` : `HTTP ${statusCode} error`
    };
  } catch (error) {
    return {
      score: 0,
      status: 'fail',
      message: 'Unable to determine HTTP status'
    };
  }
}

/**
 * Parses robots.txt content to extract rules for specific user agents
 * @param robotsContent - Raw robots.txt content
 * @returns Parsed rules by user agent
 */
function parseRobotsTxt(robotsContent: string): RobotRules {
  const rules: RobotRules = {};
  const lines = robotsContent.split('\n').map(line => line.trim());
  
  let currentUserAgent: string | null = null;
  
  for (const line of lines) {
    if (line.startsWith('#') || line === '') continue;
    
    if (line.toLowerCase().startsWith('user-agent:')) {
      currentUserAgent = line.substring(11).trim().toLowerCase();
      if (!rules[currentUserAgent]) {
        rules[currentUserAgent] = { allows: [], disallows: [] };
      }
    } else if (currentUserAgent && line.toLowerCase().startsWith('disallow:')) {
      const path = line.substring(9).trim();
      rules[currentUserAgent].disallows.push(path);
    } else if (currentUserAgent && line.toLowerCase().startsWith('allow:')) {
      const path = line.substring(6).trim();
      rules[currentUserAgent].allows.push(path);
    }
  }
  
  return rules;
}

/**
 * Checks if a specific bot is allowed based on robots.txt rules
 * @param rules - Parsed robots.txt rules
 * @param botName - Name of the bot to check
 * @returns True if bot is allowed
 */
function isBotAllowed(rules: RobotRules, botName: string): boolean {
  const botNameLower = botName.toLowerCase();
  
  // Check specific bot rules first
  if (rules[botNameLower]) {
    const botRules = rules[botNameLower];
    // If explicitly disallowed from root, bot is blocked
    if (botRules.disallows.includes('/')) return false;
    // If explicitly allowed or no disallow rules, bot is allowed
    return true;
  }
  
  // Check wildcard rules (User-agent: *)
  if (rules['*']) {
    const wildcardRules = rules['*'];
    // If wildcard disallows root, bot is blocked unless specifically allowed
    if (wildcardRules.disallows.includes('/')) return false;
    // If wildcard allows or no disallow rules, bot is allowed
    return true;
  }
  
  // If no rules found, assume allowed (permissive default)
  return true;
}

/**
 * Analyzes robots.txt for AI bot accessibility
 * @param robotsData - Robots.txt collection data
 * @returns Analysis result with score and details
 */
function analyzeRobotsAiBots(robotsData: CollectedData['robotsTxt']): AnalysisResult {
  try {
    // If robots.txt is missing
    if (!robotsData?.success) {
      return {
        score: 0,
        status: 'fail',
        message: 'No robots.txt found - AI bots may have limited access'
      };
    }
    
    const robotsContent = robotsData.data;
    
    // If robots.txt is empty, assume permissive (all bots allowed)
    if (!robotsContent || robotsContent.trim() === '') {
      return {
        score: 30,
        status: 'pass',
        message: 'Empty robots.txt - all AI bots allowed'
      };
    }
    
    const rules = parseRobotsTxt(robotsContent);
    let allowedBots = 0;
    let blockedBots: string[] = [];
    
    // Check each AI bot
    for (const bot of AI_BOTS) {
      if (isBotAllowed(rules, bot)) {
        allowedBots++;
      } else {
        blockedBots.push(bot);
      }
    }
    
    const allowedPercentage = allowedBots / AI_BOTS.length;
    const score = Math.round(30 * allowedPercentage);
    
    let status: 'pass' | 'partial' | 'fail';
    let message: string;
    
    if (allowedBots === AI_BOTS.length) {
      status = 'pass';
      message = 'All AI bots allowed in robots.txt';
    } else if (allowedBots > 0) {
      status = 'partial';
      message = `${allowedBots}/${AI_BOTS.length} AI bots allowed. Blocked: ${blockedBots.join(', ')}`;
    } else {
      status = 'fail';
      message = 'All AI bots blocked by robots.txt';
    }
    
    return { score, status, message };
    
  } catch (error) {
    return {
      score: 0,
      status: 'fail',
      message: 'Error parsing robots.txt'
    };
  }
}

/**
 * Analyzes sitemap presence
 * @param sitemapData - Sitemap collection data
 * @returns Analysis result with score and details
 */
function analyzeSitemap(sitemapData: CollectedData['sitemap']): AnalysisResult {
  try {
    if (sitemapData?.success) {
      return {
        score: 20,
        status: 'pass',
        message: 'XML sitemap found'
      };
    } else {
      return {
        score: 0,
        status: 'fail',
        message: 'No XML sitemap found'
      };
    }
  } catch (error) {
    return {
      score: 0,
      status: 'fail',
      message: 'Error checking sitemap'
    };
  }
}

/**
 * Generates recommendations based on analysis results
 * @param breakdown - Analysis breakdown by category
 * @returns Array of recommendation strings
 */
function generateRecommendations(breakdown: DiscoverabilityBreakdown): string[] {
  const recommendations: string[] = [];
  
  // HTTPS recommendations
  if (breakdown.https.status === 'pass') {
    recommendations.push('✅ Great! Your site uses HTTPS for secure connections');
  } else {
    recommendations.push('❌ Upgrade to HTTPS to improve security and SEO rankings');
  }
  
  // HTTP Status recommendations
  if (breakdown.httpStatus.status === 'pass') {
    recommendations.push('✅ Website is accessible and returns successful HTTP status');
  } else {
    recommendations.push('❌ Fix HTTP errors to ensure your site is accessible to crawlers');
  }
  
  // Robots.txt AI bots recommendations
  if (breakdown.robotsAiBots.status === 'pass') {
    recommendations.push('✅ AI search engines can access your content via robots.txt');
  } else if (breakdown.robotsAiBots.status === 'partial') {
    recommendations.push('⚠️ Consider allowing blocked AI bots in robots.txt for better AEO');
  } else {
    recommendations.push('❌ Add robots.txt or allow AI bots to improve discoverability');
  }
  
  // Sitemap recommendations
  if (breakdown.sitemap.status === 'pass') {
    recommendations.push('✅ XML sitemap helps search engines understand your content structure');
  } else {
    recommendations.push('❌ Add an XML sitemap to improve content discoverability');
  }
  
  return recommendations;
}

/**
 * Main discoverability analysis function
 * @param collectedData - Data collected from crawler service
 * @returns Complete discoverability analysis with score and recommendations
 */
export function analyzeDiscoverability(collectedData: CollectedData): DiscoverabilityResult {
  try {
    // Validate input
    if (!collectedData || typeof collectedData !== 'object') {
      throw new Error('Invalid collected data provided');
    }
    
    const { url, html, robotsTxt, sitemap } = collectedData;
    
    if (!url) {
      throw new Error('URL is required for discoverability analysis');
    }
    
    // Perform individual analyses
    const httpsAnalysis = analyzeHttps(url);
    const httpStatusAnalysis = analyzeHttpStatus(html);
    const robotsAnalysis = analyzeRobotsAiBots(robotsTxt);
    const sitemapAnalysis = analyzeSitemap(sitemap);
    
    // Calculate total score
    const totalScore = httpsAnalysis.score + httpStatusAnalysis.score + 
                      robotsAnalysis.score + sitemapAnalysis.score;
    
    // Build breakdown
    const breakdown: DiscoverabilityBreakdown = {
      https: httpsAnalysis,
      httpStatus: httpStatusAnalysis,
      robotsAiBots: robotsAnalysis,
      sitemap: sitemapAnalysis
    };
    
    // Generate recommendations
    const recommendations = generateRecommendations(breakdown);
    
    return {
      category: 'discoverability',
      score: totalScore,
      maxScore: 100,
      breakdown,
      recommendations
    };
    
  } catch (error) {
    // Return error state with minimal score
    return {
      category: 'discoverability',
      score: 0,
      maxScore: 100,
      breakdown: {
        https: { score: 0, status: 'fail', message: 'Analysis error' },
        httpStatus: { score: 0, status: 'fail', message: 'Analysis error' },
        robotsAiBots: { score: 0, status: 'fail', message: 'Analysis error' },
        sitemap: { score: 0, status: 'fail', message: 'Analysis error' }
      },
      recommendations: [`❌ Analysis failed: ${(error as Error).message}`],
      error: (error as Error).message
    };
  }
}

// Export helper functions for testing and external use
export {
  analyzeHttps,
  analyzeHttpStatus,
  analyzeRobotsAiBots,
  analyzeSitemap,
  parseRobotsTxt,
  isBotAllowed,
  AI_BOTS
};

// Export types for external use
export type {
  DiscoverabilityResult,
  DiscoverabilityBreakdown,
  AnalysisResult,
  CollectedData,
  RobotRules
}; 