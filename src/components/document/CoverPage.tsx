"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslations, useFormatter, useLocale } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Store, Sparkles } from 'lucide-react';
import ElegantCard from '@/components/ui/ElegantCard';
import RobotIcon from '@/components/ui/RobotIcon';
import { Sora } from 'next/font/google';

// Kräftige, seriöse Display-Schrift
const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700','800']
});

type CoverPageProps = {
  preview?: boolean; // optional: zum Anzeigen im Screen-Modus
  versionOverride?: string | undefined; // optional: Version vom Server (z. B. aus package.json)
};

const CoverPage: React.FC<CoverPageProps> = ({ preview = false, versionOverride }) => {
  const t = useTranslations('coverPage');
  const format = useFormatter();
  const now = new Date();
  const dateISO = now.toISOString().slice(0, 10);
  const year = now.getFullYear();
  const reduceMotion = useReducedMotion();
  const locale = useLocale();
  const [qrHref, setQrHref] = React.useState<string | null>(null);
  React.useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // QR: direkt auf den Businessplan-PDF-Export für die aktuelle Locale
    const loc = locale || 'de';
    const target = origin ? `${origin}/${loc}/export/businessplan` : '';
    setQrHref(target || null);
  }, [locale]);

  // i18n mit sicheren Fallbacks
  const tt = (key: string, fallback: string) => {
    try { return (t(key) as string) || fallback; } catch { return fallback; }
  };

  // Untertitel typografisch in sinnvolle Satzblöcke teilen (ohne Textinhalt zu ändern)
  const subtitleText = tt(
    'subtitle',
    'Spezialisiert auf den Humanoid‑Robotics App‑Store: Haushalts‑Roboter als Service (RaaS) – alltägliche Aufgaben, modulare Apps und nahtlose Updates. Unsere Plattform vereint Hardware, App‑Ökosystem und KI‑Assistenz für den praktischen Einsatz zu Hause – heute skalierbar, morgen Standard. Mit Partner‑Ökosystem, Security by Design und Privacy als Grundprinzip ebnen wir den Weg für alltagstaugliche humanoide Assistenz.'
  );
  const subtitleSegments = React.useMemo(
    () => subtitleText.split(/(?<=\.)\s+(?=[A-ZÄÖÜ])/),
    [subtitleText]
  );

  // Titel-Aufbereitung: 'as a Service' -> 'as‑a‑Service' (geschützte Bindestriche) und eigene Zeile kleiner
  const hyphenateAsAService = React.useCallback((s: string) => s.replace(/as\s+a\s+service/i, 'as\u2011a\u2011Service'), []);
  const splitTitleMainSuffix = React.useCallback((s: string): { main: string; suffix: string | null } => {
    const withHyphens = hyphenateAsAService(s);
    const m = withHyphens.match(/^(.*)\s+(as\u2011a\u2011Service)$/i);
    if (m) return { main: m[1], suffix: m[2] };
    return { main: withHyphens, suffix: null };
  }, [hyphenateAsAService]);

  // Framer Motion: Props nur setzen, wenn Motion gewünscht ist (vermeidet undefined-Typen bei exactOptionalPropertyTypes)
  const motionProps = reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      } as const;

  return (
    <>
      {/* Skip-Link für Tastaturnutzer */}
      <a href="#cover-main" className="skip-link">Zum Inhalt springen</a>
    <motion.div
      {...motionProps}
      className={[
        'cover-page relative',
        preview ? 'block' : 'print:block hidden',
        // Edler Screen-Rahmen, im Druck neutral
        'print:absolute print:top-0 print:left-0 print:w-full print:h-full',
        'print:rounded-none print:shadow-none print:ring-0',
        'rounded-3xl ring-1 ring-[--color-border-subtle] shadow-sm overflow-hidden bg-[--color-surface]'
      ].join(' ')}
    >
      {/* Wasserzeichen-Hintergrund entfernt */}
      {/* Dezente Vignette (abgeschwächt) */}
      <div className="print:hidden absolute inset-0 -z-10 pointer-events-none">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(110% 70% at 50% 24%, rgba(16,185,129,0.015), rgba(0,0,0,0) 38%), radial-gradient(100% 60% at 50% 92%, rgba(56,189,248,0.015), rgba(0,0,0,0) 38%)'
          }}
        />
      </div>

      {/* Inhalt */}
      <div className="flex flex-col items-center justify-start min-h-[100dvh] text-center px-5 sm:px-7 pt-0 pb-0">
        {/* Brand/Logo-Zeile außerhalb entfernt – Brand jetzt innerhalb der Card */}
  <main id="cover-main" role="main" className="pt-6 md:pt-8">
        {/* Titel/Badges außerhalb entfernt – alles innerhalb der Card */}

        {/* Untertitel unter den Badges – als edle, zentrierte Card. Danach folgen Version, Meta/QR und Kontakt – ALLES innerhalb der Card. */}
        <div className="mt-4 md:mt-5 px-0">
          <ElegantCard
            className="max-w-3xl mx-auto"
            innerClassName="bg-[--color-surface] p-6 md:p-8 lg:p-10 text-center"
            ariaLabel="Cover Intro Card"
            role="region"
            rounded="rounded-[16px]"
          >
            {/* Brand-Zeile innerhalb der Card (ohne Icon) */}
            <div className="-mt-1 mb-3 md:mb-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[--color-surface]/70 supports-[backdrop-filter]:backdrop-blur-[2px] ring-1 ring-[--color-border-subtle] px-2.5 py-0.5 shadow-sm/50">
                <span className="text-[10.5px] font-medium tracking-[0.02em] text-[--color-foreground]">SIGMACODE AI Robotics</span>
                <span aria-hidden className="text-[--color-border]">•</span>
                <span className="text-[9.5px] uppercase tracking-[0.14em] text-[--color-foreground-muted]">Businessplan · {year}</span>
              </div>
            </div>
            {/* Titel + Badges (kompakte Variante) */}
            <div className="mb-3 md:mb-4">
              <h2
                className={`${sora.className} m-0 text-3xl md:text-4xl font-extrabold tracking-[-0.015em] leading-[1.06] bg-gradient-to-r from-emerald-600/70 via-cyan-600/70 to-sky-600/70 bg-clip-text text-transparent dark:from-emerald-400/90 dark:via-cyan-400/90 dark:to-sky-500/90 drop-shadow-[0_0.6px_0_rgba(0,0,0,0.06)]`}
              >
                {(() => {
                  const { main, suffix } = splitTitleMainSuffix(tt('title', 'Geschäftsplan'));
                  return (
                    <>
                      {/* Erste Titelzeile mit Robo-Icon links */}
                      <span className="block">
                        <span className="inline-flex items-center justify-center gap-2.5">
                          <RobotIcon size="md" strokeWidth={2} stroke="currentColor" />
                          <span>{main}</span>
                        </span>
                      </span>
                      {suffix ? (
                        <span className="block pt-1 text-xl md:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600/70 via-cyan-600/70 to-sky-600/70">{suffix}</span>
                      ) : null}
                    </>
                  );
                })()}
              </h2>
              <div className="mt-2 flex flex-col items-center gap-1.5">
                <ul className="m-0 flex flex-wrap justify-center items-center gap-2 md:gap-2.5 text-left leading-none list-none p-0 [&>li]:mt-0">
                  <li className="flex items-center">
                    <div className="chip-anim inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 h-[26px] leading-none whitespace-nowrap border-gradient bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] supports-[backdrop-filter]:backdrop-blur-[2px]">
                      <Store className="h-[12px] w-[12px] align-middle text-[--color-foreground-muted]" aria-hidden />
                      <span className="text-[10.5px] tracking-[0.02em] leading-[1] text-[--color-foreground-muted]">{tt('value.appstore', 'Kuratiertes KI‑App‑Ökosystem · Developer‑Store')}</span>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="chip-anim inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 h-[26px] leading-none whitespace-nowrap border-gradient bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] supports-[backdrop-filter]:backdrop-blur-[2px]">
                      <span className="text-[10.5px] tracking-[0.02em] leading-[1] text-[--color-foreground-muted]">{tt('value.humanoid', 'Humanoide Robotik · praxisnah & sicher')}</span>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="chip-anim inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 h-[26px] leading-none whitespace-nowrap border-gradient bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] supports-[backdrop-filter]:backdrop-blur-[2px]">
                      <Sparkles className="h-[12px] w-[12px] align-middle text-[--color-foreground-muted]" aria-hidden />
                      <span className="text-[10.5px] tracking-[0.02em] leading-[1] text-[--color-foreground-muted]">{tt('value.aas', 'Agents as a Service · Aufgaben statt Apps')}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <p
              id="cover-subtitle"
              className="m-0 text-[14.5px] md:text-[16px] text-[--color-foreground] leading-[1.5] max-w-[62ch] md:max-w-[68ch] mx-auto [font-feature-settings:'ss01','ss02','liga','clig','tnum'] [text-wrap:balance] opacity-95"
            >
              {subtitleSegments.map((seg, i) => (
                <span key={i} className="block">
                  {seg}
                </span>
              ))}
            </p>

            {/* Edler Trenner unter dem Untertitel (neutral grau, Tiefeneffekt) */}
            <div aria-hidden className="relative mx-auto my-4 md:my-5 w-10/12">
              {/* Hauptlinie in neutralem Grau */}
              <div className="h-px bg-gradient-to-r from-transparent via-[--color-border-subtle] to-transparent" />
              {/* Leichter Glow/Emboss-Effekt (darunter) */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--color-border-subtle)_55%,transparent)] to-transparent blur-[0.7px] opacity-90" />
              {/* Zentrales Ornament (Diamant) neutral, mit weichem Halo */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-[3px]">
                <span className="block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[--color-border-subtle] shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-border-subtle)_16%,transparent)]" />
              </div>
            </div>

            {/* Version (in Card) */}
            <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-full px-2.5 py-1 text-[12px] md:text-[13px] text-[--color-foreground-muted] bg-[color-mix(in_srgb,var(--muted)_16%,transparent)] ring-1 ring-[--color-border-subtle] [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums] focus-within:ring-2 focus-within:ring-[--color-border] transition-shadow">
              <span>{tt('versionLabel', 'Version')}:</span>
              <span className="tracking-tight">{(versionOverride || process.env.NEXT_PUBLIC_APP_VERSION || tt('version', 'v1.0')) as string}</span>
              <span aria-hidden className="text-[--color-border]">•</span>
              <time dateTime={dateISO}>{dateISO}</time>
            </div>

            {/* Meta (in Card) */}
            <div className="mt-6 md:mt-8 grid gap-1.5 text-[12.5px] md:text-[13px] text-[--color-foreground-muted] md:grid-flow-col md:auto-cols-max [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums] justify-center items-center text-center">
              <div className="inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 bg-[color-mix(in_srgb,var(--muted)_14%,transparent)] ring-1 ring-[--color-border-subtle] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-border] transition-shadow">
                <span>{tt('date', 'Datum')}:</span>
                <time dateTime={dateISO}>{format.dateTime(now, { dateStyle: 'long' })}</time>
              </div>
              <div className="inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 bg-[color-mix(in_srgb,var(--muted)_14%,transparent)] ring-1 ring-[--color-border-subtle] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-border] transition-shadow">
                <span>{tt('preparedFor', 'Vorbereitet für')}:</span>
                <span>{tt('companyName', 'Investoren & Förderstellen')}</span>
              </div>
              {qrHref ? (
                <a
                  href={qrHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="print:hidden mx-auto md:mx-0 mt-1 inline-flex items-center gap-2 rounded-lg px-2 py-1 ring-1 ring-[--color-border-subtle] bg-[--color-surface]/85 supports-[backdrop-filter]:backdrop-blur-[3px] hover:bg-[--color-surface] transition-colors shadow-sm text-[11px] text-[--color-foreground-muted] hover:underline decoration-[--color-border-subtle]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-border]"
                  aria-label="Pitch-Deck öffnen"
                  aria-describedby="pitch-desc"
                >
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(qrHref)}`}
                    alt="QR Code"
                    width={28}
                    height={28}
                    unoptimized
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-7 print:h-10 print:w-10 rounded-sm ring-1 ring-[--color-border-subtle]"
                  />
                  <span className="text-[11px]">{tt('openPitch', 'Pitch-Deck öffnen')}</span>
                  <span id="pitch-desc" className="sr-only">Öffnet das Pitch‑Deck in neuem Tab</span>
                </a>
              ) : null}
            </div>

            {/* Kontakt (in Card) */}
            <div className="mt-5 md:mt-6">
              <div className="text-[--color-foreground-muted] uppercase tracking-wide text-[10.5px] mb-1 text-center">{tt('contact.title', 'Kontakt')}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] md:text-[13px] text-[--color-foreground-muted] [font-feature-settings:'tnum']">
                <div><span className="opacity-80">{tt('contact.person', 'Ansprechpartner')}:</span> <span className="opacity-95">{tt('contact.personName', 'Michael S. (Managing Director)')}</span></div>
                <div><span className="opacity-80">{tt('contact.email', 'E‑Mail')}:</span> <a href={`mailto:${tt('contact.emailAddress', 'contact@sigmacode.ai')}`} className="no-underline hover:underline opacity-95">{tt('contact.emailAddress', 'contact@sigmacode.ai')}</a></div>
                <div><span className="opacity-80">{tt('contact.phone', 'Telefon')}:</span> <a href={`tel:${tt('contact.phoneNumber', '+43 660 0000000')}`} className="no-underline hover:underline opacity-95">{tt('contact.phoneNumber', '+43 660 0000000')}</a></div>
                <div><span className="opacity-80">{tt('contact.address', 'Adresse')}:</span> <span className="opacity-95">{tt('contact.addressValue', 'SIGMACODE AI Robotics · Wien, Österreich')}</span></div>
              </div>
            </div>
            {/* Vertraulichkeitshinweis (in Card) – kompakt ohne Trenner */}
            <div className="mt-5">
              <div className="text-center text-[11.5px] leading-snug text-[--color-foreground-muted]/95 max-w-[80ch] mx-auto [text-wrap:pretty]">
                {tt(
                  'confidential',
                  'Vertraulich & urheberrechtlich geschützt. Dieses Dokument enthält proprietäre Informationen und ist ausschließlich für die adressierten Empfänger bestimmt. Eine Weitergabe, Vervielfältigung oder Veröffentlichung – vollständig oder in Teilen – ist ohne vorherige schriftliche Zustimmung untersagt.'
                )}
              </div>
            </div>
          </ElegantCard>
        </div>

      </main>
      </div>

      {/* Page break hinter dem Deckblatt im Druck */}
      <div className="page-break-after" />
    </motion.div>
    </>
  );
};

export default CoverPage;
