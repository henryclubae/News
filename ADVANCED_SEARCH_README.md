# Advanced Search System Documentation

## Overview

The Advanced Search System is a comprehensive, enterprise-grade search solution for news websites built with TypeScript, React, and Next.js. It provides intelligent full-text search capabilities with features comparable to Elasticsearch and Algolia, while running entirely in the browser with local caching and offline support.

## Architecture

### Core Components

1. **Search Engine** (`src/lib/search.ts`)
   - Full-text search with fuzzy matching
   - TF-IDF scoring algorithm
   - Intelligent ranking and relevance
   - Real-time indexing and caching

2. **React Components** (`src/components/search/`)
   - Advanced search interface
   - Filter panels and controls
   - Result display with highlighting
   - Voice search integration

3. **Custom Hook** (`src/hooks/useAdvancedSearch.ts`)
   - State management for search functionality
   - Debounced search execution
   - History and analytics tracking

4. **Type Definitions** (`src/types/news.ts`)
   - Comprehensive TypeScript interfaces
   - Search query and result types
   - Filter and facet definitions

## Features

### 🔍 Full-Text Search
- **Tokenization**: Smart word extraction with stemming
- **Fuzzy Matching**: Jaro-Winkler similarity algorithm for typo tolerance  
- **TF-IDF Scoring**: Term frequency-inverse document frequency ranking
- **Boolean Logic**: AND/OR query support
- **Phrase Matching**: Exact phrase search capabilities

```typescript
// Example: Basic search
const results = await searchEngine.search({
  text: "artificial intelligence healthcare",
  highlight: true,
  facets: true
});
```

### 🎯 Advanced Filtering
- **Category Filtering**: Filter by article categories
- **Author Filtering**: Search by specific authors
- **Date Range**: Time-based filtering with presets
- **Media Filtering**: Articles with/without images/videos
- **Language Support**: Multi-language content filtering
- **Custom Attributes**: Extensible filtering system

```typescript
// Example: Advanced filtering
const results = await searchEngine.search({
  text: "climate change",
  filters: {
    categories: ["Environment", "Science"],
    dateRange: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31")
    },
    hasImages: true,
    authors: ["Dr. Sarah Johnson"]
  }
});
```

### 🏆 Intelligent Ranking
- **Relevance Scoring**: Multi-factor relevance calculation
- **Boost Factors**: Configurable field importance weights
- **Freshness Boost**: Recent content prioritization
- **Popularity Signals**: View count and engagement metrics
- **Custom Scoring**: Extensible scoring algorithms

```typescript
// Boost configuration
const config = {
  boostFactors: {
    title: 3.0,      // Title matches get 3x boost
    content: 1.0,    // Base content scoring
    summary: 2.0,    // Summary matches get 2x boost
    tags: 2.5,       // Tag matches get 2.5x boost
    author: 1.5      // Author matches get 1.5x boost
  }
};
```

### 💡 Auto-complete & Suggestions
- **Real-time Suggestions**: As-you-type query suggestions
- **Category Suggestions**: Smart category recommendations
- **Author Suggestions**: Author name auto-completion
- **Tag Suggestions**: Popular tag recommendations
- **Query History**: Previous search suggestions

```typescript
// Example: Get autocomplete suggestions
const suggestions = await searchEngine.getAutocomplete("artifi");
// Returns: [
//   { text: "artificial intelligence", type: "query", score: 0.95 },
//   { text: "artificial", type: "tag", score: 0.8 }
// ]
```

### 🎤 Voice Search Integration
- **Web Speech API**: Browser-based speech recognition
- **Multi-language Support**: Configurable language detection
- **Confidence Scoring**: Speech recognition accuracy metrics
- **Error Handling**: Graceful fallback mechanisms

```typescript
// Example: Voice search
const voiceResult = await searchEngine.startVoiceSearch();
console.log(voiceResult.transcript); // "artificial intelligence in healthcare"
console.log(voiceResult.confidence); // 0.95
```

### 📊 Search Analytics
- **Query Tracking**: Search term frequency analysis
- **Performance Metrics**: Response time monitoring
- **Click-through Rates**: Result engagement tracking
- **Trending Queries**: Popular search identification
- **User Behavior**: Search pattern analysis

```typescript
// Example: Analytics data
const analytics = searchEngine.getSearchAnalytics();
const trending = searchEngine.getTrendingQueries(10);
const stats = searchEngine.getStatistics();
```

### 📚 Search History
- **Local Storage**: Persistent search history
- **Quick Replay**: One-click search repetition
- **Filter Preservation**: Complete search context saving
- **Privacy Controls**: History clearing and management

