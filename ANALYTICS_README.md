# Analytics System Documentation

## Overview
This comprehensive analytics system provides enterprise-grade tracking capabilities for your news website, including Google Analytics 4 integration, custom analytics, performance monitoring, error tracking, and real-time analytics dashboard.

## Features

### 📊 Core Analytics
- **Page View Tracking**: Automatic page view tracking with detailed metadata
- **Article Engagement**: Track article interactions, scroll depth, time spent
- **User Behavior**: Monitor clicks, form interactions, navigation patterns
- **Custom Events**: Track any custom user interactions or business metrics

### 🚀 Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB, INP tracking
- **Page Load Times**: Navigation timing and performance metrics
- **Error Tracking**: JavaScript errors, network failures, custom errors
- **Real-time Monitoring**: Live performance data and alerts

### 🔍 Advanced Features
- **Search Analytics**: Track search queries, results, and user engagement
- **Form Analytics**: Monitor form interactions, completion rates, field engagement
- **Social Media Tracking**: Track social shares and engagement
- **A/B Testing Support**: Custom event tracking for experiments
- **Privacy Compliance**: GDPR-compliant with cookie consent integration

### 📈 Real-time Dashboard
- **Live Analytics**: Real-time user activity and engagement metrics
- **Performance Overview**: Core Web Vitals and performance scores
- **Top Content**: Most viewed pages and articles
- **Error Monitoring**: Live error tracking and alerts
- **Data Export**: Export analytics data for further analysis

## Installation & Setup

### 1. Environment Configuration
Create a `.env.local` file with the following variables:

```bash
# Required for Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional custom analytics endpoint
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/events

# Configuration options
NEXT_PUBLIC_ANALYTICS_DEBUG=false
NEXT_PUBLIC_ANALYTICS_PRIVACY_MODE=false
```

### 2. Provider Setup
Wrap your app with the AnalyticsProvider:

```tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

function App() {
  return (
    <AnalyticsProvider config={{
      ga4_measurement_id: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      enable_performance_monitoring: true,
      enable_error_tracking: true,
      enable_user_behavior: true,
      privacy_mode: false,
      debug_mode: process.env.NODE_ENV === 'development'
    }}>
      <YourApp />
    </AnalyticsProvider>
  );
}
```

### 3. Google Analytics 4 Setup
1. Create a GA4 property in Google Analytics
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add it to your environment variables
4. Analytics will automatically send data to GA4

## Usage Examples

### Basic Page View Tracking
```tsx
import { usePageViewTracking } from '@/hooks/useAnalytics';

function Page() {
  usePageViewTracking({
    content_group1: 'News',
    content_group2: 'Technology'
  });
  
  return <div>Your page content</div>;
}
```

### Article Engagement Tracking
```tsx
import { useArticleEngagement } from '@/hooks/useAnalytics';

function ArticlePage({ article }) {
  const engagement = useArticleEngagement(
    article.id,
    article.title,
    article.category,
    article.author
  );

  return (
    <article>
      <h1>{article.title}</h1>
      <button onClick={() => engagement.trackShare()}>
        Share Article
      </button>
      <button onClick={() => engagement.trackComment()}>
        Add Comment
      </button>
    </article>
  );
}
```

### Custom Event Tracking
```tsx
import { useCustomEventTracking } from '@/hooks/useAnalytics';

function Newsletter() {
  const { trackEvent } = useCustomEventTracking();

  const handleSubscribe = () => {
    trackEvent({
      event_name: 'newsletter_signup',
      event_category: 'engagement',
      event_label: 'header_cta',
      custom_parameters: {
        source: 'homepage',
        user_type: 'anonymous'
      }
    });
  };

  return (
    <button onClick={handleSubscribe}>
      Subscribe to Newsletter
    </button>
  );
}
```

### Form Analytics
```tsx
import { useFormAnalytics } from '@/hooks/useAnalytics';

function ContactForm() {
  const { trackFormStart, trackFormSubmit, trackFieldInteraction } = useFormAnalytics('contact-form');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      trackFormSubmit(true);
    }}>
      <input
        type="email"
        onFocus={() => {
          trackFormStart();
          trackFieldInteraction('email', 'focus');
        }}
        onChange={() => trackFieldInteraction('email', 'change')}
        onBlur={() => trackFieldInteraction('email', 'blur')}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Search Analytics
```tsx
import { useSearchAnalytics } from '@/hooks/useAnalytics';

function SearchBox() {
  const { trackSearch, trackSearchResult } = useSearchAnalytics();

  const handleSearch = (query: string, results: any[]) => {
    trackSearch(query, results.length, {
      category: 'news',
      source: 'header_search'
    });
  };

  const handleResultClick = (query: string, result: any, position: number) => {
    trackSearchResult(query, position, result.id);
  };

  return (
    <SearchComponent 
      onSearch={handleSearch}
      onResultClick={handleResultClick}
    />
  );
}
```

### Error Tracking
```tsx
import { useErrorTracking } from '@/hooks/useAnalytics';

