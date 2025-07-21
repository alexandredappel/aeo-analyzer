import logger from '@/utils/logger';

/**
 * Readability Analyzer Service
 * Analyzes content readability using Flesch-Kincaid scoring and content density metrics
 * Optimized for LLM understanding and search engine visibility
 */

// Types and interfaces
interface ReadabilityWeights {
  fleschScore: number;
  sentenceComplexity: number;
  contentDensity: number;
}

interface AnalysisOptions {
  language?: string;
  minContentLength?: number;
}

interface ReadabilityBreakdown {
  fleschScore: {
    score: number;
    maxScore: number;
    status: string;
    details: string;
  };
  sentenceComplexity: {
    score: number;
    maxScore: number;
    status: string;
    details: string;
  };
  contentDensity: {
    score: number;
    maxScore: number;
    status: string;
    details: string;
  };
}

interface ReadabilityDetails {
  fleschLevel: string;
  averageSentenceLength: number;
  wordCount: number;
  uniqueWords: number;
  contentDensityRatio: number;
}

interface ReadabilityRecommendation {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

interface ComplexityMetric {
  length: number;
  syllablesPerWord: number;
  complexWordRatio: number;
}

interface ReadabilityResult {
  score: number;
  maxScore: number;
  breakdown: ReadabilityBreakdown;
  details: ReadabilityDetails;
  recommendations: string[];
  status: string;
  error?: string;
}

interface ScoreAnalysis {
  fleschScore: number;
  sentenceComplexity: number;
  contentDensity: number;
  totalScore: number;
}

export class ReadabilityAnalyzer {
  private weights: ReadabilityWeights;

  constructor() {
    this.weights = {
      fleschScore: 0.40,      // 40% - Flesch-Kincaid readability score
      sentenceComplexity: 0.30, // 30% - Sentence structure complexity
      contentDensity: 0.30     // 30% - Content density and information richness
    };
  }

  /**
   * Main analysis method
   * @param htmlContent - Raw HTML content
   * @param url - URL being analyzed (optional)
   * @param options - Analysis options
   * @returns Readability analysis results
   */
  async analyze(htmlContent: string, url: string = '', options: AnalysisOptions = {}): Promise<ReadabilityResult> {
    try {
      logger.info('Starting readability analysis');

      // Extract text content from HTML
      const textContent = this.extractTextContent(htmlContent);
      
      if (!textContent || textContent.trim().length < (options.minContentLength || 50)) {
        return this.createEmptyResult('Insufficient text content for analysis');
      }

      // Perform parallel analysis
      const [fleschScore, sentenceComplexity, contentDensity] = await Promise.all([
        this.calculateFleschScore(textContent),
        this.analyzeSentenceComplexity(textContent),
        this.analyzeContentDensity(textContent, htmlContent)
      ]);

      // Calculate weighted score
      const totalScore = this.calculateWeightedScore({
        fleschScore,
        sentenceComplexity,
        contentDensity,
        totalScore: 0
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        fleschScore,
        sentenceComplexity,
        contentDensity,
        totalScore
      });

      logger.info(`Generated ${recommendations.length} recommendations`);
      recommendations.forEach((rec, index) => {
        const recText = typeof rec === 'string' ? rec : (rec.description || rec.title || 'Readability recommendation');
        logger.info(`Recommendation ${index + 1}: ${recText}`);
      });

      // Convert recommendations to strings
      const recommendationStrings = recommendations.map(rec => {
        if (typeof rec === 'string') return rec;
        if (rec && typeof rec === 'object') {
          return rec.description || rec.title || 'Improve readability';
        }
        return 'Improve readability';
      }).filter(rec => rec && rec.trim().length > 0);

      logger.info(`Mapped recommendations: ${JSON.stringify(recommendationStrings)}`);

      const result: ReadabilityResult = {
        score: Math.round(totalScore),
        maxScore: 100,
        breakdown: {
          fleschScore: {
            score: Math.round(fleschScore),
            maxScore: 100,
            status: this.getScoreStatus(fleschScore),
            details: `Flesch Reading Ease: ${Math.round(fleschScore)}, Level: ${this.getFleschLevel(fleschScore)}`
          },
          sentenceComplexity: {
            score: Math.round(sentenceComplexity),
            maxScore: 100,
            status: this.getScoreStatus(sentenceComplexity),
            details: `Average sentence length: ${this.getAverageSentenceLength(textContent)} words`
          },
          contentDensity: {
            score: Math.round(contentDensity),
            maxScore: 100,
            status: this.getScoreStatus(contentDensity),
            details: `Content density ratio: ${(this.calculateContentDensityRatio(textContent, htmlContent) * 100).toFixed(1)}%`
          }
        },
        details: {
          fleschLevel: this.getFleschLevel(fleschScore),
          averageSentenceLength: this.getAverageSentenceLength(textContent),
          wordCount: this.getWordCount(textContent),
          uniqueWords: this.getUniqueWordCount(textContent),
          contentDensityRatio: this.calculateContentDensityRatio(textContent, htmlContent)
        },
        recommendations: recommendationStrings,
        status: 'complete'
      };

      logger.info(`Readability analysis complete. Score: ${result.score}/100`);
      return result;

    } catch (error) {
      logger.error(`Error in readability analysis: ${(error as Error).message}`);
      return this.createEmptyResult('Analysis failed due to technical error');
    }
  }

