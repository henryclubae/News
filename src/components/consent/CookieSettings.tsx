'use client';

import React, { useState } from 'react';
import { CookiePreferences, ConsentData, CookieCategory } from '@/types/cookie-consent';
import { COOKIE_POLICY_DATA } from '@/data/cookie-config';

interface CookieSettingsProps {
  preferences: CookiePreferences;
  consentData: ConsentData;
  categories: CookieCategory[];
  onUpdatePreferences: (preferences: CookiePreferences) => void;
  onWithdrawConsent: () => void;
  onClose: () => void;
}

export default function CookieSettings({
  preferences,
  consentData,
  categories,
  onUpdatePreferences,
  onWithdrawConsent,
  onClose
}: CookieSettingsProps) {
  const [activeTab, setActiveTab] = useState<string>('current');
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleCategory = (categoryId: keyof CookiePreferences) => {
    if (categoryId === 'necessary') return;
    
    setLocalPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleUpdatePreferences = () => {
    onUpdatePreferences(localPreferences);
  };

  const handleWithdrawConsent = () => {
    setShowDeleteConfirm(false);
    onWithdrawConsent();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      aria-labelledby="cookie-settings-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl dark:bg-gray-900 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 id="cookie-settings-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              Cookie Settings & Privacy Controls
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Close cookie settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-full max-h-[70vh]">
            {/* Tabs */}
            <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'current' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  Current Settings
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'preferences' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  Update Preferences
                </button>
                <button
                  onClick={() => setActiveTab('policy')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'policy' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  Cookie Policy
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'data' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  Data & Privacy
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'current' && (
                <CurrentSettingsTab preferences={preferences} consentData={consentData} />
              )}
              {activeTab === 'preferences' && (
                <UpdatePreferencesTab 
                  preferences={localPreferences}
                  categories={categories}
                  onToggle={handleToggleCategory}
                  onUpdate={handleUpdatePreferences}
                />
              )}
              {activeTab === 'policy' && (
                <CookiePolicyTab />
              )}
              {activeTab === 'data' && (
                <DataPrivacyTab 
                  onWithdrawConsent={() => setShowDeleteConfirm(true)} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black bg-opacity-75">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-900">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Withdraw Consent & Delete Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  This will remove all cookies (except essential ones), clear your preferences, 
                  and reset your consent. You will need to make your cookie choices again when you next visit.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdrawConsent}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Withdraw Consent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CurrentSettingsTab({ 
  preferences, 
  consentData 
}: { 
  preferences: CookiePreferences; 
  consentData: ConsentData; 
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Your Current Cookie Settings
      </h3>
      
      {/* Consent Information */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Consent Information
        </h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Consent ID</dt>
            <dd className="text-gray-900 dark:text-white font-mono text-xs">
              {consentData.consentId}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Date Given</dt>
            <dd className="text-gray-900 dark:text-white">
              {new Date(consentData.timestamp).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Time Given</dt>
            <dd className="text-gray-900 dark:text-white">
              {new Date(consentData.timestamp).toLocaleTimeString()}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Version</dt>
            <dd className="text-gray-900 dark:text-white">
              {consentData.version}
            </dd>
          </div>
        </dl>
      </div>

      {/* Active Categories */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Active Cookie Categories
      </h4>
      <div className="space-y-3">
        {Object.entries(preferences).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              enabled 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpdatePreferencesTab({ 
  preferences, 
  categories,
  onToggle,
  onUpdate
}: { 
  preferences: CookiePreferences;
  categories: CookieCategory[];
  onToggle: (categoryId: keyof CookiePreferences) => void;
  onUpdate: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Update Your Cookie Preferences
      </h3>
      
      <div className="space-y-4 mb-6">
        {categories.map(category => (
          <div key={category.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.title}
                </h4>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
              
              <div className="ml-4">
                {category.required ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Always Active
                  </span>
                ) : (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[category.id as keyof CookiePreferences]}
                      onChange={() => onToggle(category.id as keyof CookiePreferences)}
                      className="sr-only peer"
                      aria-label={`Toggle ${category.title} cookies`}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onUpdate}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Update Preferences
      </button>
    </div>
  );
}

function CookiePolicyTab() {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Cookie Policy
      </h3>
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This cookie policy explains how {COOKIE_POLICY_DATA.companyName} uses cookies and similar technologies 
          on our website. Last updated: {COOKIE_POLICY_DATA.lastUpdated}
        </p>

        <h4 className="text-md font-medium text-gray-900 dark:text-white mt-6 mb-3">
          What are cookies?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Cookies are small text files that are stored on your device when you visit a website. 
          They help websites remember your preferences and provide a better user experience.
        </p>

        <h4 className="text-md font-medium text-gray-900 dark:text-white mt-6 mb-3">
          How we use cookies
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We use cookies for various purposes including essential website functionality, 
          analytics to understand how our site is used, and marketing to provide relevant content.
        </p>

        <h4 className="text-md font-medium text-gray-900 dark:text-white mt-6 mb-3">
          Your choices
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You can control which cookies you accept through this settings panel. 
          Essential cookies cannot be disabled as they are necessary for the website to function properly.
        </p>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Contact us:</strong> If you have questions about our cookie policy, 
            please contact us at{' '}
            <a 
              href={`mailto:${COOKIE_POLICY_DATA.contactEmail}`}
              className="underline hover:no-underline"
            >
              {COOKIE_POLICY_DATA.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function DataPrivacyTab({ onWithdrawConsent }: { onWithdrawConsent: () => void }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Data & Privacy Rights
      </h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Your Rights Under GDPR
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Right to be informed about data collection and processing</li>
            <li>• Right to access your personal data</li>
            <li>• Right to rectification (correction of inaccurate data)</li>
            <li>• Right to erasure (&ldquo;right to be forgotten&rdquo;)</li>
            <li>• Right to restrict processing</li>
            <li>• Right to data portability</li>
            <li>• Right to object to processing</li>
            <li>• Rights related to automated decision-making and profiling</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Withdraw Consent & Delete Data
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You can withdraw your consent at any time. This will remove all non-essential cookies 
            and reset your preferences. You will need to make your cookie choices again when you next visit.
          </p>
          
          <button
            onClick={onWithdrawConsent}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Withdraw Consent & Delete Data
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Links & Resources
          </h4>
          <div className="space-y-2 text-sm">
            <a 
              href={COOKIE_POLICY_DATA.privacyPolicyUrl}
              className="block text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Full Privacy Policy
            </a>
            <a 
              href="https://gdpr.eu/what-is-gdpr/"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about GDPR
            </a>
            <a 
              href={`mailto:${COOKIE_POLICY_DATA.contactEmail}`}
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact us about your data
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}