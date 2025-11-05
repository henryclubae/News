/**
 * Service Worker Cache Implementation
 * Advanced service worker for offline support, background sync,
 * and strategic resource caching for news website
 */

// ===== CACHE CONFIGURATION =====
const CACHE_VERSION = 'news-v1.0.0';

const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  articles: `${CACHE_VERSION}-articles`,
  images: `${CACHE_VERSION}-images`,
  api: `${CACHE_VERSION}-api`,
};

const CACHE_STRATEGIES = {
  static: 'cache-first',      // CSS, JS, fonts
  dynamic: 'network-first',   // HTML pages
  articles: 'stale-while-revalidate', // Article content
  images: 'cache-first',      // Images with fallback
  api: 'network-first',       // API calls with offline fallback
};

const CACHE_EXPIRATION = {
  static: 30 * 24 * 60 * 60 * 1000,    // 30 days
  dynamic: 24 * 60 * 60 * 1000,        // 1 day
  articles: 7 * 24 * 60 * 60 * 1000,   // 7 days
  images: 30 * 24 * 60 * 60 * 1000,    // 30 days
  api: 15 * 60 * 1000,                 // 15 minutes
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/_next/static/',
];

// API endpoints configuration
const API_ENDPOINTS = {
  articles: '/api/articles',
  search: '/api/search',
  categories: '/api/categories',
  authors: '/api/authors',
};

// ===== INSTALL EVENT =====
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.static).then(async (cache) => {
        console.log('[SW] Caching static assets');
        
        // Cache static assets with error handling
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`[SW] Cached: ${url}`);
            }
          } catch (error) {
            console.warn(`[SW] Failed to cache ${url}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
      }),
      
      // Initialize analytics
      initializeAnalytics(),
      
      // Cleanup old caches
      cleanupOldCaches(),
    ])
  );

  // Force immediate activation
  self.skipWaiting();
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      
      // Cleanup old caches
      cleanupOldCaches(),
      
      // Warm essential cache
      warmEssentialCache(),
    ])
  );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http protocols
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(event.request));
});

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-analytics') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'background-content') {
    event.waitUntil(syncContent());
  }
});

// ===== PUSH NOTIFICATION =====
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'New content is available!',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image,
    data: data.url || '/',
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      }
    ],
    tag: data.tag || 'news-update',
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'News Update',
      options
    )
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});

// ===== REQUEST HANDLING =====
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Route to appropriate cache strategy
    if (isStaticAsset(pathname)) {
      return await handleStaticAsset(request);
    } else if (isApiRequest(pathname)) {
      return await handleApiRequest(request);
    } else if (isImageRequest(pathname)) {
      return await handleImageRequest(request);
    } else if (isArticleRequest(pathname)) {
      return await handleArticleRequest(request);
    } else {
      return await handleDynamicContent(request);
    }
  } catch (error) {
    console.error('[SW] Request handling error:', error);
    return await handleOfflineFallback(request);
  }
}

// Static Assets - Cache First Strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAMES.static);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse && !isExpired(cachedResponse, CACHE_EXPIRATION.static)) {
    await updateAnalytics('hit');
    return cachedResponse;
  }

  try {
    // Network fallback
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      await cache.put(request, networkResponse.clone());
      await updateAnalytics('network');
      return networkResponse;
    }

    // Return cached version even if expired
    if (cachedResponse) {
      await updateAnalytics('stale');
      return cachedResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    await updateAnalytics('miss');
    
    // Return cached version if available
    if (cachedResponse) {
      return cachedResponse;
    }

    return await createOfflineResponse();
  }
}

// API Requests - Network First with Offline Support
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAMES.api);
  
  try {
    // Try network first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      // Cache successful responses
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      await updateAnalytics('network');
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_EXPIRATION.api)) {
      await updateAnalytics('offline');
      
      // Add offline header
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-By', 'service-worker-cache');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    await updateAnalytics('miss');
    return await createOfflineApiResponse(request);
  }
}

// Images - Cache First with Compression
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAMES.images);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    await updateAnalytics('hit');
    return cachedResponse;
  }

  try {
    // Network with optimization
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      await cache.put(request, networkResponse.clone());
      await updateAnalytics('network');
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    await updateAnalytics('miss');
    return await createOfflineImageResponse();
  }
}

// Articles - Stale While Revalidate
async function handleArticleRequest(request) {
  const cache = await caches.open(CACHE_NAMES.articles);
  
  // Get cached version
  const cachedResponse = await cache.match(request);

  // Start network request (don't await)
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached version immediately if available and not too old
  if (cachedResponse && !isExpired(cachedResponse, CACHE_EXPIRATION.articles)) {
    await updateAnalytics('hit');
    
    // Network request continues in background
    networkPromise.catch((error) => {
      console.warn('[SW] Background revalidation failed:', error);
    });

    return cachedResponse;
  }

  // Wait for network if no cache or cache is too old
  try {
    const networkResponse = await networkPromise;
    await updateAnalytics('network');
    return networkResponse;
  } catch (error) {
    // Return stale cache if network fails
    if (cachedResponse) {
      await updateAnalytics('stale');
      return cachedResponse;
    }

    await updateAnalytics('miss');
    return await createOfflineResponse();
  }
}

// Dynamic Content - Network First
async function handleDynamicContent(request) {
  const cache = await caches.open(CACHE_NAMES.dynamic);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      await cache.put(request, networkResponse.clone());
      await updateAnalytics('network');
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      await updateAnalytics('offline');
      return cachedResponse;
    }

    await updateAnalytics('miss');
    return await createOfflineResponse();
  }
}

// ===== HELPER FUNCTIONS =====
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/fonts/') ||
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.woff') ||
    pathname.includes('.woff2') ||
    pathname === '/manifest.json'
  );
}

function isApiRequest(pathname) {
  return pathname.startsWith('/api/');
}

function isImageRequest(pathname) {
  return (
    pathname.startsWith('/images/') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.png') ||
    pathname.includes('.webp') ||
    pathname.includes('.avif') ||
    pathname.includes('.svg')
  );
}

function isArticleRequest(pathname) {
  return (
    pathname.startsWith('/articles/') ||
    pathname.startsWith('/news/') ||
    pathname.match(/^\/[a-z-]+\/[a-z0-9-]+$/) // Category/slug pattern
  );
}

function isExpired(response, maxAge) {
  const cacheDate = response.headers.get('sw-cache-date');
  if (!cacheDate) return true;

  const cacheTime = parseInt(cacheDate);
  return Date.now() - cacheTime > maxAge;
}

// ===== OFFLINE RESPONSES =====
async function createOfflineResponse() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - News Website</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .offline-container {
          max-width: 500px;
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 { margin: 0 0 1rem 0; }
        p { margin: 0 0 2rem 0; opacity: 0.9; }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again. Some cached content may still be available.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;

  return new Response(offlineHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Served-By': 'service-worker-offline',
    },
  });
}

async function createOfflineApiResponse(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  let offlineData = {};

  // Provide fallback data for specific endpoints
  if (pathname.includes('/articles')) {
    offlineData = {
      articles: [],
      total: 0,
      message: 'Offline - cached articles not available',
      offline: true,
    };
  } else if (pathname.includes('/search')) {
    offlineData = {
      results: [],
      total: 0,
      query: url.searchParams.get('q') || '',
      message: 'Offline - search not available',
      offline: true,
    };
  } else {
    offlineData = {
      message: 'Offline - this feature is not available',
      offline: true,
    };
  }

  return new Response(JSON.stringify(offlineData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Served-By': 'service-worker-offline',
    },
  });
}

async function createOfflineImageResponse() {
  // Return a small placeholder SVG
  const placeholderSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <text x="200" y="150" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="18" fill="#9ca3af">
        Image Offline
      </text>
    </svg>
  `;

  return new Response(placeholderSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'X-Served-By': 'service-worker-offline',
    },
  });
}

