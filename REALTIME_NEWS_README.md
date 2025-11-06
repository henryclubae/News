# Real-Time News Updates Implementation

This implementation provides a comprehensive real-time news updates system with WebSocket connections, Server-Sent Events (SSE), push notifications, and offline support.

## Features

### ✅ Real-Time Communications
- **WebSocket connection** for bidirectional real-time updates
- **Server-Sent Events (SSE)** for unidirectional server-to-client streaming
- **Automatic reconnection** with exponential backoff
- **Connection status monitoring** with visual indicators

### ✅ News Update Types
- `NEW_ARTICLE` - New articles published
- `UPDATE_ARTICLE` - Existing articles modified
- `DELETE_ARTICLE` - Articles removed
- `BREAKING_NEWS` - High-priority urgent news

### ✅ Offline Support & Service Workers
- **Service worker registration** for offline functionality
- **Background sync** for pending updates when back online
- **Offline article caching** with intelligent cache management
- **Network-first** strategy with offline fallbacks

### ✅ Push Notification System
- **Browser push notifications** for breaking news
- **Notification permission handling** with user consent
- **Customizable notification actions** (Read Now, Dismiss)
- **Vibration patterns** for different priority levels

### ✅ Conflict Resolution
- **Version-based conflict detection** for concurrent updates
- **Client-side conflict resolution** with server arbitration
- **Pending update queue** management for offline scenarios

### ✅ Subscription Management
- **Category-based subscriptions** (technology, business, sports, etc.)
- **Priority-level filtering** (low, medium, high, breaking)
- **Dynamic subscription changes** without reconnection
- **User preference persistence**

## Usage

### Basic Implementation

```tsx
import React from 'react';
import { useRealTimeNews } from '@/hooks/useRealTimeNews';
import RealTimeNewsDisplay from '@/components/news/RealTimeNewsDisplay';

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RealTimeNewsDisplay
        categories={['breaking', 'technology', 'business']}
        maxArticles={20}
        showNotifications={true}
        enableAutoRefresh={true}
      />
    </div>
  );
}
```

### Advanced Hook Usage

```tsx
import { useRealTimeNews } from '@/hooks/useRealTimeNews';

function CustomNewsComponent() {
  const {
    articles,
    updates,
    notifications,
    connectionStatus,
    isLoading,
    error,
    
    // Actions
    refreshNews,
    markNotificationRead,
    subscribeToCategory,
    togglePushNotifications,
    forceReconnect,
    
    // Offline support
    syncPendingUpdates,
    getOfflineArticles
  } = useRealTimeNews({
    enableWebSocket: true,
    enableSSE: true,
    enablePushNotifications: true,
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    categories: ['technology', 'business'],
    priority: ['high', 'breaking']
  });

  // Custom logic here...
  
  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
}
```

## API Endpoints

### Server-Sent Events
```
GET /api/news/stream
Content-Type: text/event-stream
```

### Synchronization
```
POST /api/news/sync
Content-Type: application/json

{
  "updates": [...],
  "clientId": "client-123",
  "lastSyncTimestamp": "2024-01-01T00:00:00Z"
}
```

### WebSocket Connection
```
WebSocket: ws://localhost:3001/news
```

## Environment Variables

```env
# WebSocket server URL (optional)
NEXT_PUBLIC_WS_URL=ws://localhost:3001/news

# Server-Sent Events endpoint (optional)
NEXT_PUBLIC_SSE_URL=/api/news/stream

# Enable development mode logging
NEXT_PUBLIC_DEBUG_REALTIME=true
```

## Service Worker Setup

The service worker (`/public/sw-news.js`) provides:

- **Offline caching** of articles and API responses
- **Background sync** for pending updates
- **Push notification handling** with custom actions
- **Cache management** with intelligent cleanup

### Service Worker Features

1. **Network-First Strategy** for news API endpoints
2. **Stale-While-Revalidate** for article pages
3. **Cache-First** for static assets
4. **Offline fallback** pages with retry functionality
5. **Periodic background refresh** of cached content

## WebSocket Server

The WebSocket server (`/src/lib/websocket-server.ts`) handles:

- **Client connection management** with automatic cleanup
- **Subscription-based message routing** by category/priority
- **Heartbeat monitoring** with automatic disconnection
- **Graceful shutdown** with proper cleanup
- **Broadcasting capabilities** for news updates

### Server Commands

```bash
# Install WebSocket dependencies
npm install ws @types/ws

# Start WebSocket server (if running separately)
node src/lib/websocket-server.js
```

## Connection Status Monitoring

The system provides real-time connection status with:

- **Visual indicators** (green = connected, red = disconnected, gray = offline)
- **Connection attempt counters** with exponential backoff
- **Last connection timestamps** for debugging
- **Error message display** for troubleshooting
- **Manual reconnection** button for user control

## Notification System

### In-App Notifications
- **Sliding notification panels** with read/unread status
- **Action buttons** for quick article access
- **Notification history** with timestamp tracking
- **Bulk operations** (mark all read, clear all)

### Push Notifications
- **Permission request handling** with user-friendly prompts
- **Breaking news alerts** with enhanced visibility
- **Custom notification actions** with deep linking
- **Vibration patterns** for different urgency levels

## Offline Capabilities

### Automatic Features
- **Service worker registration** on component mount
- **Offline article caching** with size limits
- **Pending update queuing** for later synchronization
- **Network status detection** with automatic sync

### Manual Controls
- **Force sync** button for manual synchronization
- **Clear offline queue** for troubleshooting
- **Offline article viewer** for cached content
- **Cache status display** for debugging

## Performance Optimizations

- **Exponential backoff** for reconnection attempts
- **Message batching** for high-frequency updates
- **Memory leak prevention** with proper cleanup
- **Throttled updates** to prevent UI flooding
- **Selective rendering** based on subscription preferences

## Error Handling

- **Network error recovery** with automatic retry
- **WebSocket error handling** with fallback to SSE
- **Push notification error recovery** with user feedback
- **Sync error handling** with conflict resolution
- **Graceful degradation** when features are unavailable

## Browser Compatibility

- **Modern browsers** with full feature support
- **Progressive enhancement** for older browsers
- **Feature detection** with appropriate fallbacks
- **Polyfill integration** where needed

## Security Considerations

- **CORS configuration** for cross-origin requests
- **Input validation** for all WebSocket messages
- **Rate limiting** for API endpoints
- **Authentication integration** ready for user-specific features
- **Secure WebSocket** (WSS) support for production

This implementation provides a production-ready real-time news system with comprehensive offline support, push notifications, and robust error handling.