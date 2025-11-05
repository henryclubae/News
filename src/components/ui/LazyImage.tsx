'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

// ============================================================================
// LAZY IMAGE COMPONENT INTERFACES
// ============================================================================

interface LazyImageProps {
  // Required props
  src: string;
  alt: string;
  
  // Dimensions
  width?: number;
  height?: number;
  fill?: boolean;
  
  // Responsive behavior
  sizes?: string;
  priority?: boolean;
  
  // Loading and placeholder
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  fallbackSrc?: string;
  
  // Styling
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  
  // Accessibility
  role?: string;
  loading?: 'lazy' | 'eager';
  
  // Performance monitoring
  onLoadStart?: () => void;
  onLoadComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
  onError?: (error: Error) => void;
  
  // WebP support
  enableWebP?: boolean;
  quality?: number;
  
  // Intersection observer options
  rootMargin?: string;
  threshold?: number | number[];
  
  // Custom behavior
  retryCount?: number;
  retryDelay?: number;
  fadeInDuration?: number;
  showLoadingIndicator?: boolean;
  
  // Advanced features
  aspectRatio?: string;
  overlayContent?: React.ReactNode;
  zoomOnHover?: boolean;
}

interface ImageState {
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  isIntersecting: boolean;
  retryAttempts: number;
  loadTime?: number;
  naturalDimensions?: {
    width: number;
    height: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateWebPSrc = (src: string, quality: number = 75): string => {
  if (!src || src.startsWith('data:')) return src;
  
  // For Next.js Image optimization
  if (src.startsWith('/') || src.includes(window.location.hostname)) {
    const url = new URL(src, window.location.origin);
    url.searchParams.set('format', 'webp');
    url.searchParams.set('q', quality.toString());
    return url.toString();
  }
  
  // For external images with query parameter support
  try {
    const url = new URL(src);
    url.searchParams.set('fm', 'webp');
    url.searchParams.set('q', quality.toString());
    return url.toString();
  } catch {
    return src;
  }
};

const generateBlurDataURL = async (src: string): Promise<string> => {
  // Generate a simple blur placeholder
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 30;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Create a simple gradient blur placeholder
  const gradient = ctx.createLinearGradient(0, 0, 40, 30);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(0.5, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 40, 30);
  
  return canvas.toDataURL();
};

const createIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options: {
    rootMargin?: string;
    threshold?: number | number[];
  } = {}
) => {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for older browsers
    callback(true);
    return null;
  }
  
  return new IntersectionObserver(
    ([entry]) => {
      callback(entry.isIntersecting);
    },
    {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.1,
    }
  );
};

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================

const LoadingSkeleton: React.FC<{
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: string;
}> = ({ width, height, className = '', aspectRatio }) => {
  const skeletonStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : aspectRatio ? 'auto' : '200px',
    aspectRatio: aspectRatio,
  };
  
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
      style={skeletonStyle}
      role="img"
      aria-label="Loading image..."
    >
      <div className="flex items-center justify-center h-full">
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

// ============================================================================
// ERROR FALLBACK COMPONENT
// ============================================================================

