'use client';

import React, { useState, useEffect } from 'react';
import { useRealTimeNews } from '@/hooks/useRealTimeNews';
import type { NewsArticle, NotificationUpdate, ConnectionStatus } from '@/hooks/useRealTimeNews';

interface RealTimeNewsDisplayProps {
  className?: string;
  categories?: string[];
  maxArticles?: number;
  showNotifications?: boolean;
  enableAutoRefresh?: boolean;
}

export default function RealTimeNewsDisplay({
  className = '',
  categories = ['breaking', 'technology', 'business'],
  maxArticles = 10,
  showNotifications = true,
  enableAutoRefresh = true
}: RealTimeNewsDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  const {
    articles,
    updates,
    notifications,
    connectionStatus,
    isLoading,
    error,
    refreshNews,
    markNotificationRead,
    clearAllNotifications,
    subscribeToCategory,
    unsubscribeFromCategory,
    togglePushNotifications,
    forceReconnect,
    syncPendingUpdates,
    getOfflineArticles
  } = useRealTimeNews({
    enableWebSocket: true,
    enableSSE: true,
    enablePushNotifications: true,
    autoReconnect: true,
    categories: categories,
    priority: ['medium', 'high', 'breaking']
  });

  // Filter articles by selected category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  // Get unread notifications count
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Handle category change
  const handleCategoryChange = (category: string) => {
    if (selectedCategory !== 'all') {
      unsubscribeFromCategory(selectedCategory);
    }
    
    setSelectedCategory(category);
    
    if (category !== 'all') {
      subscribeToCategory(category);
    }
  };

  // Connection status color
  const getConnectionStatusColor = (status: ConnectionStatus) => {
    if (!status.isOnline) return 'bg-gray-500';
    if (!status.isConnected) return 'bg-red-500';
    return 'bg-green-500';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get article priority badge
  const getPriorityBadge = (priority: NewsArticle['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      breaking: 'bg-red-100 text-red-800 animate-pulse'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className={`real-time-news-display ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live News Feed
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status Indicator */}
          <div className="relative">
            <button
              onClick={() => setShowConnectionStatus(!showConnectionStatus)}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor(connectionStatus)}`} />
              <span>{connectionStatus.isConnected ? 'Connected' : 'Disconnected'}</span>
            </button>
            
            {showConnectionStatus && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Connection Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Online:</span>
                    <span className={connectionStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.isOnline ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected:</span>
                    <span className={connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.isConnected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Connected:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {connectionStatus.lastConnectionTime 
                        ? formatTimestamp(connectionStatus.lastConnectionTime.toISOString())
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempts:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {connectionStatus.connectionAttempts}
                    </span>
                  </div>
                  {connectionStatus.error && (
                    <div className="text-red-600 text-xs mt-2">
                      Error: {connectionStatus.error}
                    </div>
                  )}
                  <button
                    onClick={forceReconnect}
                    className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Force Reconnect
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <button
                onClick={clearAllNotifications}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.414V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          )}
          
          {/* Controls */}
          <div className="flex space-x-2">
            <button
              onClick={refreshNews}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            
            <button
              onClick={togglePushNotifications}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Enable Push
            </button>
            
            <button
              onClick={syncPendingUpdates}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Sync
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap capitalize ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && notifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Recent Updates ({unreadNotifications} unread)
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-md border ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`text-sm ${
                      notification.type === 'breaking' ? 'font-bold text-red-700' : 'text-gray-900 dark:text-white'
                    }`}>
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                    {notification.actions && (
                      <div className="flex space-x-2 mt-2">
                        {notification.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      className="text-blue-600 text-xs hover:text-blue-800 ml-2"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Updates Stream */}
      {updates.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Live Updates
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {updates.slice(0, 3).map((update) => (
              <div
                key={update.changeId}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <div className={`w-2 h-2 rounded-full ${
                  update.type === 'BREAKING_NEWS' ? 'bg-red-500 animate-pulse' :
                  update.type === 'NEW_ARTICLE' ? 'bg-green-500' :
                  update.type === 'UPDATE_ARTICLE' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <span className="capitalize">{update.type.replace('_', ' ').toLowerCase()}</span>
                <span>•</span>
                <span className="truncate flex-1">{update.article.title}</span>
                <span>{formatTimestamp(update.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        {isLoading && articles.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading news...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No articles available</p>
            {!connectionStatus.isOnline && (
              <button
                onClick={() => {
                  const offlineArticles = getOfflineArticles();
                  if (offlineArticles.length > 0) {
                    // Handle offline articles display
                    console.log('Offline articles:', offlineArticles);
                  }
                }}
                className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Show Offline Articles
              </button>
            )}
          </div>
        ) : (
          filteredArticles.slice(0, maxArticles).map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(article.priority)}
                  <span className="text-sm text-gray-500 capitalize">{article.category}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">v{article.version}</span>
                </div>
                <time className="text-sm text-gray-500" dateTime={article.publishedAt}>
                  {formatTimestamp(article.publishedAt)}
                </time>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 cursor-pointer">
                {article.title}
              </h3>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {article.author}</span>
                  {article.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Read More
                  </button>
                  {article.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Source ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredArticles.length > maxArticles && (
        <div className="text-center mt-6">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
}