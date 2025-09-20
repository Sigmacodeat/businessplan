import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import ElegantCard from '@/components/ui/ElegantCard';
import MiniDonut from '@/components/charts/MiniDonut';
import MiniBarChart from '@/components/chapters/timeline/MiniBarChart';
import LineChartAnimated from '@/components/charts/LineChartAnimated';
import { KPI_ANIM_DURATION, KPI_BAR_HEIGHT, KPI_SPARK_HEIGHT, KPI_DONUT_CLASS, getKpiDelay } from '@/components/charts/kpiAnimation';
import SectionCard from '@components/chapters/SectionCard';
import TableSimple from '@/components/ui/TableSimple';
import { NumberedList, NumberedItem } from '@components/chapters/NumberedList';
import { Brain, Store, ShieldCheck, BadgeCheck, ExternalLink, Timer, Wrench, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'technology')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) }
  };
}

export default async function TechnologyPage() {
  const t = await getTranslations('bp');
  const locale = await getLocale();
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'technology')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${t('sections.technology')}`;
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const bpAny = bp as any;
  const stack = (bpAny?.technology?.stack as string[] | undefined) ?? [];
  const paragraphs = (bpAny?.technology?.paragraphs as string[] | undefined) ?? [];
  const timelinePhases = (bpAny?.technology?.timelinePhases as Array<{period: string; items?: string[]}> | undefined) ?? [];
  const workPackages = (bpAny?.technology?.workPackages as Array<{id?: string; name: string; timeline?: string; deliverables?: string[]}> | undefined) ?? [];
  // Neue optionale Inhalte
  const hardwareTargets = (bpAny?.technology?.hardwareTargets as string[] | undefined) ?? [];
  const sensorsCompute = (bpAny?.technology?.sensorsCompute as string[] | undefined) ?? [];
  const datasets = (bpAny?.technology?.datasets as string[] | undefined) ?? [];
  const integrationPlan = (bpAny?.technology?.integrationPlan as string[] | undefined) ?? [];
  // Technische Spezifikationen (Humanoide) aus marketCompetitive (vorher in Market platziert)
  const specsHeaders = (bpAny?.marketCompetitive?.specsHeaders as string[] | undefined) ?? [];
  const specsRows = (bpAny?.marketCompetitive?.specsRows as Array<(string|number)[]> | undefined) ?? [];
  // Quellen aus der letzten Spalte der Spezifikations-Tabelle extrahieren (URLs sammeln, deduplizieren)
  const specsSources: string[] = (() => {
    try {
      if (!Array.isArray(specsRows) || specsRows.length === 0) return [];
      const urls = new Set<string>();
      for (const r of specsRows) {
        const last = r?.[r.length - 1];
        if (typeof last === 'string') {
          const matches = last.match(/https?:\/\/[^\s)]+/g) || [];
          matches.forEach((u) => urls.add(u));
        }
      }
      return Array.from(urls);
    } catch {
      return [];
    }
  })();

  // Einheitliche Unterkapitel-Nummerierung (wie team/risks)
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>

        {/* KPI-Stat-Karten (Technology) – tech-spezifisch */}
        <div className="not-prose mt-6 grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {(() => {
            const de = locale.startsWith('de');
            const techKpi = (bpAny?.technology?.kpi as any) ?? {};
            const cards = [
              { key: 'uptime', label: de ? 'Uptime' : 'Uptime', value: typeof techKpi?.uptime === 'string' ? techKpi.uptime : '99.99%', sub: de ? 'Systemverfügbarkeit' : 'system availability' },
              { key: 'latency', label: de ? 'Latenz p95' : 'Latency p95', value: typeof techKpi?.latencyP95 === 'string' ? techKpi.latencyP95 : (de ? '<10 ms' : '<10 ms'), sub: de ? 'End‑to‑End' : 'end‑to‑end' },
              { key: 'build', label: de ? 'Build‑Zeit' : 'Build time', value: typeof techKpi?.buildTime === 'string' ? techKpi.buildTime : (de ? '~8 min' : '~8 min'), sub: de ? 'CI Pipeline' : 'CI pipeline' },
              { key: 'trl', label: 'TRL', value: typeof techKpi?.trl === 'string' ? techKpi.trl : '3 → 8 (2030)', sub: de ? 'Technologiereifegrad' : 'technology readiness' },
            ] as const;
            return cards.map((s, idx) => (
            <InViewFade key={`${String(s.label)}-${idx}`} delay={idx * 0.05} className="h-full">
              <ElegantCard
                className="h-full"
                innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
                ariaLabel={`${s.label} KPI Card`}
                role="group"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted]">
                    {(() => {
                      const Icon = s.key === 'uptime' ? ShieldCheck : s.key === 'latency' ? Timer : s.key === 'build' ? Wrench : GraduationCap;
                      return <Icon className="h-3.5 w-3.5 text-[--color-foreground-muted]" aria-hidden />;
                    })()}
                    <span>{s.label}</span>
                  </div>
                  <div className="mb-3 kpi-visual">
                    {s.key === 'uptime' ? (
                      <MiniDonut
                        value={0.9999}
                        color="#22c55e"
                        bg="rgba(34,197,94,0.12)"
                        delay={getKpiDelay(idx)}
                        duration={KPI_ANIM_DURATION}
                        className={KPI_DONUT_CLASS}
                      />
                    ) : s.key === 'latency' ? (
                      <MiniBarChart
                        series={[14, 12, 11, 10, 9]}
                        height={110}
                        color="#f59e0b"
                        ariaLabel="Latency p95 trend"
                        yTicksCount={3}
                        showGrid
                        xLabels={['M-4','M-3','M-2','M-1','Now']}
                        valueFormatter={(v) => `${v} ms`}
                      />
                    ) : s.key === 'build' ? (
                      <LineChartAnimated
                        data={[
                          { label: 'W-4', value: 12 },
                          { label: 'W-3', value: 10 },
                          { label: 'W-2', value: 9 },
                          { label: 'W-1', value: 8 },
                          { label: 'Now', value: 8 },
                        ]}
                        width={520}
                        height={120}
                        ariaLabel={locale.startsWith('de') ? 'Build-Zeit Verlauf' : 'Build time trend'}
                        showArea={false}
                        showPoints
                        yTicksCount={3}
                        gradientArea={false}
                        padding={{ top: 8, right: 8, bottom: 18, left: 30 }}
                        tooltipFormatter={(label, value) => `${label} • ${value} min`}
                        responsive
                      />
                    ) : (
                      <MiniDonut
                        value={0.375}
                        color="#3b82f6"
                        bg="rgba(59,130,246,0.1)"
                        delay={getKpiDelay(idx)}
                        duration={KPI_ANIM_DURATION}
                        className={KPI_DONUT_CLASS}
                      />
                    )}
                  </div>
                  <div className="kpi-value-row [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
                    {s.value}
                  </div>
                  <div className="mx-auto mt-2 h-px w-8/12 bg-[--color-border-subtle]/25" aria-hidden />
                  <div className="mt-1.5 text-[12px] md:text-[12.5px] text-[--color-foreground] opacity-85 one-line">{s.sub}</div>
                </div>
              </ElegantCard>
            </InViewFade>
            ));
          })()}
        </div>

        {Array.isArray(paragraphs) && paragraphs.length > 0 && (
          <InViewFade as="section" delay={0.01}>
            <SectionCard>
              <ul className="not-prose space-y-3">
                {paragraphs.map((p: string, i: number) => {
                  const lower = (p ?? '').toLowerCase();
                  const Icon = lower.includes('ki') || lower.includes('agent') ? Brain
                    : lower.includes('app') || lower.includes('store') ? Store
                    : lower.includes('safety') || lower.includes('compliance') || lower.includes('iso') || lower.includes('ce') ? ShieldCheck
                    : lower.includes('ip') || lower.includes('strategie') || lower.includes('patent') ? BadgeCheck
                    : undefined;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-md bg-[--muted]/30 ring-1 ring-[--color-border-subtle] text-[--color-foreground-muted] flex-shrink-0">
                        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : <span className="h-1.5 w-1.5 rounded-full bg-[--color-primary] inline-block" aria-hidden />}
                      </span>
                      <p className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] opacity-95">{p}</p>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </InViewFade>
        )}

        {/* Neue optionale Abschnitte: Hardware‑Targets, Sensorik/Compute, Datasets, Integrationsplan */}
        {hardwareTargets.length > 0 && (
          <InViewFade as="section" delay={0.015}>
            <SectionCard>
              <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Hardware‑Zielplattformen`}</h3>
              <NumberedList>
                {hardwareTargets.map((line, i) => (
                  <NumberedItem key={i} num={`${chapterIndex}.1.${i + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            </SectionCard>
          </InViewFade>
        )}

        {sensorsCompute.length > 0 && (
          <InViewFade as="section" delay={0.02}>
            <SectionCard>
              <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Sensorik & Compute`}</h3>
              <NumberedList>
                {sensorsCompute.map((line, i) => (
                  <NumberedItem key={i} num={`${chapterIndex}.2.${i + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            </SectionCard>
          </InViewFade>
        )}

        {/* Technische Spezifikationen (Humanoide) – hier fachlich korrekt platziert */}
        {(Array.isArray(specsHeaders) && specsHeaders.length > 0 && Array.isArray(specsRows) && specsRows.length > 0) && (
          <InViewFade as="section" delay={0.025}>
            <SectionCard>
              <div className="not-prose flex items-center justify-between gap-2">
                <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Technische Spezifikationen (Humanoide)`}</h3>
                {specsSources.length > 0 && (
                  <div className="shrink-0 flex flex-wrap gap-1.5" aria-label={locale.startsWith('de') ? 'Quellen' : 'Sources'}>
                    {specsSources.slice(0, 3).map((u, i) => {
                      let host = '';
                      try { host = new URL(u).hostname.replace(/^www\./, ''); } catch {}
                      const label = host || (locale.startsWith('de') ? 'Quelle' : 'Source');
                      return (
                        <a key={`${u}-${i}`} href={u} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5 hover:text-[--color-foreground]" title={u} aria-label={`${locale.startsWith('de') ? 'Quelle' : 'Source'}: ${u}`}>
                          <ExternalLink className="h-3 w-3" aria-hidden />
                          <span>{label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              <TableSimple
                headers={specsHeaders}
                rows={specsRows}
                animateRows
                rowVariant="fadeInUp"
                stagger={0.035}
                zebra
                denseRows
                emphasizeFirstCol
                className="mt-2"
              />
              <div className="mt-2 text-[11px] text-[--color-foreground-muted]">
                {locale.startsWith('de')
                  ? 'Angaben indikativ/konservativ; Quellen siehe letzte Spalte (z. B. Figure, Agility sowie Wikipedia/Humanoid.guide/Robotics24/7 für Tesla Optimus). Offizielle Tesla‑Spezifikationen teils tbd.'
                  : 'Indicative/conservative; see last column for sources (e.g., Figure, Agility and Wikipedia/Humanoid.guide/Robotics24/7 for Tesla Optimus). Official Tesla specs partly tbd.'}
              </div>
            </SectionCard>
          </InViewFade>
        )}

        {datasets.length > 0 && (
          <InViewFade as="section" delay={0.03}>
            <SectionCard>
              <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Kuratierte Datensätze & Lizenzen`}</h3>
              <NumberedList>
                {datasets.map((line, i) => (
                  <NumberedItem key={i} num={`${chapterIndex}.3.${i + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            </SectionCard>
          </InViewFade>
        )}

        {integrationPlan.length > 0 && (
          <InViewFade as="section" delay={0.035}>
            <SectionCard>
              <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Integrationsplan (Kurz)`}</h3>
              <NumberedList>
                {integrationPlan.map((line, i) => (
                  <NumberedItem key={i} num={`${chapterIndex}.4.${i + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            </SectionCard>
          </InViewFade>
        )}

        {/* Anchors for architecture & ffg-tech */}
        <span id="architecture" className="sr-only" aria-hidden="true" />
        <span id="ffg-tech" className="sr-only" aria-hidden="true" />
        <InViewFade as="section" delay={0.02}>
          <SectionCard>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.stack')}`}</h3>
            {stack.length > 0 ? (
              <NumberedList>
                {stack.map((s, i) => {
                  const raw = String(s ?? '');
                  const idx = raw.indexOf(':');
                  const left = (idx > -1 ? raw.slice(0, idx) : raw).trim();
                  const right = (idx > -1 ? raw.slice(idx + 1) : '').trim();
                  const title = left;
                  const lower = left.toLowerCase();
                  const IconComp =
                    lower.includes('ki') || lower.includes('ai') ? Brain :
                    lower.includes('app') || lower.includes('store') ? Store :
                    lower.includes('safety') || lower.includes('compliance') ? ShieldCheck :
                    lower.includes('ip') || lower.includes('strategie') ? BadgeCheck :
                    undefined;
                  return (
                    <NumberedItem
                      key={i}
                      num={`${chapterIndex}.1.${i + 1}`}
                      title={title}
                      Icon={IconComp as any}
                    >
                      {right}
                    </NumberedItem>
                  );
                })}
              </NumberedList>
            ) : (
              <NumberedList>
                <NumberedItem num={`${chapterIndex}.1.1`} title="KI‑Framework" Icon={Brain}>SIGMACODE AI Agenten‑System, erweitert für Robotik (Verhaltenssteuerung, Orchestrierung).</NumberedItem>
                <NumberedItem num={`${chapterIndex}.1.2`} title="App‑Store" Icon={Store}>Cloud‑basierte Microservice‑Architektur mit Payment & Lizenzsystem.</NumberedItem>
                <NumberedItem num={`${chapterIndex}.1.3`} title="Safety & Compliance" Icon={ShieldCheck}>Umsetzung EU AI Act & ISO 13482, Auditierbarkeit & Guardrails.</NumberedItem>
                <NumberedItem num={`${chapterIndex}.1.4`} title="IP‑Strategie" Icon={BadgeCheck}>Schutz von Framework, Safety‑Layer & Orchestrierung (Patente/Marken).</NumberedItem>
              </NumberedList>
            )}
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.04}>
          <SectionCard>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.overview')}`}</h3>
            <NumberedList>
              <NumberedItem num={`${chapterIndex}.2.1`} title="Multi-Agenten-Architektur">Modulare Software-Agenten für Verhalten, Planung und Kommunikation</NumberedItem>
              <NumberedItem num={`${chapterIndex}.2.2`} title="Integration von LangChain & Reinforcement Learning">Für adaptive Skills</NumberedItem>
              <NumberedItem num={`${chapterIndex}.2.3`} title="Middleware (ROS2-basiert)">Zur Anbindung an verschiedene Roboterplattformen</NumberedItem>
              <NumberedItem num={`${chapterIndex}.2.4`} title="Safety-Layer">Umsetzung EU AI Act & ISO 13482</NumberedItem>
              <NumberedItem num={`${chapterIndex}.6.3.3`} title="SIGMACODE AI Integration">KI-Agenten arbeiten nicht nur im Roboter, sondern auch in der Cloud für komplexe Workflows</NumberedItem>
            </NumberedList>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.06}>
          <SectionCard>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.workPackages')}`}</h3>
            {workPackages.length > 0 ? (
              <div className="not-prose grid gap-4 md:gap-5">
                {workPackages.map((ap, i) => (
                  <div
                    key={i}
                    className="not-prose rounded-2xl ring-1 ring-[--color-border-subtle]/50 bg-[--color-surface]/70 backdrop-blur-sm p-4 md:p-5 shadow-none transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <h3 className="text-[13px] md:text-[14px] font-semibold tracking-tight text-[--color-foreground] mb-1">
                          {ap.id ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-[--color-border-subtle] bg-[--muted]/30 text-[--color-foreground]">
                                {ap.id}
                              </span>
                              <span className="truncate">{ap.name}</span>
                            </span>
                          ) : (
                            <span className="truncate">{ap.name}</span>
                          )}
                        </h3>
                        {ap.timeline && (
                          <div className="flex items-center gap-1.5 text-[12px] text-[--color-foreground-muted]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{t('headings.timeline')}:</span>
                            <span className="truncate">{ap.timeline}</span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle] bg-[--color-surface] text-[--color-foreground-muted] shrink-0" aria-hidden>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    {Array.isArray(ap.deliverables) && ap.deliverables.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground]">
                          <svg className="w-3.5 h-3.5 text-[--color-foreground-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t('tables.headers.deliverables')}
                        </div>
                        <ul className="space-y-1.5">
                          {ap.deliverables.map((d, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[12px] md:text-[13px]">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[--color-primary] flex-shrink-0" />
                              <span className="text-[--color-foreground] opacity-80 leading-relaxed">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="not-prose grid gap-4 md:gap-5">
                <div className="not-prose rounded-2xl ring-1 ring-[--color-border-subtle]/50 bg-[--color-surface]/70 backdrop-blur-sm p-4 md:p-5 shadow-none transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="text-[13px] md:text-[14px] font-semibold tracking-tight text-[--color-foreground] mb-1">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-[--color-border-subtle] bg-[--muted]/30 text-[--color-foreground]">AP1</span>
                          <span className="truncate">Software-Framework für Roboter-KI</span>
                        </span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-[12px] text-[--color-foreground-muted]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Zeitplan:</span>
                        <span className="truncate">Q1-Q2 2025</span>
                      </div>
                    </div>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-[--color-border-subtle] bg-[--color-surface] text-[--color-foreground-muted] shrink-0" aria-hidden>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground] mb-1.5">
                        <svg className="w-3.5 h-3.5 text-[--color-foreground-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Ziel
                      </div>
                      <p className="text-[12px] md:text-[13px] text-[--color-foreground] opacity-80 leading-relaxed">Adaption der SIGMACODE AI-Agentenarchitektur für humanoide Roboter</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground] mb-1.5">
                        <svg className="w-3.5 h-3.5 text-[--color-foreground-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Inhalte
                      </div>
                      <p className="text-[12px] md:text-[13px] text-[--color-foreground] opacity-80 leading-relaxed">KI-Agenten für Bewegungsplanung, Wahrnehmung, Interaktion; ROS2-Middleware</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[--color-foreground]">
                        <svg className="w-3.5 h-3.5 text-[--color-foreground-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Deliverables
                      </div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-[12px] md:text-[13px]">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[--color-primary] flex-shrink-0" />
                          <span className="text-[--color-foreground] opacity-80 leading-relaxed">API-Dokumentation</span>
                        </li>
                        <li className="flex items-start gap-2 text-[12px] md:text-[13px]">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[--color-primary] flex-shrink-0" />
                          <span className="text-[--color-foreground] opacity-80 leading-relaxed">Prototyp v0.1</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.08}>
          <SectionCard>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.roadmap')} & ${t('headings.trl')}`}</h3>
            <NumberedList>
              <NumberedItem num={`${chapterIndex}.4.1`} title="2025">TRL 3 (technologische Konzeptvalidierung)</NumberedItem>
              <NumberedItem num={`${chapterIndex}.4.2`} title="2026">TRL 4 (Roboter-Demonstrator online)</NumberedItem>
              <NumberedItem num={`${chapterIndex}.4.3`} title="2027">TRL 5 (Alltagsszenarien erfolgreich)</NumberedItem>
              <NumberedItem num={`${chapterIndex}.4.4`} title="2028">TRL 6 (Appstore Beta + externe Entwickler)</NumberedItem>
              <NumberedItem num={`${chapterIndex}.4.5`} title="2029">TRL 7 (RaaS Pilotprojekte)</NumberedItem>
              <NumberedItem num={`${chapterIndex}.4.6`} title="2030">TRL 8 (Zertifizierter EU-Launch)</NumberedItem>
            </NumberedList>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.1}>
          <SectionCard>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.roadmap')}`}</h3>
            {timelinePhases.length > 0 ? (
              <div className="not-prose grid gap-3">
                {timelinePhases.map((ph, i) => (
                  <div key={i} className="prose">
                    <h4 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">
                      <span className="mr-2 text-[--color-foreground] font-medium">{`${chapterIndex}.5.${i + 1}`}</span>
                      <span>{ph.period}</span>
                    </h4>
                    {Array.isArray(ph.items) && ph.items.length > 0 && (
                      <NumberedList>
                        {ph.items.map((it, idx) => (
                          <NumberedItem key={idx} num={`${chapterIndex}.5.${i + 1}.${idx + 1}`}>{it}</NumberedItem>
                        ))}
                      </NumberedList>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h4 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">
                  <span className="mr-2 text-[--color-foreground] font-medium">{`${chapterIndex}.5.1`}</span>
                  <span>2025 – Grundlagen & Prototyping</span>
                </h4>
                <NumberedList>
                  <NumberedItem num={`${chapterIndex}.5.1.1`}>Aufbau Kernteam Robotik, Entwicklung erster KI-Agenten für Robotik</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.5.1.2`}>Integration SIGMACODE AI‑Plattform mit ROS2, Beschaffung erster Humanoider</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.5.1.3`}>Erste Proof-of-Concept-Softwaremodule</NumberedItem>
                </NumberedList>
              </>
            )}
          </SectionCard>
        </InViewFade>

        {/* Anchor for Responsible AI / Compliance cross-links */}
        <span id="responsible-ai" className="sr-only" aria-hidden="true" />
        <InViewFade as="section" delay={0.12}>
          <SectionCard>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.safety')}`}</h3>
            <NumberedList>
              <NumberedItem num={`${chapterIndex}.6.1`} title="EU AI Act Compliance">Implementierung von Safety-Standards und Risikobewertung</NumberedItem>
              <NumberedItem num={`${chapterIndex}.6.2`} title="ISO 13482">Sicherheitsanforderungen für Serviceroboter</NumberedItem>
              <NumberedItem num={`${chapterIndex}.6.3`} title="CE-Zertifizierung">Für Marktzugang in Europa</NumberedItem>
              <NumberedItem num={`${chapterIndex}.6.4`} title="Datenschutz (DSGVO)">Sichere Datenverarbeitung und Privacy-by-Design</NumberedItem>
              <NumberedItem num={`${chapterIndex}.6.5`} title="Fail-Safe-Mechanismen">Redundante Systeme und Notfallprotokolle</NumberedItem>
            </NumberedList>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.14}>
          <SectionCard id="ip">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.ipMoat')}`}</h3>
            <NumberedList>
              <NumberedItem num={`${chapterIndex}.7.1`} title="Software-Framework">Schutz durch Patente und Urheberrechte</NumberedItem>
              <NumberedItem num={`${chapterIndex}.7.2`} title="Safety-Layer">Proprietäre Algorithmen und Sicherheitsprotokolle</NumberedItem>
              <NumberedItem num={`${chapterIndex}.7.3`} title="Orchestrierung">Eigene Middleware und API-Standards</NumberedItem>
              <NumberedItem num={`${chapterIndex}.7.4`} title="Markenrechte">SigmaCode AI und Roboter-Appstore als eingetragene Marken</NumberedItem>
              <NumberedItem num={`${chapterIndex}.7.5`} title="Open-Source-Strategie">Ausgewählte Komponenten für Community-Beiträge</NumberedItem>
            </NumberedList>
          </SectionCard>
        </InViewFade>

        {/* Anchors for innovation, aws-innovation & aws-scalability */}
        <InViewFade as="section" delay={0.16}>
          <SectionCard id="innovation">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('headings.innovation')} & ${t('headings.awsCompliance')}`}</h3>
            <span id="aws-innovation" className="sr-only" aria-hidden="true" />
            <span id="aws-scalability" className="sr-only" aria-hidden="true" />
            <NumberedList>
              <NumberedItem num={`${chapterIndex}.8.1`} title="Innovationsgrad">Erste Plattform-Ökonomie für humanoide Roboter mit modularen KI-Agenten</NumberedItem>
              <NumberedItem num={`${chapterIndex}.8.2`} title="Skalierbarkeit">Cloud-native Architektur ermöglicht unbegrenzte horizontale Skalierung</NumberedItem>
              <NumberedItem num={`${chapterIndex}.8.3`} title="Modularität">Einfache Integration neuer Roboter-Hardware und Skills</NumberedItem>
              <NumberedItem num={`${chapterIndex}.8.4`} title="API-First">Offene Schnittstellen für Partner und Entwickler</NumberedItem>
            </NumberedList>
          </SectionCard>
        </InViewFade>
      </div>

      {/* Notizen-Box und Checklist entfernt gemäß Vorgabe */}
    </div>
  );
}
