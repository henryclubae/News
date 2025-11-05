/**
 * Search Cache System
 * 
 * Advanced search results caching with query normalization,
 * result aggregation, and intelligent cache warming
 */

import { getCacheManager, CacheOptions, CACHE_STRATEGIES } from './cache';

// ===== INTERFACES =====

export interface SearchQuery {
  text: string;
  filters: {
    category?: string;
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
    sortBy?: 'relevance' | 'date' | 'popularity';
    sortOrder?: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  slug: string;
  category: string;
  author: {
    id: string;
    name: string;
  };
  publishedAt: string;
  image?: string;
  relevanceScore: number;
  matchedTerms: string[];
  snippet: string;
}

export interface SearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  executionTime: number;
  suggestions?: string[];
  facets?: {
    categories: Array<{ name: string; count: number }>;
    authors: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

export interface SearchAnalytics {
  query: string;
  count: number;
  avgResponseTime: number;
  resultCount: number;
  clickThroughRate: number;
  lastSearched: number;
  variations: string[];
}

export interface SearchCacheConfig {
  baseTTL: number;
  popularQueryTTL: number;
  maxCachedQueries: number;
  enableAnalytics: boolean;
  enableSuggestions: boolean;
  compressionThreshold: number;
  warmingSchedule: {
    enabled: boolean;
    interval: number;
    topQueriesCount: number;
  };
}

// ===== SEARCH CACHE MANAGER =====

export class SearchCacheManager {
  private cacheManager = getCacheManager();
  private config: SearchCacheConfig;

  constructor(config?: Partial<SearchCacheConfig>) {
    this.config = {
      baseTTL: 900, // 15 minutes default
      popularQueryTTL: 3600, // 1 hour for popular queries
      maxCachedQueries: 10000,
      enableAnalytics: true,
      enableSuggestions: true,
      compressionThreshold: 100 * 1024, // 100KB
      warmingSchedule: {
        enabled: true,
        interval: 3600000, // 1 hour in ms
        topQueriesCount: 100,
      },
      ...config,
    };

    if (this.config.warmingSchedule.enabled) {
      this.startWarmingSchedule();
    }
  }

  // ===== CORE CACHING METHODS =====

  async cacheSearchResults(query: SearchQuery, response: SearchResponse): Promise<void> {
    const normalizedQuery = this.normalizeQuery(query);
    const cacheKey = this.generateSearchKey(normalizedQuery);
    
    const ttl = await this.calculateSearchTTL(normalizedQuery);
    const shouldCompress = JSON.stringify(response).length > this.config.compressionThreshold;

    const cacheOptions: CacheOptions = {
      ttl,
      tags: this.generateSearchTags(query, response),
      priority: await this.determineSearchPriority(normalizedQuery),
      compress: shouldCompress,
      version: this.generateSearchVersion(query),
    };

    // Cache the full search response
    await this.cacheManager.set(cacheKey, response, cacheOptions);

    // Cache individual results for cross-query optimization
    await this.cacheIndividualResults(response.results, cacheOptions);

    // Update query analytics
    if (this.config.enableAnalytics) {
      await this.updateSearchAnalytics(normalizedQuery, response);
    }

    // Update search suggestions
    if (this.config.enableSuggestions) {
      await this.updateSuggestions(normalizedQuery);
    }
  }

  async getSearchResults(query: SearchQuery): Promise<SearchResponse | null> {
    const startTime = Date.now();
    const normalizedQuery = this.normalizeQuery(query);
    const cacheKey = this.generateSearchKey(normalizedQuery);

    let response = await this.cacheManager.get<SearchResponse>(cacheKey);

    // If exact match not found, try fuzzy matching
    if (!response) {
      response = await this.findSimilarCachedSearch(normalizedQuery);
    }

    if (response) {
      // Update analytics
      if (this.config.enableAnalytics) {
        const responseTime = Date.now() - startTime;
        await this.trackSearchHit(normalizedQuery, responseTime);
      }

      // Refresh popular queries more aggressively
      if (await this.isPopularQuery(normalizedQuery)) {
        // Extend TTL for popular queries
        await this.cacheManager.set(cacheKey, response, {
          ttl: this.config.popularQueryTTL,
          tags: this.generateSearchTags(query, response),
        });
      }

      return response;
    }

    if (this.config.enableAnalytics) {
      await this.trackSearchMiss(normalizedQuery);
    }

    return null;
  }

  async searchWithCache(
    query: SearchQuery,
    searchFunction: (query: SearchQuery) => Promise<SearchResponse>
  ): Promise<SearchResponse> {
    // Try cache first
    let response = await this.getSearchResults(query);
    
    if (response) {
      return response;
    }

    // Execute search and cache results
    const startTime = Date.now();
    response = await searchFunction(query);
    response.executionTime = Date.now() - startTime;

    // Cache the results
    await this.cacheSearchResults(query, response);

    return response;
  }

  // ===== QUERY NORMALIZATION =====

  private normalizeQuery(query: SearchQuery): string {
    const normalizedText = query.text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[^\w\s-]/g, ''); // Remove special characters except hyphens

    const filters = query.filters;
    const pagination = query.pagination;

    // Create a deterministic string representation
    const parts = [
      `q:${normalizedText}`,
      filters.category ? `cat:${filters.category}` : '',
      filters.author ? `auth:${filters.author}` : '',
      filters.dateFrom ? `from:${filters.dateFrom}` : '',
      filters.dateTo ? `to:${filters.dateTo}` : '',
      filters.tags?.length ? `tags:${filters.tags.sort().join(',')}` : '',
      filters.sortBy ? `sort:${filters.sortBy}` : '',
      filters.sortOrder ? `order:${filters.sortOrder}` : '',
      `page:${pagination.page}`,
      `limit:${pagination.limit}`,
    ];

    return parts.filter(Boolean).join('|');
  }

  private async findSimilarCachedSearch(normalizedQuery: string): Promise<SearchResponse | null> {
    try {
      // Extract base query without pagination
      const baseParts = normalizedQuery.split('|').filter(part => 
        !part.startsWith('page:') && !part.startsWith('limit:')
      );
      const baseQuery = baseParts.join('|');

      // Look for cached results with same base query but different pagination
      const similarKey = this.generateSearchKey(baseQuery + '|page:1|limit:20'); // Default pagination
      const similarResponse = await this.cacheManager.get<SearchResponse>(similarKey);

      if (similarResponse) {
        // Extract relevant results for current pagination
        const currentQuery = this.parseNormalizedQuery(normalizedQuery);
        if (currentQuery) {
          const startIndex = (currentQuery.pagination.page - 1) * currentQuery.pagination.limit;
          const endIndex = startIndex + currentQuery.pagination.limit;
          
          if (startIndex < similarResponse.results.length) {
            const slicedResults = similarResponse.results.slice(startIndex, endIndex);
            
            return {
              ...similarResponse,
              results: slicedResults,
              page: currentQuery.pagination.page,
              totalPages: Math.ceil(similarResponse.total / currentQuery.pagination.limit),
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('[SearchCache] Error finding similar cached search:', error);
      return null;
    }
  }

  private parseNormalizedQuery(normalizedQuery: string): SearchQuery | null {
    try {
      const parts = normalizedQuery.split('|');
      const query: Partial<SearchQuery> = {
        text: '',
        filters: {},
        pagination: { page: 1, limit: 20 },
      };

      for (const part of parts) {
        const [key, value] = part.split(':');
        
        switch (key) {
          case 'q':
            query.text = value;
            break;
          case 'cat':
            query.filters!.category = value;
            break;
          case 'auth':
            query.filters!.author = value;
            break;
          case 'from':
            query.filters!.dateFrom = value;
            break;
          case 'to':
            query.filters!.dateTo = value;
            break;
          case 'tags':
            query.filters!.tags = value.split(',');
            break;
          case 'sort':
            query.filters!.sortBy = value as any;
            break;
          case 'order':
            query.filters!.sortOrder = value as any;
            break;
          case 'page':
            query.pagination!.page = parseInt(value);
            break;
          case 'limit':
            query.pagination!.limit = parseInt(value);
            break;
        }
      }

      return query as SearchQuery;
    } catch (error) {
      console.error('[SearchCache] Error parsing normalized query:', error);
      return null;
    }
  }

  // ===== CACHE OPTIMIZATION =====

  private async calculateSearchTTL(normalizedQuery: string): Promise<number> {
    let ttl = this.config.baseTTL;

    // Popular queries get longer cache time
    if (await this.isPopularQuery(normalizedQuery)) {
      ttl = this.config.popularQueryTTL;
    }

    // Queries with filters might change more frequently
    if (normalizedQuery.includes('from:') || normalizedQuery.includes('to:')) {
      ttl = Math.min(ttl, 300); // 5 minutes for date-filtered queries
    }

    // Category-specific queries
    if (normalizedQuery.includes('cat:breaking')) {
      ttl = Math.min(ttl, 600); // 10 minutes for breaking news
    }

    return ttl;
  }

  private async isPopularQuery(normalizedQuery: string): Promise<boolean> {
    try {
      const analyticsKey = this.getAnalyticsKey(normalizedQuery);
      const analytics = await this.cacheManager.get<SearchAnalytics>(analyticsKey);
      
      return analytics ? analytics.count > 10 : false;
    } catch (error) {
      return false;
    }
  }

  private async determineSearchPriority(normalizedQuery: string): Promise<'low' | 'medium' | 'high'> {
    if (await this.isPopularQuery(normalizedQuery)) {
      return 'high';
    }

    if (normalizedQuery.includes('cat:breaking') || normalizedQuery.includes('cat:trending')) {
      return 'medium';
    }

    return 'low';
  }

  private generateSearchTags(query: SearchQuery, response: SearchResponse): string[] {
    const tags = [
      'search',
      'results',
      `search:${query.text.split(' ').slice(0, 3).join('_')}`, // First 3 words
    ];

    if (query.filters.category) {
      tags.push(`category:${query.filters.category}`);
    }

    if (query.filters.author) {
      tags.push(`author:${query.filters.author}`);
    }

    if (query.filters.tags) {
      tags.push(...query.filters.tags.map(tag => `tag:${tag}`));
    }

    return tags;
  }

  private generateSearchVersion(query: SearchQuery): string {
    // Use current hour as version for cache invalidation
    const hour = Math.floor(Date.now() / (1000 * 60 * 60));
    return hour.toString();
  }

  // ===== RESULT OPTIMIZATION =====

  private async cacheIndividualResults(results: SearchResult[], cacheOptions: CacheOptions): Promise<void> {
    const promises = results.map(async (result) => {
      const resultKey = this.getResultKey(result.id);
      await this.cacheManager.set(resultKey, result, {
        ...cacheOptions,
        ttl: cacheOptions.ttl! * 2, // Individual results last longer
        tags: ['search-result', `result:${result.id}`],
      });
    });

    await Promise.allSettled(promises);
  }

  async getCachedResult(resultId: string): Promise<SearchResult | null> {
    return await this.cacheManager.get<SearchResult>(this.getResultKey(resultId));
  }

  // ===== ANALYTICS =====

  private async updateSearchAnalytics(normalizedQuery: string, response: SearchResponse): Promise<void> {
    try {
      const analyticsKey = this.getAnalyticsKey(normalizedQuery);
      const existing = await this.cacheManager.get<SearchAnalytics>(analyticsKey) || {
        query: normalizedQuery,
        count: 0,
        avgResponseTime: 0,
        resultCount: 0,
        clickThroughRate: 0,
        lastSearched: 0,
        variations: [],
      };

      existing.count++;
      existing.lastSearched = Date.now();
      existing.avgResponseTime = (existing.avgResponseTime + response.executionTime) / 2;
      existing.resultCount = response.total;

      // Track query variations
      if (!existing.variations.includes(normalizedQuery)) {
        existing.variations.push(normalizedQuery);
        existing.variations = existing.variations.slice(-10); // Keep last 10 variations
      }

      await this.cacheManager.set(analyticsKey, existing, {
        ttl: 86400 * 7, // Keep analytics for 7 days
        tags: ['search-analytics', 'analytics'],
      });

      // Update global search statistics
      await this.updateGlobalSearchStats(normalizedQuery, response);
    } catch (error) {
      console.error('[SearchCache] Error updating search analytics:', error);
    }
  }

  private async trackSearchHit(normalizedQuery: string, responseTime: number): Promise<void> {
    try {
      const statsKey = 'search:global:stats';
      const stats = await this.cacheManager.get<{
        totalSearches: number;
        totalHits: number;
        avgHitTime: number;
      }>(statsKey) || {
        totalSearches: 0,
        totalHits: 0,
        avgHitTime: 0,
      };

      stats.totalHits++;
      stats.avgHitTime = (stats.avgHitTime + responseTime) / 2;

      await this.cacheManager.set(statsKey, stats, {
        ttl: 86400, // 24 hours
        tags: ['search-stats', 'global'],
      });
    } catch (error) {
      console.error('[SearchCache] Error tracking search hit:', error);
    }
  }

  private async trackSearchMiss(normalizedQuery: string): Promise<void> {
    try {
      const missKey = 'search:misses';
      let misses = await this.cacheManager.get<string[]>(missKey) || [];
      
      misses.push(normalizedQuery);
      misses = misses.slice(-1000); // Keep last 1000 misses

      await this.cacheManager.set(missKey, misses, {
        ttl: 3600, // 1 hour
        tags: ['search-misses', 'analytics'],
      });
    } catch (error) {
      console.error('[SearchCache] Error tracking search miss:', error);
    }
  }

  private async updateGlobalSearchStats(normalizedQuery: string, response: SearchResponse): Promise<void> {
    try {
      // Update popular queries ranking
      const popularKey = 'search:popular:queries';
      let popularQueries = await this.cacheManager.get<Array<{
        query: string;
        count: number;
        lastSearched: number;
      }>>(popularKey) || [];

      const existingIndex = popularQueries.findIndex(item => item.query === normalizedQuery);
      
      if (existingIndex >= 0) {
        popularQueries[existingIndex].count++;
        popularQueries[existingIndex].lastSearched = Date.now();
      } else {
        popularQueries.push({
          query: normalizedQuery,
          count: 1,
          lastSearched: Date.now(),
        });
      }

      // Sort by count and keep top 1000
      popularQueries.sort((a, b) => b.count - a.count);
      popularQueries = popularQueries.slice(0, 1000);

      await this.cacheManager.set(popularKey, popularQueries, {
        ttl: 86400, // 24 hours
        tags: ['search-popular', 'rankings'],
      });
    } catch (error) {
      console.error('[SearchCache] Error updating global search stats:', error);
    }
  }

  // ===== SUGGESTIONS =====

  private async updateSuggestions(normalizedQuery: string): Promise<void> {
    try {
      const queryText = normalizedQuery.split('|')[0]?.replace('q:', '') || '';
      if (queryText.length < 3) return;

      const suggestionsKey = 'search:suggestions';
      let suggestions = await this.cacheManager.get<Record<string, number>>(suggestionsKey) || {};

      // Add/update suggestion
      const words = queryText.split(' ');
      for (let i = 1; i <= words.length; i++) {
        const prefix = words.slice(0, i).join(' ');
        suggestions[prefix] = (suggestions[prefix] || 0) + 1;
      }

      // Keep only top 10000 suggestions
      const sortedSuggestions = Object.entries(suggestions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10000)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, number>);

      await this.cacheManager.set(suggestionsKey, sortedSuggestions, {
        ttl: 86400 * 7, // 7 days
        tags: ['search-suggestions', 'autocomplete'],
      });
    } catch (error) {
      console.error('[SearchCache] Error updating suggestions:', error);
    }
  }

  async getSuggestions(prefix: string, limit: number = 10): Promise<string[]> {
    try {
      if (prefix.length < 2) return [];

      const suggestionsKey = 'search:suggestions';
      const suggestions = await this.cacheManager.get<Record<string, number>>(suggestionsKey) || {};

      const matches = Object.keys(suggestions)
        .filter(suggestion => suggestion.toLowerCase().startsWith(prefix.toLowerCase()))
        .sort((a, b) => suggestions[b] - suggestions[a])
        .slice(0, limit);

      return matches;
    } catch (error) {
      console.error('[SearchCache] Error getting suggestions:', error);
      return [];
    }
  }

  // ===== CACHE WARMING =====

  private startWarmingSchedule(): void {
    if (typeof window !== 'undefined') return; // Only run on server

    setInterval(async () => {
      try {
        await this.warmPopularQueries();
      } catch (error) {
        console.error('[SearchCache] Error in warming schedule:', error);
      }
    }, this.config.warmingSchedule.interval);
  }

  async warmPopularQueries(): Promise<void> {
    try {
      console.log('[SearchCache] Warming popular queries...');
      
      const popularKey = 'search:popular:queries';
      const popularQueries = await this.cacheManager.get<Array<{
        query: string;
        count: number;
        lastSearched: number;
      }>>(popularKey) || [];

      const topQueries = popularQueries
        .slice(0, this.config.warmingSchedule.topQueriesCount)
        .map(item => item.query);

      console.log(`[SearchCache] Pre-warming ${topQueries.length} popular queries`);

      // Note: In a real implementation, you would re-execute these searches
      // to refresh the cache with up-to-date results
      for (const queryStr of topQueries) {
        const query = this.parseNormalizedQuery(queryStr);
        if (query) {
          // Check if cache is about to expire and refresh if needed
          const cacheKey = this.generateSearchKey(queryStr);
          const exists = await this.cacheManager.exists(cacheKey);
          
          if (!exists) {
            console.log(`[SearchCache] Cache expired for: ${queryStr}`);
            // In real implementation: await this.executeAndCacheSearch(query);
          }
        }
      }
    } catch (error) {
      console.error('[SearchCache] Error warming popular queries:', error);
    }
  }

  // ===== KEY GENERATION =====

  private generateSearchKey(normalizedQuery: string): string {
    return `search:query:${Buffer.from(normalizedQuery).toString('base64')}`;
  }

  private getAnalyticsKey(normalizedQuery: string): string {
    return `search:analytics:${Buffer.from(normalizedQuery).toString('base64')}`;
  }

  private getResultKey(resultId: string): string {
    return `search:result:${resultId}`;
  }

  // ===== MAINTENANCE =====

  async performMaintenance(): Promise<void> {
    console.log('[SearchCache] Performing maintenance...');
    
    try {
      // Clean up old analytics
      await this.cleanupOldAnalytics();
      
      // Update suggestions
      await this.rebuildSuggestions();
      
      // Clean up expired cached results
      await this.cleanupExpiredResults();
      
      console.log('[SearchCache] Maintenance completed');
    } catch (error) {
      console.error('[SearchCache] Maintenance error:', error);
    }
  }

  private async cleanupOldAnalytics(): Promise<void> {
    // Remove analytics older than 30 days
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Implementation would iterate through analytics and remove old entries
    console.log('[SearchCache] Cleaning up old analytics...');
  }

  private async rebuildSuggestions(): Promise<void> {
    console.log('[SearchCache] Rebuilding search suggestions...');
    
    // Implementation would rebuild suggestions from recent search analytics
    // This helps maintain relevancy of autocomplete suggestions
  }

  private async cleanupExpiredResults(): Promise<void> {
    console.log('[SearchCache] Cleaning up expired search results...');
    
    // Clean up individual cached results
    await this.cacheManager.invalidateByTags(['search-result']);
  }

  // ===== INVALIDATION =====

  async invalidateSearchByCategory(category: string): Promise<void> {
    await this.cacheManager.invalidateByTags([`category:${category}`]);
  }

  async invalidateSearchByAuthor(authorId: string): Promise<void> {
    await this.cacheManager.invalidateByTags([`author:${authorId}`]);
  }

  async invalidateSearchByTag(tag: string): Promise<void> {
    await this.cacheManager.invalidateByTags([`tag:${tag}`]);
  }

  async invalidateAllSearch(): Promise<void> {
    await this.cacheManager.invalidateByTags(['search', 'results']);
  }

  // ===== ANALYTICS GETTERS =====

  async getSearchAnalytics(): Promise<{
    popularQueries: Array<{ query: string; count: number }>;
    totalSearches: number;
    hitRate: number;
    avgResponseTime: number;
    topMisses: string[];
  }> {
    try {
      const popularKey = 'search:popular:queries';
      const popularQueries = await this.cacheManager.get<Array<{
        query: string;
        count: number;
      }>>(popularKey) || [];

      const statsKey = 'search:global:stats';
      const stats = await this.cacheManager.get<{
        totalSearches: number;
        totalHits: number;
        avgHitTime: number;
      }>(statsKey) || {
        totalSearches: 0,
        totalHits: 0,
        avgHitTime: 0,
      };

      const missKey = 'search:misses';
      const misses = await this.cacheManager.get<string[]>(missKey) || [];

      // Calculate hit rate
      const hitRate = stats.totalSearches > 0 
        ? (stats.totalHits / stats.totalSearches) * 100 
        : 0;

      // Get top misses (most common cache misses)
      const missFrequency: Record<string, number> = {};
      misses.forEach(miss => {
        missFrequency[miss] = (missFrequency[miss] || 0) + 1;
      });

      const topMisses = Object.entries(missFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query]) => query);

      return {
        popularQueries: popularQueries.slice(0, 20),
        totalSearches: stats.totalSearches,
        hitRate,
        avgResponseTime: stats.avgHitTime,
        topMisses,
      };
    } catch (error) {
      console.error('[SearchCache] Error getting search analytics:', error);
      return {
        popularQueries: [],
        totalSearches: 0,
        hitRate: 0,
        avgResponseTime: 0,
        topMisses: [],
      };
    }
  }
}

// ===== SINGLETON INSTANCE =====

let searchCacheManager: SearchCacheManager | null = null;

export function getSearchCacheManager(): SearchCacheManager {
  if (!searchCacheManager) {
    searchCacheManager = new SearchCacheManager();
  }
  return searchCacheManager;
}

export default SearchCacheManager;