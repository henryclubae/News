import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '../i18n/request';

// Define routing configuration
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Enable locale detection and automatic redirects
  localeDetection: true,
  
  // Configure pathnames for each locale
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      es: '/acerca-de',
      fr: '/a-propos',
      de: '/ueber-uns',
      zh: '/guanyu',
      ar: '/hawl',
    },
    '/contact': {
      en: '/contact',
      es: '/contacto',
      fr: '/contact',
      de: '/kontakt',
      zh: '/lianxi',
      ar: '/ittisaal',
    },
    '/news': {
      en: '/news',
      es: '/noticias',
      fr: '/actualites',
      de: '/nachrichten',
      zh: '/xinwen',
      ar: '/akhbaar',
    },
    '/news/[slug]': {
      en: '/news/[slug]',
      es: '/noticias/[slug]',
      fr: '/actualites/[slug]',
      de: '/nachrichten/[slug]',
      zh: '/xinwen/[slug]',
      ar: '/akhbaar/[slug]',
    },
    '/categories': {
      en: '/categories',
      es: '/categorias',
      fr: '/categories',
      de: '/kategorien',
      zh: '/fenlei',
      ar: '/tassanif',
    },
    '/search': {
      en: '/search',
      es: '/buscar',
      fr: '/recherche',
      de: '/suche',
      zh: '/sousuo',
      ar: '/bahth',
    },
  },
});

// Create navigation functions
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

// Export the routing type for use in middleware
export type Pathnames = keyof typeof routing.pathnames;