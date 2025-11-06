'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsOptOutSettings, FormValidationError } from '@/types/cookie-consent';
import { analyticsOptOutAPI } from '@/lib/privacy-api';

interface AnalyticsOptOutProps {
  userId?: string;
  onSettingsChange?: (settings: AnalyticsOptOutSettings) => void;
  className?: string;
}

const ANALYTICS_SERVICES = [
  {
    key: 'googleAnalytics' as keyof AnalyticsOptOutSettings,
    name: 'Google Analytics',
    description: 'Website usage tracking and visitor behavior analysis',
    category: 'Essential Analytics',
    icon: '📊',
    dataCollected: ['Page views', 'Session duration', 'Traffic sources', 'User demographics'],
  },
  {
    key: 'facebookPixel' as keyof AnalyticsOptOutSettings,
    name: 'Facebook Pixel',
    description: 'Social media advertising and conversion tracking',
    category: 'Advertising',
    icon: '📘',
    dataCollected: ['Ad interactions', 'Conversion events', 'Custom audiences', 'Lookalike audiences'],
  },
  {
    key: 'customAnalytics' as keyof AnalyticsOptOutSettings,
    name: 'Custom Analytics',
    description: 'Our proprietary analytics and content optimization',
    category: 'Content Optimization',
    icon: '🔧',
    dataCollected: ['Reading patterns', 'Content preferences', 'Engagement metrics', 'User journey'],
  },
  {
    key: 'performanceMonitoring' as keyof AnalyticsOptOutSettings,
    name: 'Performance Monitoring',
    description: 'Website performance and error tracking',
    category: 'Technical',
    icon: '⚡',
    dataCollected: ['Page load times', 'Error reports', 'Browser compatibility', 'Network conditions'],
  },
  {
    key: 'errorTracking' as keyof AnalyticsOptOutSettings,
    name: 'Error Tracking',
    description: 'JavaScript errors and crash reporting',
    category: 'Technical',
    icon: '🐛',
    dataCollected: ['Error messages', 'Stack traces', 'Browser information', 'User actions'],
  },
  {
    key: 'heatmapping' as keyof AnalyticsOptOutSettings,
    name: 'Heatmapping',
    description: 'Visual tracking of user interactions and clicks',
    category: 'User Experience',
    icon: '🔥',
    dataCollected: ['Click patterns', 'Scroll behavior', 'Mouse movements', 'Form interactions'],
  },
  {
    key: 'sessionRecording' as keyof AnalyticsOptOutSettings,
    name: 'Session Recording',
    description: 'Recording of user sessions for UX improvement',
    category: 'User Experience',
    icon: '🎥',
    dataCollected: ['Screen recordings', 'User interactions', 'Navigation paths', 'Form inputs'],
  },
] as const;

const CATEGORIES = [
  { name: 'Essential Analytics', color: 'blue', description: 'Basic website analytics and performance metrics' },
  { name: 'Advertising', color: 'purple', description: 'Advertisement tracking and conversion metrics' },
  { name: 'Content Optimization', color: 'green', description: 'Content personalization and optimization' },
  { name: 'Technical', color: 'gray', description: 'Technical monitoring and error tracking' },
  { name: 'User Experience', color: 'orange', description: 'User behavior analysis and experience optimization' },
] as const;

