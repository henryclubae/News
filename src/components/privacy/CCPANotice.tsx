'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CCPANoticeData, FormValidationError } from '@/types/cookie-consent';
import { ccpaAPI, privacyUtils } from '@/lib/privacy-api';

interface CCPANoticeProps {
  onOptOutSubmitted?: (success: boolean) => void;
  className?: string;
}

const PERSONAL_INFO_CATEGORIES = [
  { 
    key: 'identifiers' as keyof CCPANoticeData['categories'], 
    label: 'Identifiers', 
    description: 'Name, email, IP address, device identifiers',
    examples: ['Email addresses', 'IP addresses', 'Cookie IDs', 'Device fingerprints']
  },
  { 
    key: 'personalRecords' as keyof CCPANoticeData['categories'], 
    label: 'Personal Records', 
    description: 'Contact info, account details, preferences',
    examples: ['Contact information', 'Account settings', 'User preferences', 'Profile data']
  },
  { 
    key: 'commercialInfo' as keyof CCPANoticeData['categories'], 
    label: 'Commercial Information', 
    description: 'Purchase history, browsing behavior, interests',
    examples: ['Reading history', 'Content preferences', 'Subscription data', 'Usage patterns']
  },
  { 
    key: 'internetActivity' as keyof CCPANoticeData['categories'], 
    label: 'Internet Activity', 
    description: 'Browsing history, search history, website interactions',
    examples: ['Page views', 'Click patterns', 'Time on site', 'Navigation paths']
  },
  { 
    key: 'geolocationData' as keyof CCPANoticeData['categories'], 
    label: 'Geolocation Data', 
    description: 'Location information from IP address or device',
    examples: ['City/region', 'Country', 'Time zone', 'General location data']
  },
  { 
    key: 'profileInferences' as keyof CCPANoticeData['categories'], 
    label: 'Profile Inferences', 
    description: 'Preferences and characteristics derived from your activity',
    examples: ['Content recommendations', 'Interest categories', 'Behavioral predictions', 'Personalization data']
  },
] as const;

