# News Website API Layer

A comprehensive, production-ready API layer for fetching news from multiple sources with advanced features like caching, rate limiting, retry logic, and error handling.

## 🚀 Features

- **Multiple News Sources**: Integrate NewsAPI and Guardian API
- **Smart Caching**: Built-in caching with configurable TTL
- **Rate Limiting**: Automatic rate limit handling and backoff
- **Retry Logic**: Intelligent retry mechanism for failed requests
- **Error Handling**: Comprehensive error handling with typed exceptions
- **Data Normalization**: Consistent data structure across different sources
- **TypeScript Support**: Full TypeScript support with proper typing
- **Performance Monitoring**: Built-in performance tracking
- **Request/Response Interceptors**: Middleware for logging and authentication

## 📦 Installation

```bash
# Install required dependencies
npm install

# Set up environment variables
cp .env.example .env
```

## 🔧 Environment Setup

Create a `.env.local` file with your API keys:

```env
NEXT_PUBLIC_NEWSAPI_KEY=your_newsapi_key_here
NEXT_PUBLIC_GUARDIAN_API_KEY=your_guardian_api_key_here
```

### Getting API Keys

1. **NewsAPI**: Register at [newsapi.org](https://newsapi.org) for free
2. **Guardian API**: Get your key at [open-platform.theguardian.com](https://open-platform.theguardian.com)

## 🎯 Quick Start

```typescript
import { getLatestNews, searchNews, getNewsByCategory } from '@/lib/api';

// Get latest news
const articles = await getLatestNews();

// Search for specific topics
const aiNews = await searchNews('artificial intelligence');

// Get news by category
const techNews = await getNewsByCategory('technology');
```

## 📚 API Reference

### Core Functions

#### `getLatestNews(options?: RequestOptions)`

Fetch the latest news articles from all sources.

```typescript
const articles = await getLatestNews({
  pageSize: 20,
  page: 1,
  sortBy: 'publishedAt',
  language: 'en',
  from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
});
```

#### `getNewsByCategory(category: string, options?: RequestOptions)`

Get news articles filtered by category.

```typescript
const techNews = await getNewsByCategory('technology', {
  pageSize: 15,
  sortBy: 'popularity'
});
```

#### `searchNews(query: string, options?: SearchOptions)`

Search for news articles with advanced filtering.

```typescript
const results = await searchNews('climate change', {
  pageSize: 10,
  sortBy: 'relevancy',
  searchIn: 'title',
  category: 'science',
  from: new Date('2024-01-01')
});
```

#### `getTrendingNews(options?: RequestOptions)`

Get trending news articles (cached for 10 minutes).

```typescript
const trending = await getTrendingNews({
  pageSize: 8
});
```

#### `getNewsSources()`

Get available news sources.

```typescript
const sources = await getNewsSources();
```

### Advanced Usage

#### Using the NewsService Class

```typescript
import { newsService } from '@/lib/api';

// Get cache statistics
const stats = newsService.getCacheStats();
console.log(`Cache: ${stats.size}/${stats.maxSize} items`);

// Clear cache
newsService.clearCache();

// Direct access to individual API clients
const articles = await newsService.getLatestNews();
```

### Error Handling

```typescript
import { APIError, handleAPIError } from '@/lib/api';

try {
  const articles = await getLatestNews();
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error: ${error.code} - ${error.message}`);
    
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        // Handle rate limit
        break;
      case 'NETWORK_ERROR':
        // Handle network issues
        break;
      default:
        // Handle other errors
    }
  }
  
  // Or use the helper function
  const userMessage = handleAPIError(error);
  console.log(userMessage);
}
```

## 🔧 Configuration

### Request Options

```typescript
interface RequestOptions {
  page?: number;           // Page number (default: 1)
  pageSize?: number;       // Articles per page (default: 20)
  sortBy?: 'publishedAt' | 'relevancy' | 'popularity';
  language?: string;       // Language code (default: 'en')
  from?: Date;            // Start date
  to?: Date;              // End date
  domains?: string[];     // Include specific domains
  excludeDomains?: string[]; // Exclude domains
  sources?: string[];     // Include specific sources
}
```

### Search Options

```typescript
interface SearchOptions extends RequestOptions {
  query: string;          // Search query
  searchIn?: 'title' | 'description' | 'content';
  category?: string;      // Filter by category
}
```

### Cache Configuration

```typescript
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000,    // 5 minutes
  SEARCH_TTL: 2 * 60 * 1000,     // 2 minutes  
  TRENDING_TTL: 10 * 60 * 1000,  // 10 minutes
  MAX_CACHE_SIZE: 100,           // Max cached items
};
```

### Rate Limiting

```typescript
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_HOUR: 1000,
  MAX_REQUESTS_PER_MINUTE: 100,
  BACKOFF_BASE: 1000,
  MAX_BACKOFF: 30000,
};
```

## 🎨 Usage Examples

### Basic News Feed

```typescript
import { getLatestNews } from '@/lib/api';

