// ============================================================================
// COMPREHENSIVE NEWS API LAYER
// ============================================================================

import { NewsArticle, NewsSource } from '@/types';

// ============================================================================
// API CONFIGURATION AND TYPES
// ============================================================================

// API Configuration
interface APIConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// API Response Types
interface APIResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
  totalResults?: number;
  page?: number;
  pageSize?: number;
}

// Removed unused APIErrorInterface to satisfy no-unused-vars

// Request Options
interface RequestOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'publishedAt' | 'relevancy' | 'popularity';
  language?: string;
  from?: Date;
  to?: Date;
  domains?: string[];
  excludeDomains?: string[];
  sources?: string[];
}

// Search Options
interface SearchOptions extends RequestOptions {
  query: string;
  searchIn?: 'title' | 'description' | 'content';
  category?: string;
}

// News Sources Configuration
const NEWS_SOURCES = {
  NEWSAPI: {
    baseURL: 'https://newsapi.org/v2',
    apiKey: process.env.NEXT_PUBLIC_NEWSAPI_KEY || '',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  GUARDIAN: {
    baseURL: 'https://content.guardianapis.com',
    apiKey: process.env.NEXT_PUBLIC_GUARDIAN_API_KEY || '',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
} as const;

// Cache Configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SEARCH_TTL: 2 * 60 * 1000,  // 2 minutes
  TRENDING_TTL: 10 * 60 * 1000, // 10 minutes
  MAX_CACHE_SIZE: 100,
} as const;

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_HOUR: 1000,
  MAX_REQUESTS_PER_MINUTE: 100,
  BACKOFF_BASE: 1000,
  MAX_BACKOFF: 30000,
} as const;

// ============================================================================
// ERROR HANDLING
// ============================================================================

class APIError extends Error {
  public code: string;
  public status: number;
  public source?: string;
  public timestamp: Date;

  constructor(message: string, code: string, status: number, source?: string) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
    this.source = source;
    this.timestamp = new Date();
  }

  static fromResponse(response: Response, source?: string): APIError {
    return new APIError(
      `API request failed: ${response.statusText}`,
      'API_REQUEST_FAILED',
      response.status,
      source
    );
  }

  static networkError(message?: string): APIError {
    return new APIError(
      message || 'Network request failed',
      'NETWORK_ERROR',
      0
    );
  }

  static rateLimitError(source?: string): APIError {
    return new APIError(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429,
      source
    );
  }

  static timeoutError(source?: string): APIError {
    return new APIError(
      'Request timeout. Please try again.',
      'REQUEST_TIMEOUT',
      408,
      source
    );
  }
}

