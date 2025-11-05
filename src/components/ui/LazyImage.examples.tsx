// LazyImage Integration Examples
// This file shows how to integrate LazyImage into existing components

import React from 'react';
import { LazyImage, LazyNewsImage, LazyAvatarImage, LazyHeroImage } from './LazyImage';

// Example 1: Update existing NewsCard component
export function EnhancedNewsCard({ article }: { article: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Replace basic Image with LazyNewsImage */}
      <LazyNewsImage
        src={article.image || '/images/placeholder-news.svg'}
        alt={article.title}
        width={400}
        height={250}
        category={article.category}
        publishDate={article.publishedAt}
        zoomOnHover={true}
        fallbackSrc="/images/placeholder-news.svg"
        placeholder="blur"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {article.category}
          </span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center mt-4">
          <LazyAvatarImage
            src={article.author.avatar}
            alt={`${article.author.name} profile picture`}
            width={32}
            height={32}
            fallbackSrc="/icons/default-avatar.svg"
            className="mr-3"
          />
          <div>
            <p className="font-medium text-sm">{article.author.name}</p>
            <p className="text-gray-500 text-xs">{article.author.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 2: Article page with hero image
export function ArticlePage({ article }: { article: any }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero image with overlay */}
      <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
        <LazyHeroImage
          src={article.heroImage}
          alt={article.title}
          fill={true}
          priority={true}
          quality={90}
          sizes="(max-width: 1024px) 100vw, 1024px"
          overlayContent={
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block bg-red-600 text-white px-3 py-1 rounded mb-4 text-sm font-semibold">
                  {article.category}
                </span>
                <h1 className="text-white text-4xl font-bold mb-4 leading-tight">
                  {article.title}
                </h1>
                <p className="text-white/90 text-lg max-w-3xl">
                  {article.subtitle}
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Article content */}
      <div className="prose prose-lg max-w-none">
        <div className="flex items-center mb-8 pb-8 border-b">
          <LazyAvatarImage
            src={article.author.avatar}
            alt={`${article.author.name} profile picture`}
            width={64}
            height={64}
            fallbackSrc="/icons/default-avatar.svg"
            className="mr-4"
          />
          <div>
            <p className="font-semibold text-lg">{article.author.name}</p>
            <p className="text-gray-600">{article.author.title}</p>
            <p className="text-gray-500 text-sm">
              Published {new Date(article.publishedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Article body with inline images */}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </div>
  );
}

// Example 3: Image gallery with lazy loading
export function ImageGallery({ images }: { images: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => (
        <div key={image.id} className="group relative">
          <LazyImage
            src={image.url}
            alt={image.caption}
            width={400}
            height={300}
            aspectRatio="4/3"
            placeholder="skeleton"
            zoomOnHover={true}
            priority={index < 6} // Prioritize first 6 images
            className="rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoadComplete={(result) => {
              console.log(`Image ${image.id} loaded:`, result);
            }}
          />
          
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-sm">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Example 4: Author profile page
export function AuthorProfile({ author }: { author: any }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Author header */}
      <div className="flex items-center mb-8">
        <LazyAvatarImage
          src={author.avatar}
          alt={`${author.name} profile picture`}
          width={120}
          height={120}
          fallbackSrc="/icons/default-avatar.svg"
          className="mr-6"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
          <p className="text-xl text-gray-600 mb-2">{author.title}</p>
          <p className="text-gray-500">{author.bio}</p>
        </div>
      </div>

      {/* Author's articles */}
      <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {author.articles.map((article: any) => (
          <EnhancedNewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

// Example 5: Category page with featured articles
export function CategoryPage({ category, articles }: { category: string; articles: any[] }) {
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 capitalize">{category}</h1>

      {/* Featured article */}
      {featuredArticle && (
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <LazyNewsImage
              src={featuredArticle.image}
              alt={featuredArticle.title}
              width={600}
              height={400}
              category={featuredArticle.category}
              publishDate={featuredArticle.publishedAt}
              zoomOnHover={true}
              priority={true}
              className="rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            
            <div>
              <h2 className="text-3xl font-bold mb-4">{featuredArticle.title}</h2>
              <p className="text-gray-600 mb-6 text-lg">{featuredArticle.summary}</p>
              
              <div className="flex items-center">
                <LazyAvatarImage
                  src={featuredArticle.author.avatar}
                  alt={`${featuredArticle.author.name} profile picture`}
                  width={48}
                  height={48}
                  fallbackSrc="/icons/default-avatar.svg"
                  className="mr-4"
                />
                <div>
                  <p className="font-semibold">{featuredArticle.author.name}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(featuredArticle.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherArticles.map((article) => (
          <EnhancedNewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

// Example 6: Homepage with mixed content types
export function Homepage({ heroArticle, featuredArticles, categories }: {
  heroArticle: any;
  featuredArticles: any[];
  categories: any[];
}) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero section */}
      <div className="relative h-screen mb-12 rounded-lg overflow-hidden">
        <LazyHeroImage
          src={heroArticle.image}
          alt={heroArticle.title}
          fill={true}
          priority={true}
          quality={95}
          sizes="100vw"
          overlayContent={
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-12">
                <div className="max-w-2xl">
                  <span className="inline-block bg-red-600 text-white px-4 py-2 rounded mb-6 text-sm font-bold uppercase tracking-wide">
                    Breaking News
                  </span>
                  <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
                    {heroArticle.title}
                  </h1>
                  <p className="text-white/90 text-xl mb-8 leading-relaxed">
                    {heroArticle.summary}
                  </p>
                  
                  <div className="flex items-center">
                    <LazyAvatarImage
                      src={heroArticle.author.avatar}
                      alt={`${heroArticle.author.name} profile picture`}
                      width={56}
                      height={56}
                      fallbackSrc="/icons/default-avatar.svg"
                      className="mr-4"
                    />
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {heroArticle.author.name}
                      </p>
                      <p className="text-white/80">
                        {new Date(heroArticle.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* Featured articles */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Featured Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArticles.map((article) => (
            <EnhancedNewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="relative group">
              <LazyImage
                src={category.image}
                alt={`${category.name} category`}
                width={300}
                height={200}
                aspectRatio="3/2"
                zoomOnHover={true}
                className="rounded-lg"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                overlayContent={
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white text-xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {category.articleCount} articles
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Example 7: Search results with performance optimization
export function SearchResults({ query, results }: { query: string; results: any[] }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-600 mb-8">
        Found {results.length} results for "{query}"
      </p>

      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={result.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
            <LazyImage
              src={result.image}
              alt={result.title}
              width={150}
              height={100}
              aspectRatio="3/2"
              placeholder="skeleton"
              priority={index < 5} // Prioritize first 5 results
              className="rounded flex-shrink-0"
              sizes="150px"
            />
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {result.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                {result.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LazyAvatarImage
                    src={result.author.avatar}
                    alt={`${result.author.name} profile picture`}
                    width={24}
                    height={24}
                    fallbackSrc="/icons/default-avatar.svg"
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-500">{result.author.name}</span>
                </div>
                
                <span className="text-xs text-gray-400">
                  {new Date(result.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  EnhancedNewsCard,
  ArticlePage,
  ImageGallery,
  AuthorProfile,
  CategoryPage,
  Homepage,
  SearchResults,
};