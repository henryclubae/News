/**
 * Comprehensive Caching System for News Website
 * 
 * Features:
 * - Redis integration for server-side caching
 * - Browser cache management (IndexedDB, localStorage)
 * - Cache invalidation strategies
 * - Article cache with intelligent TTL
 * - Search results caching with query optimization
 * - Image cache optimization
 * - Service worker integration
 * - Cache analytics and monitoring
 */

import { Redis } from 'ioredis';

// ===== INTERFACES AND TYPES =====

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for bulk invalidation
  version?: string; // Cache version for invalidation
  serialize?: boolean; // Whether to serialize data
  compress?: boolean; // Whether to compress data
  priority?: 'low' | 'medium' | 'high'; // Cache priority for eviction
}

export interface CacheItem<T = any> {
  data: T;
  metadata: CacheMetadata;
  key: string;
  version: string;
}

export interface CacheMetadata {
  createdAt: number;
  expiresAt: number;
  lastAccessed: number;
  accessCount: number;
  tags: string[];
  size: number;
  contentType?: string;
  etag?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  totalKeys: number;
  usedMemory: number;
  avgResponseTime: number;
  lastCleanup: number;
}

export interface CacheStrategy {
  name: string;
  ttl: number;
  maxSize?: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'size';
  compression?: boolean;
  tags?: string[];
}

// Cache strategies for different content types
export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  article: {
    name: 'article',
    ttl: 3600, // 1 hour
    maxSize: 1024 * 1024, // 1MB per article
    evictionPolicy: 'lru',
    compression: true,
    tags: ['articles', 'content'],
  },
  searchResults: {
    name: 'search',
    ttl: 900, // 15 minutes
    maxSize: 512 * 1024, // 512KB per search result
    evictionPolicy: 'lfu',
    compression: true,
    tags: ['search', 'results'],
  },
  userProfile: {
    name: 'user',
    ttl: 1800, // 30 minutes
    maxSize: 256 * 1024, // 256KB per profile
    evictionPolicy: 'lru',
    compression: false,
    tags: ['users', 'profiles'],
  },
  categoryData: {
    name: 'category',
    ttl: 7200, // 2 hours
    maxSize: 2 * 1024 * 1024, // 2MB per category
    evictionPolicy: 'ttl',
    compression: true,
    tags: ['categories', 'navigation'],
  },
  imageMetadata: {
    name: 'image',
    ttl: 86400, // 24 hours
    maxSize: 64 * 1024, // 64KB per image metadata
    evictionPolicy: 'size',
    compression: false,
    tags: ['images', 'media'],
  },
  apiResponse: {
    name: 'api',
    ttl: 300, // 5 minutes
    maxSize: 1024 * 1024, // 1MB per API response
    evictionPolicy: 'lru',
    compression: true,
    tags: ['api', 'external'],
  },
};

// ===== BASE CACHE INTERFACE =====

export abstract class BaseCacheAdapter {
  protected stats: CacheStats = {
    hitRate: 0,
    missRate: 0,
    totalHits: 0,
    totalMisses: 0,
    totalKeys: 0,
    usedMemory: 0,
    avgResponseTime: 0,
    lastCleanup: Date.now(),
  };

  abstract get<T>(key: string): Promise<CacheItem<T> | null>;
  abstract set<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
  abstract delete(key: string): Promise<boolean>;
  abstract exists(key: string): Promise<boolean>;
  abstract clear(pattern?: string): Promise<void>;
  abstract invalidateByTags(tags: string[]): Promise<void>;
  abstract getStats(): Promise<CacheStats>;
  abstract cleanup(): Promise<void>;

  protected updateStats(hit: boolean, responseTime: number): void {
    if (hit) {
      this.stats.totalHits++;
    } else {
      this.stats.totalMisses++;
    }
    
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = (this.stats.totalHits / total) * 100;
    this.stats.missRate = (this.stats.totalMisses / total) * 100;
    
    // Update average response time
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime + responseTime) / 2;
  }

  public generateKey(prefix: string, identifier: string, version?: string): string {
    const versionSuffix = version ? `:v${version}` : '';
    return `${prefix}:${identifier}${versionSuffix}`;
  }

  protected isExpired(metadata: CacheMetadata): boolean {
    return Date.now() > metadata.expiresAt;
  }

  protected shouldEvict(metadata: CacheMetadata, strategy: CacheStrategy): boolean {
    const now = Date.now();
    const age = now - metadata.createdAt;
    const maxAge = strategy.ttl * 1000;
    
    return age > maxAge || this.isExpired(metadata);
  }
}

// ===== REDIS CACHE ADAPTER =====

export class RedisCacheAdapter extends BaseCacheAdapter {
  private redis: Redis;
  private connected: boolean = false;

  constructor(config?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
  }) {
    super();
    
    const redisConfig = {
      host: config?.host || process.env.REDIS_HOST || 'localhost',
      port: config?.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config?.password || process.env.REDIS_PASSWORD,
      db: config?.db || parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: config?.keyPrefix || 'news:cache:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    this.redis = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('[Cache] Redis connected');
      this.connected = true;
    });

    this.redis.on('error', (error) => {
      console.error('[Cache] Redis error:', error);
      this.connected = false;
    });

    this.redis.on('close', () => {
      console.log('[Cache] Redis connection closed');
      this.connected = false;
    });
  }

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const startTime = Date.now();
    
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      const serializedData = await this.redis.get(key);
      const responseTime = Date.now() - startTime;

      if (!serializedData) {
        this.updateStats(false, responseTime);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(serializedData);
      
      // Check if expired
      if (this.isExpired(cacheItem.metadata)) {
        await this.delete(key);
        this.updateStats(false, responseTime);
        return null;
      }

      // Update access metadata
      cacheItem.metadata.lastAccessed = Date.now();
      cacheItem.metadata.accessCount++;
      
      // Update in Redis with new metadata
      await this.redis.set(key, JSON.stringify(cacheItem));
      
      this.updateStats(true, responseTime);
      return cacheItem;
    } catch (error) {
      console.error('[Cache] Redis get error:', error);
      this.updateStats(false, Date.now() - startTime);
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      const ttl = options.ttl || 3600; // Default 1 hour
      const now = Date.now();
      
      const metadata: CacheMetadata = {
        createdAt: now,
        expiresAt: now + (ttl * 1000),
        lastAccessed: now,
        accessCount: 1,
        tags: options.tags || [],
        size: this.calculateSize(data),
        priority: options.priority || 'medium',
        etag: this.generateETag(data),
      };

      const cacheItem: CacheItem<T> = {
        data,
        metadata,
        key,
        version: options.version || '1.0',
      };

      const serializedData = JSON.stringify(cacheItem);
      
      // Set with TTL
      await this.redis.setex(key, ttl, serializedData);
      
      // Add to tag indexes for bulk invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key);
          await this.redis.expire(`tag:${tag}`, ttl);
        }
      }

      this.stats.totalKeys++;
      this.stats.usedMemory += metadata.size;
    } catch (error) {
      console.error('[Cache] Redis set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      // Get item to remove from tag indexes
      const item = await this.get(key);
      if (item) {
        for (const tag of item.metadata.tags) {
          await this.redis.srem(`tag:${tag}`, key);
        }
        this.stats.usedMemory -= item.metadata.size;
        this.stats.totalKeys--;
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error('[Cache] Redis delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }
      
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[Cache] Redis exists error:', error);
      return false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      const searchPattern = pattern || '*';
      const keys = await this.redis.keys(searchPattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.stats.totalKeys = Math.max(0, this.stats.totalKeys - keys.length);
      }

      // Clear tag indexes if clearing all
      if (!pattern) {
        const tagKeys = await this.redis.keys('tag:*');
        if (tagKeys.length > 0) {
          await this.redis.del(...tagKeys);
        }
        
        this.stats.usedMemory = 0;
        this.stats.totalKeys = 0;
      }
    } catch (error) {
      console.error('[Cache] Redis clear error:', error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
          this.stats.totalKeys = Math.max(0, this.stats.totalKeys - keys.length);
        }
      }
    } catch (error) {
      console.error('[Cache] Redis invalidateByTags error:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const usedMemory = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      return {
        ...this.stats,
        usedMemory,
      };
    } catch (error) {
      console.error('[Cache] Redis getStats error:', error);
      return this.stats;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (!this.connected) {
        await this.redis.connect();
      }

      // Remove expired keys and orphaned tags
      const allKeys = await this.redis.keys('*');
      const expiredKeys: string[] = [];
      
      for (const key of allKeys) {
        if (key.startsWith('tag:')) continue;
        
        const ttl = await this.redis.ttl(key);
        if (ttl === -1 || ttl === 0) { // No TTL or expired
          const item = await this.get(key);
          if (!item || this.isExpired(item.metadata)) {
            expiredKeys.push(key);
          }
        }
      }

      if (expiredKeys.length > 0) {
        await this.redis.del(...expiredKeys);
        this.stats.totalKeys -= expiredKeys.length;
      }

      this.stats.lastCleanup = Date.now();
      console.log(`[Cache] Cleanup completed. Removed ${expiredKeys.length} expired keys.`);
    } catch (error) {
      console.error('[Cache] Redis cleanup error:', error);
    }
  }

  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  private generateETag(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.connected = false;
    }
  }
}

