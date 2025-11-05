// ============================================================================
// FOOTER UTILITIES AND HELPERS
// ============================================================================

import { format } from 'date-fns';

// ============================================================================
// GDPR AND PRIVACY HELPERS
// ============================================================================

/**
 * Check if user is in EU and requires GDPR compliance
 */
export const isEUUser = (): boolean => {
  // This would typically use IP geolocation or user preference
  // For now, return true to show GDPR compliance by default
  return true;
};

/**
 * Get GDPR compliance text based on user location
 */
export const getGDPRText = (): string => {
  if (isEUUser()) {
    return 'We comply with GDPR regulations. Your data is protected under EU law.';
  }
  return 'We are committed to protecting your privacy and personal data.';
};

/**
 * Get cookie consent status
 */
export const getCookieConsent = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cookieConsent') === 'true';
  }
  return false;
};

/**
 * Set cookie consent status
 */
export const setCookieConsent = (consent: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cookieConsent', consent.toString());
  }
};

// ============================================================================
// NEWSLETTER HELPERS
// ============================================================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if email is already subscribed (mock function)
 */
export const checkEmailSubscription = async (email: string): Promise<boolean> => {
  // This would typically call your API
  // For demo purposes, simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock: emails ending with 'test' are considered already subscribed
  return email.includes('test');
};

/**
 * Subscribe email to newsletter (mock function)
 */
export const subscribeToNewsletter = async (
  email: string, 
  preferences?: {
    categories?: string[];
    frequency?: 'daily' | 'weekly' | 'monthly';
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate email
    if (!isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check if already subscribed
    const isAlreadySubscribed = await checkEmailSubscription(email);
    if (isAlreadySubscribed) {
      return { success: false, message: 'Email already subscribed' };
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log subscription (in real app, this would be sent to your backend)
    console.log('Newsletter subscription:', {
      email,
      timestamp: new Date().toISOString(),
      preferences,
    });

    return { success: true, message: 'Successfully subscribed to newsletter' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
};

// ============================================================================
// SOCIAL MEDIA HELPERS
// ============================================================================

/**
 * Generate social media share URLs
 */
export const getSocialShareUrl = (
  platform: string, 
  url: string, 
  title?: string, 
  description?: string
): string => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || '');
  const encodedDescription = encodeURIComponent(description || '');

  const shareUrls: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`,
  };

  return shareUrls[platform] || url;
};

/**
 * Track social media click (analytics helper)
 */
export const trackSocialClick = (platform: string, location: 'footer' | 'header' | 'article'): void => {
  // This would integrate with your analytics service
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // Google Analytics 4 event tracking
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag('event', 'social_click', {
      platform,
      location,
      timestamp: Date.now(),
    });
  }

  // Console log for development
  console.log('Social media click tracked:', { platform, location });
};

// ============================================================================
// LANGUAGE AND REGION HELPERS
// ============================================================================

/**
 * Get browser's preferred language
 */
export const getBrowserLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return navigator.language.split('-')[0] || 'en';
  }
  return 'en';
};

/**
 * Get user's region based on browser/IP (mock implementation)
 */
export const getUserRegion = async (): Promise<string> => {
  try {
    // In a real app, you might use a geolocation API
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Simple mapping based on timezone
    if (timezone.includes('America/')) return 'us';
    if (timezone.includes('Europe/')) return 'eu';
    if (timezone.includes('Asia/')) return 'asia';
    if (timezone.includes('Australia/')) return 'au';
    
    return 'global';
  } catch (error) {
    console.error('Error detecting user region:', error);
    return 'global';
  }
};

/**
 * Format date according to user's locale
 */
export const formatDateForLocale = (
  date: Date, 
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
};

// ============================================================================
// COPYRIGHT AND LEGAL HELPERS
// ============================================================================

/**
 * Generate copyright text with current year
 */
export const getCopyrightText = (companyName: string = 'News Website'): string => {
  const currentYear = new Date().getFullYear();
  return `© ${currentYear} ${companyName}. All rights reserved.`;
};

/**
 * Check if terms of service need to be updated
 */
export const checkTermsUpdate = (): { needsUpdate: boolean; lastUpdated?: string } => {
  const lastAccepted = localStorage.getItem('termsAcceptedDate');
  const termsLastUpdated = '2024-01-01'; // This would come from your backend
  
  if (!lastAccepted) {
    return { needsUpdate: true };
  }
  
  const acceptedDate = new Date(lastAccepted);
  const updatedDate = new Date(termsLastUpdated);
  
  return {
    needsUpdate: acceptedDate < updatedDate,
    lastUpdated: format(updatedDate, 'MMM dd, yyyy'),
  };
};

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Generate accessible aria-label for social media links
 */
export const getSocialAriaLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    facebook: 'Visit our Facebook page (opens in new window)',
    twitter: 'Follow us on Twitter (opens in new window)',
    instagram: 'Follow us on Instagram (opens in new window)',
    linkedin: 'Connect with us on LinkedIn (opens in new window)',
    youtube: 'Subscribe to our YouTube channel (opens in new window)',
    telegram: 'Join our Telegram channel (opens in new window)',
  };
  
  return labels[platform] || `Visit our ${platform} page (opens in new window)`;
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// ============================================================================
// PERFORMANCE HELPERS
// ============================================================================

/**
 * Lazy load social media widgets
 */
export const loadSocialWidget = async (platform: string): Promise<void> => {
  // This would dynamically load social media SDKs only when needed
  console.log(`Loading ${platform} widget...`);
  
  // Example: Load Facebook SDK
  if (platform === 'facebook' && !document.getElementById('facebook-jssdk')) {
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
    script.async = true;
    document.body.appendChild(script);
  }
};

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

/**
 * Track footer link clicks
 */
export const trackFooterClick = (linkText: string, destination: string): void => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag('event', 'footer_link_click', {
      link_text: linkText,
      destination,
      timestamp: Date.now(),
    });
  }
  
  console.log('Footer link clicked:', { linkText, destination });
};

/**
 * Track newsletter signup attempts
 */
export const trackNewsletterSignup = (success: boolean, error?: string): void => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag('event', 'newsletter_signup', {
      success,
      error: error || null,
      timestamp: Date.now(),
    });
  }
  
  console.log('Newsletter signup tracked:', { success, error });
};

// ============================================================================
// EXPORTS
// ============================================================================

const footerUtils = {
  // GDPR
  isEUUser,
  getGDPRText,
  getCookieConsent,
  setCookieConsent,
  
  // Newsletter
  isValidEmail,
  checkEmailSubscription,
  subscribeToNewsletter,
  
  // Social Media
  getSocialShareUrl,
  trackSocialClick,
  getSocialAriaLabel,
  
  // Localization
  getBrowserLanguage,
  getUserRegion,
  formatDateForLocale,
  
  // Legal
  getCopyrightText,
  checkTermsUpdate,
  
  // Accessibility
  prefersReducedMotion,
  
  // Performance
  loadSocialWidget,
  
  // Analytics
  trackFooterClick,
  trackNewsletterSignup,
};

export default footerUtils;