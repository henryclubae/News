/**
 * Cookie Consent Demo Page Component
 * Demonstrates usage of the cookie consent system
 */

'use client';

import React from 'react';
import { useCookieConsent } from '@/components/consent';

export default function CookieConsentDemo() {
  const { consent, preferences, hasConsent, openSettings } = useCookieConsent();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cookie Consent Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page demonstrates the GDPR-compliant cookie consent system functionality.
        </p>
      </div>

      {/* Consent Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Consent Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Has Valid Consent:
            </p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              hasConsent 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {hasConsent ? 'Yes' : 'No'}
            </span>
          </div>

          {consent && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Consent Date:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(consent.timestamp).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {consent && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Consent ID:
            </p>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
              {consent.consentId}
            </p>
          </div>
        )}
      </div>

      {/* Cookie Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Active Cookie Categories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(preferences).map(([category, enabled]) => (
            <div 
              key={category}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <span className={`w-3 h-3 rounded-full ${
                  enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Usage Examples
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Analytics Tracking
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              {preferences.analytics ? (
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Analytics tracking is enabled - Google Analytics would be loaded
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✗ Analytics tracking is disabled - No tracking scripts loaded
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Marketing Features
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              {preferences.marketing ? (
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Marketing cookies enabled - Advertising features available
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✗ Marketing cookies disabled - No advertising tracking
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Personalization
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              {preferences.preferences ? (
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Preference cookies enabled - Personalized content available
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✗ Preference cookies disabled - Default content only
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Cookie Management
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={openSettings}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Open Cookie Settings
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('gdpr-cookie-consent');
              window.location.reload();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Reset Consent (Demo)
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          The &ldquo;Reset Consent&rdquo; button is for demo purposes only - it clears your consent 
          and reloads the page to show the banner again.
        </p>
      </div>

      {/* Code Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Implementation Code
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Using the Hook
            </h3>
            <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-sm overflow-x-auto">
{`import { useCookieConsent } from '@/components/consent';

function MyComponent() {
  const { consent, preferences, hasConsent, openSettings } = useCookieConsent();
  
  // Check if analytics is enabled
  if (preferences.analytics) {
    // Load analytics scripts
  }
  
  return (
    <button onClick={openSettings}>
      Cookie Settings
    </button>
  );
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Adding to Layout
            </h3>
            <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-sm overflow-x-auto">
{`import { CookieConsent } from '@/components/consent';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}