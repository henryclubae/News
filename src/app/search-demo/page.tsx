/**
 * Advanced Search Demo Page
 * 
 * Demonstrates all features of the advanced search system
 */

'use client';

import React, { useState, useEffect } from 'react';
import AdvancedSearchComponent from '@/components/search/AdvancedSearch';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { NewsArticle } from '@/types/news';
import { SearchAnalytics } from '@/lib/search';
import './search-demo.css';

// Mock news articles for demonstration
const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Revolutionary AI Breakthrough in Healthcare Transforms Patient Care',
    content: 'Scientists at leading research institutions have developed an advanced artificial intelligence system that can diagnose rare diseases with unprecedented accuracy. The breakthrough technology uses deep learning algorithms to analyze medical images and patient data, potentially saving thousands of lives through early detection and treatment.',
    summary: 'New AI system revolutionizes healthcare by accurately diagnosing rare diseases using advanced machine learning.',
    author: 'Dr. Sarah Johnson',
    category: 'Technology',
    tags: ['AI', 'Healthcare', 'Machine Learning', 'Medical Technology', 'Innovation'],
    publishedAt: '2024-01-15T10:30:00Z',
    source: 'Tech Medical Journal',
    sourceUrl: 'https://techmedical.com/ai-breakthrough',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
    language: 'en',
    readTime: 8,
    views: 15420,
    likes: 892,
    priority: 'high',
    isBreaking: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Climate Change Summit Reaches Historic Agreement on Carbon Emissions',
    content: 'World leaders at the Global Climate Summit have reached a groundbreaking agreement to reduce carbon emissions by 50% within the next decade. The comprehensive plan includes innovative renewable energy initiatives, carbon capture technologies, and sustainable development goals that will reshape how nations approach environmental policy.',
    summary: 'Historic climate agreement sets ambitious goals for carbon emission reduction and sustainable development.',
    author: 'Maria Rodriguez',
    category: 'Environment',
    tags: ['Climate Change', 'Environment', 'Policy', 'Sustainability', 'Global Summit'],
    publishedAt: '2024-01-14T14:20:00Z',
    source: 'Environmental News Network',
    sourceUrl: 'https://environmental-news.com/climate-summit',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    language: 'en',
    readTime: 12,
    views: 23750,
    likes: 1456,
    priority: 'high',
    isBreaking: true
  },
  {
    id: '3',
    title: 'Space Exploration Milestone: First Human Colony on Mars Established',
    content: 'The Mars Colonial Initiative has successfully established the first permanent human settlement on the Red Planet. The colony, named New Horizon, houses 100 carefully selected astronauts and scientists who will conduct long-term research on Martian geology, atmosphere, and the potential for terraforming. This historic achievement marks the beginning of humanitys multi-planetary future.',
    summary: 'First permanent human colony established on Mars, marking a new era in space exploration.',
    author: 'Commander Alex Chen',
    category: 'Space',
    tags: ['Space Exploration', 'Mars', 'Colony', 'Astronomy', 'Future Technology'],
    publishedAt: '2024-01-13T09:15:00Z',
    source: 'Space Discovery Magazine',
    sourceUrl: 'https://spacediscovery.com/mars-colony',
    imageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
    language: 'en',
    readTime: 15,
    views: 45680,
    likes: 2834,
    priority: 'high',
    isBreaking: true,
    isFeatured: true
  },
  {
    id: '4',
    title: 'Economic Markets Show Strong Recovery After Global Uncertainty',
    content: 'Global financial markets have demonstrated remarkable resilience and growth following a period of economic uncertainty. Stock indices across major economies have reached new highs, driven by technological innovation, sustainable energy investments, and improved international trade relationships. Analysts predict continued growth throughout the fiscal year.',
    summary: 'Global markets recover strongly with record highs driven by innovation and trade improvements.',
    author: 'David Thompson',
    category: 'Business',
    tags: ['Economy', 'Stock Market', 'Finance', 'Global Trade', 'Investment'],
    publishedAt: '2024-01-12T16:45:00Z',
    source: 'Financial Times Global',
    sourceUrl: 'https://financialtimes.com/market-recovery',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    language: 'en',
    readTime: 6,
    views: 12340,
    likes: 567,
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Revolutionary Electric Vehicle Battery Technology Extends Range to 1000 Miles',
    content: 'Automotive engineers have developed a breakthrough battery technology that enables electric vehicles to travel over 1000 miles on a single charge. The new solid-state lithium-sulfur batteries are lighter, safer, and more environmentally friendly than current lithium-ion technology. Major automakers are already planning to integrate this technology into their upcoming vehicle models.',
    summary: 'New battery technology enables EVs to travel 1000+ miles on single charge, revolutionizing transportation.',
    author: 'Elena Vasquez',
    category: 'Automotive',
    tags: ['Electric Vehicles', 'Battery Technology', 'Innovation', 'Transportation', 'Sustainability'],
    publishedAt: '2024-01-11T11:30:00Z',
    source: 'Auto Innovation Weekly',
    sourceUrl: 'https://autoinnovation.com/battery-breakthrough',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop',
    language: 'en',
    readTime: 9,
    views: 18920,
    likes: 1234,
    priority: 'high'
  },
  {
    id: '6',
    title: 'Breakthrough in Quantum Computing Solves Complex Mathematical Problems',
    content: 'Researchers at the Quantum Research Institute have achieved a major breakthrough in quantum computing by successfully solving complex mathematical problems that would take traditional computers thousands of years to complete. The 1000-qubit quantum processor demonstrated quantum supremacy in optimization, cryptography, and molecular simulation applications.',
    summary: 'Quantum computer achieves breakthrough by solving complex problems in seconds vs. thousands of years.',
    author: 'Dr. Robert Kim',
    category: 'Technology',
    tags: ['Quantum Computing', 'Mathematics', 'Research', 'Innovation', 'Computing'],
    publishedAt: '2024-01-10T13:20:00Z',
    source: 'Quantum Science Today',
    sourceUrl: 'https://quantumscience.com/computing-breakthrough',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    language: 'en',
    readTime: 11,
    views: 8765,
    likes: 654,
    priority: 'medium'
  }
];

