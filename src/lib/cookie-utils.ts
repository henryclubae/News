/**
 * Cookie Consent Utilities
 * Handles local storage, consent tracking, and cookie management
 */

import { CookiePreferences, ConsentData } from '@/types/cookie-consent';
import { getAnalytics } from '@/lib/analytics';

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = 'gdpr-cookie-consent';
const CONSENT_VERSION = '1.0.0';

/**
 * Generate unique consent ID
 */
export function generateConsentId(): string {
  return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get stored consent data
 */
export function getStoredConsent(): ConsentData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as ConsentData;
    
    // Check if consent is still valid (version match)
    if (data.version !== CONSENT_VERSION) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading consent data:', error);
    return null;
  }
}

/**
 * Store consent data
 */
export function storeConsent(preferences: CookiePreferences): ConsentData {
  const consentData: ConsentData = {
    preferences,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
    consentId: generateConsentId(),
    userAgent: navigator.userAgent,
  };
  
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
  } catch (error) {
    console.error('Error storing consent data:', error);
  }
  
  return consentData;
}

/**
 * Clear all consent data and cookies
 */
export function clearAllConsent(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove consent data
    localStorage.removeItem(CONSENT_KEY);
    
    // Remove all non-essential cookies
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Don't remove essential cookies
      if (!isEssentialCookie(name)) {
        // Remove cookie from all possible domains and paths
        const domains = [window.location.hostname, `.${window.location.hostname}`];
        const paths = ['/', window.location.pathname];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=${path}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
          });
        });
      }
    });
    
    // Clear local storage items (except essential ones)
    Object.keys(localStorage).forEach(key => {
      if (!isEssentialLocalStorageItem(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear session storage
    sessionStorage.clear();
    
  } catch (error) {
    console.error('Error clearing consent data:', error);
  }
}

/**
 * Check if a cookie is essential
 */
function isEssentialCookie(name: string): boolean {
  const essentialCookies = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'session-id',
    'language-preference',
    'theme-preference',
    CONSENT_KEY
  ];
  
  return essentialCookies.some(essential => name.includes(essential));
}

/**
 * Check if a localStorage item is essential
 */
function isEssentialLocalStorageItem(key: string): boolean {
  const essentialItems = [
    CONSENT_KEY,
    'theme-preference',
    'language-preference',
    'accessibility-settings'
  ];
  
  return essentialItems.includes(key);
}

/**
 * Get default cookie preferences
 */
export function getDefaultPreferences(): CookiePreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  };
}

/**
 * Check if user has given consent
 */
export function hasValidConsent(): boolean {
  const consent = getStoredConsent();
  return consent !== null;
}

/**
 * Load and apply external scripts based on consent
 */
export function loadConsentBasedScripts(preferences: CookiePreferences): void {
  // Initialize analytics with privacy settings
  const analytics = getAnalytics();
  if (analytics) {
    // Set user consent preferences
    if (preferences.analytics) {
      analytics.setUserId(`user_${Date.now()}`);
    }
    
    // Track consent choices for analytics
    analytics.trackCustomEvent({
      event_name: 'consent_updated',
      event_category: 'privacy',
      event_label: 'cookie_preferences',
      custom_parameters: {
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        preferences: preferences.preferences,
        necessary: preferences.necessary
      }
    });
  }
  
  // Google Analytics
  if (preferences.analytics) {
    loadGoogleAnalytics();
  } else {
    // Disable Google Analytics if consent withdrawn
    disableGoogleAnalytics();
  }
  
  // Marketing scripts
  if (preferences.marketing) {
    loadMarketingScripts();
  }
  
  // Preference-based scripts
  if (preferences.preferences) {
    loadPreferenceScripts();
  }
}

/**
 * Load Google Analytics
 */
function loadGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-528699TFSJ';
  
  // Check if already loaded
  if (typeof window.gtag !== 'undefined') return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  script.onload = () => {
    // Initialize Google Analytics dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) { 
      window.dataLayer.push(args); 
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', measurementId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=Strict;Secure',
      send_page_view: false // Let our analytics system handle page views
    });
    
    // Enable analytics collection
    gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  };
}

/**
 * Disable Google Analytics
 */
function disableGoogleAnalytics(): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Disable analytics collection
  window.gtag('consent', 'update', {
    analytics_storage: 'denied'
  });
}

/**
 * Load marketing scripts
 */
function loadMarketingScripts(): void {
  // Facebook Pixel, advertising scripts etc.
  console.log('Loading marketing scripts...');
}

/**
 * Load preference scripts
 */
function loadPreferenceScripts(): void {
  // User preference tracking, personalization scripts
  console.log('Loading preference scripts...');
}

/**
 * Create audit log entry for consent changes
 */
export function logConsentChange(
  action: 'accepted' | 'rejected' | 'modified' | 'withdrawn',
  preferences: CookiePreferences,
  consentId?: string
): void {
  const logEntry = {
    action,
    preferences,
    consentId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // In a real application, send this to your backend for audit logging
  console.log('Consent audit log:', logEntry);
  
  // Store in sessionStorage for debugging (remove in production)
  try {
    const existingLogs = JSON.parse(sessionStorage.getItem('consent-audit-logs') || '[]');
    existingLogs.push(logEntry);
    sessionStorage.setItem('consent-audit-logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error storing audit log:', error);
  }
}