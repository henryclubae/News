// ============================================================================
// USER-SPECIFIC TYPESCRIPT INTERFACES
// ============================================================================

import { Theme, FontSize } from '../index';

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserPreferencesUpdate {
  theme?: Theme;
  language?: string;
  categories?: string[];
  notifications?: {
    email?: boolean;
    push?: boolean;
    breakingNews?: boolean;
    weeklyDigest?: boolean;
  };
  newsletter?: boolean;
  autoPlayVideos?: boolean;
  fontSize?: FontSize;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinDate: Date;
  articlesRead: number;
  favoriteCategories: string[];
  readingStreak: number;
}

export interface UserSession {
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  resourceId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type ActivityType = 
  | 'article_read' 
  | 'article_shared' 
  | 'article_bookmarked' 
  | 'comment_posted' 
  | 'profile_updated' 
  | 'subscription_changed';

export interface BookmarkedArticle {
  id: string;
  articleId: string;
  userId: string;
  bookmarkedAt: Date;
  tags?: string[];
  notes?: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  articleId: string;
  readAt: Date;
  readingTime: number;
  readingProgress: number; // 0-100%
  deviceType: 'mobile' | 'tablet' | 'desktop';
}