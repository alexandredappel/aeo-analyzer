/**
 * LLM FORMATTING ANALYZER - PHASE 4A: NEW HIERARCHICAL ARCHITECTURE
 * 
 * Analyzes LLM-friendly formatting for AI understanding (25% of total score)
 * Architecture: 🤖 LLM FORMATTING → Heading + Semantic + Links + Technical → MetricCards
 * 
 * Uses SharedSemanticHTML5Analyzer to eliminate duplication with Accessibility
 */

import * as cheerio from 'cheerio';
import { 
  MetricCard, 
  DrawerSubSection, 
  MainSection, 
  PerformanceStatus 
} from '@/types/analysis-architecture';
import { 
  SharedSemanticHTML5Analyzer,
  SharedSemanticHTML5Result 
} from '@/services/shared/semantic-html5-analyzer';

// ===== INTERFACES AND TYPES =====

interface LLMFormattingAnalysisResult {
  section: MainSection;
  rawData: {
    headingStructure: {
      hierarchy: boolean;
      h1Count: number;
      totalHeadings: number;
      maxLevel: number;
      quality: number;
    };
    semanticHTML5: SharedSemanticHTML5Result;
    linkQuality: {
      internalCount: number;
      externalCount: number;
      descriptiveCount: number;
      totalLinks: number;
      contextualityScore: number;
    };
    technicalStructure: {
      validHTML: boolean;
      cleanMarkup: number;
      navigationScore: number;
      breadcrumbsPresent: boolean;
    };
    totalScore: number;
    error?: string;
  };
}

interface HeadingAnalysis {
  hierarchy: { valid: boolean; issues: string[] };
  quality: { score: number; issues: string[] };
  semanticValue: { score: number; issues: string[] };
  h1Count: number;
  totalHeadings: number;
  maxLevel: number;
  headings: Array<{ level: number; text: string; descriptive: boolean }>;
}

interface LinkQualityAnalysis {
  internal: { count: number; descriptive: number; score: number; issues: string[] };
  external: { count: number; descriptive: number; authoritative: number; score: number; issues: string[] };
  context: { score: number; issues: string[] };
  totalLinks: number;
  descriptiveRatio: number;
}

interface TechnicalStructureAnalysis {
  cleanMarkup: { score: number; issues: string[] };
  navigation: { score: number; issues: string[] };
  breadcrumbs: { present: boolean; score: number };
  validHTML: boolean;
}

// ===== CONSTANTS =====

const SECTION_CONFIG = {
  id: 'llm-formatting',
  name: 'LLM Formatting',
  emoji: '🤖',
  description: 'Is your content structured for optimal LLM parsing?',
  weightPercentage: 25,
  maxScore: 100
};

/**
 * Authoritative domain patterns for external link scoring
 */
const AUTHORITATIVE_DOMAINS = [
  // Academic & Research
  '.edu', '.gov', '.org',
  // Major tech companies
  'github.com', 'stackoverflow.com', 'developer.mozilla.org',
  // News & Media
  'reuters.com', 'bbc.com', 'cnn.com', 'nytimes.com',
  // Professional
  'linkedin.com', 'medium.com'
];

/**
 * Non-descriptive link text patterns to avoid
 */
const NON_DESCRIPTIVE_PATTERNS = [
  /^(click here|read more|learn more|more|here|this|that)$/i,
  /^(download|link|url|website|page|article)$/i,
  /^(continue|next|previous|back|home)$/i
];

// ===== UTILITIES =====

/**
 * Determines performance status based on score
 */
function getPerformanceStatus(score: number, maxScore: number): PerformanceStatus {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

/**
 * Checks if link text is descriptive
 */
function isDescriptiveLinkText(text: string): boolean {
  const cleanText = text.trim().toLowerCase();
  if (cleanText.length < 3) return false;
  
  return !NON_DESCRIPTIVE_PATTERNS.some(pattern => pattern.test(cleanText));
}

/**
 * Checks if domain is authoritative
 */
function isAuthoritativeDomain(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return AUTHORITATIVE_DOMAINS.some(auth => domain.includes(auth));
  } catch {
    return false;
  }
}

// ===== METRIC ANALYZERS =====

/**
 * Analyzes heading hierarchy (15 points)
 */
