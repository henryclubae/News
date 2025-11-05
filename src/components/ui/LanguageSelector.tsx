'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../../lib/routing';
import { locales, localeConfig, type Locale, isRtlLocale } from '../../i18n/request';
import { 
  ChevronDownIcon, 
  LanguageIcon, 
  CheckIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'compact' | 'expanded';
  showLabel?: boolean;
  showFlag?: boolean;
  position?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onLanguageChange?: (locale: Locale) => void;
}

interface LanguageChangeState {
  isLoading: boolean;
  targetLocale: Locale | null;
}

export default function LanguageSelector({
  className = '',
  variant = 'dropdown',
  showLabel = true,
  showFlag = true,
  position = 'right',
  size = 'md',
  disabled = false,
  onLanguageChange,
}: LanguageSelectorProps) {
  // Hooks
  const locale = useLocale() as Locale;
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const router = useRouter();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [languageChangeState, setLanguageChangeState] = useState<LanguageChangeState>({
    isLoading: false,
    targetLocale: null,
  });

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get current locale configuration
  const currentLocaleConfig = localeConfig[locale];

  // Persistence utilities
  const saveLanguagePreference = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem('preferred-language', newLocale);
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }, []);

  const loadLanguagePreference = useCallback((): Locale | null => {
    try {
      // Check localStorage first
      const stored = localStorage.getItem('preferred-language');
      if (stored && locales.includes(stored as Locale)) {
        return stored as Locale;
      }
      
      // Check cookie as fallback
      const cookieMatch = document.cookie.match(/locale=([^;]+)/);
      if (cookieMatch && locales.includes(cookieMatch[1] as Locale)) {
        return cookieMatch[1] as Locale;
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
    return null;
  }, []);

  // Update document language attribute
  const updateDocumentLanguage = useCallback((newLocale: Locale) => {
    try {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = isRtlLocale(newLocale) ? 'rtl' : 'ltr';
    } catch (error) {
      console.warn('Failed to update document language:', error);
    }
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback(async (newLocale: Locale) => {
    if (newLocale === locale || disabled || languageChangeState.isLoading) {
      return;
    }

    try {
      // Set loading state
      setLanguageChangeState({
        isLoading: true,
        targetLocale: newLocale,
      });

      // Save preference
      saveLanguagePreference(newLocale);

      // Update document immediately for better UX
      updateDocumentLanguage(newLocale);

      // Call custom handler if provided
      onLanguageChange?.(newLocale);

      // Navigate to new locale
      router.replace(
        // @ts-expect-error -- Routing works but has type issues
        pathname,
        { locale: newLocale }
      );

      // Close dropdown
      setIsOpen(false);
      setSelectedIndex(-1);

    } catch (error) {
      console.error('Language change failed:', error);
      // Reset loading state on error
      setLanguageChangeState({
        isLoading: false,
        targetLocale: null,
      });
      // Restore original language
      updateDocumentLanguage(locale);
    }
  }, [
    locale,
    disabled,
    languageChangeState.isLoading,
    pathname,
    router,
    saveLanguagePreference,
    updateDocumentLanguage,
    onLanguageChange,
  ]);

  // Load saved preference on mount
  useEffect(() => {
    const savedLocale = loadLanguagePreference();
    if (savedLocale && savedLocale !== locale) {
      // Optionally auto-switch to saved preference
      // handleLanguageChange(savedLocale);
    }
  }, [locale, loadLanguagePreference]);

  // Reset loading state when locale actually changes
  useEffect(() => {
    if (languageChangeState.targetLocale === locale) {
      // Use a timeout to avoid synchronous state updates in effects
      const timeoutId = setTimeout(() => {
        setLanguageChangeState({
          isLoading: false,
          targetLocale: null,
        });
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [locale, languageChangeState.targetLocale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(0);
        } else if (selectedIndex >= 0) {
          const targetLocale = locales[selectedIndex];
          handleLanguageChange(targetLocale);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        triggerRef.current?.focus();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(0);
        } else {
          setSelectedIndex(prev => (prev + 1) % locales.length);
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(locales.length - 1);
        } else {
          setSelectedIndex(prev => prev <= 0 ? locales.length - 1 : prev - 1);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        if (isOpen) {
          setSelectedIndex(0);
        }
        break;
        
      case 'End':
        event.preventDefault();
        if (isOpen) {
          setSelectedIndex(locales.length - 1);
        }
        break;
    }
  }, [disabled, isOpen, selectedIndex, handleLanguageChange]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    setSelectedIndex(isOpen ? -1 : 0);
  }, [disabled, isOpen]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          trigger: 'px-2 py-1 text-xs',
          flag: 'text-sm',
          icon: 'w-3 h-3',
        };
      case 'lg':
        return {
          trigger: 'px-4 py-3 text-base',
          flag: 'text-lg',
          icon: 'w-6 h-6',
        };
      default:
        return {
          trigger: 'px-3 py-2 text-sm',
          flag: 'text-base',
          icon: 'w-4 h-4',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          ref={triggerRef}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled || languageChangeState.isLoading}
          className={`
            inline-flex items-center justify-center rounded-lg
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
            hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-transparent transition-all duration-200
            ${sizeClasses.trigger}
            ${disabled || languageChangeState.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={t('languageSelector')}
        >
          {languageChangeState.isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`border-2 border-blue-500 border-t-transparent rounded-full ${sizeClasses.icon}`}
            />
          ) : (
            <>
              {showFlag && (
                <span className={`${sizeClasses.flag} mr-1`}>
                  {currentLocaleConfig.flag}
                </span>
              )}
              <span className="font-medium">{locale.toUpperCase()}</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`
                absolute z-50 mt-2 min-w-max bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
                ${position === 'left' ? 'left-0' : position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}
              `}
            >
              <div
                ref={listRef}
                role="listbox"
                aria-label="Language options"
                className="py-1"
              >
                {locales.map((loc, index) => {
                  const config = localeConfig[loc];
                  const isActive = loc === locale;
                  const isSelected = selectedIndex === index;
                  
                  return (
                    <div
                      key={loc}
                      role="option"
                      aria-selected={isActive}
                      className={`
                        flex items-center px-3 py-2 cursor-pointer transition-colors
                        ${isSelected || isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                        ${isRtlLocale(loc) ? 'text-right' : 'text-left'}
                      `}
                      dir={isRtlLocale(loc) ? 'rtl' : 'ltr'}
                      onClick={() => handleLanguageChange(loc)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLanguageChange(loc);
                        }
                      }}
                      tabIndex={0}
                    >
                      <span className="text-base mr-2">{config.flag}</span>
                      <span className="font-medium">{config.nativeName}</span>
                      {isActive && (
                        <CheckIcon className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded variant (shows all languages inline)
  if (variant === 'expanded') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {locales.map((loc) => {
          const config = localeConfig[loc];
          const isActive = loc === locale;
          const isLoading = languageChangeState.isLoading && languageChangeState.targetLocale === loc;
          
          return (
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
              disabled={disabled || languageChangeState.isLoading}
              className={`
                inline-flex items-center rounded-md font-medium transition-all duration-200
                ${sizeClasses.trigger}
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${disabled || languageChangeState.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              aria-label={`${t('currentLanguage', { language: config.nativeName })}${isActive ? ' (current)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className={`border-2 border-white border-t-transparent rounded-full ${sizeClasses.icon} mr-1`}
                />
              ) : (
                showFlag && (
                  <span className={`${sizeClasses.flag} mr-1`}>{config.flag}</span>
                )
              )}
              <span className="truncate">
                {showLabel ? config.nativeName : loc.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled || languageChangeState.isLoading}
        className={`
          inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
          hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 ${sizeClasses.trigger}
          ${disabled || languageChangeState.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('languageSelector')}
      >
        {languageChangeState.isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`border-2 border-blue-500 border-t-transparent rounded-full ${sizeClasses.icon} mr-2`}
          />
        ) : (
          <GlobeAltIcon className={`${sizeClasses.icon} mr-2`} />
        )}
        
        {showFlag && !languageChangeState.isLoading && (
          <span className={`${sizeClasses.flag} mr-2`}>
            {currentLocaleConfig.flag}
          </span>
        )}
        
        {showLabel && (
          <span className="font-medium mr-2 hidden sm:inline">
            {currentLocaleConfig.nativeName}
          </span>
        )}
        
        <span className="font-medium mr-2 sm:hidden">
          {locale.toUpperCase()}
        </span>
        
        <ChevronDownIcon 
          className={`${sizeClasses.icon} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 mt-2 w-64 bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
              ${position === 'left' ? 'left-0' : position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}
            `}
          >
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('languageSelector')}
              </p>
            </div>
            
            <div
              ref={listRef}
              role="listbox"
              aria-label="Language options"
              className="py-1 max-h-64 overflow-y-auto"
            >
              {locales.map((loc, index) => {
                const config = localeConfig[loc];
                const isActive = loc === locale;
                const isSelected = selectedIndex === index;
                const isTargetLoading = languageChangeState.isLoading && languageChangeState.targetLocale === loc;
                
                return (
                  <div
                    key={loc}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleLanguageChange(loc)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleLanguageChange(loc);
                      }
                    }}
                    tabIndex={0}
                    className={`
                      flex items-center px-3 py-2 cursor-pointer transition-colors
                      ${isSelected || isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      ${isRtlLocale(loc) ? 'text-right' : 'text-left'}
                      ${languageChangeState.isLoading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    dir={isRtlLocale(loc) ? 'rtl' : 'ltr'}
                  >
                    {isTargetLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-3"
                      />
                    ) : (
                      <span className="text-lg mr-3">{config.flag}</span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{config.nativeName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {config.name}
                      </div>
                    </div>
                    
                    {isActive && !isTargetLoading && (
                      <CheckIcon className="w-4 h-4 ml-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}