// ============================================================================
// NEWS-SPECIFIC TYPESCRIPT INTERFACES
// ============================================================================

import { Author, Category, ArticleStatus } from '../index';

export interface NewsArticleCreate {
  title: string;
  content: string;
  summary: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  imageUrl?: string;
  language: string;
  scheduledPublishDate?: Date;
}

export interface NewsArticleUpdate {
  title?: string;
  content?: string;
  summary?: string;
  categoryId?: string;
  tags?: string[];
  imageUrl?: string;
  status?: ArticleStatus;
}

export interface NewsArticleFilter {
  category?: string;
  author?: string;
  tags?: string[];
  status?: ArticleStatus;
  featured?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  language?: string;
}

export interface NewsArchive {
  year: number;
  month: number;
  count: number;
  articles: NewsArticlePreview[];
}

export interface NewsArticlePreview {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  publishDate: Date;
  author: Pick<Author, 'name' | 'avatar'>;
  category: Pick<Category, 'name' | 'slug' | 'color'>;
  readingTime: number;
  slug: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  publishDate: Date;
  category: string;
  similarity: number; // 0-1 similarity score
}

export interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  trendScore: number;
  timeframe: '1h' | '24h' | '7d' | '30d';
}

export interface BreakingNews {
  id: string;
  title: string;
  summary: string;
  publishDate: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}