import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales configuration
export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ar'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

// Locale configuration with detailed metadata
export const localeConfig = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h' as const,
    currency: 'USD',
    numberFormat: 'en-US',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr' as const,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h' as const,
    currency: 'EUR',
    numberFormat: 'es-ES',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr' as const,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h' as const,
    currency: 'EUR',
    numberFormat: 'fr-FR',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr' as const,
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h' as const,
    currency: 'EUR',
    numberFormat: 'de-DE',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr' as const,
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h' as const,
    currency: 'CNY',
    numberFormat: 'zh-CN',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl' as const,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h' as const,
    currency: 'SAR',
    numberFormat: 'ar-SA',
  },
} as const;

// Utility functions
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getLocaleConfig(locale: Locale) {
  return localeConfig[locale];
}

// Next-intl configuration
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  try {
    const messages = await import(`../messages/${locale}.json`);
    
    return {
      locale,
      messages: messages.default,
      timeZone: 'UTC',
      now: new Date(),
      formats: {
        dateTime: {
          short: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          },
          long: {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          },
          full: {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short',
          },
        },
        number: {
          currency: {
            style: 'currency',
            currency: getLocaleConfig(locale as Locale).currency,
          },
          percent: {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
          },
        },
      },
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }
});