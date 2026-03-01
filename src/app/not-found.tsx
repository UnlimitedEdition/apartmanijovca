'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Building2, MapPin, Phone, MessageCircle, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [locale, setLocale] = useState('sr');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    // Detect locale from URL or default to 'sr'
    const path = window.location.pathname;
    const detectedLocale = path.split('/')[1];
    const validLocales = ['sr', 'en', 'de', 'it'];
    const finalLocale = validLocales.includes(detectedLocale) ? detectedLocale : 'sr';
    setLocale(finalLocale);

    // Load translations - use relative path for dynamic imports
    import(`../../messages/${finalLocale}.json`).then((mod) => {
      setMessages(mod.default);
    });
  }, []);

  if (!messages) {
    return null; // Loading state
  }

  const t = messages.notFound;
  const common = messages.common;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Animated 404 with Search Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-[120px] md:text-[180px] font-bold text-blue-100 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 md:w-24 md:h-24 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Go Back Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.goBack}
          </button>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
            {t.quickLinksTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/${locale}`}
              className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.quickLinks.home}</h4>
                <p className="text-sm text-gray-600">{t.quickLinks.homeDesc}</p>
              </div>
            </Link>

            <Link
              href={`/${locale}/apartments`}
              className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.quickLinks.apartments}</h4>
                <p className="text-sm text-gray-600">{t.quickLinks.apartmentsDesc}</p>
              </div>
            </Link>

            <Link
              href={`/${locale}/location`}
              className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.quickLinks.location}</h4>
                <p className="text-sm text-gray-600">{t.quickLinks.locationDesc}</p>
              </div>
            </Link>

            <Link
              href={`/${locale}/contact`}
              className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.quickLinks.contact}</h4>
                <p className="text-sm text-gray-600">{t.quickLinks.contactDesc}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