export default function CCPANotice({
  onOptOutSubmitted,
  className = ''
}: CCPANoticeProps) {
  const [ccpaData, setCcpaData] = useState<CCPANoticeData>({
    isCaliforniaResident: false,
    personalInfoSold: false,
    personalInfoShared: false,
    optOutRequests: 0,
    lastOptOutDate: undefined,
    categories: {
      identifiers: false,
      personalRecords: false,
      commercialInfo: false,
      biometricInfo: false,
      internetActivity: false,
      geolocationData: false,
      sensoryInfo: false,
      professionalInfo: false,
      educationInfo: false,
      profileInferences: false,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptOutForm, setShowOptOutForm] = useState(false);
  const [optOutForm, setOptOutForm] = useState({
    email: '',
    fullName: '',
    confirmResident: false,
    requestType: 'do_not_sell' as 'do_not_sell' | 'delete_data' | 'know_data',
  });
  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [optOutSuccess, setOptOutSuccess] = useState(false);

  // Load CCPA data and detect California residence
  useEffect(() => {
    const loadCCPAData = async () => {
      try {
        // Check if user is in California
        const isInCA = await privacyUtils.detectCaliforniaUser();
        
        const response = await ccpaAPI.getNoticeData();
        if (response.success && response.data) {
          setCcpaData({
            ...response.data,
            isCaliforniaResident: isInCA
          });
        } else {
          // Set default data with CA detection
          setCcpaData(prev => ({
            ...prev,
            isCaliforniaResident: isInCA
          }));
        }
      } catch (error) {
        console.error('Failed to load CCPA data:', error);
        // Try to detect California anyway
        try {
          const isInCA = await privacyUtils.detectCaliforniaUser();
          setCcpaData(prev => ({ ...prev, isCaliforniaResident: isInCA }));
        } catch {
          // Default to showing notice if detection fails
          setCcpaData(prev => ({ ...prev, isCaliforniaResident: true }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCCPAData();
  }, []);

  const validateOptOutForm = useCallback((): FormValidationError[] => {
    const validationErrors: FormValidationError[] = [];

    if (!optOutForm.email.trim()) {
      validationErrors.push({
        field: 'email',
        message: 'Email address is required',
        code: 'REQUIRED'
      });
    } else if (!privacyUtils.validateEmail(optOutForm.email)) {
      validationErrors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT'
      });
    }

    if (!optOutForm.fullName.trim()) {
      validationErrors.push({
        field: 'fullName',
        message: 'Full name is required',
        code: 'REQUIRED'
      });
    }

    if (!optOutForm.confirmResident) {
      validationErrors.push({
        field: 'confirmResident',
        message: 'Please confirm you are a California resident',
        code: 'REQUIRED'
      });
    }

    return validationErrors;
  }, [optOutForm]);

  const handleOptOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateOptOutForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await ccpaAPI.submitDoNotSellRequest(optOutForm.email);

      if (response.success) {
        setOptOutSuccess(true);
        setShowOptOutForm(false);
        onOptOutSubmitted?.(true);
        
        // Refresh CCPA data
        const updatedResponse = await ccpaAPI.getNoticeData();
        if (updatedResponse.success && updatedResponse.data) {
          setCcpaData(prev => ({ ...prev, ...updatedResponse.data }));
        }
      } else {
        setErrors(response.errors || [
          { field: 'general', message: response.error || 'Failed to submit request', code: 'SUBMISSION_FAILED' }
        ]);
      }
    } catch {
      setErrors([
        { field: 'general', message: 'Network error. Please try again.', code: 'NETWORK_ERROR' }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  // Don't show if not a California resident and not in loading state
  if (!isLoading && !ccpaData.isCaliforniaResident) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* CCPA Notice */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border-l-4 border-blue-500">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              California Consumer Privacy Act (CCPA) Notice
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              As a California resident, you have specific rights regarding your personal information under the CCPA. 
              We are committed to protecting your privacy and respecting these rights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Rights Include:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Right to know what personal information we collect</li>
                  <li>• Right to know if we sell or share your information</li>
                  <li>• Right to opt-out of the sale of personal information</li>
                  <li>• Right to delete your personal information</li>
                  <li>• Right to non-discrimination for exercising your rights</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Status:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Personal info sold:</span>
                    <span className={ccpaData.personalInfoSold ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                      {ccpaData.personalInfoSold ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Personal info shared:</span>
                    <span className={ccpaData.personalInfoShared ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                      {ccpaData.personalInfoShared ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Opt-out requests:</span>
                    <span className="text-gray-900 dark:text-white">{ccpaData.optOutRequests}</span>
                  </div>
                  {ccpaData.lastOptOutDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last opt-out:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(ccpaData.lastOptOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success Message */}
            {optOutSuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your CCPA request has been successfully submitted. You will receive a confirmation email shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowOptOutForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Do Not Sell My Info
              </button>
              
              <button
                onClick={() => {
                  setOptOutForm(prev => ({ ...prev, requestType: 'delete_data' }));
                  setShowOptOutForm(true);
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete My Data
              </button>
              
              <button
                onClick={() => {
                  setOptOutForm(prev => ({ ...prev, requestType: 'know_data' }));
                  setShowOptOutForm(true);
                }}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Know My Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Categories */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories of Personal Information We Collect
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAL_INFO_CATEGORIES.map((category) => (
            <div key={category.key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {category.label}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  ccpaData.categories[category.key] 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {ccpaData.categories[category.key] ? 'Collected' : 'Not Collected'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {category.description}
              </p>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-500">Examples:</div>
                {category.examples.map((example, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    • {example}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opt-Out Form Modal */}
      {showOptOutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                CCPA Request
              </h3>
              <button
                onClick={() => setShowOptOutForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close dialog"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* General Errors */}
            {errors.some(e => e.field === 'general') && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
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

            <form onSubmit={handleOptOutSubmit} className="space-y-4">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requestType"
                      value="do_not_sell"
                      checked={optOutForm.requestType === 'do_not_sell'}
                      onChange={(e) => setOptOutForm(prev => ({ ...prev, requestType: e.target.value as 'do_not_sell' | 'delete_data' | 'know_data' }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">Do Not Sell My Information</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requestType"
                      value="delete_data"
                      checked={optOutForm.requestType === 'delete_data'}
                      onChange={(e) => setOptOutForm(prev => ({ ...prev, requestType: e.target.value as 'do_not_sell' | 'delete_data' | 'know_data' }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">Delete My Personal Information</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requestType"
                      value="know_data"
                      checked={optOutForm.requestType === 'know_data'}
                      onChange={(e) => setOptOutForm(prev => ({ ...prev, requestType: e.target.value as 'do_not_sell' | 'delete_data' | 'know_data' }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">Know What Information You Have</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="ccpa-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="ccpa-email"
                  value={optOutForm.email}
                  onChange={(e) => setOptOutForm(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    getFieldError('email') ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="your@email.com"
                />
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError('email')}
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="ccpa-fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="ccpa-fullName"
                  value={optOutForm.fullName}
                  onChange={(e) => setOptOutForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    getFieldError('fullName') ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Your full name"
                />
                {getFieldError('fullName') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError('fullName')}
                  </p>
                )}
              </div>

              {/* California Resident Confirmation */}
              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optOutForm.confirmResident}
                    onChange={(e) => setOptOutForm(prev => ({ ...prev, confirmResident: e.target.checked }))}
                    className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 ${
                      getFieldError('confirmResident') ? 'border-red-300 dark:border-red-600' : ''
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      California Resident Confirmation *
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      I confirm that I am a California resident and have the right to make this request under the CCPA
                    </div>
                  </div>
                </label>
                {getFieldError('confirmResident') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError('confirmResident')}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowOptOutForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}