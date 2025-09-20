import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import Link from 'next/link';
import { Percent, Clock, Rocket, LineChart, Linkedin, Globe, Mail } from 'lucide-react';
import TableSimple from '@/components/ui/TableSimple';
import MiniDonut from '@/components/charts/MiniDonut';
import MiniBarChart from '@/components/chapters/timeline/MiniBarChart';
import LineChartAnimated from '@/components/charts/LineChartAnimated';
import { CardTitle } from '@/components/ui/card';
import ElegantCard from '@/components/ui/ElegantCard';
import { NumberedList, NumberedItem } from '@components/chapters/NumberedList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'team')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function TeamPage() {
  const tBp = await getTranslations('bp');
  const locale = await getLocale();
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const bpAny = bp as any;
  const messages: any = { bp: bpAny, content: (bpAny as any).content ?? {} };
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'team')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.team')}`;
  // Einheitliche Unterkapitel-Nummerierung
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;

  // Checklist entfernt

  // Inhalte (defensiv): bevorzugt combined.bp.team.*, fallback auf historische content.teamOrg.*
  const founders = (messages?.bp?.team?.founders as string[] | undefined)
    ?? (messages?.content?.teamOrg?.founders as string[] | undefined)
    ?? [];
  const summary = (messages?.bp?.team?.summary as string | undefined)
    ?? (messages?.content?.teamOrg?.summary as string | undefined)
    ?? '';
  const ftePlan = (messages?.bp?.team?.ftePlan as { year: string | number; teamSize: number | string; focus?: string | string[]; roles?: string[] }[] | undefined)
    ?? (messages?.content?.teamOrg?.ftePlan as { year: string | number; teamSize: number | string; focus?: string | string[]; roles?: string[] }[] | undefined)
    ?? [];
  const esopDetails = (messages?.bp?.team?.esopDetails as string[] | undefined) ?? undefined;

  // Optionale Profil-Links (nur rendern, wenn befüllt)
  const profileLinks = {
    ismet: { linkedin: '', website: '', email: 'ismet@sigmacode.ai' },
    medina: { linkedin: '', website: '', email: 'medina@sigmacode.ai' },
    atifa: { linkedin: '', website: '', email: 'atifa@sigmacode.ai' },
  } as const;

  return (
    <div id="chapter-content" className="space-y-8">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>

        {/* Summary / CTA nah an den Anfang für besseren roten Faden */}
        {summary && (
          <InViewFade as="section" delay={0.03} aria-labelledby="team-summary-heading">
            <h3 id="team-summary-heading" className="not-prose text-[14px] md:text-[16px] font-medium mb-2 text-[--color-foreground]">{`${sub()} – ${tBp('headings.team') ?? 'Team'}`}</h3>
            <div className="mt-1">
              <p>{summary}</p>
            </div>
          </InViewFade>
        )}

        {/* Founders / Leadership */}
        <InViewFade as="section" delay={0.05} aria-labelledby="founders-heading">
          <h3 id="founders-heading" className="not-prose text-[14px] md:text-[16px] font-medium mb-2 text-[--color-foreground]">{`${sub()} – ${tBp('headings.founders')}`}</h3>
          {founders.length > 0 && (
            <section aria-labelledby="founders-heading">
              <NumberedList>
                {founders.map((x, i) => (
                  <NumberedItem key={i} num={`${chapterIndex}.1.${i + 1}`}>{x}</NumberedItem>
                ))}
              </NumberedList>
              {/* Kurzprofil-Karten der Führung / Gründer */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                <InViewFade as="div" delay={0.02}>
                <ElegantCard className="mx-auto w-full max-w-[520px]" innerClassName="rounded-[14px] bg-[--color-surface] p-5 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[--color-surface-2] to-[--color-surface] ring-1 ring-[--color-border-subtle]/60 shadow-inner flex items-center justify-center text-[12px] font-medium text-[--color-foreground]" aria-hidden="true" role="presentation">MM</div>
                      <div>
                        <CardTitle className="text-[13.5px] md:text-[15px] m-0 tracking-tight">Medina Mesic, MSc</CardTitle>
                        <div className="text-[11px] md:text-[12.5px] text-[--color-foreground]">Co‑CEO & CMO</div>
                      </div>
                    </div>
                    {/* Konsolidierung: Kurzbeschreibung + CTA (Mail) */}
                    <div className="mt-4">
                      <div className="text-[11px] md:text-[12.5px] text-[--color-foreground-muted]">
                        Kurzprofil und Referenzen auf Anfrage verfügbar.
                      </div>
                      <div className="mt-3">
                        <Link
                          href={`mailto:${profileLinks.medina.email}`}
                          className="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground] bg-[--color-surface-2] hover:bg-[--color-surface] ring-1 ring-inset ring-[--color-border-subtle]/40 transition-all duration-200 hover:-translate-y-0.5"
                          aria-label={`E-Mail an Medina Mesic: ${profileLinks.medina.email}`}
                        >
                          <span>Kontakt aufnehmen</span>
                          <span aria-hidden className="ml-1.5">✉</span>
                        </Link>
                      </div>
                      {(profileLinks.medina.linkedin || profileLinks.medina.website) && (
                        <div className="mt-3 flex items-center gap-2 text-[--color-foreground-muted]">
                          {profileLinks.medina.linkedin && (
                            <Link href={profileLinks.medina.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn – Medina Mesic" className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Linkedin className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {profileLinks.medina.website && (
                            <Link href={profileLinks.medina.website} target="_blank" rel="noreferrer noopener" aria-label="Website – Medina Mesic" className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Globe className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {profileLinks.medina.email && (
                            <Link href={`mailto:${profileLinks.medina.email}`} aria-label={`E-Mail – ${profileLinks.medina.email}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Mail className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                </ElegantCard>
                </InViewFade>
                <InViewFade as="div" delay={0.055}>
                <ElegantCard className="mx-auto w-full max-w-[520px]" innerClassName="rounded-[14px] bg-[--color-surface] p-5 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[--color-surface-2] to-[--color-surface] ring-1 ring-[--color-border-subtle]/60 shadow-inner flex items-center justify-center text-[12px] font-medium text-[--color-foreground]" aria-hidden="true" role="presentation">IM</div>
                      <div>
                        <CardTitle className="text-[13.5px] md:text-[15px] m-0 tracking-tight">Ismet Mesic</CardTitle>
                        <div className="text-[11px] md:text-[12.5px] text-[--color-foreground]">CIO & CTO</div>
                      </div>
                    </div>
                    {/* Konsolidierung: Detailliertes Profil nur im Lebenslauf anzeigen */}
                    <div className="mt-4">
                      <div className="text-[11px] md:text-[12.5px] text-[--color-foreground-muted]">
                        Kurzprofil und vollständiger Lebenslauf mit Stationen, Projekten und Ergebnissen:
                      </div>
                      <div className="mt-3">
                        <Link
                          href={buildLocalePath(locale, '/lebenslauf')}
                          className="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground] bg-[--color-surface-2] hover:bg-[--color-surface] ring-1 ring-inset ring-[--color-border-subtle]/40 transition-all duration-200 hover:-translate-y-0.5"
                          aria-label="Zum Lebenslauf von Ismet Mesic"
                        >
                          <span>Zum Lebenslauf</span>
                          <span aria-hidden className="ml-1.5">→</span>
                        </Link>
                      </div>
                      {(profileLinks.ismet.linkedin || profileLinks.ismet.website) && (
                        <div className="mt-3 flex items-center gap-2 text-[--color-foreground-muted]">
                          {profileLinks.ismet.linkedin && (
                            <Link href={profileLinks.ismet.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn – Ismet Mesic" className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Linkedin className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {profileLinks.ismet.website && (
                            <Link href={profileLinks.ismet.website} target="_blank" rel="noreferrer noopener" aria-label="Website – Ismet Mesic" className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Globe className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {profileLinks.ismet.email && (
                            <Link href={`mailto:${profileLinks.ismet.email}`} aria-label={`E-Mail – ${profileLinks.ismet.email}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Mail className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                </ElegantCard>
                </InViewFade>
                <InViewFade as="div" delay={0.09}>
                <ElegantCard className="mx-auto w-full max-w-[520px]" innerClassName="rounded-[14px] bg-[--color-surface] p-5 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[--color-surface-2] to-[--color-surface] ring-1 ring-[--color-border-subtle]/60 shadow-inner flex items-center justify-center text-[12px] font-medium text-[--color-foreground]" aria-hidden="true" role="presentation">AM</div>
                      <div>
                        <CardTitle className="text-[13.5px] md:text-[15px] m-0 tracking-tight">Atifa Mesic</CardTitle>
                        <div className="text-[11px] md:text-[12.5px] text-[--color-foreground]">CEO</div>
                      </div>
                    </div>
                    {/* Konsolidierung: Kurzbeschreibung + CTA (Mail) */}
                    <div className="mt-4">
                      <div className="text-[11px] md:text-[12.5px] text-[--color-foreground-muted]">
                        Kurzprofil und Referenzen auf Anfrage verfügbar.
                      </div>
                      <div className="mt-3">
                        <Link
                          href={`mailto:${profileLinks.atifa.email}`}
                          className="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground] bg-[--color-surface-2] hover:bg-[--color-surface] ring-1 ring-inset ring-[--color-border-subtle]/40 transition-all duration-200 hover:-translate-y-0.5"
                          aria-label={`E-Mail an Atifa Mesic: ${profileLinks.atifa.email}`}
                        >
                          <span>Kontakt aufnehmen</span>
                          <span aria-hidden className="ml-1.5">✉</span>
                        </Link>
                      </div>
                      {(profileLinks.atifa.linkedin || profileLinks.atifa.website) && (
                        <div className="mt-3 flex items-center gap-2 text-[--color-foreground-muted]">
                          {profileLinks.atifa.linkedin && (
                            <Link href={profileLinks.atifa.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn – Atifa Mesic" className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Linkedin className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {profileLinks.atifa.website && (
                            <Link href={profileLinks.atifa.website} target="_blank" rel="noreferrer noopener" aria-label="Website – Atifa Mesic" className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Globe className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {profileLinks.atifa.email && (
                            <Link href={`mailto:${profileLinks.atifa.email}`} aria-label={`E-Mail – ${profileLinks.atifa.email}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle]/40 hover:bg-[--color-surface-2]">
                              <Mail className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                </ElegantCard>
                </InViewFade>
              </div>
            </section>
          )}
        </InViewFade>

        <div className="my-6 md:my-8 h-px bg-[--color-border-subtle]/30" role="separator" aria-hidden="true" />

        {/* Operating Model / Organigramm (früher positioniert) */}
        <InViewFade as="section" delay={0.065} aria-labelledby="operating-model-heading">
          <h3 id="operating-model-heading" className="not-prose text-[14px] md:text-[16px] font-medium mb-2 text-[--color-foreground]">{`${sub()} – ${tBp('headings.teamOrg')}`}</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
            <ElegantCard className="h-full" innerClassName="rounded-[14px] bg-[--color-surface] p-4 md:p-5">
                <CardTitle className="text-[13.5px] md:text-base tracking-tight">{tBp('headings.teamOrgCoreEngineering')}</CardTitle>
                <NumberedList>
                  <NumberedItem num={`${chapterIndex}.4.1`}>AI/Robotik (Perception, Planning, Policies)</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.2`}>Controls/Execution (Controller, HW‑Abstraktion)</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.3`}>Safety (Guardrails, Evaluierungen)</NumberedItem>
                </NumberedList>
            </ElegantCard>
            <ElegantCard className="h-full" innerClassName="rounded-[14px] bg-[--color-surface] p-4 md:p-5">
                <CardTitle className="text-[13.5px] md:text-base tracking-tight">{tBp('headings.teamOrgPlatformCloud')}</CardTitle>
                <NumberedList>
                  <NumberedItem num={`${chapterIndex}.4.4`}>Policy‑Hub, Tele‑Assist, Observability</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.5`}>Edge &lt;10ms, Canary‑Rollouts, CI/CD</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.6`}>Data/Telemetry, Compliance/Provenienz</NumberedItem>
                </NumberedList>
            </ElegantCard>
            <ElegantCard className="h-full" innerClassName="rounded-[14px] bg-[--color-surface] p-4 md:p-5">
                <CardTitle className="text-[13.5px] md:text-base tracking-tight">{tBp('headings.teamOrgProduct')}</CardTitle>
                <NumberedList>
                  <NumberedItem num={`${chapterIndex}.4.7`}>App‑Store & SDK (DX, Templates)</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.8`}>Roadmap, Priorisierung, UX</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.9`}>Partner‑Enablement, Docs</NumberedItem>
                </NumberedList>
            </ElegantCard>
            <ElegantCard className="h-full" innerClassName="rounded-[14px] bg-[--color-surface] p-4 md:p-5">
                <CardTitle className="text-[13.5px] md:text-base tracking-tight">{tBp('headings.teamOrgGtmPartnerships')}</CardTitle>
                <NumberedList>
                  <NumberedItem num={`${chapterIndex}.4.10`}>Design‑Partner, OEM/Integrator</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.11`}>SLAs, Demos, Referenzen</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.4.12`}>Rev‑Share, Developer‑Programm</NumberedItem>
                </NumberedList>
            </ElegantCard>
          </div>
        </InViewFade>

        {/* Management & Rollen – entfernt (redundant zu 7.1) */}

        {/* Rollen‑Skill‑Matrix */}
        <InViewFade as="section" delay={0.09} aria-labelledby="role-skill-heading">
          <h3 id="role-skill-heading" className="not-prose text-[14px] md:text-[16px] font-medium mb-2 text-[--color-foreground]">{`${sub()} – ${tBp('headings.roleSkillMatrix')}`}</h3>
          <div className="mt-3 rounded-2xl bg-[--color-surface]/60 ring-1 ring-[--color-border-subtle]/40 p-3 md:p-4">
            <TableSimple
              headers={[
                tBp('tables.headers.role'),
                tBp('tables.headers.ai'),
                tBp('tables.headers.controls'),
                tBp('tables.headers.cloud'),
                tBp('tables.headers.product'),
                tBp('tables.headers.safety'),
                tBp('tables.headers.sdk'),
                tBp('tables.headers.gtm'),
              ]}
              rows={[
                ['AI Engineer', '●', '○', '○', '○', '●', '○', '○'],
                ['Controls Engineer', '○', '●', '○', '○', '●', '○', '○'],
                ['Full‑stack Engineer', '○', '○', '●', '○', '○', '●', '○'],
                ['Platform/Cloud', '○', '○', '●', '○', '○', '○', '○'],
                ['Safety Engineer', '○', '○', '○', '○', '●', '○', '○'],
                ['SDK Engineer', '○', '○', '○', '○', '○', '●', '○'],
                ['Solutions', '○', '○', '○', '○', '○', '○', '●'],
                ['Product Manager', '○', '○', '○', '●', '○', '○', '○'],
                ['Business/Sales', '○', '○', '○', '○', '○', '○', '●'],
                ['Support/Admin', '○', '○', '○', '○', '○', '○', '○'],
              ]}
              animateRows
              zebra
              emphasizeFirstCol
            />
            <p className="mt-2 text-xs text-[--color-foreground-muted]">{tBp('notes.roleSkillLegend')}</p>
          </div>
        </InViewFade>

        {/* (Summary/CTA wurde nach oben verlegt) */}

        <InViewFade as="section" delay={0.11} aria-labelledby="team-plan-heading">
          <h3 id="team-plan-heading" className="not-prose text-[14px] md:text-[16px] font-medium mb-2 text-[--color-foreground]">{`${sub()} – ${tBp('headings.teamPlan')}`}</h3>
          {/* Headcount-Trend (aus ftePlan) */}
          {Array.isArray(ftePlan) && ftePlan.length > 0 && (
            <div className="not-prose mb-4">
              <LineChartAnimated
                data={ftePlan.map((r) => ({ label: String(r.year), value: Number(String(r.teamSize).replace(/[^0-9.\-]/g, '')) || 0 }))}
                width={720}
                height={220}
                ariaLabel={locale.startsWith('de') ? 'Teamgröße Verlauf' : 'Headcount trend'}
                showArea
                showPoints
                yTicksCount={4}
                padding={{ top: 12, right: 12, bottom: 22, left: 34 }}
                tooltipFormatter={(label, value) => `${label} • ${value} FTE`}
                responsive
              />
            </div>
          )}
          {/* Konsolidierte Rollen-/Fokus-Tabelle (redundante Aufzählungen entfernt) */}
          {Array.isArray(ftePlan) && ftePlan.length > 0 && (
            <div className="mt-7 max-w-5xl mx-auto rounded-2xl bg-[--color-surface]/60 ring-1 ring-[--color-border-subtle]/40 p-3.5 md:p-5" aria-label="Teamplan – Tabelle">
              <TableSimple
                headers={[tBp('tables.headers.year'), tBp('tables.headers.teamSize'), tBp('tables.headers.focus'), tBp('tables.headers.roles')]}
                rows={ftePlan.map((r) => [
                  String(r.year),
                  String(r.teamSize ?? ''),
                  Array.isArray((r as any).focus) ? (r as any).focus.join(', ') : (typeof (r as any).focus === 'string' ? (r as any).focus : ''),
                  Array.isArray(r.roles) ? r.roles.join(', ') : (r.roles ?? ''),
                ])}
                animateRows
                zebra
                emphasizeFirstCol
              />
            </div>
          )}
        </InViewFade>

        <InViewFade as="section" delay={0.16} aria-labelledby="esop-heading">
          <h3 id="esop-heading" className="not-prose text-[13px] md:text-[16px] font-medium mb-2 text-[--color-foreground]">{`${sub()} – ${tBp('headings.esop')}`}</h3>
          <div className="pb-20 md:pb-28">
          {/* ESOP KPI-Karten */}
          {Array.isArray(esopDetails) && esopDetails.length > 0 && (
            <div className="mt-6 mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7 justify-items-center">
              {[ 
                { title: 'Pool', value: '12–15%', sub: 'Initial 12%, erweiterbar', Icon: Percent },
                { title: 'Vesting', value: '4y / 1y Cliff', sub: 'Monatlich danach', Icon: Clock },
                { title: 'Acceleration', value: '50% Double‑Trigger', sub: 'CoC + Kündigung o.G.', Icon: Rocket },
                { title: 'FMV', value: 'jährlich (409A‑EU)', sub: 'Strike = FMV', Icon: LineChart },
              ].map((k, i) => (
                <InViewFade as="div" key={i} delay={0.02 + i * 0.035}>
                  <ElegantCard className="mx-auto w-full max-w-[360px]" innerClassName="text-center rounded-[14px] bg-[--color-surface] py-6 md:py-7 px-5">
                      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[--color-surface-2] ring-1 ring-[--color-border-subtle]/40">
                        <k.Icon className="h-5.5 w-5.5 text-[--color-foreground]" aria-hidden />
                      </div>
                      <CardTitle className="text-[13.5px] md:text-sm text-[--color-foreground-muted]">{k.title}</CardTitle>
                      {/* Mini-Chart Visual unter dem Titel */}
                      <div className="kpi-visual my-3">
                        {k.title === 'Pool' ? (
                          <MiniDonut value={0.13} color="#22c55e" bg="rgba(34,197,94,0.12)" ariaLabel="ESOP Pool utilization" />
                        ) : k.title === 'Vesting' ? (
                          <MiniBarChart
                            series={[0, 25, 50, 75, 100]}
                            height={90}
                            color="#3b82f6"
                            ariaLabel="Vesting schedule"
                            yTicksCount={3}
                            showGrid
                            xLabels={[locale.startsWith('de') ? 'Cliff' : 'Cliff', 'Y2', 'Y3', 'Y4', 'Full']}
                            valueFormatter={(v) => `${v}%`}
                          />
                        ) : k.title === 'Acceleration' ? (
                          <MiniBarChart
                            series={[0, 0, 50]}
                            height={90}
                            color="#f59e0b"
                            ariaLabel="Acceleration policy"
                            yTicksCount={2}
                            showGrid
                            xLabels={[locale.startsWith('de') ? 't0' : 't0', 'CoC', 'Double']}
                            valueFormatter={(v) => `${v}%`}
                          />
                        ) : (
                          <LineChartAnimated
                            data={[{label:'Y0',value:1},{label:'Y1',value:1.15},{label:'Y2',value:1.3},{label:'Y3',value:1.5}]}
                            width={360}
                            height={110}
                            ariaLabel={locale.startsWith('de') ? 'FMV Verlauf' : 'FMV trend'}
                            showArea
                            showPoints
                            yTicksCount={3}
                            padding={{ top: 8, right: 8, bottom: 18, left: 30 }}
                            tooltipFormatter={(label, value) => `${label} • ${value.toFixed(2)}x`}
                            responsive
                          />
                        )}
                      </div>
                      <div className="kpi-value-row mt-2.5 text-[28px] md:text-[34px] font-semibold tracking-tight text-gradient-subtle kpi-value">{k.value}</div>
                      <div className="mx-auto mt-5 h-px w-9/12 bg-[--color-border-subtle]/20"></div>
                      <div className="kpi-sub mt-3.5 text-[11px] md:text-xs text-[--color-foreground-muted]">{k.sub}</div>
                  </ElegantCard>
                </InViewFade>
              ))}
            </div>
          )}

          {Array.isArray(esopDetails) && esopDetails.length > 0 ? (
            <ul className="mt-8 list-none pl-0">
              {esopDetails.map((item, i) => (<li key={i}>{item}</li>))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{tBp('notes.esop')}</p>
          )}
          </div>
        </InViewFade>
      </div>
      {/* Checklist entfernt gemäß Vorgabe */}
    </div>
  );
}
