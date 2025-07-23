/**
 * DISCOVERABILITY ANALYZER - PHASE 2: NEW HIERARCHICAL ARCHITECTURE
 * 
 * Analyzes discoverability for search engines and AI (20% of total score)
 * Architecture: 🔍 DISCOVERABILITY → Foundation + AI Access → MetricCards
 * 
 * GLOBAL PENALTY: Robots.txt blocking AI bots affects the final global score
 */

import { 
  MetricCard, 
  DrawerSubSection, 
  MainSection, 
  GlobalPenalty, 
  PerformanceStatus 
} from '@/types/analysis-architecture';

// ===== INTERFACES AND TYPES =====

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
    data?: string;
  };
}

interface RobotRules {
  [userAgent: string]: {
    allows: string[];
    disallows: string[];
  };
}

interface DiscoverabilityAnalysisResult {
  section: MainSection;
  globalPenalties: GlobalPenalty[];
  rawData: {
    httpsEnabled: boolean;
    httpStatusCode: number;
    robotsContent: string;
    sitemapPresent: boolean;
    blockedAIBots: string[];
    allowedAIBots: string[];
    error?: string;
  };
}

// ===== CONSTANTS =====

const AI_BOTS: string[] = [
  'GPTBot',
  'Google-Extended', 
  'ChatGPT-User',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'CCBot'
];

const SECTION_CONFIG = {
  id: 'discoverability',
  name: 'Discoverability',
  emoji: '🔍',
  description: 'Visibility and accessibility for search engines and AI',
  weightPercentage: 20,
  maxScore: 100
};

// ===== UTILITIES =====

/**
 * Determines performance status based on score
 */
function getPerformanceStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

/**
 * Parses robots.txt content into structured rules
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
 * Checks if an AI bot is allowed according to robots.txt
 */
function isBotAllowed(rules: RobotRules, botName: string): boolean {
  const botNameLower = botName.toLowerCase();
  
  // Check bot-specific rules
  if (rules[botNameLower]) {
    const botRules = rules[botNameLower];
    if (botRules.disallows.includes('/')) return false;
    return true;
  }
  
  // Check wildcard rules (User-agent: *)
  if (rules['*']) {
    const wildcardRules = rules['*'];
    if (wildcardRules.disallows.includes('/')) return false;
    return true;
  }
  
  // Default to allowed if no rules found
  return true;
}

// ===== METRIC ANALYZERS =====

/**
 * Analyzes HTTPS protocol (25 points)
 */
function analyzeHTTPS(url: string): MetricCard {
  try {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    
    return {
      id: 'https-protocol',
      name: 'HTTPS Protocol',
      score: isHttps ? 25 : 0,
      maxScore: 25,
      status: getPerformanceStatus(isHttps ? 25 : 0, 25),
      explanation: "HTTPS protocol encrypts data between browser and server, improving security and trust. Google and AI engines prioritize HTTPS sites in their rankings.",
      problems: isHttps ? [] : [
        "Your site uses HTTP instead of HTTPS",
        "Data is not encrypted in transit",
        "Negative impact on SEO rankings",
        "Loss of trust from users and AI crawlers"
      ],
      solutions: isHttps ? [
        "Excellent! Your site uses HTTPS",
        "Ensure all internal links use HTTPS",
        "Check for mixed content (HTTP/HTTPS)"
      ] : [
        "Install a valid SSL/TLS certificate",
        "Configure automatic HTTP → HTTPS redirection",
        "Update all internal links to HTTPS",
        "Add HSTS (HTTP Strict Transport Security)"
      ],
      successMessage: "Great! Your site uses HTTPS protocol for secure connections.",
      rawData: {
        protocol: urlObj.protocol,
        isSecure: isHttps
      }
    };
  } catch (error) {
    return {
      id: 'https-protocol',
      name: 'HTTPS Protocol',
      score: 0,
      maxScore: 25,
      status: 'error',
      explanation: "HTTPS protocol is essential for security and SEO.",
      problems: ["Invalid or inaccessible URL"],
      solutions: ["Verify the provided URL is valid"],
      successMessage: "Great! Your site uses HTTPS protocol for secure connections.",
      rawData: { error: (error as Error).message }
    };
  }
}

/**
 * Analyzes HTTP status (25 points)
 */