// ============================================================================
// CACHING LAYER
// ============================================================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = CACHE_CONFIG.MAX_CACHE_SIZE;

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  generateKey(endpoint: string, params?: object): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}_${Buffer.from(paramString).toString('base64')}`;
  }
}

// Global cache instance
const apiCache = new APICache();

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

class RateLimiter {
  private state = new Map<string, RateLimitState>();

  async checkRateLimit(source: string): Promise<boolean> {
    const now = Date.now();
    const state = this.state.get(source) || { requests: [], lastReset: now };

    // Reset counters every hour
    if (now - state.lastReset > 3600000) {
      state.requests = [];
      state.lastReset = now;
    }

    // Remove requests older than 1 minute for per-minute limit
    state.requests = state.requests.filter(time => now - time < 60000);

    // Check limits
    const hourlyRequests = state.requests.length;
    const minuteRequests = state.requests.filter(time => now - time < 60000).length;

    if (hourlyRequests >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR) {
      throw APIError.rateLimitError(source);
    }

    if (minuteRequests >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      // Wait and retry
      await this.backoff(minuteRequests);
    }

    // Add current request
    state.requests.push(now);
    this.state.set(source, state);

    return true;
  }

  private async backoff(attempts: number): Promise<void> {
    const delay = Math.min(
      RATE_LIMIT_CONFIG.BACKOFF_BASE * Math.pow(2, attempts),
      RATE_LIMIT_CONFIG.MAX_BACKOFF
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// ============================================================================
// HTTP CLIENT WITH INTERCEPTORS
// ============================================================================

class HTTPClient {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    source?: string
  ): Promise<APIResponse<T>> {
    // Pre-request interceptor
    await this.preRequestInterceptor(source);

    const url = `${this.config.baseURL}${endpoint}`;
    const timeoutId = setTimeout(() => {
      throw APIError.timeoutError(source);
    }, this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Post-response interceptor
      return await this.postResponseInterceptor(response, source);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }

      throw APIError.networkError(
        error instanceof Error ? error.message : 'Unknown network error'
      );
    }
  }

  async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    source?: string
  ): Promise<APIResponse<T>> {
    let lastError: APIError;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.request<T>(endpoint, options, source);
      } catch (error) {
        lastError = error instanceof APIError ? error : APIError.networkError();

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (lastError.status >= 400 && lastError.status < 500 && lastError.status !== 429) {
          throw lastError;
        }

        // Wait before retrying
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError!;
  }

  private async preRequestInterceptor(source?: string): Promise<void> {
    // Rate limiting check
    if (source) {
      await rateLimiter.checkRateLimit(source);
    }

    // Add authentication, logging, etc.
    console.log(`[API] Making request to ${source || 'unknown'} at ${new Date().toISOString()}`);
  }

  private async postResponseInterceptor<T>(
    response: Response,
    source?: string
  ): Promise<APIResponse<T>> {
    if (!response.ok) {
      throw APIError.fromResponse(response, source);
    }

    const data = await response.json();

    // Transform response to standard format
    return {
      data,
      status: response.status,
      message: 'Success',
    };
  }
}

// ============================================================================
// DATA TRANSFORMATION AND NORMALIZATION
// ============================================================================

// Guardian API response types
interface GuardianArticle {
  id: string;
  webTitle: string;
  webPublicationDate: string;
  webUrl: string;
  sectionId: string;
  sectionName: string;
  fields?: {
    trailText?: string;
    bodyText?: string;
    thumbnail?: string;
    byline?: string;
  };
  tags?: Array<{ webTitle: string }>;
}

interface GuardianResponse {
  response?: {
    results?: GuardianArticle[];
  };
}

// NewsAPI response types
interface NewsAPIArticle {
  title: string;
  description: string;
  content?: string;
  author?: string;
  publishedAt: string;
  urlToImage?: string;
  url: string;
  source?: {
    name?: string;
  };
}

interface NewsAPIResponse {
  articles?: NewsAPIArticle[];
}

class DataTransformer {
  static normalizeNewsAPIResponse(data: NewsAPIResponse): NewsArticle[] {
    if (!data.articles || !Array.isArray(data.articles)) {
      return [];
    }

    return data.articles
      .filter((article): article is NewsAPIArticle => Boolean(article.title && article.description))
      .map((article): NewsArticle => ({
        id: this.generateId(article.url || article.title),
        title: article.title,
        content: article.content || article.description,
        summary: article.description,
        author: {
          id: this.generateId(article.author || 'anonymous'),
          name: article.author || 'Anonymous',
          email: '',
        },
        publishDate: new Date(article.publishedAt),
        category: {
          id: 'general',
          name: 'General',
          slug: 'general',
        },
        tags: [],
        imageUrl: article.urlToImage,
        slug: this.generateSlug(article.title),
        language: 'en',
        seoData: {
          metaTitle: article.title,
          metaDescription: article.description,
          keywords: [],
          canonicalUrl: article.url || '',
          openGraph: {
            title: article.title,
            description: article.description,
            image: article.urlToImage || '',
            url: article.url || '',
            type: 'article' as const,
            siteName: 'News Website',
            locale: 'en_US',
          },
          twitterCard: {
            card: 'summary_large_image' as const,
            title: article.title,
            description: article.description,
            image: article.urlToImage || '',
          },
        },
        readingTime: this.calculateReadingTime(article.content || article.description),
        source: {
          id: this.generateId(article.source?.name || 'newsapi'),
          name: article.source?.name || 'NewsAPI',
          url: new URL(article.url || 'https://newsapi.org').origin,
        },
        status: 'published',
        viewCount: 0,
        featured: false,
      }));
  }

  static normalizeGuardianResponse(data: GuardianResponse): NewsArticle[] {
    if (!data.response?.results || !Array.isArray(data.response.results)) {
      return [];
    }

    return data.response.results
      .filter((article): article is GuardianArticle => 
        Boolean(article.webTitle && article.fields?.trailText)
      )
      .map((article): NewsArticle => ({
        id: article.id,
        title: article.webTitle,
        content: article.fields?.bodyText || article.fields?.trailText || '',
        summary: article.fields?.trailText || article.webTitle,
        author: {
          id: this.generateId(article.fields?.byline || 'guardian'),
          name: article.fields?.byline || 'The Guardian',
          email: '',
        },
        publishDate: new Date(article.webPublicationDate),
        category: {
          id: article.sectionId,
          name: article.sectionName,
          slug: article.sectionId,
        },
        tags: article.tags?.map((tag) => tag.webTitle) || [],
        imageUrl: article.fields?.thumbnail,
        slug: this.generateSlug(article.webTitle),
        language: 'en',
        seoData: {
          metaTitle: article.webTitle,
          metaDescription: article.fields?.trailText || '',
          keywords: article.tags?.map((tag) => tag.webTitle) || [],
          canonicalUrl: article.webUrl || '',
          openGraph: {
            title: article.webTitle,
            description: article.fields?.trailText || '',
            image: article.fields?.thumbnail || '',
            url: article.webUrl || '',
            type: 'article' as const,
            siteName: 'News Website',
            locale: 'en_US',
          },
          twitterCard: {
            card: 'summary_large_image' as const,
            title: article.webTitle,
            description: article.fields?.trailText || '',
            image: article.fields?.thumbnail || '',
          },
        },
        readingTime: this.calculateReadingTime(article.fields?.bodyText || article.fields?.trailText || ''),
        source: {
          id: 'guardian',
          name: 'The Guardian',
          url: 'https://www.theguardian.com',
        },
        status: 'published',
        viewCount: 0,
        featured: false,
      }));
  }

  private static generateId(input: string): string {
    return Buffer.from(input).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

// ============================================================================
// NEWS API CLIENTS
// ============================================================================

class NewsAPIClient {
  private client: HTTPClient;

  constructor() {
    this.client = new HTTPClient(NEWS_SOURCES.NEWSAPI);
  }

  async getLatestNews(options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('newsapi_latest', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      apiKey: NEWS_SOURCES.NEWSAPI.apiKey,
      pageSize: (options.pageSize || 20).toString(),
      page: (options.page || 1).toString(),
      sortBy: options.sortBy || 'publishedAt',
      language: options.language || 'en',
    });

    if (options.from) {
      params.append('from', options.from.toISOString());
    }
    if (options.to) {
      params.append('to', options.to.toISOString());
    }
    if (options.domains?.length) {
      params.append('domains', options.domains.join(','));
    }
    if (options.sources?.length) {
      params.append('sources', options.sources.join(','));
    }

    const endpoint = `/everything?${params.toString()}`;
    
    try {
      const response = await this.client.requestWithRetry(endpoint, {}, 'NewsAPI');
      const articles = DataTransformer.normalizeNewsAPIResponse(response.data as NewsAPIResponse);
      
      // Cache the results
      apiCache.set(cacheKey, articles, CACHE_CONFIG.DEFAULT_TTL);
      
      return articles;
    } catch (error) {
      console.error('[NewsAPI] Error fetching latest news:', error);
      throw error;
    }
  }

  async getNewsByCategory(category: string, options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('newsapi_category', { category, ...options });
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      apiKey: NEWS_SOURCES.NEWSAPI.apiKey,
      category: category.toLowerCase(),
      pageSize: (options.pageSize || 20).toString(),
      page: (options.page || 1).toString(),
      sortBy: options.sortBy || 'publishedAt',
      language: options.language || 'en',
    });

    const endpoint = `/top-headlines?${params.toString()}`;
    
    try {
      const response = await this.client.requestWithRetry(endpoint, {}, 'NewsAPI');
      const articles = DataTransformer.normalizeNewsAPIResponse(response.data as NewsAPIResponse);
      
      // Cache the results
      apiCache.set(cacheKey, articles, CACHE_CONFIG.DEFAULT_TTL);
      
      return articles;
    } catch (error) {
      console.error(`[NewsAPI] Error fetching news for category ${category}:`, error);
      throw error;
    }
  }

  async searchNews(options: SearchOptions): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('newsapi_search', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      apiKey: NEWS_SOURCES.NEWSAPI.apiKey,
      q: options.query,
      pageSize: (options.pageSize || 20).toString(),
      page: (options.page || 1).toString(),
      sortBy: options.sortBy || 'relevancy',
      language: options.language || 'en',
    });

    if (options.searchIn) {
      params.append('searchIn', options.searchIn);
    }
    if (options.from) {
      params.append('from', options.from.toISOString());
    }
    if (options.to) {
      params.append('to', options.to.toISOString());
    }
    if (options.domains?.length) {
      params.append('domains', options.domains.join(','));
    }
    if (options.sources?.length) {
      params.append('sources', options.sources.join(','));
    }

    const endpoint = `/everything?${params.toString()}`;
    
    try {
      const response = await this.client.requestWithRetry(endpoint, {}, 'NewsAPI');
      const articles = DataTransformer.normalizeNewsAPIResponse(response.data as NewsAPIResponse);
      
      // Cache the results with shorter TTL for search
      apiCache.set(cacheKey, articles, CACHE_CONFIG.SEARCH_TTL);
      
      return articles;
    } catch (error) {
      console.error('[NewsAPI] Error searching news:', error);
      throw error;
    }
  }
}

class GuardianAPIClient {
  private client: HTTPClient;

  constructor() {
    this.client = new HTTPClient(NEWS_SOURCES.GUARDIAN);
  }

  async getLatestNews(options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('guardian_latest', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      'api-key': NEWS_SOURCES.GUARDIAN.apiKey,
      'page-size': (options.pageSize || 20).toString(),
      page: (options.page || 1).toString(),
      'order-by': 'newest',
      'show-fields': 'trailText,thumbnail,bodyText,byline',
      'show-tags': 'keyword',
    });

    if (options.from) {
      params.append('from-date', options.from.toISOString().split('T')[0]);
    }
    if (options.to) {
      params.append('to-date', options.to.toISOString().split('T')[0]);
    }

    const endpoint = `/search?${params.toString()}`;
    
    try {
      const response = await this.client.requestWithRetry(endpoint, {}, 'Guardian');
      const articles = DataTransformer.normalizeGuardianResponse(response.data as GuardianResponse);
      
      // Cache the results
      apiCache.set(cacheKey, articles, CACHE_CONFIG.DEFAULT_TTL);
      
      return articles;
    } catch (error) {
      console.error('[Guardian] Error fetching latest news:', error);
      throw error;
    }
  }

  async getNewsByCategory(category: string, options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('guardian_category', { category, ...options });
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      'api-key': NEWS_SOURCES.GUARDIAN.apiKey,
      section: category.toLowerCase(),
      'page-size': (options.pageSize || 20).toString(),
      page: (options.page || 1).toString(),
      'order-by': 'newest',
      'show-fields': 'trailText,thumbnail,bodyText,byline',
      'show-tags': 'keyword',
    });

    const endpoint = `/search?${params.toString()}`;
    
    try {
      const response = await this.client.requestWithRetry(endpoint, {}, 'Guardian');
      const articles = DataTransformer.normalizeGuardianResponse(response.data as GuardianResponse);
      
      // Cache the results
      apiCache.set(cacheKey, articles, CACHE_CONFIG.DEFAULT_TTL);
      
      return articles;
    } catch (error) {
      console.error(`[Guardian] Error fetching news for category ${category}:`, error);
      throw error;
    }
  }

  async searchNews(options: SearchOptions): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('guardian_search', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      'api-key': NEWS_SOURCES.GUARDIAN.apiKey,
      q: options.query,
      'page-size': (options.pageSize || 20).toString(),
      page: (options.page || 1).toString(),
      'order-by': 'relevance',
      'show-fields': 'trailText,thumbnail,bodyText,byline',
      'show-tags': 'keyword',
    });

    if (options.category) {
      params.append('section', options.category);
    }
    if (options.from) {
      params.append('from-date', options.from.toISOString().split('T')[0]);
    }
    if (options.to) {
      params.append('to-date', options.to.toISOString().split('T')[0]);
    }

    const endpoint = `/search?${params.toString()}`;
    
    try {
      const response = await this.client.requestWithRetry(endpoint, {}, 'Guardian');
      const articles = DataTransformer.normalizeGuardianResponse(response.data as GuardianResponse);
      
      // Cache the results with shorter TTL for search
      apiCache.set(cacheKey, articles, CACHE_CONFIG.SEARCH_TTL);
      
      return articles;
    } catch (error) {
      console.error('[Guardian] Error searching news:', error);
      throw error;
    }
  }
}

// ============================================================================
// AGGREGATED NEWS SERVICE
// ============================================================================

export class NewsService {
  private newsAPIClient: NewsAPIClient;
  private guardianClient: GuardianAPIClient;

  constructor() {
    this.newsAPIClient = new NewsAPIClient();
    this.guardianClient = new GuardianAPIClient();
  }

  /**
   * Get latest news from all sources
   */
  async getLatestNews(options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('aggregated_latest', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch from both sources in parallel
      const [newsAPIArticles, guardianArticles] = await Promise.allSettled([
        this.newsAPIClient.getLatestNews(options),
        this.guardianClient.getLatestNews(options),
      ]);

      const allArticles: NewsArticle[] = [];

      // Collect successful results
      if (newsAPIArticles.status === 'fulfilled') {
        allArticles.push(...newsAPIArticles.value);
      } else {
        console.warn('[NewsService] NewsAPI failed:', newsAPIArticles.reason);
      }

      if (guardianArticles.status === 'fulfilled') {
        allArticles.push(...guardianArticles.value);
      } else {
        console.warn('[NewsService] Guardian API failed:', guardianArticles.reason);
      }

      // Sort by publish date (newest first)
      const sortedArticles = allArticles.sort(
        (a, b) => b.publishDate.getTime() - a.publishDate.getTime()
      );

      // Apply pagination
      const pageSize = options.pageSize || 20;
      const page = options.page || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedArticles = sortedArticles.slice(startIndex, startIndex + pageSize);

      // Cache the results
      apiCache.set(cacheKey, paginatedArticles, CACHE_CONFIG.DEFAULT_TTL);

      return paginatedArticles;
    } catch (error) {
      console.error('[NewsService] Error fetching latest news:', error);
      throw error;
    }
  }

  /**
   * Get news by category from all sources
   */
  async getNewsByCategory(category: string, options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('aggregated_category', { category, ...options });
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch from both sources in parallel
      const [newsAPIArticles, guardianArticles] = await Promise.allSettled([
        this.newsAPIClient.getNewsByCategory(category, options),
        this.guardianClient.getNewsByCategory(category, options),
      ]);

      const allArticles: NewsArticle[] = [];

      // Collect successful results
      if (newsAPIArticles.status === 'fulfilled') {
        allArticles.push(...newsAPIArticles.value);
      } else {
        console.warn(`[NewsService] NewsAPI failed for category ${category}:`, newsAPIArticles.reason);
      }

      if (guardianArticles.status === 'fulfilled') {
        allArticles.push(...guardianArticles.value);
      } else {
        console.warn(`[NewsService] Guardian API failed for category ${category}:`, guardianArticles.reason);
      }

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicates(allArticles);

      // Sort by publish date (newest first)
      const sortedArticles = uniqueArticles.sort(
        (a, b) => b.publishDate.getTime() - a.publishDate.getTime()
      );

      // Apply pagination
      const pageSize = options.pageSize || 20;
      const page = options.page || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedArticles = sortedArticles.slice(startIndex, startIndex + pageSize);

      // Cache the results
      apiCache.set(cacheKey, paginatedArticles, CACHE_CONFIG.DEFAULT_TTL);

      return paginatedArticles;
    } catch (error) {
      console.error(`[NewsService] Error fetching news for category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Search news across all sources
   */
  async searchNews(options: SearchOptions): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('aggregated_search', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch from both sources in parallel
      const [newsAPIArticles, guardianArticles] = await Promise.allSettled([
        this.newsAPIClient.searchNews(options),
        this.guardianClient.searchNews(options),
      ]);

      const allArticles: NewsArticle[] = [];

      // Collect successful results
      if (newsAPIArticles.status === 'fulfilled') {
        allArticles.push(...newsAPIArticles.value);
      } else {
        console.warn('[NewsService] NewsAPI search failed:', newsAPIArticles.reason);
      }

      if (guardianArticles.status === 'fulfilled') {
        allArticles.push(...guardianArticles.value);
      } else {
        console.warn('[NewsService] Guardian search failed:', guardianArticles.reason);
      }

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicates(allArticles);

      // Sort by relevance/date based on sortBy option
      const sortedArticles = options.sortBy === 'publishedAt' 
        ? uniqueArticles.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
        : uniqueArticles; // Keep original order for relevance

      // Apply pagination
      const pageSize = options.pageSize || 20;
      const page = options.page || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedArticles = sortedArticles.slice(startIndex, startIndex + pageSize);

      // Cache the results with shorter TTL for search
      apiCache.set(cacheKey, paginatedArticles, CACHE_CONFIG.SEARCH_TTL);

      return paginatedArticles;
    } catch (error) {
      console.error('[NewsService] Error searching news:', error);
      throw error;
    }
  }

  /**
   * Get trending articles (cached for longer)
   */
  async getTrendingNews(options: RequestOptions = {}): Promise<NewsArticle[]> {
    const cacheKey = apiCache.generateKey('trending_news', options);
    
    // Check cache first
    const cached = apiCache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // For trending, we'll get popular articles from the last 24 hours
    const trendingOptions: RequestOptions = {
      ...options,
      sortBy: 'popularity',
      from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      pageSize: options.pageSize || 10,
    };

    const articles = await this.getLatestNews(trendingOptions);

    // Cache with longer TTL for trending
    apiCache.set(cacheKey, articles, CACHE_CONFIG.TRENDING_TTL);

    return articles;
  }

  /**
   * Get available news sources
   */
  async getNewsSources(): Promise<NewsSource[]> {
    // This could be extended to fetch from APIs, for now return static list
    return [
      {
        id: 'newsapi',
        name: 'NewsAPI',
        url: 'https://newsapi.org',
      },
      {
        id: 'guardian',
        name: 'The Guardian',
        url: 'https://www.theguardian.com',
      },
    ];
  }

  /**
   * Clear API cache
   */
  clearCache(): void {
    apiCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: apiCache.size(),
      maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
    };
  }

  /**
   * Remove duplicate articles based on title similarity
   */
  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const uniqueArticles: NewsArticle[] = [];

    for (const article of articles) {
      // Create a normalized title for comparison
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        uniqueArticles.push(article);
      }
    }

    return uniqueArticles;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Global service instance
const newsService = new NewsService();

/**
 * Get latest news articles
 */
export async function getLatestNews(options?: RequestOptions): Promise<NewsArticle[]> {
  return newsService.getLatestNews(options);
}

/**
 * Get news articles by category
 */
export async function getNewsByCategory(category: string, options?: RequestOptions): Promise<NewsArticle[]> {
  return newsService.getNewsByCategory(category, options);
}

/**
 * Search news articles
 */
export async function searchNews(query: string, options?: Omit<SearchOptions, 'query'>): Promise<NewsArticle[]> {
  return newsService.searchNews({ query, ...options });
}

/**
 * Get trending news articles
 */
export async function getTrendingNews(options?: RequestOptions): Promise<NewsArticle[]> {
  return newsService.getTrendingNews(options);
}

/**
 * Get available news sources
 */
export async function getNewsSources(): Promise<NewsSource[]> {
  return newsService.getNewsSources();
}

// Export the service instance for advanced usage
export { newsService };

// Export the error class
export { APIError };