  /**
   * Extract clean text content from HTML
   * @param htmlContent - Raw HTML
   * @returns Clean text content
   */
  extractTextContent(htmlContent: string): string {
    try {
      // Remove script and style tags
      let text = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

      // Convert HTML entities
      text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      // Remove HTML tags
      text = text.replace(/<[^>]*>/g, ' ');

      // Clean up whitespace
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();

      return text;
    } catch (error) {
      logger.error(`Error extracting text content: ${(error as Error).message}`);
      return '';
    }
  }

  /**
   * Calculate Flesch-Kincaid readability score
   * @param text - Clean text content
   * @returns Score 0-100
   */
  calculateFleschScore(text: string): number {
    try {
      const sentences = this.splitIntoSentences(text);
      const words = this.splitIntoWords(text);
      const syllables = this.countSyllables(text);

      if (sentences.length === 0 || words.length === 0) {
        return 0;
      }

      // Calculate Flesch Reading Ease score
      const fleschReadingEase = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));

      // Convert to 0-100 scale (Flesch Reading Ease is 0-100, but we want higher = better)
      // Flesch Reading Ease: 90-100 = Very Easy, 0-30 = Very Difficult
      // We invert and normalize to make higher scores better for LLMs
      let normalizedScore = Math.max(0, Math.min(100, fleschReadingEase));

      // For LLM optimization, we prefer scores in the 60-80 range (moderately easy)
      // Adjust scoring to favor this range
      if (normalizedScore >= 60 && normalizedScore <= 80) {
        normalizedScore = Math.min(100, normalizedScore * 1.2); // Boost scores in optimal range
      } else if (normalizedScore > 80) {
        normalizedScore = 80 + (normalizedScore - 80) * 0.5; // Reduce very high scores
      } else if (normalizedScore < 30) {
        normalizedScore = normalizedScore * 0.7; // Penalize very difficult text
      }