### 🔧 Real-time Search
- **Debounced Input**: Optimized search execution
- **Live Results**: Instant result updates
- **Performance Optimization**: Intelligent caching
- **Smooth UX**: Loading states and transitions

## API Reference

### SearchEngine Class

#### Constructor
```typescript
const engine = new AdvancedSearchEngine(config?: Partial<SearchConfig>)
```

#### Methods

##### `initialize(articles: NewsArticle[]): void`
Initialize the search engine with articles data.

##### `search(query: SearchQuery): Promise<SearchResults>`
Perform a search with the given query parameters.

##### `addArticles(articles: NewsArticle[]): void`
Add new articles to the search index.

##### `updateArticle(article: NewsArticle): void`
Update an existing article in the search index.

##### `removeArticle(articleId: string): void`
Remove an article from the search index.

##### `generateSuggestions(query: string): Promise<string[]>`
Get search suggestions for a query string.

##### `getAutocomplete(query: string): Promise<SearchSuggestion[]>`
Get typed autocomplete suggestions.

##### `startVoiceSearch(): Promise<VoiceSearchResult>`
Initiate voice search using Web Speech API.

### Search Query Interface

```typescript
interface SearchQuery {
  text: string;                    // Search query text
  filters?: SearchFilters;         // Optional filters
  sort?: SearchSort;              // Sort configuration
  page?: number;                  // Page number (1-based)
  limit?: number;                 // Results per page
  highlight?: boolean;            // Enable result highlighting
  facets?: boolean;              // Include facet information
}
```

### Search Filters Interface

```typescript
interface SearchFilters {
  categories?: string[];           // Filter by categories
  authors?: string[];             // Filter by authors
  languages?: string[];           // Filter by languages
  dateRange?: {                   // Date range filter
    start: Date;
    end: Date;
  };
  sources?: string[];             // Filter by sources
  minReadTime?: number;           // Minimum read time
  maxReadTime?: number;           // Maximum read time
  hasImages?: boolean;            // Has images filter
  hasVideo?: boolean;             // Has video filter
  sentiment?: 'positive' | 'negative' | 'neutral';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
```

### Search Results Interface

```typescript
interface SearchResults {
  items: SearchResultItem[];       // Search result items
  total: number;                  // Total result count
  page: number;                   // Current page
  limit: number;                  // Results per page
  totalPages: number;             // Total page count
  facets: SearchFacets;          // Facet information
  suggestions: string[];          // Query suggestions
  query: SearchQuery;            // Original query
  executionTime: number;         // Search execution time (ms)
  searchId: string;              // Unique search identifier
}
```

## React Components

### AdvancedSearchComponent

```typescript
interface AdvancedSearchProps {
  articles: NewsArticle[];        // Articles to search
  onResultSelect?: (article: NewsArticle) => void;
  initialQuery?: string;          // Initial search query
  showFilters?: boolean;         // Show filter panel
  showHistory?: boolean;         // Show search history
  showVoiceSearch?: boolean;     // Show voice search button
  className?: string;            // Custom CSS class
}
```

### useAdvancedSearch Hook

```typescript
const searchHook = useAdvancedSearch({
  articles: newsArticles,
  enableRealTimeSearch: true,
  enableVoiceSearch: true,
  enableHistory: true,
  enableAnalytics: true
});

// Hook returns
const {
  query, results, loading, error,
  setQuery, search, clearSearch,
  filters, setFilters, updateFilter,
  sort, setSort, currentPage, setPage,
  suggestions, autocomplete, showAutocomplete,
  history, startVoiceSearch, trackResultClick
} = searchHook;
```

## Configuration

### Search Engine Configuration

```typescript
interface SearchConfig {
  maxResults: number;             // Maximum results to return
  fuzzyThreshold: number;         // Fuzzy matching threshold (0-1)
  highlightTags: {               // HTML tags for highlighting
    pre: string;
    post: string;
  };
  boostFactors: {                // Field importance weights
    title: number;
    content: number;
    summary: number;
    tags: number;
    author: number;
  };
  debounceMs: number;            // Debounce delay for real-time search
  cacheExpiry: number;           // Cache expiration time (ms)
}
```

### Default Configuration

```typescript
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
```

## Usage Examples

### Basic Implementation

```typescript
// 1. Initialize search engine
import { searchEngine, initializeSearch } from '@/lib/search';
import { NewsArticle } from '@/types/news';

const articles: NewsArticle[] = [
  // ... your articles
];

initializeSearch(articles);

// 2. Perform search
const results = await searchEngine.search({
  text: "artificial intelligence",
  highlight: true,
  facets: true,
  limit: 20
});

console.log(`Found ${results.total} results in ${results.executionTime}ms`);
```

