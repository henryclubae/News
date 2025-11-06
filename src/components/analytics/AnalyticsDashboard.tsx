/**
 * Real-time Analytics Dashboard Components
 */

'use client';

import React, { useState } from 'react';
import './analytics-dashboard.css';
import { 
  useRealtimeAnalytics, 
  useAnalyticsData, 
  usePerformanceMonitoring 
} from '@/hooks/useAnalytics';

// Dashboard Card Component
interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  className = ''
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${trend ? trendColors[trend] : 'text-gray-600'}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-3xl text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics: React.FC = () => {
  const performanceData = usePerformanceMonitoring();

  if (!performanceData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <p className="text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score <= thresholds[0]) return 'bg-green-500';
    if (score <= thresholds[1]) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const metrics = [
    {
      name: 'Largest Contentful Paint (LCP)',
      value: performanceData.lcp,
      unit: 'ms',
      thresholds: [2500, 4000] as [number, number]
    },
    {
      name: 'First Input Delay (FID)',
      value: performanceData.fid,
      unit: 'ms',
      thresholds: [100, 300] as [number, number]
    },
    {
      name: 'Cumulative Layout Shift (CLS)',
      value: performanceData.cls,
      unit: '',
      thresholds: [0.1, 0.25] as [number, number]
    },
    {
      name: 'First Contentful Paint (FCP)',
      value: performanceData.fcp,
      unit: 'ms',
      thresholds: [1800, 3000] as [number, number]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{metric.name}</p>
              <p className="text-lg font-bold text-gray-900">
                {metric.value.toFixed(metric.unit === '' ? 3 : 0)}{metric.unit}
              </p>
            </div>
            <div 
              className={`w-4 h-4 rounded-full ${getScoreColor(metric.value, metric.thresholds)}`}
              title={`Score: ${metric.value <= metric.thresholds[0] ? 'Good' : 
                metric.value <= metric.thresholds[1] ? 'Needs Improvement' : 'Poor'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Pages Component
interface TopPagesProps {
  pages: Array<{ path: string; views: number; }>;
}

const TopPages: React.FC<TopPagesProps> = ({ pages }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
      <div className="space-y-3">
        {pages.slice(0, 10).map((page, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {page.path}
              </p>
            </div>
            <div className="ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {page.views} views
              </span>
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <p className="text-gray-500 text-sm">No page data available</p>
        )}
      </div>
    </div>
  );
};

// Top Articles Component
interface TopArticlesProps {
  articles: Array<{ id: string; title: string; engagement: number; }>;
}

const TopArticles: React.FC<TopArticlesProps> = ({ articles }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Top Articles</h3>
      <div className="space-y-3">
        {articles.slice(0, 10).map((article, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {article.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                ID: {article.id}
              </p>
            </div>
            <div className="ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {article.engagement} interactions
              </span>
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="text-gray-500 text-sm">No article data available</p>
        )}
      </div>
    </div>
  );
};

// Recent Events Component
interface RecentEventsProps {
  events: Array<{
    type: string;
    timestamp: number;
    details: unknown;
  }>;
}

const RecentEvents: React.FC<RecentEventsProps> = ({ events }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return '👁️';
      case 'click': return '👆';
      case 'scroll_depth': return '📜';
      case 'form_submit': return '📝';
      case 'search': return '🔍';
      case 'error': return '❌';
      default: return '📊';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.slice(0, 20).map((event, index) => (
          <div key={`event-${event.timestamp}-${index}`} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
            <span className="text-lg">{getEventIcon(event.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {event.type.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimestamp(event.timestamp)}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {event.details && typeof event.details === 'object' && event.details !== null ? 
                `${Object.keys(event.details as Record<string, unknown>).length} props` : 
                event.details ? String(event.details).slice(0, 20) : 'No details'
              }
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-gray-500 text-sm">No recent events</p>
        )}
      </div>
    </div>
  );
};

// Error Rate Chart Component
interface ErrorRateProps {
  errorRate: number;
}

const ErrorRate: React.FC<ErrorRateProps> = ({ errorRate }) => {
  const getErrorRateColor = (rate: number) => {
    if (rate < 1) return 'text-green-600 bg-green-100';
    if (rate < 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getErrorRateStatus = (rate: number) => {
    if (rate < 1) return 'Excellent';
    if (rate < 5) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Error Rate</h3>
      <div className="text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getErrorRateColor(errorRate)}`}>
          {errorRate.toFixed(2)}%
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {getErrorRateStatus(errorRate)}
        </p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`error-rate-bar ${
              errorRate < 1 ? 'bg-green-600' : 
              errorRate < 5 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            data-width={Math.round(Math.min(errorRate * 10, 100))}
          />
        </div>
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
export const AnalyticsDashboard: React.FC = () => {
  const { realtimeData, loading } = useRealtimeAnalytics(5000); // Update every 5 seconds
  const { data: analyticsData, exportData, clearData } = useAnalyticsData();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const data = exportData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      clearData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!realtimeData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Users"
          value={realtimeData.current_active_users}
          icon="👥"
        />
        <DashboardCard
          title="Total Page Views"
          value={analyticsData?.page_views.length || 0}
          icon="📄"
        />
        <DashboardCard
          title="Total Engagement"
          value={analyticsData?.article_engagement.length || 0}
          icon="💬"
        />
        <DashboardCard
          title="Error Rate"
          value={`${realtimeData.error_rate.toFixed(2)}%`}
          trend={realtimeData.error_rate < 1 ? 'down' : realtimeData.error_rate < 5 ? 'stable' : 'up'}
          icon="⚠️"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TopPages pages={realtimeData.top_pages} />
          <ErrorRate errorRate={realtimeData.error_rate} />
        </div>
        
        <div className="space-y-6">
          <TopArticles articles={realtimeData.top_articles} />
          <PerformanceMetrics />
        </div>
      </div>

      {/* Recent Events */}
      <RecentEvents events={realtimeData.recent_events} />

      {/* Data Summary */}
      {analyticsData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.page_views.length}</p>
              <p className="text-sm text-gray-600">Page Views</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{analyticsData.article_engagement.length}</p>
              <p className="text-sm text-gray-600">Article Interactions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{analyticsData.user_behavior.length}</p>
              <p className="text-sm text-gray-600">User Actions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{analyticsData.performance_metrics.length}</p>
              <p className="text-sm text-gray-600">Performance Metrics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{analyticsData.errors.length}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{analyticsData.custom_events.length}</p>
              <p className="text-sm text-gray-600">Custom Events</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;