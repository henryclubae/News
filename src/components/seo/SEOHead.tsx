'use client';

import React from 'react';
import Head from 'next/head';
import { Article, Author, Category } from '@/types';

// ============================================================================
// SEO HEAD COMPONENT INTERFACES
// ============================================================================

interface SEOHeadProps {
  // Basic meta information
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  
  // Article-specific data
  article?: Article;
  author?: Author;
  category?: Category;
  
  // Page type and configuration
  type?: 'website' | 'article' | 'profile' | 'video';
  siteName?: string;
  siteUrl?: string;
  
  // Social media images
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  
  // Language and internationalization
  language?: string;
  alternateLanguages?: {
    [key: string]: string; // language code -> URL
  };
  
  // Publication data
  publishedDate?: string;
  modifiedDate?: string;
  
  // Custom meta tags
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
  
  // Schema.org structured data
  customSchema?: object;
  
  // Twitter-specific settings
  twitterHandle?: string;
  twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

interface NewsArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  url?: string;
  articleSection?: string;
  keywords?: string[];
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG = {
  siteName: 'News Website',
  siteUrl: 'https://news-website.com',
  defaultDescription: 'Your comprehensive source for breaking news and global coverage',
  defaultImage: {
    url: '/placeholder-news.svg',
    alt: 'News Website Default Image',
    width: 1200,
    height: 630,
  },
  language: 'en',
  twitterHandle: '@newswebsite',
  publisherName: 'News Website',
  publisherLogo: '/icons/icon-512x512.png',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTitle = (title: string, siteName: string): string => {
  if (!title) return siteName;
  if (title.includes(siteName)) return title;
  return `${title} | ${siteName}`;
};

const truncateDescription = (description: string, maxLength: number = 160): string => {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return `${description.substring(0, maxLength - 3).trim()}...`;
};

const generateKeywords = (article?: Article, category?: Category): string[] => {
  const keywords: string[] = [];
  
  if (article) {
    // Add article-specific keywords
    if (article.tags) keywords.push(...article.tags);
    if (article.title) {
      // Extract potential keywords from title
      const titleWords = article.title
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 3 && !['the', 'and', 'for', 'with'].includes(word));
      keywords.push(...titleWords);
    }
  }
  
  if (category) {
    keywords.push(category.name.toLowerCase());
    if (category.description) {
      const categoryWords = category.description
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 4);
      keywords.push(...categoryWords.slice(0, 3));
    }
  }
  
  // Add general news keywords
  keywords.push('news', 'breaking news', 'latest news', 'current events');
  
  // Remove duplicates and return unique keywords
  return [...new Set(keywords)].slice(0, 15);
};

