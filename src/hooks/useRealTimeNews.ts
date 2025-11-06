'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types for real-time news updates
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  sourceUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'breaking';
  version: number;
}

export interface NewsUpdate {
  type: 'NEW_ARTICLE' | 'UPDATE_ARTICLE' | 'DELETE_ARTICLE' | 'BREAKING_NEWS';
  article: NewsArticle;
  timestamp: string;
  changeId: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isOnline: boolean;
  lastConnectionTime: Date | null;
  connectionAttempts: number;
  error: string | null;
}

export interface NotificationUpdate {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'breaking';
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface UseRealTimeNewsOptions {
  enableWebSocket?: boolean;
  enableSSE?: boolean;
  enablePushNotifications?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  categories?: string[];
  priority?: Array<'low' | 'medium' | 'high' | 'breaking'>;
}

export interface UseRealTimeNewsReturn {
  articles: NewsArticle[];
  updates: NewsUpdate[];
  notifications: NotificationUpdate[];
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshNews: () => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  subscribeToCategory: (category: string) => void;
  unsubscribeFromCategory: (category: string) => void;
  togglePushNotifications: () => Promise<void>;
  forceReconnect: () => void;
  
  // Offline support
  syncPendingUpdates: () => Promise<void>;
  clearOfflineQueue: () => void;
  getOfflineArticles: () => NewsArticle[];
}

// Service Worker registration for offline support
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-news.js');
    console.log('News Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Push notification helper
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

export function useRealTimeNews(options: UseRealTimeNewsOptions = {}): UseRealTimeNewsReturn {
  const {
    enableWebSocket = true,
    enableSSE = true,
    enablePushNotifications = true,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    categories = [],
    priority = ['medium', 'high', 'breaking']
  } = options;

  // State management
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [notifications, setNotifications] = useState<NotificationUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isOnline: navigator?.onLine ?? true,
    lastConnectionTime: null,
    connectionAttempts: 0,
    error: null
  });

  // Refs for connection management
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const pendingUpdatesRef = useRef<NewsUpdate[]>([]);