const ErrorFallback: React.FC<{
  alt: string;
  className?: string;
  onRetry?: () => void;
  width?: number;
  height?: number;
  aspectRatio?: string;
}> = ({ alt, className = '', onRetry, width, height, aspectRatio }) => {
  const errorStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : aspectRatio ? 'auto' : '200px',
    aspectRatio: aspectRatio,
  };
  
  return (
    <div
      className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md ${className}`}
      style={errorStyle}
      role="img"
      aria-label={`Failed to load image: ${alt}`}
    >
      <svg
        className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
        Image failed to load
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// ============================================================================
// MAIN LAZY IMAGE COMPONENT
// ============================================================================

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc,
  className = '',
  objectFit = 'cover',
  objectPosition = 'center',
  role,
  loading = 'lazy',
  onLoadStart,
  onLoadComplete,
  onError,
  enableWebP = true,
  quality = 75,
  rootMargin = '50px',
  threshold = 0.1,
  retryCount = 3,
  retryDelay = 1000,
  fadeInDuration = 300,
  showLoadingIndicator = true,
  aspectRatio,
  overlayContent,
  zoomOnHover = false,
}) => {
  // State management
  const [imageState, setImageState] = useState<ImageState>({
    isLoaded: false,
    isLoading: false,
    hasError: false,
    isIntersecting: false,
    retryAttempts: 0,
  });
  
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState<string>('');
  
  // Refs
  const imageRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const loadStartTimeRef = useRef<number>();
  
  // WebP source generation
  const webpSrc = enableWebP ? generateWebPSrc(currentSrc, quality) : currentSrc;
  const finalSrc = webpSrc || currentSrc;
  
  // Handle intersection observer
  const handleIntersection = useCallback((isIntersecting: boolean) => {
    setImageState(prev => ({
      ...prev,
      isIntersecting: isIntersecting,
      isLoading: isIntersecting && !prev.isLoaded && !prev.hasError,
    }));
    
    if (isIntersecting && onLoadStart) {
      onLoadStart();
      loadStartTimeRef.current = Date.now();
    }
  }, [onLoadStart]);
  
  // Setup intersection observer
  useEffect(() => {
    if (priority || !imageRef.current) return;
    
    observerRef.current = createIntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });
    
    if (observerRef.current && imageRef.current) {
      observerRef.current.observe(imageRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [handleIntersection, priority, rootMargin, threshold]);
  
  // Generate blur placeholder if not provided
  useEffect(() => {
    if (placeholder === 'blur' && !blurDataURL && !generatedBlurDataURL) {
      generateBlurDataURL(src).then(setGeneratedBlurDataURL);
    }
  }, [src, placeholder, blurDataURL, generatedBlurDataURL]);
  
  // Handle image load success
  const handleLoadComplete = useCallback((result: { naturalWidth: number; naturalHeight: number }) => {
    const loadTime = loadStartTimeRef.current ? Date.now() - loadStartTimeRef.current : undefined;
    
    setImageState(prev => ({
      ...prev,
      isLoaded: true,
      isLoading: false,
      hasError: false,
      loadTime,
      naturalDimensions: result,
    }));
    
    if (onLoadComplete) {
      onLoadComplete(result);
    }
  }, [onLoadComplete]);
  
  // Handle image load error with retry logic
  const handleLoadError = useCallback(() => {
    setImageState(prev => {
      const newRetryAttempts = prev.retryAttempts + 1;
      
      // Try fallback source first
      if (fallbackSrc && currentSrc !== fallbackSrc && newRetryAttempts === 1) {
        setCurrentSrc(fallbackSrc);
        return {
          ...prev,
          retryAttempts: newRetryAttempts,
          isLoading: true,
        };
      }
      
      // Retry with original source
      if (newRetryAttempts <= retryCount) {
        retryTimeoutRef.current = setTimeout(() => {
          setImageState(currentState => ({
            ...currentState,
            isLoading: true,
            hasError: false,
          }));
        }, retryDelay * newRetryAttempts);
        
        return {
          ...prev,
          retryAttempts: newRetryAttempts,
          isLoading: false,
        };
      }
      
      // Final error state
      const error = new Error(`Failed to load image after ${retryCount} attempts: ${src}`);
      if (onError) {
        onError(error);
      }
      
      return {
        ...prev,
        hasError: true,
        isLoading: false,
      };
    });
  }, [currentSrc, fallbackSrc, src, retryCount, retryDelay, onError]);
  
  // Retry function
  const handleRetry = useCallback(() => {
    setCurrentSrc(src);
    setImageState(prev => ({
      ...prev,
      hasError: false,
      isLoading: true,
      retryAttempts: 0,
    }));
  }, [src]);
  
  // Should render image
  const shouldRenderImage = priority || imageState.isIntersecting || imageState.isLoaded;
  
  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : aspectRatio ? 'auto' : undefined,
    aspectRatio: aspectRatio,
    overflow: 'hidden',
  };
  
  // Image styles
  const imageStyles: React.CSSProperties = {
    objectFit,
    objectPosition,
    transition: `opacity ${fadeInDuration}ms ease-in-out${zoomOnHover ? ', transform 0.3s ease' : ''}`,
    opacity: imageState.isLoaded ? 1 : 0,
    transform: zoomOnHover ? 'scale(1)' : undefined,
  };
  
  const hoverStyles = zoomOnHover ? {
    transform: 'scale(1.05)',
  } : {};
  
  return (
    <div
      ref={imageRef}
      className={`relative ${zoomOnHover ? 'group cursor-pointer' : ''} ${className}`}
      style={containerStyle}
      role={role}
    >
      {/* Loading Skeleton */}
      {showLoadingIndicator && imageState.isLoading && placeholder === 'skeleton' && (
        <LoadingSkeleton
          width={width}
          height={height}
          aspectRatio={aspectRatio}
          className="absolute inset-0"
        />
      )}
      
      {/* Error Fallback */}
      {imageState.hasError && (
        <ErrorFallback
          alt={alt}
          width={width}
          height={height}
          aspectRatio={aspectRatio}
          className="absolute inset-0"
          onRetry={handleRetry}
        />
      )}
      
      {/* Main Image */}
      {shouldRenderImage && !imageState.hasError && (
        <Image
          src={finalSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL || generatedBlurDataURL}
          quality={quality}
          className={`${zoomOnHover ? 'group-hover:scale-105' : ''} transition-all duration-300`}
          style={imageStyles}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            handleLoadComplete({
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            });
          }}
          onError={handleLoadError}
          onMouseEnter={(e) => {
            if (zoomOnHover) {
              const img = e.target as HTMLImageElement;
              Object.assign(img.style, hoverStyles);
            }
          }}
          onMouseLeave={(e) => {
            if (zoomOnHover) {
              const img = e.target as HTMLImageElement;
              img.style.transform = 'scale(1)';
            }
          }}
        />
      )}
      
      {/* Loading Indicator */}
      {showLoadingIndicator && imageState.isLoading && placeholder !== 'skeleton' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Overlay Content */}
      {overlayContent && (
        <div className="absolute inset-0 flex items-end justify-start p-4">
          {overlayContent}
        </div>
      )}
      
      {/* Performance Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && imageState.loadTime && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {imageState.loadTime}ms
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SPECIALIZED LAZY IMAGE VARIANTS
// ============================================================================

export const LazyNewsImage: React.FC<LazyImageProps & {
  category?: string;
  publishDate?: string;
}> = ({ category, publishDate, overlayContent, ...props }) => (
  <LazyImage
    {...props}
    placeholder="blur"
    enableWebP={true}
    zoomOnHover={true}
    showLoadingIndicator={true}
    overlayContent={
      overlayContent || (
        <div className="bg-gradient-to-t from-black/60 to-transparent w-full p-4">
          {category && (
            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mb-2">
              {category}
            </span>
          )}
          {publishDate && (
            <p className="text-white text-sm opacity-90">
              {new Date(publishDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }
  />
);

export const LazyAvatarImage: React.FC<LazyImageProps> = (props) => (
  <LazyImage
    {...props}
    placeholder="blur"
    objectFit="cover"
    className={`rounded-full ${props.className || ''}`}
    fallbackSrc="/icons/default-avatar.svg"
  />
);

export const LazyHeroImage: React.FC<LazyImageProps> = (props) => (
  <LazyImage
    {...props}
    priority={true}
    placeholder="blur"
    enableWebP={true}
    quality={90}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  />
);

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default LazyImage;