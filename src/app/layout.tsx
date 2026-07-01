import type { Metadata } from "next";
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import AnalyticsTracker from '../components/AnalyticsTracker';
import FloatingCTA from '../components/FloatingCTA';
import StickyMobileCTA from '../components/StickyMobileCTA';
import ConsoleWarning from '../components/ConsoleWarning';
import { PRODUCTION_URL } from '@/lib/seo/config';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: "Apartmani Jovča - Smeštaj na Bovanskom jezeru",
  description: "Rezervišite Apartmane Jovča na Bovanskom jezeru u Bovanu. Udoban smeštaj uz jezero, privatna plaža, WiFi, parking i priroda za porodični odmor.",
  manifest: '/manifest.json',
  robots: 'index, follow',
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'U2dHUuIHtydSsidi8IPlFvYcduPcf2Q09aFK94gcU-U',
  },
  other: {
    'scanner-verify': '2973615e8fe6a66e02ab7c3bc492dff9',
  },
  openGraph: {
    title: "Apartmani Jovča - Smeštaj na Bovanskom jezeru",
    description: "Rezervišite Apartmane Jovča na Bovanskom jezeru u Bovanu. Udoban smeštaj uz jezero, privatna plaža, WiFi, parking i priroda za porodični odmor.",
    type: 'website',
    url: PRODUCTION_URL,
    images: ['/images/logo2.png'],
  },
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning style={{ colorScheme: 'light' }} className={inter.variable}>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        )}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        className="antialiased bg-transparent"
        style={{ colorScheme: 'light' }}
      >
        {/* Global fixed background — next/image serves AVIF/WebP, resized + cached on Vercel */}
        <div aria-hidden className="fixed inset-0 -z-10">
          <Image
            src="/images/background.jpg"
            alt=""
            fill
            priority
            quality={70}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ConsoleWarning />
          {children}
          {/* <PWAInstall /> */}
          <AnalyticsTracker />
          <FloatingCTA />
          <StickyMobileCTA />
        </ThemeProvider>
      </body>
    </html>
  );
}

// export default appWithTranslation(RootLayout);

export default RootLayout;