const generateNewsArticleSchema = (
  article: Article,
  author?: Author,
  siteUrl: string = DEFAULT_CONFIG.siteUrl,
  siteName: string = DEFAULT_CONFIG.siteName
): NewsArticleSchema => {
  const schema: NewsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description || article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    url: `${siteUrl}/article/${article.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/article/${article.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}${DEFAULT_CONFIG.publisherLogo}`,
      },
    },
  };

  // Add article images
  if (article.imageUrl) {
    schema.image = [article.imageUrl];
  }

  // Add author information
  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author.name,
      url: author.bio ? `${siteUrl}/author/${author.name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
    };
  }

  // Add article section/category
  if (article.category) {
    schema.articleSection = article.category;
  }

  // Add keywords/tags
  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags;
  }

  return schema;
};

// ============================================================================
// MAIN SEO HEAD COMPONENT
// ============================================================================

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  article,
  author,
  category,
  type = 'website',
  siteName = DEFAULT_CONFIG.siteName,
  siteUrl = DEFAULT_CONFIG.siteUrl,
  image,
  language = DEFAULT_CONFIG.language,
  alternateLanguages,
  publishedDate,
  modifiedDate,
  customMeta = [],
  customSchema,
  twitterHandle = DEFAULT_CONFIG.twitterHandle,
  twitterCardType = 'summary_large_image',
}) => {
  // Generate dynamic values
  const pageTitle = formatTitle(
    title || article?.title || '',
    siteName
  );
  
  const pageDescription = truncateDescription(
    description || article?.description || article?.summary || DEFAULT_CONFIG.defaultDescription
  );
  
  const pageKeywords = keywords || generateKeywords(article, category);
  
  const pageImage = image || (article?.imageUrl ? {
    url: article.imageUrl,
    alt: article.title,
    width: 1200,
    height: 630,
  } : DEFAULT_CONFIG.defaultImage);
  
  const pageCanonical = canonical || (article ? `${siteUrl}/article/${article.slug}` : undefined);
  
  const pagePublishedDate = publishedDate || article?.publishedAt;
  const pageModifiedDate = modifiedDate || article?.updatedAt || pagePublishedDate;
  
  // Generate structured data
  const structuredData = customSchema || (article ? generateNewsArticleSchema(
    article,
    author,
    siteUrl,
    siteName
  ) : null);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords.length > 0 && (
        <meta name="keywords" content={pageKeywords.join(', ')} />
      )}
      
      {/* Language and Charset */}
      <meta charSet="utf-8" />
      <meta name="language" content={language} />
      <html lang={language} />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      
      {/* Canonical URL */}
      {pageCanonical && <link rel="canonical" href={pageCanonical} />}
      
      {/* Language Alternates */}
      {alternateLanguages && Object.entries(alternateLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={siteName} />
      {pageCanonical && <meta property="og:url" content={pageCanonical} />}
      
      {/* Open Graph Image */}
      <meta property="og:image" content={`${siteUrl}${pageImage.url}`} />
      <meta property="og:image:alt" content={pageImage.alt} />
      {pageImage.width && <meta property="og:image:width" content={pageImage.width.toString()} />}
      {pageImage.height && <meta property="og:image:height" content={pageImage.height.toString()} />}
      
      {/* Article-specific Open Graph Tags */}
      {type === 'article' && (
        <>
          {pagePublishedDate && (
            <meta property="article:published_time" content={pagePublishedDate} />
          )}
          {pageModifiedDate && (
            <meta property="article:modified_time" content={pageModifiedDate} />
          )}
          {author && <meta property="article:author" content={author.name} />}
          {category && <meta property="article:section" content={category.name} />}
          {article?.tags && article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCardType} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={`${siteUrl}${pageImage.url}`} />
      <meta name="twitter:image:alt" content={pageImage.alt} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {author?.twitter && <meta name="twitter:creator" content={author.twitter} />}
      
      {/* Additional Twitter Tags for Large Image Card */}
      {twitterCardType === 'summary_large_image' && (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          {pageImage.width && <meta name="twitter:image:width" content={pageImage.width.toString()} />}
          {pageImage.height && <meta name="twitter:image:height" content={pageImage.height.toString()} />}
        </>
      )}
      
      {/* Publication Dates */}
      {pagePublishedDate && (
        <meta name="datePublished" content={pagePublishedDate} />
      )}
      {pageModifiedDate && (
        <meta name="dateModified" content={pageModifiedDate} />
      )}
      
      {/* Search Engine Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Custom Meta Tags */}
      {customMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content}
        />
      ))}
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
      
      {/* PWA and App Links */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      
      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
    </Head>
  );
};

// ============================================================================
// SPECIALIZED SEO COMPONENTS
// ============================================================================

export const ArticleSEOHead: React.FC<{
  article: Article;
  author?: Author;
  category?: Category;
  siteUrl?: string;
  siteName?: string;
}> = ({ article, author, category, siteUrl, siteName }) => (
  <SEOHead
    title={article.title}
    description={article.description || article.summary}
    article={article}
    author={author}
    category={category}
    type="article"
    siteUrl={siteUrl}
    siteName={siteName}
    publishedDate={article.publishedAt}
    modifiedDate={article.updatedAt}
    image={article.imageUrl ? {
      url: article.imageUrl,
      alt: article.title,
      width: 1200,
      height: 630,
    } : undefined}
  />
);

export const CategorySEOHead: React.FC<{
  category: Category;
  siteUrl?: string;
  siteName?: string;
}> = ({ category, siteUrl, siteName }) => (
  <SEOHead
    title={`${category.name} News`}
    description={category.description || `Latest ${category.name.toLowerCase()} news and updates`}
    category={category}
    type="website"
    siteUrl={siteUrl}
    siteName={siteName}
    canonical={`${siteUrl || DEFAULT_CONFIG.siteUrl}/categories/${category.slug}`}
  />
);

export const AuthorSEOHead: React.FC<{
  author: Author;
  siteUrl?: string;
  siteName?: string;
}> = ({ author, siteUrl, siteName }) => (
  <SEOHead
    title={`${author.name} - Author`}
    description={author.bio || `Articles and news by ${author.name}`}
    author={author}
    type="profile"
    siteUrl={siteUrl}
    siteName={siteName}
    canonical={`${siteUrl || DEFAULT_CONFIG.siteUrl}/author/${author.name.toLowerCase().replace(/\s+/g, '-')}`}
    image={author.avatar ? {
      url: author.avatar,
      alt: `${author.name} Profile Picture`,
      width: 400,
      height: 400,
    } : undefined}
  />
);

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default SEOHead;