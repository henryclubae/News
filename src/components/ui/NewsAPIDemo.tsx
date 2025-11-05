'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  getLatestNews, 
  getNewsByCategory, 
  searchNews, 
  getTrendingNews
} from '@/lib/api';
import { handleAPIError } from '@/lib/api-demo';
import type { NewsArticle } from '@/types';

// ============================================================================
// NEWS API INTEGRATION COMPONENT
// ============================================================================

export function NewsAPIDemo() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [activeTab, setActiveTab] = useState<'latest' | 'category' | 'search' | 'trending'>('latest');

  // Available categories
  const categories = [
    'general', 'technology', 'business', 'sports', 
    'science', 'health', 'entertainment'
  ];

  // Fetch latest news
  const fetchLatestNews = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const latestArticles = await getLatestNews({
        pageSize: 10,
        sortBy: 'publishedAt'
      });
      setArticles(latestArticles);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('Error fetching latest news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch news by category
  const fetchCategoryNews = useCallback(async (category: string) => {
    setLoading(true);
    setError('');
    
    try {
      const categoryArticles = await getNewsByCategory(category, {
        pageSize: 10,
        sortBy: 'publishedAt'
      });
      setArticles(categoryArticles);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('Error fetching category news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search news
  const searchArticles = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const searchResults = await searchNews(query, {
        pageSize: 10,
        sortBy: 'relevancy',
        searchIn: 'title'
      });
      setArticles(searchResults);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('Error searching news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trending news
  const fetchTrendingNews = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const trendingArticles = await getTrendingNews({
        pageSize: 10
      });
      setArticles(trendingArticles);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('Error fetching trending news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle tab changes
  const handleTabChange = (tab: 'latest' | 'category' | 'search' | 'trending') => {
    setActiveTab(tab);
    setError('');
    
    switch (tab) {
      case 'latest':
        fetchLatestNews();
        break;
      case 'category':
        fetchCategoryNews(selectedCategory);
        break;
      case 'trending':
        fetchTrendingNews();
        break;
      case 'search':
        // Don't auto-search, wait for user input
        setArticles([]);
        break;
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchArticles(searchQuery);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (activeTab === 'category') {
      fetchCategoryNews(category);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Load initial data
  useEffect(() => {
    fetchLatestNews();
  }, [fetchLatestNews]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📰 News API Integration Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive API layer with caching, rate limiting, and error handling
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'latest', label: 'Latest News', icon: '🔥' },
          { key: 'category', label: 'By Category', icon: '🏷️' },
          { key: 'search', label: 'Search', icon: '🔍' },
          { key: 'trending', label: 'Trending', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as 'latest' | 'category' | 'search' | 'trending')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Category Selector */}
        {activeTab === 'category' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              title="Select news category"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Form */}
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for news..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              Search
            </button>
          </form>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading articles...</span>
        </div>
      )}

      {/* Articles List */}
      {!loading && articles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {articles.length} Articles Found
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'category' && `Category: ${selectedCategory}`}
              {activeTab === 'search' && `Query: "${searchQuery}"`}
              {activeTab === 'latest' && 'Latest News'}
              {activeTab === 'trending' && 'Trending Now'}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700
                           hover:shadow-md transition-shadow"
              >
                {/* Article Image */}
                {article.imageUrl && (
                  <div className="mb-3 relative h-48">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {article.summary}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{article.author.name}</span>
                    <span>{formatDate(article.publishDate)}</span>
                  </div>

                  {/* Article Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>📖 {article.readingTime} min read</span>
                    <span>🏷️ {article.category.name}</span>
                    {article.source && (
                      <span>📡 {article.source.name}</span>
                    )}
                  </div>

                  {/* Article Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                                     text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && articles.length === 0 && !error && activeTab === 'search' && searchQuery && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-gray-600 dark:text-gray-400">
            No articles found for &ldquo;{searchQuery}&rdquo;. Try a different search term.
          </p>
        </div>
      )}

      {/* API Statistics */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📊 API Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Active Tab:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Articles:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {articles.length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <span className={`ml-2 font-medium ${
              loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'
            }`}>
              {loading ? 'Loading' : error ? 'Error' : 'Ready'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Cache:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsAPIDemo;