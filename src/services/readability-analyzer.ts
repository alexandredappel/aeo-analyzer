/**
 * READABILITY ANALYZER - PHASE 6A
 * 
 * Editorial content quality analysis for content creators
 * Eliminates Flesch score duplication with LLM Formatting section
 * Focuses on content organization, paragraph structure, and readability
 * 
 * Architecture: 3 Drawers (Text Complexity, Content Organization, Sentence Quality)
 * Weight: 15% of total AEO score
 */

import * as cheerio from 'cheerio';
import { MetricCard, DrawerSubSection, MainSection, PerformanceStatus, PERFORMANCE_THRESHOLDS } from '@/types/analysis-architecture';

// ===== INTERFACES =====

export interface ReadabilityAnalysisResult {
  category: 'readability';
  score: number;
  maxScore: number;
  weightPercentage: 15;
  
  section: MainSection;
  
  rawData: {
    textComplexity: {
      fleschScore: number;
      fleschLevel: string;
      totalWords: number;
      totalSentences: number;
    };
    contentOrganization: {
      paragraphStructure: {
        totalParagraphs: number;
        averageWordsPerParagraph: number;
        wellStructuredRatio: number;
      };
      contentDensity: {
        textToHTMLRatio: number;
        readableText: number;
        totalMarkup: number;
      };
    };
    sentenceQuality: {
      averageSentenceLength: number;
      vocabularyDiversity: number;
      uniqueWords: number;
      totalWords: number;
    };
  };
}

// ===== CONSTANTS =====

const TEXT_COMPLEXITY_WEIGHTS = {
  FLESCH_SCORE: 40
} as const;

const CONTENT_ORGANIZATION_WEIGHTS = {
  PARAGRAPH_STRUCTURE: 20,
  CONTENT_DENSITY: 15
} as const;

const SENTENCE_QUALITY_WEIGHTS = {
  AVERAGE_LENGTH: 15,
  VOCABULARY_DIVERSITY: 10
} as const;

// Flesch score level mappings
const FLESCH_LEVELS = {
  90: 'Very Easy',
  80: 'Easy', 
  70: 'Fairly Easy',
  60: 'Standard',
  50: 'Fairly Difficult',
  30: 'Difficult',
  0: 'Very Difficult'
} as const;

// ===== MAIN ANALYZER =====

export class ReadabilityAnalyzer {

