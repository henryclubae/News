/**
 * Cookie Configuration Data
 * Defines all cookie categories and individual cookies used by the application
 */

import { CookieCategory, CookiePolicyData } from '@/types/cookie-consent';

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    title: 'Strictly Necessary Cookies',
    description: 'These cookies are essential for the website to function properly and cannot be disabled. They are usually set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
    required: true,
    cookies: [
      {
        name: 'gdpr-cookie-consent',
        purpose: 'Stores your cookie consent preferences',
        duration: '1 year',
        category: 'necessary',
        provider: 'News Website',
        isEssential: true
      },
      {
        name: 'next-auth.session-token',
        purpose: 'Maintains your login session',
        duration: 'Session / 30 days',
        category: 'necessary',
        provider: 'NextAuth.js',
        isEssential: true
      },
      {
        name: 'theme-preference',
        purpose: 'Remembers your light/dark theme preference',
        duration: '1 year',
        category: 'necessary',
        provider: 'News Website',
        isEssential: true
      },
      {
        name: 'language-preference',
        purpose: 'Stores your selected language',
        duration: '1 year',
        category: 'necessary',
        provider: 'News Website',
        isEssential: true
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and content.',
    cookies: [
      {
        name: '_ga',
        purpose: 'Distinguishes unique users and sessions',
        duration: '2 years',
        category: 'analytics',
        provider: 'Google Analytics'
      },
      {
        name: '_ga_*',
        purpose: 'Used by Google Analytics to collect data on visitor behavior',
        duration: '2 years',
        category: 'analytics',
        provider: 'Google Analytics'
      },
      {
        name: '_gid',
        purpose: 'Distinguishes unique users',
        duration: '24 hours',
        category: 'analytics',
        provider: 'Google Analytics'
      },
      {
        name: '_gat',
        purpose: 'Throttles request rate to Google Analytics',
        duration: '1 minute',
        category: 'analytics',
        provider: 'Google Analytics'
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Cookies',
    description: 'These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.',
    cookies: [
      {
        name: '_fbp',
        purpose: 'Stores and tracks visits across websites for Facebook advertising',
        duration: '3 months',
        category: 'marketing',
        provider: 'Facebook'
      },
      {
        name: 'fr',
        purpose: 'Contains browser and user unique ID for targeted advertising',
        duration: '3 months',
        category: 'marketing',
        provider: 'Facebook'
      },
      {
        name: '_gcl_au',
        purpose: 'Used by Google AdSense to experiment with advertisement efficiency',
        duration: '3 months',
        category: 'marketing',
        provider: 'Google AdSense'
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preference Cookies',
    description: 'These cookies allow our website to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced, more personal features.',
    cookies: [
      {
        name: 'user-preferences',
        purpose: 'Stores your personalized content preferences',
        duration: '1 year',
        category: 'preferences',
        provider: 'News Website'
      },
      {
        name: 'reading-history',
        purpose: 'Tracks articles you have read for personalized recommendations',
        duration: '6 months',
        category: 'preferences',
        provider: 'News Website'
      },
      {
        name: 'newsletter-settings',
        purpose: 'Remembers your newsletter subscription preferences',
        duration: '1 year',
        category: 'preferences',
        provider: 'News Website'
      }
    ]
  }
];

export const COOKIE_POLICY_DATA: CookiePolicyData = {
  lastUpdated: '2024-11-06',
  contactEmail: 'privacy@newswebsite.com',
  companyName: 'News Website Ltd.',
  privacyPolicyUrl: '/privacy-policy',
  categories: COOKIE_CATEGORIES
};

/**
 * Get cookie information by name
 */
export function getCookieInfo(cookieName: string) {
  for (const category of COOKIE_CATEGORIES) {
    const cookie = category.cookies.find(c => c.name === cookieName || c.name.includes('*') && cookieName.startsWith(c.name.replace('*', '')));
    if (cookie) {
      return { ...cookie, category: category.id };
    }
  }
  return null;
}

/**
 * Get all cookies for a specific category
 */
export function getCookiesByCategory(categoryId: string) {
  const category = COOKIE_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.cookies : [];
}