# SEOHead Component Documentation

## Overview

The SEOHead component is a comprehensive SEO solution for the News Website that dynamically generates meta tags, structured data, and social media optimization tags. It supports articles, categories, authors, and general pages.

## Features

- ✅ **Dynamic Meta Tags**: Auto-generates title, description, and keywords
- ✅ **Open Graph Tags**: Complete social media optimization for Facebook, LinkedIn, etc.
- ✅ **Twitter Cards**: Optimized cards for Twitter sharing
- ✅ **JSON-LD Structured Data**: News article schema for search engines
- ✅ **Canonical URLs**: Prevents duplicate content issues
- ✅ **Language Alternates**: Internationalization support
- ✅ **PWA Meta Tags**: Progressive Web App optimization
- ✅ **Author & Publication Data**: Rich article metadata

## Basic Usage

### Homepage SEO
```tsx
import { SEOHead } from '@/components/seo/SEOHead';

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="Breaking News and Latest Updates"
        description="Stay informed with the latest breaking news, politics, sports, and entertainment from around the world."
        type="website"
      />
      {/* Page content */}
    </>
  );
}
```

### Article Page SEO
```tsx
import { ArticleSEOHead } from '@/components/seo/SEOHead';

export default function ArticlePage({ article, author, category }) {
  return (
    <>
      <ArticleSEOHead
        article={article}
        author={author}
        category={category}
      />
      {/* Article content */}
    </>
  );
}
```

### Category Page SEO
```tsx
import { CategorySEOHead } from '@/components/seo/SEOHead';

export default function CategoryPage({ category }) {
  return (
    <>
      <CategorySEOHead category={category} />
      {/* Category content */}
    </>
  );
}
```

## Advanced Usage

### Custom Schema Data
```tsx
import { SEOHead } from '@/components/seo/SEOHead';

const customSchema = {
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

export default function SearchPage() {
  return (
    <>
      <SEOHead
        title="Search News Articles"
        description="Search through thousands of news articles and find what you're looking for."
        customSchema={customSchema}
      />
      {/* Search page content */}
    </>
  );
}
```

### Internationalization
```tsx
import { SEOHead } from '@/components/seo/SEOHead';

export default function ArticlePage({ article, locale }) {
  return (
    <>
      <SEOHead
        title={article.title}
        description={article.description}
        language={locale}
        alternateLanguages={{
          'en': 'https://news-website.com/en/article/sample-article',
          'es': 'https://news-website.com/es/article/articulo-ejemplo',
          'fr': 'https://news-website.com/fr/article/article-exemple'
        }}
        article={article}
      />
      {/* Article content */}
    </>
  );
}
```

### Custom Meta Tags
```tsx
import { SEOHead } from '@/components/seo/SEOHead';

export default function SpecialPage() {
  return (
    <>
      <SEOHead
        title="Live Election Coverage"
        description="Follow live election results and updates as they happen."
        customMeta={[
          { name: "news_keywords", content: "election, politics, voting, results" },
          { property: "fb:app_id", content: "123456789" },
          { name: "article:opinion", content: "false" },
          { name: "syndication-source", content: "https://news-website.com" }
        ]}
        twitterCardType="summary_large_image"
      />
      {/* Live coverage content */}
    </>
  );
}
```

## Component Props

### SEOHead Props
```typescript
interface SEOHeadProps {
  // Basic meta information
  title?: string;                    // Page title
  description?: string;              // Meta description
  keywords?: string[];               // Meta keywords array
  canonical?: string;                // Canonical URL
  
  // Content data
  article?: Article;                 // Article object
  author?: Author;                   // Author object
  category?: Category;               // Category object
  
  // Page configuration
  type?: 'website' | 'article' | 'profile' | 'video';
  siteName?: string;                 // Site name (default: "News Website")
  siteUrl?: string;                  // Base URL
  
  // Social media image
  image?: {
    url: string;                     // Image URL
    alt: string;                     // Alt text
    width?: number;                  // Image width
    height?: number;                 // Image height
  };
  
  // Internationalization
  language?: string;                 // Primary language (default: "en")
  alternateLanguages?: {             // Language alternates
    [key: string]: string;          // language code -> URL
  };
  
  // Publication dates
  publishedDate?: string;            // ISO date string
  modifiedDate?: string;             // ISO date string
  
  // Custom additions
  customMeta?: Array<{               // Custom meta tags
    name?: string;
    property?: string;
    content: string;
  }>;
  customSchema?: object;             // Custom JSON-LD schema
  
  // Twitter settings
  twitterHandle?: string;            // Twitter handle
  twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
}
```

## Generated Meta Tags

The component automatically generates the following meta tags:

