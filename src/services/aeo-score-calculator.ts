import { MainSection, GlobalPenalty } from '@/types/analysis-architecture';
import { SECTION_WEIGHTS } from '@/types/analysis-architecture';
import logger from '@/utils/logger';

/**
 * AEO Score Calculator Service - MODERN VERSION
 * Calculates weighted AEO score from 5 modernized analysis categories with global penalty system
 */

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
  globalPenaltiesCount: number;
  baseScore: number;
  finalScore: number;
}

interface AEOScoreResult {
  totalScore: number;
  maxScore: number;
  breakdown: ScoreBreakdown;
  completeness: string;
  metadata: ScoreMetadata;
  globalPenalties: GlobalPenalty[];
  error?: string;
}

// Support both legacy and modern format
interface AnalysisResult {
  score?: number;
  totalScore?: number; // New hierarchical structure
  status?: string;
}

interface AnalysisResults {
  discoverability?: AnalysisResult | MainSection;
  structuredData?: AnalysisResult | MainSection;
  llmFormatting?: AnalysisResult | MainSection;
  accessibility?: AnalysisResult | MainSection;
  readability?: AnalysisResult | MainSection;
}

type ScoreStatus = 'excellent' | 'good' | 'pass' | 'needs-improvement' | 'fail';
type ScoreLevel = 'Excellent' | 'Good' | 'Pass' | 'Needs Improvement' | 'Fail';

export class AEOScoreCalculator {
  private weights: WeightConfig;

  constructor() {
    // Utiliser la constante centralisée - plus de duplication !
    this.weights = SECTION_WEIGHTS;
    
    // La validation est déjà faite dans analysis-architecture.ts
    logger.info(`🎯 AEO Score Calculator initialized with weights: ${JSON.stringify(this.weights)}`);
  }

  /**
   * Calculate weighted AEO score from analysis results with global penalty system
   * @param analysisResults - Results from all analyzers (MainSection format)
   * @returns AEO score with breakdown and global penalties
   */
  calculateAEOScore(analysisResults: AnalysisResults): AEOScoreResult {
    try {
      logger.info('🎯 Starting AEO score calculation with modern architecture');

      const breakdown: Partial<ScoreBreakdown> = {};
      let totalScore = 0;
      let completedAnalyses = 0;
      let totalWeight = 0;

      // Process each analysis category with MainSection compatibility
      for (const [category, weight] of Object.entries(this.weights) as [keyof WeightConfig, number][]) {
        const analysis = analysisResults[category];
        
        // Extract score with MainSection compatibility (score preferred over totalScore)
        const analysisScore = this.extractSectionScore(analysis);
        const analysisMaxScore = this.extractSectionMaxScore(analysis);
        
        if (analysis && typeof analysisScore === 'number') {
          // Support new hierarchical status values
          const isValidStatus = this.isValidAnalysisStatus(analysis);
          
          if (isValidStatus) {
            // Normalize score to 100 if using different maxScore
            const normalizedScore = analysisMaxScore !== 100 ? 
              Math.round((analysisScore / analysisMaxScore) * 100) : 
              Math.round(analysisScore);
            
            const contribution = (normalizedScore * weight) / 100;
            
            breakdown[category] = {
              score: normalizedScore,
              weight: weight,
              contribution: Math.round(contribution * 10) / 10 // Round to 1 decimal
            };

            totalScore += contribution;
            totalWeight += weight;
            completedAnalyses++;
            
            logger.info(`✅ ${category}: ${normalizedScore}/${analysisMaxScore} (${normalizedScore}%), weight=${weight}%, contribution=${breakdown[category]!.contribution}`);
          } else {
            this.handleFailedAnalysis(breakdown, category, weight, analysis);
          }
        } else {
          this.handleMissingAnalysis(breakdown, category, weight, analysis);
        }
      }

      // Calculate base score (before global penalties)
      const baseScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;

      // Detect and apply global penalties
      const globalPenalties = this.detectGlobalPenalties(analysisResults);
      const finalScore = this.applyGlobalPenalties(baseScore, globalPenalties);
      
      // Determine completeness
      const completeness = `${completedAnalyses}/${Object.keys(this.weights).length} analyses completed`;

      const result: AEOScoreResult = {
        totalScore: finalScore,
        maxScore: 100,
        breakdown: breakdown as ScoreBreakdown,
        completeness: completeness,
        globalPenalties: globalPenalties,
        metadata: {
          totalWeight: totalWeight,
          completedAnalyses: completedAnalyses,
          totalAnalyses: Object.keys(this.weights).length,
          globalPenaltiesCount: globalPenalties.length,
          baseScore: baseScore,
          finalScore: finalScore
        }
      };

              logger.info(`🎯 Final AEO Score Calculation Complete: base=${baseScore}, penalties=${globalPenalties.length}, final=${finalScore}, ${completeness} | Breakdown: discoverability=${breakdown.discoverability?.score || 0}, structured=${breakdown.structuredData?.score || 0}, llm=${breakdown.llmFormatting?.score || 0}, accessibility=${breakdown.accessibility?.score || 0}, readability=${breakdown.readability?.score || 0}`);

      return result;

    } catch (error) {
      logger.error(`💥 Error calculating AEO score: ${(error as Error).message}`);
      return this.createEmptyResult('Score calculation failed due to technical error');
    }
  }

