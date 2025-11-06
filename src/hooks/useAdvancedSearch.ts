/**
 * useAdvancedSearch Hook
 * 
 * A custom React hook for advanced search functionality
 * Provides search state management and operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SearchQuery,
  SearchResults,
  SearchFilters,
  SearchSort,
  SearchSuggestion,
  VoiceSearchResult,
  SearchHistoryItem,
  SearchAnalytics,
  searchEngine,
  AdvancedSearchEngine
} from '@/lib/search';
import { NewsArticle } from '@/types/news';

export interface UseAdvancedSearchOptions {
  articles: NewsArticle[];
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SearchSort;
  debounceMs?: number;
  enableRealTimeSearch?: boolean;
  enableVoiceSearch?: boolean;
  enableHistory?: boolean;
  enableAnalytics?: boolean;
}

export interface UseAdvancedSearchReturn {
  // State
  query: string;
  results: SearchResults | null;
  loading: boolean;
  error: string | null;
  suggestions: string[];
  autocomplete: SearchSuggestion[];
  showAutocomplete: boolean;
  filters: SearchFilters;
  sort: SearchSort;
  currentPage: number;
  history: SearchHistoryItem[];
  isVoiceSearching: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  search: (searchQuery?: SearchQuery) => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: (key: keyof SearchFilters, value: unknown) => void;
  setSort: (sort: SearchSort) => void;
  setPage: (page: number) => void;
  
  // Autocomplete & Suggestions
  getAutocomplete: (query: string) => Promise<SearchSuggestion[]>;
  getSuggestions: (query: string) => Promise<string[]>;
  selectSuggestion: (suggestion: string) => void;
  
  // Voice Search
  startVoiceSearch: () => Promise<VoiceSearchResult>;
  
  // History
  addToHistory: (query: SearchQuery, resultCount: number) => void;
  selectFromHistory: (historyItem: SearchHistoryItem) => void;
  clearHistory: () => void;
  
  // Analytics
  trackResultClick: (searchId: string, articleId: string) => void;
  getAnalytics: () => SearchAnalytics[];
  getTrendingQueries: (limit?: number) => Array<{ query: string; count: number }>;
  
  // Utilities
  resetSearch: () => void;
  getSearchStatistics: () => Record<string, unknown>;
}

export const useAdvancedSearch = (options: UseAdvancedSearchOptions): UseAdvancedSearchReturn => {
  const {
    articles,
    initialQuery = '',
    initialFilters = {},
    initialSort = { field: 'relevance', direction: 'desc' },
    debounceMs = 300,
    enableRealTimeSearch = true,
    enableVoiceSearch = true,
    enableHistory = true,
    enableAnalytics = true
  } = options;

  // Refs
  const searchEngineRef = useRef<AdvancedSearchEngine>(searchEngine);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // State
  const [query, setQueryState] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [autocomplete, setAutocomplete] = useState<SearchSuggestion[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);
  const [sort, setSortState] = useState<SearchSort>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Load search history
  const loadHistory = useCallback(() => {
    if (!enableHistory) return;
    
    try {
      const searchHistory = searchEngineRef.current.getSearchHistory();
      setHistory(searchHistory);
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  }, [enableHistory]);

  // Get autocomplete suggestions
  const getAutocomplete = useCallback(async (searchQuery: string): Promise<SearchSuggestion[]> => {
    if (searchQuery.length < 2) {
      setAutocomplete([]);
      setShowAutocomplete(false);
      return [];
    }

    try {
      const suggestions = await searchEngineRef.current.getAutocomplete(searchQuery);
      setAutocomplete(suggestions);
      setShowAutocomplete(suggestions.length > 0);
      return suggestions;
    } catch (err) {
      console.error('Failed to get autocomplete suggestions:', err);
      return [];
    }
  }, []);

  // Initialize search engine
  useEffect(() => {
    searchEngineRef.current.initialize(articles);
    if (enableHistory) {
      loadHistory();
    }
  }, [articles, enableHistory, loadHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Perform search
  const search = useCallback(async (searchQuery?: SearchQuery) => {
    const queryToUse = searchQuery || {
      text: query,
      filters,
      sort,
      page: currentPage,
      limit: 20,
      highlight: true,
      facets: true
    };

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchEngineRef.current.search(queryToUse);
      
      if (mountedRef.current) {
        setResults(searchResults);
        setLoading(false);
        
        // Update suggestions
        if (queryToUse.text.trim()) {
          const newSuggestions = await searchEngineRef.current.generateSuggestions(queryToUse.text);
          setSuggestions(newSuggestions);
          
          // Add to history
          if (enableHistory) {
            searchEngineRef.current.addToSearchHistory(queryToUse, searchResults.total);
            loadHistory();
          }
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoading(false);
      }
    }
  }, [query, filters, sort, currentPage, enableHistory, loadHistory]);

  // Set query with optional real-time search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setCurrentPage(1);
    
    if (enableRealTimeSearch) {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced search
      if (newQuery.trim()) {
        debounceTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            search({
              text: newQuery,
              filters,
              sort,
              page: 1,
              limit: 20,
              highlight: true,
              facets: true
            });
          }
        }, debounceMs);

        // Get autocomplete suggestions
        getAutocomplete(newQuery);
      } else {
        setResults(null);
        setAutocomplete([]);
        setShowAutocomplete(false);
      }
    }
  }, [enableRealTimeSearch, debounceMs, filters, sort, search, getAutocomplete]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryState('');
    setResults(null);
    setAutocomplete([]);
    setShowAutocomplete(false);
    setError(null);
    setCurrentPage(1);
    setSuggestions([]);
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
    
    if (query.trim()) {
      search({
        text: query,
        filters: newFilters,
        sort,
        page: 1,
        limit: 20,
        highlight: true,
        facets: true
      });
    }
  }, [query, sort, search]);

  // Update single filter
  const updateFilter = useCallback((key: keyof SearchFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }, [filters, setFilters]);

  // Set sort
  const setSort = useCallback((newSort: SearchSort) => {
    setSortState(newSort);
    setCurrentPage(1);
    
    if (query.trim()) {
      search({
        text: query,
        filters,
        sort: newSort,
        page: 1,
        limit: 20,
        highlight: true,
        facets: true
      });
    }
  }, [query, filters, search]);

  // Set page
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    
    if (query.trim()) {
      search({
        text: query,
        filters,
        sort,
        page,
        limit: 20,
        highlight: true,
        facets: true
      });
    }
  }, [query, filters, sort, search]);

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string): Promise<string[]> => {
    try {
      return await searchEngineRef.current.generateSuggestions(searchQuery);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      return [];
    }
  }, []);

  // Select suggestion
  const selectSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowAutocomplete(false);
  }, [setQuery]);

  // Start voice search
  const startVoiceSearch = useCallback(async (): Promise<VoiceSearchResult> => {
    if (!enableVoiceSearch) {
      throw new Error('Voice search is disabled');
    }

    setIsVoiceSearching(true);
    setError(null);

    try {
      const voiceResult = await searchEngineRef.current.startVoiceSearch();
      
      if (mountedRef.current) {
        setQueryState(voiceResult.transcript);
        setIsVoiceSearching(false);
        
        // Perform search with voice query
        await search(voiceResult.query);
      }
      
      return voiceResult;
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Voice search failed');
        setIsVoiceSearching(false);
      }
      throw err;
    }
  }, [enableVoiceSearch, search]);

  // Add to history
  const addToHistory = useCallback((searchQuery: SearchQuery, resultCount: number) => {
    if (!enableHistory) return;
    
    try {
      searchEngineRef.current.addToSearchHistory(searchQuery, resultCount);
      loadHistory();
    } catch (err) {
      console.error('Failed to add to search history:', err);
    }
  }, [enableHistory, loadHistory]);

  // Select from history
  const selectFromHistory = useCallback((historyItem: SearchHistoryItem) => {
    setQueryState(historyItem.query);
    setFiltersState(historyItem.filters);
    setCurrentPage(1);
    
    const searchQuery: SearchQuery = {
      text: historyItem.query,
      filters: historyItem.filters,
      sort,
      page: 1,
      limit: 20,
      highlight: true,
      facets: true
    };
    
    search(searchQuery);
    
    // Mark as clicked
    try {
      searchEngineRef.current.markHistoryItemClicked(historyItem.id);
      loadHistory();
    } catch (err) {
      console.error('Failed to mark history item as clicked:', err);
    }
  }, [sort, search, loadHistory]);

  // Clear history
  const clearHistory = useCallback(() => {
    if (!enableHistory) return;
    
    try {
      searchEngineRef.current.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  }, [enableHistory]);

  // Track result click
  const trackResultClick = useCallback((searchId: string, articleId: string) => {
    if (!enableAnalytics) return;
    
    try {
      searchEngineRef.current.trackResultClick(searchId, articleId);
    } catch (err) {
      console.error('Failed to track result click:', err);
    }
  }, [enableAnalytics]);

  // Get analytics
  const getAnalytics = useCallback(() => {
    if (!enableAnalytics) return [];
    
    try {
      return searchEngineRef.current.getSearchAnalytics();
    } catch (err) {
      console.error('Failed to get search analytics:', err);
      return [];
    }
  }, [enableAnalytics]);

  // Get trending queries
  const getTrendingQueries = useCallback((limit?: number) => {
    if (!enableAnalytics) return [];
    
    try {
      return searchEngineRef.current.getTrendingQueries(limit);
    } catch (err) {
      console.error('Failed to get trending queries:', err);
      return [];
    }
  }, [enableAnalytics]);

  // Reset search
  const resetSearch = useCallback(() => {
    setQueryState(initialQuery);
    setFiltersState(initialFilters);
    setSortState(initialSort);
    setCurrentPage(1);
    setResults(null);
    setError(null);
    setAutocomplete([]);
    setShowAutocomplete(false);
    setSuggestions([]);
    setIsVoiceSearching(false);
  }, [initialQuery, initialFilters, initialSort]);

  // Get search statistics
  const getSearchStatistics = useCallback(() => {
    try {
      return searchEngineRef.current.getStatistics();
    } catch (err) {
      console.error('Failed to get search statistics:', err);
      return {};
    }
  }, []);

  return {
    // State
    query,
    results,
    loading,
    error,
    suggestions,
    autocomplete,
    showAutocomplete,
    filters,
    sort,
    currentPage,
    history,
    isVoiceSearching,
    
    // Actions
    setQuery,
    search,
    clearSearch,
    setFilters,
    updateFilter,
    setSort,
    setPage,
    
    // Autocomplete & Suggestions
    getAutocomplete,
    getSuggestions,
    selectSuggestion,
    
    // Voice Search
    startVoiceSearch,
    
    // History
    addToHistory,
    selectFromHistory,
    clearHistory,
    
    // Analytics
    trackResultClick,
    getAnalytics,
    getTrendingQueries,
    
    // Utilities
    resetSearch,
    getSearchStatistics
  };
};

export default useAdvancedSearch;