### Basic HTML Meta Tags
- `<title>` - Formatted page title
- `<meta name="description">` - Page description
- `<meta name="keywords">` - Auto-generated keywords
- `<meta charset="utf-8">` - Character encoding
- `<meta name="viewport">` - Mobile viewport

### Open Graph Tags
- `og:type` - Content type (website, article, etc.)
- `og:title` - Page title
- `og:description` - Page description
- `og:site_name` - Site name
- `og:url` - Canonical URL
- `og:image` - Social sharing image
- `og:image:alt` - Image alt text
- `og:image:width` - Image width
- `og:image:height` - Image height

### Article-Specific Open Graph
- `article:published_time` - Publication date
- `article:modified_time` - Modification date
- `article:author` - Author name
- `article:section` - Article category
- `article:tag` - Article tags

### Twitter Card Tags
- `twitter:card` - Card type
- `twitter:title` - Tweet title
- `twitter:description` - Tweet description
- `twitter:image` - Tweet image
- `twitter:image:alt` - Image alt text
- `twitter:site` - Site Twitter handle
- `twitter:creator` - Author Twitter handle

### Search Engine Tags
- `<link rel="canonical">` - Canonical URL
- `robots` - Indexing instructions
- `googlebot` - Google-specific instructions
- `datePublished` - Publication date
- `dateModified` - Modification date

### JSON-LD Structured Data
Automatically generates NewsArticle schema:
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Article Title",
  "description": "Article description...",
  "image": ["https://example.com/image.jpg"],
  "datePublished": "2025-11-06T10:00:00Z",
  "dateModified": "2025-11-06T15:30:00Z",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "News Website",
    "logo": {
      "@type": "ImageObject",
      "url": "https://news-website.com/logo.png"
    }
  }
}
```

## Best Practices

### 1. Title Optimization
- Keep titles under 60 characters
- Include primary keywords near the beginning
- Use consistent title formatting: "Article Title | News Website"

### 2. Description Optimization
- Keep descriptions between 150-160 characters
- Include a clear call-to-action
- Summarize the main value proposition

### 3. Image Optimization
- Use 1200x630px images for optimal social sharing
- Ensure images are under 1MB for fast loading
- Include descriptive alt text

### 4. Structured Data
- Always include publication and modification dates
- Use accurate author information
- Include relevant keywords and tags

### 5. Mobile Optimization
- Test Twitter Cards on mobile devices
- Ensure images display correctly on small screens
- Verify Open Graph previews work properly

## Integration Examples

### Next.js App Router
```tsx
// app/article/[slug]/page.tsx
import { ArticleSEOHead } from '@/components/seo/SEOHead';
import { getArticle, getAuthor } from '@/lib/api';

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  const author = await getAuthor(article.authorId);
  
  return (
    <>
      <ArticleSEOHead article={article} author={author} />
      <main>
        {/* Article content */}
      </main>
    </>
  );
}
```

### Dynamic Routes
```tsx
// app/categories/[category]/page.tsx
import { CategorySEOHead } from '@/components/seo/SEOHead';
import { getCategory } from '@/lib/api';

export default async function CategoryPage({ params }) {
  const category = await getCategory(params.category);
  
  return (
    <>
      <CategorySEOHead category={category} />
      <main>
        {/* Category articles */}
      </main>
    </>
  );
}
```

## Testing SEO Implementation

### Tools for Testing
1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **Google Rich Results Test**: https://search.google.com/test/rich-results
4. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### What to Test
- Open Graph previews on social platforms
- Twitter Card appearance
- Structured data validation
- Mobile-friendly test
- Page speed with meta tags

## Common Issues and Solutions

### 1. Images Not Loading in Social Previews
- Ensure images are publicly accessible
- Use absolute URLs, not relative paths
- Check image dimensions (1200x630px recommended)

### 2. Duplicate Meta Tags
- Use only one SEOHead component per page
- Don't mix with other SEO plugins
- Check for conflicting meta tags in layout

### 3. Structured Data Errors
- Validate JSON-LD with Google's tool
- Ensure all required fields are present
- Use proper ISO date formats

### 4. Missing Canonical URLs
- Always set canonical URLs for content pages
- Use absolute URLs, not relative
- Ensure canonical matches the actual URL

## Performance Considerations

The SEOHead component is optimized for performance:
- Minimal JavaScript footprint
- Server-side rendering compatible
- No external dependencies
- Lazy loading of non-critical meta tags
- Efficient string operations and memoization

## Browser Support

The component supports all modern browsers and includes fallbacks for:
- Internet Explorer 11+ (limited structured data)
- Safari on iOS (Apple-specific meta tags)
- Chrome on Android (PWA optimization)
- Edge (Microsoft-specific features)