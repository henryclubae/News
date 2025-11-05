'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';

// ============================================================================
// SEARCH BAR COMPONENT INTERFACES
// ============================================================================

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'suggestion' | 'article' | 'category' | 'author';
  category?: string;
  count?: number;
  metadata?: {
    articleId?: string;
    categoryId?: string;
    authorId?: string;
  };
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount?: number;
}

export interface SearchBarProps {
  placeholder?: string;
  categories?: Category[];
  suggestions?: SearchSuggestion[];
  recentSearches?: SearchHistoryItem[];
  isLoading?: boolean;
  showCategories?: boolean;
  showHistory?: boolean;
  maxSuggestions?: number;
  maxHistoryItems?: number;
  debounceMs?: number;
  className?: string;
  onSearch: (query: string, category?: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onCategoryChange?: (categoryId: string) => void;
  onClear?: () => void;
  getSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

// Debounced search hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search history management hook
function useSearchHistory(maxItems = 10) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage on mount
    try {
      const saved = localStorage.getItem('news-search-history');
      if (saved) {
        const parsed: SearchHistoryItem[] = JSON.parse(saved);
        const mappedHistory = parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        
        // Use a timeout to avoid direct setState in effect
        const timeoutId = setTimeout(() => {
          setHistory(mappedHistory);
        }, 0);
        
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  const addToHistory = useCallback((query: string, resultsCount?: number) => {
    if (query.trim().length < 2) return;

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
      resultsCount,
    };

    setHistory(prev => {
      const filtered = prev.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      const updated = [newItem, ...filtered].slice(0, maxItems);
      
      // Save to localStorage
      try {
        localStorage.setItem('news-search-history', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save search history:', error);
      }
      
      return updated;
    });
  }, [maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('news-search-history');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('news-search-history', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to update search history:', error);
      }
      return updated;
    });
  }, []);

  return { history, addToHistory, clearHistory, removeFromHistory };
}

// ============================================================================
// MAIN SEARCH BAR COMPONENT
// ============================================================================

export function SearchBar({
  placeholder = 'Search news articles...',
  categories = [],
  suggestions: externalSuggestions = [],
  recentSearches: externalRecentSearches,
  isLoading = false,
  showCategories = true,
  showHistory = true,
  maxSuggestions = 8,
  maxHistoryItems = 5,
  debounceMs = 300,
  className = '',
  onSearch,
  onSuggestionSelect,
  onCategoryChange,
  onClear,
  getSuggestions,
}: SearchBarProps) {
  // State management
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [internalSuggestions, setInternalSuggestions] = useState<SearchSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const debouncedQuery = useDebounce(query, debounceMs);
  const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory(maxHistoryItems);

  // Use external recent searches if provided, otherwise use internal history
  const recentSearches = externalRecentSearches || history;

  // Memoized suggestions list
  const suggestions = useMemo(() => {
    if (getSuggestions) {
      return internalSuggestions;
    }
    return externalSuggestions;
  }, [getSuggestions, internalSuggestions, externalSuggestions]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length > 1 && getSuggestions) {
      let isCancelled = false;
      
      const fetchSuggestions = async () => {
        if (!isCancelled) setIsFetchingSuggestions(true);
        
        try {
          const result = await getSuggestions(debouncedQuery);
          if (!isCancelled) {
            setInternalSuggestions(result.slice(0, maxSuggestions));
          }
        } catch (error) {
          if (!isCancelled) {
            console.warn('Failed to fetch suggestions:', error);
            setInternalSuggestions([]);
          }
        } finally {
          if (!isCancelled) {
            setIsFetchingSuggestions(false);
          }
        }
      };
      
      fetchSuggestions();
      
      return () => {
        isCancelled = true;
      };
    } else {
      setInternalSuggestions([]);
      setIsFetchingSuggestions(false);
    }
  }, [debouncedQuery, getSuggestions, maxSuggestions]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  // Handle search execution
  const executeSearch = useCallback((searchQuery?: string, category?: string) => {
    const finalQuery = searchQuery || query;
    const finalCategory = category || selectedCategory;

    if (finalQuery.trim()) {
      addToHistory(finalQuery.trim());
      onSearch(finalQuery.trim(), finalCategory || undefined);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [query, selectedCategory, onSearch, addToHistory]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      executeSearch(suggestion.text);
    }
  }, [executeSearch, onSuggestionSelect]);