function analyzeHeadingHierarchy(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const headingAnalysis = analyzeHeadings($);
  
  // Hierarchy validation (8 points)
  if (headingAnalysis.hierarchy.valid) {
    score += 8;
  } else {
    problems.push(...headingAnalysis.hierarchy.issues);
    score += Math.max(0, 8 - headingAnalysis.hierarchy.issues.length * 2);
  }
  
  // H1 uniqueness (4 points)
  if (headingAnalysis.h1Count === 1) {
    score += 4;
  } else if (headingAnalysis.h1Count === 0) {
    problems.push("Missing H1 heading for main page topic");
    solutions.push("Add a single H1 heading that describes the main content");
  } else {
    problems.push(`Multiple H1 headings found (${headingAnalysis.h1Count}). Should be unique.`);
    solutions.push("Use only one H1 per page, use H2-H6 for subheadings");
  }
  
  // Heading presence (3 points)
  if (headingAnalysis.totalHeadings >= 3) {
    score += 3;
  } else if (headingAnalysis.totalHeadings >= 1) {
    score += 1;
    problems.push("Limited heading structure for content organization");
  } else {
    problems.push("No headings found for content structure");
  }
  
  if (problems.length > 0) {
    solutions.push(
      "Use proper heading hierarchy (H1 → H2 → H3, etc.)",
      "Make headings descriptive and informative",
      "Ensure logical content flow through headings"
    );
  }

  return {
    id: 'heading-hierarchy',
    name: 'Heading Hierarchy',
    score,
    maxScore: 15,
    status: getPerformanceStatus(score, 15),
    explanation: "Proper heading hierarchy helps AI understand content structure and importance. Logical H1-H6 organization improves both accessibility and AI comprehension.",
    problems,
    solutions,
    successMessage: "Excellent! Your heading hierarchy follows logical structure for AI understanding.",
    rawData: {
      h1Count: headingAnalysis.h1Count,
      totalHeadings: headingAnalysis.totalHeadings,
      hierarchyValid: headingAnalysis.hierarchy.valid,
      maxLevel: headingAnalysis.maxLevel
    }
  };
}

/**
 * Analyzes heading quality (10 points)
 */
function analyzeHeadingQuality(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const headingAnalysis = analyzeHeadings($);
  
  if (headingAnalysis.headings.length === 0) {
    problems.push("No headings found to analyze quality");
    solutions.push("Add descriptive headings that summarize section content");
  } else {
    // Quality scoring based on descriptiveness
    score = Math.min(10, headingAnalysis.quality.score);
    
    if (headingAnalysis.quality.issues.length > 0) {
      problems.push(...headingAnalysis.quality.issues);
      solutions.push(
        "Write descriptive headings that summarize content",
        "Avoid generic headings like 'Introduction' or 'Content'",
        "Include relevant keywords naturally in headings"
      );
    }
  }

  return {
    id: 'heading-quality',
    name: 'Heading Quality',
    score,
    maxScore: 10,
    status: getPerformanceStatus(score, 10),
    explanation: "High-quality headings provide clear context and improve AI content understanding. Descriptive headings help both users and AI grasp content topics quickly.",
    problems,
    solutions,
    successMessage: "Great! Your headings are descriptive and provide clear content context.",
    rawData: {
      qualityScore: headingAnalysis.quality.score,
      descriptiveHeadings: headingAnalysis.headings.filter(h => h.descriptive).length,
      totalHeadings: headingAnalysis.headings.length
    }
  };
}

/**
 * Analyzes heading semantic value (10 points)
 */
function analyzeHeadingSemanticValue(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const headingAnalysis = analyzeHeadings($);
  
  if (headingAnalysis.headings.length === 0) {
    problems.push("No headings found to provide semantic value");
    solutions.push("Add headings that create information scent for AI");
  } else {
    // Semantic value scoring
    score = Math.min(10, headingAnalysis.semanticValue.score);
    
    if (headingAnalysis.semanticValue.issues.length > 0) {
      problems.push(...headingAnalysis.semanticValue.issues);
      solutions.push(
        "Create headings that tell a story about your content",
        "Use headings to guide AI through your information architecture",
        "Include key concepts and topics in heading text"
      );
    }
  }

  return {
    id: 'heading-semantic-value',
    name: 'Heading Semantic Value',
    score,
    maxScore: 10,
    status: getPerformanceStatus(score, 10),
    explanation: "Semantically rich headings create information scent that helps AI understand content relationships and topic hierarchy.",
    problems,
    solutions,
    successMessage: "Perfect! Your headings provide excellent semantic information for AI understanding.",
    rawData: {
      semanticScore: headingAnalysis.semanticValue.score,
      informativeHeadings: headingAnalysis.headings.filter(h => h.text.length > 20).length
    }
  };
}

/**
 * Analyzes structural elements using shared analyzer (12 points)
 */