  /**
   * Extract score from both legacy and MainSection formats
   * @param analysis - Analysis result (legacy or MainSection)
   * @returns Extracted score
   */
  private extractSectionScore(analysis: any): number | undefined {
    if (!analysis) return undefined;
    
    // MainSection format (preferred)
    if ('score' in analysis && typeof analysis.score === 'number') {
      return analysis.score;
    }
    
    // Legacy format (backward compatibility)
    if ('totalScore' in analysis && typeof analysis.totalScore === 'number') {
      return analysis.totalScore;
    }
    
    return undefined;
  }

  /**
   * Extract maxScore from both legacy and MainSection formats
   * @param analysis - Analysis result (legacy or MainSection)
   * @returns Extracted maxScore (defaults to 100)
   */
  private extractSectionMaxScore(analysis: any): number {
    if (!analysis) return 100;
    
    // MainSection format
    if ('maxScore' in analysis && typeof analysis.maxScore === 'number') {
      return analysis.maxScore;
    }
    
    // Default to 100 for legacy format
    return 100;
  }

  /**
   * Check if analysis status is valid for scoring
   * @param analysis - Analysis result
   * @returns True if status indicates completed analysis
   */
  private isValidAnalysisStatus(analysis: any): boolean {
    if (!analysis?.status) return true; // Assume valid if no status
    
    // Modern MainSection statuses
    const validStatuses = ['excellent', 'good', 'warning', 'error', 'complete'];
    return validStatuses.includes(analysis.status);
  }

  /**
   * Handle failed analysis in breakdown
   * @param breakdown - Current breakdown object
   * @param category - Analysis category
   * @param weight - Category weight
   * @param analysis - Analysis result
   */
  private handleFailedAnalysis(breakdown: Partial<ScoreBreakdown>, category: keyof WeightConfig, weight: number, analysis: any): void {
    breakdown[category] = {
      score: 0,
      weight: weight,
      contribution: 0,
      status: analysis?.status || 'failed'
    };
    
    logger.warn(`⚠️ ${category}: analysis failed (status: ${analysis?.status || 'failed'})`);
  }

  /**
   * Handle missing analysis in breakdown
   * @param breakdown - Current breakdown object
   * @param category - Analysis category
   * @param weight - Category weight
   * @param analysis - Analysis result
   */
  private handleMissingAnalysis(breakdown: Partial<ScoreBreakdown>, category: keyof WeightConfig, weight: number, analysis: any): void {
    breakdown[category] = {
      score: 0,
      weight: weight,
      contribution: 0,
      status: analysis?.status || 'not-available'
    };
    
    logger.warn(`❌ ${category}: analysis not available (status: ${analysis?.status || 'missing'})`);
  }

  /**
   * Detect global penalties from analysis results
   * @param analysisResults - Analysis results to check for penalties
   * @returns Array of global penalties
   */
  private detectGlobalPenalties(analysisResults: AnalysisResults): GlobalPenalty[] {
    const penalties: GlobalPenalty[] = [];

    // Check for global penalties in discoverability (robots.txt AI blocking)
    if (analysisResults.discoverability && 'drawers' in analysisResults.discoverability) {
      const discoverabilitySection = analysisResults.discoverability as MainSection;
      // Look for penalties in the section's drawers
      discoverabilitySection.drawers.forEach(drawer => {
        // Check if any drawer contains penalty information
        if (drawer.cards.some(card => card.recommendations && card.recommendations.length > 0)) {
          // Create penalty from recommendations if needed
          // For now, we'll handle this differently
        }
      });
    }

    // Check for global penalties in other sections (future extensibility)
    for (const [sectionName, section] of Object.entries(analysisResults)) {
      if (section && 'drawers' in section && sectionName !== 'discoverability') {
        const sectionMain = section as MainSection;
        // Process section for penalties if needed
      }
    }

    if (penalties.length > 0) {
      logger.warn(`🚨 Global penalties detected: ${penalties.length} penalties`);
    }

    return penalties;
  }

