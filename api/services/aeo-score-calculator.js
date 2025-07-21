const logger = require('../utils/logger');

/**
 * AEO Score Calculator Service
 * Calculates weighted AEO score from 5 analysis categories
 */
class AEOScoreCalculator {
  constructor() {
    // Weights for each analysis category (total: 100%)
    this.weights = {
      discoverability: 28,    // 28% - SEO fundamentals
      structuredData: 22,     // 22% - Schema markup
      llmFormatting: 22,      // 22% - LLM-friendly structure
      accessibility: 17,      // 17% - Core Web Vitals
      readability: 11         // 11% - Content optimization
    };

    // Validate weights sum to 100
    const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      throw new Error(`AEO weights must sum to 100, got ${totalWeight}`);
    }
  }

  /**
   * Calculate weighted AEO score from analysis results
   * @param {Object} analysisResults - Results from all analyzers
   * @returns {Object} AEO score with breakdown
   */
  calculateAEOScore(analysisResults) {
    try {
      logger.info('Starting AEO score calculation');

      const breakdown = {};
      let totalScore = 0;
      let completedAnalyses = 0;
      let totalWeight = 0;

      // Process each analysis category
      for (const [category, weight] of Object.entries(this.weights)) {
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
          
          logger.info(`${category}: score=${score}, weight=${weight}%, contribution=${breakdown[category].contribution}`);
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

      const result = {
        totalScore: finalScore,
        maxScore: 100,
        breakdown: breakdown,
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
      logger.error('Error calculating AEO score:', error);
      return this.createEmptyResult('Score calculation failed due to technical error');
    }
  }

  /**
   * Get score status for consistency with other analyzers
   * @param {number} score - Score 0-100
   * @returns {string} Status description
   */
  getScoreStatus(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'pass';
    if (score >= 60) return 'needs-improvement';
    return 'fail';
  }

  /**
   * Get score level description
   * @param {number} score - Score 0-100
   * @returns {string} Level description
   */
  getScoreLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Pass';
    if (score >= 60) return 'Needs Improvement';
    return 'Fail';
  }

  /**
   * Create empty result for error cases
   * @param {string} errorMessage - Error description
   * @returns {Object} Empty result structure
   */
  createEmptyResult(errorMessage) {
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
   * @returns {Object} Current weights
   */
  getWeights() {
    return { ...this.weights };
  }

  /**
   * Update weights (for future flexibility)
   * @param {Object} newWeights - New weight configuration
   */
  updateWeights(newWeights) {
    const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      throw new Error(`Weights must sum to 100, got ${totalWeight}`);
    }
    
    this.weights = { ...newWeights };
    logger.info('AEO weights updated:', this.weights);
  }
}

module.exports = AEOScoreCalculator; 