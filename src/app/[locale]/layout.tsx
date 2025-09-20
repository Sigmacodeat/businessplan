import { setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  // Unterstützt sowohl Promise- als auch Objekt-Form, je nach Next.js Typauflösung
  params: any;
}) {
  const resolved = params && typeof params.then === 'function' ? await params : params;
  const l = resolved?.locale === 'en' ? 'en' : 'de';
  setRequestLocale(l);
  return children;
}

export function generateStaticParams() {
  return [{ locale: 'de' }, { locale: 'en' }];
}
