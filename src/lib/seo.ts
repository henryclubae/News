import { type Locale, locales, localeConfig, defaultLocale } from '../i18n/request';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  locale: Locale;
}

/**
 * Generate hreflang links for multilingual SEO
 */
export function generateHreflangLinks(
  pathname: string,
  baseUrl: string
): Array<{ hreflang: string; href: string }> {
  const hreflangLinks: Array<{ hreflang: string; href: string }> = [];

  // Add links for each locale
  locales.forEach((locale) => {
    const localizedPath = locale === defaultLocale 
      ? pathname 
      : `/${locale}${pathname}`;
    
    hreflangLinks.push({
      hreflang: locale === 'zh' ? 'zh-CN' : locale,
      href: `${baseUrl}${localizedPath}`,
    });
  });

  // Add x-default for the default locale
  hreflangLinks.push({
    hreflang: 'x-default',
    href: `${baseUrl}${pathname}`,
  });

  return hreflangLinks;
}

/**
 * Generate structured data for articles with multilingual support
 */
export function generateArticleStructuredData(
  article: {
    title: string;
    description: string;
    content: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    image?: string;
    url: string;
  },
  locale: Locale,
  baseUrl: string
) {
  // const config = localeConfig[locale]; // Reserved for future use
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    articleBody: article.content,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Global News Hub',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    image: article.image ? {
      '@type': 'ImageObject',
      url: article.image,
    } : undefined,
    url: article.url,
    inLanguage: locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: `${baseUrl}${breadcrumb.url}`,
    })),
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(baseUrl: string, locale: Locale) {
  const config = localeConfig[locale];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Global News Hub',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description: 'Your trusted source for comprehensive world news coverage',
    sameAs: [
      'https://twitter.com/globalnewshub',
      'https://facebook.com/globalnewshub',
      'https://linkedin.com/company/globalnewshub',
    ],
    inLanguage: locale,
    address: {
      '@type': 'PostalAddress',
      addressCountry: config.currency === 'USD' ? 'US' : 'Global',
    },
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData(baseUrl: string, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Global News Hub',
    url: baseUrl,
    description: 'Stay informed with breaking news, in-depth analysis, and comprehensive coverage from around the globe.',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate meta tags for SEO
 */
export function generateMetaTags(config: SEOConfig, baseUrl: string) {
  // const localeConfig_ = localeConfig[config.locale]; // Reserved for future use
  
  const metaTags = [
    // Basic meta tags
    { name: 'description', content: config.description },
    { name: 'keywords', content: config.keywords || '' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: config.locale },
    
    // Open Graph tags
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:type', content: config.ogType || 'website' },
    { property: 'og:locale', content: config.locale },
    { property: 'og:site_name', content: 'Global News Hub' },
    
    // Twitter Card tags
    { name: 'twitter:card', content: config.twitterCard || 'summary_large_image' },
    { name: 'twitter:title', content: config.title },
    { name: 'twitter:description', content: config.description },
    { name: 'twitter:site', content: '@globalnewshub' },
    
    // Article-specific tags
    ...(config.publishedTime ? [{ property: 'article:published_time', content: config.publishedTime }] : []),
    ...(config.modifiedTime ? [{ property: 'article:modified_time', content: config.modifiedTime }] : []),
    ...(config.authors ? config.authors.map(author => ({ property: 'article:author', content: author })) : []),
    
    // Alternate language tags
    ...locales.map(locale => ({
      rel: 'alternate',
      hreflang: locale === 'zh' ? 'zh-CN' : locale,
      href: `${baseUrl}/${locale}${config.canonical || ''}`,
    })),
  ];

  // Add image tags if provided
  if (config.ogImage) {
    metaTags.push(
      { property: 'og:image', content: config.ogImage },
      { name: 'twitter:image', content: config.ogImage }
    );
  }

  // Note: Canonical URL is handled separately in Next.js Head component

  return metaTags;
}

/**
 * Generate sitemap URLs for all locales
 */
export function generateSitemapUrls(
  pages: Array<{ path: string; lastmod?: string; priority?: number }>,
  baseUrl: string
): Array<{
  url: string;
  lastmod?: string;
  priority?: number;
  alternates?: Array<{ hreflang: string; href: string }>;
}> {
  return pages.flatMap(page => {
    return locales.map(locale => {
      const localizedPath = locale === defaultLocale 
        ? page.path 
        : `/${locale}${page.path}`;
      
      return {
        url: `${baseUrl}${localizedPath}`,
        lastmod: page.lastmod,
        priority: page.priority,
        alternates: generateHreflangLinks(page.path, baseUrl),
      };
    });
  });
}

/**
 * Get locale-specific meta title and description templates
 */
export function getLocalizedMetaTemplates(locale: Locale) {
  const templates = {
    en: {
      titleTemplate: '%s | Global News Hub',
      defaultTitle: 'Global News Hub - World News Coverage',
      defaultDescription: 'Stay informed with breaking news, in-depth analysis, and comprehensive coverage from around the globe. Your trusted source for world news.',
    },
    es: {
      titleTemplate: '%s | Centro Global de Noticias',
      defaultTitle: 'Centro Global de Noticias - Cobertura de Noticias Mundiales',
      defaultDescription: 'Mantente informado con noticias de última hora, análisis detallado y cobertura integral de todo el mundo. Tu fuente confiable para noticias mundiales.',
    },
    fr: {
      titleTemplate: '%s | Centre d\'Actualités Global',
      defaultTitle: 'Centre d\'Actualités Global - Couverture des Actualités Mondiales',
      defaultDescription: 'Restez informé avec les dernières nouvelles, analyses approfondies et couverture complète du monde entier. Votre source fiable pour les actualités mondiales.',
    },
    de: {
      titleTemplate: '%s | Globales Nachrichtenzentrum',
      defaultTitle: 'Globales Nachrichtenzentrum - Weltweite Nachrichtenberichterstattung',
      defaultDescription: 'Bleiben Sie informiert mit aktuellen Nachrichten, tiefgreifenden Analysen und umfassender Berichterstattung aus der ganzen Welt. Ihre vertrauenswürdige Quelle für Weltnachrichten.',
    },
    zh: {
      titleTemplate: '%s | 全球新闻中心',
      defaultTitle: '全球新闻中心 - 世界新闻报道',
      defaultDescription: '通过来自全球的突发新闻、深度分析和全面报道保持信息畅通。您值得信赖的世界新闻来源。',
    },
    ar: {
      titleTemplate: '%s | مركز الأخبار العالمي',
      defaultTitle: 'مركز الأخبار العالمي - تغطية الأخبار العالمية',
      defaultDescription: 'ابق على اطلاع بأحدث الأخبار والتحليلات المتعمقة والتغطية الشاملة من جميع أنحاء العالم. مصدرك الموثوق للأخبار العالمية.',
    },
  };

  return templates[locale] || templates.en;
}