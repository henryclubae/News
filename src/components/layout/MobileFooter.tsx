'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedInIcon,
  Youtube as YouTubeIcon,
  Send as TelegramIcon
} from 'lucide-react';

// ============================================================================
// MOBILE FOOTER COMPONENT
// ============================================================================

interface MobileFooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
}

const mobileFooterSections: MobileFooterSection[] = [
  {
    title: 'News Categories',
    links: [
      { label: 'Breaking News', href: '/categories/breaking' },
      { label: 'Politics', href: '/categories/politics' },
      { label: 'Technology', href: '/categories/technology' },
      { label: 'Business', href: '/categories/business' },
      { label: 'Sports', href: '/categories/sports' },
      { label: 'Entertainment', href: '/categories/entertainment' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Press Kit', href: '/press' },
    ],
  },
  {
    title: 'Legal & Privacy',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR Compliance', href: '/gdpr' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/newswebsite', icon: FacebookIcon },
  { name: 'Twitter', href: 'https://twitter.com/newswebsite', icon: TwitterIcon },
  { name: 'Instagram', href: 'https://instagram.com/newswebsite', icon: InstagramIcon },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/newswebsite', icon: LinkedInIcon },
  { name: 'YouTube', href: 'https://youtube.com/@newswebsite', icon: YouTubeIcon },
  { name: 'Telegram', href: 'https://t.me/newswebsite', icon: TelegramIcon },
];

export function MobileFooter() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Monitor scroll for scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      {/* Brand Section */}
      <div className="px-4 pt-8 pb-4">
        <Link href="/" className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            News Website
          </span>
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Your trusted source for breaking news and comprehensive coverage.
        </p>

        {/* Newsletter CTA */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-2">
            <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Stay Updated</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Get the latest news delivered to your inbox
          </p>
          <Link
            href="/newsletter"
            className="inline-block w-full text-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Subscribe Now
          </Link>
        </div>

        {/* Social Links */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Follow Us
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200"
                aria-label={`Follow us on ${social.name}`}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        {mobileFooterSections.map((section) => (
          <div key={section.title} className="border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-4 py-4 text-left focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 transition-colors duration-200"
              aria-expanded={expandedSection === section.title}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {section.title}
              </span>
              {expandedSection === section.title ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSection === section.title && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 gap-2">
                      {section.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="px-4 py-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            © {new Date().getFullYear()} News Website. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              Terms
            </Link>
            <Link href="/cookies" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              Cookies
            </Link>
            <Link href="/accessibility" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              Accessibility
            </Link>
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
          className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
}

export default MobileFooter;