// Umami Analytics Utility

// Check if analytics should be enabled
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false; // SSR
  
  // Only enable in production on the correct domain
  return process.env.NODE_ENV === 'production' && 
    (window.location.hostname === 'ai-generative-engine-optimization.com' ||
     window.location.hostname.includes('ai-generative-engine-optimization.com'));
};

// Track custom event
export const trackEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (!isAnalyticsEnabled()) {
    console.log(`[Analytics] Would track event: ${eventName}`, eventData);
    return;
  }

  // Check if umami is available
  if (typeof window !== 'undefined' && (window as any).umami) {
    try {
      (window as any).umami.track(eventName, eventData);
      console.log(`[Analytics] Event tracked: ${eventName}`, eventData);
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  } else {
    console.warn('[Analytics] Umami not loaded');
  }
};

// Track page view (handled automatically by Umami, but useful for debugging)
export const trackPageView = (page?: string): void => {
  if (!isAnalyticsEnabled()) {
    console.log(`[Analytics] Would track page view: ${page || window.location.pathname}`);
    return;
  }

  if (typeof window !== 'undefined' && (window as any).umami) {
    try {
      (window as any).umami.track(page || window.location.pathname);
      console.log(`[Analytics] Page view tracked: ${page || window.location.pathname}`);
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error);
    }
  }
};

// Specific event trackers for the app
export const trackAnalysisStart = (url: string): void => {
  trackEvent('analysis_started', {
    url: url,
    source: 'homepage_button'
  });
};

export const trackAnalysisComplete = (url: string, score?: number): void => {
  trackEvent('analysis_completed', {
    url: url,
    score: score
  });
};

export const trackAnalysisError = (url: string, error: string): void => {
  trackEvent('analysis_error', {
    url: url,
    error: error
  });
}; 