/**
 * Analytics Demo Page
 * Demonstrates the analytics tracking system functionality
 */

'use client';

import React, { useState } from 'react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { 
  useArticleEngagement,
  useUserBehavior,
  useFormAnalytics,
  useSearchAnalytics,
  useSocialAnalytics,
  useCustomEventTracking,
  useErrorTracking
} from '@/hooks/useAnalytics';

const AnalyticsDemoPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ email: '', message: '' });
  const [showError, setShowError] = useState(false);

  // Initialize analytics hooks
  const articleEngagement = useArticleEngagement(
    'demo-article-123',
    'Analytics System Demo Article',
    'Technology',
    'Demo Author'
  );
  
  const { trackBehavior } = useUserBehavior();
  const { trackFormStart, trackFormSubmit, trackFieldInteraction } = useFormAnalytics('demo-form');
  const { trackSearch } = useSearchAnalytics();
  const { trackSocialShare } = useSocialAnalytics();
  const { trackEvent } = useCustomEventTracking();
  const { trackError } = useErrorTracking();

  // Demo event handlers
  const handleSearchDemo = () => {
    if (searchQuery.trim()) {
      trackSearch(searchQuery, Math.floor(Math.random() * 50) + 1, {
        category: 'demo',
        source: 'demo-page'
      });
      setSearchQuery('');
    }
  };

  const handleFormDemo = (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmit(true);
    setFormData({ email: '', message: '' });
    alert('Demo form submitted! Check analytics dashboard.');
  };

  const handleSocialShareDemo = (platform: string) => {
    trackSocialShare(platform, 'demo-article-123', 'article');
  };

  const handleCustomEventDemo = () => {
    trackEvent({
      event_name: 'demo_button_click',
      event_category: 'demo',
      event_label: 'custom_event_test',
      event_value: 1,
      custom_parameters: {
        timestamp: new Date().toISOString(),
        demo_type: 'manual_trigger'
      }
    });
  };

  const handleErrorDemo = () => {
    try {
      throw new Error('This is a demo error for analytics testing');
    } catch (error) {
      trackError(error as Error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleUserBehaviorDemo = (action: string) => {
    trackBehavior(action, {
      demo_page: true,
      action_time: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics System Demo</h1>
              <p className="mt-2 text-gray-600">
                Comprehensive analytics tracking with Google Analytics 4 integration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Analytics Active
              </span>
              {showError && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ⚠️ Error Tracked
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Controls */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Interactive Demos */}
          <div className="space-y-6">
            {/* Article Engagement Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📰 Article Engagement Tracking</h2>
              <p className="text-gray-600 mb-4">
                This demo article automatically tracks page views, scroll depth, and engagement time.
                Try scrolling or interacting with the page to see engagement metrics.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => articleEngagement.trackShare()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Track Share
                </button>
                <button
                  onClick={() => articleEngagement.trackComment()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Track Comment
                </button>
                <button
                  onClick={() => articleEngagement.trackCustomEngagement(5)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Custom Engagement (+5)
                </button>
              </div>
            </div>

            {/* Search Analytics Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🔍 Search Analytics</h2>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Enter search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchDemo()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchDemo}
                  disabled={!searchQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Search Demo
                </button>
              </div>
            </div>

            {/* Form Analytics Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📝 Form Analytics</h2>
              <form onSubmit={handleFormDemo} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter email..."
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      trackFieldInteraction('email', 'change');
                    }}
                    onFocus={() => {
                      trackFormStart();
                      trackFieldInteraction('email', 'focus');
                    }}
                    onBlur={() => trackFieldInteraction('email', 'blur')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Enter message..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      trackFieldInteraction('message', 'change');
                    }}
                    onFocus={() => trackFieldInteraction('message', 'focus')}
                    onBlur={() => trackFieldInteraction('message', 'blur')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Demo Form
                </button>
              </form>
            </div>

            {/* Social Analytics Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📱 Social Media Analytics</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialShareDemo('facebook')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => handleSocialShareDemo('twitter')}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleSocialShareDemo('linkedin')}
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
                >
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleSocialShareDemo('whatsapp')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - More Demos */}
          <div className="space-y-6">
            {/* User Behavior Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">👤 User Behavior Tracking</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUserBehaviorDemo('video_play')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Play Video
                </button>
                <button
                  onClick={() => handleUserBehaviorDemo('download')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Download File
                </button>
                <button
                  onClick={() => handleUserBehaviorDemo('newsletter_signup')}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  Newsletter Signup
                </button>
                <button
                  onClick={() => handleUserBehaviorDemo('menu_toggle')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Toggle Menu
                </button>
              </div>
            </div>

            {/* Custom Events Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⚡ Custom Events</h2>
              <button
                onClick={handleCustomEventDemo}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Trigger Custom Event
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Triggers a custom analytics event with detailed parameters
              </p>
            </div>

            {/* Error Tracking Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">❌ Error Tracking</h2>
              <button
                onClick={handleErrorDemo}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Generate Demo Error
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Triggers a demo error to test error tracking functionality
              </p>
            </div>

            {/* Performance Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⚡ Performance Monitoring</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Core Web Vitals:</span>
                  <span className="text-green-600 font-medium">Automatic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Page Load Times:</span>
                  <span className="text-green-600 font-medium">Tracked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Interactions:</span>
                  <span className="text-green-600 font-medium">Monitored</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Rates:</span>
                  <span className="text-green-600 font-medium">Calculated</span>
                </div>
              </div>
            </div>

            {/* Privacy Compliance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🔒 Privacy Compliance</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Cookie Consent Integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Data Anonymization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Local Storage Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <AnalyticsDashboard />
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">📚 Implementation Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Setup</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

function App() {
  return (
    <AnalyticsProvider config={{
      ga4_measurement_id: 'G-XXXXXXXXXX',
      enable_performance_monitoring: true,
      enable_error_tracking: true
    }}>
      <YourApp />
    </AnalyticsProvider>
  );
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Track Events</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useArticleEngagement } from '@/hooks/useAnalytics';

function Article({ id, title, category, author }) {
  const engagement = useArticleEngagement(id, title, category, author);
  
  return (
    <article onClick={() => engagement.trackShare()}>
      {/* Article content */}
    </article>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDemoPage;