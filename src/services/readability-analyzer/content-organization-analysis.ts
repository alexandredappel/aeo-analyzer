/**
 * CONTENT ORGANIZATION ANALYSIS - READABILITY ANALYZER MODULE
 * 
 * Analyzes paragraph structure and content density
 * Focuses on content organization and scannability
 * Weight: 40 points (40% of total readability score)
 * 
 * Architecture: Two metric cards for paragraph structure and content density
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { ContentOrganizationAnalysisResult } from './shared/types';
import { CONTENT_ORGANIZATION_WEIGHTS } from './shared/constants';
import { 
  extractTextContent,
  extractWords,
  calculateParagraphStructureScore,
  calculateContentDensityScore,
  calculateStatus,
  createErrorCard 
} from './shared/utils';

/**
 * Replaces dynamic placeholders in problem descriptions with actual calculated values
 */
function replaceDynamicPlaceholders(template: string, values: Record<string, any>): string {
  let result = template;
  
  // Replace [count] placeholder
  if (values.count !== undefined) {
    result = result.replace(/\[count\]/g, values.count.toString());
  }
  
  // Replace [percent] placeholder
  if (values.percent !== undefined) {
    result = result.replace(/\[percent\]/g, values.percent.toString());
  }
  
  // Replace [ratio] placeholder
  if (values.ratio !== undefined) {
    result = result.replace(/\[ratio\]/g, values.ratio.toFixed(1));
  }
  
  // Replace [wordCount] placeholder
  if (values.wordCount !== undefined) {
    result = result.replace(/\[wordCount\]/g, values.wordCount.toString());
  }
  
  return result;
}

/**
 * KNOWLEDGE BASE - Content Organization Problems and Solutions
 * Based on DOCUMENTATION/READIBILITY ANALYSIS/PROBLEMES-SOLUTIONS-CONTENT-ORGANIZATION.md
 * Dynamic version with placeholders for data-rich recommendations
 */
const CONTENT_ORGANIZATION_KNOWLEDGE_BASE = {
  // Paragraph Structure Issues (20 points)
  paragraphsTooLong: {
    problem: "[count] paragraphs ([percent]%) are too long (over 150 words).",
    solution: "Review these long paragraphs and split them into smaller, more focused ones.",
    impact: 8
  },
  paragraphsTooShort: {
    problem: "[count] paragraphs ([percent]%) are too short (under 50 words).",
    solution: "Consolidate or expand these short paragraphs to provide more context.",
    impact: 5
  },
  inconsistentParagraphLength: {
    problem: "Paragraph length is inconsistent, which can disrupt reading flow.",
    solution: "Revise your content to ensure paragraphs have more consistent lengths.",
    impact: 4
  },
  
  // Content Density Issues (15 points)
  lowTextToHTMLRatio: {
    problem: "The text-to-HTML ratio is low at [ratio]%. The target is above 15%.",
    solution: "Increase the amount of descriptive text or simplify the HTML structure.",
    impact: 7
  },
  insufficientWordCount: {
    problem: "The page contains only [wordCount] words of text. The target is over 300.",
    solution: "Expand the content to provide at least 300 words of valuable text for your users.",
    impact: 9
  }
};

/**
 * Analyzes content organization including paragraph structure and content density
 */