// ===== CACHE MANAGEMENT =====
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  
  const oldCaches = cacheNames.filter(name =>
    name.startsWith('news-') && !Object.values(CACHE_NAMES).includes(name)
  );

  await Promise.all(
    oldCaches.map(name => caches.delete(name))
  );

  console.log(`[SW] Cleaned up ${oldCaches.length} old caches`);
}

async function warmEssentialCache() {
  try {
    const essentialUrls = [
      '/',
      '/categories',
      '/trending',
      '/api/articles?featured=true&limit=10',
    ];

    const cache = await caches.open(CACHE_NAMES.dynamic);
    
    const promises = essentialUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn(`[SW] Failed to warm cache for ${url}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('[SW] Essential cache warmed');
  } catch (error) {
    console.error('[SW] Cache warming failed:', error);
  }
}

// ===== BACKGROUND SYNC =====
async function syncAnalytics() {
  try {
    console.log('[SW] Syncing analytics data...');
    
    // Get stored analytics data
    const analytics = await getStoredAnalytics();
    
    if (analytics && (analytics.hits > 0 || analytics.misses > 0)) {
      // Send to analytics endpoint
      await fetch('/api/analytics/sw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      });

      // Reset analytics
      await resetAnalytics();
      console.log('[SW] Analytics synced successfully');
    }
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error);
  }
}

async function syncContent() {
  try {
    console.log('[SW] Syncing content updates...');
    
    // Check for content updates
    const response = await fetch('/api/content/updates');
    if (!response.ok) return;

    const updates = await response.json();
    
    // Update caches with new content
    if (updates.articles && updates.articles.length > 0) {
      const articleCache = await caches.open(CACHE_NAMES.articles);
      
      for (const article of updates.articles) {
        try {
          const articleResponse = await fetch(`/api/articles/${article.id}`);
          if (articleResponse.ok) {
            await articleCache.put(`/articles/${article.slug}`, articleResponse);
          }
        } catch (error) {
          console.warn(`[SW] Failed to update article ${article.id}:`, error);
        }
      }
    }

    console.log('[SW] Content sync completed');
  } catch (error) {
    console.error('[SW] Content sync failed:', error);
  }
}

// ===== ANALYTICS =====
async function initializeAnalytics() {
  const analytics = {
    hits: 0,
    misses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    lastUpdated: Date.now(),
  };

  await storeAnalytics(analytics);
}

async function updateAnalytics(type) {
  try {
    const analytics = await getStoredAnalytics() || {
      hits: 0,
      misses: 0,
      networkRequests: 0,
      offlineRequests: 0,
      lastUpdated: Date.now(),
    };

    switch (type) {
      case 'hit':
      case 'stale':
        analytics.hits++;
        break;
      case 'miss':
        analytics.misses++;
        break;
      case 'network':
        analytics.networkRequests++;
        break;
      case 'offline':
        analytics.offlineRequests++;
        break;
    }

    analytics.lastUpdated = Date.now();
    await storeAnalytics(analytics);
    
    // Schedule background sync if we have significant data
    const totalEvents = analytics.hits + analytics.misses + analytics.networkRequests + analytics.offlineRequests;
    
    if (totalEvents % 50 === 0) { // Sync every 50 events
      if ('serviceWorker' in self && 'sync' in self.ServiceWorkerRegistration.prototype) {
        await self.registration.sync.register('background-analytics');
      }
    }
  } catch (error) {
    console.error('[SW] Analytics update failed:', error);
  }
}

async function storeAnalytics(analytics) {
  try {
    const cache = await caches.open(CACHE_NAMES.dynamic);
    const response = new Response(JSON.stringify(analytics), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put('/sw-analytics', response);
  } catch (error) {
    console.error('[SW] Failed to store analytics:', error);
  }
}

async function getStoredAnalytics() {
  try {
    const cache = await caches.open(CACHE_NAMES.dynamic);
    const response = await cache.match('/sw-analytics');
    
    if (response) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('[SW] Failed to get analytics:', error);
    return null;
  }
}

async function resetAnalytics() {
  await initializeAnalytics();
}

// ===== MESSAGE HANDLING =====
self.addEventListener('message', (event) => {
  const message = event.data;
  
  if (message.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (message.type === 'GET_CACHE_STATS') {
    event.waitUntil(handleCacheStatsRequest(event));
  } else if (message.type === 'CLEAR_CACHE') {
    event.waitUntil(handleClearCacheRequest(message.cacheType));
  } else if (message.type === 'PRELOAD_CONTENT') {
    event.waitUntil(handlePreloadRequest(message.urls));
  }
});

async function handleCacheStatsRequest(event) {
  try {
    const analytics = await getStoredAnalytics();
    const cacheNames = await caches.keys();
    
    const stats = {
      analytics,
      cacheCount: cacheNames.length,
      cacheNames,
      version: CACHE_VERSION,
    };

    // Send response to client
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_STATS_RESPONSE',
        data: stats,
      });
    });
  } catch (error) {
    console.error('[SW] Cache stats request failed:', error);
  }
}

async function handleClearCacheRequest(cacheType) {
  try {
    if (cacheType && CACHE_NAMES[cacheType]) {
      const cacheName = CACHE_NAMES[cacheType];
      await caches.delete(cacheName);
      await caches.open(cacheName); // Recreate empty cache
      console.log(`[SW] Cleared cache: ${cacheName}`);
    } else {
      // Clear all caches
      for (const cacheName of Object.values(CACHE_NAMES)) {
        await caches.delete(cacheName);
        await caches.open(cacheName);
      }
      await initializeAnalytics();
      console.log('[SW] Cleared all caches');
    }
  } catch (error) {
    console.error('[SW] Clear cache request failed:', error);
  }
}

async function handlePreloadRequest(urls) {
  try {
    const cache = await caches.open(CACHE_NAMES.dynamic);
    
    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn(`[SW] Failed to preload ${url}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log(`[SW] Preloaded ${urls.length} URLs`);
  } catch (error) {
    console.error('[SW] Preload request failed:', error);
  }
}

async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (isApiRequest(pathname)) {
    return await createOfflineApiResponse(request);
  } else if (isImageRequest(pathname)) {
    return await createOfflineImageResponse();
  } else {
    return await createOfflineResponse();
  }
}

console.log('[SW] Service worker loaded successfully');