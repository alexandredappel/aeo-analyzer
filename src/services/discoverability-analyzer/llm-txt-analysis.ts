/**
 * DISCOVERABILITY ANALYZER - LLM INSTRUCTIONS FILE ANALYSIS
 * 
 * Analyzes the presence of llm.txt or llm-full.txt files (0 points - informational)
 * This is an emerging AEO practice for providing AI-specific instructions
 * Part of Technical Foundation drawer
 */

import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { getPerformanceStatus } from './shared/utils';

/**
 * Knowledge Base for LLM Instructions File Analysis
 * Contains all problems, solutions, explanations, and impacts
 */
const LLM_TXT_KB = {
  notFound: {
    problem: "No llm.txt or llm-full.txt file was found.",
    solution: "Consider creating an llm.txt file at your domain root to provide AI-specific instructions.",
    explanation: "This is an emerging practice to provide AI-specific instructions, such as a site summary or content usage policies, directly to advanced crawlers.",
    impact: 0 // Using 0 for N/A
  }
};

/**
 * Analyzes the presence of LLM instructions file
 * 
 * @param llmTxtData - LLM.txt file response data from crawler
 * @returns MetricCard with analysis results
 */
export function analyzeLlmTxt(llmTxtData: any): MetricCard {
  let score = 0;
  let maxScore = 0;
  let recommendations: Recommendation[] = [];
  let successMessage = '';

  // Check if LLM instructions file was found
  if (llmTxtData?.success === true) {
    // File found - this is a good practice but doesn't affect score
    score = 0;
    maxScore = 0;
    successMessage = 'An llm.txt or llm-full.txt file was found. This is an advanced AEO practice that provides specific instructions to compatible AI models.';
  } else {
    // File not found - provide informational recommendation
    score = 0;
    maxScore = 0;
    recommendations.push({
      problem: LLM_TXT_KB.notFound.problem,
      solution: LLM_TXT_KB.notFound.solution,
      explanation: LLM_TXT_KB.notFound.explanation,
      impact: LLM_TXT_KB.notFound.impact
    });
    successMessage = 'LLM instructions file analysis completed.';
  }

  return {
    id: 'llm-txt-analysis',
    name: 'LLM Instructions File',
    score,
    maxScore,
    status: getPerformanceStatus(score, maxScore),
    explanation: 'This analysis checks for the presence of an llm.txt or llm-full.txt file, which is an emerging practice for providing AI-specific instructions to advanced crawlers. This is purely informational and does not affect your score.',
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    successMessage,
    rawData: {
      llmTxtFound: llmTxtData?.success || false,
      llmTxtContent: llmTxtData?.data || null
    }
  };
}
