'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PrivacySettings, FormValidationError } from '@/types/cookie-consent';
import { privacySettingsAPI } from '@/lib/privacy-api';

interface PrivacySettingsPanelProps {
  userId?: string;
  onSettingsChange?: (settings: PrivacySettings) => void;
  className?: string;
}

const COMMUNICATION_TYPES = [
  { id: 'newsletter', label: 'Newsletter', description: 'Weekly news updates and featured articles' },
  { id: 'notifications', label: 'Push Notifications', description: 'App notifications and alerts' },
  { id: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional offers and marketing content' },
  { id: 'productUpdates', label: 'Product Updates', description: 'New features and service announcements' },
  { id: 'breaking_news', label: 'Breaking News', description: 'Urgent news alerts and notifications' },
  { id: 'personalized', label: 'Personalized Content', description: 'Content recommendations based on your interests' },
  { id: 'promotional', label: 'Promotional', description: 'Special offers and partner promotions' },
] as const;

const DATA_COLLECTION_TYPES = [
  { id: 'analytics', label: 'Analytics', description: 'Usage statistics and performance metrics' },
  { id: 'personalization', label: 'Personalization', description: 'Content and ad customization data' },
  { id: 'location', label: 'Location Data', description: 'Geographic information for local content' },
  { id: 'device_info', label: 'Device Information', description: 'Browser and device specifications' },
  { id: 'behavioral', label: 'Behavioral Data', description: 'Reading patterns and interaction data' },
] as const;

const ACTIVITY_LOG_OPTIONS = [
  { value: '30_days', label: '30 Days', description: 'Delete activity logs after 30 days' },
  { value: '90_days', label: '90 Days', description: 'Delete activity logs after 90 days' },
  { value: '1_year', label: '1 Year', description: 'Delete activity logs after 1 year' },
  { value: 'indefinite', label: 'Keep Until Deleted', description: 'Retain logs until manually deleted' },
] as const;

const USER_CONTENT_OPTIONS = [
  { value: 'never_delete', label: 'Never Delete', description: 'Keep user content permanently' },
  { value: '1_year', label: '1 Year', description: 'Delete user content after 1 year' },
  { value: '2_years', label: '2 Years', description: 'Delete user content after 2 years' },
  { value: '5_years', label: '5 Years', description: 'Delete user content after 5 years' },
] as const;

const ANALYTICS_DATA_OPTIONS = [
  { value: '6_months', label: '6 Months', description: 'Delete analytics data after 6 months' },
  { value: '1_year', label: '1 Year', description: 'Delete analytics data after 1 year' },
  { value: '2_years', label: '2 Years', description: 'Delete analytics data after 2 years' },
] as const;

const PROFILE_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Visible to all users' },
  { value: 'limited', label: 'Limited', description: 'Visible to approved users only' },
  { value: 'private', label: 'Private', description: 'Only visible to you' },
] as const;

