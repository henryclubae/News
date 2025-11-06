import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsent } from "@/components/consent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "News Website",
  description: "Your comprehensive source for breaking news and global coverage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-528699TFSJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-528699TFSJ');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AnalyticsProvider
          config={{
            ga4_measurement_id: 'G-528699TFSJ',
            enable_performance_monitoring: true,
            enable_error_tracking: true,
            enable_user_behavior: true,
            privacy_mode: false,
            debug_mode: process.env.NODE_ENV === 'development'
          }}
        >
          <ThemeProvider>
            {children}
            <CookieConsent />
          </ThemeProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
