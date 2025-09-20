import type { ReactNode } from 'react';
import { chapters } from './chapters.config';
import BusinessPlanSections from '@components/chapters/sections/BusinessPlanSections';
import CoverPage from '@/components/document/CoverPage';
import ClosingPage from '@/components/document/ClosingPage';
import PrintTOC from '@/components/document/PrintTOC';
import CompactChapterNav from '@/components/chapters/CompactChapterNav';
import HashScroll from '@/components/navigation/HashScroll';
import AutoAnchors from '@/components/navigation/AutoAnchors';

export default async function ChaptersLayout(props: any) {
  const children: ReactNode = props?.children;
  const params = props?.params;
  const rawParams: any = (params && typeof params.then === 'function') ? await params : params;
  const chapterId = rawParams?.chapterId;
  const current = Number(chapterId);
  const currentChapter = !Number.isNaN(current) && current > 0 ? current : 1;

  return (
    <section className="container-gutter py-6 chapters-root" aria-labelledby="chapters-heading" role="region">
      <h2 id="chapters-heading" className="sr-only">Kapitelinhalt</h2>
      {/* Pixelgenaues Scrollen zu Hash-Ankern (berücksichtigt Header-Offset) */}
      <HashScroll headerOffset={56} />
      {/* Ergänzt fehlende #id-Anker automatisch basierend auf chapters.config */}
      <AutoAnchors chapterId={currentChapter} />

      {/* Layout-Hintergrund (nur Screen): subtiler Brand-Gradient */}
      <div className="relative">
        {/* Entfernt: optisches Hintergrund-Grid */}

        {/* Layout: links kompakte Vertikal-Navigation (Desktop), oben horizontale Variante (Mobile) */}
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Links (nur Desktop): Vertikale, dezente, sticky Navigation */}
          <aside className="hidden lg:block lg:w-64 lg:shrink-0" aria-label="Kapitel-Menü">
            <CompactChapterNav currentChapter={currentChapter} orientation="vertical" />
          </aside>

          {/* Rechts: Inhalt mit mobiler Top-Navigation */}
          <div className="min-w-0 flex-1 rounded-xl">
            {/* Mobile Top-Nav */}
            <div className="lg:hidden">
              <CompactChapterNav currentChapter={currentChapter} orientation="horizontal" />
            </div>

            {/* Seiteninhalt – Fortschritt und Navigation kommen aus ChapterShell */}
            <section className="mt-4 lg:mt-0" aria-label={`Kapitel ${currentChapter}`}>
              {children}
            </section>
          </div>
        </div>
      </div>

      {/* Versteckte Print-Quelle (nur im Druck sichtbar) – ans Ende verschoben, damit sichtbarer H1 zuerst im DOM steht */}
      <div
        id="print-source"
        data-testid="print-source"
        className="hidden print:block"
      >
        <div className="print-cover">
          <CoverPage />
        </div>
        {/* Print watermark */}
        <div className="print-watermark" aria-hidden>
          <span>VERTRAULICH</span>
        </div>
        {/* Print Table of Contents */}
        <PrintTOC
          title="Inhalt"
          items={chapters.map(c => ({ id: c.slug, title: c.title }))}
        />
        <div className="business-plan-content">
          <BusinessPlanSections />
        </div>
        <ClosingPage />
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  return chapters.map((_, index) => ({
    chapterId: String(index + 1)
  }));
}