function analyzeHTTPStatus(htmlData: CollectedData['html']): MetricCard {
  const statusCode = htmlData?.metadata?.statusCode || 0;
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  if (!htmlData?.success) {
    problems = [
      "Cannot access the page",
      htmlData?.error || "Unknown connection error",
      "AI crawlers cannot analyze the content"
    ];
    solutions = [
      "Verify web server is running correctly",
      "Check DNS configuration",
      "Test accessibility from different networks"
    ];
  } else if (statusCode >= 200 && statusCode < 300) {
    score = 25;
    solutions = [
      "Perfect! Your page returns a success code",
      "Maintain server availability",
      "Monitor loading performance"
    ];
  } else if (statusCode >= 300 && statusCode < 400) {
    score = 15;
    problems = [
      `Redirection detected (${statusCode})`,
      "Redirections can slow down indexing",
      "Potentially problematic redirect chains"
    ];
    solutions = [
      "Use 301 redirects for permanent changes",
      "Avoid multiple redirect chains",
      "Update internal links to final URL"
    ];
  } else if (statusCode >= 400 && statusCode < 500) {
    problems = [
      `Client error detected (${statusCode})`,
      "Page is not accessible to crawlers",
      "Negative impact on indexing and SEO"
    ];
    solutions = [
      "Fix URL or restore missing content",
      "Check access permissions",
      "Redirect to existing page if appropriate"
    ];
  } else if (statusCode >= 500) {
    problems = [
      `Server error detected (${statusCode})`,
      "Server issue preventing access",
      "Unavailable to search engines and AI"
    ];
    solutions = [
      "Diagnose and fix server error",
      "Check server error logs",
      "Contact hosting provider if necessary"
    ];
  }

  return {
    id: 'http-status',
    name: 'HTTP Status',
    score,
    maxScore: 25,
    status: getPerformanceStatus(score, 25),
    explanation: "HTTP status code indicates if your page is accessible to crawlers. A 200 (success) status is optimal for indexing by search engines and AI.",
    problems,
    solutions,
    successMessage: "Perfect! Your site returns a valid HTTP 200 status code.",
    rawData: {
      statusCode,
      success: htmlData?.success || false,
      error: htmlData?.error
    }
  };
}

/**
 * Analyzes AI bots access (30 points) - GLOBAL PENALTY SOURCE
 */
function analyzeRobotsAIBots(robotsData: CollectedData['robotsTxt']): { 
  card: MetricCard; 
  globalPenalty?: GlobalPenalty 
} {
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  let blockedBots: string[] = [];
  let allowedBots: string[] = [];
  let globalPenalty: GlobalPenalty | undefined;

  if (!robotsData?.success) {
    score = 0;
    problems = [
      "Robots.txt file not found",
      "AI bots may have unpredictable access",
      "Risk of default blocking by some crawlers"
    ];
    solutions = [
      "Create robots.txt file at site root",
      "Explicitly allow important AI bots",
      "Test accessibility with Google Search Console"
    ];
  } else {
    const robotsContent = robotsData.data || '';
    
    if (robotsContent.trim() === '') {
      score = 30;
      allowedBots = [...AI_BOTS];
      solutions = [
        "Excellent! Empty robots.txt = access allowed for all bots",
        "Consider adding specific rules if necessary",
        "Monitor crawler activity"
      ];
    } else {
      const rules = parseRobotsTxt(robotsContent);
      
      for (const bot of AI_BOTS) {
        if (isBotAllowed(rules, bot)) {
          allowedBots.push(bot);
        } else {
          blockedBots.push(bot);
        }
      }
      
      const allowedPercentage = allowedBots.length / AI_BOTS.length;
      score = Math.round(30 * allowedPercentage);
      
      if (blockedBots.length > 0) {
        problems = [
          `${blockedBots.length}/${AI_BOTS.length} AI bots blocked by robots.txt`,
          `Blocked bots: ${blockedBots.join(', ')}`,
          "Reduced visibility in AI search results"
        ];
        
        solutions = [
          "Modify robots.txt to allow AI bots",
          "Use 'Allow: /' for specific AI User-agents",
          "Avoid 'Disallow: /' in global rules"
        ];

        // GLOBAL PENALTY CALCULATION
        const blockedPercentage = blockedBots.length / AI_BOTS.length;
        let penaltyFactor = 0;
        
        if (blockedPercentage >= 1.0) {
          // All bots blocked = 70% penalty
          penaltyFactor = 0.7;
        } else if (blockedPercentage > 0.5) {
          // More than 50% blocked = 40% penalty
          penaltyFactor = 0.4;
        }
        
        if (penaltyFactor > 0) {
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
      } else {
        solutions = [
          "Perfect! All AI bots have access to your content",
          "Maintain this configuration to optimize AEO",
          "Monitor emerging AI bots"
        ];
      }
    }
  }

  const card: MetricCard = {
    id: 'ai-bots-access',
    name: 'AI Bots Access',
    score,
    maxScore: 30,
    status: getPerformanceStatus(score, 30),
    explanation: "AI bot access to your content is crucial for AEO. Robots.txt blocking these bots drastically reduces your visibility in AI responses and can penalize your entire AEO score.",
    problems,
    solutions,
    successMessage: "Excellent! All AI bots can access your content for better AEO.",
    rawData: {
      robotsContent: robotsData?.data || '',
      blockedBots,
      allowedBots,
      totalBots: AI_BOTS.length
    }
  };

  return { card, globalPenalty };
}

/**
 * Analyzes sitemap quality (20 points)
 */
function analyzeSitemapQuality(sitemapData: CollectedData['sitemap']): MetricCard {
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];

  if (!sitemapData?.success) {
    problems = [
      "XML sitemap file not found",
      "Crawlers cannot discover all pages",
      "Slower and less complete indexing"
    ];
    solutions = [
      "Create XML sitemap file at site root",
      "Auto-generate sitemap with your CMS",
      "Submit sitemap via Google Search Console",
      "Add sitemap reference in robots.txt"
    ];
  } else {
    score = 20;
    solutions = [
      "Excellent! XML sitemap detected",
      "Maintain sitemap automatically",
      "Include all important pages",
      "Verify XML validity periodically"
    ];
    
    // TODO: Analyze sitemap content for more precise scoring
    // - Number of URLs
    // - Freshness of modification dates
    // - XML validity
  }

  return {
    id: 'sitemap-quality',
    name: 'Sitemap Quality',
    score,
    maxScore: 20,
    status: getPerformanceStatus(score, 20),
    explanation: "XML sitemap helps search engines and AI discover and understand your site structure. It accelerates indexing and improves content coverage.",
    problems,
    solutions,
    successMessage: "Great! Your sitemap is properly configured and accessible.",
    rawData: {
      sitemapFound: sitemapData?.success || false,
      error: sitemapData?.error,
      content: sitemapData?.data
    }
  };
}

