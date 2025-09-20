import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import Link from 'next/link';
import SectionCard from '@components/chapters/SectionCard';
import { NumberedList, NumberedItem } from '@components/chapters/NumberedList';
// Icons entfernt – aktuell nicht genutzt

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'impact')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function ImpactPage() {
  const t = await getTranslations('bp');
  const locale = await getLocale();
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'impact')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${t('sections.impact')}`;
  const { content } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const isDe = locale.startsWith('de');
  const intro = (content?.impact?.intro as string[] | undefined) ?? [];
  const economic = (content?.impact?.economic as string[] | undefined) ?? [];
  const environmental = (content?.impact?.environmental as string[] | undefined) ?? [];
  const policy = (content?.impact?.policy as string[] | undefined) ?? [];
  const societal = (content?.impact?.societal as string[] | undefined) ?? [];
  const sustainability = (content?.impact?.sustainability as string[] | undefined) ?? [];

  // Einheitliche Unterkapitel-Nummerierung (wie in team/risks)
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;

  // Compact KPI badges (state-of-the-art, measurable targets)
  // Hinweis: KPI-Badges am Kapitelanfang wurden entfernt

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>


        {intro.length > 0 && (
          <InViewFade as="section" delay={0.02}>
            <SectionCard className="mb-3 md:mb-4">
              {(() => {
                const sec = sub();
                return (
                  <>
                    <h3 className="not-prose text-body-sm font-medium mb-1 text-[--color-foreground]">{`${sec} – ${isDe ? 'Einführung' : 'Introduction'}`}</h3>
                    <NumberedList>
                      {intro.map((x, i) => {
                        const raw = String(x ?? '');
                        const idx = raw.indexOf(':');
                        const title = idx > -1 ? raw.slice(0, idx).trim() : '';
                        const desc = idx > -1 ? raw.slice(idx + 1).trim() : raw;
                        return (
                          <NumberedItem
                            key={i}
                            num={`${sec}.${i + 1}`}
                            {...(title ? { title } : {})}
                          >
                            {desc}
                          </NumberedItem>
                        );
                      })}
                    </NumberedList>
                  </>
                );
              })()}
            </SectionCard>
          </InViewFade>
        )}

        {economic.length > 0 && (
          <InViewFade as="section" delay={0.04}>
            {(() => {
              const sec = sub();
              return (
                <div className="not-prose mb-3 md:mb-4">
                  <NumberedList>
                    {economic.map((x, i) => {
                      const raw = String(x ?? '');
                      const idx = raw.indexOf(':');
                      const title = idx > -1 ? raw.slice(0, idx).trim() : '';
                      const desc = idx > -1 ? raw.slice(idx + 1).trim() : raw;
                      return (
                        <NumberedItem
                          key={i}
                          num={`${sec}.${i + 1}`}
                          {...(title ? { title } : {})}
                        >
                          {desc}
                        </NumberedItem>
                      );
                    })}
                  </NumberedList>
                </div>
              );
            })()}
          </InViewFade>
        )}

        {environmental.length > 0 && (
          <InViewFade as="section" delay={0.06}>
            <SectionCard className="mb-3 md:mb-4">
              {(() => {
                const sec = sub();
                return (
                  <>
                    <h3 className="not-prose text-body-sm font-medium mb-1 text-[--color-foreground]">{`${sec} – ${t('impactHeadings.environmental')}`}</h3>
                    <NumberedList>
                      {environmental.map((x, i) => {
                        const raw = String(x ?? '');
                        const idx = raw.indexOf(':');
                        const title = idx > -1 ? raw.slice(0, idx).trim() : '';
                        const desc = idx > -1 ? raw.slice(idx + 1).trim() : raw;
                        return (
                          <NumberedItem
                            key={i}
                            num={`${sec}.${i + 1}`}
                            {...(title ? { title } : {})}
                          >
                            {desc}
                          </NumberedItem>
                        );
                      })}
                    </NumberedList>
                  </>
                );
              })()}
            </SectionCard>
          </InViewFade>
        )}

        {policy.length > 0 && (
          <InViewFade as="section" delay={0.08}>
            <SectionCard className="mb-3 md:mb-4">
              {(() => {
                const sec = sub();
                return (
                  <>
                    <h3 className="not-prose text-body-sm font-medium mb-1 text-[--color-foreground]">{`${sec} – ${t('impactHeadings.policy')}`}</h3>
                    <NumberedList>
                      {policy.map((x, i) => {
                        const raw = String(x ?? '');
                        const idx = raw.indexOf(':');
                        const title = idx > -1 ? raw.slice(0, idx).trim() : '';
                        const desc = idx > -1 ? raw.slice(idx + 1).trim() : raw;
                        return (
                          <NumberedItem
                            key={i}
                            num={`${sec}.${i + 1}`}
                            {...(title ? { title } : {})}
                          >
                            {desc}
                          </NumberedItem>
                        );
                      })}
                    </NumberedList>
                  </>
                );
              })()}
            </SectionCard>
          </InViewFade>
        )}

        {societal.length > 0 && (
          <InViewFade as="section" delay={0.1}>
            <SectionCard className="mb-3 md:mb-4">
              {(() => {
                const sec = sub();
                return (
                  <>
                    <h3 className="not-prose text-body-sm font-medium mb-1 text-[--color-foreground]">{`${sec} – ${t('impactHeadings.societal')}`}</h3>
                    <NumberedList>
                      {societal.map((x, i) => {
                        const raw = String(x ?? '');
                        const idx = raw.indexOf(':');
                        const title = idx > -1 ? raw.slice(0, idx).trim() : '';
                        const desc = idx > -1 ? raw.slice(idx + 1).trim() : raw;
                        return (
                          <NumberedItem
                            key={i}
                            num={`${sec}.${i + 1}`}
                            {...(title ? { title } : {})}
                          >
                            {desc}
                          </NumberedItem>
                        );
                      })}
                    </NumberedList>
                  </>
                );
              })()}
            </SectionCard>
          </InViewFade>
        )}

        {sustainability.length > 0 && (
          <InViewFade as="section" delay={0.12}>
            <SectionCard className="mb-3 md:mb-4">
              {(() => {
                const sec = sub();
                return (
                  <>
                    <h3 className="not-prose text-body-sm font-medium mb-1 text-[--color-foreground]">{`${sec} – ${t('impactHeadings.sustainability')}`}</h3>
                    <NumberedList>
                      {sustainability.map((x, i) => {
                        const raw = String(x ?? '');
                        const idx = raw.indexOf(':');
                        const title = idx > -1 ? raw.slice(0, idx).trim() : '';
                        const desc = idx > -1 ? raw.slice(idx + 1).trim() : raw;
                        return (
                          <NumberedItem
                            key={i}
                            num={`${sec}.${i + 1}`}
                            {...(title ? { title } : {})}
                          >
                            {desc}
                          </NumberedItem>
                        );
                      })}
                    </NumberedList>
                  </>
                );
              })()}
            </SectionCard>
          </InViewFade>
        )}

        {/* Cross-links */}
        <InViewFade as="section" delay={0.14}>
          <div className="not-prose mt-5 text-[12px] md:text-[13px]">
            <span className="text-[--color-foreground] mr-1">{t('labels.seeAlso')}</span>
            <Link href={buildLocalePath(locale, `/chapters/6`)} className="link">
              {t('links.tech')}
            </Link>
            <span className="mx-2 text-[--color-muted-foreground]">·</span>
            <Link href={buildLocalePath(locale, `/chapters/6#responsible-ai`)} className="link">
              {t('links.responsibleAI')}
            </Link>
          </div>
        </InViewFade>

        {/* References */}
        <InViewFade as="section" delay={0.16}>
          <div className="not-prose mt-3">
            <h3 className="not-prose text-body-sm font-medium mb-1 text-[--color-foreground]">
              {isDe ? 'Referenzen' : 'References'}
            </h3>
            <ul className="mt-2 list-none pl-0 space-y-1.5 text-[12px] md:text-[13px]">
              <li>
                <a className="link" href="https://artificialintelligenceact.eu/" target="_blank" rel="noreferrer noopener">
                  {isDe ? 'EU AI Act – Überblick & Texte' : 'EU AI Act – overview & texts'}
                </a>
              </li>
              <li>
                <a className="link" href="https://www.iso.org/standard/69564.html" target="_blank" rel="noreferrer noopener">
                  {isDe ? 'ISO 10218 / TS 15066 – Kollaborative Robotik' : 'ISO 10218 / TS 15066 – collaborative robotics'}
                </a>
              </li>
              <li>
                <a className="link" href="https://www.iso.org/standard/41571.html" target="_blank" rel="noreferrer noopener">
                  {isDe ? 'ISO 13482 – Persönliche Assistenzroboter' : 'ISO 13482 – personal care robots'}
                </a>
              </li>
              <li>
                <a className="link" href="https://www.iec.ch/standard/5045" target="_blank" rel="noreferrer noopener">
                  {isDe ? 'IEC 61508 / ISO 13849 – Funktionale Sicherheit' : 'IEC 61508 / ISO 13849 – functional safety'}
                </a>
              </li>
              <li>
                <a className="link" href="https://www.ros.org/" target="_blank" rel="noreferrer noopener">
                  ROS / ROS2
                </a>
              </li>
            </ul>
          </div>
        </InViewFade>
      </div>
      {/* Print is handled globally in chapters layout */}
    </div>
  );
}