function Component() {
  const { trackError } = useErrorTracking();

  const handleApiCall = async () => {
    try {
      await fetchData();
    } catch (error) {
      trackError(error as Error);
      // Handle error...
    }
  };

  return <button onClick={handleApiCall}>Load Data</button>;
}
```

### Performance Monitoring
```tsx
import { usePerformanceMonitoring } from '@/hooks/useAnalytics';

function PerformanceWidget() {
  const performanceData = usePerformanceMonitoring();

  if (!performanceData) return <div>Loading...</div>;

  return (
    <div>
      <div>LCP: {performanceData.lcp}ms</div>
      <div>FID: {performanceData.fid}ms</div>
      <div>CLS: {performanceData.cls}</div>
      <div>FCP: {performanceData.fcp}ms</div>
    </div>
  );
}
```

### Real-time Analytics Dashboard
```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

function AdminPage() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  );
}
```

## Configuration Options

### AnalyticsConfig Interface
```typescript
interface AnalyticsConfig {
  // Google Analytics 4 measurement ID
  ga4_measurement_id?: string;
  
  // Custom analytics endpoint for your own backend
  custom_endpoint?: string;
  
  // Enable/disable features
  enable_performance_monitoring: boolean;
  enable_error_tracking: boolean;
  enable_user_behavior: boolean;
  
  // Privacy and debugging
  privacy_mode: boolean;  // Disable GA4 in privacy mode
  debug_mode: boolean;    // Enable console logging
  
  // Performance settings
  batch_size: number;     // Events per batch (default: 20)
  flush_interval: number; // Flush interval in ms (default: 30000)
}
```

## Privacy Compliance

### GDPR Compliance
- **Consent Management**: Integrate with cookie consent banners
- **Data Anonymization**: User IDs and sensitive data are anonymized
- **Local Storage**: Analytics data is stored locally and can be cleared
- **Privacy Mode**: Disable GA4 tracking while maintaining local analytics

### Cookie Consent Integration
```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function CookieConsent() {
  const analytics = useAnalytics();

  const handleAcceptCookies = () => {
    // Enable GA4 tracking
    analytics?.setUserId('anonymous-' + Date.now());
    localStorage.setItem('analytics_consent', 'true');
  };

  const handleRejectCookies = () => {
    // Keep local analytics only
    analytics?.clearData();
    localStorage.setItem('analytics_consent', 'false');
  };

  return (
    <div>
      <button onClick={handleAcceptCookies}>Accept Cookies</button>
      <button onClick={handleRejectCookies}>Reject Cookies</button>
    </div>
  );
}
```

## Performance Optimization

### Lazy Loading
Analytics are initialized only when needed and events are batched for performance.

### Local Storage Management
- Data older than 7 days is automatically purged
- Storage size is monitored and limited
- Data can be exported before clearing

### Network Optimization
- Events are batched and sent in intervals
- Failed requests are retried with exponential backoff
- Offline support with local queuing

## API Reference

### Core Functions
- `initializeAnalytics(config)`: Initialize the analytics system
- `trackPageView(event)`: Track page views
- `trackArticleEngagement(event)`: Track article interactions
- `trackUserBehavior(event)`: Track user behavior
- `trackCustomEvent(event)`: Track custom events
- `trackError(error)`: Track errors

### React Hooks
- `useAnalytics(config)`: Initialize analytics with config
- `usePageViewTracking(data)`: Automatic page view tracking
- `useArticleEngagement(id, title, category, author)`: Article engagement tracking
- `useUserBehavior()`: User behavior tracking utilities
- `useFormAnalytics(formId)`: Form interaction tracking
- `useSearchAnalytics()`: Search behavior tracking
- `useSocialAnalytics()`: Social media tracking
- `useCustomEventTracking()`: Custom event utilities
- `useErrorTracking()`: Error tracking utilities
- `useRealtimeAnalytics(interval)`: Real-time analytics data
- `usePerformanceMonitoring()`: Performance metrics data

### Components
- `<AnalyticsProvider>`: Wrap your app to enable analytics
- `<AnalyticsDashboard>`: Real-time analytics dashboard

## Deployment

### Production Setup
1. Set up Google Analytics 4 property
2. Configure environment variables
3. Set up custom analytics endpoint (optional)
4. Enable privacy mode if required by regulations
5. Configure cookie consent integration

### Monitoring
- Monitor error rates in the dashboard
- Set up alerts for performance degradation
- Review analytics data regularly
- Export data for deeper analysis

## Troubleshooting

### Common Issues
1. **GA4 not receiving data**: Check measurement ID and network connectivity
2. **Performance issues**: Adjust batch size and flush interval
3. **Storage full**: Analytics automatically cleans old data
4. **Privacy compliance**: Enable privacy mode and integrate consent management

### Debug Mode
Enable debug mode in development to see detailed console logs:
```typescript
const analytics = initializeAnalytics({
  debug_mode: true
});
```

## Support

For issues or questions:
1. Check the console for debug information
2. Verify environment variables are set correctly
3. Test in the analytics demo page
4. Review network requests in developer tools

## Demo
Visit `/analytics-demo` to see the analytics system in action with interactive examples and real-time dashboard.