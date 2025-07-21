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

// AI bots to check in robots.txt
const AI_BOTS = [
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
 * @param {string} url - The website URL
 * @returns {Object} Analysis result with score and details
 */
function analyzeHttps(url) {
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
 * @param {Object} htmlData - HTML collection data with metadata
 * @returns {Object} Analysis result with score and details
 */
function analyzeHttpStatus(htmlData) {
  try {
    if (!htmlData.success) {
      return {
        score: 0,
        status: 'fail',
        message: `HTTP error: ${htmlData.error || 'Unknown error'}`
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
 * @param {string} robotsContent - Raw robots.txt content
 * @returns {Object} Parsed rules by user agent
 */
function parseRobotsTxt(robotsContent) {
  const rules = {};
  const lines = robotsContent.split('\n').map(line => line.trim());
  
  let currentUserAgent = null;
  
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
 * @param {Object} rules - Parsed robots.txt rules
 * @param {string} botName - Name of the bot to check
 * @returns {boolean} True if bot is allowed
 */
function isBotAllowed(rules, botName) {
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
 * @param {Object} robotsData - Robots.txt collection data
 * @returns {Object} Analysis result with score and details
 */
function analyzeRobotsAiBots(robotsData) {
  try {
    // If robots.txt is missing
    if (!robotsData.success) {
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
    let blockedBots = [];
    
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
    
    let status, message;
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
 * @param {Object} sitemapData - Sitemap collection data
 * @returns {Object} Analysis result with score and details
 */
function analyzeSitemap(sitemapData) {
  try {
    if (sitemapData.success) {
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
 * @param {Object} breakdown - Analysis breakdown by category
 * @returns {Array} Array of recommendation strings
 */
function generateRecommendations(breakdown) {
  const recommendations = [];
  
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
 * @param {Object} collectedData - Data collected from crawler service
 * @returns {Object} Complete discoverability analysis with score and recommendations
 */
function analyzeDiscoverability(collectedData) {
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
    const httpStatusAnalysis = analyzeHttpStatus(html || {});
    const robotsAnalysis = analyzeRobotsAiBots(robotsTxt || {});
    const sitemapAnalysis = analyzeSitemap(sitemap || {});
    
    // Calculate total score
    const totalScore = httpsAnalysis.score + httpStatusAnalysis.score + 
                      robotsAnalysis.score + sitemapAnalysis.score;
    
    // Build breakdown
    const breakdown = {
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
      recommendations: [`❌ Analysis failed: ${error.message}`],
      error: error.message
    };
  }
}

module.exports = {
  analyzeDiscoverability,
  // Export helper functions for testing
  analyzeHttps,
  analyzeHttpStatus,
  analyzeRobotsAiBots,
  analyzeSitemap,
  parseRobotsTxt,
  isBotAllowed
};

// ===== TESTING SECTION =====
// Uncomment to test this analyzer independently

/*
// Test Case 1: HTTPS site with no robots.txt
const testCase1 = {
  url: 'https://example.com',
  html: { success: true, metadata: { statusCode: 200 } },
  robotsTxt: { success: false, error: 'Not found' },
  sitemap: { success: false, error: 'Not found' }
};

console.log('=== Test Case 1: HTTPS + No robots.txt ===');
console.log(JSON.stringify(analyzeDiscoverability(testCase1), null, 2));
console.log('Expected score: 50/100 (HTTPS: 25 + HTTP Status: 25)');

// Test Case 2: HTTP site with permissive robots.txt
const testCase2 = {
  url: 'http://example.com',
  html: { success: true, metadata: { statusCode: 200 } },
  robotsTxt: { success: true, data: 'User-agent: *\nDisallow:' },
  sitemap: { success: true }
};

console.log('\n=== Test Case 2: HTTP + Good robots.txt + Sitemap ===');
console.log(JSON.stringify(analyzeDiscoverability(testCase2), null, 2));
console.log('Expected score: 75/100 (HTTP Status: 25 + Robots: 30 + Sitemap: 20)');

// Test Case 3: HTTPS site with restrictive robots.txt
const testCase3 = {
  url: 'https://example.com',
  html: { success: true, metadata: { statusCode: 200 } },
  robotsTxt: { success: true, data: 'User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nDisallow: /' },
  sitemap: { success: true }
};

console.log('\n=== Test Case 3: HTTPS + Restrictive robots.txt + Sitemap ===');
console.log(JSON.stringify(analyzeDiscoverability(testCase3), null, 2));
console.log('Expected score: 70/100 (HTTPS: 25 + HTTP Status: 25 + Sitemap: 20)');
*/ 