export async function NewsPage() {
  const articles = await getLatestNews({
    pageSize: 10,
    sortBy: 'publishedAt'
  });

  return (
    <div>
      {articles.map(article => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <span>By {article.author.name}</span>
        </article>
      ))}
    </div>
  );
}
```

### Search Component

```typescript
import { searchNews } from '@/lib/api';
import { useState, useEffect } from 'react';

export function SearchNews({ query }: { query: string }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function search() {
      if (!query) return;
      
      setLoading(true);
      try {
        const results = await searchNews(query, {
          pageSize: 20,
          sortBy: 'relevancy'
        });
        setArticles(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [query]);

  if (loading) return <div>Searching...</div>;

  return (
    <div>
      <h2>Search Results for "{query}"</h2>
      {articles.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

### Category Navigation

```typescript
import { getNewsByCategory } from '@/lib/api';

const categories = ['technology', 'business', 'science', 'sports'];

export async function CategoryPage({ category }: { category: string }) {
  const articles = await getNewsByCategory(category, {
    pageSize: 15,
    sortBy: 'publishedAt'
  });

  return (
    <div>
      <h1>{category.charAt(0).toUpperCase() + category.slice(1)} News</h1>
      {articles.map(article => (
        <article key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
          <small>{article.readingTime} min read</small>
        </article>
      ))}
    </div>
  );
}
```

### Performance Monitoring

```typescript
import { APIPerformanceMonitor } from '@/lib/api-demo';

// Monitor API performance
const endTimer = APIPerformanceMonitor.startRequest();

try {
  const articles = await getLatestNews();
  // Process articles...
} finally {
  endTimer(); // Records the request time
}

// Get performance stats
const stats = APIPerformanceMonitor.getStats();
console.log(`Average response time: ${stats.averageTime}ms`);
```

## 🧪 Testing

Run the comprehensive demo to test all API functionality:

```typescript
import { runAllDemonstrations } from '@/lib/api-demo';

// Run all API tests
await runAllDemonstrations();
```

Individual test functions:

```typescript
import APIDemos from '@/lib/api-demo';

// Test specific functionality
await APIDemos.demonstrateLatestNews();
await APIDemos.demonstrateNewsSearch();
await APIDemos.demonstrateErrorHandling();
```

## 🚀 Production Deployment

### Environment-Specific Configurations

```typescript
// Development
const devConfig = {
  enableVerboseLogging: true,
  cacheEnabled: true,
  rateLimitEnabled: false,
  retryAttempts: 2,
};

// Production
const prodConfig = {
  enableVerboseLogging: false,
  cacheEnabled: true,
  rateLimitEnabled: true,
  retryAttempts: 3,
};
```

### Best Practices

1. **API Key Security**: Store API keys in environment variables
2. **Error Handling**: Always handle API errors gracefully
3. **Caching**: Use appropriate cache TTL for different content types
4. **Rate Limiting**: Respect API rate limits to avoid blocks
5. **Performance**: Monitor API response times and cache hit rates
6. **Fallbacks**: Implement fallback strategies for API failures

### Performance Optimization

- Enable caching in production
- Use appropriate page sizes (10-20 articles)
- Implement pagination for large result sets
- Cache expensive search queries
- Monitor and optimize API response times

## 🛡️ Error Codes

| Code | Description | Action |
|------|-------------|---------|
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `NETWORK_ERROR` | Connection failed | Check network |
| `API_REQUEST_FAILED` | API returned error | Check API status |
| `REQUEST_TIMEOUT` | Request timed out | Retry request |

## 📈 Monitoring

The API layer provides built-in monitoring:

- Request/response logging
- Performance timing
- Cache hit/miss rates
- Error tracking
- Rate limit monitoring

## 🔄 Updates

To update the API layer:

1. Check for new API versions
2. Update environment variables
3. Test with new endpoints
4. Monitor for breaking changes
5. Update documentation

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update documentation
5. Monitor performance impact

## 📄 License

MIT License - see LICENSE file for details.

---

*This API layer provides a robust foundation for news applications with enterprise-level features and reliability.*
