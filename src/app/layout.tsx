import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from 'next-themes';
// import PWAInstall from '../components/PWAInstall';
import AnalyticsTracker from '../components/AnalyticsTracker';
import FloatingCTA from '../components/FloatingCTA';
import StickyMobileCTA from '../components/StickyMobileCTA';
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Apartmani Jovča",
  description: "Beautiful apartments in Jovča - Your perfect vacation destination",
  manifest: '/manifest.json',
  robots: 'index, follow',
  openGraph: {
    title: "Apartmani Jovča",
    description: "Beautiful apartments in Jovča - Your perfect vacation destination",
    type: 'website',
  },
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
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
