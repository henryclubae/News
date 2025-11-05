/**
 * Article Cache System
 * 
 * Specialized caching for news articles with intelligent TTL,
 * metadata management, and content-based optimization
 */

import { getCacheManager, CacheOptions, CACHE_STRATEGIES } from './cache';

// ===== INTERFACES =====

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  slug: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  trending: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readTime: number;
  image?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ArticleMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  readingTime: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface ArticleCacheConfig {
  baseTTL: number;
  popularityMultiplier: number;
  categoryTTL: Record<string, number>;
  enableMetrics: boolean;
  compressionThreshold: number;
}

// ===== ARTICLE CACHE MANAGER =====

export class ArticleCacheManager {
  private cacheManager = getCacheManager();
  private config: ArticleCacheConfig;
  
  constructor(config?: Partial<ArticleCacheConfig>) {
    this.config = {
      baseTTL: 3600, // 1 hour default
      popularityMultiplier: 2,
      categoryTTL: {
        breaking: 900,    // 15 minutes for breaking news
        sports: 1800,     // 30 minutes for sports
        politics: 2700,   // 45 minutes for politics
        technology: 3600, // 1 hour for tech
        entertainment: 7200, // 2 hours for entertainment
      },
      enableMetrics: true,
      compressionThreshold: 50 * 1024, // 50KB
      ...config,
    };
  }

  // ===== CORE CACHING METHODS =====

  async cacheArticle(article: Article, options?: Partial<CacheOptions>): Promise<void> {
    const ttl = this.calculateTTL(article);
    const shouldCompress = this.shouldCompress(article);
    
    const cacheOptions: CacheOptions = {
      ttl,
      tags: this.generateTags(article),
      priority: this.determinePriority(article),
      compress: shouldCompress,
      version: this.generateVersion(article),
      ...options,
    };

    // Cache the full article
    await this.cacheManager.set(
      this.getArticleKey(article.id),
      article,
      cacheOptions
    );

    // Cache article metadata separately for quick lookups
    await this.cacheArticleMetadata(article, cacheOptions);

    // Cache by slug for URL-based lookups
    await this.cacheManager.set(
      this.getSlugKey(article.slug),
      { id: article.id },
      { ...cacheOptions, ttl: ttl * 2 } // Slug mapping lasts longer
    );

    // Update category and author indexes
    await this.updateIndexes(article, cacheOptions);

    if (this.config.enableMetrics) {
      await this.trackCacheMetrics(article.id, 'cache');
    }
  }

  async getArticle(identifier: string): Promise<Article | null> {
    const startTime = Date.now();
    
    // Try by ID first
    let article = await this.cacheManager.get<Article>(this.getArticleKey(identifier));
    
    // If not found and looks like a slug, try slug lookup
    if (!article && !identifier.match(/^\d+$/)) {
      const slugData = await this.cacheManager.get<{ id: string }>(this.getSlugKey(identifier));
      if (slugData?.id) {
        article = await this.cacheManager.get<Article>(this.getArticleKey(slugData.id));
      }
    }

    if (article && this.config.enableMetrics) {
      await this.trackCacheMetrics(article.id, 'hit');
      await this.updatePopularityMetrics(article.id, Date.now() - startTime);
    }

    return article;
  }

  async getArticleMetadata(articleId: string): Promise<Partial<Article> | null> {
    return await this.cacheManager.get<Partial<Article>>(this.getMetadataKey(articleId));
  }

  async invalidateArticle(articleId: string): Promise<void> {
    await this.cacheManager.invalidateByTags([`article:${articleId}`]);
    
    if (this.config.enableMetrics) {
      await this.trackCacheMetrics(articleId, 'invalidate');
    }
  }

  // ===== BATCH OPERATIONS =====

  async cacheMultipleArticles(articles: Article[]): Promise<void> {
    const cachePromises = articles.map(article => this.cacheArticle(article));
    await Promise.allSettled(cachePromises);
  }

  async getMultipleArticles(identifiers: string[]): Promise<(Article | null)[]> {
    const promises = identifiers.map(id => this.getArticle(id));
    return await Promise.all(promises);
  }