  /**
   * Apply global penalties to base score
   * @param baseScore - Base score before penalties
   * @param penalties - Array of global penalties
   * @returns Final score after applying penalties
   */
  private applyGlobalPenalties(baseScore: number, penalties: GlobalPenalty[]): number {
    if (penalties.length === 0) return baseScore;

    let totalReduction = 0;

    // Calculate cumulative penalty reduction
    for (const penalty of penalties) {
      // Use penaltyFactor instead of reduction
      totalReduction += penalty.penaltyFactor * 100; // Convert factor to percentage
      logger.warn(`🚨 Applying global penalty: ${penalty.type} (-${Math.round(penalty.penaltyFactor * 100)}%)`);
    }

    // Cap total reduction at 70% (leave minimum 30% of base score)
    const cappedReduction = Math.min(totalReduction, 70);
    const finalScore = Math.round(baseScore * (1 - cappedReduction / 100));

    logger.info(`🎯 Global penalties applied: base=${baseScore}, reduction=${cappedReduction}%, final=${finalScore}`);

    return Math.max(finalScore, 0); // Ensure score doesn't go below 0
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
        discoverability: { score: 0, weight: 20, contribution: 0, status: 'error' },
        structuredData: { score: 0, weight: 25, contribution: 0, status: 'error' },
        llmFormatting: { score: 0, weight: 25, contribution: 0, status: 'error' },
        accessibility: { score: 0, weight: 15, contribution: 0, status: 'error' },
        readability: { score: 0, weight: 15, contribution: 0, status: 'error' }
      },
      completeness: '0/5 analyses completed',
      globalPenalties: [],
      metadata: {
        totalWeight: 0,
        completedAnalyses: 0,
        totalAnalyses: 5,
        globalPenaltiesCount: 0,
        baseScore: 0,
        finalScore: 0
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
    logger.info(`🎯 AEO weights updated: ${JSON.stringify(this.weights)}`);
  }

  /**
   * Test calculator with perfect scores (should equal 100)
   * @returns Test result
   */
  testPerfectScores(): AEOScoreResult {
    const perfectResults: AnalysisResults = {
      discoverability: { score: 100, maxScore: 100, status: 'excellent' },
      structuredData: { score: 100, maxScore: 100, status: 'excellent' },
      llmFormatting: { score: 100, maxScore: 100, status: 'excellent' },
      accessibility: { score: 100, maxScore: 100, status: 'excellent' },
      readability: { score: 100, maxScore: 100, status: 'excellent' }
    };

    const result = this.calculateAEOScore(perfectResults);
    logger.info(`🧪 Perfect scores test: ${result.totalScore}/100 (expected: 100)`);
    return result;
  }

  /**
   * Test calculator with zero scores (should equal 0)
   * @returns Test result
   */
  testZeroScores(): AEOScoreResult {
    const zeroResults: AnalysisResults = {
      discoverability: { score: 0, maxScore: 100, status: 'error' },
      structuredData: { score: 0, maxScore: 100, status: 'error' },
      llmFormatting: { score: 0, maxScore: 100, status: 'error' },
      accessibility: { score: 0, maxScore: 100, status: 'error' },
      readability: { score: 0, maxScore: 100, status: 'error' }
    };

    const result = this.calculateAEOScore(zeroResults);
    logger.info(`🧪 Zero scores test: ${result.totalScore}/100 (expected: 0)`);
    return result;
  }

  /**
   * Test calculator with mixed scores and global penalties
   * @returns Test result
   */
  testMixedScoresWithPenalties(): AEOScoreResult {
    const mixedResults: AnalysisResults = {
      discoverability: { 
        score: 80, 
        maxScore: 100, 
        status: 'good'
      },
      structuredData: { score: 75, maxScore: 100, status: 'good' },
      llmFormatting: { score: 90, maxScore: 100, status: 'excellent' },
      accessibility: { score: 65, maxScore: 100, status: 'warning' },
      readability: { score: 70, maxScore: 100, status: 'good' }
    };

    const result = this.calculateAEOScore(mixedResults);
    logger.info(`🧪 Mixed scores with penalties test: ${result.totalScore}/100 (base: ${result.metadata.baseScore}, penalties: ${result.globalPenalties.length})`);
    return result;
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