### React Component Usage

```tsx
import AdvancedSearchComponent from '@/components/search/AdvancedSearch';

function SearchPage() {
  const handleArticleSelect = (article: NewsArticle) => {
    // Handle article selection
    router.push(`/articles/${article.slug}`);
  };

  return (
    <div>
      <AdvancedSearchComponent
        articles={articles}
        onResultSelect={handleArticleSelect}
        showFilters={true}
        showHistory={true}
        showVoiceSearch={true}
      />
    </div>
  );
}
```

### Custom Hook Usage

```tsx
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

function CustomSearchComponent() {
  const search = useAdvancedSearch({
    articles: newsArticles,
    enableRealTimeSearch: true,
    enableAnalytics: true
  });

  return (
    <div>
      <input
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        placeholder="Search articles..."
      />
      
      {search.loading && <div>Searching...</div>}
      
      {search.results && (
        <div>
          <p>{search.results.total} results found</p>
          {search.results.items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Performance Optimization

### Indexing Strategy
- **Incremental Updates**: Only re-index changed articles
- **Lazy Loading**: Index articles as needed
- **Memory Management**: Automatic cache cleanup
- **Batch Processing**: Efficient bulk operations

### Caching
- **Result Caching**: Cache search results for repeated queries
- **Index Caching**: Persistent search index storage
- **Browser Storage**: LocalStorage for offline capability
- **Memory Limits**: Automatic cache size management

### Search Optimization
- **Debounced Queries**: Prevent excessive API calls
- **Query Normalization**: Consistent query processing
- **Stop Words**: Filter common words for better results
- **Stemming**: Reduce words to root forms

## Browser Compatibility

### Required APIs
- **Web Speech API**: Voice search functionality
- **LocalStorage**: Search history and caching
- **IndexedDB**: Large data storage (future enhancement)
- **Web Workers**: Background processing (future enhancement)

### Supported Browsers
- **Chrome**: 60+ (Full support)
- **Firefox**: 55+ (Full support)
- **Safari**: 12+ (Limited voice search)
- **Edge**: 79+ (Full support)
- **Mobile**: iOS 12+, Android 7+

## Deployment

### Production Considerations

1. **Environment Variables**
```env
NEXT_PUBLIC_SEARCH_API_URL=https://api.example.com/search
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_VOICE_SEARCH_ENABLED=true
```

2. **Build Optimization**
```json
// next.config.mjs
{
  "webpack": {
    "splitChunks": {
      "cacheGroups": {
        "search": {
          "test": /[\\/]lib[\\/]search/,
          "name": "search-engine",
          "chunks": "all"
        }
      }
    }
  }
}
```

3. **CDN Integration**
- Serve search assets from CDN
- Cache search results at edge
- Optimize bundle sizes

### Monitoring
- **Performance Metrics**: Search response times
- **Error Tracking**: Search failures and recovery
- **Usage Analytics**: Popular queries and patterns
- **Cache Hit Rates**: Optimization opportunities

## Future Enhancements

### Planned Features
- **Semantic Search**: Vector-based similarity search
- **Machine Learning**: Personalized result ranking
- **Real-time Collaboration**: Shared search sessions
- **Advanced Analytics**: Heat maps and user journey tracking
- **A/B Testing**: Search algorithm comparison
- **Elasticsearch Integration**: Hybrid local/remote search

### API Extensions
- **GraphQL Support**: Flexible query interface
- **WebSocket Streaming**: Real-time result updates
- **Search Templates**: Saved search configurations
- **Bulk Operations**: Batch article management
- **Custom Scoring**: User-defined ranking algorithms

## Troubleshooting

### Common Issues

1. **Slow Search Performance**
   - Check article count and index size
   - Optimize boost factors and caching
   - Monitor browser memory usage

2. **Voice Search Not Working**
   - Verify HTTPS connection
   - Check microphone permissions
   - Test browser compatibility

3. **Missing Search Results**
   - Verify article indexing
   - Check filter configurations
   - Test query normalization

4. **Memory Issues**
   - Clear search cache
   - Reduce cache expiry time
   - Limit concurrent searches

### Debug Mode

```typescript
// Enable debug logging
const searchEngine = new AdvancedSearchEngine({
  debug: true,
  logLevel: 'verbose'
});

// View search statistics
console.log(searchEngine.getStatistics());

// Inspect search index
console.log(searchEngine.getIndexInfo());
```

## Support

For technical support and feature requests:
- **Documentation**: [Advanced Search Docs](./SEARCH_API.md)
- **Examples**: [Search Demo Page](./search-demo)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## License

MIT License - see LICENSE file for details.