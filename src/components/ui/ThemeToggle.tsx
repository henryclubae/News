'use client';

import React, { useState, useEffect } from 'react';
import { useCustomTheme } from '../providers/ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// THEME TOGGLE BUTTON COMPONENT
// ============================================================================

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = 'default', 
  showLabel = false,
  className = '' 
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useCustomTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
    );
  }

  const themes = [
    { value: 'light', icon: SunIcon, label: 'Light' },
    { value: 'dark', icon: MoonIcon, label: 'Dark' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
  ];

  const currentThemeIndex = themes.findIndex(t => t.value === theme);
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length];

  const handleToggle = () => {
    setTheme(nextTheme.value);
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggle}
        className={`
          inline-flex items-center justify-center w-9 h-9 
          rounded-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          ${className}
        `}
        aria-label={`Switch to ${nextTheme.label} theme`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'light' && <SunIcon className="w-4 h-4" />}
            {theme === 'dark' && <MoonIcon className="w-4 h-4" />}
            {theme === 'system' && <ComputerDesktopIcon className="w-4 h-4" />}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              inline-flex items-center px-3 py-2 text-sm font-medium
              first:rounded-l-lg last:rounded-r-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-all duration-200 ease-in-out
              ${
                theme === value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            aria-label={`Switch to ${label} theme`}
            aria-pressed={theme === value}
          >
            <Icon className="w-4 h-4" />
            {showLabel && <span className="ml-2">{label}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Default variant - dropdown style
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className={`
          inline-flex items-center px-4 py-2 text-sm font-medium
          rounded-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
        `}
        aria-label={`Current theme: ${theme}. Click to cycle themes.`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {theme === 'light' && <SunIcon className="w-4 h-4" />}
            {theme === 'dark' && <MoonIcon className="w-4 h-4" />}
            {theme === 'system' && <ComputerDesktopIcon className="w-4 h-4" />}
            {showLabel && (
              <span className="ml-2 capitalize">
                {theme} {resolvedTheme !== theme && `(${resolvedTheme})`}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  );
}

// ============================================================================
// THEME SELECTOR DROPDOWN
// ============================================================================

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
    );
  }

  const themes = [
    { value: 'light', icon: SunIcon, label: 'Light Mode' },
    { value: 'dark', icon: MoonIcon, label: 'Dark Mode' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium
          rounded-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
        `}
  aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center">
          <currentTheme.icon className="w-4 h-4" />
          <span className="ml-2">{currentTheme.label}</span>
          {resolvedTheme !== theme && (
            <span className="ml-1 text-xs text-gray-500">({resolvedTheme})</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute right-0 mt-2 w-48 
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-lg z-50
            `}
          >
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm
                  first:rounded-t-lg last:rounded-b-lg
                  text-left hover:bg-gray-50 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700
                  transition-colors duration-150
                  ${
                    theme === value
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="ml-3">{label}</span>
                {theme === value && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default ThemeToggle;