function analyzeStructuralElements(semanticResult: SharedSemanticHTML5Result): MetricCard {
  const score = semanticResult.structuralScore;
  const issues = semanticResult.details.structuralAnalysis.issues;
  
  let problems: string[] = [];
  let solutions: string[] = [];
  
  if (issues.length > 0) {
    problems.push(...issues);
    solutions.push(
      "Add semantic HTML5 structural elements (main, header, nav, footer)",
      "Use main element for primary content area",
      "Include header for site branding and navigation",
      "Add footer for supplementary information"
    );
  }

  return {
    id: 'structural-elements',
    name: 'Structural Elements',
    score,
    maxScore: 12,
    status: getPerformanceStatus(score, 12),
    explanation: "Semantic structural elements help AI understand page layout and content organization. Clear structure improves content comprehension.",
    problems,
    solutions,
    successMessage: "Excellent! Your page uses proper structural elements for AI understanding.",
    rawData: {
      elements: semanticResult.elements.structural,
      structuralAnalysis: semanticResult.details.structuralAnalysis
    }
  };
}

/**
 * Analyzes accessibility features using shared analyzer (8 points)
 */
function analyzeAccessibilityFeatures(semanticResult: SharedSemanticHTML5Result): MetricCard {
  const score = semanticResult.accessibilityScore;
  const issues = semanticResult.details.accessibilityAnalysis.issues;
  
  let problems: string[] = [];
  let solutions: string[] = [];
  
  if (issues.length > 0) {
    problems.push(...issues);
    solutions.push(
      "Add ARIA labels for better element description",
      "Use landmark roles for navigation assistance",
      "Include alt text for all images",
      "Add aria-describedby relationships where appropriate"
    );
  }

  return {
    id: 'accessibility-features',
    name: 'Accessibility Features',
    score,
    maxScore: 8,
    status: getPerformanceStatus(score, 8),
    explanation: "Accessibility features improve AI understanding by providing explicit element descriptions and relationships through ARIA attributes.",
    problems,
    solutions,
    successMessage: "Great! Your accessibility features enhance AI content comprehension.",
    rawData: {
      accessibilityCount: semanticResult.elements.accessibility,
      accessibilityAnalysis: semanticResult.details.accessibilityAnalysis
    }
  };
}

/**
 * Analyzes content flow using shared analyzer (10 points)
 */
function analyzeContentFlow(semanticResult: SharedSemanticHTML5Result): MetricCard {
  const score = semanticResult.contentFlowScore;
  const issues = semanticResult.details.contentFlowAnalysis.issues;
  
  let problems: string[] = [];
  let solutions: string[] = [];
  
  if (issues.length > 0) {
    problems.push(...issues);
    solutions.push(
      "Use article elements for main content pieces",
      "Organize content with section elements",
      "Add aside elements for supplementary information",
      "Create logical content hierarchy with nested elements"
    );
  }

  return {
    id: 'content-flow',
    name: 'Content Flow',
    score,
    maxScore: 10,
    status: getPerformanceStatus(score, 10),
    explanation: "Logical content flow through semantic elements helps AI understand information organization and content relationships.",
    problems,
    solutions,
    successMessage: "Perfect! Your content flow organization is excellent for AI understanding.",
    rawData: {
      contentElements: semanticResult.elements.content,
      contentFlowAnalysis: semanticResult.details.contentFlowAnalysis
    }
  };
}

/**
 * Analyzes internal links (8 points)
 */
function analyzeInternalLinks(html: string, currentUrl: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const linkAnalysis = analyzeLinkQuality($, currentUrl);
  
  if (linkAnalysis.internal.count === 0) {
    problems.push("No internal links found for site navigation");
    solutions.push("Add internal links to related content and important pages");
  } else {
    // Score based on descriptive ratio and count
    const descriptiveRatio = linkAnalysis.internal.descriptive / linkAnalysis.internal.count;
    score = linkAnalysis.internal.score;
    
    if (descriptiveRatio < 0.7) {
      problems.push(`${linkAnalysis.internal.count - linkAnalysis.internal.descriptive} internal links have non-descriptive text`);
    }
    
    if (linkAnalysis.internal.issues.length > 0) {
      problems.push(...linkAnalysis.internal.issues);
    }
  }
  
  if (problems.length > 0) {
    solutions.push(
      "Use descriptive anchor text that explains destination",
      "Avoid generic text like 'click here' or 'read more'",
      "Include relevant keywords in link text naturally"
    );
  }

  return {
    id: 'internal-links',
    name: 'Internal Links',
    score,
    maxScore: 8,
    status: getPerformanceStatus(score, 8),
    explanation: "Descriptive internal links help AI understand site structure and content relationships. Good internal linking improves content discoverability.",
    problems,
    solutions,
    successMessage: "Great! Your internal links use descriptive text for better AI understanding.",
    rawData: {
      internalCount: linkAnalysis.internal.count,
      descriptiveCount: linkAnalysis.internal.descriptive,
      descriptiveRatio: linkAnalysis.descriptiveRatio
    }
  };
}