  // Conflict resolution map for concurrent updates
  const conflictResolutionRef = useRef<Map<string, NewsUpdate>>(new Map());

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || typeof window === 'undefined') return;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/news';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          lastConnectionTime: new Date(),
          connectionAttempts: 0,
          error: null
        }));

        // Subscribe to categories
        if (categories.length > 0) {
          ws.send(JSON.stringify({
            type: 'SUBSCRIBE_CATEGORIES',
            categories: categories
          }));
        }

        // Subscribe to priority levels
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE_PRIORITY',
          priority: priority
        }));
      };

      ws.onmessage = (event) => {
        try {
          const update: NewsUpdate = JSON.parse(event.data);
          handleNewsUpdate(update);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          error: event.reason || 'Connection closed'
        }));

        if (autoReconnect && event.code !== 1000) {
          scheduleReconnect('websocket');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: 'Failed to establish WebSocket connection'
      }));
      
      if (autoReconnect) {
        scheduleReconnect('websocket');
      }
    }
  }, [enableWebSocket, autoReconnect, categories, priority]);

  // Server-Sent Events connection management
  const connectSSE = useCallback(() => {
    if (!enableSSE || typeof window === 'undefined') return;

    try {
      const sseUrl = process.env.NEXT_PUBLIC_SSE_URL || '/api/news/stream';
      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('SSE connected');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          lastConnectionTime: new Date(),
          error: null
        }));
      };

      eventSource.onmessage = (event) => {
        try {
          const update: NewsUpdate = JSON.parse(event.data);
          handleNewsUpdate(update);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          error: 'SSE connection error'
        }));

        if (autoReconnect) {
          scheduleReconnect('sse');
        }
      };

      sseRef.current = eventSource;
    } catch (error) {
      console.error('Failed to connect SSE:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: 'Failed to establish SSE connection'
      }));
    }
  }, [enableSSE, autoReconnect]);

  // Handle incoming news updates with conflict resolution
  const handleNewsUpdate = useCallback((update: NewsUpdate) => {
    // Check for conflicts with pending updates
    const existingUpdate = conflictResolutionRef.current.get(update.article.id);
    
    if (existingUpdate) {
      // Resolve conflict by version number (higher version wins)
      if (update.article.version <= existingUpdate.article.version) {
        console.log('Ignoring outdated update for article:', update.article.id);
        return;
      }
    }

    // Store the update for conflict resolution
    conflictResolutionRef.current.set(update.article.id, update);

    // Apply the update
    setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates

    switch (update.type) {
      case 'NEW_ARTICLE':
        setArticles(prev => [update.article, ...prev]);
        showNotification({
          id: `new-${update.article.id}`,
          message: `New article: ${update.article.title}`,
          type: update.article.priority === 'breaking' ? 'breaking' : 'info',
          timestamp: update.timestamp,
          read: false
        });
        break;

      case 'UPDATE_ARTICLE':
        setArticles(prev => 
          prev.map(article => 
            article.id === update.article.id ? update.article : article
          )
        );
        showNotification({
          id: `update-${update.article.id}`,
          message: `Article updated: ${update.article.title}`,
          type: 'info',
          timestamp: update.timestamp,
          read: false
        });
        break;

      case 'DELETE_ARTICLE':
        setArticles(prev => prev.filter(article => article.id !== update.article.id));
        break;

      case 'BREAKING_NEWS':
        setArticles(prev => [update.article, ...prev]);
        showNotification({
          id: `breaking-${update.article.id}`,
          message: `🚨 BREAKING: ${update.article.title}`,
          type: 'breaking',
          timestamp: update.timestamp,
          read: false,
          actions: [
            {
              label: 'Read Now',
              action: () => {
                window.open(`/article/${update.article.id}`, '_blank');
              }
            }
          ]
        });
        
        // Send push notification for breaking news
        if (enablePushNotifications && Notification.permission === 'granted') {
          sendPushNotification(update.article);
        }
        break;
    }

    // Store update in offline cache
    if (swRegistrationRef.current) {
      storeOfflineUpdate(update);
    }
  }, [enablePushNotifications]);

  // Show in-app notification
  const showNotification = useCallback((notification: NotificationUpdate) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  }, []);

  // Send push notification
  const sendPushNotification = useCallback(async (article: NewsArticle) => {
    if (!swRegistrationRef.current || Notification.permission !== 'granted') {
      return;
    }

    try {
      await swRegistrationRef.current.showNotification(
        article.priority === 'breaking' ? `🚨 Breaking News` : 'News Update',
        {
          body: article.title,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `news-${article.id}`,
          data: {
            articleId: article.id,
            url: `/article/${article.id}`
          },
          requireInteraction: article.priority === 'breaking'
        }
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }, []);

  // Store update for offline access
  const storeOfflineUpdate = useCallback((update: NewsUpdate) => {
    if (typeof window === 'undefined') return;

    try {
      const offlineUpdates = JSON.parse(localStorage.getItem('news-offline-updates') || '[]');
      offlineUpdates.push(update);
      
      // Keep only last 100 offline updates
      if (offlineUpdates.length > 100) {
        offlineUpdates.splice(0, offlineUpdates.length - 100);
      }
      
      localStorage.setItem('news-offline-updates', JSON.stringify(offlineUpdates));
    } catch (error) {
      console.error('Failed to store offline update:', error);
    }
  }, []);

  // Reconnection logic
  const scheduleReconnect = useCallback((type: 'websocket' | 'sse') => {
    setConnectionStatus(prev => {
      if (prev.connectionAttempts >= maxReconnectAttempts) {
        return {
          ...prev,
          error: 'Maximum reconnection attempts reached'
        };
      }

      return {
        ...prev,
        connectionAttempts: prev.connectionAttempts + 1
      };
    });

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect ${type}...`);
      
      if (type === 'websocket') {
        connectWebSocket();
      } else {
        connectSSE();
      }
    }, reconnectInterval * Math.pow(2, connectionStatus.connectionAttempts)); // Exponential backoff
  }, [maxReconnectAttempts, reconnectInterval, connectWebSocket, connectSSE, connectionStatus.connectionAttempts]);

  // Public methods
  const refreshNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const freshArticles: NewsArticle[] = await response.json();
      setArticles(freshArticles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to refresh news:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const subscribeToCategory = useCallback((category: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_CATEGORY',
        category
      }));
    }
  }, []);

  const unsubscribeFromCategory = useCallback((category: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE_CATEGORY',
        category
      }));
    }
  }, []);

  const togglePushNotifications = useCallback(async () => {
    if (!enablePushNotifications) return;

    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted' && swRegistrationRef.current) {
        console.log('Push notifications enabled');
        showNotification({
          id: 'push-enabled',
          message: 'Push notifications enabled successfully',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      } else {
        console.log('Push notifications denied');
        showNotification({
          id: 'push-denied',
          message: 'Push notifications permission denied',
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
      showNotification({
        id: 'push-error',
        message: 'Failed to enable push notifications',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  }, [enablePushNotifications, showNotification]);

  const forceReconnect = useCallback(() => {
    // Close existing connections
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnect');
    }
    if (sseRef.current) {
      sseRef.current.close();
    }

    // Reset connection status
    setConnectionStatus(prev => ({
      ...prev,
      connectionAttempts: 0,
      error: null
    }));

    // Reconnect
    setTimeout(() => {
      connectWebSocket();
      connectSSE();
    }, 1000);
  }, [connectWebSocket, connectSSE]);

  const syncPendingUpdates = useCallback(async () => {
    if (pendingUpdatesRef.current.length === 0) return;

    try {
      const response = await fetch('/api/news/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates: pendingUpdatesRef.current
        })
      });

      if (response.ok) {
        pendingUpdatesRef.current = [];
        console.log('Pending updates synced successfully');
      }
    } catch (error) {
      console.error('Failed to sync pending updates:', error);
    }
  }, []);

  const clearOfflineQueue = useCallback(() => {
    pendingUpdatesRef.current = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('news-offline-updates');
    }
  }, []);

  const getOfflineArticles = useCallback((): NewsArticle[] => {
    if (typeof window === 'undefined') return [];

    try {
      const offlineUpdates = JSON.parse(localStorage.getItem('news-offline-updates') || '[]');
      return offlineUpdates
        .filter((update: NewsUpdate) => update.type === 'NEW_ARTICLE' || update.type === 'UPDATE_ARTICLE')
        .map((update: NewsUpdate) => update.article);
    } catch (error) {
      console.error('Failed to get offline articles:', error);
      return [];
    }
  }, []);

  // Initialize connections and service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeConnections = async () => {
      // Register service worker
      swRegistrationRef.current = await registerServiceWorker();

      // Initialize connections
      connectWebSocket();
      connectSSE();

      // Load initial data
      refreshNews();

      // Sync pending updates from previous session
      const offlineUpdates = localStorage.getItem('news-offline-updates');
      if (offlineUpdates) {
        try {
          pendingUpdatesRef.current = JSON.parse(offlineUpdates);
          syncPendingUpdates();
        } catch (error) {
          console.error('Failed to load offline updates:', error);
        }
      }
    };

    initializeConnections();

    // Online/offline event listeners
    const handleOnline = () => {
      setConnectionStatus(prev => ({ ...prev, isOnline: true }));
      syncPendingUpdates();
      forceReconnect();
    };

    const handleOffline = () => {
      setConnectionStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      if (sseRef.current) {
        sseRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectWebSocket, connectSSE, refreshNews, syncPendingUpdates, forceReconnect]);

  // Handle visibility change to reconnect when tab becomes active
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!document.hidden && !connectionStatus.isConnected && connectionStatus.isOnline) {
        forceReconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus.isConnected, connectionStatus.isOnline, forceReconnect]);

  return {
    articles,
    updates,
    notifications,
    connectionStatus,
    isLoading,
    error,
    
    // Actions
    refreshNews,
    markNotificationRead,
    clearAllNotifications,
    subscribeToCategory,
    unsubscribeFromCategory,
    togglePushNotifications,
    forceReconnect,
    
    // Offline support
    syncPendingUpdates,
    clearOfflineQueue,
    getOfflineArticles
  };
}