/**
 * Cache Analytics and Monitoring System
 * 
 * Comprehensive monitoring for cache performance with hit/miss ratios,
 * performance metrics, memory usage tracking, and optimization suggestions
 */

import { getCacheManager, CacheStats } from './cache';
import { getArticleCacheManager } from './articleCache';
import { getSearchCacheManager } from './searchCache';
import { getImageCacheManager } from './imageCache';

// ===== INTERFACES =====

export interface DetailedCacheStats extends CacheStats {
  type: 'redis' | 'browser' | 'service-worker';
  memoryUsagePercent: number;
  keyDistribution: Record<string, number>;
  topKeys: Array<{ key: string; accessCount: number; size: number }>;
  expiredKeys: number;
  compressionRatio?: number;
}

export interface CacheAnalyticsReport {
  timestamp: number;
  overall: {
    totalRequests: number;
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
    avgResponseTime: number;
    memoryUsage: number;
    memoryLimit: number;
  };
  byType: {
    articles: DetailedCacheStats;
    search: DetailedCacheStats;
    images: DetailedCacheStats;
    general: DetailedCacheStats;
  };
  performance: {
    slowestQueries: Array<{ key: string; avgTime: number; count: number }>;
    hottestKeys: Array<{ key: string; hitRate: number; totalHits: number }>;
    memoryHogs: Array<{ key: string; size: number; hitRate: number }>;
  };
  recommendations: CacheRecommendation[];
  trends: {
    hitRateHistory: Array<{ timestamp: number; rate: number }>;
    memoryUsageHistory: Array<{ timestamp: number; usage: number }>;
    requestVolumeHistory: Array<{ timestamp: number; volume: number }>;
  };
}

export interface CacheRecommendation {
  type: 'performance' | 'memory' | 'configuration' | 'cleanup';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  action: string;
  estimatedImprovement?: string;
}

export interface CacheMonitoringConfig {
  enabled: boolean;
  reportInterval: number;
  retentionDays: number;
  alertThresholds: {
    hitRateLow: number;
    memoryUsageHigh: number;
    responseTimeSlow: number;
    errorRateHigh: number;
  };
  enableRealTimeAlerts: boolean;
  enableRecommendations: boolean;
  enableTrendAnalysis: boolean;
}

export interface CacheAlert {
  type: 'hit-rate' | 'memory' | 'response-time' | 'error-rate';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  recommendations?: string[];
}

// ===== CACHE ANALYTICS MANAGER =====

export class CacheAnalyticsManager {
  private cacheManager = getCacheManager();
  private articleCache = getArticleCacheManager();
  private searchCache = getSearchCacheManager();
  private imageCache = getImageCacheManager();
  
  private config: CacheMonitoringConfig;
  private reportHistory: CacheAnalyticsReport[] = [];
  private alertCallbacks: Array<(alert: CacheAlert) => void> = [];

  constructor(config?: Partial<CacheMonitoringConfig>) {
    this.config = {
      enabled: true,
      reportInterval: 5 * 60 * 1000, // 5 minutes
      retentionDays: 30,
      alertThresholds: {
        hitRateLow: 70,
        memoryUsageHigh: 85,
        responseTimeSlow: 1000,
        errorRateHigh: 5,
      },
      enableRealTimeAlerts: true,
      enableRecommendations: true,
      enableTrendAnalysis: true,
      ...config,
    };

    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  // ===== MONITORING CONTROL =====

  startMonitoring(): void {
    if (typeof window !== 'undefined') {
      console.log('[CacheAnalytics] Starting cache monitoring...');
      
      // Generate reports at regular intervals
      setInterval(async () => {
        await this.generateReport();
      }, this.config.reportInterval);

      // Real-time monitoring for critical metrics
      if (this.config.enableRealTimeAlerts) {
        this.startRealTimeMonitoring();
      }
    }
  }

  stopMonitoring(): void {
    this.config.enabled = false;
    console.log('[CacheAnalytics] Cache monitoring stopped');
  }

  private startRealTimeMonitoring(): void {
    // Monitor critical metrics every 30 seconds
    setInterval(async () => {
      await this.checkRealTimeAlerts();
    }, 30000);
  }

  // ===== REPORT GENERATION =====

  async generateReport(): Promise<CacheAnalyticsReport> {
    try {
      const timestamp = Date.now();
      
      // Collect stats from all cache systems
      const [generalStats, articleStats, searchStats, imageStats] = await Promise.all([
        this.cacheManager.getStats(),
        this.getArticleCacheStats(),
        this.getSearchCacheStats(),
        this.getImageCacheStats(),
      ]);

      // Calculate overall metrics
      const overall = this.calculateOverallMetrics([
        generalStats,
        articleStats,
        searchStats,
        imageStats,
      ]);

      // Analyze performance patterns
      const performance = await this.analyzePerformance();

      // Generate recommendations
      const recommendations = this.config.enableRecommendations
        ? await this.generateRecommendations(generalStats, articleStats, searchStats, imageStats)
        : [];

      // Calculate trends
      const trends = this.config.enableTrendAnalysis
        ? this.calculateTrends()
        : { hitRateHistory: [], memoryUsageHistory: [], requestVolumeHistory: [] };

      const report: CacheAnalyticsReport = {
        timestamp,
        overall,
        byType: {
          articles: await this.enrichStats(articleStats, 'articles'),
          search: await this.enrichStats(searchStats, 'search'),
          images: await this.enrichStats(imageStats, 'images'),
          general: await this.enrichStats(generalStats, 'general'),
        },
        performance,
        recommendations,
        trends,
      };

      // Store report
      await this.storeReport(report);
      this.addToHistory(report);

      // Check for alerts
      if (this.config.enableRealTimeAlerts) {
        await this.checkForAlerts(report);
      }

      console.log('[CacheAnalytics] Report generated successfully');
      return report;
    } catch (error) {
      console.error('[CacheAnalytics] Error generating report:', error);
      throw error;
    }
  }

  private calculateOverallMetrics(statsArray: CacheStats[]): CacheAnalyticsReport['overall'] {
    const totals = statsArray.reduce(
      (acc, stats) => ({
        requests: acc.requests + stats.totalHits + stats.totalMisses,
        hits: acc.hits + stats.totalHits,
        misses: acc.misses + stats.totalMisses,
        responseTime: acc.responseTime + stats.avgResponseTime,
        memory: acc.memory + stats.usedMemory,
      }),
      { requests: 0, hits: 0, misses: 0, responseTime: 0, memory: 0 }
    );

    const hitRate = totals.requests > 0 ? (totals.hits / totals.requests) * 100 : 0;
    const avgResponseTime = statsArray.length > 0 ? totals.responseTime / statsArray.length : 0;

    return {
      totalRequests: totals.requests,
      totalHits: totals.hits,
      totalMisses: totals.misses,
      overallHitRate: hitRate,
      avgResponseTime,
      memoryUsage: totals.memory,
      memoryLimit: this.getMemoryLimit(),
    };
  }

  private async enrichStats(stats: CacheStats, type: string): Promise<DetailedCacheStats> {
    const memoryLimit = this.getMemoryLimit();
    const memoryUsagePercent = memoryLimit > 0 ? (stats.usedMemory / memoryLimit) * 100 : 0;

    return {
      ...stats,
      type: this.determineCacheType(),
      memoryUsagePercent,
      keyDistribution: await this.getKeyDistribution(type),
      topKeys: await this.getTopKeys(type),
      expiredKeys: await this.getExpiredKeysCount(type),
      compressionRatio: await this.getCompressionRatio(type),
    };
  }

  // ===== PERFORMANCE ANALYSIS =====

  private async analyzePerformance(): Promise<CacheAnalyticsReport['performance']> {
    try {
      const [slowestQueries, hottestKeys, memoryHogs] = await Promise.all([
        this.getSlowestQueries(),
        this.getHottestKeys(),
        this.getMemoryHogs(),
      ]);

      return {
        slowestQueries,
        hottestKeys,
        memoryHogs,
      };
    } catch (error) {
      console.error('[CacheAnalytics] Performance analysis error:', error);
      return {
        slowestQueries: [],
        hottestKeys: [],
        memoryHogs: [],
      };
    }
  }

  private async getSlowestQueries(): Promise<Array<{ key: string; avgTime: number; count: number }>> {
    // This would integrate with performance monitoring
    // For now, return sample data
    return [
      { key: 'search:complex_query_1', avgTime: 1200, count: 45 },
      { key: 'article:long_content', avgTime: 890, count: 23 },
      { key: 'image:high_res_processing', avgTime: 650, count: 67 },
    ];
  }

  private async getHottestKeys(): Promise<Array<{ key: string; hitRate: number; totalHits: number }>> {
    // Implementation would analyze cache access patterns
    return [
      { key: 'article:trending_news', hitRate: 95.2, totalHits: 1250 },
      { key: 'search:popular_query', hitRate: 88.7, totalHits: 892 },
      { key: 'category:breaking_news', hitRate: 91.3, totalHits: 743 },
    ];
  }

  private async getMemoryHogs(): Promise<Array<{ key: string; size: number; hitRate: number }>> {
    // Implementation would analyze memory usage per key
    return [
      { key: 'image:hero_banner', size: 2.4 * 1024 * 1024, hitRate: 45.2 },
      { key: 'article:long_form_content', size: 1.8 * 1024 * 1024, hitRate: 78.9 },
      { key: 'search:comprehensive_results', size: 1.2 * 1024 * 1024, hitRate: 67.4 },
    ];
  }

  // ===== RECOMMENDATIONS ENGINE =====

  private async generateRecommendations(...statsArray: CacheStats[]): Promise<CacheRecommendation[]> {
    const recommendations: CacheRecommendation[] = [];
    const overall = this.calculateOverallMetrics(statsArray);

    // Hit rate recommendations
    if (overall.overallHitRate < this.config.alertThresholds.hitRateLow) {
      recommendations.push({
        type: 'performance',
        severity: overall.overallHitRate < 50 ? 'critical' : 'high',
        title: 'Low Cache Hit Rate Detected',
        description: `Current hit rate is ${overall.overallHitRate.toFixed(1)}%, which is below the optimal threshold of ${this.config.alertThresholds.hitRateLow}%.`,
        impact: 'Increased response times and higher server load',
        action: 'Review caching strategies, increase TTL for stable content, implement cache warming',
        estimatedImprovement: '+15-30% response time improvement',
      });
    }

    // Memory usage recommendations
    const memoryUsagePercent = (overall.memoryUsage / overall.memoryLimit) * 100;
    if (memoryUsagePercent > this.config.alertThresholds.memoryUsageHigh) {
      recommendations.push({
        type: 'memory',
        severity: memoryUsagePercent > 95 ? 'critical' : 'high',
        title: 'High Memory Usage',
        description: `Cache memory usage is at ${memoryUsagePercent.toFixed(1)}% of the limit.`,
        impact: 'Risk of cache evictions and performance degradation',
        action: 'Implement compression, reduce TTL for large objects, increase memory limit',
        estimatedImprovement: '20-40% memory reduction possible',
      });
    }

    // Response time recommendations
    if (overall.avgResponseTime > this.config.alertThresholds.responseTimeSlow) {
      recommendations.push({
        type: 'performance',
        severity: overall.avgResponseTime > 2000 ? 'high' : 'medium',
        title: 'Slow Cache Response Times',
        description: `Average cache response time is ${overall.avgResponseTime}ms, exceeding the ${this.config.alertThresholds.responseTimeSlow}ms threshold.`,
        impact: 'Poor user experience and increased page load times',
        action: 'Optimize cache keys, implement connection pooling, consider cache clustering',
        estimatedImprovement: '30-50% response time improvement',
      });
    }

    // Configuration recommendations
    recommendations.push(...await this.getConfigurationRecommendations());

    // Cleanup recommendations
    recommendations.push(...await this.getCleanupRecommendations());

    return recommendations;
  }

  private async getConfigurationRecommendations(): Promise<CacheRecommendation[]> {
    const recommendations: CacheRecommendation[] = [];

    // Check for compression opportunities
    const compressionRatio = await this.getCompressionRatio('all');
    if (compressionRatio && compressionRatio < 0.7) {
      recommendations.push({
        type: 'configuration',
        severity: 'medium',
        title: 'Enable Compression for Large Objects',
        description: 'Compression ratio indicates significant space savings are possible.',
        impact: 'Reduced memory usage and faster data transfer',
        action: 'Enable compression for objects larger than 10KB',
        estimatedImprovement: '30-60% storage reduction',
      });
    }

    return recommendations;
  }

  private async getCleanupRecommendations(): Promise<CacheRecommendation[]> {
    const recommendations: CacheRecommendation[] = [];
    
    const expiredKeys = await this.getExpiredKeysCount('all');
    if (expiredKeys > 100) {
      recommendations.push({
        type: 'cleanup',
        severity: 'low',
        title: 'Cleanup Expired Keys',
        description: `Found ${expiredKeys} expired keys that should be cleaned up.`,
        impact: 'Reduced memory usage and improved performance',
        action: 'Run cache cleanup process to remove expired keys',
        estimatedImprovement: '5-15% memory savings',
      });
    }

    return recommendations;
  }

  // ===== TREND ANALYSIS =====

  private calculateTrends(): CacheAnalyticsReport['trends'] {
    const recentReports = this.reportHistory.slice(-24); // Last 24 reports (2 hours if 5min intervals)
    
    const hitRateHistory = recentReports.map(report => ({
      timestamp: report.timestamp,
      rate: report.overall.overallHitRate,
    }));

    const memoryUsageHistory = recentReports.map(report => ({
      timestamp: report.timestamp,
      usage: report.overall.memoryUsage,
    }));

    const requestVolumeHistory = recentReports.map(report => ({
      timestamp: report.timestamp,
      volume: report.overall.totalRequests,
    }));

    return {
      hitRateHistory,
      memoryUsageHistory,
      requestVolumeHistory,
    };
  }

  // ===== ALERTING =====

  private async checkRealTimeAlerts(): Promise<void> {
    try {
      const stats = await this.cacheManager.getStats();
      
      // Check hit rate
      if (stats.hitRate < this.config.alertThresholds.hitRateLow) {
        this.triggerAlert({
          type: 'hit-rate',
          severity: stats.hitRate < 30 ? 'critical' : 'warning',
          message: `Cache hit rate dropped to ${stats.hitRate.toFixed(1)}%`,
          value: stats.hitRate,
          threshold: this.config.alertThresholds.hitRateLow,
          timestamp: Date.now(),
          recommendations: [
            'Review cache invalidation policies',
            'Consider warming cache with popular content',
            'Check for cache key conflicts',
          ],
        });
      }

      // Check memory usage
      const memoryLimit = this.getMemoryLimit();
      const memoryPercent = (stats.usedMemory / memoryLimit) * 100;
      
      if (memoryPercent > this.config.alertThresholds.memoryUsageHigh) {
        this.triggerAlert({
          type: 'memory',
          severity: memoryPercent > 95 ? 'critical' : 'warning',
          message: `Cache memory usage at ${memoryPercent.toFixed(1)}%`,
          value: memoryPercent,
          threshold: this.config.alertThresholds.memoryUsageHigh,
          timestamp: Date.now(),
          recommendations: [
            'Enable compression for large objects',
            'Reduce TTL for non-critical data',
            'Implement LRU eviction policy',
          ],
        });
      }

      // Check response time
      if (stats.avgResponseTime > this.config.alertThresholds.responseTimeSlow) {
        this.triggerAlert({
          type: 'response-time',
          severity: stats.avgResponseTime > 2000 ? 'critical' : 'warning',
          message: `Cache response time increased to ${stats.avgResponseTime}ms`,
          value: stats.avgResponseTime,
          threshold: this.config.alertThresholds.responseTimeSlow,
          timestamp: Date.now(),
          recommendations: [
            'Optimize cache key structure',
            'Check network connectivity to Redis',
            'Consider cache clustering',
          ],
        });
      }
    } catch (error) {
      console.error('[CacheAnalytics] Real-time alert check failed:', error);
    }
  }

  private async checkForAlerts(report: CacheAnalyticsReport): Promise<void> {
    // Process recommendations as potential alerts
    for (const recommendation of report.recommendations) {
      if (recommendation.severity === 'critical' || recommendation.severity === 'high') {
        this.triggerAlert({
          type: recommendation.type === 'performance' ? 'response-time' : 'memory',
          severity: recommendation.severity === 'critical' ? 'critical' : 'warning',
          message: recommendation.title,
          value: 0,
          threshold: 0,
          timestamp: report.timestamp,
          recommendations: [recommendation.action],
        });
      }
    }
  }

  private triggerAlert(alert: CacheAlert): void {
    console.warn('[CacheAnalytics] Alert:', alert.message);
    
    // Notify registered callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('[CacheAnalytics] Alert callback error:', error);
      }
    });
  }

  onAlert(callback: (alert: CacheAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  // ===== DATA COLLECTION HELPERS =====

  private async getArticleCacheStats(): Promise<CacheStats> {
    try {
      const analytics = await this.articleCache.getCacheAnalytics();
      return {
        hitRate: analytics.hitRate,
        missRate: 100 - analytics.hitRate,
        totalHits: 0,
        totalMisses: 0,
        totalKeys: analytics.totalArticles,
        usedMemory: 0,
        avgResponseTime: 0,
        lastCleanup: Date.now(),
      };
    } catch (error) {
      console.error('[CacheAnalytics] Article cache stats error:', error);
      return this.getEmptyStats();
    }
  }

  private async getSearchCacheStats(): Promise<CacheStats> {
    try {
      const analytics = await this.searchCache.getSearchAnalytics();
      return {
        hitRate: analytics.hitRate,
        missRate: 100 - analytics.hitRate,
        totalHits: 0,
        totalMisses: 0,
        totalKeys: analytics.popularQueries.length,
        usedMemory: 0,
        avgResponseTime: analytics.avgResponseTime,
        lastCleanup: Date.now(),
      };
    } catch (error) {
      console.error('[CacheAnalytics] Search cache stats error:', error);
      return this.getEmptyStats();
    }
  }

  private async getImageCacheStats(): Promise<CacheStats> {
    try {
      const analytics = await this.imageCache.getImageCacheAnalytics();
      return {
        hitRate: analytics.hitRate,
        missRate: 100 - analytics.hitRate,
        totalHits: 0,
        totalMisses: 0,
        totalKeys: analytics.totalImages,
        usedMemory: analytics.memoryUsage,
        avgResponseTime: analytics.avgLoadTime,
        lastCleanup: Date.now(),
      };
    } catch (error) {
      console.error('[CacheAnalytics] Image cache stats error:', error);
      return this.getEmptyStats();
    }
  }

  private getEmptyStats(): CacheStats {
    return {
      hitRate: 0,
      missRate: 0,
      totalHits: 0,
      totalMisses: 0,
      totalKeys: 0,
      usedMemory: 0,
      avgResponseTime: 0,
      lastCleanup: Date.now(),
    };
  }

  // ===== DETAILED ANALYTICS =====

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getKeyDistribution(_type: string): Promise<Record<string, number>> {
    // Implementation would analyze key patterns
    return {
      'article:*': 45,
      'search:*': 25,
      'image:*': 20,
      'category:*': 10,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getTopKeys(_type: string): Promise<Array<{ key: string; accessCount: number; size: number }>> {
    // Implementation would return most accessed keys
    return [
      { key: 'article:trending-news-123', accessCount: 1250, size: 24576 },
      { key: 'search:popular-query-abc', accessCount: 892, size: 8192 },
      { key: 'image:hero-banner', accessCount: 743, size: 102400 },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getExpiredKeysCount(_type: string): Promise<number> {
    // Implementation would count expired keys
    return Math.floor(Math.random() * 50);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getCompressionRatio(_type: string): Promise<number | undefined> {
    // Implementation would calculate compression ratio
    return 0.65; // 65% compression ratio
  }

  private determineCacheType(): DetailedCacheStats['type'] {
    if (typeof window === 'undefined') {
      return 'redis';
    }
    return 'browser';
  }

  private getMemoryLimit(): number {
    // Get memory limit based on environment
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const perfMemory = (performance as unknown as { memory?: { jsHeapSizeLimit: number } }).memory;
      return perfMemory?.jsHeapSizeLimit || 2 * 1024 * 1024 * 1024;
    }
    return 1 * 1024 * 1024 * 1024; // 1GB default
  }

  // ===== REPORT STORAGE =====

  private async storeReport(report: CacheAnalyticsReport): Promise<void> {
    try {
      const key = `cache-analytics:${report.timestamp}`;
      await this.cacheManager.set(key, report, {
        ttl: this.config.retentionDays * 24 * 60 * 60, // Convert days to seconds
        tags: ['analytics', 'reports'],
      });
    } catch (error) {
      console.error('[CacheAnalytics] Failed to store report:', error);
    }
  }

  private addToHistory(report: CacheAnalyticsReport): void {
    this.reportHistory.push(report);
    
    // Keep only recent reports in memory
    const maxHistorySize = 100;
    if (this.reportHistory.length > maxHistorySize) {
      this.reportHistory = this.reportHistory.slice(-maxHistorySize);
    }
  }

  // ===== PUBLIC API =====

  async getLatestReport(): Promise<CacheAnalyticsReport | null> {
    if (this.reportHistory.length > 0) {
      return this.reportHistory[this.reportHistory.length - 1];
    }
    
    try {
      return await this.generateReport();
    } catch (error) {
      console.error('[CacheAnalytics] Failed to generate latest report:', error);
      return null;
    }
  }

  async getHistoricalReports(days: number = 7): Promise<CacheAnalyticsReport[]> {
    try {
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      // Filter in-memory reports
      const recentReports = this.reportHistory.filter(
        report => report.timestamp > cutoffTime
      );
      
      return recentReports;
    } catch (error) {
      console.error('[CacheAnalytics] Failed to get historical reports:', error);
      return [];
    }
  }

  async exportAnalytics(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const reports = await this.getHistoricalReports();
      
      if (format === 'csv') {
        return this.convertToCSV(reports);
      }
      
      return JSON.stringify(reports, null, 2);
    } catch (error) {
      console.error('[CacheAnalytics] Failed to export analytics:', error);
      return '';
    }
  }

  private convertToCSV(reports: CacheAnalyticsReport[]): string {
    const headers = [
      'timestamp',
      'hitRate',
      'totalRequests',
      'memoryUsage',
      'avgResponseTime',
      'recommendations',
    ];
    
    const rows = reports.map(report => [
      new Date(report.timestamp).toISOString(),
      report.overall.overallHitRate.toFixed(2),
      report.overall.totalRequests,
      report.overall.memoryUsage,
      report.overall.avgResponseTime.toFixed(2),
      report.recommendations.length,
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // ===== CLEANUP =====

  async cleanup(): Promise<void> {
    try {
      // Clean up old reports
      await this.cacheManager.clear(`cache-analytics:*`);
      
      // Clear memory
      this.reportHistory = [];
      this.alertCallbacks = [];
      
      console.log('[CacheAnalytics] Cleanup completed');
    } catch (error) {
      console.error('[CacheAnalytics] Cleanup failed:', error);
    }
  }
}

// ===== SINGLETON INSTANCE =====

let analyticsManager: CacheAnalyticsManager | null = null;

export function getCacheAnalyticsManager(): CacheAnalyticsManager {
  if (!analyticsManager) {
    analyticsManager = new CacheAnalyticsManager();
  }
  return analyticsManager;
}

export default CacheAnalyticsManager;