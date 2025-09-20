import Footer from "@components/layout/Footer";
import { getTranslations, getLocale } from 'next-intl/server';
import { CVTimeline } from "@components/chapters/sections/CVTimeline";
import CVSkills from "@components/chapters/sections/CVSkills";
import PrintButton from "@components/cv/PrintButton";
import CopyButton from "@components/cv/CopyButton";
import VCardButton from "@components/cv/VCardButton";
import CVJsonLd from "@components/cv/CVJsonLd";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Brain,
  Cpu,
  LineChart,
  Users,
  AppWindow,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Rocket,
  Globe,
} from "lucide-react";
import type { Metadata } from 'next';
import CVCoverPage from "@/components/document/CVCoverPage";
import ClosingPage from "@/components/document/ClosingPage";
import ElegantCard from "@/components/ui/ElegantCard";

export default async function LebenslaufRedirect() {
  const t = await getTranslations('cv');
  const locale = await getLocale();
  // Serverseitig i18n-Daten laden (keine inline-async IIFE im JSX)
  let skillsCategories: { name: string; items: string[] }[] = [];
  try {
    const raw = t.raw('skills.categories') as unknown;
    if (Array.isArray(raw)) skillsCategories = raw as { name: string; items: string[] }[];
  } catch {}
  let languages: { name: string; level: string }[] = [];
  try {
    const raw = t.raw('languages.items') as unknown;
    if (Array.isArray(raw)) languages = raw as { name: string; level: string }[];
  } catch {}
  // Fallback-Inhalte für Skills & Sprachen (deutsch), falls i18n leer ist
  if (!skillsCategories.length) {
    skillsCategories = [
      {
        name: 'Technologie',
        items: [
          'Programmiererfahrung seit dem 12. Lebensjahr',
          'Python, Blockchain, Web, GPU, KI',
          'Apple-Technologie (zertifizierter Apple-Techniker)'
        ],
      },
      {
        name: 'Unternehmertum',
        items: [
          'Unternehmenssanierung (bis 150 Mitarbeiter)',
          'Firmenwerte bis zweistelliger Mio.-Bereich',
          'Business Development & internationale Kooperationen'
        ],
      },
      {
        name: 'Industrieerfahrung',
        items: [
          'Medizintechnik & staatliche Beschaffung',
          'IT-Security & Forensik',
          'Strategische Logistikplanung & Supply Chain Management'
        ],
      },
      {
        name: 'Leadership',
        items: [
          'Coaching & Mentoring von Startups & Projekten',
          'Eventorganisation (Sport & Business)',
          'Community-Management (20.000+ User-Plattform)'
        ],
      },
    ];
  }
  if (!languages.length) {
    languages = [
      { name: 'Deutsch', level: 'Muttersprache' },
      { name: 'Bosnisch', level: 'Fließend' },
    ];
  }
  let summaryBullets: string[] = [];
  try {
    const raw = t.raw('summary.bullets') as unknown;
    if (Array.isArray(raw)) summaryBullets = raw as string[];
  } catch {}
  // Robuster Fallback für Presse-Titel, falls i18n-Key fehlt
  // sameAs Links aus i18n (LinkedIn/GitHub etc.)
  const sameAs: string[] = [
    t('contact.linkedin', { default: '' }) as unknown as string,
    t('contact.github', { default: '' }) as unknown as string,
  ].filter((x) => typeof x === 'string' && x.trim().startsWith('http')) as string[];

  // Dynamische Icon-Auswahl je Bullet-Text (erste 6 Punkte mit Premium-Icons)
  function getSummaryIcon(text: string) {
    const s = text.toLowerCase();
    // Sanierung & Skalierung, Turnaround, Wachstum
    if (/(sanierung|skalierung|turnaround|wachstum|skali|scale|leader)/.test(s)) return Rocket;
    // Technologie: AI, Robotik, Cloud/Edge, Safety
    if (/(technolog|ai|ki|robot|cloud|edge)/.test(s)) return Cpu;
    if (/(safety|audit|auditierbar|sicher|security)/.test(s)) return ShieldCheck;
    // Produkt, App-Store/SDK, Developer/Partner
    if (/(produkt|app[- ]?store|sdk|developer|partner|ökosystem)/.test(s)) return AppWindow;
    // Autor / Mentales Betriebssystem / Wissen
    if (/(autor|buch|sigmacode|betriebssystem)/.test(s)) return BookOpen;
    // Leadership & Netzwerk
    if (/(leadership|netzwerk|coaching|mentoring|kooperation)/.test(s)) return Users;
    // FinOps, ROI, Effizienz, Kosten, Profit
    if (/(finops|roi|effizienz|kosten|profit|profitabilität|profitabilitaet)/.test(s)) return BarChart3;
    // Business Development, International
    if (/(business development|international|partner|ecosystem|ökosystem)/.test(s)) return Globe;
    // Fallbacks
    if (/(ai|ml|robot)/.test(s)) return Brain;
    return LineChart; // neutrale, hochwertige Default-Wahl
  }

  return (
    <>
      {/* Print-only CV cover page */}
      <div className="hidden print:block">
        <CVCoverPage />
      </div>
      {/* Lokaler Wrapper statt zweitem <main>: verhindert Doppel-Container & Zentrierungsfehler */}
      <div id="content" className="min-h-screen bg-[--color-background] py-4 md:py-8">
      {/* Structured data for SEO */}
      <CVJsonLd locale={locale} sameAs={sameAs} />
      {/* Main Frame */}
      <div className="container mx-auto max-w-6xl px-3 sm:px-5 lg:px-6 overflow-visible">
        {/* Kopfbereich + Summary in eleganter Card */}
        <ElegantCard className="max-w-4xl mx-auto" innerClassName="p-5 md:p-7 lg:p-8">
          <header className="max-w-3xl mx-auto">
            <div className="mb-3 print:hidden">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[--color-border-subtle] bg-[--color-surface-2] text-[--color-foreground] hover:bg-[--color-surface] hover:ring-[--color-border] transition-colors"
                aria-label={t("backToPlan", { default: "Zurück zum Businessplan" })}
              >
                <span aria-hidden>←</span>
                <span>{t("backToPlan", { default: "Zurück zum Businessplan" })}</span>
              </Link>
            </div>

            <div className="grid items-center justify-items-center gap-4 md:gap-5 text-center">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative w-[96px] h-[120px] md:w-[152px] md:h-[196px] rounded-xl p-[2px] bg-[conic-gradient(from_140deg,theme(colors.indigo.500)_0%,theme(colors.emerald.400)_40%,theme(colors.sky.500)_80%,theme(colors.indigo.500)_100%)] shadow-sm ring-1 ring-[--color-border-subtle] overflow-hidden">
                  <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[radial-gradient(120%_120%_at_50%_50%,var(--color-surface)_0%,var(--color-surface-2)_100%)]">
                    <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(160%_140%_at_50%_50%,_black_94%,_rgba(0,0,0,0.98)_105%,_transparent_160%)]" aria-hidden />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.7)_1px,transparent_1.2px)] [background-size:6px_6px]" aria-hidden />
                    <Image
                      src="/cv/profile.jpg"
                      alt="Profilfoto Ismet Mesic"
                      fill
                      sizes="(max-width: 768px) 112px, 152px"
                      className="object-cover object-[50%_20%] md:object-[50%_24%]"
                      quality={90}
                      priority
                      fetchPriority="high"
                    />
                  </div>
                </div>
              </div>

              {/* Titel, Meta, Aktionen */}
              <div className="px-2 w-full max-w-3xl mx-auto">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h1 className="text-[18px] md:text-2xl lg:text-3xl font-semibold tracking-tight text-center">
                      <span className="align-middle mr-2">Ismet Mesic</span>
                      <span
                        className="align-middle inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] md:text-xs lowercase font-light tracking-wide text-[--color-foreground-muted] ring-1 ring-[--color-border-subtle]"
                        aria-label="Titel: Ingenieur"
                        title="ing"
                      >
                        ing
                      </span>
                    </h1>
                    <p className="text-[15px] md:text-base text-[--color-foreground]/90 mt-1 leading-[1.75] text-center max-w-[58ch] mx-auto">
                      {t("pageSubtitle", { default: "Executive – Unternehmer, Innovator, Sanierer, Mentor & Forscher" })}
                    </p>
                    <div className="mx-auto h-px w-full max-w-[460px] bg-[--color-border-subtle] opacity-70" />
                    <div className="text-[13px] md:text-[13px] text-[--color-foreground] opacity-90 md:opacity-80 tracking-[0.01em] leading-relaxed mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      <span>{t("availability", { default: "Verfügbar: Teilzeit · Projektbasis" })}</span>
                      <span className="opacity-40" aria-hidden>•</span>
                      <span>{t("workMode", { default: "Remote‑first | DACH" })}</span>
                      <span className="opacity-40" aria-hidden>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-[10px] w-[10px] opacity-65" aria-hidden />
                        {t("location", { default: "Wien, AT" })}
                      </span>
                    </div>
                    {(() => {
                      const email = t('contact.email', { default: 'ismet@mesic.dev' });
                      const location = t('location', { default: 'Wien, AT' });
                      return (
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[12px] md:text-[12px] text-[--color-foreground]">
                          <a
                            href={`mailto:${email}`}
                            className="hover:text-[--color-primary] transition-colors underline-offset-2 hover:underline px-1 py-0.5 rounded"
                            aria-label={`${t('contact.open', { default: 'Öffnen:' })} ${email}`}
                            title={email}
                          >
                            {email}
                          </a>
                          <span className="opacity-35" aria-hidden>•</span>
                          <CopyButton
                            text={email}
                            label={t('contact.copyEmail', { default: 'E-Mail kopieren' })}
                            successLabel={t('contact.copied', { default: 'Kopiert' })}
                            ariaLabel={t('contact.copyEmailAria', { default: 'E-Mail-Adresse kopieren' })}
                          />
                          <span className="opacity-35" aria-hidden>•</span>
                          <VCardButton fullName="Ismet Mesic" email={email} location={location} />
                          <span className="opacity-35" aria-hidden>•</span>
                          <PrintButton className="bg-transparent text-[--color-foreground-muted] hover:text-[--color-foreground]" />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>{/* grid */}
          </header>

          {/* Executive Summary in Card */}
          {summaryBullets.length > 0 && (
            <section
              id="cv-summary"
              className="mt-5 md:mt-6"
              aria-label={t('summary.title', { default: 'Executive Summary' })}
            >
              <div className="px-0">
                <h2 id="cv-summary-heading" className="text-[11.5px] md:text-[12.5px] font-medium tracking-[0.14em] uppercase text-[--color-foreground-strong] text-center">
                  {t('summary.title', { default: 'EXECUTIVE SUMMARY' })}
                </h2>
              </div>
              <ul role="list" className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-2.5">
                {summaryBullets.map((b, i) => {
                  const Icon = i < 6 ? getSummaryIcon(b) : null;
                  return (
                    <li key={`s-${i}`} className="flex items-start gap-2.5">
                      <span
                        className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-md bg-[--color-surface-2] text-[--color-foreground-muted] ring-1 ring-[--color-border] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                        aria-hidden
                      >
                        {Icon ? (
                          <Icon className="h-3.5 w-3.5" />
                        ) : (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-80"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.07 7.073a1 1 0 01-1.415 0L3.296 9.856a1 1 0 111.414-1.415l3.096 3.096 6.364-6.364a1 1 0 011.534.117z" clipRule="evenodd"/></svg>
                        )}
                      </span>
                      <span className="text-[12px] md:text-[13.5px] leading-[1.55] text-[--color-foreground]">
                        {b}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </ElegantCard>

        {/* Überschrift + Timeline außerhalb der Card */}
        <section id="cv-timeline" className="mt-8 md:mt-10 mb-8 md:mb-10 overflow-visible">
          <h2 className="text-center text-xl md:text-2xl font-semibold tracking-tight mb-4">
            {t('title', { default: 'Lebenslauf' })}
          </h2>
          {/* Client-Komponente mit Animationen */}
          <CVTimeline compactLevel="sm" techPriority={false} deckMode={false} deckScrollLinked={false} showHeading={false} />
        </section>

      {/* Presse & Zitate – Glossar unterhalb der Timeline */}
      <section id="cv-press-quotes" className="mt-6 md:mt-8 mb-6 md:mb-8 max-w-4xl mx-auto px-4 md:px-5" aria-label={t('press.title', { default: 'Presse & Medien' })}>
        <h2 className="text-[12px] md:text-[13px] font-medium tracking-[0.12em] uppercase text-[--color-foreground-strong] mb-2">
          {t('press.title', { default: 'Presse & Medien' })}
        </h2>
          {/* Quote 1 – Heute.at */}
          <blockquote className="relative rounded-md p-3 md:p-3.5 pl-3.5 md:pl-4 text-[12px] md:text-[12.5px] leading-relaxed">
            <div className="pointer-events-none absolute top-2 right-2 h-5 w-5 opacity-60 [filter:grayscale(100%)]" aria-hidden>
              <Image src="/press-logos/heute.svg" alt="Heute.at" fill sizes="20px" className="object-contain" />
            </div>
            <p className="text-[--color-foreground]/95 italic">
              „Das Kampf‑Event des Jahres <strong>Sparta 3</strong> steigt am 7. Oktober 2023 in der <strong>Wiener Stadthalle</strong>.”
            </p>
            <cite className="block mt-1.5 text-[10.5px] text-[--color-foreground-muted]">
              Quelle: <a href="https://www.heute.at/s/ps-treffen-kaempfe-gewinne-karten-fuers-sparta-finale-100292750" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:decoration-solid">Heute.at</a>, 22.09.2023
            </cite>
          </blockquote>

          {/* Quote 2 – Wiener Stadthalle */}
          <blockquote className="relative rounded-md p-3 md:p-3.5 pl-3.5 md:pl-4 text-[12px] md:text-[12.5px] leading-relaxed">
            <div className="pointer-events-none absolute top-2 right-2 h-5 w-5 opacity-60 [filter:grayscale(100%)]" aria-hidden>
              <Image src="/press-logos/stadthalle.svg" alt="Wiener Stadthalle" fill sizes="20px" className="object-contain" />
            </div>
            <p className="text-[--color-foreground]/95 italic">
              „Das <strong>Sparta MMA</strong> Event feiert seine <strong>Premiere in der Wiener Stadthalle</strong> … eine Nacht der Superlative!“
            </p>
            <cite className="block mt-1.5 text-[10.5px] text-[--color-foreground-muted]">
              Quelle: <a href="https://www.stadthalle.com/de/events/alle-events/50347/Sparta-MMA" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:decoration-solid">Wiener Stadthalle</a>, 07.10.2023
            </cite>
          </blockquote>

          {/* Quote 3 – Kronen Zeitung */}
          <blockquote className="relative rounded-md p-3 md:p-3.5 pl-3.5 md:pl-4 text-[12px] md:text-[12.5px] leading-relaxed">
            <div className="pointer-events-none absolute top-2 right-2 h-5 w-5 opacity-60 [filter:grayscale(100%)]" aria-hidden>
              <Image src="/press-logos/krone.svg" alt="Kronen Zeitung" fill sizes="20px" className="object-contain" />
            </div>
            <p className="text-[--color-foreground]/95 italic">
              „Die <strong>Spartaner</strong> haben bislang <strong>über 20.000 Fans</strong> in die Arenen gelockt – allein im Oktober kamen <strong>8.000 Zuschauer</strong> in die <strong>Wiener Stadthalle</strong>.”
            </p>
            <cite className="block mt-1.5 text-[10.5px] text-[--color-foreground-muted]">
              Quelle: <a href="https://www.krone.at/3552941" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:decoration-solid">Kronen Zeitung (Krone+)</a>
            </cite>
          </blockquote>
      </section>

      {/* Skills & Sprachen – schlicht */}
      <section
        id="cv-skills"
        className="mt-8 md:mt-10 max-w-4xl mx-auto"
        aria-label={t('skills.title', { default: 'Kenntnisse & Fähigkeiten' })}
      >
        <h2 className="px-4 md:px-5 text-[12px] md:text-[13px] font-medium tracking-[0.12em] uppercase text-[--color-foreground-strong] mb-2">
          {t('skills.title', { default: 'Kenntnisse & Fähigkeiten' })}
        </h2>
        <div className="px-4 md:px-5">
          <CVSkills skills={skillsCategories} languages={languages} hideInnerTitles />
        </div>
      </section>

      <Footer />
  </div> {/* end container */}
      {/* Print-Fußzeile: Seite X/Y, Datum */}
      {(() => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('de-AT', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeStr = now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
        return (
          <div aria-hidden className="print-footer print:show">
            <div className="print-footer__inner">
              <span className="print-footer__left">Ismet Mesic — CV</span>
              <span className="print-footer__center">
                Seite <span className="page" /> / <span className="pages" />
              </span>
              <span className="print-footer__right">Stand: {dateStr} {timeStr}</span>
            </div>
          </div>
        );
      })()}
      </div>
      {/* Print-only closing/contact page */}
      <div className="hidden print:block">
        <ClosingPage />
      </div>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cv');
  const locale = await getLocale();
  const title = t('pageTitle', { default: 'Ismet Mesic' });
  const description = t('pageSubtitle', {
    default: 'Berufserfahrung, Projekte und Engagements – klar strukturiert mit interaktiver Timeline.',
  });
  const url = `/${locale}/lebenslauf`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      locale,
      siteName: 'Businessplan & CV',
      images: [
        { url: '/cv/profile.jpg', width: 1200, height: 630, alt: 'Profil – Ismet Mesic' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/cv/profile.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  } as const;
}
