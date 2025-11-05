// ============================================================================
// CORE NEWS WEBSITE TYPESCRIPT INTERFACES
// ============================================================================

// ============================================================================
// NEWS ARTICLE INTERFACES
// ============================================================================

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: Author;
  publishDate: Date;
  updateDate?: Date;
  category: Category;
  tags: string[];
  imageUrl?: string;
  slug: string;
  language: string;
  seoData: SEOData;
  readingTime: number; // in minutes
  source: NewsSource;
  status: ArticleStatus;
  viewCount?: number;
  featured?: boolean;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: SocialLinks;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  credibilityRating?: number;
}

export type ArticleStatus = 'draft' | 'published' | 'archived' | 'scheduled';

// ============================================================================
// USER INTERFACES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt?: Date;
  role: UserRole;
  isVerified: boolean;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  categories: string[]; // Array of category IDs
  notifications: NotificationPreferences;
  newsletter: boolean;
  autoPlayVideos: boolean;
  fontSize: FontSize;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  breakingNews: boolean;
  weeklyDigest: boolean;
  categories: string[]; // Categories to get notifications for
}

export type Theme = 'light' | 'dark' | 'system';
export type UserRole = 'reader' | 'contributor' | 'editor' | 'admin';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

// ============================================================================
// SEO DATA INTERFACE
// ============================================================================

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph: OpenGraphData;
  twitterCard: TwitterCardData;
  schema?: SchemaData;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  url: string;
  type: 'article' | 'website';
  siteName: string;
  locale: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

export interface SchemaData {
  '@type': string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError;
  pagination?: PaginationData;
  meta?: Record<string, unknown>;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  timestamp: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// SEARCH & FILTER INTERFACES
// ============================================================================

export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  language?: string;
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}

export type SortOption = 'publishDate' | 'title' | 'viewCount' | 'readingTime';

export interface SearchResult {
  articles: NewsArticle[];
  totalResults: number;
  suggestions?: string[];
  filters?: FilterOptions;
}

export interface FilterOptions {
  categories: Category[];
  tags: string[];
  authors: Author[];
  dateRanges: DateRange[];
}

export interface DateRange {
  label: string;
  from: Date;
  to: Date;
}

// ============================================================================
// NAVIGATION & UI INTERFACES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
}

export interface SocialLinks {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

// ============================================================================
// NEWSLETTER & SUBSCRIPTION INTERFACES
// ============================================================================

export interface NewsletterSubscription {
  id: string;
  email: string;
  categories: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  subscribedAt: Date;
  preferences: SubscriptionPreferences;
}

export interface SubscriptionPreferences {
  includeImages: boolean;
  digestFormat: 'full' | 'summary';
  maxArticles: number;
}

// ============================================================================
// COMMENT SYSTEM INTERFACES
// ============================================================================

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string; // For nested comments
  likes: number;
  dislikes: number;
  isApproved: boolean;
  replies?: Comment[];
}

// ============================================================================
// ANALYTICS & TRACKING INTERFACES
// ============================================================================

export interface Analytics {
  pageViews: number;
  uniqueVisitors: number;
  avgReadingTime: number;
  bounceRate: number;
  topArticles: ArticleAnalytics[];
  trafficSources: TrafficSource[];
}

export interface ArticleAnalytics {
  articleId: string;
  title: string;
  views: number;
  shares: number;
  comments: number;
  avgReadingTime: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

// ============================================================================
// FORM INTERFACES
// ============================================================================

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
}

export interface SubscriptionForm {
  email: string;
  categories: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  agreeToTerms: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Re-export for convenience
  NewsArticle as Article,
  UserPreferences as Preferences,
  APIResponse as Response,
};