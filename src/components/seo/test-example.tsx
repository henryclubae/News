// Test file to verify SEO component functionality
import { SEOHead, ArticleSEOHead, CategorySEOHead, AuthorSEOHead } from '@/components/seo/SEOHead';

// Mock data for testing
export const mockArticle = {
  id: '1',
  title: 'Revolutionary AI Technology Transforms Healthcare Industry',
  slug: 'ai-technology-healthcare-transformation',
  description: 'Groundbreaking artificial intelligence technology is revolutionizing patient care and medical diagnostics across hospitals worldwide.',
  summary: 'AI breakthrough in healthcare shows promising results for patient outcomes and diagnostic accuracy.',
  content: 'Full article content would be here...',
  imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop',
  publishedAt: '2025-11-06T10:00:00Z',
  updatedAt: '2025-11-06T15:30:00Z',
  category: 'Healthcare',
  tags: ['AI', 'healthcare', 'technology', 'medical', 'innovation'],
  authorId: '1',
  author: 'Dr. Emily Chen',
  publishDate: '2025-11-06T10:00:00Z',
  language: 'en',
  featured: true,
  viewCount: 2500,
  readTime: 7,
  seoData: {
    metaTitle: 'AI Technology Transforms Healthcare - Revolutionary Breakthrough',
    metaDescription: 'Discover how revolutionary AI technology is transforming healthcare industry with improved patient care and diagnostic accuracy.',
    keywords: ['AI healthcare', 'medical technology', 'patient care', 'artificial intelligence'],
    canonical: 'https://news-website.com/article/ai-technology-healthcare-transformation'
  },
  socialData: {
    twitterTitle: 'Revolutionary AI Technology Transforms Healthcare Industry',
    twitterDescription: 'Groundbreaking AI tech revolutionizes patient care and medical diagnostics worldwide.',
    ogTitle: 'AI Technology Transforms Healthcare - Major Breakthrough',
    ogDescription: 'Discover how revolutionary artificial intelligence is changing healthcare forever.',
    ogImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop'
  },
  readingProgress: 0
};

export const mockAuthor = {
  id: '1',
  name: 'Dr. Emily Chen',
  email: 'emily.chen@newswebsite.com',
  bio: 'Medical technology journalist and healthcare innovation expert with over 15 years of experience covering breakthrough medical technologies.',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  twitter: '@DrEmilyChenTech',
  verified: true,
  articlesCount: 285
};

export const mockCategory = {
  id: '1',
  name: 'Healthcare',
  slug: 'healthcare',
  description: 'Latest healthcare news, medical breakthroughs, and industry developments',
  color: '#10b981',
  articlesCount: 750
};

// Example usage in a React component
export const SEOTestExample = () => {
  return (
    <>
      {/* Basic SEO for homepage */}
      <SEOHead
        title="Test News Website"
        description="Testing comprehensive SEO implementation with dynamic meta tags"
        keywords={['test', 'seo', 'news', 'meta tags']}
      />
      
      {/* Article SEO */}
      <ArticleSEOHead
        article={mockArticle}
        author={mockAuthor}
        category={mockCategory}
      />
      
      {/* Category SEO */}
      <CategorySEOHead category={mockCategory} />
      
      {/* Author SEO */}
      <AuthorSEOHead author={mockAuthor} />
    </>
  );
};

// Expected SEO output for testing
export const expectedMetaTags = {
  basic: [
    '<title>Test News Website | News Website</title>',
    '<meta name="description" content="Testing comprehensive SEO implementation with dynamic meta tags" />',
    '<meta name="keywords" content="test, seo, news, meta tags" />'
  ],
  
  openGraph: [
    '<meta property="og:type" content="website" />',
    '<meta property="og:title" content="Test News Website | News Website" />',
    '<meta property="og:description" content="Testing comprehensive SEO implementation with dynamic meta tags" />',
    '<meta property="og:site_name" content="News Website" />'
  ],
  
  twitter: [
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="Test News Website | News Website" />',
    '<meta name="twitter:description" content="Testing comprehensive SEO implementation with dynamic meta tags" />'
  ],
  
  article: [
    '<meta property="article:published_time" content="2025-11-06T10:00:00Z" />',
    '<meta property="article:modified_time" content="2025-11-06T15:30:00Z" />',
    '<meta property="article:author" content="Dr. Emily Chen" />',
    '<meta property="article:section" content="Healthcare" />'
  ]
};

// JSON-LD structured data example
export const expectedStructuredData = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Revolutionary AI Technology Transforms Healthcare Industry",
  "description": "Groundbreaking artificial intelligence technology is revolutionizing patient care and medical diagnostics across hospitals worldwide.",
  "image": ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop"],
  "datePublished": "2025-11-06T10:00:00Z",
  "dateModified": "2025-11-06T15:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Dr. Emily Chen"
  },
  "publisher": {
    "@type": "Organization",
    "name": "News Website",
    "logo": {
      "@type": "ImageObject",
      "url": "https://news-website.com/icons/icon-512x512.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://news-website.com/article/ai-technology-healthcare-transformation"
  },
  "url": "https://news-website.com/article/ai-technology-healthcare-transformation",
  "articleSection": "Healthcare",
  "keywords": ["AI", "healthcare", "technology", "medical", "innovation"]
};

export default SEOTestExample;