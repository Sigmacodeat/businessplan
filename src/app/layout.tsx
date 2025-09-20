// Globale Styles bleiben hier importiert
import "./globals.css";
import './print.css';

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { getMessages, type SupportedLocale } from '@/i18n/messages';
import { getLocale } from 'next-intl/server';
import I18nProvider from '@/i18n/I18nProvider';
import ClientLayout from '@/app/ClientLayout';
import Script from 'next/script';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: false
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: false
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    template: '%s | Business Plan',
    default: 'Business Plan'
  },
  description: 'Business Plan Application',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Business Plan',
    description: 'Business Plan Application',
    url: '/',
    siteName: 'Business Plan',
    locale: 'de_DE',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Plan',
    description: 'Business Plan Application',
    creator: '@yourtwitter'
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true
    }
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Locale wird zentral über next-intl Middleware/Router bestimmt
  // Verlasse dich ausschließlich auf getLocale(), um Überschreibungen zu vermeiden
  const cookieStore = await cookies();
  const detected = await (async () => { try { return await getLocale(); } catch { return 'de'; } })();
  const normalizedLocale = (detected === 'en' ? 'en' : 'de') as SupportedLocale;
  const messages = await getMessages(normalizedLocale);

  // SSR-Theme per Cookie (mehrere Keys unterstützen)
  const themeCookie = cookieStore.get('theme')?.value
    || cookieStore.get('NEXT_THEME')?.value
    || cookieStore.get('next-theme')?.value;
  const theme = themeCookie === 'dark' ? 'dark' : (themeCookie === 'light' ? 'light' : 'light');

  return (
    <html lang={normalizedLocale} data-theme={theme} className={theme} suppressHydrationWarning>
      <head>
        <Script id="init-theme" strategy="beforeInteractive">
          {`
            (function(){
              try {
                var ls = window.localStorage;
                var t = ls.getItem('theme');
                if (t === 'dark' || t === 'light') {
                  document.documentElement.setAttribute('data-theme', t);
                  document.documentElement.classList.remove('light','dark');
                  document.documentElement.classList.add(t);
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProvider locale={normalizedLocale} messages={messages} timeZone="Europe/Berlin">
          <ClientLayout initialTheme={theme as 'light' | 'dark'}>
            {children}
          </ClientLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