  async getArticlesByCategory(category: string, limit: number = 10): Promise<Article[]> {
    const categoryKey = this.getCategoryKey(category);
    const cachedIds = await this.cacheManager.get<string[]>(categoryKey);
    
    if (!cachedIds) {
      return [];
    }

    const articles = await this.getMultipleArticles(cachedIds.slice(0, limit));
    return articles.filter((article): article is Article => article !== null);
  }

  async getArticlesByAuthor(authorId: string, limit: number = 10): Promise<Article[]> {
    const authorKey = this.getAuthorKey(authorId);
    const cachedIds = await this.cacheManager.get<string[]>(authorKey);
    
    if (!cachedIds) {
      return [];
    }

    const articles = await this.getMultipleArticles(cachedIds.slice(0, limit));
    return articles.filter((article): article is Article => article !== null);
  }

  async getTrendingArticles(limit: number = 10): Promise<Article[]> {
    const trendingKey = this.getTrendingKey();
    const cachedIds = await this.cacheManager.get<string[]>(trendingKey);
    
    if (!cachedIds) {
      return [];
    }

    const articles = await this.getMultipleArticles(cachedIds.slice(0, limit));
    return articles.filter((article): article is Article => article !== null);
  }

  // ===== CACHE WARMING =====

  async warmPopularArticles(): Promise<void> {
    console.log('[ArticleCache] Warming popular articles...');
    
    // This would typically fetch from your database or API
    // For now, we'll implement the caching logic
    try {
      const popularityKey = 'article:popularity:ranking';
      const popularIds = await this.cacheManager.get<string[]>(popularityKey);
      
      if (popularIds && popularIds.length > 0) {
        // Pre-warm the top 50 most popular articles
        const topIds = popularIds.slice(0, 50);
        console.log(`[ArticleCache] Pre-warming ${topIds.length} popular articles`);
        
        // Note: In a real implementation, you would fetch these from your database
        // await this.getMultipleArticles(topIds);
      }
    } catch (error) {
      console.error('[ArticleCache] Error warming popular articles:', error);
    }
  }

  async warmCategoryArticles(category: string): Promise<void> {
    console.log(`[ArticleCache] Warming articles for category: ${category}`);
    
    try {
      // Pre-warm recent articles in this category
      const categoryKey = this.getCategoryKey(category);
      const categoryIds = await this.cacheManager.get<string[]>(categoryKey);
      
      if (categoryIds && categoryIds.length > 0) {
        await this.getMultipleArticles(categoryIds.slice(0, 20));
      }
    } catch (error) {
      console.error(`[ArticleCache] Error warming category ${category}:`, error);
    }
  }

  // ===== HELPER METHODS =====

  private calculateTTL(article: Article): number {
    let ttl = this.config.baseTTL;
    
    // Adjust TTL based on category
    const categoryTTL = this.config.categoryTTL[article.category];
    if (categoryTTL) {
      ttl = categoryTTL;
    }

    // Popular articles get longer cache time
    if (article.trending || article.featured || article.viewCount > 10000) {
      ttl *= this.config.popularityMultiplier;
    }

    // Recent articles get shorter cache time to stay fresh
    const publishedTime = new Date(article.publishedAt).getTime();
    const hoursSincePublished = (Date.now() - publishedTime) / (1000 * 60 * 60);
    
    if (hoursSincePublished < 1) {
      ttl = Math.min(ttl, 900); // Max 15 minutes for very recent articles
    } else if (hoursSincePublished < 24) {
      ttl = Math.min(ttl, 1800); // Max 30 minutes for articles under 24 hours
    }

    return Math.max(300, ttl); // Minimum 5 minutes
  }

  private shouldCompress(article: Article): boolean {
    const estimatedSize = JSON.stringify(article).length;
    return estimatedSize > this.config.compressionThreshold;
  }

  private generateTags(article: Article): string[] {
    return [
      'articles',
      'content',
      `article:${article.id}`,
      `category:${article.category}`,
      `author:${article.author.id}`,
      ...article.tags.map(tag => `tag:${tag}`),
      ...(article.featured ? ['featured'] : []),
      ...(article.trending ? ['trending'] : []),
    ];
  }

