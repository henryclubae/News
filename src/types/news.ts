/**
 * News Article Types and Interfaces
 */

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  category?: string;
  tags?: string[];
  publishedAt: string;
  updatedAt?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  language?: string;
  readTime?: number; // in minutes
  views?: number;
  likes?: number;
  shares?: number;
  priority?: 'low' | 'medium' | 'high' | 'breaking';
  status?: 'draft' | 'published' | 'archived';
  isBreaking?: boolean;
  isFeatured?: boolean;
  slug?: string;
  excerpt?: string;
  metadata?: {
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
    social?: {
      title?: string;
      description?: string;
      image?: string;
    };
  };
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface NewsAuthor {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  isActive: boolean;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  description?: string;
  logo?: string;
  credibilityScore?: number;
  isActive: boolean;
}

export interface NewsUpdate {
  id: string;
  articleId: string;
  type: 'create' | 'update' | 'delete';
  timestamp: string;
  data: Partial<NewsArticle>;
  version: number;
}