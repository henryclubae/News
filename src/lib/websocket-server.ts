// WebSocket server for real-time news updates
// This would typically be run as a separate service or integrated into your Next.js API

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

interface Client {
  id: string;
  ws: WebSocket;
  subscribedCategories: Set<string>;
  subscribedPriorities: Set<string>;
  lastPing: Date;
  metadata: {
    userAgent?: string;
    ip?: string;
    userId?: string;
  };
}

interface NewsUpdate {
  type: 'NEW_ARTICLE' | 'UPDATE_ARTICLE' | 'DELETE_ARTICLE' | 'BREAKING_NEWS';
  article: {
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
  };
  timestamp: string;
  changeId: string;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

class NewsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private httpServer: any;
  private port: number;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(port: number = 3001) {
    this.port = port;
    
    // Create HTTP server for WebSocket upgrade
    this.httpServer = createServer();
    
    // Create WebSocket server
    this.wss = new WebSocketServer({ 
      server: this.httpServer,
      path: '/news'
    });

    this.setupWebSocketHandlers();
    this.startPingInterval();
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      const client: Client = {
        id: clientId,
        ws,
        subscribedCategories: new Set(['breaking']), // Default to breaking news
        subscribedPriorities: new Set(['high', 'breaking']), // Default to high priority
        lastPing: new Date(),
        metadata: {
          userAgent: request.headers['user-agent'],
          ip: request.socket.remoteAddress,
        }
      };

      this.clients.set(clientId, client);
      console.log(`WebSocket client connected: ${clientId} (${this.clients.size} total)`);

      // Send welcome message
      this.sendMessage(client, {
        type: 'CONNECTION_ESTABLISHED',
        data: {
          clientId,
          timestamp: new Date().toISOString(),
          subscribedCategories: Array.from(client.subscribedCategories),
          subscribedPriorities: Array.from(client.subscribedPriorities)
        }
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error(`Invalid message from client ${clientId}:`, error);
          this.sendMessage(client, {
            type: 'ERROR',
            data: { message: 'Invalid message format' }
          });
        }
      });

      // Handle client disconnect
      ws.on('close', (code: number, reason: Buffer) => {
        console.log(`WebSocket client disconnected: ${clientId} (code: ${code}, reason: ${reason.toString()})`);
        this.clients.delete(clientId);
      });

      // Handle WebSocket errors
      ws.on('error', (error: Error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Handle pong responses
      ws.on('pong', () => {
        client.lastPing = new Date();
      });
    });

