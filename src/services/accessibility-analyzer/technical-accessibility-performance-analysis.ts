/**
 * TECHNICAL ACCESSIBILITY & PERFORMANCE ANALYSIS
 * 
 * Analyse de la santé technique et de la rapidité d'une page pour les LLMs
 * Poids total: 35 points (Performance Score: 25, Image Optimization: 10)
 */

import * as cheerio from 'cheerio';
import { MetricCard, Recommendation } from '../../types/analysis-architecture';
import { PageSpeedAnalyzer, FallbackStrategy } from '../performance-config';
import logger from '@/utils/logger';

// ===== CONSTANTES =====

const TECHNICAL_ACCESSIBILITY_WEIGHTS = {
  PERFORMANCE_SCORE: 25,
  IMAGE_OPTIMIZATION: 10
} as const;

const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  WARNING: 50
} as const;

const IMAGE_OPTIMIZATION_THRESHOLDS = {
  LAZY_LOADING_RATIO: 0.5,
  MODERN_FORMATS_RATIO: 0.3
} as const;

// ===== KNOWLEDGE BASE =====

const TECHNICAL_ACCESSIBILITY_KB = {
  // Performance Score & Core Web Vitals (25 points)
  lowPerformanceScore: (score: number) => ({
    problem: `The overall Performance Score is ${score}/100, which is below the recommended target of 75.`,
    solution: `Click the link below to open the Google PageSpeed Insights report for this specific URL.`,
    explanation: "A low performance score signals to AIs that the page is slow, which can negatively impact crawling efficiency and perceived quality. The detailed report will pinpoint the exact causes.",
    impact: 10
  }),
  
  slowLCP: (lcpScore: number) => ({
    problem: `The Largest Contentful Paint (LCP) is ${lcpScore}s, which is slower than the recommended 2.5s.`,
    solution: `Click the link below to open the Google PageSpeed Insights report to identify what is slowing down the main content rendering.`,
    explanation: "A slow LCP means the main content takes too long to appear. This is a major negative signal for AIs trying to quickly access and evaluate your page's information.",
    impact: 9
  }),
  
  slowINP: (inpScore: number) => ({
    problem: `The Interaction to Next Paint (INP) is ${inpScore}ms, indicating slower interactivity than the recommended 200ms.`,
    solution: `Click the link below to open the Google PageSpeed Insights report to find scripts or tasks that are delaying user interactions.`,
    explanation: "Poor interactivity is a sign of heavy or unoptimized JavaScript, which can hinder an AI's ability to analyze the page's final, rendered state.",
    impact: 6
  }),
  
  highCLS: (clsScore: number) => ({
    problem: `The Cumulative Layout Shift (CLS) is ${clsScore}, which is higher than the recommended 0.1, indicating visual instability.`,
    solution: `Click the link below to open the Google PageSpeed Insights report to find which elements are shifting during load.`,
    explanation: "A high CLS is a signal of a poorly constructed page. For an AI, this technical instability can reduce the trustworthiness of the page's structure.",
    impact: 7
  }),
  
  apiFailure: {
    problem: "The performance analysis could not be completed via the API.",
    solution: "Click this link to run the analysis manually on the Google PageSpeed Insights website.",
    explanation: "When performance data is unavailable, AIs cannot assess the technical quality of the page, which may impact its evaluation. Running a manual test is recommended.",
    impact: 5
  },
  
  // Image Optimization (10 points)
  missingModernFormats: (count: number, total: number) => ({
    problem: `${count} of your ${total} images are not using modern, efficient formats like WebP or AVIF.`,
    solution: `Convert PNG and JPEG images to modern formats like WebP or AVIF using an image editor or an online tool.`,
    explanation: "Using modern image formats drastically reduces file sizes, which directly improves loading speed (LCP) and makes your content more efficiently crawlable for AIs.",
    impact: 7
  }),
  
  missingLazyLoading: (count: number, total: number) => ({
    problem: `${count} of your ${total} images are missing the loading="lazy" attribute.`,
    solution: `Add the attribute loading="lazy" to <img> tags for images that are not immediately visible when the page loads.`,
    explanation: "Lazy loading prioritizes the loading of above-the-fold content, allowing AIs to access the most important information on your page much faster.",
    impact: 5
  })
} as const;