/**
 * Analyzes external links (7 points)
 */
function analyzeExternalLinks(html: string, currentUrl: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const linkAnalysis = analyzeLinkQuality($, currentUrl);
  
  if (linkAnalysis.external.count === 0) {
    problems.push("No external links found for authority and context");
    solutions.push("Link to authoritative sources to support your content");
  } else {
    score = linkAnalysis.external.score;
    
    if (linkAnalysis.external.issues.length > 0) {
      problems.push(...linkAnalysis.external.issues);
    }
    
    const authoritativeRatio = linkAnalysis.external.authoritative / linkAnalysis.external.count;
    if (authoritativeRatio < 0.5) {
      problems.push("Consider linking to more authoritative sources (.edu, .gov, established domains)");
    }
  }
  
  if (problems.length > 0) {
    solutions.push(
      "Link to authoritative and relevant external sources",
      "Use descriptive anchor text for external links",
      "Ensure external links support and enhance your content"
    );
  }

  return {
    id: 'external-links',
    name: 'External Links',
    score,
    maxScore: 7,
    status: getPerformanceStatus(score, 7),
    explanation: "Quality external links to authoritative sources enhance content credibility and provide additional context for AI understanding.",
    problems,
    solutions,
    successMessage: "Excellent! Your external links connect to authoritative sources effectively.",
    rawData: {
      externalCount: linkAnalysis.external.count,
      authoritativeCount: linkAnalysis.external.authoritative,
      authoritativeRatio: linkAnalysis.external.authoritative / Math.max(1, linkAnalysis.external.count)
    }
  };
}

/**
 * Analyzes link context quality (5 points)
 */
function analyzeLinkContextQuality(html: string, currentUrl: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const linkAnalysis = analyzeLinkQuality($, currentUrl);
  
  if (linkAnalysis.totalLinks === 0) {
    problems.push("No links found to analyze context quality");
    solutions.push("Add links with proper context and integration");
  } else {
    score = linkAnalysis.context.score;
    
    if (linkAnalysis.context.issues.length > 0) {
      problems.push(...linkAnalysis.context.issues);
      solutions.push(
        "Integrate links naturally within content flow",
        "Provide context before and after links",
        "Ensure links enhance rather than interrupt reading"
      );
    }
  }

  return {
    id: 'link-context',
    name: 'Link Context Quality',
    score,
    maxScore: 5,
    status: getPerformanceStatus(score, 5),
    explanation: "Well-integrated links with proper context help AI understand content relationships and improve user experience.",
    problems,
    solutions,
    successMessage: "Perfect! Your links are well-integrated with excellent contextual quality.",
    rawData: {
      contextScore: linkAnalysis.context.score,
      totalLinks: linkAnalysis.totalLinks
    }
  };
}

/**
 * Analyzes clean markup (8 points)
 */
function analyzeCleanMarkup(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 8; // Start with full score
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const technicalAnalysis = analyzeTechnicalStructure($);
  
  score = technicalAnalysis.cleanMarkup.score;
  
  if (technicalAnalysis.cleanMarkup.issues.length > 0) {
    problems.push(...technicalAnalysis.cleanMarkup.issues);
    solutions.push(
      "Minimize inline styles and use external CSS",
      "Remove unnecessary nested elements",
      "Validate HTML markup for errors",
      "Clean up redundant or deprecated attributes"
    );
  }

  return {
    id: 'clean-markup',
    name: 'Clean Markup',
    score,
    maxScore: 8,
    status: getPerformanceStatus(score, 8),
    explanation: "Clean, semantic markup improves AI parsing efficiency and reduces processing complexity for better content understanding.",
    problems,
    solutions,
    successMessage: "Excellent! Your markup is clean and optimized for AI processing.",
    rawData: {
      cleanMarkupScore: technicalAnalysis.cleanMarkup.score,
      validHTML: technicalAnalysis.validHTML
    }
  };
}

/**
 * Analyzes navigation structure (7 points)
 */
