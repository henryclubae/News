/**
 * React Hooks for Analytics Integration
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  initializeAnalytics, 
  getAnalytics, 
  trackPageView, 
  trackArticleEngagement,
  trackUserBehavior,
  trackCustomEvent,
  type AnalyticsConfig,
  type PageViewEvent,
  type ArticleEngagementEvent,
  type CustomEvent,
  type AnalyticsData,
  type RealtimeAnalytics
} from '@/lib/analytics';

// Hook for initializing analytics
export const useAnalytics = (config?: Partial<AnalyticsConfig>) => {
  const [analytics] = useState(() => getAnalytics() || initializeAnalytics(config));
  return analytics;
};

// Hook for page view tracking
export const usePageViewTracking = (pageData?: Partial<PageViewEvent>) => {
  useEffect(() => {
    trackPageView(pageData);
  }, [pageData]);
};

// Hook for article engagement tracking
export const useArticleEngagement = (articleId: string, articleTitle: string, articleCategory: string, articleAuthor: string) => {
  const engagementStartTime = useRef<number>(0);
  const scrollDepthRef = useRef(0);
  const hasTrackedView = useRef(false);

  const trackEngagement = useCallback((type: ArticleEngagementEvent['engagement_type'], value?: number) => {
    const startTime = engagementStartTime.current || Date.now();
    trackArticleEngagement({
      article_id: articleId,
      article_title: articleTitle,
      article_category: articleCategory,
      article_author: articleAuthor,
      engagement_type: type,
      engagement_value: value,
      scroll_depth: scrollDepthRef.current,
      time_on_page: Date.now() - startTime
    });
  }, [articleId, articleTitle, articleCategory, articleAuthor]);

  useEffect(() => {
    if (!engagementStartTime.current) {
      engagementStartTime.current = Date.now();
    }

    if (!hasTrackedView.current) {
      trackEngagement('view');
      hasTrackedView.current = true;
    }

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      );
      
      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercent;
        
        // Track scroll milestones
        if (scrollPercent >= 25 && scrollPercent < 50) {
          trackEngagement('scroll_25');
        } else if (scrollPercent >= 50 && scrollPercent < 75) {
          trackEngagement('scroll_50');
        } else if (scrollPercent >= 75 && scrollPercent < 100) {
          trackEngagement('scroll_75');
        } else if (scrollPercent >= 100) {
          trackEngagement('scroll_100');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track time spent on page unload
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - (engagementStartTime.current || Date.now());
      trackEngagement('time_spent', timeSpent);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackEngagement]);

  return {
    trackShare: () => trackEngagement('share'),
    trackComment: () => trackEngagement('comment'),
    trackCustomEngagement: (value: number) => trackEngagement('view', value)
  };
};

// Hook for user behavior tracking
export const useUserBehavior = () => {
  const trackBehavior = useCallback((eventName: string, customParameters?: Record<string, unknown>) => {
    trackUserBehavior({
      event_name: eventName,
      session_id: `session_${Date.now()}`,
      custom_parameters: customParameters
    });
  }, []);

  return { trackBehavior };
};

// Hook for custom event tracking
export const useCustomEventTracking = () => {
  const trackEvent = useCallback((event: CustomEvent) => {
    trackCustomEvent(event);
  }, []);

  return { trackEvent };
};

// Hook for real-time analytics data
export const useRealtimeAnalytics = (refreshInterval: number = 30000) => {
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const analytics = useAnalytics();

  useEffect(() => {
    if (!analytics) return;

    const updateData = () => {
      try {
        const data = analytics.getRealtimeAnalytics();
        setRealtimeData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch realtime analytics:', error);
        setLoading(false);
      }
    };

    // Initial load
    updateData();

    // Set up interval for updates
    const interval = setInterval(updateData, refreshInterval);

    return () => clearInterval(interval);
  }, [analytics, refreshInterval]);

  return { realtimeData, loading };
};

// Hook for analytics data export
export const useAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const analytics = useAnalytics();

  const fetchData = useCallback(async () => {
    if (!analytics) return;

    setLoading(true);
    try {
      const analyticsData = analytics.getAnalyticsData();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [analytics]);

  const exportData = useCallback(() => {
    if (!analytics) return null;
    return analytics.exportData();
  }, [analytics]);

  const clearData = useCallback(() => {
    if (!analytics) return;
    analytics.clearData();
    setData(null);
  }, [analytics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    fetchData,
    exportData,
    clearData
  };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [performanceData, setPerformanceData] = useState<{
    cls: number;
    fid: number;
    lcp: number;
    fcp: number;
  } | null>(null);

  useEffect(() => {
    const analytics = getAnalytics();
    if (!analytics) return;

    const updatePerformanceData = () => {
      const realtimeData = analytics.getRealtimeAnalytics();
      setPerformanceData(realtimeData.average_performance);
    };

    // Update initially and then every 10 seconds
    updatePerformanceData();
    const interval = setInterval(updatePerformanceData, 10000);

    return () => clearInterval(interval);
  }, []);

  return performanceData;
};

// Hook for error tracking
export const useErrorTracking = () => {
  const trackError = useCallback((error: Error) => {
    const analytics = getAnalytics();
    if (!analytics) return;

    analytics.trackError({
      error_message: error.message,
      error_stack: error.stack,
      error_type: 'javascript',
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
      timestamp: Date.now(),
      severity: 'medium'
    });
  }, []);

  return { trackError };
};

// Hook for form analytics
export const useFormAnalytics = (formId: string) => {
  const { trackBehavior } = useUserBehavior();
  
  const trackFormStart = useCallback(() => {
    trackBehavior('form_start', { form_id: formId });
  }, [formId, trackBehavior]);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    trackBehavior('form_submit', { 
      form_id: formId, 
      success,
      errors: errors?.join(', ')
    });
  }, [formId, trackBehavior]);

  const trackFieldInteraction = useCallback((fieldName: string, action: 'focus' | 'blur' | 'change') => {
    trackBehavior('form_field_interaction', {
      form_id: formId,
      field_name: fieldName,
      action
    });
  }, [formId, trackBehavior]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction
  };
};

// Hook for search analytics
export const useSearchAnalytics = () => {
  const { trackBehavior } = useUserBehavior();

  const trackSearch = useCallback((query: string, resultsCount: number, filters?: Record<string, unknown>) => {
    trackBehavior('search', {
      search_query: query,
      results_count: resultsCount,
      filters,
      query_length: query.length
    });
  }, [trackBehavior]);

  const trackSearchResult = useCallback((query: string, resultPosition: number, resultId: string) => {
    trackBehavior('search_result_click', {
      search_query: query,
      result_position: resultPosition,
      result_id: resultId
    });
  }, [trackBehavior]);

  return {
    trackSearch,
    trackSearchResult
  };
};

// Hook for social sharing analytics
export const useSocialAnalytics = () => {
  const { trackBehavior } = useUserBehavior();

  const trackSocialShare = useCallback((platform: string, contentId: string, contentType: string) => {
    trackBehavior('social_share', {
      platform,
      content_id: contentId,
      content_type: contentType
    });
  }, [trackBehavior]);

  const trackSocialClick = useCallback((platform: string, action: string) => {
    trackBehavior('social_click', {
      platform,
      action
    });
  }, [trackBehavior]);

  return {
    trackSocialShare,
    trackSocialClick
  };
};

// Hook for navigation analytics
export const useNavigationAnalytics = () => {
  const { trackBehavior } = useUserBehavior();

  const trackNavigation = useCallback((from: string, to: string, method: 'click' | 'browser' | 'programmatic') => {
    trackBehavior('navigation', {
      from_path: from,
      to_path: to,
      navigation_method: method
    });
  }, [trackBehavior]);

  const trackMenuInteraction = useCallback((menuItem: string, action: 'open' | 'close' | 'click') => {
    trackBehavior('menu_interaction', {
      menu_item: menuItem,
      action
    });
  }, [trackBehavior]);

  return {
    trackNavigation,
    trackMenuInteraction
  };
};