export function analyzeContentOrganization($: cheerio.CheerioAPI): ContentOrganizationAnalysisResult {
  try {
    // Analyze paragraph structure
    const paragraphStructureCard = analyzeParagraphStructure($);
    
    // Analyze content density
    const contentDensityCard = analyzeContentDensity($);
    
    // Calculate total score
    const totalScore = paragraphStructureCard.score + contentDensityCard.score;
    const maxScore = CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE + CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY;
    
    return {
      totalScore,
      maxScore,
      cards: [paragraphStructureCard, contentDensityCard],
      rawData: {
        paragraphStructure: {
          totalParagraphs: paragraphStructureCard.rawData?.totalParagraphs || 0,
          wellStructuredCount: paragraphStructureCard.rawData?.wellStructuredCount || 0,
          wellStructuredRatio: paragraphStructureCard.rawData?.wellStructuredRatio || 0,
          averageWordsPerParagraph: paragraphStructureCard.rawData?.averageWordsPerParagraph || 0
        },
        contentDensity: {
          textToHTMLRatio: contentDensityCard.rawData?.textToHTMLRatio || 0,
          readableText: contentDensityCard.rawData?.readableText || 0,
          totalMarkup: contentDensityCard.rawData?.totalMarkup || 0
        }
      }
    };
    
  } catch (error) {
    console.error('Error in content organization analysis:', error);
    
    const errorCard = createErrorCard(
      'content-organization', 
      'Content Organization', 
      CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE + CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY, 
      'Error analyzing content organization'
    );
    
    return {
      totalScore: 0,
      maxScore: CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE + CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY,
      cards: [errorCard],
      rawData: {
        paragraphStructure: {
          totalParagraphs: 0,
          wellStructuredCount: 0,
          wellStructuredRatio: 0,
          averageWordsPerParagraph: 0
        },
        contentDensity: {
          textToHTMLRatio: 0,
          readableText: 0,
          totalMarkup: 0
        }
      }
    };
  }
}

/**
 * Analyzes paragraph structure quality (20 pts)
 * Optimal paragraph length: 50-150 words for scannable content
 */
function analyzeParagraphStructure($: cheerio.CheerioAPI): MetricCard {
  try {
    const paragraphs = $('p');
    const totalParagraphs = paragraphs.length;
    
    if (totalParagraphs === 0) {
      return createErrorCard(
        'paragraph-structure', 
        'Paragraph Structure', 
        CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE, 
        'No paragraphs found for analysis'
      );
    }
    
    let wellStructuredCount = 0;
    let totalWords = 0;
    const paragraphLengths: number[] = [];
    let longParagraphsCount = 0;
    let shortParagraphsCount = 0;
    
    paragraphs.each((_, p) => {
      const text = $(p).text().trim();
      const words = extractWords(text);
      const wordCount = words.length;
      
      totalWords += wordCount;
      paragraphLengths.push(wordCount);
      
      // Well-structured paragraphs: 50-150 words
      if (wordCount >= 50 && wordCount <= 150) {
        wellStructuredCount++;
      }
      
      // Count problematic paragraphs
      if (wordCount > 150) {
        longParagraphsCount++;
      }
      if (wordCount < 50) {
        shortParagraphsCount++;
      }
    });
    
    const wellStructuredRatio = wellStructuredCount / totalParagraphs;
    const averageWordsPerParagraph = totalWords / totalParagraphs;
    
    // Calculate standard deviation for consistency check
    const variance = paragraphLengths.reduce((acc, length) => {
      return acc + Math.pow(length - averageWordsPerParagraph, 2);
    }, 0) / totalParagraphs;
    const standardDeviation = Math.sqrt(variance);
    const isInconsistent = standardDeviation > averageWordsPerParagraph * 0.8; // High variance
    
    // Calculate score based on well-structured paragraph ratio
    const score = calculateParagraphStructureScore(wellStructuredRatio);
    
    // Generate recommendations using knowledge base with dynamic data
    const recommendations: Recommendation[] = [];
    
    if (longParagraphsCount > totalParagraphs * 0.3) {
      const percent = Math.round((longParagraphsCount / totalParagraphs) * 100);
      const problemText = replaceDynamicPlaceholders(
        CONTENT_ORGANIZATION_KNOWLEDGE_BASE.paragraphsTooLong.problem,
        { count: longParagraphsCount, percent }
      );
      
      recommendations.push({
        problem: problemText,
        solution: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.paragraphsTooLong.solution,
        impact: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.paragraphsTooLong.impact
      });
    }
    
    if (shortParagraphsCount > totalParagraphs * 0.4) {
      const percent = Math.round((shortParagraphsCount / totalParagraphs) * 100);
      const problemText = replaceDynamicPlaceholders(
        CONTENT_ORGANIZATION_KNOWLEDGE_BASE.paragraphsTooShort.problem,
        { count: shortParagraphsCount, percent }
      );
      
      recommendations.push({
        problem: problemText,
        solution: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.paragraphsTooShort.solution,
        impact: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.paragraphsTooShort.impact
      });
    }
    
    if (isInconsistent) {
      recommendations.push({
        problem: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.inconsistentParagraphLength.problem,
        solution: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.inconsistentParagraphLength.solution,
        impact: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.inconsistentParagraphLength.impact
      });
    }
    
    return {
      id: 'paragraph-structure',
      name: 'Paragraph Structure',
      score,
      maxScore: CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE,
      status: calculateStatus(score, CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE),
      explanation: 'Evaluates paragraph length and structure for optimal readability. Well-structured paragraphs (50-150 words) improve content scannability and reader engagement while maintaining proper information density.',
      recommendations,
      successMessage: 'Great! Your paragraphs are well-structured for easy scanning.',
      rawData: {
        totalParagraphs,
        wellStructuredCount,
        wellStructuredRatio,
        averageWordsPerParagraph: Math.round(averageWordsPerParagraph)
      }
    };
    
  } catch (error) {
    return createErrorCard(
      'paragraph-structure', 
      'Paragraph Structure', 
      CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE, 
      'Error analyzing paragraph structure'
    );
  }
}