function analyzeNavigationStructure(html: string): MetricCard {
  const $ = cheerio.load(html);
  
  let score = 0;
  let problems: string[] = [];
  let solutions: string[] = [];
  
  const technicalAnalysis = analyzeTechnicalStructure($);
  
  score = technicalAnalysis.navigation.score;
  
  if (technicalAnalysis.navigation.issues.length > 0) {
    problems.push(...technicalAnalysis.navigation.issues);
    solutions.push(
      "Add clear navigation menus with semantic markup",
      "Include breadcrumb navigation for deep pages",
      "Use descriptive navigation labels",
      "Ensure navigation is accessible and logical"
    );
  }

  return {
    id: 'navigation-structure',
    name: 'Navigation Structure',
    score,
    maxScore: 7,
    status: getPerformanceStatus(score, 7),
    explanation: "Clear navigation structure helps AI understand site architecture and content relationships. Good navigation improves content discoverability.",
    problems,
    solutions,
    successMessage: "Great! Your navigation structure is clear and well-organized for AI understanding.",
    rawData: {
      navigationScore: technicalAnalysis.navigation.score,
      breadcrumbsPresent: technicalAnalysis.breadcrumbs.present
    }
  };
}

// ===== HELPER FUNCTIONS =====

/**
 * Comprehensive heading analysis
 */
function analyzeHeadings($: cheerio.CheerioAPI): HeadingAnalysis {
  const headings: Array<{ level: number; text: string; descriptive: boolean }> = [];
  let h1Count = 0;
  let maxLevel = 0;
  
  // Collect all headings
  $('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const tag = element.tagName.toLowerCase();
    const level = parseInt(tag.charAt(1));
    const text = $(element).text().trim();
    const descriptive = text.length > 10 && !text.toLowerCase().includes('lorem ipsum');
    
    headings.push({ level, text, descriptive });
    
    if (level === 1) h1Count++;
    if (level > maxLevel) maxLevel = level;
  });
  
  // Analyze hierarchy
  const hierarchyAnalysis = analyzeHeadingHierarchyStructure(headings);
  
  // Analyze quality
  const qualityAnalysis = analyzeHeadingQualityMetrics(headings);
  
  // Analyze semantic value
  const semanticAnalysis = analyzeHeadingSemanticMetrics(headings);
  
  return {
    hierarchy: hierarchyAnalysis,
    quality: qualityAnalysis,
    semanticValue: semanticAnalysis,
    h1Count,
    totalHeadings: headings.length,
    maxLevel,
    headings
  };
}

/**
 * Analyzes heading hierarchy validity
 */
function analyzeHeadingHierarchyStructure(headings: Array<{ level: number; text: string }>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  let valid = true;
  
  if (headings.length === 0) {
    return { valid: false, issues: ['No headings found'] };
  }
  
  // Check for logical progression
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    if (index === 0 && heading.level !== 1) {
      issues.push('Page should start with H1 heading');
      valid = false;
    }
    
    if (heading.level > previousLevel + 1) {
      issues.push(`Heading level jumps from H${previousLevel} to H${heading.level}`);
      valid = false;
    }
    
    previousLevel = heading.level;
  });
  
  return { valid, issues };
}

/**
 * Analyzes heading quality metrics
 */
function analyzeHeadingQualityMetrics(headings: Array<{ level: number; text: string; descriptive: boolean }>): { score: number; issues: string[] } {
  const issues: string[] = [];
  
  if (headings.length === 0) {
    return { score: 0, issues: ['No headings to analyze'] };
  }
  
  const descriptiveCount = headings.filter(h => h.descriptive).length;
  const descriptiveRatio = descriptiveCount / headings.length;
  
  let score = descriptiveRatio * 10;
  
  if (descriptiveRatio < 0.7) {
    issues.push(`${headings.length - descriptiveCount} headings are too short or generic`);
  }
  
  // Check for generic headings
  const genericPatterns = /^(introduction|content|about|info|data|text|section)/i;
  const genericCount = headings.filter(h => genericPatterns.test(h.text)).length;
  
  if (genericCount > 0) {
    issues.push(`${genericCount} headings use generic text`);
    score -= genericCount * 1;
  }
  
  return { score: Math.max(0, Math.round(score)), issues };
}

/**
 * Analyzes heading semantic value metrics
 */
function analyzeHeadingSemanticMetrics(headings: Array<{ level: number; text: string }>): { score: number; issues: string[] } {
  const issues: string[] = [];
  
  if (headings.length === 0) {
    return { score: 0, issues: ['No headings to analyze semantic value'] };
  }
  
  // Score based on informativeness
  const informativeCount = headings.filter(h => h.text.length > 20).length;
  const keywordRichCount = headings.filter(h => h.text.split(' ').length >= 3).length;
  
  let score = 0;
  
  // Length bonus (informative headings)
  score += (informativeCount / headings.length) * 5;
  
  // Keyword richness bonus
  score += (keywordRichCount / headings.length) * 5;
  
  if (informativeCount < headings.length * 0.5) {
    issues.push('Many headings lack informative content');
  }
  
  if (keywordRichCount < headings.length * 0.3) {
    issues.push('Headings could include more relevant keywords');
  }
  
  return { score: Math.round(score), issues };
}

