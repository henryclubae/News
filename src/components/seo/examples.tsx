// Example integration of SEOHead component into existing pages

// ============================================================================
// HOMEPAGE INTEGRATION (src/app/page.tsx)
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { SEOHead } from '@/components/seo/SEOHead';
import { NewsGridDemo } from '@/components/ui/NewsGridDemo';
import { SearchBarDemo } from '@/components/ui/SearchBarDemo';
import MainFooter from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="Breaking News and Latest Updates"
        description="Stay informed with the latest breaking news, politics, sports, technology, and entertainment from around the world. Your comprehensive source for global coverage."
        keywords={['breaking news', 'latest news', 'world news', 'politics', 'sports', 'technology']}
        type="website"
        image={{
          url: '/images/homepage-hero.jpg',
          alt: 'News Website - Breaking News Coverage',
          width: 1200,
          height: 630
        }}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
          {/* Existing header content */}
        </header>
        
        {/* Rest of existing homepage content */}
      </div>
    </>
  );
}

// ============================================================================
// DEMO PAGE INTEGRATION (src/app/demo/page.tsx)
// ============================================================================

'use client';

import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { ThemeToggle, ThemeSelector } from '@/components/ui/ThemeToggle';
// ... other imports

export default function DemoPage() {
  return (
    <>
      <SEOHead
        title="Component Demo - Interactive News Components"
        description="Explore our comprehensive collection of news website components including search bars, news grids, theme toggles, and more. Built with Next.js, TypeScript, and Tailwind CSS."
        keywords={['components', 'demo', 'news components', 'react', 'nextjs', 'typescript']}
        type="website"
        canonical="https://news-website.com/demo"
        customMeta={[
          { name: 'demo-version', content: '1.0.0' },
          { property: 'og:video', content: 'https://news-website.com/demo-video.mp4' }
        ]}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Existing demo page content */}
      </div>
    </>
  );
}

// ============================================================================
// ARTICLE PAGE EXAMPLE (src/app/article/[slug]/page.tsx)
// ============================================================================

import React from 'react';
import { ArticleSEOHead } from '@/components/seo/SEOHead';
import { getArticle, getAuthor, getCategory } from '@/lib/api';
import { NewsCard } from '@/components/ui/NewsCard';

interface ArticlePageProps {
  params: { slug: string };
}

// This would be implemented when you have dynamic articles
export default async function ArticlePage({ params }: ArticlePageProps) {
  // Mock article data for demonstration
  const article = {
    id: '1',
    title: 'Breaking: Major Technology Breakthrough Announced',
    slug: params.slug,
    description: 'Scientists have made a groundbreaking discovery that could revolutionize the way we approach renewable energy technology.',
    summary: 'A comprehensive look at the latest technological advancement and its potential impact on the future of energy.',
    content: '...',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    publishedAt: '2025-11-06T10:00:00Z',
    updatedAt: '2025-11-06T15:30:00Z',
    category: 'Technology',
    tags: ['technology', 'renewable energy', 'innovation', 'science'],
    authorId: '1',
    featured: true,
    viewCount: 1250,
    readTime: 5
  };

  const author = {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@newswebsite.com',
    bio: 'Technology reporter with over 10 years of experience covering breakthrough innovations.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    twitter: '@sarahjtech',
    verified: true,
    articlesCount: 150
  };

  const category = {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Latest technology news, gadgets, and innovations',
    color: '#3b82f6',
    articlesCount: 450
  };

  return (
    <>
      <ArticleSEOHead
        article={article}
        author={author}
        category={category}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <article className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <span>By {author.name}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{article.readTime} min read</span>
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>{article.content || article.description}</p>
            {/* Article content would go here */}
          </div>
        </article>
      </div>
    </>
  );
}

// ============================================================================
// CATEGORY PAGE EXAMPLE (src/app/categories/[category]/page.tsx)
// ============================================================================

import React from 'react';
import { CategorySEOHead } from '@/components/seo/SEOHead';

interface CategoryPageProps {
  params: { category: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Mock category data
  const category = {
    id: '1',
    name: 'Technology',
    slug: params.category,
    description: 'Stay updated with the latest technology news, product reviews, and industry insights.',
    color: '#3b82f6',
    articlesCount: 450
  };

  return (
    <>
      <CategorySEOHead category={category} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name} News
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {category.description}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              {category.articlesCount} articles
            </div>
          </header>
          
          {/* Category articles would go here */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Article cards */}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SEARCH RESULTS PAGE (src/app/search/page.tsx)
// ============================================================================

import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SearchBarDemo } from '@/components/ui/SearchBarDemo';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  
  // Custom schema for search functionality
  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "News Website",
    "url": "https://news-website.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://news-website.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <SEOHead
        title={query ? `Search results for "${query}"` : 'Search News Articles'}
        description={query 
          ? `Find news articles related to "${query}". Search through thousands of articles from trusted sources.`
          : 'Search through our comprehensive news database to find articles on any topic.'
        }
        keywords={['search', 'news search', 'find articles', query].filter(Boolean)}
        type="website"
        canonical={`https://news-website.com/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
        customSchema={searchSchema}
        customMeta={[
          { name: 'robots', content: query ? 'noindex, follow' : 'index, follow' }
        ]}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {query ? `Search results for "${query}"` : 'Search News'}
            </h1>
            <SearchBarDemo />
          </header>
          
          {/* Search results would go here */}
          {query && (
            <div className="mt-8">
              <p className="text-gray-600 dark:text-gray-400">
                Found X results for "{query}"
              </p>
              {/* Search results */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// AUTHOR PROFILE PAGE (src/app/author/[author]/page.tsx)
// ============================================================================

import React from 'react';
import { AuthorSEOHead } from '@/components/seo/SEOHead';

interface AuthorPageProps {
  params: { author: string };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  // Mock author data
  const author = {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@newswebsite.com',
    bio: 'Technology reporter with over 10 years of experience covering breakthrough innovations and emerging technologies.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    twitter: '@sarahjtech',
    verified: true,
    articlesCount: 150
  };

  return (
    <>
      <AuthorSEOHead author={author} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center space-x-6">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {author.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {author.bio}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{author.articlesCount} articles</span>
                  {author.twitter && (
                    <a href={`https://twitter.com/${author.twitter.replace('@', '')}`} 
                       className="text-blue-500 hover:underline">
                      {author.twitter}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          {/* Author's articles would go here */}
        </div>
      </div>
    </>
  );
}