/**
 * Analyzes content density (15 pts)
 * High text-to-markup ratio indicates substantial content
 */
function analyzeContentDensity($: cheerio.CheerioAPI): MetricCard {
  try {
    const fullHTML = $.html();
    const textContent = extractTextContent($);
    
    const htmlLength = fullHTML.length;
    const textLength = textContent.length;
    
    if (htmlLength === 0) {
      return createErrorCard(
        'content-density', 
        'Content Density', 
        CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY, 
        'No HTML content found'
      );
    }
    
    const textToHTMLRatio = textLength / htmlLength;
    
    // Calculate score based on content density ratio
    const score = calculateContentDensityScore(textToHTMLRatio);
    
    // Generate recommendations using knowledge base with dynamic data
    const recommendations: Recommendation[] = [];
    
    if (textToHTMLRatio < 0.1) { // Below 10%
      const ratioPercent = textToHTMLRatio * 100;
      const problemText = replaceDynamicPlaceholders(
        CONTENT_ORGANIZATION_KNOWLEDGE_BASE.lowTextToHTMLRatio.problem,
        { ratio: ratioPercent }
      );
      
      recommendations.push({
        problem: problemText,
        solution: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.lowTextToHTMLRatio.solution,
        impact: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.lowTextToHTMLRatio.impact
      });
    }
    
    if (textLength < 300) {
      const problemText = replaceDynamicPlaceholders(
        CONTENT_ORGANIZATION_KNOWLEDGE_BASE.insufficientWordCount.problem,
        { wordCount: textLength }
      );
      
      recommendations.push({
        problem: problemText,
        solution: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.insufficientWordCount.solution,
        impact: CONTENT_ORGANIZATION_KNOWLEDGE_BASE.insufficientWordCount.impact
      });
    }
    
    return {
      id: 'content-density',
      name: 'Content Density',
      score,
      maxScore: CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY,
      status: calculateStatus(score, CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY),
      explanation: 'Measures the ratio of readable text content to HTML markup. Higher ratios indicate substantial, content-rich pages that provide real value to readers and search engines.',
      recommendations,
      successMessage: 'Perfect! Your content has high substance-to-markup ratio.',
      rawData: {
        textToHTMLRatio: Math.round(textToHTMLRatio * 100) / 100,
        readableText: textLength,
        totalMarkup: htmlLength
      }
    };
    
  } catch (error) {
    return createErrorCard(
      'content-density', 
      'Content Density', 
      CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY, 
      'Error analyzing content density'
    );
  }
} 