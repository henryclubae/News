'use client';

import React, { useState } from 'react';
import { PreferenceCenterProps, CookiePreferences, CookieCategory, CookieInfo } from '@/types/cookie-consent';

export default function PreferenceCenter({
  preferences,
  categories,
  onSave,
  onClose
}: PreferenceCenterProps) {
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleToggleCategory = (categoryId: keyof CookiePreferences) => {
    if (categoryId === 'necessary') return; // Cannot disable necessary cookies
    
    setLocalPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSave = () => {
    onSave(localPreferences);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setLocalPreferences(allAccepted);
    onSave(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setLocalPreferences(onlyNecessary);
    onSave(onlyNecessary);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      aria-labelledby="cookie-preferences-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl dark:bg-gray-900 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 id="cookie-preferences-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              Cookie Preferences
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Close cookie preferences"
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
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  Overview
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === category.id 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'overview' ? (
                <OverviewTab 
                  categories={categories} 
                  preferences={localPreferences} 
                  onToggle={handleToggleCategory} 
                />
              ) : (
                <CategoryTab 
                  category={categories.find(c => c.id === activeTab)!} 
                  isEnabled={localPreferences[activeTab as keyof CookiePreferences]}
                  onToggle={() => handleToggleCategory(activeTab as keyof CookiePreferences)}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You can change your preferences at any time by clicking the cookie settings button.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                Reject All
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                Accept All
              </button>
              
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ 
  categories, 
  preferences, 
  onToggle 
}: {
  categories: CookieCategory[];
  preferences: CookiePreferences;
  onToggle: (categoryId: keyof CookiePreferences) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Cookie Categories
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        We use different types of cookies for various purposes. You can choose which categories to allow.
      </p>
      
      <div className="space-y-4">
        {categories.map(category => (
          <div 
            key={category.id}
            className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {category.title}
              </h4>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                {category.cookies.length} cookie{category.cookies.length !== 1 ? 's' : ''}
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
                    onChange={() => onToggle(category.id)}
                    className="sr-only peer"
                    aria-label={`Toggle ${category.title} cookies`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryTab({ 
  category, 
  isEnabled, 
  onToggle 
}: {
  category: CookieCategory;
  isEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {category.title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        </div>
        
        <div className="ml-6">
          {category.required ? (
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Always Active
            </span>
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={onToggle}
                className="sr-only peer"
                aria-label={`Toggle ${category.title} cookies`}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          Cookies in this category:
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {category.cookies.map((cookie: CookieInfo, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {cookie.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {cookie.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {cookie.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {cookie.provider}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}