/**
 * Analyzes link quality comprehensively
 */
function analyzeLinkQuality($: cheerio.CheerioAPI, currentUrl: string): LinkQualityAnalysis {
  const allLinks = $('a[href]');
  const analysis: LinkQualityAnalysis = {
    internal: { count: 0, descriptive: 0, score: 0, issues: [] },
    external: { count: 0, descriptive: 0, authoritative: 0, score: 0, issues: [] },
    context: { score: 0, issues: [] },
    totalLinks: allLinks.length,
    descriptiveRatio: 0
  };
  
  let totalDescriptive = 0;
  
  allLinks.each((_, element) => {
    const $link = $(element);
    const href = $link.attr('href') || '';
    const text = $link.text().trim();
    const isDescriptive = isDescriptiveLinkText(text);
    
    if (isDescriptive) totalDescriptive++;
    
    try {
      const linkUrl = new URL(href, currentUrl);
      const currentDomain = new URL(currentUrl).hostname;
      
      if (linkUrl.hostname === currentDomain) {
        // Internal link
        analysis.internal.count++;
        if (isDescriptive) analysis.internal.descriptive++;
      } else {
        // External link
        analysis.external.count++;
        if (isDescriptive) analysis.external.descriptive++;
        if (isAuthoritativeDomain(href)) analysis.external.authoritative++;
      }
    } catch {
      // Relative or malformed links - treat as internal
      analysis.internal.count++;
      if (isDescriptive) analysis.internal.descriptive++;
    }
  });
  
  // Calculate scores
  if (analysis.internal.count > 0) {
    const internalRatio = analysis.internal.descriptive / analysis.internal.count;
    analysis.internal.score = Math.round(internalRatio * 8);
    
    if (internalRatio < 0.7) {
      analysis.internal.issues.push('Many internal links have non-descriptive text');
    }
  }
  
  if (analysis.external.count > 0) {
    const externalDescriptiveRatio = analysis.external.descriptive / analysis.external.count;
    const authoritativeRatio = analysis.external.authoritative / analysis.external.count;
    analysis.external.score = Math.round((externalDescriptiveRatio * 0.4 + authoritativeRatio * 0.6) * 7);
    
    if (externalDescriptiveRatio < 0.7) {
      analysis.external.issues.push('External links need more descriptive anchor text');
    }
    
    if (authoritativeRatio < 0.3) {
      analysis.external.issues.push('Consider linking to more authoritative sources');
    }
  }
  
  // Context analysis
  const contextScore = analyzeLinksContext($);
  analysis.context.score = contextScore.score;
  analysis.context.issues = contextScore.issues;
  
  analysis.descriptiveRatio = analysis.totalLinks > 0 ? totalDescriptive / analysis.totalLinks : 0;
  
  return analysis;
}

/**
 * Analyzes links contextual integration
 */
function analyzeLinksContext($: cheerio.CheerioAPI): { score: number; issues: string[] } {
  const issues: string[] = [];
  const links = $('a[href]');
  
  if (links.length === 0) {
    return { score: 0, issues: ['No links to analyze context'] };
  }
  
  let contextualScore = 0;
  let linksInParagraphs = 0;
  let linksWithSurroundingText = 0;
  
  links.each((_, element) => {
    const $link = $(element);
    const $parent = $link.parent();
    
    // Check if link is within paragraph
    if ($parent.is('p') || $parent.closest('p').length > 0) {
      linksInParagraphs++;
    }
    
    // Check for surrounding text context
    const surroundingText = $parent.text().replace($link.text(), '').trim();
    if (surroundingText.length > 20) {
      linksWithSurroundingText++;
    }
  });
  
  // Score calculation
  const paragraphRatio = linksInParagraphs / links.length;
  const contextRatio = linksWithSurroundingText / links.length;
  
  contextualScore = (paragraphRatio * 0.4 + contextRatio * 0.6) * 5;
  
  if (paragraphRatio < 0.6) {
    issues.push('Many links are not properly integrated within text content');
  }
  
  if (contextRatio < 0.5) {
    issues.push('Links need more surrounding context for better integration');
  }
  
  return { score: Math.round(contextualScore), issues };
}

/**
 * Analyzes technical structure aspects
 */
