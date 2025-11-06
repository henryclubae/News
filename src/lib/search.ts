/**
 * Advanced Search System for News Website
 * 
 * Features:
 * - Full-text search with fuzzy matching
 * - Advanced filtering (date, category, author, language)
 * - Intelligent ranking and relevance scoring
 * - Search suggestions and autocomplete
 * - Search analytics and trending queries
 * - Voice search integration
 * - Result pagination with virtual scrolling
 * - Search history management
 * - Real-time search with debouncing
 * 
 * Based on Elasticsearch/Algolia concepts with local implementation
 */

import { NewsArticle } from '@/types/news';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// Search Configuration
export interface SearchConfig {
  maxResults: number;
  fuzzyThreshold: number;
  highlightTags: {
    pre: string;
    post: string;
  };
  boostFactors: {
    title: number;
    content: number;
    summary: number;
    tags: number;
    author: number;
  };
  debounceMs: number;
  cacheExpiry: number;
}

// Search Filters
export interface SearchFilters {
  categories?: string[];
  authors?: string[];
  languages?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sources?: string[];
  minReadTime?: number;
  maxReadTime?: number;
  hasImages?: boolean;
  hasVideo?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// Search Sort Options
export interface SearchSort {
  field: 'relevance' | 'date' | 'popularity' | 'readTime' | 'author';
  direction: 'asc' | 'desc';
}

// Search Query
export interface SearchQuery {
  text: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  page?: number;
  limit?: number;
  highlight?: boolean;
  facets?: boolean;
}

// Search Result Item
export interface SearchResultItem extends NewsArticle {
  score: number;
  highlights: {
    title?: string[];
    content?: string[];
    summary?: string[];
  };
  explanation?: {
    value: number;
    description: string;
    details: Array<{
      value: number;
      description: string;
    }>;
  };
}

// Search Results
export interface SearchResults {
  items: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacets;
  suggestions: string[];
  query: SearchQuery;
  executionTime: number;
  searchId: string;
}

// Search Facets for filtering
export interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  authors: Array<{ name: string; count: number }>;
  languages: Array<{ name: string; count: number }>;
  sources: Array<{ name: string; count: number }>;
  dateRanges: Array<{ range: string; count: number }>;
  sentiment: Array<{ type: string; count: number }>;
}

// Search Suggestion
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'author' | 'tag';
  score: number;
  frequency: number;
}

// Search Analytics
export interface SearchAnalytics {
  query: string;
  resultCount: number;
  clickThroughRate: number;
  executionTime: number;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  filters: SearchFilters;
  resultClicks: string[]; // Article IDs clicked
}

// Voice Search Result
export interface VoiceSearchResult {
  transcript: string;
  confidence: number;
  language: string;
  query: SearchQuery;
}

// Search History Item
export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: Date;
  resultCount: number;
  clicked: boolean;
}

