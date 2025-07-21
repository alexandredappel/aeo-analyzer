const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class AccessibilityAnalyzer {
  constructor() {
    this.browser = null;
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
    
    // PageSpeed Insights API configuration
    this.pageSpeedConfig = {
      endpoint: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      apiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
      categories: ['performance', 'accessibility'],
      strategy: 'desktop',
      timeout: 30000
    };
    
    // Puppeteer optimized configuration
    this.puppeteerConfig = {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-background-networking',
        '--disable-background-timer-throttling'
      ],
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
      timeout: 30000
    };

    // Critical DOM scoring criteria
    this.criticalDOMCriteria = {
      contentRatio: { weight: 40, thresholds: { excellent: 80, good: 60, poor: 40 } },
      navigationAccess: { weight: 30, thresholds: { excellent: 90, good: 70, poor: 50 } },
      semanticStructure: { weight: 30, thresholds: { excellent: 85, good: 65, poor: 45 } }
    };
  }

  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch(this.puppeteerConfig);
    }
  }

  async analyze(htmlContent, url) {
    const startTime = Date.now();
    logger.info(`Démarrage de l'analyse d'accessibilité pour: ${url}`);

    try {
      // Check cache first
      const cacheKey = `accessibility:${url}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        logger.info(`Résultat d'accessibilité trouvé en cache pour: ${url}`);
        return cached.data;
      }

      // Initialize browser
      await this.initializeBrowser();

      // ✅ CORRECTION : Exécution séquentielle avec gestion d'erreurs appropriée
      let criticalDOMResult = { score: 0, error: null };
      let pageSpeedResult = { performanceScore: 0, accessibilityScore: 0, error: null };
      let imagesResult = { score: 0, error: null };

      // Critical DOM Analysis
      try {
        logger.info('Starting Critical DOM analysis...');
        criticalDOMResult = await this.analyzeCriticalDOM(htmlContent, url);
        logger.info(`Critical DOM analysis completed: ${criticalDOMResult.score}/100`);
      } catch (error) {
        logger.error(`Critical DOM analysis failed: ${error.message}`);
        criticalDOMResult.error = error.message;
      }

      // PageSpeed Analysis - CORRECTION MAJEURE
      try {
        logger.info('Starting PageSpeed Insights analysis...');
        pageSpeedResult = await this.analyzePageSpeedInsights(url);
        logger.info(`PageSpeed analysis completed: Performance=${pageSpeedResult.performanceScore}/100, Accessibility=${pageSpeedResult.accessibilityScore}/100`);
        
        // ✅ Vérifier si l'API a vraiment réussi
        if (pageSpeedResult.error) {
          throw new Error(pageSpeedResult.error);
        }
      } catch (error) {
        logger.error(`PageSpeed analysis failed: ${error.message}`);
        pageSpeedResult = { 
          performanceScore: 0, 
          accessibilityScore: 0, 
          error: error.message,
          coreWebVitals: { status: 'unavailable' },
          opportunities: [],
          accessibilityIssues: []
        };
      }

      // Images Analysis
      try {
        logger.info('Starting Images analysis...');
        imagesResult = await this.analyzeImages(htmlContent, url);
        logger.info(`Images analysis completed: ${imagesResult.score}/100`);
      } catch (error) {
        logger.error(`Images analysis failed: ${error.message}`);
        imagesResult.error = error.message;
      }

      // Combine results with proper error handling
      const combinedAnalysis = this.combineResults(
        criticalDOMResult,
        pageSpeedResult,
        imagesResult
      );

      // Cache results
      this.cache.set(cacheKey, {
        data: combinedAnalysis,
        timestamp: Date.now()
      });

      const duration = Date.now() - startTime;
      logger.info(`Analyse d'accessibilité terminée en ${duration}ms, score final: ${combinedAnalysis.score}/100`);
      
      return combinedAnalysis;

    } catch (error) {
      logger.error(`Échec critique de l'analyse d'accessibilité: ${error.message}`);
      return this.getErrorFallback(error.message);
    }
  }

  // ✅ CORRECTION : Fetch avec timeout proper pour Node.js
  async analyzePageSpeedInsights(url) {
    const apiKey = this.pageSpeedConfig.apiKey;
    if (!apiKey) {
      throw new Error('GOOGLE_PAGESPEED_API_KEY non configurée');
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.pageSpeedConfig.timeout);
    
    try {
      const apiUrl = `${this.pageSpeedConfig.endpoint}?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${this.pageSpeedConfig.strategy}`;
      
      logger.info(`Calling PageSpeed API: ${apiUrl.replace(/key=[^&]+/, 'key=***')}`);
      
      // ✅ CORRECTION : Proper fetch with AbortController
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AEO-Auditor/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`PageSpeed API HTTP error: ${response.status} - ${errorText}`);
        throw new Error(`PageSpeed API HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // ✅ Validation de la réponse
      if (!data.lighthouseResult) {
        throw new Error('Invalid PageSpeed API response - missing lighthouseResult');
      }

      const performanceScore = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
      const accessibilityScore = Math.round((data.lighthouseResult?.categories?.accessibility?.score || 0) * 100);
      
      logger.info(`PageSpeed API response received - Performance: ${performanceScore}/100, Accessibility: ${accessibilityScore}/100`);
      
      return {
        performanceScore,
        accessibilityScore,
        coreWebVitals: this.extractCoreWebVitals(data),
        opportunities: this.extractOpportunities(data),
        accessibilityIssues: this.extractAccessibilityIssues(data),
        error: null // ✅ Explicitly set no error
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = `PageSpeed API timeout après ${this.pageSpeedConfig.timeout}ms`;
        logger.error(timeoutError);
        throw new Error(timeoutError);
      }
      
      logger.error(`Erreur PageSpeed Insights: ${error.message}`);
      throw error; // ✅ Propager l'erreur au lieu de retourner un objet
    }
  }

  // ✅ CORRECTION : Fonction combineResults avec validation appropriée
  combineResults(criticalDOMResult, pageSpeedResult, imagesResult) {
    // Extract scores with proper fallbacks
    const criticalDOMScore = criticalDOMResult?.score || 0;
    const performanceScore = pageSpeedResult?.performanceScore || 0;
    const imagesScore = imagesResult?.score || 0;

    // Log individual scores for debugging
    logger.info(`Combining scores - Critical DOM: ${criticalDOMScore}, Performance: ${performanceScore}, Images: ${imagesScore}`);

    // ✅ CORRECTION : Pondération avec vérification des erreurs
    let totalScore = 0;
    let validComponents = 0;
    let weightSum = 0;

    // Critical DOM (40% weight)
    if (!criticalDOMResult?.error && criticalDOMScore > 0) {
      totalScore += criticalDOMScore * 0.4;
      weightSum += 0.4;
      validComponents++;
    }

    // Performance (35% weight)
    if (!pageSpeedResult?.error && performanceScore > 0) {
      totalScore += performanceScore * 0.35;
      weightSum += 0.35;
      validComponents++;
    }

    // Images (25% weight)
    if (!imagesResult?.error && imagesScore > 0) {
      totalScore += imagesScore * 0.25;
      weightSum += 0.25;
      validComponents++;
    }

    // Normalize score based on available components
    const finalScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 0;

    logger.info(`Final accessibility score calculation: ${finalScore}/100 (${validComponents}/3 components valid)`);

    return {
      score: finalScore,
      maxScore: 100,
      breakdown: {
        criticalDOM: {
          score: criticalDOMScore,
          maxScore: 100,
          status: this.getScoreStatus(criticalDOMScore),
          details: criticalDOMResult?.details ? 
            `Contenu critique: ${Math.round(criticalDOMResult.details.contentRatio)}%, Navigation: ${Math.round(criticalDOMResult.details.navigationAccess)}%, Structure: ${Math.round(criticalDOMResult.details.semanticStructure)}%` 
            : (criticalDOMResult?.error || 'Analyse échouée')
        },
        performance: {
          score: performanceScore,
          maxScore: 100,
          status: this.getScoreStatus(performanceScore),
          details: pageSpeedResult?.error 
            ? `Erreur PageSpeed: ${pageSpeedResult.error}`
            : `Performance: ${performanceScore}/100, Core Web Vitals: ${pageSpeedResult?.coreWebVitals?.summary || 'N/A'}`
        },
        images: {
          score: imagesScore,
          maxScore: 100,
          status: this.getScoreStatus(imagesScore),
          details: imagesResult?.details || imagesResult?.error || 'Analyse échouée'
        }
      },
      recommendations: this.generateRecommendations(criticalDOMResult, pageSpeedResult, imagesResult),
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: '1.1',
        validComponents,
        totalComponents: 3
      }
    };
  }

  // Les autres méthodes restent identiques...
  async analyzeCriticalDOM(staticHTML, url) {
    const page = await this.browser.newPage();
    
    try {
      // Block unnecessary resources for faster loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if(['stylesheet', 'font', 'image', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      const renderedHTML = await page.content();
      
      // Critical DOM comparison
      const staticDOM = cheerio.load(staticHTML);
      const renderedDOM = cheerio.load(renderedHTML);
      
      const analysis = {
        staticContent: this.extractContentMetrics(staticDOM),
        renderedContent: this.extractContentMetrics(renderedDOM),
        criticalRatio: this.calculateCriticalRatio(staticDOM, renderedDOM),
        accessibilityElements: this.analyzeAccessibilityElements(renderedDOM),
        navigationAccess: this.analyzeNavigationAccess(staticDOM, renderedDOM),
        semanticStructure: this.analyzeSemanticStructure(staticDOM, renderedDOM)
      };

      return this.scoreCriticalDOM(analysis);

    } finally {
      await page.close();
    }
  }

  extractContentMetrics(dom) {
    return {
      headings: dom('h1, h2, h3, h4, h5, h6').length,
      paragraphs: dom('p').length,
      links: dom('a[href]').length,
      images: dom('img').length,
      textContent: dom.text().trim().length,
      formElements: dom('input, textarea, select, button').length,
      semanticElements: dom('main, article, section, nav, aside, header, footer').length
    };
  }

  calculateCriticalRatio(staticDOM, renderedDOM) {
    const staticMetrics = this.extractContentMetrics(staticDOM);
    const renderedMetrics = this.extractContentMetrics(renderedDOM);

    // Calculate ratio of critical content available without JavaScript
    const contentRatio = staticMetrics.textContent > 0 
      ? (staticMetrics.textContent / renderedMetrics.textContent) * 100 
      : 0;

    const navigationRatio = staticMetrics.links > 0 
      ? (staticMetrics.links / renderedMetrics.links) * 100 
      : 0;

    const semanticRatio = staticMetrics.semanticElements > 0 
      ? (staticMetrics.semanticElements / renderedMetrics.semanticElements) * 100 
      : 0;

    return {
      content: Math.min(contentRatio, 100),
      navigation: Math.min(navigationRatio, 100),
      semantic: Math.min(semanticRatio, 100),
      overall: Math.min((contentRatio + navigationRatio + semanticRatio) / 3, 100)
    };
  }

  analyzeAccessibilityElements(dom) {
    return {
      altTexts: {
        total: dom('img').length,
        withAlt: dom('img[alt]').length,
        empty: dom('img[alt=""]').length
      },
      ariaLabels: {
        total: dom('[aria-label], [aria-labelledby], [aria-describedby]').length,
        buttons: dom('button[aria-label], button[aria-labelledby]').length,
        inputs: dom('input[aria-label], input[aria-labelledby]').length
      },
      headingStructure: this.analyzeHeadingStructure(dom),
      focusableElements: {
        total: dom('a, button, input, textarea, select, [tabindex]').length,
        withTabindex: dom('[tabindex]').length,
        skipLinks: dom('a[href^="#"]').length
      }
    };
  }

  analyzeHeadingStructure(dom) {
    const headings = [];
    dom('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const level = parseInt(el.tagName.substring(1));
      headings.push({ level, text: dom(el).text().trim() });
    });

    // Check for proper hierarchy
    let hierarchyValid = true;
    let hasH1 = headings.some(h => h.level === 1);
    
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i-1].level;
      if (diff > 1) {
        hierarchyValid = false;
        break;
      }
    }

    return {
      total: headings.length,
      hasH1,
      hierarchyValid,
      levels: headings.map(h => h.level),
      emptyHeadings: headings.filter(h => !h.text).length
    };
  }

  analyzeNavigationAccess(staticDOM, renderedDOM) {
    const staticNav = this.extractNavigationElements(staticDOM);
    const renderedNav = this.extractNavigationElements(renderedDOM);

    return {
      static: staticNav,
      rendered: renderedNav,
      accessibilityRatio: staticNav.total > 0 ? (staticNav.total / renderedNav.total) * 100 : 0
    };
  }

  extractNavigationElements(dom) {
    return {
      mainNav: dom('nav').length,
      menuLinks: dom('nav a, [role="navigation"] a').length,
      skipLinks: dom('a[href^="#skip"], a[href^="#main"], a[href^="#content"]').length,
      breadcrumbs: dom('[aria-label*="breadcrumb"], [role="breadcrumb"], .breadcrumb').length,
      total: dom('nav a, [role="navigation"] a').length
    };
  }

  analyzeSemanticStructure(staticDOM, renderedDOM) {
    const staticSemantic = this.extractSemanticElements(staticDOM);
    const renderedSemantic = this.extractSemanticElements(renderedDOM);

    return {
      static: staticSemantic,
      rendered: renderedSemantic,
      semanticRatio: staticSemantic.total > 0 ? (staticSemantic.total / renderedSemantic.total) * 100 : 0
    };
  }

  extractSemanticElements(dom) {
    return {
      main: dom('main').length,
      article: dom('article').length,
      section: dom('section').length,
      nav: dom('nav').length,
      aside: dom('aside').length,
      header: dom('header').length,
      footer: dom('footer').length,
      total: dom('main, article, section, nav, aside, header, footer').length
    };
  }

  scoreCriticalDOM(analysis) {
    const contentScore = this.getThresholdScore(
      analysis.criticalRatio.content, 
      this.criticalDOMCriteria.contentRatio.thresholds
    );
    
    const navigationScore = this.getThresholdScore(
      analysis.navigationAccess.accessibilityRatio,
      this.criticalDOMCriteria.navigationAccess.thresholds
    );

    const semanticScore = this.getThresholdScore(
      analysis.semanticStructure.semanticRatio,
      this.criticalDOMCriteria.semanticStructure.thresholds
    );

    const totalScore = Math.round(
      (contentScore * this.criticalDOMCriteria.contentRatio.weight / 100) +
      (navigationScore * this.criticalDOMCriteria.navigationAccess.weight / 100) +
      (semanticScore * this.criticalDOMCriteria.semanticStructure.weight / 100)
    );

    return {
      score: totalScore,
      details: {
        contentRatio: analysis.criticalRatio.content,
        navigationAccess: analysis.navigationAccess.accessibilityRatio,
        semanticStructure: analysis.semanticStructure.semanticRatio,
        accessibilityElements: analysis.accessibilityElements
      },
      breakdown: {
        content: { score: contentScore, ratio: analysis.criticalRatio.content },
        navigation: { score: navigationScore, ratio: analysis.navigationAccess.accessibilityRatio },
        semantic: { score: semanticScore, ratio: analysis.semanticStructure.semanticRatio }
      }
    };
  }

  extractCoreWebVitals(data) {
    const audits = data.lighthouseResult?.audits || {};
    
    return {
      lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
      fid: audits['max-potential-fid']?.displayValue || 'N/A',
      cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
      summary: audits['largest-contentful-paint']?.score > 0.9 ? 'Excellent' : 
               audits['largest-contentful-paint']?.score > 0.5 ? 'Bon' : 'À améliorer'
    };
  }

  extractOpportunities(data) {
    const audits = data.lighthouseResult?.audits || {};
    const opportunities = [];

    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'efficiently-encode-images'
    ];

    opportunityAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score < 1) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: audit.details?.overallSavingsMs || 0
        });
      }
    });

    return opportunities;
  }

  extractAccessibilityIssues(data) {
    const audits = data.lighthouseResult?.audits || {};
    const issues = [];

    const accessibilityAudits = [
      'image-alt',
      'color-contrast',
      'heading-order',
      'link-name',
      'button-name',
      'aria-labels'
    ];

    accessibilityAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score < 1) {
        issues.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          impact: audit.score < 0.5 ? 'high' : 'medium'
        });
      }
    });

    return issues;
  }

  async analyzeImages(staticHTML, url) {
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Get all images (static + dynamic)
      const allImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          hasAlt: !!img.alt,
          isDecorative: img.hasAttribute('role') && img.getAttribute('role') === 'presentation',
          width: img.naturalWidth,
          height: img.naturalHeight,
          loading: img.loading
        }));
      });

      // Compare with static images
      const staticDOM = cheerio.load(staticHTML);
      const staticImages = staticDOM('img').length;

      const analysis = {
        total: allImages.length,
        static: staticImages,
        dynamic: allImages.length - staticImages,
        withoutAlt: allImages.filter(img => !img.hasAlt && !img.isDecorative).length,
        decorative: allImages.filter(img => img.isDecorative).length,
        lazyLoaded: allImages.filter(img => img.loading === 'lazy').length,
        issues: this.identifyImageIssues(allImages)
      };

      return this.scoreImages(analysis);

    } finally {
      await page.close();
    }
  }

  identifyImageIssues(images) {
    const issues = [];

    images.forEach((img, index) => {
      if (!img.hasAlt && !img.isDecorative) {
        issues.push({
          type: 'missing-alt',
          message: `Image ${index + 1} manque de texte alternatif`,
          severity: 'high'
        });
      }

      if (img.alt && img.alt.length > 125) {
        issues.push({
          type: 'long-alt',
          message: `Image ${index + 1} a un texte alternatif trop long (${img.alt.length} caractères)`,
          severity: 'medium'
        });
      }

      if (img.width > 2000 || img.height > 2000) {
        issues.push({
          type: 'large-image',
          message: `Image ${index + 1} est très grande (${img.width}x${img.height})`,
          severity: 'medium'
        });
      }
    });

    return issues;
  }

  scoreImages(analysis) {
    let score = 100;

    // Penalize missing alt texts
    if (analysis.total > 0) {
      const altTextRatio = (analysis.total - analysis.withoutAlt) / analysis.total;
      score = Math.round(altTextRatio * 100);
    }

    // Bonus for lazy loading
    if (analysis.total > 0 && analysis.lazyLoaded > 0) {
      const lazyRatio = analysis.lazyLoaded / analysis.total;
      score = Math.min(score + (lazyRatio * 10), 100);
    }

    return {
      score,
      details: `${analysis.total} images analysées, ${analysis.withoutAlt} sans alt text`,
      breakdown: {
        total: analysis.total,
        withAlt: analysis.total - analysis.withoutAlt,
        withoutAlt: analysis.withoutAlt,
        lazyLoaded: analysis.lazyLoaded,
        issues: analysis.issues.length
      },
      issues: analysis.issues
    };
  }

  getThresholdScore(value, thresholds) {
    if (value >= thresholds.excellent) return 100;
    if (value >= thresholds.good) return 75;
    if (value >= thresholds.poor) return 50;
    return 25;
  }

  getScoreStatus(score) {
    if (score >= 80) return 'pass';
    if (score >= 60) return 'partial';
    return 'fail';
  }

  generateRecommendations(criticalDOM, pageSpeed, images) {
    const recommendations = [];
    
    if (!criticalDOM?.error && criticalDOM?.score < 70) {
      recommendations.push('🚨 Le contenu critique est faible - assurez-vous que le contenu important soit accessible sans JavaScript');
    }
    
    if (!pageSpeed?.error && pageSpeed?.performanceScore < 80) {
      recommendations.push('⚡ Améliorez les performances avec l\'optimisation des images et la réduction du JavaScript');
    } else if (pageSpeed?.error) {
      recommendations.push('📊 Impossible d\'analyser les performances - vérifiez la connectivité à l\'API PageSpeed Insights');
    }
    
    if (!pageSpeed?.error && pageSpeed?.accessibilityScore < 80) {
      recommendations.push('♿ Améliorez l\'accessibilité avec des labels ARIA et une structure de titres appropriée');
    }
    
    if (!images?.error && images?.score < 60) {
      recommendations.push('🖼️ Ajoutez du texte alternatif aux images pour une meilleure accessibilité');
    }

    // Recommandations positives
    if (!criticalDOM?.error && criticalDOM?.score >= 80) {
      recommendations.push('✅ Excellent ratio de contenu critique accessible sans JavaScript');
    }
    
    if (!images?.error && images?.score >= 90) {
      recommendations.push('✅ Excellente accessibilité des images - toutes ont du texte alternatif');
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Analyse d\'accessibilité complétée - consultez les détails pour les améliorations spécifiques');
    }

    return recommendations;
  }

  getErrorFallback(errorMessage) {
    return {
      score: 0,
      maxScore: 100,
      breakdown: {
        criticalDOM: {
          score: 0,
          maxScore: 100,
          status: 'fail',
          details: 'Analyse impossible'
        },
        performance: {
          score: 0,
          maxScore: 100,
          status: 'fail',
          details: 'Analyse impossible'
        },
        images: {
          score: 0,
          maxScore: 100,
          status: 'fail',
          details: 'Analyse impossible'
        }
      },
      recommendations: [
        `❌ Erreur d'analyse: ${errorMessage}`,
        '🔧 Veuillez réessayer ou vérifier l\'URL'
      ],
      error: errorMessage,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: '1.1'
      }
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.cache.clear();
  }
}

module.exports = AccessibilityAnalyzer;