  private determinePriority(article: Article): 'low' | 'medium' | 'high' {
    if (article.featured || article.trending) {
      return 'high';
    }
    
    if (article.viewCount > 5000 || article.category === 'breaking') {
      return 'medium';
    }
    
    return 'low';
  }

  private generateVersion(article: Article): string {
    // Use updatedAt timestamp as version for cache invalidation
    return new Date(article.updatedAt).getTime().toString();
  }

  private async cacheArticleMetadata(article: Article, options: CacheOptions): Promise<void> {
    const metadata = {
      id: article.id,
      title: article.title,
      summary: article.summary,
      slug: article.slug,
      category: article.category,
      author: article.author,
      publishedAt: article.publishedAt,
      featured: article.featured,
      trending: article.trending,
      viewCount: article.viewCount,
      readTime: article.readTime,
      image: article.image,
    };

    await this.cacheManager.set(
      this.getMetadataKey(article.id),
      metadata,
      { ...options, ttl: options.ttl! * 1.5 } // Metadata lasts longer
    );
  }

  private async updateIndexes(article: Article, options: CacheOptions): Promise<void> {
    // Update category index
    const categoryKey = this.getCategoryKey(article.category);
    let categoryIds = await this.cacheManager.get<string[]>(categoryKey) || [];
    
    // Add article to front of category list (most recent first)
    categoryIds = [article.id, ...categoryIds.filter(id => id !== article.id)];
    categoryIds = categoryIds.slice(0, 100); // Keep only latest 100
    
    await this.cacheManager.set(categoryKey, categoryIds, {
      ...options,
      ttl: options.ttl! * 2,
      tags: [`category:${article.category}`, 'indexes'],
    });

    // Update author index
    const authorKey = this.getAuthorKey(article.author.id);
    let authorIds = await this.cacheManager.get<string[]>(authorKey) || [];
    
    authorIds = [article.id, ...authorIds.filter(id => id !== article.id)];
    authorIds = authorIds.slice(0, 50); // Keep only latest 50 per author
    
    await this.cacheManager.set(authorKey, authorIds, {
      ...options,
      ttl: options.ttl! * 2,
      tags: [`author:${article.author.id}`, 'indexes'],
    });

    // Update trending index if applicable
    if (article.trending) {
      const trendingKey = this.getTrendingKey();
      let trendingIds = await this.cacheManager.get<string[]>(trendingKey) || [];
      
      trendingIds = [article.id, ...trendingIds.filter(id => id !== article.id)];
      trendingIds = trendingIds.slice(0, 20); // Keep only top 20 trending
      
      await this.cacheManager.set(trendingKey, trendingIds, {
        ttl: 1800, // Trending changes frequently
        tags: ['trending', 'indexes'],
      });
    }
  }

  private async trackCacheMetrics(articleId: string, action: 'cache' | 'hit' | 'invalidate'): Promise<void> {
    try {
      const metricsKey = this.getMetricsKey(articleId);
      const metrics = await this.cacheManager.get<ArticleMetrics>(metricsKey) || {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        readingTime: 0,
        bounceRate: 0,
        avgTimeOnPage: 0,
      };

      switch (action) {
        case 'hit':
          metrics.views++;
          break;
        case 'cache':
          // Track cache operations
          break;
        case 'invalidate':
          // Track invalidations
          break;
      }

      await this.cacheManager.set(metricsKey, metrics, {
        ttl: 86400, // 24 hours
        tags: [`article:${articleId}`, 'metrics'],
      });
    } catch (error) {
      console.error(`[ArticleCache] Error tracking metrics for ${articleId}:`, error);
    }
  }

  private async updatePopularityMetrics(articleId: string, responseTime: number): Promise<void> {
    try {
      const popularityKey = 'article:popularity:ranking';
      let rankings = await this.cacheManager.get<Array<{ id: string; score: number }>>(popularityKey) || [];
      
      const existingIndex = rankings.findIndex(item => item.id === articleId);
      const scoreBoost = Math.max(1, 10 - Math.log10(responseTime)); // Faster access = higher score
      
      if (existingIndex >= 0) {
        rankings[existingIndex].score += scoreBoost;
      } else {
        rankings.push({ id: articleId, score: scoreBoost });
      }

      // Sort by score and keep top 1000
      rankings.sort((a, b) => b.score - a.score);
      rankings = rankings.slice(0, 1000);

      await this.cacheManager.set(popularityKey, rankings, {
        ttl: 3600, // Update hourly
        tags: ['popularity', 'rankings'],
      });
    } catch (error) {
      console.error(`[ArticleCache] Error updating popularity for ${articleId}:`, error);
    }
  }

  // ===== KEY GENERATION =====

  private getArticleKey(articleId: string): string {
    return `article:${articleId}`;
  }

  private getMetadataKey(articleId: string): string {
    return `article:metadata:${articleId}`;
  }

  private getSlugKey(slug: string): string {
    return `article:slug:${slug}`;
  }

  private getCategoryKey(category: string): string {
    return `article:category:${category}`;
  }

  private getAuthorKey(authorId: string): string {
    return `article:author:${authorId}`;
  }

  private getTrendingKey(): string {
    return 'article:trending';
  }

  private getMetricsKey(articleId: string): string {
    return `article:metrics:${articleId}`;
  }

  // ===== CACHE MAINTENANCE =====

  async performMaintenance(): Promise<void> {
    console.log('[ArticleCache] Performing maintenance...');
    
    try {
      // Clean up expired metrics
      await this.cacheManager.invalidateByTags(['metrics']);
      
      // Update popularity rankings
      await this.updateGlobalPopularityRankings();
      
      // Cleanup old indexes
      await this.cleanupIndexes();
      
      console.log('[ArticleCache] Maintenance completed');
    } catch (error) {
      console.error('[ArticleCache] Maintenance error:', error);
    }
  }

  private async updateGlobalPopularityRankings(): Promise<void> {
    // Implementation would aggregate article metrics and update global rankings
    console.log('[ArticleCache] Updating global popularity rankings...');
  }

  private async cleanupIndexes(): Promise<void> {
    // Clean up category indexes
    const categories = ['breaking', 'sports', 'politics', 'technology', 'entertainment'];
    
    for (const category of categories) {
      try {
        const categoryKey = this.getCategoryKey(category);
        const categoryIds = await this.cacheManager.get<string[]>(categoryKey);
        
        if (categoryIds && categoryIds.length > 100) {
          const trimmedIds = categoryIds.slice(0, 100);
          await this.cacheManager.set(categoryKey, trimmedIds, {
            ttl: CACHE_STRATEGIES.article.ttl * 2,
            tags: [`category:${category}`, 'indexes'],
          });
        }
      } catch (error) {
        console.error(`[ArticleCache] Error cleaning up category ${category}:`, error);
      }
    }
  }

  // ===== ANALYTICS =====

  async getCacheAnalytics(): Promise<{
    totalArticles: number;
    popularArticles: Array<{ id: string; score: number }>;
    categoryDistribution: Record<string, number>;
    hitRate: number;
  }> {
    try {
      const stats = await this.cacheManager.getStats();
      const popularityKey = 'article:popularity:ranking';
      const popularArticles = await this.cacheManager.get<Array<{ id: string; score: number }>>(popularityKey) || [];
      
      // Count articles by category (simplified)
      const categoryDistribution: Record<string, number> = {};
      const categories = ['breaking', 'sports', 'politics', 'technology', 'entertainment'];
      
      for (const category of categories) {
        const categoryKey = this.getCategoryKey(category);
        const categoryIds = await this.cacheManager.get<string[]>(categoryKey);
        categoryDistribution[category] = categoryIds?.length || 0;
      }

      return {
        totalArticles: stats.totalKeys,
        popularArticles: popularArticles.slice(0, 10),
        categoryDistribution,
        hitRate: stats.hitRate,
      };
    } catch (error) {
      console.error('[ArticleCache] Error getting analytics:', error);
      return {
        totalArticles: 0,
        popularArticles: [],
        categoryDistribution: {},
        hitRate: 0,
      };
    }
  }
}

// ===== SINGLETON INSTANCE =====

let articleCacheManager: ArticleCacheManager | null = null;

export function getArticleCacheManager(): ArticleCacheManager {
  if (!articleCacheManager) {
    articleCacheManager = new ArticleCacheManager();
  }
  return articleCacheManager;
}

export default ArticleCacheManager;