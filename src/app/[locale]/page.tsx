
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { type Locale } from '../../i18n/request';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { formatDate, formatRelativeTime, formatCurrency } from '../../lib/formatting';

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: t('defaultTitle'),
    description: t('defaultDescription'),
    keywords: t('keywords'),
    openGraph: {
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle'),
      description: t('defaultDescription'),
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'zh': '/zh',
        'ar': '/ar',
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'homepage' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Sample data to demonstrate formatting (using static dates for SSG compatibility)
  const sampleDate = new Date('2024-01-15T10:30:00Z');
  const samplePrice = 1234.56;


  // Sample news articles with static dates
  const sampleArticles = [
    {
      id: 1,
      title: t('categories.politics'),
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      publishedAt: new Date('2024-01-20T10:00:00Z'), // 2 hours before baseTime
      category: 'politics',
      image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: t('categories.technology'),
      excerpt: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      publishedAt: new Date('2024-01-20T06:00:00Z'), // 6 hours before baseTime
      category: 'technology',
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: t('categories.sports'),
      excerpt: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
      publishedAt: new Date('2024-01-19T12:00:00Z'), // 1 day before baseTime
      category: 'sports',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('description')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Internationalization Demo Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Internationalization Demo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Date Formatting:</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {formatDate(sampleDate, locale)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {formatRelativeTime(sampleDate, locale)}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Currency Formatting:</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {formatCurrency(samplePrice, locale)}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Current Locale:</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {locale.toUpperCase()}
              </p>
            </div>
          </div>
        </section>

        {/* Enhanced Language Selector Demo */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Enhanced Language Selector
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Demonstration of advanced language selection components with different variants and features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Dropdown:</h3>
              <LanguageSelector 
                variant="dropdown" 
                showLabel={true} 
                showFlag={true}
                size="sm"
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Compact:</h3>
              <LanguageSelector 
                variant="compact" 
                showFlag={true}
                size="sm"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Expanded:</h3>
              <LanguageSelector 
                variant="expanded" 
                showFlag={true} 
                showLabel={false}
                size="sm"
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Features:</strong> Keyboard navigation, loading states, preference persistence, 
              RTL support, ARIA compliance, and multiple size/position options.
            </p>
          </div>
        </section>

        {/* Featured News Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('featuredNews')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleArticles.map((article) => (
              <article key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t(`categories.${article.category}`)}
                    </span>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(article.publishedAt, locale)}
                    </time>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                    {tCommon('readMore')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('categories.politics')} & {tCommon('categories')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries({
              politics: 'politics',
              business: 'business',
              technology: 'technology',
              sports: 'sports',
              entertainment: 'entertainment',
              health: 'health',
              science: 'science',
              world: 'world',
            }).map(([key, value]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t(`categories.${value}`)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Breaking News Banner */}
        <section className="bg-red-600 text-white rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-2 py-1 rounded text-xs font-bold mr-3">
              {t('breakingNews')}
            </span>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </div>
        </section>

        {/* Trending Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('trending')}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {item}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Sample trending news headline #{item}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item === 1 && '2 hours ago'}
                        {item === 2 && '4 hours ago'}
                        {item === 3 && '6 hours ago'}
                        {item === 4 && '8 hours ago'}
                        {item === 5 && '1 day ago'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              © 2024 Global News Hub. {tCommon('readMore')}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}