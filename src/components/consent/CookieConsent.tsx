'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CookiePreferences, ConsentData } from '@/types/cookie-consent';
import { 
  getStoredConsent, 
  storeConsent, 
  clearAllConsent, 
  getDefaultPreferences,
  hasValidConsent,
  loadConsentBasedScripts,
  logConsentChange
} from '@/lib/cookie-utils';
import { COOKIE_CATEGORIES } from '@/data/cookie-config';
import CookieBanner from './CookieBanner';
import PreferenceCenter from './PreferenceCenter';
import CookieSettings from './CookieSettings';

interface CookieConsentProps {
  className?: string;
}

export default function CookieConsent({ className = '' }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(getDefaultPreferences());
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize consent state on component mount
  useEffect(() => {
    const initializeConsent = () => {
      const existingConsent = getStoredConsent();
      
      if (existingConsent) {
        setPreferences(existingConsent.preferences);
        setConsentData(existingConsent);
        loadConsentBasedScripts(existingConsent.preferences);
      } else {
        setShowBanner(true);
      }
      
      setIsLoaded(true);
    };

    // Delay initialization to avoid hydration issues
    const timer = setTimeout(initializeConsent, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle accept all cookies
  const handleAcceptAll = useCallback(() => {
    const allAcceptedPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    const newConsentData = storeConsent(allAcceptedPreferences);
    setPreferences(allAcceptedPreferences);
    setConsentData(newConsentData);
    setShowBanner(false);
    
    loadConsentBasedScripts(allAcceptedPreferences);
    logConsentChange('accepted', allAcceptedPreferences, newConsentData.consentId);
  }, []);

  // Handle reject all cookies (except necessary)
  const handleRejectAll = useCallback(() => {
    const rejectedPreferences = getDefaultPreferences(); // Only necessary = true
    
    const newConsentData = storeConsent(rejectedPreferences);
    setPreferences(rejectedPreferences);
    setConsentData(newConsentData);
    setShowBanner(false);
    
    // Clear existing non-essential cookies
    clearAllConsent();
    logConsentChange('rejected', rejectedPreferences, newConsentData.consentId);
  }, []);

  // Handle customize preferences
  const handleCustomize = useCallback(() => {
    setShowBanner(false);
    setShowPreferences(true);
  }, []);

  // Handle save custom preferences
  const handleSavePreferences = useCallback((customPreferences: CookiePreferences) => {
    const newConsentData = storeConsent(customPreferences);
    setPreferences(customPreferences);
    setConsentData(newConsentData);
    setShowPreferences(false);
    
    loadConsentBasedScripts(customPreferences);
    logConsentChange('modified', customPreferences, newConsentData.consentId);
  }, []);

  // Handle withdraw consent (data deletion)
  const handleWithdrawConsent = useCallback(() => {
    const defaultPrefs = getDefaultPreferences();
    clearAllConsent();
    setPreferences(defaultPrefs);
    setConsentData(null);
    setShowSettings(false);
    setShowBanner(true);
    
    logConsentChange('withdrawn', defaultPrefs);
  }, []);

  // Handle opening settings from external trigger
  useEffect(() => {
    const handleOpenCookieSettings = () => {
      setShowSettings(true);
    };

    // Listen for custom event to open cookie settings
    window.addEventListener('openCookieSettings', handleOpenCookieSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
  }, []);

  // Don't render anything during SSR or before initialization
  if (!isLoaded) {
    return null;
  }

  return (
    <div className={`cookie-consent-container ${className}`}>
      {/* Cookie Banner */}
      {showBanner && (
        <CookieBanner
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onCustomize={handleCustomize}
          onClose={() => setShowBanner(false)}
        />
      )}

      {/* Preference Center Modal */}
      {showPreferences && (
        <PreferenceCenter
          preferences={preferences}
          categories={COOKIE_CATEGORIES}
          onSave={handleSavePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Cookie Settings Modal */}
      {showSettings && consentData && (
        <CookieSettings
          preferences={preferences}
          consentData={consentData}
          categories={COOKIE_CATEGORIES}
          onUpdatePreferences={handleSavePreferences}
          onWithdrawConsent={handleWithdrawConsent}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Cookie Settings Trigger Button (for pages) */}
      <CookieSettingsTrigger onClick={() => setShowSettings(true)} />
    </div>
  );
}

/**
 * Floating cookie settings button
 */
function CookieSettingsTrigger({ onClick }: { onClick: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check consent status on mount
    const checkConsent = () => {
      setShow(hasValidConsent());
    };
    
    checkConsent();
    
    // Listen for storage changes to update visibility
    window.addEventListener('storage', checkConsent);
    return () => window.removeEventListener('storage', checkConsent);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
      aria-label="Open cookie settings"
      title="Cookie Settings"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    </button>
  );
}

/**
 * Hook for accessing cookie consent state in other components
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>(getDefaultPreferences());

  useEffect(() => {
    const updateConsent = () => {
      const currentConsent = getStoredConsent();
      setConsent(currentConsent);
      if (currentConsent) {
        setPreferences(currentConsent.preferences);
      }
    };

    updateConsent();
    
    // Listen for storage changes (consent updates in other tabs)
    window.addEventListener('storage', updateConsent);
    return () => window.removeEventListener('storage', updateConsent);
  }, []);

  const openSettings = useCallback(() => {
    window.dispatchEvent(new Event('openCookieSettings'));
  }, []);

  return {
    consent,
    preferences,
    hasConsent: hasValidConsent(),
    openSettings
  };
}