'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NewsCard } from './NewsCard';
import { NewsArticle, Category } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES
// ============================================================================

export interface NewsGridProps {
  articles: NewsArticle[];
  categories?: Category[];
  onLoadMore?: () => Promise<NewsArticle[]>;
  onSearch?: (query: string) => Promise<NewsArticle[]>;
  onCategoryFilter?: (categoryId: string | null) => Promise<NewsArticle[]>;
  loading?: boolean;
  hasMore?: boolean;
  enableInfiniteScroll?: boolean;
  enableVirtualScrolling?: boolean;
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  itemsPerPage?: number;
  gridVariant?: 'default' | 'mixed' | 'compact';
  className?: string;
  emptyStateMessage?: string;
  loadingSkeletonCount?: number;
}

interface GridFilters {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'date' | 'popularity' | 'title';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================

function NewsCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' | 'compact' }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className={`bg-gray-200 dark:bg-gray-700 ${
        variant === 'featured' ? 'h-64' : 
        variant === 'compact' ? 'h-32' : 'h-48'
      }`} />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category badge */}
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        
        {/* Summary (only for featured) */}
        {variant === 'featured' && (
          <div className="space-y-2">
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-5/6 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        )}
        
        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEARCH AND FILTER COMPONENT
// ============================================================================

function SearchAndFilters({
  filters,
  categories,
  onFiltersChange,
  enableSearch,
  enableCategoryFilter
}: {
  filters: GridFilters;
  categories: Category[];
  onFiltersChange: (filters: Partial<GridFilters>) => void;
  enableSearch: boolean;
  enableCategoryFilter: boolean;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    onFiltersChange({ searchQuery: '' });
    searchInputRef.current?.focus();
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      selectedCategory: null,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.searchQuery || filters.selectedCategory || 
    filters.sortBy !== 'date' || filters.sortOrder !== 'desc';

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        {enableSearch && (
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search articles..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              className="
                block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700
                rounded-lg bg-white dark:bg-gray-800
                text-gray-900 dark:text-white placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200
              "
            />
            {filters.searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                title="Clear search"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        {enableCategoryFilter && (
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              inline-flex items-center px-4 py-3 border border-gray-200 dark:border-gray-700
              rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
              hover:bg-gray-50 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-all duration-200
              ${hasActiveFilters ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            `}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                Active
              </span>
            )}
            <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && enableCategoryFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.selectedCategory || ''}
                  onChange={(e) => onFiltersChange({ selectedCategory: e.target.value || null })}
                  aria-label="Filter by category"
                  className="
                    w-full px-3 py-2 border border-gray-200 dark:border-gray-600
                    rounded-md bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  "
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFiltersChange({ sortBy: e.target.value as GridFilters['sortBy'] })}
                  aria-label="Sort articles by"
                  className="
                    w-full px-3 py-2 border border-gray-200 dark:border-gray-600
                    rounded-md bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  "
                >
                  <option value="date">Publish Date</option>
                  <option value="popularity">Popularity</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => onFiltersChange({ sortOrder: e.target.value as GridFilters['sortOrder'] })}
                  aria-label="Sort order"
                  className="
                    w-full px-3 py-2 border border-gray-200 dark:border-gray-600
                    rounded-md bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  "
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({ 
  message, 
  hasFilters,
  onClearFilters 
}: { 
  message: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        {hasFilters ? (
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400" />
        ) : (
          <NewspaperIcon className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {hasFilters ? 'No articles found' : 'No articles available'}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="
            inline-flex items-center px-4 py-2 bg-blue-600 text-white
            rounded-lg hover:bg-blue-700 transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

function useIntersectionObserver(
  targetRef: React.RefObject<HTMLDivElement | null>,
  onIntersect: () => void,
  options = { threshold: 1.0 }
) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      options
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [targetRef, onIntersect, options]);
}

// ============================================================================
// MAIN NEWS GRID COMPONENT
// ============================================================================

export function NewsGrid({
  articles,
  categories = [],
  onLoadMore,
  onSearch,
  onCategoryFilter,
  loading = false,
  hasMore = false,
  enableInfiniteScroll = true,
  // enableVirtualScrolling = false // TODO: Implement virtual scrolling
  enableSearch = true,
  enableCategoryFilter = true,
  itemsPerPage = 12,
  gridVariant = 'default',
  className = '',
  emptyStateMessage = 'No articles found. Try adjusting your search or filters.',
  loadingSkeletonCount = 6
}: NewsGridProps) {
  const [filters, setFilters] = useState<GridFilters>({
    searchQuery: '',
    selectedCategory: null,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const [displayedArticles, setDisplayedArticles] = useState<NewsArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout>();
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = [...articles];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.author.name.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.selectedCategory) {
      filtered = filtered.filter(article => 
        article.category.id === filters.selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
          break;
        case 'popularity':
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [articles, filters]);

  // Update displayed articles when filters change
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    setDisplayedArticles(filteredAndSortedArticles.slice(startIndex, endIndex));
  }, [filteredAndSortedArticles, currentPage, itemsPerPage]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<GridFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
    
    // Debounce search
    if (newFilters.searchQuery !== undefined) {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      
      const timer = setTimeout(() => {
        if (onSearch) {
          onSearch(newFilters.searchQuery || '');
        }
      }, 300);
      
      setSearchDebounceTimer(timer);
    }

    // Handle category filter
    if (newFilters.selectedCategory !== undefined && onCategoryFilter) {
      onCategoryFilter(newFilters.selectedCategory);
    }
  }, [onSearch, onCategoryFilter, searchDebounceTimer]);

  // Handle infinite scroll
  const handleLoadMore = useCallback(async () => {
    if (!enableInfiniteScroll || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      if (onLoadMore) {
        await onLoadMore();
      } else {
        // Local pagination
        setCurrentPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [enableInfiniteScroll, isLoadingMore, hasMore, onLoadMore]);

  // Set up intersection observer for infinite scroll
  useIntersectionObserver(
    loadMoreRef,
    handleLoadMore,
    { threshold: 0.1 }
  );

  // Clear filters helper
  const clearAllFilters = useCallback(() => {
    handleFiltersChange({
      searchQuery: '',
      selectedCategory: null,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, [handleFiltersChange]);

  // Check if filters are active
  const hasActiveFilters = Boolean(filters.searchQuery || filters.selectedCategory || 
    filters.sortBy !== 'date' || filters.sortOrder !== 'desc');

  // Determine grid layout
  const getGridColumns = () => {
    switch (gridVariant) {
      case 'compact':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'mixed':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Determine card variant for mixed layout
  const getCardVariant = (index: number) => {
    if (gridVariant === 'mixed' && index === 0) {
      return 'featured';
    }
    if (gridVariant === 'compact') {
      return 'compact';
    }
    return 'default';
  };

  return (
    <div className={`w-full ${className}`} ref={gridRef}>
      {/* Search and Filters */}
      {(enableSearch || enableCategoryFilter) && (
        <SearchAndFilters
          filters={filters}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          enableSearch={enableSearch}
          enableCategoryFilter={enableCategoryFilter}
        />
      )}

      {/* Loading State */}
      {loading && displayedArticles.length === 0 && (
        <div className={`grid ${getGridColumns()} gap-6`}>
          {Array.from({ length: loadingSkeletonCount }).map((_, index) => (
            <NewsCardSkeleton 
              key={`skeleton-${index}`} 
              variant={getCardVariant(index)}
            />
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!loading && displayedArticles.length > 0 && (
        <motion.div
          layout
          className={`grid ${getGridColumns()} gap-6`}
        >
          <AnimatePresence mode="popLayout">
            {displayedArticles.map((article, index) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <NewsCard
                  article={article}
                  variant={getCardVariant(index)}
                  priority={index < 3} // Priority loading for first 3 items
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && displayedArticles.length === 0 && (
        <EmptyState
          message={emptyStateMessage}
          hasFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      )}

      {/* Load More Trigger */}
      {enableInfiniteScroll && displayedArticles.length > 0 && hasMore && (
        <div ref={loadMoreRef} className="mt-12">
          {isLoadingMore && (
            <div className={`grid ${getGridColumns()} gap-6`}>
              {Array.from({ length: Math.min(loadingSkeletonCount, 3) }).map((_, index) => (
                <NewsCardSkeleton 
                  key={`load-more-skeleton-${index}`} 
                  variant="default"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Load More Button (if infinite scroll is disabled) */}
      {!enableInfiniteScroll && displayedArticles.length > 0 && hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="
              inline-flex items-center px-6 py-3 bg-blue-600 text-white
              rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            {isLoadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Load More Articles'
            )}
          </button>
        </div>
      )}

      {/* Results Info */}
      {displayedArticles.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {displayedArticles.length} of {filteredAndSortedArticles.length} articles
          {hasActiveFilters && (
            <span> (filtered from {articles.length} total)</span>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsGrid;