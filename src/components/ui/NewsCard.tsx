'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  ShareIcon,
  BookmarkIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { NewsArticle } from '@/types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  showShareButtons?: boolean;
  showBookmark?: boolean;
  showLike?: boolean;
  className?: string;
  priority?: boolean; // For Next.js Image priority loading
}

interface ShareButtonsProps {
  article: NewsArticle;
  isVisible: boolean;
}

// ============================================================================
// SHARE BUTTONS COMPONENT
// ============================================================================

function ShareButtons({ article, isVisible }: ShareButtonsProps) {
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/article/${article.slug}`;
  const shareText = `${article.title} - ${article.summary}`;

  const shareOptions = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: '𝕏',
      color: 'bg-black hover:bg-gray-800'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'Copy Link',
      url: shareUrl,
      icon: '🔗',
      color: 'bg-gray-600 hover:bg-gray-700',
      copy: true
    }
  ];

  const handleShare = async (option: typeof shareOptions[0]) => {
    if (option.copy) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    } else {
      window.open(option.url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.8 
      }}
      transition={{ duration: 0.2 }}
      className="absolute top-2 right-2 flex flex-col space-y-1 z-10"
    >
      {shareOptions.map((option) => (
        <motion.button
          key={option.name}
          onClick={() => handleShare(option)}
          className={`
            w-8 h-8 rounded-full ${option.color} text-white text-sm
            flex items-center justify-center
            backdrop-blur-sm shadow-lg
            transition-all duration-200
            hover:scale-110 active:scale-95
          `}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.9 }}
          title={`Share on ${option.name}`}
        >
          {option.icon}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ============================================================================
// NEWS CARD COMPONENT
// ============================================================================

export function NewsCard({
  article,
  variant = 'default',
  showShareButtons = true,
  showBookmark = true,
  showLike = true,
  className = '',
  priority = false
}: NewsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  };

  const getReadingTime = (content?: string) => {
    if (!content) return article.readingTime || '5 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Compact horizontal variant
  if (variant === 'horizontal') {
    return (
      <motion.article
        className={`
          flex bg-white dark:bg-gray-900 rounded-lg overflow-hidden
          border border-gray-200 dark:border-gray-800
          hover:shadow-lg dark:hover:shadow-gray-900/20
          transition-all duration-300 ease-out
          ${className}
        `}
        whileHover={{ y: -2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative w-32 h-24 flex-shrink-0">
          <Link href={`/article/${article.slug}`}>
            <Image
              src={imageError ? '/placeholder-news.svg' : (article.imageUrl || '/placeholder-news.svg')}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              onError={() => setImageError(true)}
              priority={priority}
            />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          {/* Category */}
          <span className={`
            inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2
            ${article.category?.color || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}
          `}>
            {article.category?.name || 'News'}
          </span>

          {/* Headline */}
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              {article.title}
            </h3>
          </Link>

          {/* Meta */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            <time dateTime={article.publishDate.toString()}>
              {formatDate(article.publishDate)}
            </time>
            <span className="mx-1">•</span>
            <span>{getReadingTime(article.content)}</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.article
        className={`
          bg-white dark:bg-gray-900 rounded-lg overflow-hidden
          border border-gray-200 dark:border-gray-800
          hover:shadow-lg dark:hover:shadow-gray-900/20
          transition-all duration-300 ease-out
          ${className}
        `}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative h-32 overflow-hidden">
          <Link href={`/article/${article.slug}`}>
            <Image
              src={imageError ? '/placeholder-news.svg' : (article.imageUrl || '/placeholder-news.svg')}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              onError={() => setImageError(true)}
              priority={priority}
            />
          </Link>
          
          {showShareButtons && (
            <ShareButtons article={article} isVisible={isHovered} />
          )}

          {/* Category Badge */}
          <div className="absolute bottom-2 left-2">
            <span className={`
              px-2 py-1 text-xs font-semibold rounded-full
              backdrop-blur-sm bg-white/90 dark:bg-gray-900/90
              ${article.category?.color || 'text-blue-800 dark:text-blue-300'}
            `}>
              {article.category?.name || 'News'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Headline */}
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-2">
              {article.title}
            </h3>
          </Link>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <time dateTime={article.publishDate.toString()}>
                  {formatDate(article.publishDate)}
                </time>
                <span className="mx-1">•</span>
                <span>{getReadingTime(article.content)}</span>
              </div>            {(showLike || showBookmark) && (
              <div className="flex items-center space-x-1">
                {showLike && (
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-3 h-3 text-red-500" />
                    ) : (
                      <HeartIcon className="w-3 h-3" />
                    )}
                  </button>
                )}
                {showBookmark && (
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200"
                  >
                    {isBookmarked ? (
                      <BookmarkSolidIcon className="w-3 h-3 text-blue-500" />
                    ) : (
                      <BookmarkIcon className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <motion.article
        className={`
          bg-white dark:bg-gray-900 rounded-xl overflow-hidden
          border border-gray-200 dark:border-gray-800
          hover:shadow-2xl dark:hover:shadow-gray-900/30
          transition-all duration-500 ease-out
          ${className}
        `}
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Link href={`/article/${article.slug}`}>
            <Image
              src={imageError ? '/placeholder-news.svg' : (article.imageUrl || '/placeholder-news.svg')}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-110"
              onError={() => setImageError(true)}
              priority={priority}
            />
          </Link>
          
          {showShareButtons && (
            <ShareButtons article={article} isVisible={isHovered} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`
              px-3 py-1 text-sm font-semibold rounded-full
              backdrop-blur-sm bg-white/90 dark:bg-gray-900/90
              ${article.category?.color || 'text-blue-800 dark:text-blue-300'}
            `}>
              {article.category?.name || 'News'}
            </span>
          </div>

          {/* Action buttons */}
          {(showLike || showBookmark) && (
            <div className="absolute top-4 right-4 flex space-x-2">
              {showLike && (
                <motion.button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              )}
              {showBookmark && (
                <motion.button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-blue-500" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Headline */}
          <Link href={`/article/${article.slug}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-3">
              {article.title}
            </h2>
          </Link>

          {/* Summary */}
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
            {article.summary}
          </p>

          {/* Author and Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {article.author?.avatar && (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={32}
                  height={32}
                  className="rounded-full mr-3"
                />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {article.author?.name || 'Anonymous'}
                </p>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <time dateTime={article.publishDate.toString()}>
                    {formatDate(article.publishDate)}
                  </time>
                  <span className="mx-2">•</span>
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>{getReadingTime(article.content)}</span>
                </div>
              </div>
            </div>

            <ShareIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors duration-200" />
          </div>
        </div>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      className={`
        bg-white dark:bg-gray-900 rounded-lg overflow-hidden
        border border-gray-200 dark:border-gray-800
        hover:shadow-lg dark:hover:shadow-gray-900/20
        transition-all duration-300 ease-out
        ${className}
      `}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Link href={`/article/${article.slug}`}>
          <Image
            src={imageError ? '/placeholder-news.svg' : (article.imageUrl || '/placeholder-news.svg')}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            onError={() => setImageError(true)}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {showShareButtons && (
          <ShareButtons article={article} isVisible={isHovered} />
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`
            px-2 py-1 text-xs font-semibold rounded-full
            backdrop-blur-sm bg-white/90 dark:bg-gray-900/90
            ${article.category?.color || 'text-blue-800 dark:text-blue-300'}
          `}>
            {article.category?.name || 'News'}
          </span>
        </div>

        {/* Action buttons */}
        {(showLike || showBookmark) && (
          <div className="absolute top-3 right-3 flex space-x-1">
            {showLike && (
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-white" />
                )}
              </motion.button>
            )}
            {showBookmark && (
              <motion.button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-4 h-4 text-blue-500" />
                ) : (
                  <BookmarkIcon className="w-4 h-4 text-white" />
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Headline */}
        <Link href={`/article/${article.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-2">
            {article.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
          {article.summary}
        </p>

        {/* Author and Meta */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            {article.author?.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={24}
                height={24}
                className="rounded-full mr-2"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-xs">
                {article.author?.name || 'Anonymous'}
              </p>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                <time dateTime={article.publishDate.toString()}>
                  {formatDate(article.publishDate)}
                </time>
                <span className="mx-1">•</span>
                <span>{getReadingTime(article.content)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default NewsCard;