export default function AnalyticsOptOut({
  userId,
  onSettingsChange,
  className = ''
}: AnalyticsOptOutProps) {
  const [settings, setSettings] = useState<AnalyticsOptOutSettings>({
    googleAnalytics: false,
    facebookPixel: false,
    customAnalytics: false,
    performanceMonitoring: false,
    errorTracking: false,
    heatmapping: false,
    sessionRecording: false,
  });

  const [originalSettings, setOriginalSettings] = useState<AnalyticsOptOutSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showGlobalOptOut, setShowGlobalOptOut] = useState(false);
  const [isGlobalOptOut, setIsGlobalOptOut] = useState(false);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await analyticsOptOutAPI.getOptOutSettings();
        if (response.success && response.data) {
          setSettings(response.data);
          setOriginalSettings(response.data);
          
          // Check if all analytics are opted out (global opt-out)
          const allOptedOut = Object.values(response.data).every(value => value === false);
          setIsGlobalOptOut(allOptedOut);
        }
      } catch (error) {
        console.error('Failed to load analytics settings:', error);
        setErrors([
          { field: 'general', message: 'Failed to load settings', code: 'LOAD_ERROR' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  // Check for changes
  useEffect(() => {
    if (!originalSettings) return;
    
    const hasSettingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasSettingsChanged);
  }, [settings, originalSettings]);

  const handleServiceToggle = useCallback((serviceKey: keyof AnalyticsOptOutSettings) => {
    setSettings(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
    
    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [errors.length]);

  const handleGlobalOptOut = async (optOut: boolean) => {
    const newSettings = Object.keys(settings).reduce((acc, key) => ({
      ...acc,
      [key]: !optOut // If opting out globally, set all to false (opted out)
    }), {} as AnalyticsOptOutSettings);

    setSettings(newSettings);
    setIsGlobalOptOut(optOut);
    setShowGlobalOptOut(false);
  };

  const handleCategoryToggle = (category: string, enable: boolean) => {
    const categoryServices = ANALYTICS_SERVICES.filter(service => service.category === category);
    const newSettings = { ...settings };
    
    categoryServices.forEach(service => {
      newSettings[service.key] = enable;
    });
    
    setSettings(newSettings);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setErrors([]);

    try {
      const response = await analyticsOptOutAPI.updateOptOutSettings(settings);
      
      if (response.success && response.data) {
        setOriginalSettings(response.data);
        onSettingsChange?.(response.data);
      } else {
        setErrors(response.errors || [
          { field: 'general', message: 'Failed to save settings', code: 'SAVE_ERROR' }
        ]);
      }
    } catch {
      setErrors([
        { field: 'general', message: 'Network error. Please try again.', code: 'NETWORK_ERROR' }
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setErrors([]);
      const allOptedOut = Object.values(originalSettings).every(value => value === false);
      setIsGlobalOptOut(allOptedOut);
    }
  };

  const getServicesByCategory = (category: string) => {
    return ANALYTICS_SERVICES.filter(service => service.category === category);
  };

  const getCategoryStats = (category: string) => {
    const services = getServicesByCategory(category);
    const enabledCount = services.filter(service => settings[service.key]).length;
    return { total: services.length, enabled: enabledCount };
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalEnabled = Object.values(settings).filter(Boolean).length;
  const totalServices = Object.keys(settings).length;

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Analytics Opt-Out Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Control which analytics and tracking services can collect your data. 
          You can opt out of specific services or disable all analytics entirely.
        </p>
      </div>

      {/* General Errors */}
      {errors.some(e => e.field === 'general') && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                {getFieldError('general')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Current Status
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalEnabled} of {totalServices} services enabled
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                  totalEnabled === 0 ? 'w-0' :
                  totalEnabled === totalServices ? 'w-full' :
                  totalEnabled / totalServices > 0.75 ? 'w-3/4' :
                  totalEnabled / totalServices > 0.5 ? 'w-1/2' :
                  totalEnabled / totalServices > 0.25 ? 'w-1/4' : 'w-1/12'
                }`}
              ></div>
            </div>
          </div>
          
          <button
            onClick={() => setShowGlobalOptOut(true)}
            className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-md transition-colors"
          >
            Global Opt-Out
          </button>
        </div>
      </div>

      {/* Global Opt-Out Modal */}
      {showGlobalOptOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Global Analytics Opt-Out
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will disable all analytics and tracking services. You can still enable individual services later.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleGlobalOptOut(true)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Opt Out of All
              </button>
              <button
                onClick={() => setShowGlobalOptOut(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Services by Category */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const services = getServicesByCategory(category.name);
          const stats = getCategoryStats(category.name);
          
          return (
            <section key={category.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.enabled}/{stats.total} enabled
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCategoryToggle(category.name, true)}
                        className="px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => handleCategoryToggle(category.name, false)}
                        className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {services.map((service) => (
                  <div key={service.key} className="p-4">
                    <label className="flex items-start space-x-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[service.key]}
                        onChange={() => handleServiceToggle(service.key)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{service.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {service.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-7">
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            Data collected:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {service.dataCollected.map((item, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        {settings[service.key] ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={saveSettings}
          disabled={!hasChanges || isSaving}
          className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            !hasChanges || isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Saving...
            </span>
          ) : hasChanges ? (
            'Save Changes'
          ) : (
            'No Changes'
          )}
        </button>
        
        {hasChanges && (
          <button
            onClick={resetSettings}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Reset Changes
          </button>
        )}
      </div>

      {/* Privacy Information */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          About Analytics Opt-Out
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          Disabling analytics services may affect some website functionality, personalization features, and our ability to improve the site. 
          Essential technical services like error tracking may still operate for security and functionality purposes.
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Changes take effect immediately and are synchronized across all your devices. You can modify these settings at any time.
        </p>
      </div>

      {/* Do Not Track Notice */}
      {isGlobalOptOut && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                Global Opt-Out Active
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                All analytics and tracking services are disabled. We respect your privacy choice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}