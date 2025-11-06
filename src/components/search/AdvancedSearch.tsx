/**
 * Advanced Search Component for News Website
 * 
 * Features:
 * - Real-time search with debouncing
 * - Advanced filters UI
 * - Search suggestions and autocomplete
 * - Voice search integration
 * - Search history
 * - Result highlighting and pagination
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SearchQuery, 
  SearchResults, 
  SearchFilters, 
  SearchSort,
  SearchSuggestion,
  VoiceSearchResult,
  SearchHistoryItem,
  searchEngine,
  AdvancedSearchEngine
} from '@/lib/search';
import { NewsArticle } from '@/types/news';

// Component Props
interface AdvancedSearchProps {
  articles: NewsArticle[];
  onResultSelect?: (article: NewsArticle) => void;
  initialQuery?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  showVoiceSearch?: boolean;
  className?: string;
}

// Search State
interface SearchState {
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
  showFilters: boolean;
  showHistory: boolean;
  history: SearchHistoryItem[];
  isVoiceSearching: boolean;
}

export const AdvancedSearchComponent: React.FC<AdvancedSearchProps> = ({
  articles,
  onResultSelect,
  initialQuery = '',
  showFilters = true,
  showHistory = true,
  showVoiceSearch = true,
  className = ''
}) => {
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchEngineRef = useRef<AdvancedSearchEngine>(searchEngine);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [state, setState] = useState<SearchState>({
    query: initialQuery,
    results: null,
    loading: false,
    error: null,
    suggestions: [],
    autocomplete: [],
    showAutocomplete: false,
    filters: {},
    sort: { field: 'relevance', direction: 'desc' },
    currentPage: 1,
    showFilters: false,
    showHistory: false,
    history: [],
    isVoiceSearching: false
  });

  // Initialize search engine
  useEffect(() => {
    searchEngineRef.current.initialize(articles);
    loadSearchHistory();
  }, [articles]);

  // Load search history
  const loadSearchHistory = useCallback(() => {
    const history = searchEngineRef.current.getSearchHistory();
    setState(prev => ({ ...prev, history }));
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: SearchQuery) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const results = await searchEngineRef.current.search(searchQuery);
      
      setState(prev => ({
        ...prev,
        results,
        loading: false,
        currentPage: searchQuery.page || 1
      }));

      // Add to history
      if (searchQuery.text.trim()) {
        searchEngineRef.current.addToSearchHistory(searchQuery, results.total);
        loadSearchHistory();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false
      }));
    }
  }, [loadSearchHistory]);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, query: value }));

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        const searchQuery: SearchQuery = {
          text: value,
          filters: state.filters,
          sort: state.sort,
          page: 1,
          limit: 20,
          highlight: true,
          facets: true
        };
        performSearch(searchQuery);
      }, 300);

      // Get autocomplete suggestions
      getAutocompleteSuggestions(value);
    } else {
      setState(prev => ({ 
        ...prev, 
        results: null, 
        autocomplete: [], 
        showAutocomplete: false 
      }));
    }
  }, [state.filters, state.sort, performSearch]);

  // Get autocomplete suggestions
  const getAutocompleteSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setState(prev => ({ ...prev, autocomplete: [], showAutocomplete: false }));
      return;
    }

    try {
      const suggestions = await searchEngineRef.current.getAutocomplete(query);
      setState(prev => ({ 
        ...prev, 
        autocomplete: suggestions, 
        showAutocomplete: suggestions.length > 0 
      }));
    } catch (error) {
      console.error('Failed to get autocomplete suggestions:', error);
    }
  }, []);

  // Handle voice search
  const handleVoiceSearch = useCallback(async () => {
    setState(prev => ({ ...prev, isVoiceSearching: true }));

    try {
      const voiceResult: VoiceSearchResult = await searchEngineRef.current.startVoiceSearch();
      
      setState(prev => ({ 
        ...prev, 
        query: voiceResult.transcript,
        isVoiceSearching: false 
      }));

      performSearch(voiceResult.query);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Voice search failed',
        isVoiceSearching: false 
      }));
    }
  }, [performSearch]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));

    if (state.query.trim()) {
      const searchQuery: SearchQuery = {
        text: state.query,
        filters: updatedFilters,
        sort: state.sort,
        page: 1,
        limit: 20,
        highlight: true,
        facets: true
      };
      performSearch(searchQuery);
    }
  }, [state.filters, state.query, state.sort, performSearch]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: SearchSort) => {
    setState(prev => ({ ...prev, sort: newSort, currentPage: 1 }));

    if (state.query.trim()) {
      const searchQuery: SearchQuery = {
        text: state.query,
        filters: state.filters,
        sort: newSort,
        page: 1,
        limit: 20,
        highlight: true,
        facets: true
      };
      performSearch(searchQuery);
    }
  }, [state.query, state.filters, performSearch]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));

    if (state.query.trim()) {
      const searchQuery: SearchQuery = {
        text: state.query,
        filters: state.filters,
        sort: state.sort,
        page,
        limit: 20,
        highlight: true,
        facets: true
      };
      performSearch(searchQuery);
    }
  }, [state.query, state.filters, state.sort, performSearch]);

  // Handle result click
  const handleResultClick = useCallback((article: NewsArticle) => {
    // Track click for analytics
    if (state.results?.searchId) {
      searchEngineRef.current.trackResultClick(state.results.searchId, article.id);
    }

    if (onResultSelect) {
      onResultSelect(article);
    }
  }, [state.results, onResultSelect]);

  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((suggestion: SearchSuggestion) => {
    setState(prev => ({ 
      ...prev, 
      query: suggestion.text, 
      showAutocomplete: false 
    }));

    const searchQuery: SearchQuery = {
      text: suggestion.text,
      filters: state.filters,
      sort: state.sort,
      page: 1,
      limit: 20,
      highlight: true,
      facets: true
    };
    performSearch(searchQuery);
  }, [state.filters, state.sort, performSearch]);

  // Handle history item selection
  const handleHistorySelect = useCallback((historyItem: SearchHistoryItem) => {
    setState(prev => ({ 
      ...prev, 
      query: historyItem.query,
      filters: historyItem.filters,
      showHistory: false 
    }));

    const searchQuery: SearchQuery = {
      text: historyItem.query,
      filters: historyItem.filters,
      sort: state.sort,
      page: 1,
      limit: 20,
      highlight: true,
      facets: true
    };
    performSearch(searchQuery);

    // Mark as clicked
    searchEngineRef.current.markHistoryItemClicked(historyItem.id);
  }, [state.sort, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: null,
      autocomplete: [],
      showAutocomplete: false,
      error: null,
      currentPage: 1
    }));

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className={`advanced-search ${className}`}>
      {/* Search Header */}
      <div className="search-header">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              value={state.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search articles, authors, categories..."
              className="search-input"
              autoComplete="off"
              aria-label="Search"
            />
            
            {/* Search Actions */}
            <div className="search-actions">
              {state.query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="clear-button"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              
              {showVoiceSearch && (
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  disabled={state.isVoiceSearching}
                  className={`voice-button ${state.isVoiceSearching ? 'active' : ''}`}
                  aria-label="Voice search"
                >
                  {state.isVoiceSearching ? '🎙️' : '🎤'}
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {state.showAutocomplete && state.autocomplete.length > 0 && (
            <div className="autocomplete-dropdown">
              {state.autocomplete.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className={`autocomplete-item ${suggestion.type}`}
                  onClick={() => handleAutocompleteSelect(suggestion)}
                >
                  <span className="suggestion-icon">
                    {suggestion.type === 'query' && '🔍'}
                    {suggestion.type === 'category' && '📁'}
                    {suggestion.type === 'author' && '👤'}
                    {suggestion.type === 'tag' && '🏷️'}
                  </span>
                  <span className="suggestion-text">{suggestion.text}</span>
                  <span className="suggestion-type">{suggestion.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Controls */}
        <div className="search-controls">
          {showFilters && (
            <button
              type="button"
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className={`filter-toggle ${state.showFilters ? 'active' : ''}`}
            >
              🔧 Filters
            </button>
          )}
          
          {showHistory && (
            <button
              type="button"
              onClick={() => setState(prev => ({ ...prev, showHistory: !prev.showHistory }))}
              className={`history-toggle ${state.showHistory ? 'active' : ''}`}
            >
              📚 History
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {state.showFilters && (
        <SearchFiltersPanel
          filters={state.filters}
          facets={state.results?.facets}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Search History Panel */}
      {state.showHistory && (
        <SearchHistoryPanel
          history={state.history}
          onHistorySelect={handleHistorySelect}
          onClearHistory={() => {
            searchEngineRef.current.clearSearchHistory();
            loadSearchHistory();
          }}
        />
      )}

      {/* Search Results */}
      <div className="search-content">
        {/* Loading State */}
        {state.loading && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="search-error">
            <p>❌ {state.error}</p>
            <button onClick={() => setState(prev => ({ ...prev, error: null }))}>
              Dismiss
            </button>
          </div>
        )}

        {/* Search Results */}
        {state.results && !state.loading && (
          <SearchResultsDisplay
            results={state.results}
            currentPage={state.currentPage}
            onResultClick={handleResultClick}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            currentSort={state.sort}
          />
        )}

        {/* No Results */}
        {state.results && state.results.total === 0 && !state.loading && (
          <div className="no-results">
            <p>No articles found for "{state.query}"</p>
            {state.suggestions.length > 0 && (
              <div className="suggestions">
                <p>Try these suggestions:</p>
                <div className="suggestion-chips">
                  {state.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSearchChange(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Search Filters Panel Component
interface SearchFiltersPanelProps {
  filters: SearchFilters;
  facets?: any;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  filters,
  facets,
  onFilterChange
}) => {
  return (
    <div className="search-filters-panel">
      <div className="filter-section">
        <h4>Date Range</h4>
        <select
          value={filters.dateRange ? 'custom' : 'all'}
          onChange={(e) => {
            if (e.target.value === 'all') {
              onFilterChange({ dateRange: undefined });
            }
          }}
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      <div className="filter-section">
        <h4>Categories</h4>
        {facets?.categories?.slice(0, 10).map((category: any) => (
          <label key={category.name} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.categories?.includes(category.name) || false}
              onChange={(e) => {
                const categories = filters.categories || [];
                const newCategories = e.target.checked
                  ? [...categories, category.name]
                  : categories.filter(c => c !== category.name);
                onFilterChange({ categories: newCategories });
              }}
            />
            <span>{category.name} ({category.count})</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h4>Authors</h4>
        {facets?.authors?.slice(0, 8).map((author: any) => (
          <label key={author.name} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.authors?.includes(author.name) || false}
              onChange={(e) => {
                const authors = filters.authors || [];
                const newAuthors = e.target.checked
                  ? [...authors, author.name]
                  : authors.filter(a => a !== author.name);
                onFilterChange({ authors: newAuthors });
              }}
            />
            <span>{author.name} ({author.count})</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h4>Media</h4>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasImages === true}
            onChange={(e) => {
              onFilterChange({ hasImages: e.target.checked ? true : undefined });
            }}
          />
          <span>Has images</span>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasVideo === true}
            onChange={(e) => {
              onFilterChange({ hasVideo: e.target.checked ? true : undefined });
            }}
          />
          <span>Has video</span>
        </label>
      </div>
    </div>
  );
};

// Search History Panel Component
interface SearchHistoryPanelProps {
  history: SearchHistoryItem[];
  onHistorySelect: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
}

const SearchHistoryPanel: React.FC<SearchHistoryPanelProps> = ({
  history,
  onHistorySelect,
  onClearHistory
}) => {
  return (
    <div className="search-history-panel">
      <div className="history-header">
        <h4>Recent Searches</h4>
        {history.length > 0 && (
          <button type="button" onClick={onClearHistory} className="clear-history">
            Clear All
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <p className="no-history">No recent searches</p>
      ) : (
        <div className="history-list">
          {history.slice(0, 10).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`history-item ${item.clicked ? 'clicked' : ''}`}
              onClick={() => onHistorySelect(item)}
            >
              <span className="history-query">{item.query}</span>
              <span className="history-meta">
                {item.resultCount} results • {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Search Results Display Component
interface SearchResultsDisplayProps {
  results: SearchResults;
  currentPage: number;
  currentSort: SearchSort;
  onResultClick: (article: NewsArticle) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sort: SearchSort) => void;
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  results,
  currentPage,
  currentSort,
  onResultClick,
  onPageChange,
  onSortChange
}) => {
  return (
    <div className="search-results">
      {/* Results Header */}
      <div className="results-header">
        <div className="results-info">
          <span className="results-count">
            {results.total.toLocaleString()} results found in {results.executionTime.toFixed(2)}ms
          </span>
        </div>
        
        <div className="results-controls">
          <select
            value={`${currentSort.field}-${currentSort.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [SearchSort['field'], SearchSort['direction']];
              onSortChange({ field, direction });
            }}
            className="sort-select"
          >
            <option value="relevance-desc">Most Relevant</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="popularity-desc">Most Popular</option>
            <option value="author-asc">Author A-Z</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="results-list">
        {results.items.map((article) => (
          <div
            key={article.id}
            className="result-item"
            onClick={() => onResultClick(article)}
          >
            <div className="result-content">
              <h3 
                className="result-title"
                dangerouslySetInnerHTML={{ 
                  __html: article.highlights?.title?.[0] || article.title 
                }}
              />
              
              <div className="result-meta">
                <span className="result-author">{article.author}</span>
                <span className="result-date">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                <span className="result-category">{article.category}</span>
                <span className="result-score">Score: {article.score.toFixed(2)}</span>
              </div>
              
              {article.highlights?.content && (
                <div className="result-highlights">
                  {article.highlights.content.map((highlight, index) => (
                    <p 
                      key={index}
                      className="highlight-snippet"
                      dangerouslySetInnerHTML={{ __html: highlight }}
                    />
                  ))}
                </div>
              )}
              
              {article.summary && !article.highlights?.content && (
                <p className="result-summary">{article.summary}</p>
              )}
            </div>
            
            {article.imageUrl && (
              <div className="result-image">
                <img src={article.imageUrl} alt={article.title} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {results.totalPages > 1 && (
        <div className="search-pagination">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="pagination-button"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {results.totalPages}
          </span>
          
          <button
            type="button"
            disabled={currentPage >= results.totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchComponent;