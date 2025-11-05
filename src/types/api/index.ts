// ============================================================================
// API-SPECIFIC TYPESCRIPT INTERFACES
// ============================================================================

export interface APIRequest<T = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: T;
  timeout?: number;
}

export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

export interface APIEndpoints {
  // Articles
  articles: {
    list: string;
    detail: string;
    create: string;
    update: string;
    delete: string;
    search: string;
    trending: string;
    related: string;
  };
  // Categories
  categories: {
    list: string;
    detail: string;
    articles: string;
  };
  // Users
  users: {
    profile: string;
    preferences: string;
    bookmarks: string;
    history: string;
    activities: string;
  };
  // Authentication
  auth: {
    login: string;
    logout: string;
    register: string;
    refresh: string;
    forgotPassword: string;
    resetPassword: string;
  };
  // Newsletter
  newsletter: {
    subscribe: string;
    unsubscribe: string;
    preferences: string;
  };
  // Comments
  comments: {
    list: string;
    create: string;
    update: string;
    delete: string;
    like: string;
  };
}

export interface APIRateLimit {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface APIValidationError {
  field: string;
  message: string;
  code: string;
  value?: string | number | boolean;
}

export interface APIBatchRequest<T = unknown> {
  requests: APIRequest<T>[];
  parallel?: boolean;
  failFast?: boolean;
}

export interface APIBatchResponse<T = unknown> {
  results: (APIResponse<T> | APIError)[];
  totalSuccess: number;
  totalErrors: number;
  executionTime: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError;
  pagination?: PaginationData;
  meta?: APIMetadata;
  timestamp: string;
  requestId: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  timestamp: string;
  requestId: string;
  statusCode: number;
  validationErrors?: APIValidationError[];
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface APIMetadata {
  version: string;
  serverTime: string;
  processingTime: number;
  rateLimit?: APIRateLimit;
  deprecationWarning?: string;
  links?: {
    self: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface APIMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  lastUpdated: Date;
}