    this.wss.on('error', (error: Error) => {
      console.error('WebSocket server error:', error);
    });
  }

  private handleClientMessage(client: Client, message: WebSocketMessage): void {
    console.log(`Message from ${client.id}:`, message.type);

    switch (message.type) {
      case 'SUBSCRIBE_CATEGORIES':
        this.handleSubscribeCategories(client, message.data?.categories);
        break;

      case 'UNSUBSCRIBE_CATEGORIES':
        this.handleUnsubscribeCategories(client, message.data?.categories);
        break;

      case 'SUBSCRIBE_CATEGORY':
        this.handleSubscribeCategory(client, message.data?.category);
        break;

      case 'UNSUBSCRIBE_CATEGORY':
        this.handleUnsubscribeCategory(client, message.data?.category);
        break;

      case 'SUBSCRIBE_PRIORITY':
        this.handleSubscribePriority(client, message.data?.priority);
        break;

      case 'UPDATE_USER_INFO':
        this.handleUpdateUserInfo(client, message.data);
        break;

      case 'PING':
        this.sendMessage(client, { type: 'PONG', timestamp: new Date().toISOString() });
        break;

      default:
        console.warn(`Unknown message type from ${client.id}: ${message.type}`);
        this.sendMessage(client, {
          type: 'ERROR',
          data: { message: `Unknown message type: ${message.type}` }
        });
    }
  }

  private handleSubscribeCategories(client: Client, categories: string[]): void {
    if (Array.isArray(categories)) {
      categories.forEach(category => client.subscribedCategories.add(category));
      
      this.sendMessage(client, {
        type: 'SUBSCRIPTION_UPDATED',
        data: {
          subscribedCategories: Array.from(client.subscribedCategories),
          action: 'added',
          categories: categories
        }
      });
    }
  }

  private handleUnsubscribeCategories(client: Client, categories: string[]): void {
    if (Array.isArray(categories)) {
      categories.forEach(category => client.subscribedCategories.delete(category));
      
      this.sendMessage(client, {
        type: 'SUBSCRIPTION_UPDATED',
        data: {
          subscribedCategories: Array.from(client.subscribedCategories),
          action: 'removed',
          categories: categories
        }
      });
    }
  }

  private handleSubscribeCategory(client: Client, category: string): void {
    if (typeof category === 'string') {
      client.subscribedCategories.add(category);
      
      this.sendMessage(client, {
        type: 'SUBSCRIPTION_UPDATED',
        data: {
          subscribedCategories: Array.from(client.subscribedCategories),
          action: 'added',
          category: category
        }
      });
    }
  }

  private handleUnsubscribeCategory(client: Client, category: string): void {
    if (typeof category === 'string') {
      client.subscribedCategories.delete(category);
      
      this.sendMessage(client, {
        type: 'SUBSCRIPTION_UPDATED',
        data: {
          subscribedCategories: Array.from(client.subscribedCategories),
          action: 'removed',
          category: category
        }
      });
    }
  }

  private handleSubscribePriority(client: Client, priorities: string[]): void {
    if (Array.isArray(priorities)) {
      client.subscribedPriorities.clear();
      priorities.forEach(priority => client.subscribedPriorities.add(priority));
      
      this.sendMessage(client, {
        type: 'SUBSCRIPTION_UPDATED',
        data: {
          subscribedPriorities: Array.from(client.subscribedPriorities),
          action: 'set',
          priorities: priorities
        }
      });
    }
  }

  private handleUpdateUserInfo(client: Client, userInfo: any): void {
    if (userInfo && typeof userInfo === 'object') {
      client.metadata = { ...client.metadata, ...userInfo };
      
      this.sendMessage(client, {
        type: 'USER_INFO_UPDATED',
        data: { success: true }
      });
    }
  }

  private sendMessage(client: Client, message: WebSocketMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        }));
      } catch (error) {
        console.error(`Failed to send message to client ${client.id}:`, error);
      }
    }
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      
      this.clients.forEach((client, clientId) => {
        const timeSinceLastPing = now.getTime() - client.lastPing.getTime();
        
        // Remove clients that haven't responded to ping in 60 seconds
        if (timeSinceLastPing > 60000) {
          console.log(`Removing unresponsive client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        // Send ping to clients every 30 seconds
        if (timeSinceLastPing > 30000) {
          try {
            client.ws.ping();
          } catch (error) {
            console.error(`Failed to ping client ${clientId}:`, error);
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // Public method to broadcast news updates
  public broadcastNewsUpdate(update: NewsUpdate): void {
    let sentCount = 0;

    this.clients.forEach((client, clientId) => {
      // Check if client is subscribed to this category
      const categoryMatch = client.subscribedCategories.has(update.article.category) ||
                           client.subscribedCategories.has('all');

      // Check if client is subscribed to this priority
      const priorityMatch = client.subscribedPriorities.has(update.article.priority) ||
                           client.subscribedPriorities.has('all');

      if (categoryMatch && priorityMatch) {
        this.sendMessage(client, {
          type: 'NEWS_UPDATE',
          data: update
        });
        sentCount++;
      }
    });

    console.log(`Broadcasted ${update.type} to ${sentCount}/${this.clients.size} clients`);
  }

  // Public method to get server statistics
  public getStats(): object {
    const categoryStats: { [key: string]: number } = {};
    const priorityStats: { [key: string]: number } = {};

    this.clients.forEach(client => {
      client.subscribedCategories.forEach(category => {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
      client.subscribedPriorities.forEach(priority => {
        priorityStats[priority] = (priorityStats[priority] || 0) + 1;
      });
    });

    return {
      totalClients: this.clients.size,
      categorySubscriptions: categoryStats,
      prioritySubscriptions: priorityStats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  public start(): void {
    this.httpServer.listen(this.port, () => {
      console.log(`News WebSocket server listening on port ${this.port}`);
      console.log(`WebSocket endpoint: ws://localhost:${this.port}/news`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  private shutdown(): void {
    console.log('Shutting down WebSocket server...');

    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Close all client connections
    this.clients.forEach((client, clientId) => {
      console.log(`Closing connection for client: ${clientId}`);
      client.ws.close(1001, 'Server shutting down');
    });

    // Close WebSocket server
    this.wss.close((err) => {
      if (err) {
        console.error('Error closing WebSocket server:', err);
      } else {
        console.log('WebSocket server closed');
      }
    });

    // Close HTTP server
    this.httpServer.close((err: Error) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
      } else {
        console.log('HTTP server closed');
      }
      process.exit(0);
    });
  }
}

// Example usage
export default NewsWebSocketServer;

// If running this file directly
if (require.main === module) {
  const server = new NewsWebSocketServer(3001);
  server.start();

  // Simulate news updates for testing
  setInterval(() => {
    const mockUpdate: NewsUpdate = {
      type: 'NEW_ARTICLE',
      article: {
        id: `mock-${Date.now()}`,
        title: `Breaking: Mock news at ${new Date().toLocaleTimeString()}`,
        content: 'This is a mock news article for testing the WebSocket connection.',
        summary: 'Mock news summary',
        author: 'Test Author',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'technology',
        tags: ['mock', 'test', 'websocket'],
        priority: Math.random() > 0.8 ? 'breaking' : 'medium',
        version: 1
      },
      timestamp: new Date().toISOString(),
      changeId: `change-${Date.now()}`
    };

    server.broadcastNewsUpdate(mockUpdate);
  }, 15000); // Send mock update every 15 seconds
}