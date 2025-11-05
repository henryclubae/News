# Internationalization (i18n) Setup Documentation

## Overview

This project implements comprehensive internationalization support with 6 languages, RTL support, and locale-specific formatting using Next.js 15 and next-intl.

## Supported Languages

| Language | Code | Direction | Currency | Native Name |
|----------|------|-----------|----------|-------------|
| English  | `en` | LTR       | USD      | English     |
| Spanish  | `es` | LTR       | EUR      | Español     |
| French   | `fr` | LTR       | EUR      | Français    |
| German   | `de` | LTR       | EUR      | Deutsch     |
| Chinese  | `zh` | LTR       | CNY      | 中文        |
| Arabic   | `ar` | RTL       | SAR      | العربية    |

## Project Structure

```
src/
├── i18n/
│   └── request.ts          # Next-intl configuration
├── lib/
│   ├── routing.ts          # Routing configuration
│   ├── formatting.ts       # Locale-specific formatting utilities
│   └── seo.ts             # SEO helpers for multilingual sites
├── messages/
│   ├── en.json            # English translations
│   ├── es.json            # Spanish translations
│   ├── fr.json            # French translations
│   ├── de.json            # German translations
│   ├── zh.json            # Chinese translations
│   └── ar.json            # Arabic translations
├── components/
│   └── LanguageSwitcher.tsx # Language switching component
├── styles/
│   └── rtl.css            # RTL-specific styles
└── app/
    └── [locale]/          # Locale-based routing
        ├── layout.tsx     # Locale layout with RTL support
        └── page.tsx       # Homepage with i18n demo
```

## Key Features

### 1. Locale Detection and Routing

- Automatic locale detection based on browser preferences
- URL-based routing: `/en/news`, `/es/noticias`, `/ar/akhbaar`
- Localized pathnames for better SEO
- Default locale (`en`) without prefix

### 2. Translation Management

#### Adding New Translations

1. Add new keys to all translation files in `src/messages/`
2. Follow the hierarchical structure:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "homepage": {
    "title": "Latest World News",
    "categories": {
      "politics": "Politics",
      "business": "Business"
    }
  }
}
```

#### Using Translations in Components

**Server Components:**
```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'homepage' });
  
  return <h1>{t('title')}</h1>;
}
```

**Client Components:**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('common');
  
  return <button>{t('loading')}</button>;
}
```

### 3. RTL Support

Arabic language includes full RTL (Right-to-Left) support:

- Automatic text direction detection
- RTL-specific CSS classes in `src/styles/rtl.css`
- Mirrored layouts and icons
- Proper text alignment

#### RTL Usage Example

```tsx
import { isRtlLocale } from '../i18n/request';

<div className={isRtlLocale(locale) ? 'text-right' : 'text-left'}>
  Content that respects text direction
</div>
```

### 4. Locale-Specific Formatting

#### Date Formatting
```tsx
import { formatDate, formatRelativeTime } from '../lib/formatting';

// Format date according to locale
const formattedDate = formatDate(new Date(), locale);
// "January 15, 2024" (en) | "15 janvier 2024" (fr)

// Relative time
const relativeTime = formatRelativeTime(date, locale);
// "2 hours ago" (en) | "منذ ساعتين" (ar)
```

#### Currency Formatting
```tsx
import { formatCurrency } from '../lib/formatting';

const price = formatCurrency(1234.56, locale);
// "$1,234.56" (en) | "1 234,56 €" (fr) | "1,234.56 ر.س" (ar)
```

#### Number Formatting
```tsx
import { formatNumber, formatPercentage } from '../lib/formatting';

const number = formatNumber(1234567, locale);
// "1,234,567" (en) | "1.234.567" (de) | "1,234,567" (zh)

const percentage = formatPercentage(85.5, locale);
// "85.5%" (en) | "85,5%" (fr)
```

### 5. SEO Optimization

#### Hreflang Tags
```tsx
import { generateHreflangLinks } from '../lib/seo';

const hreflangs = generateHreflangLinks('/news', 'https://example.com');
// Generates proper hreflang links for all locales
```