// ===== ANALYSEUR DE PERFORMANCE SCORE =====

/**
 * Analyse le score de performance global et les Core Web Vitals (25 points)
 */
export async function analyzePerformanceScore(url: string): Promise<MetricCard> {
  try {
    logger.info(`🚀 Starting Performance Score analysis for: ${url}`);
    
    const pageSpeedAnalyzer = PageSpeedAnalyzer.getInstance();
    const pageSpeedResult = await pageSpeedAnalyzer.analyzePageSpeed(url);
    
    if (pageSpeedResult.success && pageSpeedResult.score) {
      // Convertit le score PageSpeed (0-100) en notre système de points (0-25)
      const score = Math.round((pageSpeedResult.score / 100) * TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE);
      const recommendations: Recommendation[] = [];
      
      // Génère des recommandations basées sur les métriques réelles
      if (pageSpeedResult.score < PERFORMANCE_THRESHOLDS.GOOD) {
        const kb = TECHNICAL_ACCESSIBILITY_KB.lowPerformanceScore(pageSpeedResult.score);
        recommendations.push({
          problem: kb.problem,
          solution: kb.solution,
          explanation: kb.explanation,
          impact: kb.impact
        });
      }
      
      if (pageSpeedResult.metrics?.lcp && pageSpeedResult.metrics.lcp > 2.5) {
        const kb = TECHNICAL_ACCESSIBILITY_KB.slowLCP(pageSpeedResult.metrics.lcp);
        recommendations.push({
          problem: kb.problem,
          solution: kb.solution,
          explanation: kb.explanation,
          impact: kb.impact
        });
      }
      
      if (pageSpeedResult.metrics?.fid && pageSpeedResult.metrics.fid > 200) {
        const kb = TECHNICAL_ACCESSIBILITY_KB.slowINP(pageSpeedResult.metrics.fid);
        recommendations.push({
          problem: kb.problem,
          solution: kb.solution,
          explanation: kb.explanation,
          impact: kb.impact
        });
      }
      
      if (pageSpeedResult.metrics?.cls && pageSpeedResult.metrics.cls > 0.1) {
        const kb = TECHNICAL_ACCESSIBILITY_KB.highCLS(pageSpeedResult.metrics.cls);
        recommendations.push({
          problem: kb.problem,
          solution: kb.solution,
          explanation: kb.explanation,
          impact: kb.impact
        });
      }
      
      return {
        id: 'performance-score',
        name: 'Performance Score & Core Web Vitals',
        score,
        maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE,
        status: score >= 20 ? 'excellent' : score >= 15 ? 'warning' : 'error',
        explanation: 'Measures overall page performance and Core Web Vitals (LCP, INP, CLS). Fast loading pages provide better accessibility for all users and improved LLM processing.',
        recommendations,
        successMessage: `Excellent! Your Performance Score of ${pageSpeedResult.score}/100 ensures fast loading for all users and AI systems.`,
        rawData: {
          performanceScore: pageSpeedResult.score,
          coreWebVitals: pageSpeedResult.metrics,
          analysisTime: pageSpeedResult.totalTime,
          retryCount: pageSpeedResult.retryCount,
          api: 'Google PageSpeed Insights'
        }
      };
      
    } else {
      // Utilise la stratégie de fallback quand PageSpeed échoue
      logger.warn(`📉 Performance analysis failed, using fallback strategy: ${pageSpeedResult.error}`);
      const fallbackResult = FallbackStrategy.handlePageSpeedFailure(url);
      
      return {
        id: 'performance-score',
        name: 'Performance Score & Core Web Vitals',
        score: Math.round((fallbackResult.score / 100) * TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE),
        maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE,
        status: fallbackResult.status,
        explanation: 'Measures overall page performance and Core Web Vitals (LCP, INP, CLS). Fast loading pages provide better accessibility for all users and improved LLM processing.',
        recommendations: [{
          problem: TECHNICAL_ACCESSIBILITY_KB.apiFailure.problem,
          solution: TECHNICAL_ACCESSIBILITY_KB.apiFailure.solution,
          explanation: TECHNICAL_ACCESSIBILITY_KB.apiFailure.explanation,
          impact: TECHNICAL_ACCESSIBILITY_KB.apiFailure.impact
        }],
        successMessage: fallbackResult.successMessage,
        rawData: {
          ...fallbackResult.rawData,
          pageSpeedError: pageSpeedResult.error,
          timeoutOccurred: pageSpeedResult.timeoutOccurred,
          analysisTime: pageSpeedResult.totalTime
        }
      };
    }
    
  } catch (error) {
    logger.error(`💥 Performance Score analysis crashed: ${(error as Error).message}`);
    
    return {
      id: 'performance-score',
      name: 'Performance Score & Core Web Vitals',
      score: 0,
      maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE,
      status: 'error',
      explanation: 'Measures overall page performance and Core Web Vitals (LCP, INP, CLS). Fast loading pages provide better accessibility for all users and improved LLM processing.',
              recommendations: [{
          problem: TECHNICAL_ACCESSIBILITY_KB.apiFailure.problem,
          solution: TECHNICAL_ACCESSIBILITY_KB.apiFailure.solution,
          explanation: TECHNICAL_ACCESSIBILITY_KB.apiFailure.explanation,
          impact: TECHNICAL_ACCESSIBILITY_KB.apiFailure.impact
        }],
      successMessage: 'Performance analysis encountered an error.',
      rawData: {
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// ===== ANALYSEUR D'OPTIMISATION D'IMAGES =====

/**
 * Analyse l'optimisation des images (10 points)
 */
export function analyzeImageOptimization($: cheerio.CheerioAPI): MetricCard {
  try {
    logger.info(`🖼️ Starting Image Optimization analysis`);
    
    const images = $('img');
    const totalImages = images.length;
    
    if (totalImages === 0) {
      return {
        id: 'image-optimization',
        name: 'Image Optimization',
        score: TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION,
        maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION,
        status: 'excellent',
        explanation: 'Evaluates image optimization techniques like lazy loading and modern formats. Optimized images improve page performance and accessibility.',
        recommendations: [],
        successMessage: 'No images detected - no optimization needed.',
        rawData: {
          totalImages: 0,
          modernFormatsCount: 0,
          lazyLoadingCount: 0,
          modernFormatsRatio: 1,
          lazyLoadingRatio: 1
        }
      };
    }
    
    let modernFormatsCount = 0;
    let lazyLoadingCount = 0;
    
    images.each((_, element) => {
      const $img = $(element);
      const src = $img.attr('src') || '';
      const loading = $img.attr('loading');
      
      // Vérifie les formats modernes
      if (src.endsWith('.webp') || src.endsWith('.avif')) {
        modernFormatsCount++;
      }
      
      // Vérifie le lazy loading
      if (loading === 'lazy') {
        lazyLoadingCount++;
      }
    });
    
    const modernFormatsRatio = modernFormatsCount / totalImages;
    const lazyLoadingRatio = lazyLoadingCount / totalImages;
    
    // Calcule le score (5 points pour chaque métrique)
    const modernFormatsScore = Math.round(modernFormatsRatio * 5);
    const lazyLoadingScore = Math.round(lazyLoadingRatio * 5);
    const totalScore = modernFormatsScore + lazyLoadingScore;
    
    const recommendations: Recommendation[] = [];
    
    // Génère des recommandations si les ratios sont bas
    if (modernFormatsRatio < IMAGE_OPTIMIZATION_THRESHOLDS.MODERN_FORMATS_RATIO) {
      const nonModernCount = totalImages - modernFormatsCount;
      const kb = TECHNICAL_ACCESSIBILITY_KB.missingModernFormats(nonModernCount, totalImages);
      recommendations.push({
        problem: kb.problem,
        solution: kb.solution,
        explanation: kb.explanation,
        impact: kb.impact
      });
    }
    
    if (lazyLoadingRatio < IMAGE_OPTIMIZATION_THRESHOLDS.LAZY_LOADING_RATIO) {
      const nonLazyCount = totalImages - lazyLoadingCount;
      const kb = TECHNICAL_ACCESSIBILITY_KB.missingLazyLoading(nonLazyCount, totalImages);
      recommendations.push({
        problem: kb.problem,
        solution: kb.solution,
        explanation: kb.explanation,
        impact: kb.impact
      });
    }
    
    const status = totalScore >= 8 ? 'excellent' : totalScore >= 6 ? 'warning' : 'error';
    
    return {
      id: 'image-optimization',
      name: 'Image Optimization',
      score: totalScore,
      maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION,
      status,
      explanation: 'Evaluates image optimization techniques like lazy loading and modern formats. Optimized images improve page performance and accessibility.',
      recommendations,
      successMessage: `Great! Your images are optimized for fast loading and accessibility. ${modernFormatsCount}/${totalImages} use modern formats, ${lazyLoadingCount}/${totalImages} use lazy loading.`,
      rawData: {
        totalImages,
        modernFormatsCount,
        lazyLoadingCount,
        modernFormatsRatio,
        lazyLoadingRatio,
        modernFormatsScore,
        lazyLoadingScore
      }
    };
    
  } catch (error) {
    logger.error(`💥 Image Optimization analysis crashed: ${(error as Error).message}`);
    
    return {
      id: 'image-optimization',
      name: 'Image Optimization',
      score: 0,
      maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION,
      status: 'error',
      explanation: 'Evaluates image optimization techniques like lazy loading and modern formats. Optimized images improve page performance and accessibility.',
      recommendations: [],
      successMessage: 'Image optimization analysis encountered an error.',
      rawData: {
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// ===== ORCHESTRATEUR PRINCIPAL =====

/**
 * Orchestrateur principal pour l'analyse Technical Accessibility & Performance
 */
export async function analyzeTechnicalAccessibility(
  html: string, 
  url: string
): Promise<{ cards: MetricCard[], totalScore: number, maxScore: number }> {
  try {
    logger.info(`🔧 Starting Technical Accessibility & Performance analysis`);
    
    const $ = cheerio.load(html);
    const cards: MetricCard[] = [];
    
    // Analyse du score de performance (25 points)
    const performanceCard = await analyzePerformanceScore(url);
    cards.push(performanceCard);
    
    // Analyse de l'optimisation des images (10 points)
    const imageOptimizationCard = analyzeImageOptimization($);
    cards.push(imageOptimizationCard);
    
    // Calcule le score total
    const totalScore = cards.reduce((sum, card) => sum + card.score, 0);
    const maxScore = TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE + TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION;
    
    logger.info(`✅ Technical Accessibility & Performance analysis completed. Score: ${totalScore}/${maxScore}`);
    
    return {
      cards,
      totalScore,
      maxScore
    };
    
  } catch (error) {
    logger.error(`💥 Technical Accessibility & Performance analysis crashed: ${(error as Error).message}`);
    
    // Retourne des cartes d'erreur en cas de crash
    const errorCards: MetricCard[] = [
      {
        id: 'performance-score',
        name: 'Performance Score & Core Web Vitals',
        score: 0,
        maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE,
        status: 'error',
        explanation: 'Measures overall page performance and Core Web Vitals (LCP, INP, CLS). Fast loading pages provide better accessibility for all users and improved LLM processing.',
        recommendations: [{
          problem: TECHNICAL_ACCESSIBILITY_KB.apiFailure.problem,
          solution: TECHNICAL_ACCESSIBILITY_KB.apiFailure.solution,
          explanation: TECHNICAL_ACCESSIBILITY_KB.apiFailure.explanation,
          impact: TECHNICAL_ACCESSIBILITY_KB.apiFailure.impact
        }],
        successMessage: 'Performance analysis encountered an error.',
        rawData: { error: (error as Error).message }
      },
      {
        id: 'image-optimization',
        name: 'Image Optimization',
        score: 0,
        maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION,
        status: 'error',
        explanation: 'Evaluates image optimization techniques like lazy loading and modern formats. Optimized images improve page performance and accessibility.',
        recommendations: [],
        successMessage: 'Image optimization analysis encountered an error.',
        rawData: { error: (error as Error).message }
      }
    ];
    
    return {
      cards: errorCards,
      totalScore: 0,
      maxScore: TECHNICAL_ACCESSIBILITY_WEIGHTS.PERFORMANCE_SCORE + TECHNICAL_ACCESSIBILITY_WEIGHTS.IMAGE_OPTIMIZATION
    };
  }
}

// ===== EXPORTS =====

export { TECHNICAL_ACCESSIBILITY_WEIGHTS };
