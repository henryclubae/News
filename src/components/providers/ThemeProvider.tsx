'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

// ============================================================================
// THEME TYPES & INTERFACES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
  themes: Theme[];
  defaultTheme: Theme;
  enableSystem: boolean;
  disableTransitionOnChange: boolean;
  storageKey: string;
  attribute: 'data-theme' | 'class';
}

interface CustomThemeContextType {
  // Theme state
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  systemTheme: string | undefined;
  
  // Theme utilities
  toggleTheme: () => void;
  isLight: boolean;
  isDark: boolean;
  isSystem: boolean;
  
  // Animation controls
  enableTransitions: () => void;
  disableTransitions: () => void;
  
  // Theme switching with animation
  switchTheme: (newTheme: Theme) => void;
}

// ============================================================================
// THEME CONTEXT
// ============================================================================

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(
  undefined
);

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

const defaultThemeConfig: ThemeConfig = {
  themes: ['light', 'dark', 'system'],
  defaultTheme: 'system',
  enableSystem: true,
  disableTransitionOnChange: false,
  storageKey: 'news-website-theme',
  attribute: 'data-theme',
};

// ============================================================================
// CSS VARIABLES FOR THEMES
// ============================================================================

const themeVariables = {
  light: {
    // Primary Colors
    '--color-primary': '220 38% 44%',
    '--color-primary-foreground': '210 40% 98%',
    '--color-primary-hover': '220 38% 38%',
    
    // Secondary Colors
    '--color-secondary': '210 40% 96%',
    '--color-secondary-foreground': '222.2 84% 4.9%',
    '--color-secondary-hover': '210 40% 92%',
    
    // Background Colors
    '--color-background': '0 0% 100%',
    '--color-background-secondary': '210 40% 98%',
    '--color-background-tertiary': '210 40% 96%',
    '--color-surface': '0 0% 100%',
    '--color-surface-hover': '210 40% 98%',
    
    // Text Colors
    '--color-foreground': '222.2 84% 4.9%',
    '--color-text-primary': '222.2 84% 4.9%',
    '--color-text-secondary': '215.4 16.3% 46.9%',
    '--color-text-tertiary': '215.4 16.3% 56.9%',
    '--color-text-muted': '215.4 16.3% 46.9%',
    
    // Border Colors
    '--color-border': '214.3 31.8% 91.4%',
    '--color-border-hover': '214.3 31.8% 81.4%',
    '--color-input': '214.3 31.8% 91.4%',
    '--color-ring': '220 38% 44%',
    
    // Accent Colors
    '--color-accent': '210 40% 96%',
    '--color-accent-foreground': '222.2 84% 4.9%',
    '--color-accent-hover': '210 40% 92%',
    
    // Muted Colors
    '--color-muted': '210 40% 96%',
    '--color-muted-foreground': '215.4 16.3% 46.9%',
    
    // Destructive Colors
    '--color-destructive': '0 84.2% 60.2%',
    '--color-destructive-foreground': '210 40% 98%',
    '--color-destructive-hover': '0 84.2% 55.2%',
    
    // Success Colors
    '--color-success': '142.1 76.2% 36.3%',
    '--color-success-foreground': '355.7 100% 97.3%',
    '--color-success-hover': '142.1 76.2% 31.3%',
    
    // Warning Colors
    '--color-warning': '32.1 94.6% 43.7%',
    '--color-warning-foreground': '355.7 100% 97.3%',
    '--color-warning-hover': '32.1 94.6% 38.7%',
    
    // Info Colors
    '--color-info': '221.2 83.2% 53.3%',
    '--color-info-foreground': '210 40% 98%',
    '--color-info-hover': '221.2 83.2% 48.3%',
    
    // Card & Popover
    '--color-card': '0 0% 100%',
    '--color-card-foreground': '222.2 84% 4.9%',
    '--color-popover': '0 0% 100%',
    '--color-popover-foreground': '222.2 84% 4.9%',
    
    // Shadows
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  dark: {
    // Primary Colors
    '--color-primary': '210 40% 98%',
    '--color-primary-foreground': '222.2 84% 4.9%',
    '--color-primary-hover': '210 40% 92%',
    
    // Secondary Colors
    '--color-secondary': '217.2 32.6% 17.5%',
    '--color-secondary-foreground': '210 40% 98%',
    '--color-secondary-hover': '217.2 32.6% 22.5%',
    
    // Background Colors
    '--color-background': '222.2 84% 4.9%',
    '--color-background-secondary': '217.2 32.6% 17.5%',
    '--color-background-tertiary': '215 27.9% 16.9%',
    '--color-surface': '222.2 84% 4.9%',
    '--color-surface-hover': '217.2 32.6% 17.5%',
    
    // Text Colors
    '--color-foreground': '210 40% 98%',
    '--color-text-primary': '210 40% 98%',
    '--color-text-secondary': '215 20.2% 65.1%',
    '--color-text-tertiary': '215 16.3% 56.9%',
    '--color-text-muted': '215 20.2% 65.1%',
    
    // Border Colors
    '--color-border': '217.2 32.6% 17.5%',
    '--color-border-hover': '217.2 32.6% 22.5%',
    '--color-input': '217.2 32.6% 17.5%',
    '--color-ring': '212.7 26.8% 83.9%',
    
    // Accent Colors
    '--color-accent': '217.2 32.6% 17.5%',
    '--color-accent-foreground': '210 40% 98%',
    '--color-accent-hover': '217.2 32.6% 22.5%',
    
    // Muted Colors
    '--color-muted': '217.2 32.6% 17.5%',
    '--color-muted-foreground': '215 20.2% 65.1%',
    
    // Destructive Colors
    '--color-destructive': '0 62.8% 30.6%',
    '--color-destructive-foreground': '210 40% 98%',
    '--color-destructive-hover': '0 62.8% 35.6%',
    
    // Success Colors
    '--color-success': '142.1 70.6% 45.3%',
    '--color-success-foreground': '144.9 80.4% 10%',
    '--color-success-hover': '142.1 70.6% 50.3%',
    
    // Warning Colors
    '--color-warning': '32.1 94.6% 43.7%',
    '--color-warning-foreground': '20.5 90.2% 4.3%',
    '--color-warning-hover': '32.1 94.6% 48.7%',
    
    // Info Colors
    '--color-info': '221.2 83.2% 53.3%',
    '--color-info-foreground': '210 40% 98%',
    '--color-info-hover': '221.2 83.2% 58.3%',
    
    // Card & Popover
    '--color-card': '222.2 84% 4.9%',
    '--color-card-foreground': '210 40% 98%',
    '--color-popover': '222.2 84% 4.9%',
    '--color-popover-foreground': '210 40% 98%',
    
    // Shadows
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
  },
};

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

interface NewsWebsiteThemeProviderProps {
  children: React.ReactNode;
  config?: Partial<ThemeConfig>;
}

export function ThemeProvider({ 
  children, 
  config = {} 
}: NewsWebsiteThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
  
  const finalConfig = { ...defaultThemeConfig, ...config };

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Apply CSS variables based on theme
  useEffect(() => {
    const applyThemeVariables = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (document.documentElement.getAttribute('data-theme') === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const variables = isDark ? themeVariables.dark : themeVariables.light;
      
      Object.entries(variables).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    };

    if (mounted) {
      applyThemeVariables();
      
      // Listen for theme changes
      const observer = new MutationObserver(() => {
        applyThemeVariables();
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        if (document.documentElement.getAttribute('data-theme') === 'system') {
          applyThemeVariables();
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [mounted]);

  // Add transition styles
  useEffect(() => {
    if (mounted) {
      const style = document.createElement('style');
      style.textContent = `
        * {
          transition: ${transitionsEnabled ? 
            'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 
            'none'} !important;
        }
        
        .theme-transition-disabled * {
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [mounted, transitionsEnabled]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      {...finalConfig}
      themes={finalConfig.themes}
      defaultTheme={finalConfig.defaultTheme}
      enableSystem={finalConfig.enableSystem}
      disableTransitionOnChange={!transitionsEnabled}
      storageKey={finalConfig.storageKey}
      attribute={finalConfig.attribute}
    >
      <ThemeContextProvider transitionsEnabled={transitionsEnabled} setTransitionsEnabled={setTransitionsEnabled}>
        {children}
      </ThemeContextProvider>
    </NextThemesProvider>
  );
}

// ============================================================================
// THEME CONTEXT PROVIDER
// ============================================================================

interface ThemeContextProviderProps {
  children: React.ReactNode;
  transitionsEnabled: boolean;
  setTransitionsEnabled: (enabled: boolean) => void;
}

function ThemeContextProvider({ 
  children, 
  setTransitionsEnabled 
}: ThemeContextProviderProps) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  // Theme utilities
  const isLight = resolvedTheme === 'light';
  const isDark = resolvedTheme === 'dark';
  const isSystem = theme === 'system';

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, toggle to the opposite of current resolved theme
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    }
  };

  // Enhanced theme switching with animation control
  const switchTheme = (newTheme: Theme) => {
    // Temporarily disable transitions for instant change
    setTransitionsEnabled(false);
    
    // Apply new theme
    setTheme(newTheme);
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      setTransitionsEnabled(true);
    }, 50);
  };

  // Animation control functions
  const enableTransitions = () => {
    setTransitionsEnabled(true);
    document.documentElement.classList.remove('theme-transition-disabled');
  };

  const disableTransitions = () => {
    setTransitionsEnabled(false);
    document.documentElement.classList.add('theme-transition-disabled');
  };

  const contextValue: CustomThemeContextType = {
    // Theme state
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    
    // Theme utilities
    toggleTheme,
    isLight,
    isDark,
    isSystem,
    
    // Animation controls
    enableTransitions,
    disableTransitions,
    
    // Enhanced theme switching
    switchTheme,
  };

  return (
    <CustomThemeContext.Provider value={contextValue}>
      {children}
    </CustomThemeContext.Provider>
  );
}

// ============================================================================
// THEME HOOK
// ============================================================================

export function useCustomTheme() {
  const context = useContext(CustomThemeContext);
  
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ============================================================================
// THEME TOGGLE HOOK
// ============================================================================

export function useThemeToggle() {
  const { toggleTheme, switchTheme, theme, resolvedTheme } = useCustomTheme();
  
  return {
    toggleTheme,
    switchTheme,
    currentTheme: theme,
    resolvedTheme,
  };
}

// ============================================================================
// THEME DETECTION HOOK
// ============================================================================

export function useThemeDetection() {
  const { theme, resolvedTheme, systemTheme, isLight, isDark, isSystem } = useCustomTheme();
  
  return {
    theme,
    resolvedTheme,
    systemTheme,
    isLight,
    isDark,
    isSystem,
    prefersDark: systemTheme === 'dark',
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeProvider;
export { themeVariables };