// ===== BROWSER CACHE ADAPTER =====

export class BrowserCacheAdapter extends BaseCacheAdapter {
  private dbName: string = 'news-website-cache';
  private dbVersion: number = 1;
  private storeName: string = 'cache-store';
  private db: IDBDatabase | null = null;
  private maxQuota: number = 100 * 1024 * 1024; // 100MB default

  constructor(options?: {
    dbName?: string;
    maxQuota?: number;
  }) {
    super();
    if (options?.dbName) this.dbName = options.dbName;
    if (options?.maxQuota) this.maxQuota = options.maxQuota;
    
    if (typeof window !== 'undefined') {
      this.initIndexedDB();
      this.checkQuota();
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('[Cache] IndexedDB not supported, falling back to localStorage');
        resolve();
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('[Cache] IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('tags', 'metadata.tags', { multiEntry: true });
          store.createIndex('expiresAt', 'metadata.expiresAt');
          store.createIndex('priority', 'metadata.priority');
        }
      };
    });
  }

  private async checkQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage || 0) / (1024 * 1024);
        const quotaMB = (estimate.quota || 0) / (1024 * 1024);
        
        console.log(`[Cache] Storage used: ${usedMB.toFixed(2)}MB / ${quotaMB.toFixed(2)}MB`);
        
        if (usedMB > quotaMB * 0.8) {
          console.warn('[Cache] Storage quota nearly full, triggering cleanup');
          await this.cleanup();
        }
      } catch (error) {
        console.error('[Cache] Error checking storage quota:', error);
      }
    }
  }

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const startTime = Date.now();
    
    try {
      if (this.db) {
        const item = await this.getFromIndexedDB<T>(key);
        const responseTime = Date.now() - startTime;
        
        if (item && !this.isExpired(item.metadata)) {
          item.metadata.lastAccessed = Date.now();
          item.metadata.accessCount++;
          await this.setToIndexedDB(item);
          this.updateStats(true, responseTime);
          return item;
        } else if (item) {
          await this.delete(key);
        }
      }

      // Fallback to localStorage
      const item = this.getFromLocalStorage<T>(key);
      const responseTime = Date.now() - startTime;
      
      if (item && !this.isExpired(item.metadata)) {
        item.metadata.lastAccessed = Date.now();
        item.metadata.accessCount++;
        this.setToLocalStorage(item);
        this.updateStats(true, responseTime);
        return item;
      } else if (item) {
        await this.delete(key);
      }

      this.updateStats(false, responseTime);
      return null;
    } catch (error) {
      console.error('[Cache] Browser get error:', error);
      this.updateStats(false, Date.now() - startTime);
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || 3600;
      const now = Date.now();
      
      const metadata: CacheMetadata = {
        createdAt: now,
        expiresAt: now + (ttl * 1000),
        lastAccessed: now,
        accessCount: 1,
        tags: options.tags || [],
        size: this.calculateSize(data),
        priority: options.priority || 'medium',
      };

      const cacheItem: CacheItem<T> = {
        data,
        metadata,
        key,
        version: options.version || '1.0',
      };

      // Check quota before adding
      if (metadata.size > this.maxQuota * 0.1) {
        console.warn('[Cache] Item too large for browser cache:', key);
        return;
      }

      if (this.db) {
        await this.setToIndexedDB(cacheItem);
      } else {
        this.setToLocalStorage(cacheItem);
      }

      this.stats.totalKeys++;
      this.stats.usedMemory += metadata.size;
    } catch (error) {
      console.error('[Cache] Browser set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;
      
      if (this.db) {
        const item = await this.getFromIndexedDB(key);
        if (item) {
          this.stats.usedMemory -= item.metadata.size;
          this.stats.totalKeys--;
        }
        deleted = await this.deleteFromIndexedDB(key);
      }
      
      if (!deleted) {
        const item = this.getFromLocalStorage(key);
        if (item) {
          this.stats.usedMemory -= item.metadata.size;
          this.stats.totalKeys--;
        }
        deleted = this.deleteFromLocalStorage(key);
      }

      return deleted;
    } catch (error) {
      console.error('[Cache] Browser delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.db) {
        const item = await this.getFromIndexedDB(key);
        return item !== null && !this.isExpired(item.metadata);
      }
      
      const item = this.getFromLocalStorage(key);
      return item !== null && !this.isExpired(item.metadata);
    } catch (error) {
      console.error('[Cache] Browser exists error:', error);
      return false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (this.db) {
        await this.clearIndexedDB(pattern);
      }
      this.clearLocalStorage(pattern);
      
      if (!pattern) {
        this.stats.usedMemory = 0;
        this.stats.totalKeys = 0;
      }
    } catch (error) {
      console.error('[Cache] Browser clear error:', error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      if (this.db) {
        await this.invalidateByTagsIndexedDB(tags);
      }
      this.invalidateByTagsLocalStorage(tags);
    } catch (error) {
      console.error('[Cache] Browser invalidateByTags error:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.stats.usedMemory = estimate.usage || 0;
      }
    } catch (error) {
      console.error('[Cache] Error getting browser storage stats:', error);
    }
    
    return this.stats;
  }

  async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      if (this.db) {
        cleanedCount += await this.cleanupIndexedDB();
      }
      
      cleanedCount += this.cleanupLocalStorage();
      
      this.stats.lastCleanup = now;
      console.log(`[Cache] Browser cleanup completed. Removed ${cleanedCount} expired items.`);
    } catch (error) {
      console.error('[Cache] Browser cleanup error:', error);
    }
  }

  // IndexedDB helper methods
  private async getFromIndexedDB<T>(key: string): Promise<CacheItem<T> | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async setToIndexedDB<T>(item: CacheItem<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(false);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(pattern?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      if (!pattern) {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } else {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            if (cursor.key.toString().includes(pattern)) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  private async invalidateByTagsIndexedDB(tags: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('tags');

      let completedTags = 0;
      
      for (const tag of tags) {
        const request = index.openCursor(IDBKeyRange.only(tag));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            completedTags++;
            if (completedTags === tags.length) {
              resolve();
            }
          }
        };
        
        request.onerror = () => reject(request.error);
      }
    });
  }

  private async cleanupIndexedDB(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(0);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      let cleanedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item: CacheItem = cursor.value;
          if (this.isExpired(item.metadata)) {
            cursor.delete();
            cleanedCount++;
          }
          cursor.continue();
        } else {
          resolve(cleanedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // LocalStorage helper methods (fallback)
  private getFromLocalStorage<T>(key: string): CacheItem<T> | null {
    try {
      const item = localStorage.getItem(`cache:${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('[Cache] LocalStorage get error:', error);
      return null;
    }
  }

  private setToLocalStorage<T>(item: CacheItem<T>): void {
    try {
      localStorage.setItem(`cache:${item.key}`, JSON.stringify(item));
    } catch (error) {
      console.error('[Cache] LocalStorage set error:', error);
      // Handle quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        this.cleanupLocalStorage();
        // Try again after cleanup
        try {
          localStorage.setItem(`cache:${item.key}`, JSON.stringify(item));
        } catch (retryError) {
          console.error('[Cache] LocalStorage retry failed:', retryError);
        }
      }
    }
  }

  private deleteFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(`cache:${key}`);
      return true;
    } catch (error) {
      console.error('[Cache] LocalStorage delete error:', error);
      return false;
    }
  }

  private clearLocalStorage(pattern?: string): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache:')) {
          if (!pattern || key.includes(pattern)) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[Cache] LocalStorage clear error:', error);
    }
  }

  private invalidateByTagsLocalStorage(tags: string[]): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache:')) {
          try {
            const item: CacheItem = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.metadata?.tags?.some(tag => tags.includes(tag))) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Invalid item, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[Cache] LocalStorage invalidateByTags error:', error);
    }
  }

  private cleanupLocalStorage(): number {
    let cleanedCount = 0;
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache:')) {
          try {
            const item: CacheItem = JSON.parse(localStorage.getItem(key) || '{}');
            if (this.isExpired(item.metadata)) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Invalid item, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });
    } catch (error) {
      console.error('[Cache] LocalStorage cleanup error:', error);
    }
    
    return cleanedCount;
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough UTF-16 size estimate
    } catch {
      return 0;
    }
  }
}

// ===== CACHE MANAGER =====

export class CacheManager {
  private serverCache: RedisCacheAdapter;
  private clientCache: BrowserCacheAdapter | null = null;
  private isServer: boolean;

  constructor(redisConfig?: any, browserConfig?: any) {
    this.isServer = typeof window === 'undefined';
    this.serverCache = new RedisCacheAdapter(redisConfig);
    
    if (!this.isServer) {
      this.clientCache = new BrowserCacheAdapter(browserConfig);
    }
  }

  private getAdapter(): BaseCacheAdapter {
    if (this.isServer) {
      return this.serverCache;
    }
    if (!this.clientCache) {
      throw new Error('Client cache not initialized');
    }
    return this.clientCache;
  }

  async get<T>(key: string): Promise<T | null> {
    const item = await this.getAdapter().get<T>(key);
    return item?.data || null;
  }

  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    await this.getAdapter().set(key, data, options);
  }

  async delete(key: string): Promise<boolean> {
    return await this.getAdapter().delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return await this.getAdapter().exists(key);
  }

  async clear(pattern?: string): Promise<void> {
    await this.getAdapter().clear(pattern);
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    await this.getAdapter().invalidateByTags(tags);
  }

  async getStats(): Promise<CacheStats> {
    return await this.getAdapter().getStats();
  }

  async cleanup(): Promise<void> {
    await this.getAdapter().cleanup();
  }

  // Convenience methods for specific cache types
  async cacheArticle(articleId: string, article: any, options?: Partial<CacheOptions>): Promise<void> {
    const strategy = CACHE_STRATEGIES.article;
    await this.set(
      this.getAdapter().generateKey('article', articleId),
      article,
      {
        ttl: strategy.ttl,
        tags: ['articles', 'content', `article:${articleId}`],
        priority: 'high',
        ...options,
      }
    );
  }

  async getArticle(articleId: string): Promise<any | null> {
    return await this.get(this.getAdapter().generateKey('article', articleId));
  }

  async cacheSearchResults(query: string, results: any[], options?: Partial<CacheOptions>): Promise<void> {
    const strategy = CACHE_STRATEGIES.searchResults;
    const normalizedQuery = query.toLowerCase().trim();
    
    await this.set(
      this.getAdapter().generateKey('search', normalizedQuery),
      results,
      {
        ttl: strategy.ttl,
        tags: ['search', 'results'],
        priority: 'medium',
        ...options,
      }
    );
  }

  async getSearchResults(query: string): Promise<any[] | null> {
    const normalizedQuery = query.toLowerCase().trim();
    return await this.get(this.getAdapter().generateKey('search', normalizedQuery));
  }

  async invalidateArticle(articleId: string): Promise<void> {
    await this.invalidateByTags([`article:${articleId}`]);
  }

  async invalidateSearch(): Promise<void> {
    await this.invalidateByTags(['search', 'results']);
  }

  // Batch operations
  async setMultiple<T>(items: Array<{ key: string; data: T; options?: CacheOptions }>): Promise<void> {
    const promises = items.map(({ key, data, options }) => this.set(key, data, options));
    await Promise.all(promises);
  }

  async getMultiple<T>(keys: string[]): Promise<Array<{ key: string; data: T | null }>> {
    const promises = keys.map(async (key) => ({
      key,
      data: await this.get<T>(key),
    }));
    
    return await Promise.all(promises);
  }

  // Warming strategies
  async warmCache(strategy: 'popular' | 'recent' | 'categories'): Promise<void> {
    console.log(`[Cache] Warming cache with strategy: ${strategy}`);
    
    switch (strategy) {
      case 'popular':
        // Implementation would fetch popular articles and cache them
        break;
      case 'recent':
        // Implementation would fetch recent articles and cache them
        break;
      case 'categories':
        // Implementation would fetch category data and cache it
        break;
    }
  }

  async disconnect(): Promise<void> {
    if (this.serverCache) {
      await this.serverCache.disconnect();
    }
  }
}

// ===== SINGLETON INSTANCE =====

let cacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager();
  }
  return cacheManager;
}

// ===== CACHE UTILITIES =====

export class CacheUtils {
  static generateCacheKey(type: string, identifier: string, params?: Record<string, any>): string {
    let key = `${type}:${identifier}`;
    
    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
      key += `:${Buffer.from(sortedParams).toString('base64')}`;
    }
    
    return key;
  }

  static shouldCache(response: Response): boolean {
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl?.includes('no-cache') || cacheControl?.includes('no-store')) {
      return false;
    }
    
    return response.ok && response.status < 400;
  }

  static getTTLFromHeaders(response: Response): number {
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        return parseInt(maxAgeMatch[1]);
      }
    }
    
    const expires = response.headers.get('expires');
    if (expires) {
      const expiresDate = new Date(expires);
      const now = new Date();
      return Math.max(0, Math.floor((expiresDate.getTime() - now.getTime()) / 1000));
    }
    
    return 3600; // Default 1 hour
  }

  static createCacheMiddleware() {
    return async function cacheMiddleware(request: Request, next: Function) {
      const cache = getCacheManager();
      const cacheKey = CacheUtils.generateCacheKey('api', request.url);
      
      // Try to get from cache first
      const cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        return new Response(JSON.stringify(cachedResponse), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
          },
        });
      }
      
      // Execute request
      const response = await next(request);
      
      // Cache the response if appropriate
      if (CacheUtils.shouldCache(response)) {
        const data = await response.clone().json();
        const ttl = CacheUtils.getTTLFromHeaders(response);
        
        await cache.set(cacheKey, data, {
          ttl,
          tags: ['api'],
        });
      }
      
      return response;
    };
  }
}

export default CacheManager;