function analyzeTechnicalStructure($: cheerio.CheerioAPI): TechnicalStructureAnalysis {
  const analysis: TechnicalStructureAnalysis = {
    cleanMarkup: { score: 8, issues: [] },
    navigation: { score: 0, issues: [] },
    breadcrumbs: { present: false, score: 0 },
    validHTML: true
  };
  
  // Clean markup analysis
  const inlineStyles = $('[style]').length;
  const deprecatedTags = $('font, center, b, i').length;
  const deepNesting = $('*').filter((_, el) => $(el).parents().length > 10).length;
  
  if (inlineStyles > 5) {
    analysis.cleanMarkup.issues.push(`${inlineStyles} elements with inline styles found`);
    analysis.cleanMarkup.score -= Math.min(3, Math.floor(inlineStyles / 5));
  }
  
  if (deprecatedTags > 0) {
    analysis.cleanMarkup.issues.push(`${deprecatedTags} deprecated HTML tags found`);
    analysis.cleanMarkup.score -= Math.min(2, deprecatedTags);
  }
  
  if (deepNesting > 0) {
    analysis.cleanMarkup.issues.push('Some elements are deeply nested (>10 levels)');
    analysis.cleanMarkup.score -= 1;
  }
  
  analysis.cleanMarkup.score = Math.max(0, analysis.cleanMarkup.score);
  
  // Navigation analysis
  const navElements = $('nav').length;
  const navLinks = $('nav a, .nav a, .navigation a').length;
  const breadcrumbs = $('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]').length;
  
  if (navElements > 0) {
    analysis.navigation.score += 3;
  } else {
    analysis.navigation.issues.push('No semantic nav elements found');
  }
  
  if (navLinks >= 3) {
    analysis.navigation.score += 2;
  } else {
    analysis.navigation.issues.push('Limited navigation links found');
  }
  
  if (breadcrumbs > 0) {
    analysis.breadcrumbs.present = true;
    analysis.breadcrumbs.score = 2;
    analysis.navigation.score += 2;
  } else {
    analysis.navigation.issues.push('No breadcrumb navigation found');
  }
  
  analysis.navigation.score = Math.min(7, analysis.navigation.score);
  
  return analysis;
}

// ===== MAIN ANALYZER =====

/**
 * Complete LLM formatting analysis according to new architecture
 */