      return Math.round(normalizedScore);
    } catch (error) {
      logger.error(`Error calculating Flesch score: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Analyze sentence complexity
   * @param text - Clean text content
   * @returns Score 0-100
   */
  analyzeSentenceComplexity(text: string): number {
    try {
      const sentences = this.splitIntoSentences(text);
      if (sentences.length === 0) return 0;

      const complexityMetrics: ComplexityMetric[] = sentences.map(sentence => {
        const words = this.splitIntoWords(sentence);
        const syllables = this.countSyllables(sentence);
        const complexWords = this.countComplexWords(sentence);
        
        return {
          length: words.length,
          syllablesPerWord: words.length > 0 ? syllables / words.length : 0,
          complexWordRatio: words.length > 0 ? complexWords / words.length : 0
        };
      });

      // Calculate average metrics
      const avgLength = complexityMetrics.reduce((sum, m) => sum + m.length, 0) / complexityMetrics.length;
      const avgSyllablesPerWord = complexityMetrics.reduce((sum, m) => sum + m.syllablesPerWord, 0) / complexityMetrics.length;
      const avgComplexWordRatio = complexityMetrics.reduce((sum, m) => sum + m.complexWordRatio, 0) / complexityMetrics.length;

      // Score based on optimal ranges for LLM understanding
      let score = 100;

      // Penalize very long sentences (>25 words)
      if (avgLength > 25) {
        score -= (avgLength - 25) * 2;
      } else if (avgLength < 10) {
        score -= (10 - avgLength) * 1; // Slight penalty for very short sentences
      }

      // Penalize high syllable density (>1.8 syllables per word)
      if (avgSyllablesPerWord > 1.8) {
        score -= (avgSyllablesPerWord - 1.8) * 30;
      }

      // Penalize high complex word ratio (>0.3)
      if (avgComplexWordRatio > 0.3) {
        score -= (avgComplexWordRatio - 0.3) * 50;
      }

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      logger.error(`Error analyzing sentence complexity: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Analyze content density and information richness
   * @param text - Clean text content
   * @param htmlContent - Raw HTML for context
   * @returns Score 0-100
   */
  analyzeContentDensity(text: string, htmlContent: string): number {
    try {
      const words = this.splitIntoWords(text);
      const uniqueWords = this.getUniqueWordCount(text);
      const sentences = this.splitIntoSentences(text);
      const paragraphs = this.splitIntoParagraphs(text);

      if (words.length === 0) return 0;

      // Calculate density metrics
      const vocabularyDiversity = uniqueWords / words.length; // Type-token ratio
      const wordsPerSentence = words.length / sentences.length;
      const wordsPerParagraph = words.length / paragraphs.length;
      const contentDensityRatio = this.calculateContentDensityRatio(text, htmlContent);

      let score = 100;

      // Reward good vocabulary diversity (0.4-0.7 is optimal)
      if (vocabularyDiversity >= 0.4 && vocabularyDiversity <= 0.7) {
        score += 10;
      } else if (vocabularyDiversity < 0.2) {
        score -= 20; // Too repetitive
      } else if (vocabularyDiversity > 0.8) {
        score -= 10; // Too diverse, might be confusing
      }

      // Reward optimal sentence length (15-25 words)
      if (wordsPerSentence >= 15 && wordsPerSentence <= 25) {
        score += 15;
      } else if (wordsPerSentence < 10) {
        score -= 15; // Too short
      } else if (wordsPerSentence > 30) {
        score -= 20; // Too long
      }

      // Reward good paragraph structure (50-150 words per paragraph)
      if (wordsPerParagraph >= 50 && wordsPerParagraph <= 150) {
        score += 10;
      } else if (wordsPerParagraph < 30) {
        score -= 10; // Too short paragraphs
      } else if (wordsPerParagraph > 200) {
        score -= 15; // Too long paragraphs
      }

      // Reward good content density (text vs HTML ratio)
      if (contentDensityRatio >= 0.3 && contentDensityRatio <= 0.7) {
        score += 15;
      } else if (contentDensityRatio < 0.1) {
        score -= 25; // Too much HTML, too little content
      } else if (contentDensityRatio > 0.9) {
        score -= 10; // Might be too dense
      }

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      logger.error(`Error analyzing content density: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Calculate weighted total score
   * @param scores - Individual scores
   * @returns Weighted total score
   */
  calculateWeightedScore(scores: ScoreAnalysis): number {
    return (
      scores.fleschScore * this.weights.fleschScore +
      scores.sentenceComplexity * this.weights.sentenceComplexity +
      scores.contentDensity * this.weights.contentDensity
    );
  }

  /**
   * Generate LLM-specific recommendations
   * @param scores - Analysis scores
   * @returns Recommendations
   */
  generateRecommendations(scores: ScoreAnalysis): Array<ReadabilityRecommendation | string> {
    const recommendations: Array<ReadabilityRecommendation | string> = [];

    // Flesch score recommendations
    if (scores.fleschScore < 50) {
      recommendations.push({
        category: 'readability',
        priority: 'high',
        title: 'Improve Text Readability',
        description: 'Text is too complex for optimal LLM understanding. Consider simplifying sentence structure and using shorter words.',
        impact: 'High impact on LLM comprehension and search visibility'
      });
    } else if (scores.fleschScore > 90) {
      recommendations.push({
        category: 'readability',
        priority: 'medium',
        title: 'Consider Adding Technical Depth',
        description: 'Text is very simple. Consider adding more technical terms and detailed explanations for better search relevance.',
        impact: 'Medium impact on search ranking for technical queries'
      });
    }

    // Sentence complexity recommendations
    if (scores.sentenceComplexity < 60) {
      recommendations.push({
        category: 'structure',
        priority: 'high',
        title: 'Simplify Sentence Structure',
        description: 'Sentences are too complex. Break down long sentences and reduce the use of complex vocabulary.',
        impact: 'High impact on LLM parsing and user comprehension'
      });
    }

    // Content density recommendations
    if (scores.contentDensity < 60) {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        title: 'Improve Content Density',
        description: 'Content lacks sufficient information density. Add more relevant keywords and detailed explanations.',
        impact: 'Medium impact on search relevance and LLM understanding'
      });
    }

    // Positive feedback for good scores
    if (scores.fleschScore >= 70 && scores.sentenceComplexity >= 70 && scores.contentDensity >= 70) {
      recommendations.push({
        category: 'optimization',
        priority: 'low',
        title: 'Excellent Readability',
        description: 'Content is well-optimized for LLM understanding and search engines.',
        impact: 'Positive impact on search visibility and user engagement'
      });
    }

    return recommendations;
  }

  /**
   * Get Flesch reading level description
   * @param score - Flesch score
   * @returns Reading level
   */
  getFleschLevel(score: number): string {
    if (score >= 90) return 'Elementary';
    if (score >= 80) return 'High School';
    if (score >= 70) return 'College';
    if (score >= 60) return 'University';
    if (score >= 50) return 'Graduate';
    return 'Expert';
  }

  /**
   * Get score status for consistency with other analyzers
   * @param score - Score 0-100
   * @returns Status description
   */
  getScoreStatus(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'pass';
    if (score >= 60) return 'needs-improvement';
    return 'fail';
  }

  // Helper methods for text analysis
  splitIntoSentences(text: string): string[] {
    return text
      .replace(/([.!?])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  splitIntoWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  splitIntoParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  countSyllables(text: string): number {
    // Simple syllable counting algorithm
    const words = this.splitIntoWords(text);
    return words.reduce((count, word) => {
      return count + this.countWordSyllables(word);
    }, 0);
  }

  countWordSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  countComplexWords(text: string): number {
    const words = this.splitIntoWords(text);
    return words.filter(word => this.countWordSyllables(word) >= 3).length;
  }

  getWordCount(text: string): number {
    return this.splitIntoWords(text).length;
  }

  getUniqueWordCount(text: string): number {
    const words = this.splitIntoWords(text);
    return new Set(words).size;
  }

  getAverageSentenceLength(text: string): number {
    const sentences = this.splitIntoSentences(text);
    const words = this.splitIntoWords(text);
    return sentences.length > 0 ? Math.round((words.length / sentences.length) * 10) / 10 : 0;
  }

  calculateContentDensityRatio(text: string, htmlContent: string): number {
    if (!htmlContent || htmlContent.length === 0) return 0;
    return text.length / htmlContent.length;
  }

  /**
   * Create empty result for error cases
   * @param errorMessage - Error description
   * @returns Empty result structure
   */
  createEmptyResult(errorMessage: string): ReadabilityResult {
    return {
      score: 0,
      maxScore: 100,
      breakdown: {
        fleschScore: {
          score: 0,
          maxScore: 100,
          status: 'fail',
          details: errorMessage
        },
        sentenceComplexity: {
          score: 0,
          maxScore: 100,
          status: 'fail',
          details: errorMessage
        },
        contentDensity: {
          score: 0,
          maxScore: 100,
          status: 'fail',
          details: errorMessage
        }
      },
      details: {
        fleschLevel: 'Unknown',
        averageSentenceLength: 0,
        wordCount: 0,
        uniqueWords: 0,
        contentDensityRatio: 0
      },
      recommendations: [errorMessage],
      status: 'error',
      error: errorMessage
    };
  }
}

// Export types for external use
export type {
  ReadabilityResult,
  ReadabilityWeights,
  ReadabilityBreakdown,
  ReadabilityDetails,
  ReadabilityRecommendation,
  AnalysisOptions,
  ComplexityMetric,
  ScoreAnalysis
};

export default ReadabilityAnalyzer; 