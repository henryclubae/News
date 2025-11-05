import LanguageSelector from './LanguageSelector';

export default function LanguageSelectorDemo() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Language Selector
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Demonstration of the advanced LanguageSelector component with multiple variants,
            loading states, accessibility features, and language persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Dropdown Variant */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Dropdown Variant
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Full-featured dropdown with flags, native names, and loading states.
            </p>
            <div className="flex justify-center">
              <LanguageSelector
                variant="dropdown"
                showLabel={true}
                showFlag={true}
                size="md"
              />
            </div>
          </div>

          {/* Compact Variant */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Compact Variant
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Space-efficient design perfect for headers and mobile layouts.
            </p>
            <div className="flex justify-center">
              <LanguageSelector
                variant="compact"
                showFlag={true}
                size="sm"
              />
            </div>
          </div>

          {/* Expanded Variant */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-2 xl:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Expanded Variant
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Shows all languages inline - great for settings pages.
            </p>
            <div className="flex justify-center">
              <LanguageSelector
                variant="expanded"
                showFlag={true}
                showLabel={true}
                size="sm"
              />
            </div>
          </div>

          {/* Size Variations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Size Variations
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Different sizes to fit various UI contexts.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-12">Small:</span>
                <LanguageSelector variant="compact" size="sm" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-12">Medium:</span>
                <LanguageSelector variant="compact" size="md" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-12">Large:</span>
                <LanguageSelector variant="compact" size="lg" />
              </div>
            </div>
          </div>

          {/* Position Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Position Options
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Dropdown alignment options for different layouts.
            </p>
            <div className="space-y-4">
              <div className="flex justify-start">
                <LanguageSelector position="left" size="sm" />
              </div>
              <div className="flex justify-center">
                <LanguageSelector position="center" size="sm" />
              </div>
              <div className="flex justify-end">
                <LanguageSelector position="right" size="sm" />
              </div>
            </div>
          </div>

          {/* Accessibility Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Accessibility Features
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Full keyboard navigation (↑↓ Enter Esc)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Screen reader compatible ARIA labels</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>High contrast focus indicators</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>RTL language support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Loading state indicators</span>
              </div>
            </div>
            <div className="mt-4">
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Component Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Flag Icons</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visual country flags for each language</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Keyboard Navigation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full keyboard accessibility support</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Loading States</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smooth loading animations during changes</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Persistence</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Remembers language preference</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">RTL Support</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Right-to-left language compatibility</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">ARIA Compliance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full accessibility standards support</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Instructions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Keyboard Navigation
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Tab</kbd> - Focus on selector</li>
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> / <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Space</kbd> - Open dropdown</li>
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑</kbd> / <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">↓</kbd> - Navigate options</li>
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> - Close dropdown</li>
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Home</kbd> / <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">End</kbd> - First/Last option</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Automatic Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>✓ Language preference saved to localStorage</li>
                <li>✓ Document language attribute updated</li>
                <li>✓ RTL/LTR direction switching</li>
                <li>✓ Loading states during transitions</li>
                <li>✓ Proper URL routing integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}