export function analyzeLLMFormatting(html: string, url: string): LLMFormattingAnalysisResult {
  try {
    // Input validation
    if (!html || typeof html !== 'string') {
      throw new Error('HTML content required for LLM formatting analysis');
    }

    // Shared semantic analysis
    const semanticAnalyzer = new SharedSemanticHTML5Analyzer();
    const $ = cheerio.load(html);
    const semanticResult = semanticAnalyzer.analyze($);

    // Individual metric analyses
    const headingHierarchyCard = analyzeHeadingHierarchy(html);
    const headingQualityCard = analyzeHeadingQuality(html);
    const headingSemanticCard = analyzeHeadingSemanticValue(html);
    
    const structuralElementsCard = analyzeStructuralElements(semanticResult);
    const accessibilityFeaturesCard = analyzeAccessibilityFeatures(semanticResult);
    const contentFlowCard = analyzeContentFlow(semanticResult);
    
    const internalLinksCard = analyzeInternalLinks(html, url);
    const externalLinksCard = analyzeExternalLinks(html, url);
    const linkContextCard = analyzeLinkContextQuality(html, url);
    
    const cleanMarkupCard = analyzeCleanMarkup(html);
    const navigationCard = analyzeNavigationStructure(html);

    // Build drawers (DrawerSubSection)
    const headingStructureDrawer: DrawerSubSection = {
      id: 'heading-structure',
      name: 'Heading Structure',
      description: 'Logical heading hierarchy and quality',
      totalScore: headingHierarchyCard.score + headingQualityCard.score + headingSemanticCard.score,
      maxScore: 35,
      status: getPerformanceStatus(
        headingHierarchyCard.score + headingQualityCard.score + headingSemanticCard.score, 
        35
      ),
      cards: [headingHierarchyCard, headingQualityCard, headingSemanticCard]
    };

    const semanticHTML5Drawer: DrawerSubSection = {
      id: 'semantic-html5',
      name: 'Semantic HTML5',
      description: 'Structural elements and accessibility features',
      totalScore: structuralElementsCard.score + accessibilityFeaturesCard.score + contentFlowCard.score,
      maxScore: 30,
      status: getPerformanceStatus(
        structuralElementsCard.score + accessibilityFeaturesCard.score + contentFlowCard.score, 
        30
      ),
      cards: [structuralElementsCard, accessibilityFeaturesCard, contentFlowCard]
    };

    const linkQualityDrawer: DrawerSubSection = {
      id: 'link-quality',
      name: 'Link Quality',
      description: 'Internal and external link optimization',
      totalScore: internalLinksCard.score + externalLinksCard.score + linkContextCard.score,
      maxScore: 20,
      status: getPerformanceStatus(
        internalLinksCard.score + externalLinksCard.score + linkContextCard.score, 
        20
      ),
      cards: [internalLinksCard, externalLinksCard, linkContextCard]
    };

    const technicalStructureDrawer: DrawerSubSection = {
      id: 'technical-structure',
      name: 'Technical Structure',
      description: 'Clean markup and navigation organization',
      totalScore: cleanMarkupCard.score + navigationCard.score,
      maxScore: 15,
      status: getPerformanceStatus(cleanMarkupCard.score + navigationCard.score, 15),
      cards: [cleanMarkupCard, navigationCard]
    };

    // Total section score
    const totalScore = headingStructureDrawer.totalScore + semanticHTML5Drawer.totalScore + 
                      linkQualityDrawer.totalScore + technicalStructureDrawer.totalScore;

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
      drawers: [headingStructureDrawer, semanticHTML5Drawer, linkQualityDrawer, technicalStructureDrawer]
    };

    // Raw data for debug/export
    const headingAnalysis = analyzeHeadings($);
    const linkAnalysis = analyzeLinkQuality($, url);
    const technicalAnalysis = analyzeTechnicalStructure($);

    const rawData = {
      headingStructure: {
        hierarchy: headingAnalysis.hierarchy.valid,
        h1Count: headingAnalysis.h1Count,
        totalHeadings: headingAnalysis.totalHeadings,
        maxLevel: headingAnalysis.maxLevel,
        quality: headingAnalysis.quality.score
      },
      semanticHTML5: semanticResult,
      linkQuality: {
        internalCount: linkAnalysis.internal.count,
        externalCount: linkAnalysis.external.count,
        descriptiveCount: linkAnalysis.internal.descriptive + linkAnalysis.external.descriptive,
        totalLinks: linkAnalysis.totalLinks,
        contextualityScore: linkAnalysis.context.score
      },
      technicalStructure: {
        validHTML: technicalAnalysis.validHTML,
        cleanMarkup: technicalAnalysis.cleanMarkup.score,
        navigationScore: technicalAnalysis.navigation.score,
        breadcrumbsPresent: technicalAnalysis.breadcrumbs.present
      },
      totalScore
    };

    return {
      section,
      rawData
    };

  } catch (error) {
    // Error handling with minimal section
    const errorSection: MainSection = {
      id: SECTION_CONFIG.id,
      name: SECTION_CONFIG.name,
      emoji: SECTION_CONFIG.emoji,
      description: 'Is your content structured for optimal LLM parsing?',
      weightPercentage: SECTION_CONFIG.weightPercentage,
      totalScore: 0,
      maxScore: SECTION_CONFIG.maxScore,
      status: 'error',
      drawers: []
    };

    return {
      section: errorSection,
      rawData: {
        headingStructure: { hierarchy: false, h1Count: 0, totalHeadings: 0, maxLevel: 0, quality: 0 },
        semanticHTML5: {
          structuralScore: 0,
          accessibilityScore: 0,
          contentFlowScore: 0,
          semanticRatio: 0,
          elements: { structural: [], content: [], accessibility: 0, totalElements: 0, semanticElements: 0 },
          details: {
            structuralAnalysis: { main: { count: 0, present: false }, header: { count: 0, present: false }, nav: { count: 0, present: false }, footer: { count: 0, present: false }, score: 0, issues: [] },
            accessibilityAnalysis: { ariaLabels: 0, ariaDescribedBy: 0, ariaLabelledBy: 0, landmarks: 0, roles: 0, altTexts: 0, score: 0, issues: [] },
            contentFlowAnalysis: { article: { count: 0, nested: false }, section: { count: 0, nested: false }, aside: { count: 0, present: false }, score: 0, issues: [] }
          }
        },
        linkQuality: { internalCount: 0, externalCount: 0, descriptiveCount: 0, totalLinks: 0, contextualityScore: 0 },
        technicalStructure: { validHTML: false, cleanMarkup: 0, navigationScore: 0, breadcrumbsPresent: false },
        totalScore: 0,
        error: (error as Error).message
      }
    };
  }
}

// ===== EXPORTS =====

export {
  AUTHORITATIVE_DOMAINS,
  NON_DESCRIPTIVE_PATTERNS,
  analyzeHeadingHierarchy,
  analyzeHeadingQuality,
  analyzeHeadingSemanticValue,
  analyzeStructuralElements,
  analyzeAccessibilityFeatures,
  analyzeContentFlow,
  analyzeInternalLinks,
  analyzeExternalLinks,
  analyzeLinkContextQuality,
  analyzeCleanMarkup,
  analyzeNavigationStructure
};

export type {
  LLMFormattingAnalysisResult,
  HeadingAnalysis,
  LinkQualityAnalysis,
  TechnicalStructureAnalysis
}; 