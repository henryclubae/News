'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ConsentRecord } from '@/types/cookie-consent';
import { consentManagerAPI } from '@/lib/privacy-api';

interface ConsentManagerProps {
  userId?: string;
  onConsentChange?: (consents: ConsentRecord[]) => void;
  className?: string;
}

const CONSENT_TYPES = {
  necessary: { label: 'Necessary Cookies', color: 'gray', canWithdraw: false },
  functional: { label: 'Functional Cookies', color: 'blue', canWithdraw: true },
  analytics: { label: 'Analytics Cookies', color: 'green', canWithdraw: true },
  marketing: { label: 'Marketing Cookies', color: 'purple', canWithdraw: true },
  personalization: { label: 'Personalization', color: 'indigo', canWithdraw: true },
  data_processing: { label: 'Data Processing', color: 'yellow', canWithdraw: true },
} as const;

const STATUS_COLORS = {
  granted: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
  denied: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
  withdrawn: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
  pending: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
} as const;

export default function ConsentManager({
  userId,
  onConsentChange,
  className = ''
}: ConsentManagerProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renewalPrompt, setRenewalPrompt] = useState<ConsentRecord | null>(null);

  const loadConsents = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await consentManagerAPI.getConsentHistory(userId);
      if (response.success && response.data) {
        setConsents(response.data);
        
        // Check for expired consents
        const expiredConsents = response.data.filter(consent => {
          if (!consent.expiresAt) return false;
          return new Date(consent.expiresAt) < new Date() && consent.status === 'granted';
        });
        
        if (expiredConsents.length > 0) {
          setRenewalPrompt(expiredConsents[0]);
        }
        
        onConsentChange?.(response.data);
      } else {
        setError(response.error || 'Failed to load consent history');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, onConsentChange]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const handleWithdrawConsent = async (consentType: string) => {
    setIsWithdrawing(consentType);
    setError(null);

    try {
      const response = await consentManagerAPI.withdrawConsent(userId || '', consentType);
      
      if (response.success) {
        await loadConsents(); // Reload to get updated status
      } else {
        setError(response.error || 'Failed to withdraw consent');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsWithdrawing(null);
    }
  };

  const handleRenewConsent = async (consentType: string) => {
    try {
      const response = await consentManagerAPI.renewConsent(userId || '', consentType);
      
      if (response.success) {
        setRenewalPrompt(null);
        await loadConsents();
      } else {
        setError(response.error || 'Failed to renew consent');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const getLatestConsentForType = (consentType: string): ConsentRecord | null => {
    const typeConsents = consents.filter(c => c.consentType === consentType);
    if (typeConsents.length === 0) return null;
    
    return typeConsents.reduce((latest, current) => 
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );
  };

  const getConsentHistory = (consentType: string): ConsentRecord[] => {
    return consents
      .filter(c => c.consentType === consentType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (consent: ConsentRecord): boolean => {
    if (!consent.expiresAt || consent.status !== 'granted') return false;
    
    const expiryDate = new Date(consent.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const consentTypes = Object.keys(CONSENT_TYPES) as Array<keyof typeof CONSENT_TYPES>;

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Consent Manager
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your consent preferences. You can withdraw consent at any time.
        </p>
      </div>

      {/* Renewal Prompt */}
      {renewalPrompt && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Consent Renewal Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Your consent for {CONSENT_TYPES[renewalPrompt.consentType as keyof typeof CONSENT_TYPES]?.label} has expired. 
                Please renew your consent to continue using related features.
              </p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => handleRenewConsent(renewalPrompt.consentType)}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Renew Consent
                </button>
                <button
                  onClick={() => setRenewalPrompt(null)}
                  className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Consent Status Cards */}
      <div className="space-y-4">
        {consentTypes.map((consentType) => {
          const latestConsent = getLatestConsentForType(consentType);
          const consentConfig = CONSENT_TYPES[consentType];
          const history = getConsentHistory(consentType);
          const isExpiring = latestConsent ? isExpiringSoon(latestConsent) : false;

          return (
            <div key={consentType} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {consentConfig.label}
                      </h3>
                      {latestConsent && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[latestConsent.status]}`}>
                          {latestConsent.status.charAt(0).toUpperCase() + latestConsent.status.slice(1)}
                        </span>
                      )}
                      {isExpiring && (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 rounded-full">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    
                    {latestConsent ? (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Last updated: {formatDate(latestConsent.timestamp)}</p>
                        {latestConsent.expiresAt && (
                          <p>Expires: {formatDate(latestConsent.expiresAt)}</p>
                        )}
                        {latestConsent.purpose && (
                          <p className="mt-1">Purpose: {latestConsent.purpose}</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                        No consent record found
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {history.length > 0 && (
                      <button
                        onClick={() => setShowHistory(showHistory === consentType ? null : consentType)}
                        className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        {showHistory === consentType ? 'Hide' : 'Show'} History
                      </button>
                    )}

                    {latestConsent?.status === 'granted' && consentConfig.canWithdraw && (
                      <button
                        onClick={() => handleWithdrawConsent(consentType)}
                        disabled={isWithdrawing === consentType}
                        className={`px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-md transition-colors ${
                          isWithdrawing === consentType ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isWithdrawing === consentType ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}

                    {!consentConfig.canWithdraw && (
                      <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* History Section */}
              {showHistory === consentType && history.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Consent History
                    </h4>
                    <div className="space-y-3">
                      {history.map((record) => (
                        <div key={record.id} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[record.status]}`}>
                                {record.status}
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatDate(record.timestamp)}
                              </span>
                            </div>
                            {record.purpose && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {record.purpose}
                              </p>
                            )}
                          </div>
                          
                          {record.expiresAt && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              Expires: {formatDate(record.expiresAt)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      {consents.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {consents.filter(c => c.status === 'granted').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {consents.filter(c => c.status === 'denied' || c.status === 'withdrawn').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Denied/Withdrawn</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {consents.filter(c => c.expiresAt && isExpiringSoon(c)).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {new Set(consents.map(c => c.consentType)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>
        </div>
      )}

      {/* Information Footer */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          About Consent Management
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          You have full control over your consent preferences. Withdrawing consent will not affect 
          the lawfulness of processing based on consent before its withdrawal. Some consents may 
          be required for core functionality and cannot be withdrawn.
        </p>
      </div>
    </div>
  );
}