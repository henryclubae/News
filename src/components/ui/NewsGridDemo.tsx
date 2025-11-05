'use client';

import React, { useState, useEffect } from 'react';
import { NewsGrid } from './NewsGrid';
import { NewsArticle, Category } from '@/types';

// ============================================================================
// DEMO DATA
// ============================================================================

const demoCategories: Category[] = [
  {
    id: 'tech',
    name: 'Technology',
    slug: 'technology',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'science',
    name: 'Science',
    slug: 'science',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    id: 'health',
    name: 'Health',
    slug: 'health',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  {
    id: 'sports',
    name: 'Sports',
    slug: 'sports',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
];

const generateDemoArticles = (count: number): NewsArticle[] => {
  const headlines = [
    'Revolutionary AI System Transforms Medical Diagnosis',
    'Global Climate Summit Reaches Historic Agreement',
    'Breakthrough in Quantum Computing Architecture',
    'New Social Media Platform Prioritizes Privacy',
    'Space Mission Discovers Potentially Habitable Planet',
    'Renewable Energy Costs Drop to Record Lows',
    'Gene Therapy Shows Promise for Rare Diseases',
    'Autonomous Vehicles Begin Commercial Deployment',
    'Cybersecurity Threats Evolve with AI Technology',
    'Ocean Conservation Efforts Show Positive Results',
    'Educational Technology Transforms Remote Learning',
    'Mental Health Apps Gain Widespread Adoption',
    'Sustainable Fashion Movement Gains Momentum',
    'Food Technology Addresses Global Hunger Crisis',
    'Virtual Reality Therapy Shows Clinical Benefits',
    'Blockchain Technology Revolutionizes Supply Chains',
    'Urban Planning Embraces Green Infrastructure',
    'Personalized Medicine Advances with Big Data',
    'Artificial Meat Production Scales Globally',
    'Smart City Initiatives Improve Urban Living'
  ];

  const summaries = [
    'Researchers have developed an advanced AI system that can diagnose medical conditions with unprecedented accuracy, potentially revolutionizing healthcare delivery worldwide.',
    'World leaders unite to establish ambitious climate targets and funding mechanisms for sustainable development and environmental protection initiatives.',
    'Scientists achieve a major breakthrough in quantum computing, bringing us closer to solving complex problems that are impossible for classical computers.',
    'A new social media platform launches with privacy-first design, offering users complete control over their data and enhanced security features.',
    'Space exploration mission discovers an exoplanet within the habitable zone, raising hopes for finding extraterrestrial life and future colonization.',
    'Renewable energy technologies reach cost parity with fossil fuels, accelerating the global transition to sustainable energy sources.',
    'Clinical trials demonstrate the effectiveness of gene therapy treatments for previously incurable genetic disorders, offering new hope to patients.',
    'Major cities begin deploying autonomous vehicle fleets for public transportation, marking a significant milestone in self-driving technology.',
    'Cybersecurity experts warn of sophisticated AI-powered attacks while developing advanced defense mechanisms to protect critical infrastructure.',
    'Marine conservation programs report significant improvements in ocean health, with recovering fish populations and reduced plastic pollution.',
    'Educational institutions worldwide adopt innovative technologies to enhance remote learning experiences and improve student outcomes.',
    'Digital mental health platforms see massive growth as people seek accessible, affordable solutions for psychological wellbeing and therapy.',
    'Fashion industry leaders embrace sustainable practices, developing eco-friendly materials and circular economy business models.',
    'Food technology innovations address global hunger with lab-grown proteins, vertical farming, and efficient distribution systems.',
    'Virtual reality therapy shows remarkable success in treating PTSD, phobias, and other mental health conditions in clinical settings.',
    'Blockchain technology transforms supply chain management, providing transparency, traceability, and efficiency in global trade networks.',
    'City planners integrate green infrastructure solutions to combat climate change, improve air quality, and enhance urban sustainability.',
    'Advances in big data analytics enable personalized medicine approaches, tailoring treatments to individual genetic profiles and health histories.',
    'Lab-grown meat production reaches commercial scale, offering sustainable alternatives to traditional livestock farming methods.',
    'Smart city technologies improve quality of life through efficient resource management, reduced traffic, and enhanced public services.'
  ];

  const authors = [
    { id: 'author1', name: 'Dr. Sarah Chen', email: 'sarah.chen@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face' },
    { id: 'author2', name: 'Michael Rodriguez', email: 'michael.r@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
    { id: 'author3', name: 'Dr. Emily Watson', email: 'emily.watson@example.com', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face' },
    { id: 'author4', name: 'James Thompson', email: 'james.t@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
    { id: 'author5', name: 'Dr. Lisa Park', email: 'lisa.park@example.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face' }
  ];

  const images = [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop', // Tech
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', // Business
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', // Science
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop', // Health
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop', // Sports
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop', // Environment
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop', // AI
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop', // Space
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop', // Cyber
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop'  // Ocean
  ];

  return Array.from({ length: count }, (_, index) => {
    const categoryIndex = index % demoCategories.length;
    const category = demoCategories[categoryIndex];
    const author = authors[index % authors.length];
    const publishDate = new Date();
    publishDate.setDate(publishDate.getDate() - Math.floor(Math.random() * 30));

    return {
      id: `article-${index + 1}`,
      title: headlines[index % headlines.length],
      content: `${summaries[index % summaries.length]} This is expanded content that would normally contain the full article text with multiple paragraphs, quotes, and detailed information about the topic.`,
      summary: summaries[index % summaries.length],
      author,
      publishDate,
      category,
      tags: ['tag1', 'tag2', 'tag3'],
      imageUrl: images[index % images.length],
      slug: `article-${index + 1}-${category.slug}`,
      language: 'en',
      seoData: {
        metaTitle: headlines[index % headlines.length],
        metaDescription: summaries[index % summaries.length],
        keywords: ['news', category.name.toLowerCase(), 'breaking'],
        canonicalUrl: `/article/article-${index + 1}`,
        openGraph: {
          title: headlines[index % headlines.length],
          description: summaries[index % summaries.length],
          image: images[index % images.length],
          url: `/article/article-${index + 1}`,
          type: 'article',
          siteName: 'News Website',
          locale: 'en_US'
        },
        twitterCard: {
          card: 'summary_large_image',
          title: headlines[index % headlines.length],
          description: summaries[index % summaries.length],
          image: images[index % images.length]
        }
      },
      readingTime: Math.floor(Math.random() * 10) + 3,
      source: {
        id: 'news-source',
        name: 'News Source',
        url: 'https://example.com',
        credibilityRating: 8.5
      },
      status: 'published',
      viewCount: Math.floor(Math.random() * 10000) + 100,
      featured: index < 3
    };
  });
};

// ============================================================================
// DEMO COMPONENT
// ============================================================================

export function NewsGridDemo() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize with demo data
  useEffect(() => {
    const timer = setTimeout(() => {
      setArticles(generateDemoArticles(20));
      setLoading(false);
    }, 1000); // Simulate loading time

    return () => clearTimeout(timer);
  }, []);

  // Simulate loading more articles
  const handleLoadMore = async (): Promise<NewsArticle[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newArticles = generateDemoArticles(10);
        // Offset IDs to avoid duplicates
        const offsetArticles = newArticles.map(article => ({
          ...article,
          id: `${article.id}-page-${currentPage + 1}`
        }));
        
        setArticles(prev => [...prev, ...offsetArticles]);
        setCurrentPage(prev => prev + 1);
        
        // Stop loading after 5 pages
        if (currentPage >= 5) {
          setHasMore(false);
        }
        
        resolve(offsetArticles);
      }, 1500);
    });
  };

  // Simulate search
  const handleSearch = async (query: string): Promise<NewsArticle[]> => {
    console.log('Searching for:', query);
    // In a real app, this would make an API call
    return articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.summary.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Simulate category filter
  const handleCategoryFilter = async (categoryId: string | null): Promise<NewsArticle[]> => {
    console.log('Filtering by category:', categoryId);
    // In a real app, this would make an API call
    if (!categoryId) return articles;
    return articles.filter(article => article.category.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            NewsGrid Component Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A comprehensive grid component with infinite scrolling, search, filtering, 
            and multiple layout options. Features responsive design and loading states.
          </p>
        </div>

        {/* Demo Sections */}
        <div className="space-y-16">
          {/* Default Grid */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Default Grid with All Features
            </h2>
            <NewsGrid
              articles={articles}
              categories={demoCategories}
              onLoadMore={handleLoadMore}
              onSearch={handleSearch}
              onCategoryFilter={handleCategoryFilter}
              loading={loading}
              hasMore={hasMore}
              enableInfiniteScroll={true}
              enableSearch={true}
              enableCategoryFilter={true}
              loadingSkeletonCount={6}
              className="mb-8"
            />
          </section>

          {/* Compact Grid */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Compact Grid Layout
            </h2>
            <NewsGrid
              articles={articles.slice(0, 15)}
              categories={demoCategories}
              loading={false}
              hasMore={false}
              enableInfiniteScroll={false}
              enableSearch={true}
              enableCategoryFilter={false}
              gridVariant="compact"
              className="mb-8"
            />
          </section>

          {/* Mixed Layout */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Mixed Layout (Featured + Regular)
            </h2>
            <NewsGrid
              articles={articles.slice(0, 10)}
              categories={demoCategories}
              loading={false}
              hasMore={false}
              enableInfiniteScroll={false}
              enableSearch={false}
              enableCategoryFilter={true}
              gridVariant="mixed"
              className="mb-8"
            />
          </section>

          {/* Search Only */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Search Only (No Category Filter)
            </h2>
            <NewsGrid
              articles={articles.slice(0, 12)}
              categories={demoCategories}
              loading={false}
              hasMore={false}
              enableInfiniteScroll={false}
              enableSearch={true}
              enableCategoryFilter={false}
              emptyStateMessage="No articles match your search. Try different keywords."
              className="mb-8"
            />
          </section>

          {/* Loading State Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Loading State
            </h2>
            <NewsGrid
              articles={[]}
              categories={demoCategories}
              loading={true}
              hasMore={false}
              enableInfiniteScroll={false}
              enableSearch={true}
              enableCategoryFilter={true}
              loadingSkeletonCount={8}
              className="mb-8"
            />
          </section>

          {/* Empty State Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Empty State
            </h2>
            <NewsGrid
              articles={[]}
              categories={demoCategories}
              loading={false}
              hasMore={false}
              enableInfiniteScroll={false}
              enableSearch={true}
              enableCategoryFilter={true}
              emptyStateMessage="No articles available at this time. Please check back later."
              className="mb-8"
            />
          </section>
        </div>

        {/* Usage Documentation */}
        <section className="mt-16 bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Usage Examples
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Basic Usage
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`<NewsGrid
  articles={articles}
  categories={categories}
  loading={loading}
  hasMore={hasMore}
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                With Infinite Scroll and Search
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`<NewsGrid
  articles={articles}
  categories={categories}
  onLoadMore={handleLoadMore}
  onSearch={handleSearch}
  onCategoryFilter={handleCategoryFilter}
  loading={loading}
  hasMore={hasMore}
  enableInfiniteScroll={true}
  enableSearch={true}
  enableCategoryFilter={true}
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Compact Layout
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`<NewsGrid
  articles={articles}
  gridVariant="compact"
  enableInfiniteScroll={false}
  loadingSkeletonCount={10}
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Mixed Layout (Featured + Regular)
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`<NewsGrid
  articles={articles}
  gridVariant="mixed"
  enableCategoryFilter={true}
  emptyStateMessage="Custom empty message"
/>`}</code>
              </pre>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-md font-medium text-blue-900 dark:text-blue-200 mb-2">
              Key Features
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Responsive grid layouts (default, compact, mixed)</li>
              <li>• Infinite scrolling with intersection observer</li>
              <li>• Real-time search with debouncing</li>
              <li>• Category filtering with multi-select</li>
              <li>• Loading skeletons and empty states</li>
              <li>• Sorting by date, popularity, or title</li>
              <li>• Accessibility compliant</li>
              <li>• Performance optimized</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NewsGridDemo;