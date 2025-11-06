'use client';

import React from 'react';
import { ConsentBannerProps } from '@/types/cookie-consent';

export default function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onCustomize,
  onClose
}: ConsentBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Cookie Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {/* Cookie Icon */}
              <div className="flex-shrink-0 mt-1">
                <svg 
                  className="w-5 h-5 text-blue-600 dark:text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" 
                  />
                </svg>
              </div>
              
              {/* Message Content */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  We use cookies to improve your experience
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  We use cookies and similar technologies to provide the best experience on our website. 
                  Some are essential for functionality, while others help us understand usage and improve our services.{' '}
                  <a 
                    href="/privacy-policy" 
                    className="underline hover:no-underline text-blue-600 dark:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more in our Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-4">
            <button
              onClick={onCustomize}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 transition-colors"
              aria-label="Customize cookie preferences"
            >
              Customize
            </button>
            
            <button
              onClick={onRejectAll}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 transition-colors"
              aria-label="Reject all non-essential cookies"
            >
              Reject All
            </button>
            
            <button
              onClick={onAcceptAll}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            aria-label="Close cookie banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Legal Notice */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By clicking &ldquo;Accept All&rdquo;, you agree to the storing of cookies on your device to enhance site navigation, 
            analyze site usage, and assist in our marketing efforts. Essential cookies cannot be disabled.
          </p>
        </div>
      </div>
    </div>
  );
}