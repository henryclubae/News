/**
 * Analytics Provider Component
 * Initializes analytics tracking for the entire application
 */

'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { initializeAnalytics, getAnalytics, type AnalyticsConfig } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

interface AnalyticsContextType {
  analytics: ReturnType<typeof getAnalytics>;
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const [analytics] = React.useState(() => {
    const existing = getAnalytics();
    if (existing) return existing;

    const defaultConfig: Partial<AnalyticsConfig> = {
      ga4_measurement_id: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      custom_endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      enable_performance_monitoring: true,
      enable_error_tracking: true,
      enable_user_behavior: true,
      privacy_mode: process.env.NODE_ENV === 'development',
      debug_mode: process.env.NODE_ENV === 'development',
      batch_size: 20,
      flush_interval: 30000,
      ...config
    };

    return initializeAnalytics(defaultConfig);
  });
  const [isInitialized] = React.useState(true);
  const pathname = usePathname();

  // Track page views on route changes
  useEffect(() => {
    if (analytics && isInitialized) {
      analytics.trackPageView({
        page_path: pathname,
        page_location: typeof window !== 'undefined' ? window.location.href : pathname,
        page_title: typeof document !== 'undefined' ? document.title : 'Unknown'
      });
    }
  }, [pathname, analytics, isInitialized]);

  const contextValue: AnalyticsContextType = {
    analytics,
    isInitialized
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsProvider;