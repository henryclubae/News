// ============================================================================
// API USAGE EXAMPLES AND DEMO
// ============================================================================

import { 
  getLatestNews, 
  getNewsByCategory, 
  searchNews, 
  getTrendingNews,
  getNewsSources,
  APIError,
  newsService
} from './api';

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

/**
 * Example: Get latest news articles
 */
export async function demonstrateLatestNews() {
  try {
    console.log('📰 Fetching latest news...');
    
    // Get latest news with default options
    const articles = await getLatestNews();
    console.log(`✅ Found ${articles.length} latest articles`);
    
    // Get latest news with custom options
    const customArticles = await getLatestNews({
      pageSize: 10,
      sortBy: 'publishedAt',
      language: 'en',
      from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    });
    console.log(`✅ Found ${customArticles.length} articles from last 24 hours`);
    
    return articles;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`❌ API Error: ${error.message} (Code: ${error.code})`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    throw error;
  }
}

/**
 * Example: Get news by category
 */
export async function demonstrateCategoryNews() {
  try {
    console.log('🏷️ Fetching technology news...');
    
    const techNews = await getNewsByCategory('technology', {
      pageSize: 15,
      sortBy: 'popularity',
    });
    
    console.log(`✅ Found ${techNews.length} technology articles`);
    console.log('Top articles:', techNews.slice(0, 3).map(a => a.title));
    
    return techNews;
  } catch (error) {
    console.error('❌ Error fetching category news:', error);
    throw error;
  }
}

/**
 * Example: Search for specific news
 */
export async function demonstrateNewsSearch() {
  try {
    console.log('🔍 Searching for AI-related news...');
    
    const aiNews = await searchNews('artificial intelligence', {
      pageSize: 10,
      sortBy: 'relevancy',
      searchIn: 'title',
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
    });
    
    console.log(`✅ Found ${aiNews.length} AI-related articles`);
    
    // Search with category filter
    const techAINews = await searchNews('machine learning', {
      category: 'technology',
      pageSize: 5,
    });
    
    console.log(`✅ Found ${techAINews.length} ML articles in technology category`);
    
    return { aiNews, techAINews };
  } catch (error) {
    console.error('❌ Error searching news:', error);
    throw error;
  }
}

/**
 * Example: Get trending news
 */
export async function demonstrateTrendingNews() {
  try {
    console.log('📈 Fetching trending news...');
    
    const trending = await getTrendingNews({
      pageSize: 8,
    });
    
    console.log(`✅ Found ${trending.length} trending articles`);
    console.log('Trending topics:', trending.map(a => a.title.substring(0, 50) + '...'));
    
    return trending;
  } catch (error) {
    console.error('❌ Error fetching trending news:', error);
    throw error;
  }
}

/**
 * Example: Get available news sources
 */
export async function demonstrateNewsSources() {
  try {
    console.log('📡 Fetching available news sources...');
    
    const sources = await getNewsSources();
    console.log(`✅ Found ${sources.length} news sources`);
    console.log('Sources:', sources.map(s => `${s.name} (${s.id})`));
    
    return sources;
  } catch (error) {
    console.error('❌ Error fetching news sources:', error);
    throw error;
  }
}

// ============================================================================
// ADVANCED USAGE EXAMPLES
// ============================================================================

/**
 * Example: Using the NewsService class directly for advanced operations
 */
export async function demonstrateAdvancedUsage() {
  try {
    console.log('⚙️ Demonstrating advanced API usage...');
    
    // Get cache statistics
    const cacheStats = newsService.getCacheStats();
    console.log(`📊 Cache stats: ${cacheStats.size}/${cacheStats.maxSize} items`);
    
    // Fetch news from multiple categories in parallel
    const categories = ['technology', 'business', 'science'];
    const categoryPromises = categories.map(cat => 
      newsService.getNewsByCategory(cat, { pageSize: 5 })
    );
    
    const categoryResults = await Promise.allSettled(categoryPromises);
    
    categoryResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${categories[index]}: ${result.value.length} articles`);
      } else {
        console.log(`❌ ${categories[index]}: Failed to fetch`);
      }
    });
    
    // Clear cache for fresh data
    newsService.clearCache();
    console.log('🗑️ Cache cleared');
    
    return categoryResults;
  } catch (error) {
    console.error('❌ Error in advanced usage:', error);
    throw error;
  }
}

/**
 * Example: Error handling and retry scenarios
 */
export async function demonstrateErrorHandling() {
  try {
    console.log('🛡️ Demonstrating error handling...');
    
    // This will demonstrate rate limiting and retry logic
    const promises = Array(5).fill(0).map(() => 
      getLatestNews({ pageSize: 1 })
    );
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Request ${index + 1}: Success`);
      } else {
        if (result.reason instanceof APIError) {
          console.log(`❌ Request ${index + 1}: API Error - ${result.reason.code}`);
        } else {
          console.log(`❌ Request ${index + 1}: Unknown error`);
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error in error handling demo:', error);
    throw error;
  }
}

/**
 * Example: Filtering and sorting results
 */
export async function demonstrateFiltering() {
  try {
    console.log('🔧 Demonstrating filtering and sorting...');
    
    // Get news and filter by criteria
    const articles = await getLatestNews({ pageSize: 50 });
    
    // Filter articles by reading time (less than 5 minutes)
    const quickReads = articles.filter(article => article.readingTime <= 5);
    console.log(`📖 Found ${quickReads.length} quick reads (≤5 min)`);
    
    // Filter articles with images
    const articlesWithImages = articles.filter(article => article.imageUrl);
    console.log(`🖼️ Found ${articlesWithImages.length} articles with images`);
    
    // Sort by view count (if available) or reading time
    const sortedByEngagement = [...articles].sort((a, b) => {
      const aScore = (a.viewCount || 0) + (a.featured ? 100 : 0);
      const bScore = (b.viewCount || 0) + (b.featured ? 100 : 0);
      return bScore - aScore;
    });
    
    console.log('🏆 Top engagement articles:', 
      sortedByEngagement.slice(0, 3).map(a => a.title)
    );
    
    return {
      quickReads,
      articlesWithImages,
      topEngagement: sortedByEngagement.slice(0, 5)
    };
  } catch (error) {
    console.error('❌ Error in filtering demo:', error);
    throw error;
  }
}

// ============================================================================
// COMPREHENSIVE DEMO RUNNER
// ============================================================================

/**
 * Run all API demonstrations
 */
export async function runAllDemonstrations() {
  console.log('🚀 Starting comprehensive API demonstration...\n');
  
  const results: Record<string, unknown> = {};
  
  try {
    // Basic operations
    results.latest = await demonstrateLatestNews();
    console.log('');
    
    results.category = await demonstrateCategoryNews();
    console.log('');
    
    results.search = await demonstrateNewsSearch();
    console.log('');
    
    results.trending = await demonstrateTrendingNews();
    console.log('');
    
    results.sources = await demonstrateNewsSources();
    console.log('');
    
    // Advanced operations
    results.advanced = await demonstrateAdvancedUsage();
    console.log('');
    
    results.errorHandling = await demonstrateErrorHandling();
    console.log('');
    
    results.filtering = await demonstrateFiltering();
    console.log('');
    
    console.log('🎉 All demonstrations completed successfully!');
    return results;
    
  } catch (error) {
    console.error('💥 Demo failed:', error);
    throw error;
  }
}

// ============================================================================
// CONFIGURATION EXAMPLES
// ============================================================================

/**
 * Example: Environment-specific configurations
 */
export const API_CONFIGURATIONS = {
  development: {
    enableVerboseLogging: true,
    cacheEnabled: true,
    rateLimitEnabled: false,
    retryAttempts: 2,
  },
  
  production: {
    enableVerboseLogging: false,
    cacheEnabled: true,
    rateLimitEnabled: true,
    retryAttempts: 3,
  },
  
  testing: {
    enableVerboseLogging: false,
    cacheEnabled: false,
    rateLimitEnabled: false,
    retryAttempts: 1,
  }
};

/**
 * Example: Custom error handling function
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'NETWORK_ERROR':
        return 'Network connection problem. Please check your internet connection.';
      case 'API_REQUEST_FAILED':
        return `API request failed: ${error.message}`;
      case 'REQUEST_TIMEOUT':
        return 'Request timed out. Please try again.';
      default:
        return `API error: ${error.message}`;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Example: Performance monitoring
 */
export class APIPerformanceMonitor {
  private static requestTimes: number[] = [];
  
  static startRequest(): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.requestTimes.push(duration);
      
      // Keep only last 100 requests
      if (this.requestTimes.length > 100) {
        this.requestTimes.shift();
      }
      
      console.log(`⏱️ Request completed in ${duration}ms`);
    };
  }
  
  static getAverageResponseTime(): number {
    if (this.requestTimes.length === 0) return 0;
    
    const sum = this.requestTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.requestTimes.length);
  }
  
  static getStats() {
    return {
      totalRequests: this.requestTimes.length,
      averageTime: this.getAverageResponseTime(),
      fastestRequest: Math.min(...this.requestTimes),
      slowestRequest: Math.max(...this.requestTimes),
    };
  }
}

// Export everything for easy usage
const APIDemoExports = {
  demonstrateLatestNews,
  demonstrateCategoryNews,
  demonstrateNewsSearch,
  demonstrateTrendingNews,
  demonstrateNewsSources,
  demonstrateAdvancedUsage,
  demonstrateErrorHandling,
  demonstrateFiltering,
  runAllDemonstrations,
  handleAPIError,
  APIPerformanceMonitor,
  API_CONFIGURATIONS,
};

export default APIDemoExports;