import { type Locale, localeConfig } from '../i18n/request';

/**
 * Format a date according to the locale's preferences
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const config = localeConfig[locale];
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(config.numberFormat, defaultOptions).format(dateObj);
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale,
  baseDate: Date = new Date()
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const config = localeConfig[locale];
  
  const rtf = new Intl.RelativeTimeFormat(config.numberFormat, { 
    numeric: 'auto',
    style: 'long' 
  });
  
  const diffInSeconds = Math.floor((dateObj.getTime() - baseDate.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (Math.abs(diffInYears) >= 1) {
    return rtf.format(diffInYears, 'year');
  } else if (Math.abs(diffInMonths) >= 1) {
    return rtf.format(diffInMonths, 'month');
  } else if (Math.abs(diffInWeeks) >= 1) {
    return rtf.format(diffInWeeks, 'week');
  } else if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, 'day');
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, 'hour');
  } else if (Math.abs(diffInMinutes) >= 1) {
    return rtf.format(diffInMinutes, 'minute');
  } else {
    return rtf.format(diffInSeconds, 'second');
  }
}

/**
 * Format a number according to the locale's preferences
 */
export function formatNumber(
  number: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {}
): string {
  const config = localeConfig[locale];
  return new Intl.NumberFormat(config.numberFormat, options).format(number);
}

/**
 * Format currency according to the locale's preferences
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency?: string,
  options: Intl.NumberFormatOptions = {}
): string {
  const config = localeConfig[locale];
  const currencyCode = currency || config.currency;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    ...options,
  };

  return new Intl.NumberFormat(config.numberFormat, defaultOptions).format(amount);
}

/**
 * Format a percentage according to the locale's preferences
 */
export function formatPercentage(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {}
): string {
  const config = localeConfig[locale];
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat(config.numberFormat, defaultOptions).format(value / 100);
}

/**
 * Format time according to the locale's preferences (12h or 24h)
 */
export function formatTime(
  date: Date | string | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const config = localeConfig[locale];
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: config.timeFormat === '12h',
    ...options,
  };

  return new Intl.DateTimeFormat(config.numberFormat, defaultOptions).format(dateObj);
}

/**
 * Format a list of items according to the locale's preferences
 */
export function formatList(
  items: string[],
  locale: Locale,
  options: Intl.ListFormatOptions = {}
): string {
  const config = localeConfig[locale];
  
  const defaultOptions: Intl.ListFormatOptions = {
    style: 'long',
    type: 'conjunction',
    ...options,
  };

  return new Intl.ListFormat(config.numberFormat, defaultOptions).format(items);
}

/**
 * Get the appropriate reading time text based on locale
 */
export function getReadingTimeText(minutes: number, locale: Locale): string {
  // This would typically use translation keys, but for simplicity:
  const readingTimeTexts = {
    en: `${minutes} min read`,
    es: `${minutes} min de lectura`,
    fr: `${minutes} min de lecture`,
    de: `${minutes} Min. Lesezeit`,
    zh: `${minutes} 分钟阅读`,
    ar: `${minutes} دقيقة قراءة`,
  };

  return readingTimeTexts[locale] || readingTimeTexts.en;
}

/**
 * Truncate text with proper ellipsis handling for different locales
 */
export function truncateText(
  text: string,
  maxLength: number,
  locale: Locale
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const ellipsis = locale === 'zh' ? '…' : '...';
  const truncated = text.slice(0, maxLength - ellipsis.length);
  
  // For languages that don't use spaces (like Chinese), don't try to break on words
  if (locale === 'zh') {
    return truncated + ellipsis;
  }
  
  // For other languages, try to break on word boundaries
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    return truncated.slice(0, lastSpaceIndex) + ellipsis;
  }
  
  return truncated + ellipsis;
}

/**
 * Sort strings according to locale-specific collation rules
 */
export function sortStrings(
  strings: string[],
  locale: Locale,
  options: Intl.CollatorOptions = {}
): string[] {
  const config = localeConfig[locale];
  const collator = new Intl.Collator(config.numberFormat, {
    sensitivity: 'base',
    numeric: true,
    ...options,
  });
  
  return [...strings].sort(collator.compare);
}

/**
 * Get locale-specific placeholder text for search inputs
 */
export function getSearchPlaceholder(locale: Locale): string {
  const placeholders = {
    en: 'Search news, topics, or keywords...',
    es: 'Buscar noticias, temas o palabras clave...',
    fr: 'Rechercher des actualités, sujets ou mots-clés...',
    de: 'Nachrichten, Themen oder Schlüsselwörter suchen...',
    zh: '搜索新闻、主题或关键词...',
    ar: 'ابحث عن الأخبار أو المواضيع أو الكلمات الرئيسية...',
  };

  return placeholders[locale] || placeholders.en;
}