/**
 * Analytics Tracking System
 * Comprehensive analytics implementation with GA4 integration and custom tracking
 */

// Types for analytics events and data
export interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_path: string;
  content_group1?: string; // Category
  content_group2?: string; // Author
  content_group3?: string; // Article Type
  engagement_time_msec?: number;
}

export interface ArticleEngagementEvent {
  article_id: string;
  article_title: string;
  article_category: string;
  article_author: string;
  engagement_type: 'view' | 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100' | 'time_spent' | 'share' | 'comment';
  engagement_value?: number;
  scroll_depth?: number;
  time_on_page?: number;
}

export interface UserBehaviorEvent {
  event_name: string;
  user_engagement?: number;
  session_id: string;
  user_id?: string;
  custom_parameters?: Record<string, any>;
}

export interface PerformanceMetrics {
  metric_name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  metric_value: number;
  metric_rating: 'good' | 'needs-improvement' | 'poor';
  page_path: string;
  connection_type?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
}

export interface ErrorEvent {
  error_message: string;
  error_stack?: string;
  error_type: 'javascript' | 'network' | 'custom';
  page_path: string;
  user_agent: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CustomEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  event_value?: number;
  custom_parameters?: Record<string, any>;
}

export interface AnalyticsConfig {
  ga4_measurement_id?: string;
  custom_endpoint?: string;
  enable_performance_monitoring: boolean;
  enable_error_tracking: boolean;
  enable_user_behavior: boolean;
  privacy_mode: boolean;
  debug_mode: boolean;
  batch_size: number;
  flush_interval: number;
}

// Analytics Data Storage
export interface AnalyticsData {
  page_views: PageViewEvent[];
  article_engagement: ArticleEngagementEvent[];
  user_behavior: UserBehaviorEvent[];
  performance_metrics: PerformanceMetrics[];
  errors: ErrorEvent[];
  custom_events: CustomEvent[];
}