  /**
   * Main analysis method
   */
  async analyze(html: string, url?: string): Promise<ReadabilityAnalysisResult> {
    try {
      const $ = cheerio.load(html);
      
      // Extract text content
      const textContent = this.extractTextContent($);
      
      // Analyze Text Complexity
      const fleschScoreCard = this.analyzeFleschScore(textContent);
      
      // Analyze Content Organization
      const paragraphStructureCard = this.analyzeParagraphStructure($);
      const contentDensityCard = this.analyzeContentDensity($);
      
      // Analyze Sentence Quality
      const averageLengthCard = this.analyzeAverageLength(textContent);
      const vocabularyDiversityCard = this.analyzeVocabularyDiversity(textContent);
      
      // Create drawers
      const textComplexityDrawer = this.createTextComplexityDrawer([
        fleschScoreCard
      ]);
      
      const contentOrganizationDrawer = this.createContentOrganizationDrawer([
        paragraphStructureCard,
        contentDensityCard
      ]);
      
      const sentenceQualityDrawer = this.createSentenceQualityDrawer([
        averageLengthCard,
        vocabularyDiversityCard
      ]);
      
      // Create main section
      const section = this.createMainSection([
        textComplexityDrawer,
        contentOrganizationDrawer,
        sentenceQualityDrawer
      ]);
      
      // Calculate raw data
      const words = this.extractWords(textContent);
      const sentences = this.extractSentences(textContent);
      const totalParagraphs = $('p').length;
      
      const rawData = {
        textComplexity: {
          fleschScore: fleschScoreCard.rawData?.fleschScore || 0,
          fleschLevel: fleschScoreCard.rawData?.fleschLevel || 'Unknown',
          totalWords: words.length,
          totalSentences: sentences.length
        },
        contentOrganization: {
          paragraphStructure: {
            totalParagraphs,
            averageWordsPerParagraph: paragraphStructureCard.rawData?.averageWordsPerParagraph || 0,
            wellStructuredRatio: paragraphStructureCard.rawData?.wellStructuredRatio || 0
          },
          contentDensity: {
            textToHTMLRatio: contentDensityCard.rawData?.textToHTMLRatio || 0,
            readableText: contentDensityCard.rawData?.readableText || 0,
            totalMarkup: contentDensityCard.rawData?.totalMarkup || 0
          }
        },
        sentenceQuality: {
          averageSentenceLength: averageLengthCard.rawData?.averageLength || 0,
          vocabularyDiversity: vocabularyDiversityCard.rawData?.vocabularyDiversity || 0,
          uniqueWords: vocabularyDiversityCard.rawData?.uniqueWords || 0,
          totalWords: words.length
        }
      };
      
      return {
        category: 'readability',
        score: section.totalScore,
        maxScore: section.maxScore,
        weightPercentage: 15,
        section,
        rawData
      };
      
    } catch (error) {
      console.error('Error in readability analysis:', error);
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // ===== TEXT COMPLEXITY ANALYSIS (40pts) =====

  /**
   * Analyzes Flesch readability score (40 pts)
   * Primary readability metric optimized for LLM comprehension
   */
  private analyzeFleschScore(text: string): MetricCard {
    try {
      const words = this.extractWords(text);
      const sentences = this.extractSentences(text);
      const syllables = this.countSyllables(words);
      
      if (words.length === 0 || sentences.length === 0) {
        return this.createErrorCard('flesch-score', 'Flesch Score', TEXT_COMPLEXITY_WEIGHTS.FLESCH_SCORE, 'Insufficient text content for analysis');
      }
      
      // Calculate Flesch Reading Ease score
      const avgSentenceLength = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;
      const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
      const normalizedScore = Math.max(0, Math.min(100, fleschScore));
      
      // Get readability level
      const fleschLevel = this.getFleschLevel(normalizedScore);
      
      // Score based on optimal range for LLMs (60-80)
      let score = 0;
      if (normalizedScore >= 60 && normalizedScore <= 80) score = 40;      // Optimal for LLMs
      else if (normalizedScore >= 50 && normalizedScore <= 90) score = 35; // Good
      else if (normalizedScore >= 40 && normalizedScore <= 95) score = 25; // Fair
      else if (normalizedScore >= 30) score = 15;                          // Poor
      else score = 5;                                                      // Very poor
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (normalizedScore < 60) {
        problems.push('Content complexity may be too high for optimal comprehension');
        problems.push('Long sentences and complex vocabulary may hinder readability');
        solutions.push('Shorten sentences to 15-25 words for better clarity');
        solutions.push('Use simpler vocabulary where possible');
        solutions.push('Break down complex ideas into smaller, digestible parts');
      }
      
      if (normalizedScore > 80) {
        problems.push('Content may be oversimplified for the target audience');
        solutions.push('Consider adding more detailed explanations where appropriate');
        solutions.push('Use varied sentence structures for better engagement');
      }
      
      return {
        id: 'flesch-score',
        name: 'Flesch Score',
        score,
        maxScore: TEXT_COMPLEXITY_WEIGHTS.FLESCH_SCORE,
        status: this.calculateStatus(score, TEXT_COMPLEXITY_WEIGHTS.FLESCH_SCORE),
        explanation: 'Measures content readability using the Flesch Reading Ease formula. Optimal scores (60-80) ensure content is accessible to both human readers and AI systems for better comprehension and engagement.',
        problems,
        solutions,
        successMessage: 'Excellent! Your content readability is optimized for both humans and AI.',
        rawData: {
          fleschScore: normalizedScore,
          fleschLevel,
          avgSentenceLength,
          avgSyllablesPerWord,
          totalWords: words.length,
          totalSentences: sentences.length
        }
      };
      
    } catch (error) {
      return this.createErrorCard('flesch-score', 'Flesch Score', TEXT_COMPLEXITY_WEIGHTS.FLESCH_SCORE, 'Error calculating Flesch score');
    }
  }

  // ===== CONTENT ORGANIZATION ANALYSIS (35pts) =====

  /**
   * Analyzes paragraph structure quality (20 pts)
   * Optimal paragraph length: 50-150 words for scannable content
   */
  private analyzeParagraphStructure($: cheerio.CheerioAPI): MetricCard {
    try {
      const paragraphs = $('p');
      const totalParagraphs = paragraphs.length;
      
      if (totalParagraphs === 0) {
        return this.createErrorCard('paragraph-structure', 'Paragraph Structure', CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE, 'No paragraphs found for analysis');
      }
      
      let wellStructuredCount = 0;
      let totalWords = 0;
      
      paragraphs.each((_, p) => {
        const text = $(p).text().trim();
        const words = this.extractWords(text);
        totalWords += words.length;
        
        // Well-structured paragraphs: 50-150 words
        if (words.length >= 50 && words.length <= 150) {
          wellStructuredCount++;
        }
      });
      
      const wellStructuredRatio = wellStructuredCount / totalParagraphs;
      const averageWordsPerParagraph = totalWords / totalParagraphs;
      
      // Score based on well-structured paragraph ratio
      let score = 0;
      if (wellStructuredRatio >= 0.8) score = 20;      // 80%+ well-structured
      else if (wellStructuredRatio >= 0.6) score = 16; // 60-79% well-structured
      else if (wellStructuredRatio >= 0.4) score = 12; // 40-59% well-structured
      else if (wellStructuredRatio >= 0.2) score = 8;  // 20-39% well-structured
      else score = 4;                                  // <20% well-structured
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (wellStructuredRatio < 0.6) {
        problems.push(`${Math.round((1 - wellStructuredRatio) * 100)}% of paragraphs are outside optimal length range`);
        solutions.push('Aim for 50-150 words per paragraph for better readability');
        solutions.push('Break long paragraphs into smaller, focused sections');
        solutions.push('Combine very short paragraphs when they cover related topics');
      }
      
      if (averageWordsPerParagraph > 200) {
        problems.push('Paragraphs are too long for easy scanning');
        solutions.push('Break up lengthy paragraphs into shorter, digestible chunks');
      }
      
      if (averageWordsPerParagraph < 30) {
        problems.push('Paragraphs may be too fragmented');
        solutions.push('Combine related short paragraphs for better flow');
      }
      
      return {
        id: 'paragraph-structure',
        name: 'Paragraph Structure',
        score,
        maxScore: CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE,
        status: this.calculateStatus(score, CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE),
        explanation: 'Evaluates paragraph length and structure for optimal readability. Well-structured paragraphs (50-150 words) improve content scannability and reader engagement while maintaining proper information density.',
        problems,
        solutions,
        successMessage: 'Great! Your paragraphs are well-structured for easy scanning.',
        rawData: {
          totalParagraphs,
          wellStructuredCount,
          wellStructuredRatio,
          averageWordsPerParagraph: Math.round(averageWordsPerParagraph)
        }
      };
      
    } catch (error) {
      return this.createErrorCard('paragraph-structure', 'Paragraph Structure', CONTENT_ORGANIZATION_WEIGHTS.PARAGRAPH_STRUCTURE, 'Error analyzing paragraph structure');
    }
  }

  /**
   * Analyzes content density (15 pts)
   * High text-to-markup ratio indicates substantial content
   */
  private analyzeContentDensity($: cheerio.CheerioAPI): MetricCard {
    try {
      const fullHTML = $.html();
      const textContent = $('body').text().trim();
      
      const htmlLength = fullHTML.length;
      const textLength = textContent.length;
      
      if (htmlLength === 0) {
        return this.createErrorCard('content-density', 'Content Density', CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY, 'No HTML content found');
      }
      
      const textToHTMLRatio = textLength / htmlLength;
      
      // Score based on content density ratio
      let score = 0;
      if (textToHTMLRatio >= 0.3) score = 15;      // High density (30%+)
      else if (textToHTMLRatio >= 0.2) score = 12; // Good density (20-29%)
      else if (textToHTMLRatio >= 0.15) score = 9; // Fair density (15-19%)
      else if (textToHTMLRatio >= 0.1) score = 6;  // Low density (10-14%)
      else score = 3;                              // Very low density (<10%)
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (textToHTMLRatio < 0.2) {
        problems.push('Low content-to-markup ratio may indicate insufficient substance');
        solutions.push('Add more meaningful text content');
        solutions.push('Remove unnecessary HTML markup and decorative elements');
        solutions.push('Focus on substantive content over visual styling');
      }
      
      if (textLength < 300) {
        problems.push('Content appears to be very short for comprehensive analysis');
        solutions.push('Expand content with detailed explanations and examples');
        solutions.push('Add value-added information for readers');
      }
      
      return {
        id: 'content-density',
        name: 'Content Density',
        score,
        maxScore: CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY,
        status: this.calculateStatus(score, CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY),
        explanation: 'Measures the ratio of readable text content to HTML markup. Higher ratios indicate substantial, content-rich pages that provide real value to readers and search engines.',
        problems,
        solutions,
        successMessage: 'Perfect! Your content has high substance-to-markup ratio.',
        rawData: {
          textToHTMLRatio: Math.round(textToHTMLRatio * 100) / 100,
          readableText: textLength,
          totalMarkup: htmlLength
        }
      };
      
    } catch (error) {
      return this.createErrorCard('content-density', 'Content Density', CONTENT_ORGANIZATION_WEIGHTS.CONTENT_DENSITY, 'Error analyzing content density');
    }
  }

  // ===== SENTENCE QUALITY ANALYSIS (25pts) =====

  /**
   * Analyzes average sentence length (15 pts)
   * Optimal range: 15-25 words for clarity and comprehension
   */
  private analyzeAverageLength(text: string): MetricCard {
    try {
      const words = this.extractWords(text);
      const sentences = this.extractSentences(text);
      
      if (words.length === 0 || sentences.length === 0) {
        return this.createErrorCard('average-length', 'Average Length', SENTENCE_QUALITY_WEIGHTS.AVERAGE_LENGTH, 'Insufficient text for sentence analysis');
      }
      
      const averageLength = words.length / sentences.length;
      
      // Score based on optimal sentence length (15-25 words)
      let score = 0;
      if (averageLength >= 15 && averageLength <= 25) score = 15;      // Optimal range
      else if (averageLength >= 12 && averageLength <= 30) score = 12; // Good range
      else if (averageLength >= 8 && averageLength <= 35) score = 9;   // Fair range
      else if (averageLength >= 5) score = 6;                          // Poor range
      else score = 3;                                                  // Very poor
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (averageLength > 25) {
        problems.push('Sentences are too long, which may reduce comprehension');
        solutions.push('Break long sentences into shorter, clearer statements');
        solutions.push('Use conjunctions sparingly and prefer simple sentence structures');
        solutions.push('Aim for 15-25 words per sentence for optimal readability');
      }
      
      if (averageLength < 15) {
        problems.push('Sentences may be too short, creating choppy reading flow');
        solutions.push('Combine related short sentences for better flow');
        solutions.push('Add descriptive details to provide more context');
        solutions.push('Vary sentence length while staying within optimal range');
      }
      
      return {
        id: 'average-length',
        name: 'Average Length',
        score,
        maxScore: SENTENCE_QUALITY_WEIGHTS.AVERAGE_LENGTH,
        status: this.calculateStatus(score, SENTENCE_QUALITY_WEIGHTS.AVERAGE_LENGTH),
        explanation: 'Evaluates the average length of sentences for optimal comprehension. Sentences in the 15-25 word range provide the best balance of information density and readability for both human readers and AI systems.',
        problems,
        solutions,
        successMessage: 'Excellent! Your sentence length is optimal for comprehension.',
        rawData: {
          averageLength: Math.round(averageLength * 10) / 10,
          totalWords: words.length,
          totalSentences: sentences.length
        }
      };
      
    } catch (error) {
      return this.createErrorCard('average-length', 'Average Length', SENTENCE_QUALITY_WEIGHTS.AVERAGE_LENGTH, 'Error analyzing sentence length');
    }
  }

  /**
   * Analyzes vocabulary diversity (10 pts)
   * Type/token ratio for rich but accessible language
   */
  private analyzeVocabularyDiversity(text: string): MetricCard {
    try {
      const words = this.extractWords(text);
      
      if (words.length === 0) {
        return this.createErrorCard('vocabulary-diversity', 'Vocabulary Diversity', SENTENCE_QUALITY_WEIGHTS.VOCABULARY_DIVERSITY, 'No words found for analysis');
      }
      
      const uniqueWords = new Set(words.map(word => word.toLowerCase())).size;
      const vocabularyDiversity = uniqueWords / words.length;
      
      // Score based on vocabulary diversity ratio
      let score = 0;
      if (vocabularyDiversity >= 0.6) score = 10;      // Very diverse (60%+)
      else if (vocabularyDiversity >= 0.5) score = 8;  // Diverse (50-59%)
      else if (vocabularyDiversity >= 0.4) score = 6;  // Moderate (40-49%)
      else if (vocabularyDiversity >= 0.3) score = 4;  // Limited (30-39%)
      else score = 2;                                  // Poor diversity (<30%)
      
      const problems: string[] = [];
      const solutions: string[] = [];
      
      if (vocabularyDiversity < 0.4) {
        problems.push('Limited vocabulary diversity may reduce reader engagement');
        solutions.push('Use varied vocabulary while maintaining accessibility');
        solutions.push('Replace repeated words with synonyms where appropriate');
        solutions.push('Expand descriptions with more specific terminology');
      }
      
      if (words.length < 100) {
        problems.push('Content length may be too short for meaningful diversity analysis');
        solutions.push('Expand content to provide more comprehensive coverage');
      }
      
      return {
        id: 'vocabulary-diversity',
        name: 'Vocabulary Diversity',
        score,
        maxScore: SENTENCE_QUALITY_WEIGHTS.VOCABULARY_DIVERSITY,
        status: this.calculateStatus(score, SENTENCE_QUALITY_WEIGHTS.VOCABULARY_DIVERSITY),
        explanation: 'Measures the diversity of vocabulary used in the content. Rich vocabulary diversity engages readers and demonstrates expertise while maintaining accessibility and avoiding unnecessary complexity.',
        problems,
        solutions,
        successMessage: 'Great! Your vocabulary diversity engages readers while staying accessible.',
        rawData: {
          vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
          uniqueWords,
          totalWords: words.length
        }
      };
      
    } catch (error) {
      return this.createErrorCard('vocabulary-diversity', 'Vocabulary Diversity', SENTENCE_QUALITY_WEIGHTS.VOCABULARY_DIVERSITY, 'Error analyzing vocabulary diversity');
    }
  }

  // ===== DRAWER CREATION METHODS =====

  private createTextComplexityDrawer(cards: MetricCard[]): DrawerSubSection {
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = Object.values(TEXT_COMPLEXITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    
    return {
      id: 'text-complexity',
      name: 'Text Complexity',
      description: 'Flesch readability score optimized for human and AI comprehension',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards,
      isExpanded: false
    };
  }

  private createContentOrganizationDrawer(cards: MetricCard[]): DrawerSubSection {
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = Object.values(CONTENT_ORGANIZATION_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    
    return {
      id: 'content-organization',
      name: 'Content Organization',
      description: 'Paragraph structure and content density for optimal readability',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards,
      isExpanded: false
    };
  }

  private createSentenceQualityDrawer(cards: MetricCard[]): DrawerSubSection {
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = Object.values(SENTENCE_QUALITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    
    return {
      id: 'sentence-quality',
      name: 'Sentence Quality',
      description: 'Sentence length and vocabulary diversity for clear communication',
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      cards,
      isExpanded: false
    };
  }

  private createMainSection(drawers: DrawerSubSection[]): MainSection {
    const totalScore = drawers.reduce((sum, drawer) => sum + drawer.totalScore, 0);
    const maxScore: number = 100; // Total readability score
    
    return {
      id: 'readability',
      name: 'Readability',
      emoji: '📖',
      description: 'Is your content readable and well-structured for AI comprehension?',
      weightPercentage: 15,
      totalScore,
      maxScore,
      status: this.calculateStatus(totalScore, maxScore),
      drawers
    };
  }

  // ===== UTILITY METHODS =====

  private extractTextContent($: cheerio.CheerioAPI): string {
    // Remove script and style elements
    $('script, style, noscript').remove();
    
    // Extract text from main content areas
    const mainContent = $('main, article, .content, #content, .post, #post').first();
    if (mainContent.length > 0) {
      return mainContent.text().trim();
    }
    
    // Fallback to body text
    return $('body').text().trim();
  }

  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private extractSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  private countSyllables(words: string[]): number {
    return words.reduce((total, word) => {
      return total + this.syllablesInWord(word);
    }, 0);
  }

  private syllablesInWord(word: string): number {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllables = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < cleanWord.length; i++) {
      const isVowel = vowels.includes(cleanWord[i]);
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (cleanWord.endsWith('e')) {
      syllables--;
    }
    
    return Math.max(1, syllables);
  }

  private getFleschLevel(score: number): string {
    for (const [threshold, level] of Object.entries(FLESCH_LEVELS)) {
      if (score >= parseInt(threshold)) {
        return level;
      }
    }
    return 'Very Difficult';
  }

  private calculateStatus(score: number, maxScore: number): PerformanceStatus {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
    if (percentage >= PERFORMANCE_THRESHOLDS.good) return 'good';
    if (percentage >= PERFORMANCE_THRESHOLDS.warning) return 'warning';
    return 'error';
  }

  private createErrorCard(id: string, name: string, maxScore: number, errorMessage: string): MetricCard {
    return {
      id,
      name,
      score: 0,
      maxScore,
      status: 'error' as PerformanceStatus,
      explanation: 'An error occurred during analysis.',
      problems: [errorMessage],
      solutions: ['Please try again or check your content'],
      successMessage: 'Analysis completed successfully.',
      rawData: { error: errorMessage }
    };
  }

  private createErrorResult(errorMessage: string): ReadabilityAnalysisResult {
    const errorCard = this.createErrorCard('error', 'Analysis Error', 100, errorMessage);
    const errorDrawer: DrawerSubSection = {
      id: 'error',
      name: 'Error',
      description: 'Analysis could not be completed',
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      cards: [errorCard],
      isExpanded: false
    };
    
    const errorSection: MainSection = {
      id: 'readability',
      name: 'Readability',
      emoji: '📖',
      description: 'Is your content readable and well-structured for AI comprehension?',
      weightPercentage: 15,
      totalScore: 0,
      maxScore: 100,
      status: 'error',
      drawers: [errorDrawer]
    };
    
    return {
      category: 'readability',
      score: 0,
      maxScore: 100,
      weightPercentage: 15,
      section: errorSection,
      rawData: {
        textComplexity: {
          fleschScore: 0,
          fleschLevel: 'Unknown',
          totalWords: 0,
          totalSentences: 0
        },
        contentOrganization: {
          paragraphStructure: {
            totalParagraphs: 0,
            averageWordsPerParagraph: 0,
            wellStructuredRatio: 0
          },
          contentDensity: {
            textToHTMLRatio: 0,
            readableText: 0,
            totalMarkup: 0
          }
        },
        sentenceQuality: {
          averageSentenceLength: 0,
          vocabularyDiversity: 0,
          uniqueWords: 0,
          totalWords: 0
        }
      }
    };
  }
}

// ===== STANDALONE FUNCTION =====

/**
 * Standalone readability analysis function for API integration
 * Follows the same pattern as other analysis functions
 */
export async function analyzeReadability(
  html: string,
  url?: string
): Promise<ReadabilityAnalysisResult> {
  const analyzer = new ReadabilityAnalyzer();
  return analyzer.analyze(html, url);
}

// ===== EXPORTS =====

export { TEXT_COMPLEXITY_WEIGHTS, CONTENT_ORGANIZATION_WEIGHTS, SENTENCE_QUALITY_WEIGHTS }; 