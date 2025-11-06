// News Website Service Worker for offline support and push notifications
// This service worker handles caching, background sync, and push notifications

const CACHE_NAME = 'news-website-v1';
const NEWS_CACHE_NAME = 'news-articles-v1';
const API_CACHE_NAME = 'news-api-v1';

// URLs to cache for offline access
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png'
];

// News API endpoints to cache
const NEWS_API_ENDPOINTS = [
  '/api/news',
  '/api/news/categories',
  '/api/news/trending'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('News SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('News SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('News SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Cleanup old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== NEWS_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('News SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/news')) {
    // News API - Network First strategy with background refresh
    event.respondWith(handleNewsAPI(request));
  } else if (url.pathname.startsWith('/article/')) {
    // Article pages - Stale While Revalidate
    event.respondWith(handleArticlePage(request));
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAssets(request));
  } else {
    // Default strategy - Network First
    event.respondWith(handleDefault(request));
  }
});

// Network First strategy for News API with offline fallback
async function handleNewsAPI(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      // Cache successful response
      cache.put(request, networkResponse.clone());
      
      // Notify clients of new data
      notifyClientsOfUpdate('NEWS_UPDATE', {
        url: request.url,
        timestamp: Date.now()
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('News SW: Network failed, trying cache for:', request.url);
    
    // Try cache as fallback
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline indicator to response
      const offlineResponse = cachedResponse.clone();
      offlineResponse.headers.set('X-Offline-Data', 'true');
      return offlineResponse;
    }
    
    // Return offline fallback
    return createOfflineResponse();
  }
}

// Stale While Revalidate strategy for article pages
async function handleArticlePage(request) {
  const cache = await caches.open(NEWS_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Serve from cache immediately if available
  if (cachedResponse) {
    // Update in background
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return createOfflineResponse();
  }
}

// Cache First strategy for static assets
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Default Network First strategy
async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for future offline access
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    return cachedResponse || createOfflineResponse();
  }
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.log('News SW: Background update failed for:', request.url);
  }
}

// Create offline response
function createOfflineResponse() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - News Website</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
          color: #333;
          text-align: center;
          padding: 20px;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .offline-message {
          color: #666;
          margin-bottom: 2rem;
          max-width: 400px;
        }
        .retry-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .retry-button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="offline-icon">📱</div>
      <h1 class="offline-title">You're Offline</h1>
      <p class="offline-message">
        It looks like you're not connected to the internet. 
        Please check your connection and try again.
      </p>
      <button class="retry-button" onclick="window.location.reload()">
        Try Again
      </button>
      
      <script>
        // Auto-retry when online
        window.addEventListener('online', () => {
          window.location.reload();
        });
      </script>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Offline-Response': 'true'
    }
  });
}

// Background Sync for offline updates
self.addEventListener('sync', (event) => {
  console.log('News SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'news-updates-sync') {
    event.waitUntil(syncPendingUpdates());
  }
});

// Sync pending updates when back online
async function syncPendingUpdates() {
  try {
    // Get pending updates from IndexedDB or localStorage
    const pendingUpdates = await getPendingUpdates();
    
    if (pendingUpdates.length === 0) {
      console.log('News SW: No pending updates to sync');
      return;
    }
    
    // Send updates to server
    const response = await fetch('/api/news/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updates: pendingUpdates })
    });
    
    if (response.ok) {
      // Clear synced updates
      await clearPendingUpdates();
      console.log('News SW: Pending updates synced successfully');
      
      // Notify clients
      notifyClientsOfUpdate('SYNC_COMPLETE', {
        syncedCount: pendingUpdates.length,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('News SW: Failed to sync pending updates:', error);
  }
}

// Get pending updates (simplified - would use IndexedDB in production)
async function getPendingUpdates() {
  // This is a simplified version - in production, you'd use IndexedDB
  return [];
}

// Clear pending updates
async function clearPendingUpdates() {
  // Clear from IndexedDB or localStorage
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('News SW: Push notification received');
  
  const options = {
    title: 'News Update',
    body: 'You have new news updates available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'news-update',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open News'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.title = data.title || options.title;
      options.body = data.body || options.body;
      options.tag = data.tag || options.tag;
      options.requireInteraction = data.requireInteraction || false;
      
      if (data.priority === 'breaking') {
        options.title = '🚨 Breaking News';
        options.requireInteraction = true;
        options.vibrate = [200, 100, 200];
      }
    } catch (error) {
      console.error('News SW: Failed to parse push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('News SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    // Open the news website
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the website
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('News SW: Notification closed');
  
  // Track notification dismissal analytics if needed
  trackNotificationAction('dismiss', event.notification.tag);
});

// Notify all clients of updates
async function notifyClientsOfUpdate(type, data) {
  const clients = await self.clients.matchAll();
  
  clients.forEach(client => {
    client.postMessage({
      type: type,
      data: data,
      timestamp: Date.now()
    });
  });
}

// Track notification actions (for analytics)
function trackNotificationAction(action, tag) {
  // Send analytics data to your tracking service
  console.log('News SW: Notification action tracked:', action, tag);
}

// Handle periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('News SW: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'news-refresh') {
    event.waitUntil(refreshNewsCache());
  }
});

// Refresh news cache in background
async function refreshNewsCache() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Refresh main news endpoints
    for (const endpoint of NEWS_API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response.clone());
          console.log('News SW: Refreshed cache for:', endpoint);
        }
      } catch (error) {
        console.log('News SW: Failed to refresh:', endpoint, error);
      }
    }
    
    // Notify clients of cache refresh
    notifyClientsOfUpdate('CACHE_REFRESHED', {
      endpoints: NEWS_API_ENDPOINTS,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('News SW: Failed to refresh news cache:', error);
  }
}

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('News SW: Message received:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({
          type: 'CACHE_STATUS',
          data: status
        });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED'
        });
      });
      break;
      
    default:
      console.log('News SW: Unknown message type:', type);
  }
});

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  
  console.log('News SW: All caches cleared');
}