// ===== MAIN ANALYZER =====

/**
 * Complete discoverability analysis according to new architecture
 */
export function analyzeDiscoverability(collectedData: CollectedData): DiscoverabilityAnalysisResult {
  try {
    // Input data validation
    if (!collectedData?.url) {
      throw new Error('URL required for discoverability analysis');
    }

    // Individual metric analyses
    const httpsCard = analyzeHTTPS(collectedData.url);
    const httpStatusCard = analyzeHTTPStatus(collectedData.html);
    const { card: aiBotsCard, globalPenalty } = analyzeRobotsAIBots(collectedData.robotsTxt);
    const sitemapCard = analyzeSitemapQuality(collectedData.sitemap);

    // Build drawers (DrawerSubSection)
    const foundationDrawer: DrawerSubSection = {
      id: 'foundation',
      name: 'Technical Foundation',
      description: 'HTTPS protocol and basic accessibility',
      totalScore: httpsCard.score + httpStatusCard.score,
      maxScore: 50,
      status: getPerformanceStatus(httpsCard.score + httpStatusCard.score, 50),
      cards: [httpsCard, httpStatusCard]
    };

    const aiAccessDrawer: DrawerSubSection = {
      id: 'ai-access',
      name: 'AI Access',
      description: 'Accessibility for AI engines and crawlers',
      totalScore: aiBotsCard.score + sitemapCard.score,
      maxScore: 50,
      status: getPerformanceStatus(aiBotsCard.score + sitemapCard.score, 50),
      cards: [aiBotsCard, sitemapCard]
    };

    // Total section score
    const totalScore = foundationDrawer.totalScore + aiAccessDrawer.totalScore;

    // Build main section
    const section: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: SECTION_CONFIG.description,
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore,
      maxScore: SECTION_CONFIG.maxScore,
      status: getPerformanceStatus(totalScore, SECTION_CONFIG.maxScore),
      drawers: [foundationDrawer, aiAccessDrawer]
    };

    // Raw data for debug/export
    const rawData = {
      httpsEnabled: collectedData.url.startsWith('https://'),
      httpStatusCode: collectedData.html?.metadata?.statusCode || 0,
      robotsContent: collectedData.robotsTxt?.data || '',
      sitemapPresent: collectedData.sitemap?.success || false,
      blockedAIBots: aiBotsCard.rawData?.blockedBots || [],
      allowedAIBots: aiBotsCard.rawData?.allowedBots || []
    };

    return {
      section,
      globalPenalties: globalPenalty ? [globalPenalty] : [],
      rawData
    };

  } catch (error) {
    // Error handling with minimal section
    const errorSection: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: 'Analysis error occurred',
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore: 0,
      maxScore: SECTION_CONFIG.maxScore,
      status: 'error',
      drawers: []
    };

    return {
      section: errorSection,
      globalPenalties: [],
      rawData: {
        httpsEnabled: false,
        httpStatusCode: 0,
        robotsContent: '',
        sitemapPresent: false,
        blockedAIBots: [],
        allowedAIBots: [],
        error: (error as Error).message
      }
    };
  }
}

// ===== EXPORTS =====

export {
  AI_BOTS,
  parseRobotsTxt,
  isBotAllowed,
  analyzeHTTPS,
  analyzeHTTPStatus,
  analyzeRobotsAIBots,
  analyzeSitemapQuality
};

export type {
  DiscoverabilityAnalysisResult,
  CollectedData,
  RobotRules
}; 