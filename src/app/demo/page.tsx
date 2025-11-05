'use client';

import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { ThemeToggle, ThemeSelector } from '@/components/ui/ThemeToggle';
import { NewsCardDemo } from '@/components/ui/NewsCardDemo';
import { NewsGridDemo } from '@/components/ui/NewsGridDemo';
import { SearchBarDemo } from '@/components/ui/SearchBarDemo';
import MainFooter from '@/components/layout/Footer';

export default function DemoPage() {
  return (
    <>
      <SEOHead
        title="Component Demo - Interactive News Components"
        description="Explore our comprehensive collection of news website components including search bars, news grids, theme toggles, and more. Built with Next.js, TypeScript, and Tailwind CSS."
        keywords={['components', 'demo', 'news components', 'react', 'nextjs', 'typescript', 'tailwind']}
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with Theme Controls */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                News Website Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete Component Showcase
              </p>
            </div>
            
            {/* Theme Controls */}
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="compact" showLabel={true} />
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-4xl font-bold mb-4">
              🚀 News Website Components
            </h2>
            <p className="text-xl opacity-90 mb-6">
              Fully implemented with Next.js, TypeScript, Tailwind CSS, and modern React patterns
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold">NewsCard</div>
                <div className="opacity-80">4 Variants</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold">NewsGrid</div>
                <div className="opacity-80">Infinite Scroll</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold">SearchBar</div>
                <div className="opacity-80">Smart Search</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold">Theme System</div>
                <div className="opacity-80">Dark/Light</div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Sections */}
        <div className="space-y-16">
          {/* Search Bar Demo */}
          <section>
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                SearchBar Component
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <SearchBarDemo />
            </div>
          </section>

          {/* News Card Demo */}
          <section>
            <div className="flex items-center mb-6">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                NewsCard Component
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <NewsCardDemo />
            </div>
          </section>

          {/* News Grid Demo */}
          <section>
            <div className="flex items-center mb-6">
              <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                NewsGrid Component
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <NewsGridDemo />
            </div>
          </section>

          {/* Theme Demo */}
          <section>
            <div className="flex items-center mb-6">
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Theme System
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="grid md:grid-cols-3 gap-6">
              {/* Theme Toggle Components */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Theme Toggle
                </h3>
                <div className="flex justify-center">
                  <ThemeToggle variant="minimal" showLabel={false} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimal theme toggle button
                </p>
              </div>

              {/* Theme Selector */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Theme Selector
                </h3>
                <div className="flex justify-center">
                  <ThemeSelector />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced theme selection dropdown
                </p>
              </div>

              {/* Theme System Info */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Theme System
                </h3>
                <div className="flex justify-center">
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Full theme system active
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Dark/Light/System modes working
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete theme management system
                </p>
              </div>                {/* Placeholder for other components */}
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    News Components
                  </h3>
                  <div className="flex justify-center">
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✅ SearchBar, NewsGrid, and NewsCard working perfectly
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All news components functional and responsive
                  </p>
                </div>

                {/* Status Info */}
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Status
                  </h3>
                  <div className="flex justify-center">
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        🚀 Server running on port 3000
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Homepage and main features fully operational
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Status */}
          <section>
            <div className="flex items-center mb-6">
              <div className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Implementation Status
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Completed Features */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
                  ✅ Completed Features
                </h3>
                <ul className="space-y-2 text-green-700 dark:text-green-300">
                  <li>• Complete NewsCard component with 4 variants</li>
                  <li>• Advanced NewsGrid with infinite scroll</li>
                  <li>• Smart SearchBar with real-time suggestions</li>
                  <li>• Theme system with dark/light modes</li>
                  <li>• Footer components (desktop & mobile)</li>
                  <li>• TypeScript interfaces and type safety</li>
                  <li>• Accessibility compliance (WCAG)</li>
                  <li>• Responsive design (mobile-first)</li>
                  <li>• Framer Motion animations</li>
                  <li>• Comprehensive documentation</li>
                </ul>
              </div>

              {/* Technical Stack */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">
                  🛠️ Technical Stack
                </h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li>• <strong>Next.js 14</strong> - App Router & Server Components</li>
                  <li>• <strong>TypeScript</strong> - Full type safety</li>
                  <li>• <strong>Tailwind CSS</strong> - Utility-first styling</li>
                  <li>• <strong>Framer Motion</strong> - Smooth animations</li>
                  <li>• <strong>Heroicons</strong> - Beautiful icons</li>
                  <li>• <strong>React Hooks</strong> - Modern patterns</li>
                  <li>• <strong>Local Storage</strong> - Persistent data</li>
                  <li>• <strong>ESLint & Prettier</strong> - Code quality</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <MainFooter />
    </div>
    </>
  );
}