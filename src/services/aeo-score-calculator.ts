import logger from '@/utils/logger';

/**
 * AEO Score Calculator Service
 * Calculates weighted AEO score from 5 analysis categories
 */

// Types and interfaces
interface WeightConfig {
  readonly discoverability: number;
  readonly structuredData: number;
  readonly llmFormatting: number;
  readonly accessibility: number;
  readonly readability: number;
}

interface CategoryBreakdown {
  score: number;
  weight: number;
  contribution: number;
  status?: string;
}

interface ScoreBreakdown {
  discoverability: CategoryBreakdown;
  structuredData: CategoryBreakdown;
  llmFormatting: CategoryBreakdown;
  accessibility: CategoryBreakdown;
  readability: CategoryBreakdown;
}

interface ScoreMetadata {
  totalWeight: number;
  completedAnalyses: number;
  totalAnalyses: number;
}

interface AEOScoreResult {
  totalScore: number;
  maxScore: number;
  breakdown: ScoreBreakdown;
  completeness: string;
  metadata: ScoreMetadata;
  error?: string;
}

interface AnalysisResult {
  score?: number;
  status?: string;
}

interface AnalysisResults {
  discoverability?: AnalysisResult;
  structuredData?: AnalysisResult;
  llmFormatting?: AnalysisResult;
  accessibility?: AnalysisResult;
  readability?: AnalysisResult;
}

type ScoreStatus = 'excellent' | 'good' | 'pass' | 'needs-improvement' | 'fail';
type ScoreLevel = 'Excellent' | 'Good' | 'Pass' | 'Needs Improvement' | 'Fail';

export class AEOScoreCalculator {
  private weights: WeightConfig;

  constructor() {
    // Weights for each analysis category (total: 100%)
    this.weights = {
      discoverability: 28,    // 28% - SEO fundamentals
      structuredData: 22,     // 22% - Schema markup
      llmFormatting: 22,      // 22% - LLM-friendly structure
      accessibility: 17,      // 17% - Core Web Vitals
      readability: 11         // 11% - Content optimization
    } as const;

    // Validate weights sum to 100
    const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      throw new Error(`AEO weights must sum to 100, got ${totalWeight}`);
    }
  }

  /**
   * Calculate weighted AEO score from analysis results
   * @param analysisResults - Results from all analyzers
   * @returns AEO score with breakdown
   */
  calculateAEOScore(analysisResults: AnalysisResults): AEOScoreResult {
    try {
      logger.info('Starting AEO score calculation');

      const breakdown: Partial<ScoreBreakdown> = {};
      let totalScore = 0;
      let completedAnalyses = 0;
      let totalWeight = 0;

      // Process each analysis category
      for (const [category, weight] of Object.entries(this.weights) as [keyof WeightConfig, number][]) {
        const analysis = analysisResults[category];
        
        if (analysis && typeof analysis.score === 'number' && (analysis.status === 'complete' || analysis.status === undefined)) {
          const score = Math.round(analysis.score);
          const contribution = (score * weight) / 100;
          
          breakdown[category] = {
            score: score,
            weight: weight,
            contribution: Math.round(contribution * 10) / 10 // Round to 1 decimal
          };

          totalScore += contribution;
          totalWeight += weight;
          completedAnalyses++;
          
          logger.info(`${category}: score=${score}, weight=${weight}%, contribution=${breakdown[category]!.contribution}`);
        } else {
          // Analysis not available or failed
          breakdown[category] = {
            score: 0,
            weight: weight,
            contribution: 0,
            status: analysis?.status || 'not-available'
          };
          
          logger.warn(`${category}: analysis not available (status: ${analysis?.status || 'missing'})`);
        }
      }

      // Calculate final score (normalize if some analyses are missing)
      const finalScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
      
      // Determine completeness
      const completeness = `${completedAnalyses}/${Object.keys(this.weights).length} analyses completed`;

      const result: AEOScoreResult = {
        totalScore: finalScore,
        maxScore: 100,
        breakdown: breakdown as ScoreBreakdown,
        completeness: completeness,
        metadata: {
          totalWeight: totalWeight,
          completedAnalyses: completedAnalyses,
          totalAnalyses: Object.keys(this.weights).length
        }
      };

      logger.info(`AEO score calculation complete: ${finalScore}/100 (${completeness})`);
      return result;

    } catch (error) {
      logger.error(`Error calculating AEO score: ${(error as Error).message}`);
      return this.createEmptyResult('Score calculation failed due to technical error');
    }
  }

  /**
   * Get score status for consistency with other analyzers
   * @param score - Score 0-100
   * @returns Status description
   */
  getScoreStatus(score: number): ScoreStatus {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'pass';
    if (score >= 60) return 'needs-improvement';
    return 'fail';
  }

  /**
   * Get score level description
   * @param score - Score 0-100
   * @returns Level description
   */
  getScoreLevel(score: number): ScoreLevel {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Pass';
    if (score >= 60) return 'Needs Improvement';
    return 'Fail';
  }

  /**
   * Create empty result for error cases
   * @param errorMessage - Error description
   * @returns Empty result structure
   */
  private createEmptyResult(errorMessage: string): AEOScoreResult {
    return {
      totalScore: 0,
      maxScore: 100,
      breakdown: {
        discoverability: { score: 0, weight: 28, contribution: 0, status: 'error' },
        structuredData: { score: 0, weight: 22, contribution: 0, status: 'error' },
        llmFormatting: { score: 0, weight: 22, contribution: 0, status: 'error' },
        accessibility: { score: 0, weight: 17, contribution: 0, status: 'error' },
        readability: { score: 0, weight: 11, contribution: 0, status: 'error' }
      },
      completeness: '0/5 analyses completed',
      metadata: {
        totalWeight: 0,
        completedAnalyses: 0,
        totalAnalyses: 5
      },
      error: errorMessage
    };
  }

  /**
   * Get weights configuration
   * @returns Current weights
   */
  getWeights(): WeightConfig {
    return { ...this.weights };
  }

  /**
   * Update weights (for future flexibility)
   * @param newWeights - New weight configuration
   */
  updateWeights(newWeights: WeightConfig): void {
    const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      throw new Error(`Weights must sum to 100, got ${totalWeight}`);
    }
    
    this.weights = { ...newWeights };
    logger.info(`AEO weights updated: ${JSON.stringify(this.weights)}`);
  }
}

// Export types for external use
export type { 
  AEOScoreResult, 
  ScoreBreakdown, 
  CategoryBreakdown, 
  WeightConfig, 
  AnalysisResults, 
  AnalysisResult,
  ScoreStatus,
  ScoreLevel,
  ScoreMetadata
};

// Export default instance for convenience
export default AEOScoreCalculator; 