#### Structured Data
```tsx
import { generateArticleStructuredData } from '../lib/seo';

const structuredData = generateArticleStructuredData(article, locale, baseUrl);
// Creates JSON-LD for multilingual articles
```

#### Meta Tags
```tsx
import { generateMetaTags } from '../lib/seo';

const metaTags = generateMetaTags({
  title: 'Article Title',
  description: 'Article description',
  locale: 'en',
  canonical: '/news/article-slug'
}, baseUrl);
```

### 6. Language Switcher Component

```tsx
import LanguageSwitcher from '../components/LanguageSwitcher';

// Dropdown variant (default)
<LanguageSwitcher />

// Inline variant
<LanguageSwitcher variant="inline" />

// Without labels
<LanguageSwitcher showLabel={false} />
```

## Configuration

### Next.js Configuration

The `next.config.mjs` file includes:
- Next-intl plugin integration
- Image optimization for remote patterns
- Proper headers for security
- Webpack optimization

### Middleware

The `middleware.ts` file handles:
- Automatic locale detection
- URL rewriting for localized routes
- Language negotiation

## Development Workflow

### Adding a New Language

1. **Add locale to configuration:**
```tsx
// src/i18n/request.ts
export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ar', 'new-lang'] as const;

export const localeConfig = {
  // ... existing configs
  'new-lang': {
    name: 'New Language',
    nativeName: 'Native Name',
    flag: '🏳️',
    direction: 'ltr' as const,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h' as const,
    currency: 'USD',
    numberFormat: 'en-US',
  },
};
```

2. **Create translation file:**
```bash
cp src/messages/en.json src/messages/new-lang.json
```

3. **Translate all strings** in the new file

4. **Add to routing configuration:**
```tsx
// src/lib/routing.ts
pathnames: {
  '/about': {
    // ... existing
    'new-lang': '/about-new-lang',
  },
}
```

5. **Update middleware matcher:**
```tsx
// middleware.ts
matcher: ['/', '/(de|en|es|fr|zh|ar|new-lang)/:path*']
```

### Testing Localization

1. **Build the project:**
```bash
npm run build
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Test all locale URLs:**
- `http://localhost:3000/` (redirects to default locale)
- `http://localhost:3000/en`
- `http://localhost:3000/es`
- `http://localhost:3000/fr`
- `http://localhost:3000/de`
- `http://localhost:3000/zh`
- `http://localhost:3000/ar` (RTL layout)

## Production Deployment

### Environment Variables

No additional environment variables are required for basic i18n functionality.

### Build Verification

The build process will:
- Pre-render all locale routes
- Validate translation files
- Generate static pages for each locale
- Optimize bundles per locale

### SEO Considerations

1. **Sitemap Generation:** Include all locale variants
2. **Robots.txt:** Allow all localized paths
3. **Canonical URLs:** Set proper canonical tags
4. **Hreflang Tags:** Include x-default for default locale

## Troubleshooting

### Common Issues

1. **Translation Key Missing:**
   - Error: `Translation key not found`
   - Solution: Check if key exists in all translation files

2. **RTL Layout Issues:**
   - Problem: Arabic text not displaying RTL
   - Solution: Ensure `dir="rtl"` attribute is set on `<html>` tag

3. **Date Formatting Errors:**
   - Error: `Invalid date format`
   - Solution: Check locale configuration in `localeConfig`

4. **Build Failures:**
   - Error: TypeScript errors with locale types
   - Solution: Ensure all imports use correct paths after file restructuring

### Performance Optimization

1. **Bundle Splitting:** Translations are loaded per route
2. **Static Generation:** All locales are pre-rendered at build time
3. **Image Optimization:** Use Next.js Image component with proper remote patterns
4. **Code Splitting:** Locale-specific code is automatically split

## Browser Support

- **Modern Browsers:** Full support for all features
- **Legacy Browsers:** Basic internationalization support
- **Screen Readers:** Full accessibility with proper ARIA labels
- **Mobile Devices:** Responsive design with locale-aware touch interactions

## Next Steps

1. **Add more languages** as needed
2. **Implement locale-specific content** (news sources, etc.)
3. **Set up translation management system** (like Crowdin or Phrase)
4. **Add locale-specific analytics** tracking
5. **Implement user preference persistence** in localStorage/cookies