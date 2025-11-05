'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../lib/routing';
import { locales, localeConfig, type Locale, isRtlLocale } from '../i18n/request';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'inline';
}

export default function LanguageSwitcher({
  className = '',
  showLabel = true,
  variant = 'dropdown',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale() as Locale;
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const router = useRouter();

  const currentLocaleConfig = localeConfig[locale];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(
      // @ts-expect-error -- Type error with pathname routing, but functionality works
      pathname, 
      { locale: newLocale }
    );
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, newLocale: Locale) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLocaleChange(newLocale);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              loc === locale
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={`${t('currentLanguage', { language: localeConfig[loc].nativeName })}`}
          >
            <span className="mr-1">{localeConfig[loc].flag}</span>
            {localeConfig[loc].nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('languageSelector')}
      >
        <LanguageIcon className="h-5 w-5" />
        {showLabel && (
          <>
            <span className="hidden sm:inline">{currentLocaleConfig.flag}</span>
            <span className="hidden md:inline">{currentLocaleConfig.nativeName}</span>
          </>
        )}
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 ${
            isRtlLocale(locale) ? 'left-0' : 'right-0'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {locales.map((loc) => {
              const config = localeConfig[loc];
              const isActive = loc === locale;
              
              return (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  onKeyDown={(e) => handleKeyDown(e, loc)}
                  className={`${
                    isActive
                      ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm transition-colors ${
                    isRtlLocale(loc) ? 'text-right' : 'text-left'
                  }`}
                  role="menuitem"
                  dir={isRtlLocale(loc) ? 'rtl' : 'ltr'}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="mr-3 text-lg">{config.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.nativeName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {config.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}