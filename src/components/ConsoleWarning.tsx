'use client';

import { useEffect } from 'react';

export default function ConsoleWarning() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Only show in production
    if (process.env.NODE_ENV !== 'production') return;

    // Clear console first for better visibility
    console.clear();

    // Main warning with large red text
    console.log(
      '%c⚠️ STOJ! / STOP!',
      'color: red; font-size: 48px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
    );

    console.log(
      '%cOvo je funkcija pretraživača namenjena ISKLJUČIVO programerima.',
      'color: #ff6b6b; font-size: 18px; font-weight: bold; margin-top: 10px;'
    );

    console.log(
      '%cAko vam je neko rekao da ovde nešto prekopirate kako biste dobili "besplatne pakete" ili hakovali sistem, znajte da je to PREVARA (Self-XSS Napad).',
      'color: #ff8787; font-size: 16px; margin-top: 10px; line-height: 1.5;'
    );

    console.log(
      '%cKopiranjem koda ovde, dajete napadačima pristup vašim podacima i vašem nalogu!',
      'color: #ff4757; font-size: 16px; font-weight: bold; margin-top: 10px; background: #fff3cd; padding: 5px;'
    );

    console.log(
      '%cNijedan administrator Apartmani Jovča portala od vas nikada neće tražiti da kucate bilo šta u konzoli.',
      'color: #2d3436; font-size: 14px; margin-top: 10px;'
    );

    console.log(
      '%cBezbednost sistema: Apartmani Jovča koristi naprednu serversku zaštitu. Svaki pokušaj "hacovanja" kroz konzolu je beskoristan jer se svi podaci čuvaju na bezbednim serverima, a svaki neovlašćeni pristup se beleži i automatski prijavljuje.',
      'color: #0984e3; font-size: 14px; margin-top: 10px; font-style: italic; line-height: 1.5;'
    );

    console.log(
      '%c\n🔒 Zaštićeno Supabase & Vercel Security',
      'color: #00b894; font-size: 12px; font-weight: bold; margin-top: 15px;'
    );

    // Add a separator
    console.log(
      '%c' + '='.repeat(80),
      'color: #dfe6e9; font-size: 12px;'
    );
  }, []);

  return null; // This component doesn't render anything
}
