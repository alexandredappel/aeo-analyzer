/**
 * TEXT CLARITY ANALYSIS - READABILITY ANALYZER MODULE
 * 
 * Analyzes text complexity and semantic precision for LLM optimization
 * Focuses on Flesch Reading Ease score and passive voice detection
 * Weight: 40 points (40% of total readability score)
 * 
 * Architecture: Two separate metric cards with dynamic, data-rich recommendations
 */

import { MetricCard, Recommendation } from '@/types/analysis-architecture';
import { retext } from 'retext';
import retextEnglish from 'retext-english';
import retextPassive from 'retext-passive';
import { syllable } from 'syllable';

// ===== INTERFACE DEFINITIONS =====

interface TextClarityResult {
  cards: MetricCard[];
  totalScore: number;
  maxScore: number;
  rawData: {
    fleschScore: number;
    passiveVoiceRatio: number;
    totalWords: number;
    totalSentences: number;
    fleschPoints: number;
    passiveVoicePoints: number;
  };
}

// ===== KNOWLEDGE BASE FOR TEXT CLARITY ANALYSIS =====

const TEXT_CLARITY_KNOWLEDGE_BASE = {
  // Flesch Score Issues
  fleschTooComplex: {
    problem: "The text's complexity is too high with a Flesch score of **[fleschScore]**. The target is 40-70.",
    solution: "Shorten sentences and replace multi-syllable words with simpler alternatives to increase your score into the 40-70 range.",
    impact: 8
  },
  fleschTooSimple: {
    problem: "The text may be overly simplistic with a Flesch score of **[fleschScore]**. The target is 40-70.",
    solution: "Consider introducing more varied sentence structures to add nuance, but only if it matches your audience's needs.",
    impact: 4
  },
  
  // Passive Voice Issues
  passiveVoiceHigh: {
    problem: "Passive voice usage is high at **[passiveRatio]%**. It's unclear who is performing key actions.",
    solution: "Rephrase passive sentences to the active voice. Identify the 'doer' of the action and make them the subject of the sentence.",
    impact: 9
  },
  passiveVoiceElevated: {
    problem: "Passive voice usage is slightly elevated at **[passiveRatio]%**. This introduces ambiguity for AIs.",
    solution: "Review sentences like 'The report was written' and rephrase them to 'Our analyst wrote the report' to improve clarity.",
    impact: 6
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Extracts text metrics for analysis
 */
function extractTextMetrics(text: string): { words: string[], sentences: string[] } {
  // Clean text and split into sentences
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Split into words
  const words = cleanText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return { words, sentences };
}

/**
 * Calculates Flesch Reading Ease score using the syllable library for accurate syllable counting
 */
function calculateFleschScore(words: string[], sentences: string[]): number {
  if (words.length === 0 || sentences.length === 0) {
    return 0;
  }
  
  // Count syllables using the specialized syllable library for accurate results
  const syllableCount = words.reduce((total, word) => total + syllable(word), 0);
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllableCount / words.length;
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates Flesch score points based on optimal range (40-70)
 */
function calculateFleschScorePoints(fleschScore: number): number {
  if (fleschScore >= 40 && fleschScore <= 70) {
    return 20; // Optimal range - full points
  } else if (fleschScore >= 30 && fleschScore <= 80) {
    return 15; // Good range
  } else if (fleschScore >= 20 && fleschScore <= 90) {
    return 10; // Fair range
  } else {
    return 5; // Poor range
  }
}

/**
 * Analyzes passive voice using retext-passive
 */
async function analyzePassiveVoice(text: string): Promise<{ passiveCount: number, totalSentences: number, ratio: number }> {
  try {
    const processor = retext()
      .use(retextEnglish)
      .use(retextPassive);
    
    const result = await processor.process(text);
    const passiveNodes: any[] = [];
    
    // Collect passive voice nodes using the correct API
    result.messages.forEach((message: any) => {
      if (message.source === 'retext-passive') {
        passiveNodes.push(message);
      }
    });
    
    // Count sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalSentences = sentences.length;
    const passiveCount = passiveNodes.length;
    const ratio = totalSentences > 0 ? (passiveCount / totalSentences) * 100 : 0;
    
    return { passiveCount, totalSentences, ratio };
  } catch (error) {
    console.error('Error analyzing passive voice:', error);
    return { passiveCount: 0, totalSentences: 0, ratio: 0 };
  }
}

/**
 * Calculates passive voice points based on ratio
 */
function calculatePassiveVoicePoints(ratio: number): number {
  if (ratio < 5) {
    return 20; // Excellent - full points
  } else if (ratio < 10) {
    return 16; // Good - most points
  } else if (ratio < 15) {
    return 12; // Warning - some points
  } else {
    return 8; // Error - few points
  }
}

/**
 * Calculates overall status based on score
 */
function calculateStatus(score: number, maxScore: number): 'excellent' | 'good' | 'warning' | 'error' {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 85) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'error';
}

/**
 * Helper function to get Flesch level from score
 */
function getFleschLevel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

// ===== DYNAMIC MESSAGE UTILITIES =====

/**
 * Replaces dynamic placeholders in problem messages with actual values
 */
function replaceDynamicPlaceholders(template: string, values: Record<string, any>): string {
  let result = template;
  
  // Replace [fleschScore] placeholder
  if (values.fleschScore !== undefined) {
    result = result.replace(/\[fleschScore\]/g, values.fleschScore.toFixed(1));
  }
  
  // Replace [passiveRatio] placeholder
  if (values.passiveRatio !== undefined) {
    result = result.replace(/\[passiveRatio\]/g, values.passiveRatio.toFixed(1));
  }
  
  return result;
}

/**
 * Generates dynamic success message for Flesch Score
 */
function generateFleschSuccessMessage(fleschScore: number): string {
  return `Your text's complexity is in the ideal range with a Flesch score of ${fleschScore.toFixed(1)}. This is great for high-quality, understandable content.`;
}

/**
 * Generates dynamic success message for Passive Voice
 */
function generatePassiveVoiceSuccessMessage(passiveRatio: number): string {
  if (passiveRatio < 5) {
    return `Excellent Active Voice Usage: Your writing is very direct and clear, with only ${passiveRatio.toFixed(1)}% passive voice.`;
  } else if (passiveRatio < 10) {
    return `Good Active Voice Usage: Your use of passive voice is low at ${passiveRatio.toFixed(1)}%, keeping your content clear and unambiguous.`;
  } else {
    return `Your writing uses active voice effectively for clear communication.`;
  }
}

// ===== CARD GENERATION FUNCTIONS =====

/**
 * Creates Flesch Score card with all related logic
 */
function createFleschScoreCard(text: string): MetricCard {
  const { words, sentences } = extractTextMetrics(text);
  
  if (words.length === 0 || sentences.length === 0) {
    return {
      id: 'flesch-score-analysis',
      name: 'Flesch Reading Ease Score',
      score: 0,
      maxScore: 20,
      status: 'error',
      explanation: 'Measures content readability using the Flesch Reading Ease formula. Optimal scores (40-70) ensure content is accessible to both human readers and AI systems for better comprehension and engagement.',
      recommendations: [{
        problem: 'Insufficient text content for Flesch score analysis.',
        solution: 'Provide more substantial text content to enable comprehensive analysis.',
        impact: 10
      }],
      successMessage: 'Excellent! Your Flesch score is in the optimal range for AI comprehension.',
      rawData: {
        fleschScore: 0,
        fleschLevel: 'Unknown',
        totalWords: 0,
        totalSentences: 0,
        avgSentenceLength: 0
      }
    };
  }
  
  const fleschScore = calculateFleschScore(words, sentences);
  const fleschPoints = calculateFleschScorePoints(fleschScore);
  
  // Generate Flesch-specific recommendations with dynamic placeholders
  const recommendations: Recommendation[] = [];
  if (fleschScore < 40) {
    recommendations.push({
      problem: replaceDynamicPlaceholders(TEXT_CLARITY_KNOWLEDGE_BASE.fleschTooComplex.problem, { fleschScore }),
      solution: TEXT_CLARITY_KNOWLEDGE_BASE.fleschTooComplex.solution,
      impact: TEXT_CLARITY_KNOWLEDGE_BASE.fleschTooComplex.impact
    });
  } else if (fleschScore > 70) {
    recommendations.push({
      problem: replaceDynamicPlaceholders(TEXT_CLARITY_KNOWLEDGE_BASE.fleschTooSimple.problem, { fleschScore }),
      solution: TEXT_CLARITY_KNOWLEDGE_BASE.fleschTooSimple.solution,
      impact: TEXT_CLARITY_KNOWLEDGE_BASE.fleschTooSimple.impact
    });
  }
  
  return {
    id: 'flesch-score-analysis',
    name: 'Flesch Reading Ease Score',
    score: fleschPoints,
    maxScore: 20,
    status: calculateStatus(fleschPoints, 20),
    explanation: 'Measures content readability using the Flesch Reading Ease formula. Optimal scores (40-70) ensure content is accessible to both human readers and AI systems for better comprehension and engagement.',
    recommendations,
    successMessage: generateFleschSuccessMessage(fleschScore),
    rawData: {
      fleschScore,
      fleschLevel: getFleschLevel(fleschScore),
      totalWords: words.length,
      totalSentences: sentences.length,
      avgSentenceLength: words.length / sentences.length
    }
  };
}

/**
 * Creates Passive Voice card with all related logic
 */
async function createPassiveVoiceCard(text: string): Promise<MetricCard> {
  const { words, sentences } = extractTextMetrics(text);
  
  if (words.length === 0 || sentences.length === 0) {
    return {
      id: 'passive-voice-analysis',
      name: 'Passive Voice Ratio',
      score: 0,
      maxScore: 20,
      status: 'error',
      explanation: 'Measures the percentage of sentences using passive voice. Lower ratios indicate more direct, clear writing that is easier for AI systems to understand and extract factual relationships.',
      recommendations: [{
        problem: 'Insufficient text content for passive voice analysis.',
        solution: 'Provide more substantial text content to enable comprehensive analysis.',
        impact: 10
      }],
      successMessage: 'Great! Your writing uses active voice effectively for clear communication.',
      rawData: {
        passiveVoiceRatio: 0,
        passiveSentences: 0,
        totalSentences: 0,
        totalWords: 0
      }
    };
  }
  
  const passiveVoiceData = await analyzePassiveVoice(text);
  const passiveVoicePoints = calculatePassiveVoicePoints(passiveVoiceData.ratio);
  
  // Generate Passive Voice-specific recommendations with dynamic placeholders
  const recommendations: Recommendation[] = [];
  if (passiveVoiceData.ratio > 15) {
    recommendations.push({
      problem: replaceDynamicPlaceholders(TEXT_CLARITY_KNOWLEDGE_BASE.passiveVoiceHigh.problem, { passiveRatio: passiveVoiceData.ratio }),
      solution: TEXT_CLARITY_KNOWLEDGE_BASE.passiveVoiceHigh.solution,
      impact: TEXT_CLARITY_KNOWLEDGE_BASE.passiveVoiceHigh.impact
    });
  } else if (passiveVoiceData.ratio > 10) {
    recommendations.push({
      problem: replaceDynamicPlaceholders(TEXT_CLARITY_KNOWLEDGE_BASE.passiveVoiceElevated.problem, { passiveRatio: passiveVoiceData.ratio }),
      solution: TEXT_CLARITY_KNOWLEDGE_BASE.passiveVoiceElevated.solution,
      impact: TEXT_CLARITY_KNOWLEDGE_BASE.passiveVoiceElevated.impact
    });
  }
  
  return {
    id: 'passive-voice-analysis',
    name: 'Passive Voice Ratio',
    score: passiveVoicePoints,
    maxScore: 20,
    status: calculateStatus(passiveVoicePoints, 20),
    explanation: 'Measures the percentage of sentences using passive voice. Lower ratios indicate more direct, clear writing that is easier for AI systems to understand and extract factual relationships.',
    recommendations,
    successMessage: generatePassiveVoiceSuccessMessage(passiveVoiceData.ratio),
    rawData: {
      passiveVoiceRatio: passiveVoiceData.ratio,
      passiveSentences: passiveVoiceData.passiveCount,
      totalSentences: passiveVoiceData.totalSentences,
      totalWords: words.length
    }
  };
}

// ===== MAIN ANALYSIS FUNCTION =====

/**
 * Analyzes text clarity using Flesch Reading Ease score and passive voice detection
 * Returns two separate MetricCards: one for Flesch Score and one for Passive Voice
 */
export async function analyzeTextClarity(text: string): Promise<TextClarityResult> {
  try {
    // Extract text metrics once for both analyses
    const { words, sentences } = extractTextMetrics(text);
    
    if (words.length === 0 || sentences.length === 0) {
      const errorCard: MetricCard = {
        id: 'text-clarity-error',
        name: 'Text Clarity',
        score: 0,
        maxScore: 40,
        status: 'error',
        explanation: 'This analysis evaluates your writing\'s syntactic complexity and semantic precision to ensure content is direct, unambiguous, and factual for optimal AI comprehension.',
        recommendations: [{
          problem: 'Insufficient text content for analysis.',
          solution: 'Provide more substantial text content to enable comprehensive analysis.',
          impact: 10
        }],
        successMessage: 'Excellent! Your text clarity is optimized for both human readers and AI systems.',
        rawData: {
          fleschScore: 0,
          passiveVoiceRatio: 0,
          totalWords: 0,
          totalSentences: 0
        }
      };
      
      return {
        cards: [errorCard],
        totalScore: 0,
        maxScore: 40,
        rawData: {
          fleschScore: 0,
          passiveVoiceRatio: 0,
          totalWords: 0,
          totalSentences: 0,
          fleschPoints: 0,
          passiveVoicePoints: 0
        }
      };
    }
    
    // Create both cards
    const fleschCard = createFleschScoreCard(text);
    const passiveVoiceCard = await createPassiveVoiceCard(text);
    
    // Calculate combined scores
    const totalScore = fleschCard.score + passiveVoiceCard.score;
    const maxScore = 40; // 20 + 20
    
    return {
      cards: [fleschCard, passiveVoiceCard],
      totalScore,
      maxScore,
      rawData: {
        fleschScore: fleschCard.rawData?.fleschScore || 0,
        passiveVoiceRatio: passiveVoiceCard.rawData?.passiveVoiceRatio || 0,
        totalWords: words.length,
        totalSentences: sentences.length,
        fleschPoints: fleschCard.score,
        passiveVoicePoints: passiveVoiceCard.score
      }
    };
    
  } catch (error) {
    console.error('Error in text clarity analysis:', error);
    
    const errorCard: MetricCard = {
      id: 'text-clarity-error',
      name: 'Text Clarity',
      score: 0,
      maxScore: 40,
      status: 'error',
      explanation: 'This analysis evaluates your writing\'s syntactic complexity and semantic precision to ensure content is direct, unambiguous, and factual for optimal AI comprehension.',
      recommendations: [{
        problem: 'Error occurred during text clarity analysis.',
        solution: 'Please try again with different text content or contact support if the issue persists.',
        impact: 10
      }],
      successMessage: 'Excellent! Your text clarity is optimized for both human readers and AI systems.',
      rawData: {
        fleschScore: 0,
        passiveVoiceRatio: 0,
        totalWords: 0,
        totalSentences: 0
      }
    };
    
    return {
      cards: [errorCard],
      totalScore: 0,
      maxScore: 40,
      rawData: {
        fleschScore: 0,
        passiveVoiceRatio: 0,
        totalWords: 0,
        totalSentences: 0,
        fleschPoints: 0,
        passiveVoicePoints: 0
      }
    };
  }
}
