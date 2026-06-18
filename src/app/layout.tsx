import type { Metadata } from "next";
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
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'YIGD6gW3_j4Io_M_YNs3mZAJ9AQlKMc4e0cwNBcVaWM',
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
        {/* Global fixed background — replicates Astro .fixed-background pattern */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat md:bg-fixed"
          style={{ backgroundImage: "url('/images/background.jpg')" }}
        />
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
