/**
 * Image Cache System
 * 
 * Advanced image caching with format optimization, progressive loading,
 * CDN integration, and WebP/AVIF support
 */

import { getCacheManager, CacheOptions } from './cache';

// ===== INTERFACES =====

export interface ImageMetadata {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'svg';
  size: number;
  blurhash?: string;
  dominantColor?: string;
  aspectRatio: number;
  optimizedVersions: {
    [size: string]: {
      url: string;
      width: number;
      height: number;
      size: number;
      format: string;
    };
  };
  cdnUrls?: {
    original: string;
    webp?: string;
    avif?: string;
    thumbnail: string;
    medium: string;
    large: string;
  };
  lastModified: number;
  etag?: string;
}

export interface ImageCacheConfig {
  baseTTL: number;
  optimizedTTL: number;
  metadataTTL: number;
  maxImageSize: number;
  enableWebP: boolean;
  enableAVIF: boolean;
  enableBlurhash: boolean;
  cdnBaseUrl?: string;
  compressionQuality: number;
  resolutionBreakpoints: number[];
}

export interface ImageOptimizationRequest {
  url: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export interface CachedImageData {
  metadata: ImageMetadata;
  blob?: Blob;
  dataUrl?: string;
  objectUrl?: string;
  loadTime: number;
  cacheTime: number;
  accessCount: number;
}

// ===== IMAGE CACHE MANAGER =====

export class ImageCacheManager {
  private cacheManager = getCacheManager();
  private config: ImageCacheConfig;
  private imageCache = new Map<string, CachedImageData>();
  private loadingPromises = new Map<string, Promise<CachedImageData | null>>();

  constructor(config?: Partial<ImageCacheConfig>) {
    this.config = {
      baseTTL: 86400, // 24 hours for images
      optimizedTTL: 604800, // 7 days for optimized images
      metadataTTL: 3600, // 1 hour for metadata
      maxImageSize: 10 * 1024 * 1024, // 10MB max
      enableWebP: true,
      enableAVIF: true,
      enableBlurhash: true,
      compressionQuality: 85,
      resolutionBreakpoints: [320, 640, 768, 1024, 1280, 1920],
      ...config,
    };

    if (typeof window !== 'undefined') {
      this.initBrowserCache();
    }
  }

  // ===== CORE IMAGE CACHING =====

  async cacheImage(url: string, metadata?: Partial<ImageMetadata>): Promise<ImageMetadata> {
    const imageId = this.generateImageId(url);
    
    // Check if already cached
    const existingMetadata = await this.getImageMetadata(imageId);
    if (existingMetadata && this.isMetadataValid(existingMetadata)) {
      return existingMetadata;
    }

    // Prevent duplicate requests
    if (this.loadingPromises.has(imageId)) {
      const cachedData = await this.loadingPromises.get(imageId);
      return cachedData?.metadata || await this.generateImageMetadata(url, metadata);
    }

    const loadPromise = this.loadAndCacheImage(url, metadata);
    this.loadingPromises.set(imageId, loadPromise);

    try {
      const cachedData = await loadPromise;
      return cachedData?.metadata || await this.generateImageMetadata(url, metadata);
    } finally {
      this.loadingPromises.delete(imageId);
    }
  }

  async getOptimizedImage(request: ImageOptimizationRequest): Promise<string | null> {
    const cacheKey = this.generateOptimizationKey(request);
    
    // Check cache first
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate optimized version
    const optimizedUrl = await this.generateOptimizedImage(request);
    if (optimizedUrl) {
      // Cache the optimized URL
      await this.cacheManager.set(cacheKey, optimizedUrl, {
        ttl: this.config.optimizedTTL,
        tags: ['image-optimized', `image:${this.generateImageId(request.url)}`],
        priority: 'medium',
      });
    }

    return optimizedUrl;
  }

  async getImageMetadata(imageId: string): Promise<ImageMetadata | null> {
    const metadataKey = this.getMetadataKey(imageId);
    return await this.cacheManager.get<ImageMetadata>(metadataKey);
  }

  async preloadImage(url: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    if (typeof window === 'undefined') return;

    const imageId = this.generateImageId(url);
    const cached = this.imageCache.get(imageId);
    
    if (cached) {
      cached.accessCount++;
      return;
    }

    // Check if already loading
    if (this.loadingPromises.has(imageId)) {
      await this.loadingPromises.get(imageId);
      return;
    }

    // Start preloading
    const preloadPromise = this.preloadImageInBrowser(url, priority);
    this.loadingPromises.set(imageId, preloadPromise);

    try {
      await preloadPromise;
    } finally {
      this.loadingPromises.delete(imageId);
    }
  }

  // ===== BROWSER-SPECIFIC CACHING =====

  private initBrowserCache(): void {
    // Initialize IndexedDB for image caching
    if ('indexedDB' in window) {
      this.initImageDB();
    }

    // Handle memory pressure
    if ('memory' in performance) {
      this.monitorMemoryUsage();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  private async initImageDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('news-image-cache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('url', 'url');
          store.createIndex('lastAccessed', 'lastAccessed');
          store.createIndex('size', 'size');
        }
      };
    });
  }

  private monitorMemoryUsage(): void {
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        console.warn('[ImageCache] High memory usage detected, triggering cleanup');
        this.evictLeastUsedImages();
      }
    }, 30000); // Check every 30 seconds
  }

  private async loadAndCacheImage(url: string, metadata?: Partial<ImageMetadata>): Promise<CachedImageData | null> {
    try {
      const startTime = Date.now();
      
      // Fetch the image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
      }

      const blob = await response.blob();
      const loadTime = Date.now() - startTime;

      // Check size limits
      if (blob.size > this.config.maxImageSize) {
        console.warn(`[ImageCache] Image too large: ${url} (${blob.size} bytes)`);
        return null;
      }

      // Generate metadata
      const imageMetadata = await this.generateImageMetadata(url, {
        size: blob.size,
        format: this.getFormatFromBlob(blob),
        lastModified: Date.now(),
        etag: response.headers.get('etag') || undefined,
        ...metadata,
      });

      // Create cached data
      const cachedData: CachedImageData = {
        metadata: imageMetadata,
        blob,
        objectUrl: URL.createObjectURL(blob),
        loadTime,
        cacheTime: Date.now(),
        accessCount: 1,
      };

      // Store in memory cache
      this.imageCache.set(imageMetadata.id, cachedData);

      // Store metadata in persistent cache
      await this.cacheImageMetadata(imageMetadata);

      // Store blob in IndexedDB if available
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await this.storeBlobInDB(imageMetadata.id, blob);
      }

      return cachedData;
    } catch (error) {
      console.error(`[ImageCache] Error loading image ${url}:`, error);
      return null;
    }
  }

  private async preloadImageInBrowser(url: string, priority: 'low' | 'medium' | 'high'): Promise<CachedImageData | null> {
    const imageId = this.generateImageId(url);
    
    // Check memory cache first
    const cached = this.imageCache.get(imageId);
    if (cached) {
      cached.accessCount++;
      return cached;
    }

    // Check IndexedDB
    const dbData = await this.getBlobFromDB(imageId);
    if (dbData) {
      const cachedData: CachedImageData = {
        metadata: dbData.metadata,
        blob: dbData.blob,
        objectUrl: URL.createObjectURL(dbData.blob),
        loadTime: 0,
        cacheTime: dbData.metadata.lastModified,
        accessCount: 1,
      };
      
      this.imageCache.set(imageId, cachedData);
      return cachedData;
    }

    // Load from network based on priority
    return this.loadWithPriority(url, priority);
  }

  private async loadWithPriority(url: string, priority: 'low' | 'medium' | 'high'): Promise<CachedImageData | null> {
    const controller = new AbortController();
    
    // Set timeout based on priority
    const timeouts = { low: 10000, medium: 5000, high: 2000 };
    setTimeout(() => controller.abort(), timeouts[priority]);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        priority: priority as RequestInit['priority'],
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const imageMetadata = await this.generateImageMetadata(url, {
        size: blob.size,
        format: this.getFormatFromBlob(blob),
        lastModified: Date.now(),
      });

      const cachedData: CachedImageData = {
        metadata: imageMetadata,
        blob,
        objectUrl: URL.createObjectURL(blob),
        loadTime: 0,
        cacheTime: Date.now(),
        accessCount: 1,
      };

      this.imageCache.set(imageMetadata.id, cachedData);
      await this.storeBlobInDB(imageMetadata.id, blob);

      return cachedData;
    } catch (error) {
      console.error(`[ImageCache] Priority load failed for ${url}:`, error);
      return null;
    }
  }

  // ===== IMAGE OPTIMIZATION =====

  private async generateOptimizedImage(request: ImageOptimizationRequest): Promise<string | null> {
    if (typeof window === 'undefined') {
      // Server-side optimization (would integrate with image processing service)
      return this.generateCDNUrl(request);
    }

    // Client-side optimization using Canvas API
    try {
      const imageId = this.generateImageId(request.url);
      const cachedData = this.imageCache.get(imageId);
      
      if (!cachedData?.blob) {
        // Load image first
        const loaded = await this.loadAndCacheImage(request.url);
        if (!loaded) return null;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const img = new Image();
      img.src = URL.createObjectURL(cachedData!.blob);
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate dimensions
      const { width, height } = this.calculateOptimizedDimensions(
        img.naturalWidth,
        img.naturalHeight,
        request.width,
        request.height,
        request.fit || 'cover'
      );

      canvas.width = width;
      canvas.height = height;

      // Draw optimized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to desired format
      const quality = (request.quality || this.config.compressionQuality) / 100;
      const format = request.format || 'webp';
      const mimeType = `image/${format}`;

      return canvas.toDataURL(mimeType, quality);
    } catch (error) {
      console.error('[ImageCache] Client-side optimization error:', error);
      return null;
    }
  }

  private generateCDNUrl(request: ImageOptimizationRequest): string {
    if (!this.config.cdnBaseUrl) {
      return request.url;
    }

    const params = new URLSearchParams();
    
    if (request.width) params.set('w', request.width.toString());
    if (request.height) params.set('h', request.height.toString());
    if (request.quality) params.set('q', request.quality.toString());
    if (request.format) params.set('f', request.format);
    if (request.fit) params.set('fit', request.fit);

    const imageUrl = encodeURIComponent(request.url);
    return `${this.config.cdnBaseUrl}/${imageUrl}?${params.toString()}`;
  }

  private calculateOptimizedDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number,
    fit: 'cover' | 'contain' | 'fill' = 'cover'
  ): { width: number; height: number } {
    if (!targetWidth && !targetHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (fit === 'fill') {
      return {
        width: targetWidth || originalWidth,
        height: targetHeight || originalHeight,
      };
    }

    if (!targetHeight) {
      return {
        width: targetWidth!,
        height: Math.round(targetWidth! / aspectRatio),
      };
    }

    if (!targetWidth) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight,
      };
    }

    const targetAspectRatio = targetWidth / targetHeight;

    if (fit === 'contain') {
      if (aspectRatio > targetAspectRatio) {
        return {
          width: targetWidth,
          height: Math.round(targetWidth / aspectRatio),
        };
      } else {
        return {
          width: Math.round(targetHeight * aspectRatio),
          height: targetHeight,
        };
      }
    }

    // cover
    if (aspectRatio > targetAspectRatio) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight,
      };
    } else {
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio),
      };
    }
  }

  // ===== RESPONSIVE IMAGE GENERATION =====

  async generateResponsiveImageSet(url: string): Promise<{
    srcset: string;
    sizes: string;
    src: string;
  }> {
    const imageMetadata = await this.cacheImage(url);
    const breakpoints = this.config.resolutionBreakpoints;
    
    const srcsetEntries: string[] = [];
    
    for (const width of breakpoints) {
      if (width <= imageMetadata.width) {
        const optimizedUrl = await this.getOptimizedImage({
          url,
          width,
          format: this.config.enableWebP ? 'webp' : 'jpeg',
        });
        
        if (optimizedUrl) {
          srcsetEntries.push(`${optimizedUrl} ${width}w`);
        }
      }
    }

    const srcset = srcsetEntries.join(', ');
    const sizes = this.generateSizesAttribute(breakpoints);
    
    return {
      srcset,
      sizes,
      src: imageMetadata.url,
    };
  }

  private generateSizesAttribute(breakpoints: number[]): string {
    const sizeEntries = breakpoints.map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return `${bp}px`;
      }
      return `(max-width: ${bp}px) ${bp}px`;
    });
    
    return sizeEntries.join(', ');
  }

  // ===== METADATA MANAGEMENT =====

  private async generateImageMetadata(url: string, partial?: Partial<ImageMetadata>): Promise<ImageMetadata> {
    const imageId = this.generateImageId(url);
    
    const metadata: ImageMetadata = {
      id: imageId,
      url,
      alt: '',
      width: 0,
      height: 0,
      format: 'jpeg',
      size: 0,
      aspectRatio: 0,
      optimizedVersions: {},
      lastModified: Date.now(),
      ...partial,
    };

    // Try to get dimensions from image if not provided
    if (typeof window !== 'undefined' && (!metadata.width || !metadata.height)) {
      try {
        const dimensions = await this.getImageDimensions(url);
        metadata.width = dimensions.width;
        metadata.height = dimensions.height;
        metadata.aspectRatio = dimensions.width / dimensions.height;
      } catch (error) {
        console.warn('[ImageCache] Could not get image dimensions:', error);
      }
    }

    // Generate blurhash if enabled
    if (this.config.enableBlurhash && typeof window !== 'undefined') {
      try {
        metadata.blurhash = await this.generateBlurhash(url);
      } catch (error) {
        console.warn('[ImageCache] Could not generate blurhash:', error);
      }
    }

    // Generate CDN URLs if CDN is configured
    if (this.config.cdnBaseUrl) {
      metadata.cdnUrls = this.generateCDNUrls(url);
    }

    return metadata;
  }

  private async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
  }

  private async generateBlurhash(url: string): Promise<string> {
    // Placeholder implementation - would use blurhash library
    // This would typically load the image, downscale it, and generate the blurhash
    return 'LKO2:N%2Tw=w]~RBVZRi};RPxuwH';
  }

  private generateCDNUrls(url: string): ImageMetadata['cdnUrls'] {
    if (!this.config.cdnBaseUrl) return undefined;

    const encodedUrl = encodeURIComponent(url);
    const baseUrl = `${this.config.cdnBaseUrl}/${encodedUrl}`;

    return {
      original: url,
      webp: `${baseUrl}?f=webp`,
      avif: `${baseUrl}?f=avif`,
      thumbnail: `${baseUrl}?w=150&h=150&fit=cover`,
      medium: `${baseUrl}?w=640&q=85`,
      large: `${baseUrl}?w=1280&q=90`,
    };
  }

  private async cacheImageMetadata(metadata: ImageMetadata): Promise<void> {
    const metadataKey = this.getMetadataKey(metadata.id);
    
    await this.cacheManager.set(metadataKey, metadata, {
      ttl: this.config.metadataTTL,
      tags: ['image-metadata', `image:${metadata.id}`],
      priority: 'medium',
    });
  }

  private isMetadataValid(metadata: ImageMetadata): boolean {
    const maxAge = this.config.metadataTTL * 1000;
    return (Date.now() - metadata.lastModified) < maxAge;
  }

  // ===== INDEXEDDB OPERATIONS =====

  private async storeBlobInDB(imageId: string, blob: Blob): Promise<void> {
    try {
      const db = await this.openImageDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const data = {
        id: imageId,
        blob,
        lastAccessed: Date.now(),
        size: blob.size,
      };
      
      await new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[ImageCache] Error storing blob in DB:', error);
    }
  }

  private async getBlobFromDB(imageId: string): Promise<{ blob: Blob; metadata: ImageMetadata } | null> {
    try {
      const db = await this.openImageDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      const data = await new Promise<any>((resolve, reject) => {
        const request = store.get(imageId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (data) {
        const metadata = await this.getImageMetadata(imageId);
        if (metadata) {
          return { blob: data.blob, metadata };
        }
      }
      
      return null;
    } catch (error) {
      console.error('[ImageCache] Error getting blob from DB:', error);
      return null;
    }
  }

  private async openImageDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('news-image-cache', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ===== UTILITY METHODS =====

  private generateImageId(url: string): string {
    // Create a hash of the URL for use as ID
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `img_${Math.abs(hash).toString(16)}`;
  }

  private generateOptimizationKey(request: ImageOptimizationRequest): string {
    const parts = [
      'opt',
      this.generateImageId(request.url),
      request.width || 'auto',
      request.height || 'auto',
      request.quality || this.config.compressionQuality,
      request.format || 'webp',
      request.fit || 'cover',
    ];
    
    return parts.join(':');
  }

  private getMetadataKey(imageId: string): string {
    return `image:metadata:${imageId}`;
  }

  private getFormatFromBlob(blob: Blob): ImageMetadata['format'] {
    const type = blob.type.toLowerCase();
    if (type.includes('webp')) return 'webp';
    if (type.includes('avif')) return 'avif';
    if (type.includes('png')) return 'png';
    if (type.includes('svg')) return 'svg';
    return 'jpeg';
  }

  // ===== CLEANUP AND MAINTENANCE =====

  async evictLeastUsedImages(): Promise<void> {
    const entries = Array.from(this.imageCache.entries());
    
    // Sort by access count and last access time
    entries.sort((a, b) => {
      const aData = a[1];
      const bData = b[1];
      
      if (aData.accessCount !== bData.accessCount) {
        return aData.accessCount - bData.accessCount;
      }
      
      return aData.cacheTime - bData.cacheTime;
    });

    // Remove bottom 25% of images
    const removeCount = Math.floor(entries.length * 0.25);
    
    for (let i = 0; i < removeCount; i++) {
      const [imageId, data] = entries[i];
      
      // Cleanup object URL
      if (data.objectUrl) {
        URL.revokeObjectURL(data.objectUrl);
      }
      
      // Remove from memory cache
      this.imageCache.delete(imageId);
    }
    
    console.log(`[ImageCache] Evicted ${removeCount} least used images`);
  }

  async cleanup(): Promise<void> {
    // Cleanup object URLs
    for (const [, data] of this.imageCache) {
      if (data.objectUrl) {
        URL.revokeObjectURL(data.objectUrl);
      }
    }
    
    // Clear memory cache
    this.imageCache.clear();
    
    // Clear loading promises
    this.loadingPromises.clear();
    
    console.log('[ImageCache] Cleanup completed');
  }

  async performMaintenance(): Promise<void> {
    console.log('[ImageCache] Performing maintenance...');
    
    try {
      // Clean up expired metadata
      await this.cacheManager.invalidateByTags(['image-metadata']);
      
      // Evict old images from memory
      await this.evictLeastUsedImages();
      
      // Clean up IndexedDB
      if (typeof window !== 'undefined') {
        await this.cleanupIndexedDB();
      }
      
      console.log('[ImageCache] Maintenance completed');
    } catch (error) {
      console.error('[ImageCache] Maintenance error:', error);
    }
  }

  private async cleanupIndexedDB(): Promise<void> {
    try {
      const db = await this.openImageDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('lastAccessed');
      
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      let deletedCount = 0;
      const request = index.openCursor(range);
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
      
      console.log(`[ImageCache] Cleaned up ${deletedCount} old images from IndexedDB`);
    } catch (error) {
      console.error('[ImageCache] IndexedDB cleanup error:', error);
    }
  }

  // ===== ANALYTICS =====

  async getImageCacheAnalytics(): Promise<{
    memoryUsage: number;
    totalImages: number;
    hitRate: number;
    avgLoadTime: number;
    formatDistribution: Record<string, number>;
  }> {
    try {
      let totalSize = 0;
      let totalLoadTime = 0;
      const formatCounts: Record<string, number> = {};
      
      for (const [, data] of this.imageCache) {
        totalSize += data.metadata.size;
        totalLoadTime += data.loadTime;
        
        const format = data.metadata.format;
        formatCounts[format] = (formatCounts[format] || 0) + 1;
      }
      
      const stats = await this.cacheManager.getStats();
      const avgLoadTime = this.imageCache.size > 0 ? totalLoadTime / this.imageCache.size : 0;
      
      return {
        memoryUsage: totalSize,
        totalImages: this.imageCache.size,
        hitRate: stats.hitRate,
        avgLoadTime,
        formatDistribution: formatCounts,
      };
    } catch (error) {
      console.error('[ImageCache] Error getting analytics:', error);
      return {
        memoryUsage: 0,
        totalImages: 0,
        hitRate: 0,
        avgLoadTime: 0,
        formatDistribution: {},
      };
    }
  }
}

// ===== SINGLETON INSTANCE =====

let imageCacheManager: ImageCacheManager | null = null;

export function getImageCacheManager(): ImageCacheManager {
  if (!imageCacheManager) {
    imageCacheManager = new ImageCacheManager();
  }
  return imageCacheManager;
}

export default ImageCacheManager;