export default function SearchDemoPage() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Initialize search with mock articles
  const searchHook = useAdvancedSearch({
    articles: mockArticles,
    enableRealTimeSearch: true,
    enableVoiceSearch: true,
    enableHistory: true,
    enableAnalytics: true
  });

  const handleArticleSelect = (article: NewsArticle) => {
    setSelectedArticle(article);
    
    // Track click for analytics
    if (searchHook.results?.searchId) {
      searchHook.trackResultClick(searchHook.results.searchId, article.id);
    }
  };

  const stats = searchHook.getSearchStatistics();
  const analytics = searchHook.getAnalytics();
  const trending = searchHook.getTrendingQueries(5);

  return (
    <div className="search-demo-page">
      <div className="demo-header">
        <h1>Advanced Search System Demo</h1>
        <p>
          Experience the full power of our advanced search system with features including:
          real-time search, voice search, advanced filters, search history, and analytics.
        </p>
        
        <div className="demo-controls">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="stats-toggle"
          >
            {showStats ? 'Hide' : 'Show'} Search Statistics
          </button>
          
          <button 
            onClick={() => searchHook.resetSearch()}
            className="reset-button"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* Search Statistics Panel */}
      {showStats && (
        <div className="stats-panel">
          <div className="stats-section">
            <h3>Search Engine Stats</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-value">{String(stats.totalArticles || 0)}</span>
                <span className="stat-label">Total Articles</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{String(stats.totalQueries || 0)}</span>
                <span className="stat-label">Total Queries</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{String(stats.cacheSize || 0)}</span>
                <span className="stat-label">Cache Size</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{typeof stats.avgExecutionTime === 'number' ? stats.avgExecutionTime.toFixed(2) : '0.00'}ms</span>
                <span className="stat-label">Avg Response Time</span>
              </div>
            </div>
          </div>

          {trending.length > 0 && (
            <div className="stats-section">
              <h3>Trending Searches</h3>
              <div className="trending-list">
                {trending.map((item, index) => (
                  <div key={index} className="trending-item">
                    <span className="trending-query">{item.query}</span>
                    <span className="trending-count">{item.count} searches</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics.length > 0 && (
            <div className="stats-section">
              <h3>Recent Analytics</h3>
              <div className="analytics-list">
                {analytics.slice(0, 5).map((item: SearchAnalytics, index) => (
                  <div key={index} className="analytics-item">
                    <span className="analytics-query">"{item.query}"</span>
                    <span className="analytics-results">{item.resultCount} results</span>
                    <span className="analytics-time">{item.executionTime.toFixed(2)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Search Interface */}
      <div className="demo-content">
        <div className="search-section">
          <AdvancedSearchComponent
            articles={mockArticles}
            onResultSelect={handleArticleSelect}
            showFilters={true}
            showHistory={true}
            showVoiceSearch={true}
            className="demo-search"
          />
        </div>

        {/* Article Preview Modal */}
        {selectedArticle && (
          <div className="article-modal-overlay" onClick={() => setSelectedArticle(null)}>
            <div className="article-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedArticle.title}</h2>
                <button 
                  className="close-button"
                  onClick={() => setSelectedArticle(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="article-meta">
                  <span className="article-author">By {selectedArticle.author}</span>
                  <span className="article-date">
                    {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="article-category">{selectedArticle.category}</span>
                  <span className="article-readtime">{selectedArticle.readTime} min read</span>
                </div>
                
                {selectedArticle.imageUrl && (
                  <div className="article-image">
                    <img src={selectedArticle.imageUrl} alt={selectedArticle.title} />
                  </div>
                )}
                
                <div className="article-content">
                  <p className="article-summary">{selectedArticle.summary}</p>
                  <p>{selectedArticle.content}</p>
                </div>
                
                <div className="article-tags">
                  {selectedArticle.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="article-stats">
                  <span>👁️ {selectedArticle.views?.toLocaleString()} views</span>
                  <span>❤️ {selectedArticle.likes?.toLocaleString()} likes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Features */}
      <div className="demo-features">
        <h2>Try These Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Try searching for "AI healthcare" or "climate change" to see intelligent results ranking.</p>
            <button onClick={() => searchHook.setQuery('AI healthcare')}>
              Try Example
            </button>
          </div>
          
          <div className="feature-card">
            <h3>🎤 Voice Search</h3>
            <p>Click the microphone icon in the search bar to search using your voice.</p>
            <button onClick={() => searchHook.startVoiceSearch()}>
              Start Voice Search
            </button>
          </div>
          
          <div className="feature-card">
            <h3>🔧 Advanced Filters</h3>
            <p>Use filters to narrow down results by category, author, date, and more.</p>
            <button onClick={() => searchHook.updateFilter('categories', ['Technology'])}>
              Filter by Technology
            </button>
          </div>
          
          <div className="feature-card">
            <h3>📚 Search History</h3>
            <p>View your recent searches and quickly repeat them.</p>
            <button onClick={() => console.log(searchHook.history)}>
              View History
            </button>
          </div>
          
          <div className="feature-card">
            <h3>💡 Auto-complete</h3>
            <p>Start typing to see intelligent suggestions and auto-completion.</p>
            <button onClick={() => searchHook.setQuery('quan')}>
              Try "quan..."
            </button>
          </div>
          
          <div className="feature-card">
            <h3>📊 Search Analytics</h3>
            <p>Track search performance, popular queries, and user behavior.</p>
            <button onClick={() => setShowStats(!showStats)}>
              {showStats ? 'Hide' : 'Show'} Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}