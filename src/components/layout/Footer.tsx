'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChevronUpIcon,
  GlobeAltIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedInIcon,
  Youtube as YouTubeIcon,
  Send as TelegramIcon
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NewsletterForm {
  email: string;
  consent: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface RegionOption {
  code: string;
  name: string;
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const newsletterSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  consent: yup
    .boolean()
    .required()
    .oneOf([true], 'You must agree to receive newsletters'),
});

// ============================================================================
// FOOTER DATA
// ============================================================================

const footerColumns: FooterColumn[] = [
  {
    title: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Editorial Policy', href: '/editorial-policy' },
      { label: 'Code of Ethics', href: '/ethics' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press Kit', href: '/press' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR Compliance', href: '/gdpr' },
      { label: 'Data Protection', href: '/data-protection' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'News Tips', href: '/tips' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Partnerships', href: '/partnerships' },
      { label: 'Support', href: '/support' },
      { label: 'Feedback', href: '/feedback' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Breaking News', href: '/categories/breaking' },
      { label: 'Politics', href: '/categories/politics' },
      { label: 'Technology', href: '/categories/technology' },
      { label: 'Business', href: '/categories/business' },
      { label: 'Sports', href: '/categories/sports' },
      { label: 'Entertainment', href: '/categories/entertainment' },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { name: 'Facebook', href: 'https://facebook.com/newswebsite', icon: FacebookIcon },
  { name: 'Twitter', href: 'https://twitter.com/newswebsite', icon: TwitterIcon },
  { name: 'Instagram', href: 'https://instagram.com/newswebsite', icon: InstagramIcon },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/newswebsite', icon: LinkedInIcon },
  { name: 'YouTube', href: 'https://youtube.com/@newswebsite', icon: YouTubeIcon },
  { name: 'Telegram', href: 'https://t.me/newswebsite', icon: TelegramIcon },
];

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const regions: RegionOption[] = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'global', name: 'Global' },
];

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

export function Footer() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterForm>({
    resolver: yupResolver(newsletterSchema),
  });

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Newsletter submission
  const onNewsletterSubmit = async (data: NewsletterForm) => {
    try {
      // Simulate API call with email data
      console.log('Subscribing email:', data.email);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Successfully subscribed to newsletter!');
      setIsNewsletterSubmitted(true);
      reset();
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsNewsletterSubmitted(false), 3000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      toast.error('Failed to subscribe. Please try again.');
    }
  };

  // Monitor scroll position for scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="relative bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Brand and Newsletter Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  News Website
                </span>
              </Link>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                Your trusted source for breaking news, in-depth analysis, and comprehensive coverage of events that matter.
              </p>
            </div>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Stay Informed
              </h3>
              {!isNewsletterSubmitted ? (
                <form onSubmit={handleSubmit(onNewsletterSubmit)} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={`
                        w-full px-3 py-2 text-sm
                        bg-gray-50 dark:bg-gray-800
                        border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                        rounded-md
                        text-gray-900 dark:text-white
                        placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-colors duration-200
                      `}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="newsletter-consent"
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      {...register('consent')}
                    />
                    <label 
                      htmlFor="newsletter-consent" 
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      I agree to receive newsletters and accept the{' '}
                      <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.consent && (
                    <p className="text-xs text-red-500">{errors.consent.message}</p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      w-full px-4 py-2 text-sm font-medium text-white
                      bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                      rounded-md transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center space-x-2
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                >
                  <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Successfully subscribed!
                  </span>
                </motion.div>
              )}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Follow Us
              </h3>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-9 h-9 flex items-center justify-center
                      bg-gray-100 dark:bg-gray-800
                      text-gray-600 dark:text-gray-400
                      hover:bg-blue-100 dark:hover:bg-blue-900
                      hover:text-blue-600 dark:hover:text-blue-400
                      rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    `}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language and Region Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 border-t border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`
                  text-sm bg-transparent border-none
                  text-gray-600 dark:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
                  cursor-pointer
                `}
                aria-label="Select language"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Selector */}
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={`
                  text-sm bg-transparent border-none
                  text-gray-600 dark:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
                  cursor-pointer
                `}
                aria-label="Select region"
              >
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4 sm:mt-0">
            <a
              href="mailto:contact@newswebsite.com"
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>contact@newswebsite.com</span>
            </a>
            <a
              href="tel:+1-555-0123"
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>+1 (555) 012-3456</span>
            </a>
          </div>
        </div>

        {/* Copyright and Legal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} News Website. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/gdpr"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                GDPR Compliance
              </Link>
              <Link
                href="/accessibility"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Accessibility
              </Link>
              <Link
                href="/sitemap"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Sitemap
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Built with ❤️ using Next.js
            </span>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className={`
            fixed bottom-8 right-8 z-50
            w-12 h-12 bg-blue-600 dark:bg-blue-500
            text-white rounded-full shadow-lg
            hover:bg-blue-700 dark:hover:bg-blue-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-all duration-200
            flex items-center justify-center
          `}
          aria-label="Scroll to top"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
}

export default Footer;