export default function PrivacySettingsPanel({
  userId,
  onSettingsChange,
  className = ''
}: PrivacySettingsPanelProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: {
      analytics: false,
      personalization: false,
      marketing: false,
      research: false,
      location: false,
      device_info: false,
      behavioral: false,
    },
    communications: {
      newsletter: false,
      notifications: false,
      marketingEmails: false,
      productUpdates: false,
      breaking_news: false,
      personalized: false,
      promotional: false,
    },
    dataRetention: {
      activityLogs: '30_days' as const,
      userContent: '1_year' as const,
      analyticsData: '6_months' as const,
    },
    visibility: {
      profileVisibility: 'private' as const,
      activityVisibility: 'private' as const,
      searchIndexing: false,
    },
    profileVisibility: 'private' as const,
    thirdPartySharing: false,
    updatedAt: new Date().toISOString(),
  });

  const [originalSettings, setOriginalSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await privacySettingsAPI.getSettings(userId);
        if (response.success && response.data) {
          setSettings(response.data);
          setOriginalSettings(response.data);
          setLastSaved(response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleString() : 'Never');
        }
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
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

  const validateSettings = useCallback((): FormValidationError[] => {
    const validationErrors: FormValidationError[] = [];

    // Check if at least some communication method is enabled for important updates
    const hasEssentialComms = settings.communications.breaking_news || 
                             settings.communications.productUpdates;
    
    if (!hasEssentialComms) {
      validationErrors.push({
        field: 'communications',
        message: 'We recommend enabling breaking news or product updates for important information',
        code: 'RECOMMENDATION'
      });
    }

    return validationErrors;
  }, [settings]);

  const handleDataCollectionToggle = (type: keyof PrivacySettings['dataCollection']) => {
    setSettings(prev => ({
      ...prev,
      dataCollection: {
        ...prev.dataCollection,
        [type]: !prev.dataCollection[type]
      }
    }));
  };

  const handleCommunicationToggle = (type: keyof PrivacySettings['communications']) => {
    setSettings(prev => ({
      ...prev,
      communications: {
        ...prev.communications,
        [type]: !prev.communications[type]
      }
    }));
  };

  const handleDataRetentionChange = (
    key: keyof PrivacySettings['dataRetention'], 
    value: string
  ) => {
    setSettings(prev => ({
      ...prev,
      dataRetention: {
        ...prev.dataRetention,
        [key]: value
      }
    }));
  };

  const handleVisibilityChange = (visibility: PrivacySettings['profileVisibility']) => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  const handleThirdPartyToggle = () => {
    setSettings(prev => ({
      ...prev,
      thirdPartySharing: !prev.thirdPartySharing
    }));
  };

  const saveSettings = async () => {
    const validationErrors = validateSettings();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    setIsSaving(true);
    setErrors([]);

    try {
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };

      const response = await privacySettingsAPI.updateSettings(updatedSettings);
      
      if (response.success && response.data) {
        setSettings(response.data);
        setOriginalSettings(response.data);
        setLastSaved(new Date().toLocaleString());
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
    }
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Privacy Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage how your data is collected, used, and shared. Changes are saved automatically.
        </p>
        {lastSaved && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last saved: {lastSaved}
          </p>
        )}
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

      <div className="space-y-8">
        {/* Data Collection Preferences */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Data Collection Preferences
          </h3>
          <div className="space-y-4">
            {DATA_COLLECTION_TYPES.map((type) => (
              <label key={type.id} className="flex items-start space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.dataCollection[type.id]}
                  onChange={() => handleDataCollectionToggle(type.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Communication Preferences */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Communication Preferences
          </h3>
          <div className="space-y-4">
            {COMMUNICATION_TYPES.map((type) => (
              <label key={type.id} className="flex items-start space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.communications[type.id]}
                  onChange={() => handleCommunicationToggle(type.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {getFieldError('communications') && (
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {getFieldError('communications')}
            </p>
          )}
        </section>

        {/* Data Retention */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Data Retention Periods
          </h3>
          
          {/* Activity Logs */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
              Activity Logs
            </h4>
            <div className="space-y-2">
              {ACTIVITY_LOG_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="activityLogs"
                    value={option.value}
                    checked={settings.dataRetention.activityLogs === option.value}
                    onChange={(e) => handleDataRetentionChange('activityLogs', e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* User Content */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
              User Content
            </h4>
            <div className="space-y-2">
              {USER_CONTENT_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="userContent"
                    value={option.value}
                    checked={settings.dataRetention.userContent === option.value}
                    onChange={(e) => handleDataRetentionChange('userContent', e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Analytics Data */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
              Analytics Data
            </h4>
            <div className="space-y-2">
              {ANALYTICS_DATA_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="analyticsData"
                    value={option.value}
                    checked={settings.dataRetention.analyticsData === option.value}
                    onChange={(e) => handleDataRetentionChange('analyticsData', e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Profile Visibility */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Profile Visibility
          </h3>
          <div className="space-y-3">
            {PROFILE_VISIBILITY_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={settings.profileVisibility === option.value}
                  onChange={(e) => handleVisibilityChange(e.target.value as PrivacySettings['profileVisibility'])}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Third-Party Data Sharing */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Third-Party Data Sharing
          </h3>
          <label className="flex items-start space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={settings.thirdPartySharing}
              onChange={handleThirdPartyToggle}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                Allow Third-Party Data Sharing
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Share anonymized data with trusted partners for research and analytics purposes
              </div>
            </div>
          </label>
        </section>
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
          Your Privacy Rights
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          You have the right to access, modify, or delete your personal data at any time. 
          These settings help you control how we use your information while providing you with a personalized experience.
        </p>
      </div>
    </div>
  );
}