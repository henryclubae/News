# LazyImage Component Documentation

## Overview

The LazyImage component is a high-performance, accessible image loading solution designed specifically for news websites. It provides intelligent lazy loading, progressive enhancement, WebP support, and comprehensive error handling.

## Features

- ✅ **Intersection Observer**: Efficient lazy loading with customizable thresholds
- ✅ **Progressive Loading**: Blur placeholder with smooth fade-in transitions  
- ✅ **WebP Support**: Automatic WebP format with fallbacks
- ✅ **Responsive Images**: Multiple size breakpoints and aspect ratios
- ✅ **Error Handling**: Retry logic with exponential backoff
- ✅ **Loading Skeletons**: Animated placeholders during load
- ✅ **Accessibility**: Full ARIA support and alt text handling
- ✅ **Performance Monitoring**: Load time tracking and debugging
- ✅ **Hover Effects**: Optional zoom animations
- ✅ **Overlay Support**: Content overlays for news articles

## Installation

```bash
npm install next/image
```

Import the component and styles:

```tsx
import { LazyImage } from '@/components/ui/LazyImage';
import '@/components/ui/LazyImage.css';
```

## Basic Usage

### Simple Image Loading
```tsx
import { LazyImage } from '@/components/ui/LazyImage';

export default function Example() {
  return (
    <LazyImage
      src="/images/news-article.jpg"
      alt="Breaking news article about technology"
      width={800}
      height={600}
      placeholder="blur"
    />
  );
}
```

### News Article Images
```tsx
import { LazyNewsImage } from '@/components/ui/LazyImage';

export default function NewsCard() {
  return (
    <LazyNewsImage
      src="/images/tech-news.jpg"
      alt="Technology breakthrough announced"
      width={400}
      height={250}
      category="Technology"
      publishDate="2025-11-06T10:00:00Z"
      zoomOnHover={true}
    />
  );
}
```

### Avatar Images
```tsx
import { LazyAvatarImage } from '@/components/ui/LazyImage';

export default function AuthorProfile() {
  return (
    <LazyAvatarImage
      src="/images/author-avatar.jpg"
      alt="John Doe, Senior Reporter"
      width={64}
      height={64}
      fallbackSrc="/icons/default-avatar.svg"
    />
  );
}
```

### Hero Images
```tsx
import { LazyHeroImage } from '@/components/ui/LazyImage';

export default function ArticleHero() {
  return (
    <LazyHeroImage
      src="/images/hero-image.jpg"
      alt="Main story headline"
      fill={true}
      priority={true}
      sizes="(max-width: 768px) 100vw, 1200px"
    />
  );
}
```

## Advanced Configuration

### Custom Intersection Observer
```tsx
<LazyImage
  src="/images/article.jpg"
  alt="Article image"
  width={600}
  height={400}
  rootMargin="100px"
  threshold={[0, 0.25, 0.5, 0.75, 1]}
/>
```

### Error Handling and Retry Logic
```tsx
<LazyImage
  src="/images/might-fail.jpg"
  alt="Image with retry logic"
  width={400}
  height={300}
  fallbackSrc="/images/fallback.jpg"
  retryCount={5}
  retryDelay={2000}
  onError={(error) => console.error('Image failed:', error)}
/>
```

### Performance Monitoring
```tsx
<LazyImage
  src="/images/monitored.jpg"
  alt="Performance monitored image"
  width={500}
  height={350}
  onLoadStart={() => console.log('Load started')}
  onLoadComplete={(result) => {
    console.log('Load completed:', result);
    // Track analytics
    analytics.track('image_loaded', {
      naturalWidth: result.naturalWidth,
      naturalHeight: result.naturalHeight,
    });
  }}
/>
```

### Custom Overlay Content
```tsx
<LazyImage
  src="/images/news-overlay.jpg"
  alt="News with overlay"
  width={600}
  height={400}
  overlayContent={
    <div className="bg-gradient-to-t from-black/60 to-transparent w-full p-4">
      <h3 className="text-white text-lg font-bold">Breaking News</h3>
      <p className="text-white/90 text-sm">Important update just in...</p>
    </div>
  }
/>
```