// Real-time Analytics State
export interface RealtimeAnalytics {
  current_active_users: number;
  top_pages: { path: string; views: number; }[];
  top_articles: { id: string; title: string; engagement: number; }[];
  error_rate: number;
  average_performance: {
    cls: number;
    fid: number;
    lcp: number;
    fcp: number;
  };
  recent_events: Array<{
    type: string;
    timestamp: number;
    details: any;
  }>;
}

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private data: AnalyticsData;
  private realtime: RealtimeAnalytics;
  private sessionId: string;
  private userId?: string;
  private eventQueue: any[] = [];
  private isInitialized = false;
  private performanceObserver?: PerformanceObserver;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enable_performance_monitoring: true,
      enable_error_tracking: true,
      enable_user_behavior: true,
      privacy_mode: false,
      debug_mode: false,
      batch_size: 20,
      flush_interval: 30000, // 30 seconds
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.data = this.loadStoredData();
    this.realtime = this.initializeRealtimeData();

    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredData(): AnalyticsData {
    if (typeof localStorage === 'undefined') {
      return this.getEmptyAnalyticsData();
    }

    try {
      const stored = localStorage.getItem('analytics_data');
      if (stored) {
        const data = JSON.parse(stored);
        // Clean old data (keep only last 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        return {
          page_views: data.page_views?.filter((pv: any) => pv.timestamp > sevenDaysAgo) || [],
          article_engagement: data.article_engagement?.filter((ae: any) => ae.timestamp > sevenDaysAgo) || [],
          user_behavior: data.user_behavior?.filter((ub: any) => ub.timestamp > sevenDaysAgo) || [],
          performance_metrics: data.performance_metrics?.filter((pm: any) => pm.timestamp > sevenDaysAgo) || [],
          errors: data.errors?.filter((e: any) => e.timestamp > sevenDaysAgo) || [],
          custom_events: data.custom_events?.filter((ce: any) => ce.timestamp > sevenDaysAgo) || []
        };
      }
    } catch (error) {
      console.error('Failed to load stored analytics data:', error);
    }

    return this.getEmptyAnalyticsData();
  }

  private getEmptyAnalyticsData(): AnalyticsData {
    return {
      page_views: [],
      article_engagement: [],
      user_behavior: [],
      performance_metrics: [],
      errors: [],
      custom_events: []
    };
  }

  private initializeRealtimeData(): RealtimeAnalytics {
    return {
      current_active_users: 0,
      top_pages: [],
      top_articles: [],
      error_rate: 0,
      average_performance: {
        cls: 0,
        fid: 0,
        lcp: 0,
        fcp: 0
      },
      recent_events: []
    };
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize Google Analytics 4
      if (this.config.ga4_measurement_id && !this.config.privacy_mode) {
        await this.initializeGA4();
      }

      // Set up performance monitoring
      if (this.config.enable_performance_monitoring) {
        this.setupPerformanceMonitoring();
      }

      // Set up error tracking
      if (this.config.enable_error_tracking) {
        this.setupErrorTracking();
      }

      // Set up user behavior tracking
      if (this.config.enable_user_behavior) {
        this.setupUserBehaviorTracking();
      }

      // Start flush timer
      this.startFlushTimer();

      // Load user ID from storage if available
      this.loadUserIdentity();

      this.isInitialized = true;
      this.log('Analytics tracker initialized');

    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async initializeGA4(): Promise<void> {
    if (typeof window === 'undefined' || !this.config.ga4_measurement_id) return;

    try {
      // Load Google Analytics 4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.ga4_measurement_id}`;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', this.config.ga4_measurement_id, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_parameter_1: 'content_group1'
        }
      });

      this.log('Google Analytics 4 initialized');
    } catch (error) {
      console.error('Failed to initialize GA4:', error);
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    try {
      // Web Vitals monitoring
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackPerformanceMetric({
            metric_name: 'LCP',
            metric_value: lastEntry.startTime,
            metric_rating: this.getRating('LCP', lastEntry.startTime),
            page_path: window.location.pathname
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const performanceEntry = entry as any; // PerformanceEventTiming
            const fidValue = performanceEntry.processingStart - performanceEntry.startTime;
            this.trackPerformanceMetric({
              metric_name: 'FID',
              metric_value: fidValue,
              metric_rating: this.getRating('FID', fidValue),
              page_path: window.location.pathname
            });
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Track CLS on page unload
        window.addEventListener('beforeunload', () => {
          this.trackPerformanceMetric({
            metric_name: 'CLS',
            metric_value: clsValue,
            metric_rating: this.getRating('CLS', clsValue),
            page_path: window.location.pathname
          });
        });
      }

      // Navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          // First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.trackPerformanceMetric({
              metric_name: 'FCP',
              metric_value: fcpEntry.startTime,
              metric_rating: this.getRating('FCP', fcpEntry.startTime),
              page_path: window.location.pathname
            });
          }

          // Time to First Byte
          this.trackPerformanceMetric({
            metric_name: 'TTFB',
            metric_value: navigation.responseStart - navigation.requestStart,
            metric_rating: this.getRating('TTFB', navigation.responseStart - navigation.requestStart),
            page_path: window.location.pathname
          });
        }, 0);
      });

      this.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to setup performance monitoring:', error);
    }
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      'LCP': [2500, 4000],
      'FID': [100, 300],
      'CLS': [0.1, 0.25],
      'FCP': [1800, 3000],
      'TTFB': [800, 1800],
      'INP': [200, 500]
    };

    const [good, poor] = thresholds[metric] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        error_message: event.message,
        error_stack: event.error?.stack,
        error_type: 'javascript',
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        timestamp: Date.now(),
        severity: this.determineErrorSeverity(event.message)
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        error_message: event.reason?.message || String(event.reason),
        error_stack: event.reason?.stack,
        error_type: 'javascript',
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'medium'
      });
    });

    this.log('Error tracking initialized');
  }

  private determineErrorSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['security', 'auth', 'payment', 'critical'];
    const highKeywords = ['network', 'api', 'server', 'database'];
    const mediumKeywords = ['validation', 'format', 'parse'];

    const lowerMessage = message.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => lowerMessage.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) return 'medium';
    return 'low';
  }

  private setupUserBehaviorTracking(): void {
    if (typeof window === 'undefined') return;

    // Scroll depth tracking
    let maxScrollDepth = 0;
    let scrollTimeouts: Record<string, NodeJS.Timeout> = {};

    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      );
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        // Track milestone percentages
        const milestones = [25, 50, 75, 100];
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !scrollTimeouts[milestone.toString()]) {
            scrollTimeouts[milestone.toString()] = setTimeout(() => {
              this.trackUserBehavior({
                event_name: 'scroll_depth',
                session_id: this.sessionId,
                custom_parameters: {
                  scroll_depth: milestone,
                  page_path: window.location.pathname
                }
              });
            }, 1000); // Delay to ensure user actually read content
          }
        });
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      if (['a', 'button'].includes(tagName) || target.closest('a, button')) {
        this.trackUserBehavior({
          event_name: 'click',
          session_id: this.sessionId,
          custom_parameters: {
            element_type: tagName,
            element_text: target.textContent?.slice(0, 100),
            element_class: target.className,
            page_path: window.location.pathname
          }
        });
      }
    });

    // Form interaction tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackUserBehavior({
        event_name: 'form_submit',
        session_id: this.sessionId,
        custom_parameters: {
          form_id: form.id,
          form_action: form.action,
          page_path: window.location.pathname
        }
      });
    });

    // Focus/blur tracking for engagement
    let focusStartTime = Date.now();
    let totalEngagementTime = 0;

    window.addEventListener('focus', () => {
      focusStartTime = Date.now();
    });

    window.addEventListener('blur', () => {
      totalEngagementTime += Date.now() - focusStartTime;
    });

    // Track engagement time on page unload
    window.addEventListener('beforeunload', () => {
      if (document.hasFocus()) {
        totalEngagementTime += Date.now() - focusStartTime;
      }
      
      this.trackUserBehavior({
        event_name: 'page_engagement',
        session_id: this.sessionId,
        user_engagement: totalEngagementTime,
        custom_parameters: {
          engagement_time: totalEngagementTime,
          page_path: window.location.pathname
        }
      });
    });

    this.log('User behavior tracking initialized');
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flush_interval);
  }

  private loadUserIdentity(): void {
    if (typeof localStorage !== 'undefined') {
      const storedUserId = localStorage.getItem('analytics_user_id');
      if (storedUserId) {
        this.userId = storedUserId;
      }
    }
  }

  private saveData(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('analytics_data', JSON.stringify(this.data));
      } catch (error) {
        console.error('Failed to save analytics data:', error);
      }
    }
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.debug_mode) {
      console.log(`[Analytics] ${message}`, ...args);
    }
  }

  private addToQueue(event: any): void {
    this.eventQueue.push({
      ...event,
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId
    });

    if (this.eventQueue.length >= this.config.batch_size) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send to custom endpoint if configured
      if (this.config.custom_endpoint) {
        await this.sendToCustomEndpoint(events);
      }

      // Send to Google Analytics if configured
      if (this.config.ga4_measurement_id && typeof window !== 'undefined' && (window as any).gtag) {
        events.forEach(event => {
          (window as any).gtag('event', event.event_name || 'custom_event', event);
        });
      }

      this.log(`Flushed ${events.length} events`);
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Add events back to queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  private async sendToCustomEndpoint(events: any[]): Promise<void> {
    if (!this.config.custom_endpoint) return;

    const response = await fetch(this.config.custom_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        session_id: this.sessionId,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private updateRealtimeData(): void {
    // Update current active users (simplified)
    this.realtime.current_active_users = 1; // Would be updated from server in real implementation

    // Update top pages
    const pageViews = this.data.page_views.reduce((acc, pv) => {
      acc[pv.page_path] = (acc[pv.page_path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.realtime.top_pages = Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    // Update top articles
    const articleEngagement = this.data.article_engagement.reduce((acc, ae) => {
      if (!acc[ae.article_id]) {
        acc[ae.article_id] = {
          id: ae.article_id,
          title: ae.article_title,
          engagement: 0
        };
      }
      acc[ae.article_id].engagement += ae.engagement_value || 1;
      return acc;
    }, {} as Record<string, { id: string; title: string; engagement: number }>);

    this.realtime.top_articles = Object.values(articleEngagement)
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    // Update error rate
    const totalEvents = this.data.page_views.length + this.data.article_engagement.length;
    this.realtime.error_rate = totalEvents > 0 ? (this.data.errors.length / totalEvents) * 100 : 0;

    // Update average performance
    const perfMetrics = this.data.performance_metrics;
    if (perfMetrics.length > 0) {
      ['cls', 'fid', 'lcp', 'fcp'].forEach(metric => {
        const metricData = perfMetrics.filter(pm => pm.metric_name.toLowerCase() === metric);
        if (metricData.length > 0) {
          this.realtime.average_performance[metric as keyof typeof this.realtime.average_performance] = 
            metricData.reduce((sum, pm) => sum + pm.metric_value, 0) / metricData.length;
        }
      });
    }
  }

  // Public API methods

  public trackPageView(event: Partial<PageViewEvent>): void {
    if (!this.isInitialized) return;

    const pageViewEvent: PageViewEvent = {
      page_title: document?.title || 'Unknown',
      page_location: window?.location?.href || 'Unknown',
      page_path: window?.location?.pathname || '/',
      ...event
    };

    this.data.page_views.push({ ...pageViewEvent, timestamp: Date.now() } as any);
    this.addToQueue({ event_name: 'page_view', ...pageViewEvent });
    this.updateRealtimeData();
    this.saveData();

    this.log('Page view tracked:', pageViewEvent);
  }

  public trackArticleEngagement(event: ArticleEngagementEvent): void {
    if (!this.isInitialized) return;

    this.data.article_engagement.push({ ...event, timestamp: Date.now() } as any);
    this.addToQueue({ event_name: 'article_engagement', ...event });
    this.updateRealtimeData();
    this.saveData();

    this.log('Article engagement tracked:', event);
  }

  public trackUserBehavior(event: UserBehaviorEvent): void {
    if (!this.isInitialized) return;

    this.data.user_behavior.push({ ...event, timestamp: Date.now() } as any);
    this.addToQueue(event);
    this.saveData();

    // Add to recent events
    this.realtime.recent_events.unshift({
      type: event.event_name,
      timestamp: Date.now(),
      details: event.custom_parameters
    });
    
    // Keep only last 50 events
    this.realtime.recent_events = this.realtime.recent_events.slice(0, 50);

    this.log('User behavior tracked:', event);
  }

  public trackPerformanceMetric(metric: PerformanceMetrics): void {
    if (!this.isInitialized) return;

    this.data.performance_metrics.push({ ...metric, timestamp: Date.now() } as any);
    this.addToQueue({ event_name: 'performance_metric', ...metric });
    this.updateRealtimeData();
    this.saveData();

    this.log('Performance metric tracked:', metric);
  }

  public trackError(error: ErrorEvent): void {
    if (!this.isInitialized) return;

    this.data.errors.push(error);
    this.addToQueue({ event_name: 'error', ...error });
    this.updateRealtimeData();
    this.saveData();

    this.log('Error tracked:', error);
  }

  public trackCustomEvent(event: CustomEvent): void {
    if (!this.isInitialized) return;

    this.data.custom_events.push({ ...event, timestamp: Date.now() } as any);
    this.addToQueue(event);
    this.saveData();

    this.log('Custom event tracked:', event);
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('analytics_user_id', userId);
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', this.config.ga4_measurement_id, {
        user_id: userId
      });
    }

    this.log('User ID set:', userId);
  }

  public getAnalyticsData(): AnalyticsData {
    return { ...this.data };
  }

  public getRealtimeAnalytics(): RealtimeAnalytics {
    this.updateRealtimeData();
    return { ...this.realtime };
  }

  public clearData(): void {
    this.data = this.getEmptyAnalyticsData();
    this.realtime = this.initializeRealtimeData();
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('analytics_data');
    }

    this.log('Analytics data cleared');
  }

  public exportData(): string {
    return JSON.stringify({
      data: this.data,
      realtime: this.realtime,
      config: this.config,
      exported_at: new Date().toISOString()
    }, null, 2);
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Flush remaining events
    this.flushEvents();

    this.isInitialized = false;
    this.log('Analytics tracker destroyed');
  }
}

// Singleton instance
let analytics: AnalyticsTracker | null = null;

export const initializeAnalytics = (config: Partial<AnalyticsConfig> = {}): AnalyticsTracker => {
  if (!analytics) {
    analytics = new AnalyticsTracker(config);
  }
  return analytics;
};

export const getAnalytics = (): AnalyticsTracker | null => {
  return analytics;
};

// Convenience functions
export const trackPageView = (event: Partial<PageViewEvent> = {}) => {
  analytics?.trackPageView(event);
};

export const trackArticleEngagement = (event: ArticleEngagementEvent) => {
  analytics?.trackArticleEngagement(event);
};

export const trackUserBehavior = (event: UserBehaviorEvent) => {
  analytics?.trackUserBehavior(event);
};

export const trackCustomEvent = (event: CustomEvent) => {
  analytics?.trackCustomEvent(event);
};

export const trackError = (error: ErrorEvent) => {
  analytics?.trackError(error);
};

export default AnalyticsTracker;