  // Handle history item selection
  const handleHistorySelect = useCallback((historyItem: SearchHistoryItem) => {
    setQuery(historyItem.query);
    executeSearch(historyItem.query);
  }, [executeSearch]);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId);
  }, [onCategoryChange]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedCategory('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    onClear?.();
  }, [onClear]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const historyItems = showHistory && query.length < 2 ? recentSearches : [];
    const totalItems = suggestions.length + historyItems.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < historyItems.length) {
            // History item selected
            const historyItem = historyItems[selectedIndex];
            handleHistorySelect(historyItem);
          } else {
            // Suggestion item selected
            const suggestionIndex = selectedIndex - historyItems.length;
            if (suggestionIndex < suggestions.length) {
              handleSuggestionSelect(suggestions[suggestionIndex]);
            }
          }
        } else {
          executeSearch();
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [suggestions, recentSearches, showHistory, query.length, selectedIndex, handleSuggestionSelect, handleHistorySelect, executeSearch]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown items
  const showSuggestions = query.length > 1 && suggestions.length > 0;
  const showRecentSearches = showHistory && query.length < 2 && recentSearches.length > 0;
  const showDropdown = isOpen && (showSuggestions || showRecentSearches);

  return (
    <div className={`relative w-full max-w-2xl ${className}`} ref={dropdownRef}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Category Filter */}
        {showCategories && categories.length > 0 && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-sm bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 pr-6"
              aria-label="Category filter"
            >
              <option value="">All</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`
            w-full h-12 px-4 pr-12 text-gray-900 dark:text-white
            bg-white dark:bg-gray-800 
            border border-gray-300 dark:border-gray-600
            rounded-lg shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-500 dark:placeholder-gray-400
            transition-all duration-200
            ${showCategories && categories.length > 0 ? 'pl-20' : ''}
          `}
          aria-label="Search"
          aria-expanded={showDropdown ? "true" : "false"}
          aria-haspopup="listbox"
          aria-controls={showDropdown ? 'search-dropdown' : undefined}
          role="combobox"
          aria-activedescendant={selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined}
        />

        {/* Loading Spinner */}
        {(isLoading || isFetchingSuggestions) && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => executeSearch()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            id="search-dropdown"
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            role="listbox"
          >
            {/* Recent Searches */}
            {showRecentSearches && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Recent Searches
                  </span>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {recentSearches.slice(0, maxHistoryItems).map((item, index) => (
                  <button
                    key={item.id}
                    id={`search-item-${index}`}
                    onClick={() => handleHistorySelect(item)}
                    className={`
                      w-full flex items-center px-3 py-2 text-left rounded-md transition-colors duration-150
                      ${selectedIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <ClockIcon className="w-4 h-4 mr-3 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.query}</div>
                      {item.resultsCount !== undefined && (
                        <div className="text-xs text-gray-500">
                          {item.resultsCount} results
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Remove from history"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="p-2">
                {showRecentSearches && <div className="border-t border-gray-200 dark:border-gray-700 my-2" />}
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => {
                  const adjustedIndex = showRecentSearches ? index + recentSearches.length : index;
                  return (
                    <button
                      key={suggestion.id}
                      id={`search-item-${adjustedIndex}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`
                        w-full flex items-center px-3 py-2 text-left rounded-md transition-colors duration-150
                        ${selectedIndex === adjustedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-3 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{suggestion.text}</div>
                        {suggestion.category && (
                          <div className="text-xs text-gray-500">
                            in {suggestion.category}
                          </div>
                        )}
                      </div>
                      {suggestion.count && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {suggestion.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;