## Props Reference

### Core Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | Required | Image source URL |
| `alt` | `string` | Required | Alternative text for accessibility |
| `width` | `number` | - | Image width in pixels |
| `height` | `number` | - | Image height in pixels |
| `fill` | `boolean` | `false` | Fill parent container |
| `sizes` | `string` | - | Responsive sizes attribute |
| `priority` | `boolean` | `false` | Load immediately (above fold) |

### Loading & Placeholder
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `'blur' \| 'empty' \| 'skeleton'` | `'blur'` | Placeholder type |
| `blurDataURL` | `string` | - | Custom blur placeholder data URL |
| `fallbackSrc` | `string` | - | Fallback image source |
| `showLoadingIndicator` | `boolean` | `true` | Show loading spinner |

### Performance & Behavior
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableWebP` | `boolean` | `true` | Enable WebP format optimization |
| `quality` | `number` | `75` | Image quality (1-100) |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Loading behavior |
| `retryCount` | `number` | `3` | Number of retry attempts |
| `retryDelay` | `number` | `1000` | Delay between retries (ms) |

### Intersection Observer
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rootMargin` | `string` | `'50px'` | Observer root margin |
| `threshold` | `number \| number[]` | `0.1` | Intersection threshold |

### Styling & Animation
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `objectFit` | `string` | `'cover'` | CSS object-fit property |
| `objectPosition` | `string` | `'center'` | CSS object-position |
| `fadeInDuration` | `number` | `300` | Fade-in animation duration (ms) |
| `zoomOnHover` | `boolean` | `false` | Enable hover zoom effect |
| `aspectRatio` | `string` | - | CSS aspect-ratio property |

### Event Handlers
| Prop | Type | Description |
|------|------|-------------|
| `onLoadStart` | `() => void` | Called when loading starts |
| `onLoadComplete` | `(result) => void` | Called when image loads successfully |
| `onError` | `(error) => void` | Called when loading fails |

## Component Variants

### LazyNewsImage
Specialized for news articles with category badges and date overlays:

```tsx
<LazyNewsImage
  src="/images/article.jpg"
  alt="News article"
  width={400}
  height={250}
  category="Politics"
  publishDate="2025-11-06"
  zoomOnHover={true}
/>
```

### LazyAvatarImage
Optimized for user avatars with circular cropping:

```tsx
<LazyAvatarImage
  src="/images/user.jpg"
  alt="User avatar"
  width={48}
  height={48}
  fallbackSrc="/icons/default-avatar.svg"
/>
```

### LazyHeroImage
High-priority loading for above-the-fold hero images:

```tsx
<LazyHeroImage
  src="/images/hero.jpg"
  alt="Hero image"
  fill={true}
  priority={true}
  quality={90}
/>
```

## CSS Classes

The component uses CSS classes that can be customized:

### Core Classes
- `.lazy-image-container` - Main container
- `.lazy-image-main` - The actual image element
- `.lazy-image-skeleton` - Loading skeleton
- `.lazy-image-error-fallback` - Error state display
- `.lazy-image-loading-indicator` - Loading spinner
- `.lazy-image-overlay` - Content overlay container

### State Classes
- `.lazy-image-fade-in` - Fade-in animation
- `.lazy-image-zoom-hover` - Hover zoom container
- `.lazy-image-debug-info` - Development debug info

### Aspect Ratio Classes
- `.lazy-image-aspect-square` - 1:1 ratio
- `.lazy-image-aspect-video` - 16:9 ratio  
- `.lazy-image-aspect-photo` - 4:3 ratio
- `.lazy-image-aspect-portrait` - 3:4 ratio

## Performance Features

### WebP Optimization
Automatically converts images to WebP format when supported:

```tsx
<LazyImage
  src="/images/large-image.jpg"
  alt="Optimized image"
  enableWebP={true}
  quality={85}
  width={800}
  height={600}
/>
```

### Responsive Loading
Provides different image sizes based on viewport:

```tsx
<LazyImage
  src="/images/responsive.jpg"
  alt="Responsive image"
  fill={true}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
/>
```

### Priority Loading
For critical above-the-fold images:

```tsx
<LazyImage
  src="/images/hero.jpg"
  alt="Hero image"
  priority={true}
  width={1200}
  height={600}
/>
```

## Accessibility Features

### Screen Reader Support
```tsx
<LazyImage
  src="/images/chart.jpg"
  alt="Sales data showing 25% increase over last quarter"
  role="img"
  width={600}
  height={400}
/>
```

### High Contrast Mode
The component automatically adapts to high contrast preferences and reduced motion settings.

### Keyboard Navigation
Error retry buttons are keyboard accessible and properly focusable.

## Browser Support

- **Modern Browsers**: Full feature support including WebP and Intersection Observer
- **Legacy Browsers**: Graceful fallback to standard loading
- **Mobile**: Optimized for iOS Safari and Chrome Mobile
- **Accessibility**: Compatible with screen readers and assistive technologies

## Performance Best Practices

### Image Optimization
1. **Use appropriate formats**: WebP for modern browsers, JPEG/PNG fallbacks
2. **Optimize file sizes**: Balance quality vs. file size
3. **Provide multiple sizes**: Use responsive images for different viewports
4. **Set proper dimensions**: Avoid layout shift with explicit width/height

### Loading Strategy
1. **Prioritize above-fold**: Use `priority={true}` for visible images
2. **Lazy load below-fold**: Default behavior for performance
3. **Preload critical images**: Consider `<link rel="preload">` for hero images
4. **Use placeholders**: Blur or skeleton loading for better UX

### Error Handling
1. **Provide fallbacks**: Always include `fallbackSrc` for critical images
2. **Implement retry logic**: Handle temporary network issues
3. **Monitor failures**: Track image loading errors for debugging
4. **Graceful degradation**: Ensure functionality without images

## Common Use Cases

### News Article Thumbnails
```tsx
<LazyNewsImage
  src={article.imageUrl}
  alt={article.title}
  width={300}
  height={200}
  category={article.category}
  publishDate={article.publishedAt}
  zoomOnHover={true}
  fallbackSrc="/images/news-placeholder.svg"
/>
```

### User Profiles
```tsx
<LazyAvatarImage
  src={user.avatar}
  alt={`${user.name} profile picture`}
  width={40}
  height={40}
  fallbackSrc="/icons/default-user.svg"
/>
```

### Image Galleries
```tsx
<div className="grid grid-cols-3 gap-4">
  {images.map((image, index) => (
    <LazyImage
      key={image.id}
      src={image.url}
      alt={image.caption}
      width={300}
      height={300}
      aspectRatio="1/1"
      placeholder="skeleton"
      zoomOnHover={true}
      priority={index < 6} // Prioritize first 6 images
    />
  ))}
</div>
```

### Article Headers
```tsx
<LazyHeroImage
  src={article.heroImage}
  alt={article.title}
  fill={true}
  priority={true}
  quality={90}
  sizes="100vw"
  overlayContent={
    <div className="absolute inset-0 bg-black/40 flex items-end">
      <div className="p-8">
        <h1 className="text-white text-4xl font-bold">{article.title}</h1>
        <p className="text-white/90 mt-2">{article.summary}</p>
      </div>
    </div>
  }
/>
```

## Troubleshooting

### Images Not Loading
1. Check network connectivity
2. Verify image URLs are correct and accessible
3. Check CORS settings for external images
4. Ensure fallback images exist

### Performance Issues
1. Optimize image file sizes
2. Use appropriate image formats (WebP)
3. Implement proper lazy loading thresholds
4. Monitor loading performance with callbacks

### Accessibility Problems
1. Ensure all images have descriptive alt text
2. Test with screen readers
3. Verify keyboard navigation works
4. Check high contrast mode compatibility

### Layout Shift
1. Always specify image dimensions
2. Use aspect ratios for responsive images
3. Implement proper placeholders
4. Test on different viewport sizes