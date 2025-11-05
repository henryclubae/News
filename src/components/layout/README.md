# Footer Components Usage Guide

## Basic Usage

### 1. Import the Footer component in your layout

```tsx
import { Footer } from '@/components/layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### 2. For responsive design with both desktop and mobile footers

```tsx
import { Footer, MobileFooter } from '@/components/layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      
      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile Footer */}
      <div className="md:hidden">
        <MobileFooter />
      </div>
    </div>
  );
}
```

### 3. Using footer utilities

```tsx
import footerUtils from '@/utils/footer';
import { useEffect, useState } from 'react';

function NewsletterComponent() {
  const [email, setEmail] = useState('');
  const [isEU, setIsEU] = useState(false);

  useEffect(() => {
    setIsEU(footerUtils.isEUUser());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!footerUtils.isValidEmail(email)) {
      alert('Invalid email format');
      return;
    }

    const result = await footerUtils.subscribeToNewsletter(email, {
      categories: ['technology', 'business'],
      frequency: 'weekly',
    });

    if (result.success) {
      footerUtils.trackNewsletterSignup(true);
      alert('Successfully subscribed!');
    } else {
      footerUtils.trackNewsletterSignup(false, result.message);
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit">Subscribe</button>
      
      {isEU && (
        <p className="text-xs text-gray-500 mt-2">
          {footerUtils.getGDPRText()}
        </p>
      )}
    </form>
  );
}
```

### 4. Custom footer configuration

```tsx
// Create a custom footer with your own data
import { Footer } from '@/components/layout';

// You can customize the footer data by modifying the arrays in Footer.tsx
// or create a custom configuration:

const customFooterConfig = {
  companyName: 'Your News Site',
  socialLinks: [
    { name: 'Facebook', href: 'https://facebook.com/yoursite', icon: FacebookIcon },
    { name: 'Twitter', href: 'https://twitter.com/yoursite', icon: TwitterIcon },
  ],
  footerColumns: [
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ],
};

// Then pass it to a customized Footer component
```

### 5. Theme-aware styling (automatic with dark mode support)

```tsx
// The Footer components automatically adapt to your theme
// They use CSS custom properties that work with your ThemeProvider

// Light mode colors:
// - Background: white
// - Text: gray-900
// - Borders: gray-200

// Dark mode colors:
// - Background: gray-900
// - Text: white
// - Borders: gray-800
```

### 6. Analytics integration

```tsx
import footerUtils from '@/utils/footer';

function CustomFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleClick = () => {
    footerUtils.trackFooterClick(children as string, href);
  };

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
```

### 7. GDPR compliance features

```tsx
import { useEffect, useState } from 'react';
import footerUtils from '@/utils/footer';

function GDPRBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasConsent = footerUtils.getCookieConsent();
    const isEU = footerUtils.isEUUser();
    
    setShowBanner(isEU && !hasConsent);
  }, []);

  const acceptCookies = () => {
    footerUtils.setCookieConsent(true);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className="flex space-x-4">
          <Link href="/cookies" className="text-sm underline">
            Learn More
          </Link>
          <button onClick={acceptCookies} className="bg-white text-blue-600 px-4 py-1 rounded text-sm">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 8. Accessibility features (built-in)

- Screen reader friendly navigation
- Keyboard navigation support
- ARIA labels for all interactive elements
- Focus management
- Reduced motion support
- High contrast mode compatibility

### 9. Performance optimization

```tsx
// Footer components are optimized for performance:
// - Lazy loading of social media widgets
// - Debounced scroll event listeners
// - Memoized components where appropriate
// - Minimal re-renders

// For even better performance, you can lazy load the footer:
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  ssr: true, // Keep SSR for SEO
});
```

### 10. Internationalization support

```tsx
import { useRouter } from 'next/router';
import footerUtils from '@/utils/footer';

function InternationalFooter() {
  const router = useRouter();
  const { locale } = router;

  const copyrightText = footerUtils.getCopyrightText('Your Company');
  const formattedDate = footerUtils.formatDateForLocale(new Date(), locale);

  return (
    <footer>
      <p>{copyrightText}</p>
      <p>Last updated: {formattedDate}</p>
    </footer>
  );
}
```

## Key Features

- ✅ Responsive design (desktop + mobile variants)
- ✅ Newsletter signup with validation
- ✅ Social media integration
- ✅ GDPR compliance tools
- ✅ Language/region selection
- ✅ Dark/light theme support
- ✅ Accessibility features
- ✅ Analytics integration
- ✅ Performance optimized
- ✅ TypeScript support
- ✅ Customizable configuration

