import type { Metadata } from 'next';
import React from 'react';
import BusinessPlanSections from '@/components/chapters/sections/BusinessPlanSections';
import CoverPage from '@/components/document/CoverPage';
import BusinessplanPrintClient from '@/components/export/BusinessplanPrintClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Businessplan – PDF Export',
};

export default function BusinessplanExportPage() {
  const version = (process.env.NEXT_PUBLIC_APP_VERSION || process.env.npm_package_version) as string | undefined;
  return (
    <main className="mx-auto max-w-[940px] px-5 py-6 print:px-0 print:py-0">
      {/* Druck-Deckblatt (nur im Print sichtbar) */}
      <div className="hidden print:block mb-6">
        <CoverPage versionOverride={version} />
      </div>
      {/* Header & Print-Styles als Client-Komponente */}
      <BusinessplanPrintClient />

      {/* Inhalt in druckoptimierter Breite */}
      <article className="printing reading-max">
        <BusinessPlanSections />
      </article>

    </main>
  );
}
