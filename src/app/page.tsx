'use client';

import React from 'react';
import Link from 'next/link';
import { SEOHead } from '@/components/seo/SEOHead';
import { NewsGridDemo } from '@/components/ui/NewsGridDemo';
import { SearchBarDemo } from '@/components/ui/SearchBarDemo';
import MainFooter from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="Breaking News and Latest Updates"
        description="Stay informed with the latest breaking news, politics, sports, technology, and entertainment from around the world. Your comprehensive source for global coverage."
        keywords={['breaking news', 'latest news', 'world news', 'politics', 'sports', 'technology']}
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📰 News Website
            </h1>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">Home</Link>
              <Link href="/demo" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">Demo</Link>
              <Link href="/demo" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Theme Demo</Link>
            </nav>
          </div>
        </div>
      </header>      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Stay Informed with Latest News
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Your source for breaking news and global coverage
          </p>
          <Link 
            href="/demo" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Explore Components
          </Link>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Search News</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBarDemo />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Latest Headlines</h2>
          </div>
          <NewsGridDemo />
        </div>
      </section>

      <MainFooter />
    </div>
    </>
  );
}