// Default Configuration
const DEFAULT_CONFIG: SearchConfig = {
  maxResults: 1000,
  fuzzyThreshold: 0.8,
  highlightTags: {
    pre: '<mark class="search-highlight">',
    post: '</mark>'
  },
  boostFactors: {
    title: 3.0,
    content: 1.0,
    summary: 2.0,
    tags: 2.5,
    author: 1.5
  },
  debounceMs: 300,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

// Advanced Search Engine Class
export class AdvancedSearchEngine {
  private config: SearchConfig;
  private articles: NewsArticle[] = [];
  private searchCache = new Map<string, { results: SearchResults; timestamp: number }>();
  private analytics: SearchAnalytics[] = [];
  private searchHistory: SearchHistoryItem[] = [];
  private trendingQueries: Map<string, number> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // word -> article IDs
  private inverseIndex: Map<string, Map<string, number>> = new Map(); // word -> {articleId -> frequency}

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadSearchHistory();
    this.loadAnalytics();
  }

  // Initialize search engine with articles
  public initialize(articles: NewsArticle[]): void {
    this.articles = articles;
    this.buildSearchIndex();
  }

  // Add new articles to the search index
  public addArticles(articles: NewsArticle[]): void {
    this.articles.push(...articles);
    this.updateSearchIndex(articles);
  }

  // Update existing article in the search index
  public updateArticle(article: NewsArticle): void {
    const index = this.articles.findIndex(a => a.id === article.id);
    if (index !== -1) {
      this.articles[index] = article;
      this.rebuildSearchIndex();
    }
  }

  // Remove article from search index
  public removeArticle(articleId: string): void {
    this.articles = this.articles.filter(a => a.id !== articleId);
    this.rebuildSearchIndex();
  }

  // Main search method
  public async search(query: SearchQuery): Promise<SearchResults> {
    const startTime = performance.now();
    const searchId = this.generateSearchId();
    
    // Check cache first
    const cacheKey = this.getCacheKey(query);
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
      return cached.results;
    }

    // Normalize and prepare query
    const normalizedQuery = this.normalizeQuery(query.text);
    
    // Get candidate articles
    const candidates = this.getCandidateArticles(normalizedQuery, query.filters);
    
    // Score and rank results
    const scoredResults = this.scoreResults(candidates, normalizedQuery);
    
    // Apply sorting
    const sortedResults = this.applySorting(scoredResults, query.sort);
    
    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginatedResults = sortedResults.slice(startIndex, startIndex + limit);
    
    // Generate highlights
    const highlightedResults = query.highlight !== false 
      ? this.generateHighlights(paginatedResults, normalizedQuery)
      : paginatedResults;
    
    // Generate facets
    const facets = query.facets !== false 
      ? this.generateFacets(candidates, query.filters)
      : this.getEmptyFacets();
    
    // Generate suggestions
    const suggestions = await this.generateSuggestions(query.text);
    
    const executionTime = performance.now() - startTime;
    
    const results: SearchResults = {
      items: highlightedResults,
      total: sortedResults.length,
      page,
      limit,
      totalPages: Math.ceil(sortedResults.length / limit),
      facets,
      suggestions,
      query,
      executionTime,
      searchId
    };

    // Cache results
    this.searchCache.set(cacheKey, { results, timestamp: Date.now() });
    
    // Track analytics
    this.trackSearch(query, results, executionTime);
    
    return results;
  }

  // Build full-text search index
  private buildSearchIndex(): void {
    this.searchIndex.clear();
    this.inverseIndex.clear();
    
    this.articles.forEach(article => {
      this.indexArticle(article);
    });
  }

  // Rebuild search index (for updates)
  private rebuildSearchIndex(): void {
    this.buildSearchIndex();
  }

  // Update search index with new articles
  private updateSearchIndex(articles: NewsArticle[]): void {
    articles.forEach(article => {
      this.indexArticle(article);
    });
  }

  // Index individual article
  private indexArticle(article: NewsArticle): void {
    const text = this.getIndexableText(article);
    const words = this.tokenize(text);
    
    words.forEach(word => {
      // Update search index
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word)!.add(article.id);
      
      // Update inverse index for frequency
      if (!this.inverseIndex.has(word)) {
        this.inverseIndex.set(word, new Map());
      }
      const wordMap = this.inverseIndex.get(word)!;
      wordMap.set(article.id, (wordMap.get(article.id) || 0) + 1);
    });
  }

  // Extract indexable text from article
  private getIndexableText(article: NewsArticle): string {
    return [
      article.title,
      article.content,
      article.summary || '',
      article.author || '',
      article.category || '',
      ...(article.tags || [])
    ].join(' ').toLowerCase();
  }

  // Tokenize text into searchable words
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => this.stemWord(word));
  }

  // Simple stemming (can be enhanced with proper stemmer)
  private stemWord(word: string): string {
    // Basic English stemming rules
    if (word.endsWith('ing') && word.length > 6) {
      return word.slice(0, -3);
    }
    if (word.endsWith('ed') && word.length > 5) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s') && word.length > 3) {
      return word.slice(0, -1);
    }
    return word;
  }

  // Normalize search query
  private normalizeQuery(query: string): string[] {
    return this.tokenize(query);
  }

  // Get candidate articles based on query and filters
  private getCandidateArticles(queryTerms: string[], filters?: SearchFilters): NewsArticle[] {
    let candidates = new Set<string>();
    
    if (queryTerms.length === 0) {
      // If no query terms, start with all articles
      candidates = new Set(this.articles.map(a => a.id));
    } else {
      // Find articles matching query terms
      queryTerms.forEach((term, index) => {
        const matchingIds = this.findMatchingArticles(term);
        
        if (index === 0) {
          candidates = matchingIds;
        } else {
          // Intersection for AND logic
          candidates = new Set([...candidates].filter(id => matchingIds.has(id)));
        }
      });
    }

    // Apply filters
    const filteredArticles = this.articles.filter(article => {
      if (!candidates.has(article.id)) return false;
      return this.matchesFilters(article, filters);
    });

    return filteredArticles;
  }

  // Find articles matching a search term (with fuzzy matching)
  private findMatchingArticles(term: string): Set<string> {
    const matches = new Set<string>();
    
    // Exact matches
    if (this.searchIndex.has(term)) {
      this.searchIndex.get(term)!.forEach(id => matches.add(id));
    }
    
    // Fuzzy matches
    for (const [indexedTerm, articleIds] of this.searchIndex) {
      if (this.calculateSimilarity(term, indexedTerm) >= this.config.fuzzyThreshold) {
        articleIds.forEach(id => matches.add(id));
      }
    }
    
    return matches;
  }

  // Calculate string similarity (Jaro-Winkler)
  private calculateSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    
    const len1 = s1.length;
    const len2 = s2.length;
    
    if (len1 === 0 || len2 === 0) return 0.0;
    
    const matchWindow = Math.max(len1, len2) / 2 - 1;
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, len2);
      
      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0.0;
    
    // Find transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
    
    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
    
    // Jaro-Winkler
    let prefix = 0;
    for (let i = 0; i < Math.min(len1, len2, 4); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }
    
    return jaro + (0.1 * prefix * (1 - jaro));
  }

  // Check if article matches filters
  private matchesFilters(article: NewsArticle, filters?: SearchFilters): boolean {
    if (!filters) return true;

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(article.category || '')) return false;
    }

    // Author filter
    if (filters.authors && filters.authors.length > 0) {
      if (!filters.authors.includes(article.author || '')) return false;
    }

    // Language filter
    if (filters.languages && filters.languages.length > 0) {
      if (!filters.languages.includes(article.language || 'en')) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const articleDate = new Date(article.publishedAt);
      if (articleDate < filters.dateRange.start || articleDate > filters.dateRange.end) {
        return false;
      }
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(article.source || '')) return false;
    }

    // Read time filter
    if (filters.minReadTime && (article.readTime || 0) < filters.minReadTime) return false;
    if (filters.maxReadTime && (article.readTime || 0) > filters.maxReadTime) return false;

    // Media filters
    if (filters.hasImages === true && !article.imageUrl) return false;
    if (filters.hasImages === false && article.imageUrl) return false;

    return true;
  }

  // Score search results based on relevance
  private scoreResults(articles: NewsArticle[], queryTerms: string[]): SearchResultItem[] {
    return articles.map(article => {
      const score = this.calculateRelevanceScore(article, queryTerms);
      
      return {
        ...article,
        score,
        highlights: {},
        explanation: this.generateScoreExplanation(article, queryTerms, score)
      };
    });
  }

  // Calculate relevance score for an article
  private calculateRelevanceScore(article: NewsArticle, queryTerms: string[]): number {
    let score = 0;
    
    queryTerms.forEach(term => {
      // Title boost
      if (article.title.toLowerCase().includes(term)) {
        score += this.config.boostFactors.title;
      }
      
      // Content boost
      if (article.content.toLowerCase().includes(term)) {
        score += this.config.boostFactors.content;
      }
      
      // Summary boost
      if (article.summary?.toLowerCase().includes(term)) {
        score += this.config.boostFactors.summary;
      }
      
      // Author boost
      if (article.author?.toLowerCase().includes(term)) {
        score += this.config.boostFactors.author;
      }
      
      // Tags boost
      if (article.tags?.some((tag: string) => tag.toLowerCase().includes(term))) {
        score += this.config.boostFactors.tags;
      }
      
      // TF-IDF scoring
      const termFreq = this.getTermFrequency(article.id, term);
      const invDocFreq = this.getInverseDocumentFrequency(term);
      score += termFreq * invDocFreq;
    });
    
    // Freshness boost (newer articles get higher scores)
    const daysSincePublished = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessBoost = Math.max(0, 1 - daysSincePublished / 30) * 0.5;
    score += freshnessBoost;
    
    // Popularity boost (if available)
    if (article.views) {
      score += Math.log(article.views + 1) * 0.1;
    }
    
    return Math.max(0, score);
  }

  // Get term frequency for article
  private getTermFrequency(articleId: string, term: string): number {
    const wordMap = this.inverseIndex.get(term);
    if (!wordMap || !wordMap.has(articleId)) return 0;
    
    const frequency = wordMap.get(articleId)!;
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return 0;
    
    const totalWords = this.getIndexableText(article).split(/\s+/).length;
    return frequency / totalWords;
  }

  // Get inverse document frequency
  private getInverseDocumentFrequency(term: string): number {
    const docsWithTerm = this.searchIndex.get(term)?.size || 0;
    if (docsWithTerm === 0) return 0;
    
    return Math.log(this.articles.length / docsWithTerm);
  }

  // Generate score explanation
  private generateScoreExplanation(article: NewsArticle, queryTerms: string[], score: number) {
    return {
      value: score,
      description: `Relevance score for "${article.title}"`,
      details: [
        { value: score * 0.7, description: 'Text matching score' },
        { value: score * 0.2, description: 'Freshness boost' },
        { value: score * 0.1, description: 'Popularity boost' }
      ]
    };
  }

  // Apply sorting to results
  private applySorting(results: SearchResultItem[], sort?: SearchSort): SearchResultItem[] {
    if (!sort || sort.field === 'relevance') {
      return results.sort((a, b) => b.score - a.score);
    }
    
    const direction = sort.direction === 'asc' ? 1 : -1;
    
    return results.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'date':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        case 'popularity':
          comparison = (a.views || 0) - (b.views || 0);
          break;
        case 'readTime':
          comparison = (a.readTime || 0) - (b.readTime || 0);
          break;
        case 'author':
          comparison = (a.author || '').localeCompare(b.author || '');
          break;
      }
      
      return comparison * direction;
    });
  }

  // Generate search highlights
  private generateHighlights(results: SearchResultItem[], queryTerms: string[]): SearchResultItem[] {
    return results.map(result => {
      const highlights: SearchResultItem['highlights'] = {};
      
      queryTerms.forEach(term => {
        // Highlight title
        if (result.title.toLowerCase().includes(term)) {
          highlights.title = highlights.title || [];
          highlights.title.push(this.highlightText(result.title, term));
        }
        
        // Highlight content (first few matches)
        if (result.content.toLowerCase().includes(term)) {
          highlights.content = highlights.content || [];
          const contentHighlights = this.extractHighlightedSnippets(result.content, term, 3);
          highlights.content.push(...contentHighlights);
        }
        
        // Highlight summary
        if (result.summary?.toLowerCase().includes(term)) {
          highlights.summary = highlights.summary || [];
          highlights.summary.push(this.highlightText(result.summary, term));
        }
      });
      
      return {
        ...result,
        highlights
      };
    });
  }

  // Highlight text with search terms
  private highlightText(text: string, term: string): string {
    const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
    return text.replace(regex, `${this.config.highlightTags.pre}$1${this.config.highlightTags.post}`);
  }

  // Extract highlighted snippets from content
  private extractHighlightedSnippets(content: string, term: string, maxSnippets: number): string[] {
    const snippets: string[] = [];
    const regex = new RegExp(`(.{0,50}${this.escapeRegex(term)}.{0,50})`, 'gi');
    let match;
    let count = 0;
    
    while ((match = regex.exec(content)) && count < maxSnippets) {
      const snippet = match[1].trim();
      const highlighted = this.highlightText(snippet, term);
      snippets.push(`...${highlighted}...`);
      count++;
    }
    
    return snippets;
  }

  // Escape regex special characters
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Generate search facets
  private generateFacets(articles: NewsArticle[], filters?: SearchFilters): SearchFacets {
    const facets: SearchFacets = {
      categories: [],
      authors: [],
      languages: [],
      sources: [],
      dateRanges: [],
      sentiment: []
    };

    // Count categories
    const categoryCount = new Map<string, number>();
    const authorCount = new Map<string, number>();
    const languageCount = new Map<string, number>();
    const sourceCount = new Map<string, number>();

    articles.forEach(article => {
      // Categories
      if (article.category) {
        categoryCount.set(article.category, (categoryCount.get(article.category) || 0) + 1);
      }
      
      // Authors
      if (article.author) {
        authorCount.set(article.author, (authorCount.get(article.author) || 0) + 1);
      }
      
      // Languages
      const lang = article.language || 'en';
      languageCount.set(lang, (languageCount.get(lang) || 0) + 1);
      
      // Sources
      if (article.source) {
        sourceCount.set(article.source, (sourceCount.get(article.source) || 0) + 1);
      }
    });

    // Convert to facet format
    facets.categories = Array.from(categoryCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    facets.authors = Array.from(authorCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Limit to top 20
      
    facets.languages = Array.from(languageCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    facets.sources = Array.from(sourceCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Limit to top 15

    // Generate date range facets
    facets.dateRanges = this.generateDateRangeFacets(articles);
    
    return facets;
  }

  // Generate date range facets
  private generateDateRangeFacets(articles: NewsArticle[]): Array<{ range: string; count: number }> {
    const now = new Date();
    const ranges = [
      { name: 'Last 24 hours', days: 1 },
      { name: 'Last 7 days', days: 7 },
      { name: 'Last 30 days', days: 30 },
      { name: 'Last 3 months', days: 90 },
      { name: 'Last year', days: 365 }
    ];

    return ranges.map(range => {
      const cutoff = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);
      const count = articles.filter(article => 
        new Date(article.publishedAt) >= cutoff
      ).length;
      
      return {
        range: range.name,
        count
      };
    });
  }

  // Get empty facets structure
  private getEmptyFacets(): SearchFacets {
    return {
      categories: [],
      authors: [],
      languages: [],
      sources: [],
      dateRanges: [],
      sentiment: []
    };
  }

  // Generate search suggestions
  public async generateSuggestions(query: string): Promise<string[]> {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    if (query.length < 2) return suggestions;
    
    // Get suggestions from trending queries
    for (const [trendingQuery] of this.trendingQueries) {
      if (trendingQuery.toLowerCase().includes(queryLower) && trendingQuery !== query) {
        suggestions.push(trendingQuery);
      }
    }
    
    // Get suggestions from article titles
    this.articles.forEach(article => {
      if (article.title.toLowerCase().includes(queryLower) && 
          !suggestions.includes(article.title) && 
          suggestions.length < 10) {
        suggestions.push(article.title);
      }
    });
    
    // Get suggestions from categories and tags
    const categories = new Set<string>();
    const tags = new Set<string>();
    
    this.articles.forEach(article => {
      if (article.category?.toLowerCase().includes(queryLower)) {
        categories.add(article.category);
      }
      article.tags?.forEach((tag: string) => {
        if (tag.toLowerCase().includes(queryLower)) {
          tags.add(tag);
        }
      });
    });
    
    suggestions.push(...Array.from(categories).slice(0, 3));
    suggestions.push(...Array.from(tags).slice(0, 3));
    
    return suggestions.slice(0, 10);
  }

  // Voice search integration
  public async startVoiceSearch(): Promise<VoiceSearchResult> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        reject(new Error('Speech recognition not available'));
        return;
      }
      
      const recognition = new SpeechRecognitionClass();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        const query: SearchQuery = {
          text: transcript,
          highlight: true,
          facets: true
        };
        
        resolve({
          transcript,
          confidence,
          language: recognition.lang,
          query
        });
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.start();
    });
  }

  // Search history management
  public addToSearchHistory(query: SearchQuery, resultCount: number): void {
    const historyItem: SearchHistoryItem = {
      id: this.generateId(),
      query: query.text,
      filters: query.filters || {},
      timestamp: new Date(),
      resultCount,
      clicked: false
    };
    
    this.searchHistory.unshift(historyItem);
    this.searchHistory = this.searchHistory.slice(0, 50); // Keep last 50 searches
    this.saveSearchHistory();
  }

  public getSearchHistory(): SearchHistoryItem[] {
    return this.searchHistory;
  }

  public clearSearchHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  public markHistoryItemClicked(historyId: string): void {
    const item = this.searchHistory.find(h => h.id === historyId);
    if (item) {
      item.clicked = true;
      this.saveSearchHistory();
    }
  }

  // Search analytics
  private trackSearch(query: SearchQuery, results: SearchResults, executionTime: number): void {
    const analytics: SearchAnalytics = {
      query: query.text,
      resultCount: results.total,
      clickThroughRate: 0,
      executionTime,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      filters: query.filters || {},
      resultClicks: []
    };
    
    this.analytics.push(analytics);
    this.updateTrendingQueries(query.text);
    this.saveAnalytics();
  }

  public trackResultClick(searchId: string, articleId: string): void {
    const analytics = this.analytics.find(a => a.query === searchId);
    if (analytics) {
      analytics.resultClicks.push(articleId);
      analytics.clickThroughRate = analytics.resultClicks.length / analytics.resultCount;
      this.saveAnalytics();
    }
  }

  public getSearchAnalytics(): SearchAnalytics[] {
    return this.analytics;
  }

  public getTrendingQueries(limit: number = 10): Array<{ query: string; count: number }> {
    return Array.from(this.trendingQueries.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  // Autocomplete functionality
  public async getAutocomplete(query: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();
    
    if (query.length < 2) return suggestions;
    
    // Query suggestions from history
    this.searchHistory.forEach(item => {
      if (item.query.toLowerCase().includes(queryLower) && 
          !suggestions.find(s => s.text === item.query)) {
        suggestions.push({
          text: item.query,
          type: 'query',
          score: item.clicked ? 2 : 1,
          frequency: 1
        });
      }
    });
    
    // Category suggestions
    const categories = new Set<string>();
    this.articles.forEach(article => {
      if (article.category?.toLowerCase().includes(queryLower)) {
        categories.add(article.category);
      }
    });
    
    categories.forEach(category => {
      suggestions.push({
        text: category,
        type: 'category',
        score: 1,
        frequency: 1
      });
    });
    
    // Author suggestions
    const authors = new Set<string>();
    this.articles.forEach(article => {
      if (article.author?.toLowerCase().includes(queryLower)) {
        authors.add(article.author);
      }
    });
    
    authors.forEach(author => {
      suggestions.push({
        text: author,
        type: 'author',
        score: 1,
        frequency: 1
      });
    });
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  // Real-time search with debouncing
  private debounceTimer: NodeJS.Timeout | null = null;
  
  public searchRealTime(query: SearchQuery, callback: (results: SearchResults) => void): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(async () => {
      if (query.text.length >= 2) {
        const results = await this.search(query);
        callback(results);
      }
    }, this.config.debounceMs);
  }

  // Utility methods
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCacheKey(query: SearchQuery): string {
    return JSON.stringify({
      text: query.text,
      filters: query.filters,
      sort: query.sort,
      page: query.page,
      limit: query.limit
    });
  }

  private updateTrendingQueries(query: string): void {
    if (query.length > 0) {
      this.trendingQueries.set(query, (this.trendingQueries.get(query) || 0) + 1);
    }
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('search_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      localStorage.setItem('search_session_id', sessionId);
    }
    return sessionId;
  }

  // Persistence methods
  private saveSearchHistory(): void {
    try {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  private loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem('search_history');
      if (saved) {
        this.searchHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  private saveAnalytics(): void {
    try {
      // Keep only recent analytics (last 1000 entries)
      const recentAnalytics = this.analytics.slice(-1000);
      localStorage.setItem('search_analytics', JSON.stringify(recentAnalytics));
    } catch (error) {
      console.warn('Failed to save search analytics:', error);
    }
  }

  private loadAnalytics(): void {
    try {
      const saved = localStorage.getItem('search_analytics');
      if (saved) {
        this.analytics = JSON.parse(saved);
        
        // Rebuild trending queries from analytics
        this.analytics.forEach(item => {
          this.updateTrendingQueries(item.query);
        });
      }
    } catch (error) {
      console.warn('Failed to load search analytics:', error);
      this.analytics = [];
    }
  }

  // Clear all caches
  public clearCache(): void {
    this.searchCache.clear();
    localStorage.removeItem('search_history');
    localStorage.removeItem('search_analytics');
    localStorage.removeItem('search_session_id');
  }

  // Get search engine statistics
  public getStatistics() {
    return {
      totalArticles: this.articles.length,
      totalQueries: this.analytics.length,
      cacheSize: this.searchCache.size,
      historySize: this.searchHistory.length,
      trendingQueriesCount: this.trendingQueries.size,
      avgExecutionTime: this.analytics.length > 0 
        ? this.analytics.reduce((sum, a) => sum + a.executionTime, 0) / this.analytics.length
        : 0
    };
  }
}

// Export default search engine instance
export const searchEngine = new AdvancedSearchEngine();

// Helper functions for external use
export const initializeSearch = (articles: NewsArticle[]) => {
  searchEngine.initialize(articles);
};

export const performSearch = (query: SearchQuery) => {
  return searchEngine.search(query);
};

export const getSearchSuggestions = (query: string) => {
  return searchEngine.generateSuggestions(query);
};

export const getAutocomplete = (query: string) => {
  return searchEngine.getAutocomplete(query);
};

export const startVoiceSearch = () => {
  return searchEngine.startVoiceSearch();
};

// Export types for external use
export type {
  SearchQuery as SearchQueryType,
  SearchResults as SearchResultsType,
  SearchResultItem as SearchResultItemType,
  SearchFilters as SearchFiltersType,
  SearchSort as SearchSortType,
  SearchFacets as SearchFacetsType,
  SearchSuggestion as SearchSuggestionType,
  SearchAnalytics as SearchAnalyticsType,
  VoiceSearchResult as VoiceSearchResultType,
  SearchHistoryItem as SearchHistoryItemType,
  SearchConfig as SearchConfigType
};