'use client';

import React from 'react';
import { NewsCard } from './NewsCard';
import { NewsArticle } from '@/types';

// ============================================================================
// DEMO DATA
// ============================================================================

const demoArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Revolutionary AI Technology Transforms Healthcare Industry',
    content: 'Artificial intelligence is making significant strides in healthcare, with new technologies emerging that can diagnose diseases with unprecedented accuracy. Recent studies show that AI-powered diagnostic tools are outperforming traditional methods in multiple medical fields, from radiology to pathology...',
    summary: 'AI-powered diagnostic tools are revolutionizing healthcare with unprecedented accuracy in disease detection and treatment recommendations.',
    author: {
      id: 'author-1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      bio: 'Medical technology researcher and healthcare innovation expert'
    },
    publishDate: new Date('2024-11-04'),
    category: {
      id: 'tech',
      name: 'Technology',
      slug: 'technology',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    tags: ['AI', 'Healthcare', 'Technology', 'Innovation'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
    slug: 'ai-healthcare-revolution-2024',
    language: 'en',
    seoData: {
      metaTitle: 'AI Healthcare Revolution: How Technology is Transforming Medicine',
      metaDescription: 'Discover how artificial intelligence is revolutionizing healthcare with breakthrough diagnostic tools and treatment methods.',
      keywords: ['AI healthcare', 'medical technology', 'diagnostic tools', 'artificial intelligence medicine'],
      canonicalUrl: '/article/ai-healthcare-revolution-2024',
      openGraph: {
        title: 'AI Healthcare Revolution: How Technology is Transforming Medicine',
        description: 'Discover how artificial intelligence is revolutionizing healthcare with breakthrough diagnostic tools and treatment methods.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=630&fit=crop',
        url: '/article/ai-healthcare-revolution-2024',
        type: 'article',
        siteName: 'News Website',
        locale: 'en_US'
      },
      twitterCard: {
        card: 'summary_large_image',
        title: 'AI Healthcare Revolution: How Technology is Transforming Medicine',
        description: 'Discover how artificial intelligence is revolutionizing healthcare with breakthrough diagnostic tools and treatment methods.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=630&fit=crop'
      }
    },
    readingTime: 8,
    source: {
      id: 'tech-news',
      name: 'TechNews Daily',
      url: 'https://technews.example.com',
      credibilityRating: 9.2
    },
    status: 'published',
    viewCount: 15420,
    featured: true
  },
  {
    id: '2',
    title: 'Climate Change: New Research Shows Surprising Ocean Recovery',
    content: 'Recent oceanographic research has revealed unexpected signs of recovery in marine ecosystems previously thought to be beyond repair. Scientists studying coral reefs, fish populations, and water quality have documented remarkable improvements in several key areas...',
    summary: 'Groundbreaking oceanographic research reveals unexpected recovery in marine ecosystems, offering hope for climate change mitigation.',
    author: {
      id: 'author-2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      bio: 'Marine biologist and climate research specialist'
    },
    publishDate: new Date('2024-11-03'),
    category: {
      id: 'environment',
      name: 'Environment',
      slug: 'environment',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    tags: ['Climate Change', 'Ocean', 'Environment', 'Research'],
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop',
    slug: 'ocean-recovery-climate-research-2024',
    language: 'en',
    seoData: {
      metaTitle: 'Ocean Recovery: New Hope in Climate Change Research',
      metaDescription: 'Scientists discover unexpected marine ecosystem recovery, providing new insights into climate change mitigation strategies.',
      keywords: ['climate change', 'ocean recovery', 'marine ecosystem', 'environmental research'],
      canonicalUrl: '/article/ocean-recovery-climate-research-2024',
      openGraph: {
        title: 'Ocean Recovery: New Hope in Climate Change Research',
        description: 'Scientists discover unexpected marine ecosystem recovery, providing new insights into climate change mitigation strategies.',
        image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=630&fit=crop',
        url: '/article/ocean-recovery-climate-research-2024',
        type: 'article',
        siteName: 'News Website',
        locale: 'en_US'
      },
      twitterCard: {
        card: 'summary_large_image',
        title: 'Ocean Recovery: New Hope in Climate Change Research',
        description: 'Scientists discover unexpected marine ecosystem recovery, providing new insights into climate change mitigation strategies.',
        image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=630&fit=crop'
      }
    },
    readingTime: 6,
    source: {
      id: 'science-weekly',
      name: 'Science Weekly',
      url: 'https://scienceweekly.example.com',
      credibilityRating: 9.5
    },
    status: 'published',
    viewCount: 8930,
    featured: false
  },
  {
    id: '3',
    title: 'Global Economy: Markets React to New Trade Agreements',
    content: 'International markets are showing mixed reactions to the newly signed multilateral trade agreements between major economic powers. Analysts are divided on the long-term implications for global supply chains and regional economic growth...',
    summary: 'Global markets show mixed reactions to new international trade agreements, with analysts divided on long-term economic implications.',
    author: {
      id: 'author-3',
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      bio: 'Financial journalist and economic policy analyst'
    },
    publishDate: new Date('2024-11-02'),
    category: {
      id: 'business',
      name: 'Business',
      slug: 'business',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    },
    tags: ['Economy', 'Trade', 'Markets', 'Global Business'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    slug: 'global-markets-trade-agreements-2024',
    language: 'en',
    seoData: {
      metaTitle: 'Global Markets React to New Trade Agreements',
      metaDescription: 'Analysis of market reactions to international trade agreements and their impact on global economic growth.',
      keywords: ['global economy', 'trade agreements', 'market analysis', 'international business'],
      canonicalUrl: '/article/global-markets-trade-agreements-2024',
      openGraph: {
        title: 'Global Markets React to New Trade Agreements',
        description: 'Analysis of market reactions to international trade agreements and their impact on global economic growth.',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop',
        url: '/article/global-markets-trade-agreements-2024',
        type: 'article',
        siteName: 'News Website',
        locale: 'en_US'
      },
      twitterCard: {
        card: 'summary_large_image',
        title: 'Global Markets React to New Trade Agreements',
        description: 'Analysis of market reactions to international trade agreements and their impact on global economic growth.',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop'
      }
    },
    readingTime: 5,
    source: {
      id: 'business-insider',
      name: 'Business Insider',
      url: 'https://business.example.com',
      credibilityRating: 8.8
    },
    status: 'published',
    viewCount: 12150,
    featured: false
  }
];

// ============================================================================
// DEMO COMPONENT
// ============================================================================

export function NewsCardDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            NewsCard Component Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Showcasing different variants of the NewsCard component with responsive design
          </p>
        </div>

        {/* Featured Variant */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Featured Article
          </h2>
          <div className="max-w-2xl">
            <NewsCard 
              article={demoArticles[0]} 
              variant="featured" 
              priority={true}
            />
          </div>
        </section>

        {/* Default Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Latest News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoArticles.map((article) => (
              <NewsCard 
                key={article.id} 
                article={article} 
                variant="default"
              />
            ))}
          </div>
        </section>

        {/* Compact Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Quick Reads (Compact)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {demoArticles.map((article) => (
              <NewsCard 
                key={`compact-${article.id}`} 
                article={article} 
                variant="compact"
              />
            ))}
          </div>
        </section>

        {/* Horizontal Layout */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Trending Stories (Horizontal)
          </h2>
          <div className="space-y-4">
            {demoArticles.map((article) => (
              <NewsCard 
                key={`horizontal-${article.id}`} 
                article={article} 
                variant="horizontal"
              />
            ))}
          </div>
        </section>

        {/* Customization Options */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Customization Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Without Share Buttons
              </h3>
              <NewsCard 
                article={demoArticles[0]} 
                variant="default"
                showShareButtons={false}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Without Like/Bookmark
              </h3>
              <NewsCard 
                article={demoArticles[1]} 
                variant="default"
                showLike={false}
                showBookmark={false}
              />
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Examples
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Default Usage:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                <code>{`<NewsCard article={article} />`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Featured Article:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                <code>{`<NewsCard article={article} variant="featured" priority={true} />`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Horizontal Layout:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                <code>{`<NewsCard article={article} variant="horizontal" />`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Options:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                <code>{`<NewsCard 
  article={article} 
  variant="compact"
  showShareButtons={false}
  showLike={false}
  className="custom-class"
/>`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NewsCardDemo;