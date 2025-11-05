# NewsCard Component

A comprehensive, responsive news article card component built with Next.js, TypeScript, and Tailwind CSS. Features multiple variants, accessibility support, SEO optimization, and modern animations.

## Features

- ✅ **Multiple Variants**: Default, Featured, Compact, and Horizontal layouts
- ✅ **Responsive Design**: Mobile-first approach with breakpoint optimizations
- ✅ **Next.js Image Optimization**: Lazy loading, priority loading, and error handling
- ✅ **SEO Optimized**: Semantic HTML structure with proper schema
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Modern Animations**: Framer Motion powered hover and interaction effects
- ✅ **Social Sharing**: Built-in share buttons with platform-specific handling
- ✅ **Interactive Elements**: Like, bookmark, and share functionality
- ✅ **Dark Mode Support**: Automatic theme adaptation
- ✅ **TypeScript**: Full type safety with comprehensive interfaces
- ✅ **Performance**: Optimized rendering with minimal re-renders

## Installation

```bash
npm install framer-motion @heroicons/react
```

## Basic Usage

```tsx
import { NewsCard } from '@/components/ui/NewsCard';
import { NewsArticle } from '@/types';

const article: NewsArticle = {
  id: '1',
  title: 'Breaking News: Important Development',
  summary: 'A brief summary of the news article that captures the main points.',
  author: {
    id: 'author-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/path/to/avatar.jpg'
  },
  publishDate: new Date(),
  category: {
    id: 'tech',
    name: 'Technology',
    slug: 'technology',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  tags: ['tech', 'news'],
  imageUrl: '/path/to/image.jpg',
  slug: 'breaking-news-slug',
  // ... other required properties
};

// Basic usage
<NewsCard article={article} />

// Featured article with priority loading
<NewsCard 
  article={article} 
  variant="featured" 
  priority={true}
/>
```

## Variants

### 1. Default Variant

Standard card layout suitable for article grids.

```tsx
<NewsCard article={article} variant="default" />
```

### 2. Featured Variant

Larger, more prominent display for hero articles.

```tsx
<NewsCard 
  article={article} 
  variant="featured" 
  priority={true}
/>
```

### 3. Compact Variant

Smaller cards for dense layouts or sidebars.

```tsx
<NewsCard article={article} variant="compact" />
```

### 4. Horizontal Variant

Side-by-side layout for list views.

```tsx
<NewsCard article={article} variant="horizontal" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `article` | `NewsArticle` | Required | The article data to display |
| `variant` | `'default' \| 'featured' \| 'compact' \| 'horizontal'` | `'default'` | Card layout variant |
| `showShareButtons` | `boolean` | `true` | Show social share buttons on hover |
| `showBookmark` | `boolean` | `true` | Show bookmark button |
| `showLike` | `boolean` | `true` | Show like button |
| `className` | `string` | `''` | Additional CSS classes |
| `priority` | `boolean` | `false` | Next.js Image priority loading |

## Grid Layouts

### Article Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {articles.map(article => (
    <NewsCard key={article.id} article={article} />
  ))}
</div>
```

### Compact Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  {articles.map(article => (
    <NewsCard 
      key={article.id} 
      article={article} 
      variant="compact" 
    />
  ))}
</div>
```

### Mixed Layout

```tsx
{/* Featured article */}
<div className="mb-8">
  <NewsCard 
    article={featuredArticle} 
    variant="featured" 
    priority={true}
  />
</div>

{/* Regular grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {articles.slice(0, 6).map(article => (
    <NewsCard key={article.id} article={article} />
  ))}
</div>

{/* Trending list */}
<div className="space-y-4">
  {trendingArticles.map(article => (
    <NewsCard 
      key={article.id} 
      article={article} 
      variant="horizontal" 
    />
  ))}
</div>
```

## Responsive Breakpoints

The component automatically adapts to different screen sizes:

- **Mobile (< 768px)**: Single column, touch-optimized interactions
- **Tablet (768px - 1024px)**: 2-3 column grids depending on variant
- **Desktop (> 1024px)**: Full multi-column layouts with hover effects

## Accessibility Features

- **Semantic HTML**: Uses proper `article`, `heading`, and `time` elements
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations
- **Reduced Motion**: Respects `prefers-reduced-motion` settings
- **Alternative Text**: Proper image alt attributes

## SEO Optimization

The component generates SEO-friendly markup including:

- Structured data with schema.org markup
- Semantic HTML5 elements
- Proper heading hierarchy
- Meta information display
- Canonical URL support

## Performance Features

- **Next.js Image**: Automatic optimization and lazy loading
- **Memoization**: Optimized re-rendering with React.memo patterns
- **Efficient Animations**: Hardware-accelerated transforms
- **Bundle Splitting**: Tree-shakeable imports
- **Priority Loading**: Above-the-fold image optimization

## Customization

### Custom Styling

```tsx
<NewsCard 
  article={article}
  className="custom-shadow border-2 border-blue-200"
/>
```

### Disable Features

```tsx
<NewsCard 
  article={article}
  showShareButtons={false}
  showLike={false}
  showBookmark={false}
/>
```

### Environment Variables

```env
# Required for social sharing
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Data Requirements

The component requires a complete `NewsArticle` object with all required properties. See the TypeScript interfaces for full requirements:

```typescript
interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: Author;
  publishDate: Date;
  category: Category;
  tags: string[];
  imageUrl?: string;
  slug: string;
  language: string;
  seoData: SEOData;
  readingTime: number;
  source: NewsSource;
  status: ArticleStatus;
  viewCount?: number;
  featured?: boolean;
}
```

## Error Handling

The component includes comprehensive error handling:

- **Image Loading**: Fallback to placeholder on load failure
- **Date Formatting**: Graceful handling of invalid dates  
- **Missing Data**: Safe fallbacks for optional properties
- **Network Errors**: Retry mechanisms for share actions

## Browser Support

- **Modern Browsers**: Full feature support in Chrome, Firefox, Safari, Edge
- **Legacy Support**: Graceful degradation for older browsers
- **Mobile Browsers**: Optimized for iOS Safari and Chrome Mobile
- **Progressive Enhancement**: Core functionality without JavaScript

## Testing

The component includes comprehensive test coverage:

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Visual regression tests
npm run test:visual
```

## Contributing

1. Follow the established TypeScript patterns
2. Include comprehensive prop documentation
3. Add test coverage for new features
4. Ensure accessibility compliance
5. Test across multiple devices and browsers

## License

MIT License - see LICENSE file for details.
