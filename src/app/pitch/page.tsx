  "use client";

import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform, useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useId, type ElementType } from "react";
import { chapters } from "@/chapters/chapters.config";
import RobotIcon from "@/components/ui/RobotIcon";
import Reveal from "@/components/animation/Reveal";
import { defaultTransition, defaultViewport } from "@/components/animation/variants";
import { getMessages } from "@/i18n/messages";
import { buildLocalePath } from "@/i18n/path";
import Link from "next/link";
import ElegantCard from "@/components/ui/ElegantCard";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Sparkles, LineChart, Rocket, Cpu, Users, AlertTriangle, Target, Banknote, Leaf, Flag, Briefcase, Mail, Printer, ChevronsDown, Mouse } from "lucide-react";
import PitchCoverPage from "@/components/document/PitchCoverPage";
import ClosingPage from "@/components/document/ClosingPage";
import PrintTOC from "@/components/document/PrintTOC";
// KPI / Charts
import MiniBarChart from "@/components/chapters/timeline/MiniBarChart";
import LineChartAnimated from "@/components/charts/LineChartAnimated";
import MiniDonut from "@/components/charts/MiniDonut";
import { KPI_ANIM_DURATION, KPI_DONUT_CLASS, getKpiDelay } from "@/components/charts/kpiAnimation";
import { getChapterTheme } from "@/app/chapters/chapterTheme";

// Orchestrierte, links->rechts Stagger-Animation für KPI-Grids
const kpiContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const kpiItemVariants = {
  hidden: { opacity: 0, x: -16, y: 6 },
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.42 } },
};

// Gleiches Prinzip für die Bullet-Listen in allen Kapitel-Sections
const bulletContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const bulletItemVariants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.38 } },
};

// Früheres Scroll-Laden: spezielles Viewport-Setup nur für die Pitch-Seite
// amount 0.02 (~2% Sichtbarkeit) mit moderateren Margins, damit Trigger verlässlicher feuern
const PITCH_VIEWPORT = { once: true, amount: 0.02, margin: "-20% 0px -20% 0px" } as const;

type SimpleKpi = { label: string; value: string | number; sub?: string };

// 5s Intro Splash Overlay (entfernt)
//
function extractFinanceKpis(messages: Messages | null): SimpleKpi[] {
  if (!messages) return [];
  const m: any = messages;
  const fin = (m.content?.finance ?? m.finance ?? {}) as any;
  const labels = fin?.kpis?.labels ?? {};
  const units = fin?.kpis?.units ?? {};
  const values = fin?.kpis?.values ?? {};
  const deltas = fin?.kpis?.deltas ?? {};
  const items: SimpleKpi[] = [];
  if (typeof values.cac !== 'undefined') {
    const sub = typeof deltas.cac !== 'undefined' ? `${deltas.cac > 0 ? '+' : ''}${deltas.cac}%` : undefined;
    items.push({ label: `CAC`, value: `${values.cac}${units.cac ? ` ${units.cac}` : ''}`, ...(sub ? { sub } as { sub: string } : {}) });
  }
  if (typeof values.ltv !== 'undefined') {
    const sub = typeof deltas.ltv !== 'undefined' ? `${deltas.ltv > 0 ? '+' : ''}${deltas.ltv}%` : undefined;
    items.push({ label: `LTV`, value: `${values.ltv}${units.ltv ? ` ${units.ltv}` : ''}`, ...(sub ? { sub } as { sub: string } : {}) });
  }
  if (typeof values.payback !== 'undefined') {
    items.push({ label: labels?.payback ?? 'Payback', value: `${values.payback}${units.payback ? ` ${units.payback}` : ''}` });
  }
  if (typeof values.grossMargin !== 'undefined') {
    const sub = typeof deltas.grossMargin !== 'undefined' ? `${deltas.grossMargin > 0 ? '+' : ''}${deltas.grossMargin}%` : undefined;
    items.push({ label: labels?.grossMargin ?? 'Gross Margin', value: `${values.grossMargin}${units.grossMargin ? units.grossMargin : '%'}`, ...(sub ? { sub } as { sub: string } : {}) });
  }
  return items;
}

function extractTractionKpis(messages: Messages | null): SimpleKpi[] {
  if (!messages) return [];
  const bp: any = (messages as any).bp ?? {};
  const list = Array.isArray(bp.tractionKpis?.kpis) ? bp.tractionKpis.kpis as Array<{label: string; value: number; unit?: string}> : [];
  return list.slice(0, 4).map((k) => ({ label: k.label, value: `${k.value}${k.unit ? ` ${k.unit}` : ''}` }));
}

type Messages = Awaited<ReturnType<typeof getMessages>> & { content: any };

// Unerwünschte Einträge aus Bullets zentral filtern
function shouldHideBullet(text: string): boolean {
  if (!text) return false;
  const t = String(text).trim();
  // Entfernt exakt den Punkt "12 Arbeitspakete" (Groß-/Kleinschreibung ignorieren, flexible Spaces)
  return /(^|\b)12\s*Arbeitspakete(\b|$)/i.test(t);
}

function usePitchMessages() {
  const localeHookVal = useLocale();
  const [locale, setLocale] = useState<string>(localeHookVal || "de");
  const [msgs, setMsgs] = useState<Messages | null>(null);

  useEffect(() => {
    let active = true;
    const loc = (localeHookVal || locale || "de").startsWith("de") ? "de" : "en";
    getMessages(loc as "de" | "en").then((m) => {
      if (!active) return;
      setMsgs(m as Messages);
      setLocale(loc);
    }).catch(() => {
      // Fallback: DE
      getMessages("de").then((m) => active && setMsgs(m as Messages));
    });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localeHookVal]);

  return { locale, messages: msgs } as const;
}

function extractBulletsForChapter(slug: string, messages: Messages | null): string[] {
  if (!messages) return [];
  const m: any = messages;
  const content = (m.content ?? {}) as any;

  switch (slug) {
    case "executive": {
      const exec: string[] = [];
      const comp = content.company ?? {};
      const sol = content.solution ?? {};
      const mkt = content.market ?? {};
      if (comp.name || comp.industry || comp.location) {
        exec.push([
          comp.name ? String(comp.name) : null,
          comp.industry ? String(comp.industry) : null,
          comp.location ? String(comp.location) : null,
        ].filter(Boolean).join(" • "));
      }
      if (comp.vision) exec.push(String(comp.vision));
      if (comp.mission) exec.push(String(comp.mission));
      // Lösung/Produkt in 2-3 kurzen Punkten
      const solPoints = [sol.rass, sol.appstore, sol.agents, sol.integration, sol.usp]
        .map(x => (typeof x === 'string' && x.trim().length > 0) ? x : null)
        .filter(Boolean) as string[];
      exec.push(...solPoints.slice(0, 3));
      // Markt-Kurzfassung TAM/SAM/SOM
      const marketLine = [mkt.tam, mkt.sam, mkt.som]
        .map(x => (typeof x === 'string' && x.trim().length > 0) ? x : null)
        .filter(Boolean)
        .join(" • ");
      if (marketLine) exec.push(marketLine);

      // Fallbacks, falls oben nichts verfügbar ist
      if (exec.length === 0) {
        // 1) content.executive.bullets
        const execBullets = (content.executive && Array.isArray((content as any).executive.bullets)) ? (content as any).executive.bullets as string[] : [];
        if (execBullets.length > 0) return execBullets.slice(0, 8);
        // 2) bp.executive.bullets
        const bex = (m.bp?.executive ?? {}) as any;
        if (Array.isArray(bex.bullets) && bex.bullets.length > 0) return (bex.bullets as string[]).slice(0, 8);
        // 3) bp.execFacts oder execFacts im Root
        const facts = (m.bp?.execFacts ?? m.execFacts ?? {}) as Record<string, unknown>;
        const preferredKeys = ['tagline', 'summary', 'vision', 'mission', 'valueProp', 'positioning'];
        const factLines = preferredKeys
          .map(k => facts[k])
          .filter(v => typeof v === 'string' && (v as string).trim().length > 0) as string[];
        if (factLines.length > 0) return factLines.slice(0, 8);
      }

      return exec.slice(0, 8);
    }
    case "business-model": {
      const bm = content.businessModel ?? {};
      const bullets: string[] = [];
      if (Array.isArray(bm.valueProp)) bullets.push(...bm.valueProp);
      if (Array.isArray(bm.pricing)) bullets.push(...bm.pricing);
      const streamsRaw = bm.revenueStreams ?? bm.streams ?? [];
      if (Array.isArray(streamsRaw)) bullets.push(...streamsRaw.map((x: any) => typeof x === "string" ? x : (x?.type ? `${x.type}: ${x?.description ?? ""}` : String(x))));
      if (Array.isArray(bm.unitEconomics)) bullets.push(...bm.unitEconomics);
      if (Array.isArray(bm.salesChannels)) bullets.push(...bm.salesChannels);
      if (Array.isArray(bm.partnerships)) bullets.push(...bm.partnerships);
      return bullets.slice(0, 8);
    }
    case "market": {
      const market = content.market ?? (m.market ?? {});
      const bullets: string[] = [];
      if (Array.isArray(market.description)) bullets.push(...market.description);
      if (Array.isArray(market.competitiveAdvantage)) bullets.push(...market.competitiveAdvantage);
      if (market.tam) bullets.push(String(market.tam));
      if (market.sam) bullets.push(String(market.sam));
      if (market.som) bullets.push(String(market.som));
      // Traction bullets
      if (Array.isArray(market.traction)) bullets.push(...market.traction);
      return bullets.slice(0, 8);
    }
    case "gtm": {
      const gtm = content.gtm ?? (m.gtm ?? {});
      const bullets: string[] = [];
      if (Array.isArray(gtm.phase1)) bullets.push(...gtm.phase1);
      if (Array.isArray(gtm.tactics)) bullets.push(...gtm.tactics);
      if (Array.isArray(gtm.kpis)) bullets.push(...gtm.kpis);
      return bullets.slice(0, 8);
    }
    case "finance": {
      const fin = content.finance ?? (m.finance ?? {});
      const bullets: string[] = [];
      if (fin.revenueNarrative) bullets.push(String(fin.revenueNarrative));
      if (Array.isArray(fin.assumptions)) bullets.push(...fin.assumptions);
      if (Array.isArray(fin.fundingStrategy)) bullets.push(...fin.fundingStrategy);
      return bullets.slice(0, 8);
    }
    case "technology": {
      const tech = content.technology ?? (m.technology ?? {});
      const bullets: string[] = [];
      if (Array.isArray(tech.points)) bullets.push(...tech.points);
      if (Array.isArray(tech.stack)) bullets.push(...tech.stack);
      if (Array.isArray(tech.safetyCompliancePoints)) bullets.push(...tech.safetyCompliancePoints);
      return bullets.slice(0, 8);
    }
    case "team": {
      const team = content.teamOrg ?? (m.teamOrg ?? {});
      const bullets: string[] = [];
      if (Array.isArray(team.roles)) bullets.push(...team.roles);
      if (Array.isArray((m.bp as any)?.team?.esopDetails)) bullets.push(...(m.bp as any).team.esopDetails);
      return bullets.slice(0, 8);
    }
    case "risks": {
      const r = content.risks ?? (m.risks ?? {});
      const bullets: string[] = [];
      // 1) Kurze Gesamtliste
      if (Array.isArray(r.list)) bullets.push(...r.list);
      // 2) Verdichtete risk→mitigation Paare aus Unterabschnitten
      const sections = [r.tech, r.market, r.finance, r.regulatory, r.operations].filter(Boolean);
      for (const sec of sections as any[]) {
        for (const k of Object.keys(sec)) {
          const node = (sec as any)[k];
          if (node && typeof node === 'object' && (node.risk || node.mitigation)) {
            bullets.push(`${node.risk ?? ''}${node.mitigation ? ` – ${node.mitigation}` : ''}`.trim());
          }
        }
      }
      // 3) Mitigation-Listen
      if (r.mitigation && Array.isArray(r.mitigation.items)) bullets.push(...r.mitigation.items);
      // 4) MitigationDetailed (einige knackige Beispiele)
      if (r.mitigationDetailed) {
        const md = r.mitigationDetailed as any;
        const pick = (arr: any) => Array.isArray(arr) ? arr.slice(0, 1) : [];
        bullets.push(...pick(md.tech), ...pick(md.market), ...pick(md.finance), ...pick(md.legal));
      }
      // 5) Benefits / Additional, falls Platz
      if (Array.isArray(r.benefits)) bullets.push(...r.benefits);
      if (r.additional) {
        const add = r.additional as Record<string, unknown>;
        for (const v of Object.values(add)) if (typeof v === 'string') bullets.push(v);
      }
      return bullets.filter(Boolean).slice(0, 8);
    }
    case "traction-kpis": {
      const tk = (m.bp as any)?.tractionKpis ?? {};
      const bullets: string[] = [];
      if (Array.isArray(tk.highlights)) bullets.push(...tk.highlights);
      if (Array.isArray(tk.kpisExplain)) bullets.push(...tk.kpisExplain);
      if (Array.isArray(tk.methodology)) bullets.push(...tk.methodology);
      if (Array.isArray(tk.evidence)) bullets.push(...tk.evidence);
      if (Array.isArray(tk.deliverables)) bullets.push(...tk.deliverables);
      return bullets.slice(0, 8);
    }
    case "impact": {
      const imp = content.impact ?? (m.impact ?? {});
      const bullets: string[] = [];
      // aktuelle i18n Felder: description[], sustainabilityGoals[], socialImpact[]
      if (Array.isArray(imp.description)) bullets.push(...imp.description);
      if (Array.isArray(imp.sustainabilityGoals)) bullets.push(...imp.sustainabilityGoals);
      if (Array.isArray(imp.socialImpact)) bullets.push(...imp.socialImpact);
      return bullets.slice(0, 8);
    }
    case "exit-strategy": {
      const ex = content.exit ?? (m.exit ?? {});
      const bullets: string[] = [];
      // notes
      if (ex.notes) bullets.push(String(ex.notes));
      // valuation
      if (ex.valuation) {
        if (ex.valuation.range) bullets.push(String(ex.valuation.range));
        if (Array.isArray(ex.valuation.multiples)) bullets.push(...ex.valuation.multiples);
      }
      // options titles
      if (ex.options) {
        const optTitles = [ex.options.a?.title, ex.options.b?.title, ex.options.c?.title]
          .filter(Boolean)
          .map((t: any) => String(t));
        if (optTitles.length) bullets.push(...optTitles);
      }
      // buyers
      if (ex.buyers) {
        if (Array.isArray(ex.buyers.strategic)) bullets.push(...ex.buyers.strategic.map((x: any) => `Strategic: ${x}`));
        if (Array.isArray(ex.buyers.financial)) bullets.push(...ex.buyers.financial.map((x: any) => `Financial: ${x}`));
      }
      // timeline phases → kurze Zeilen
      if (ex.timeline && Array.isArray(ex.timeline.phases)) {
        bullets.push(...ex.timeline.phases.map((p: any) => `${p.period}: ${(Array.isArray(p.activities) ? p.activities[0] : '')}`.trim()));
      }
      // preparation actions
      if (ex.preparation && Array.isArray(ex.preparation.actions)) bullets.push(...ex.preparation.actions);
      // risks items
      if (ex.risks && Array.isArray(ex.risks.items)) bullets.push(...ex.risks.items.map((r: any) => `${r.risk}${r.mitigation ? ` – ${r.mitigation}` : ''}`));
      return bullets.filter(Boolean).slice(0, 8);
    }
    default:
      return [];
  }
}

// (Fallback-Bullets entfernt: Investorenvorlage soll nur echte Inhalte zeigen)

export default function PitchPage() {
  const { messages, locale } = usePitchMessages();
  const t = useTranslations("pitchCover");
  // Startsignal für Header-Sequenz: direkt nach kleinem Delay
  const [headerReady, setHeaderReady] = useState(false);
  // Orchestrierung: 'title' -> 'badge' -> 'meta'
  const [stage, setStage] = useState<'title' | 'badge' | 'meta'>('title');
  const prefersReducedPage = useReducedMotion();
  const [isCoarse, setIsCoarse] = useState(false);
  // Gradient-IDs dynamisch, um Kollisionen zu vermeiden
  const badgeGradId = useId();
  // Untere Sektion erst nach expliziter Interaktion laden
  const [hasInteracted, setHasInteracted] = useState(true);
  // Trigger: Text-Kick nach Icon-Wobble
  const [kick, setKick] = useState(false);

  // Scroll-Fortschritt (Top-Bar)
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 22, mass: 0.4 });

  // Aktueller Kapitelindex für Dots-Navigation
  const [currentChapter, setCurrentChapter] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.chapter-section[data-chapter-index]'));
      const scrollY = window.scrollY;
      let current = 0;
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (top - 130 <= scrollY) current = i; else break;
      }
      setCurrentChapter(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('resize', onScroll as any);
    };
  }, []);

  // Erste Nutzer-Interaktion erkennen (Scroll/Touch/Key), danach Inhalte laden
  useEffect(() => {
    if (hasInteracted) return;
    const markInteracted = () => setHasInteracted(true);
    const onKey = (e: KeyboardEvent) => {
      const keys = [" ", "Spacebar", "ArrowDown", "PageDown", "Enter"]; // Enter für Stickiness
      if (keys.includes(e.key)) markInteracted();
    };
    window.addEventListener('wheel', markInteracted, { passive: true });
    window.addEventListener('touchstart', markInteracted, { passive: true });
    window.addEventListener('scroll', markInteracted, { passive: true });
    window.addEventListener('keydown', onKey as any, { passive: true } as any);
    return () => {
      window.removeEventListener('wheel', markInteracted as any);
      window.removeEventListener('touchstart', markInteracted as any);
      window.removeEventListener('scroll', markInteracted as any);
      window.removeEventListener('keydown', onKey as any);
    };
  }, [hasInteracted]);

  // Header-Sequenz kurz nach Mount starten; bei Reduced Motion direkt alles zeigen
  useEffect(() => {
    if (prefersReducedPage) {
      setHeaderReady(true);
      setStage('meta');
      // Barrierefrei: bei Reduced Motion sofort Inhalt zeigen
      setHasInteracted(true);
      return;
    }
    const timer = setTimeout(() => setHeaderReady(true), 300);
    return () => clearTimeout(timer);
  }, [prefersReducedPage]);

  // Detect coarse pointer (Touch) to switch hint between Swipe (mobile) and Scroll (desktop)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const apply = () => setIsCoarse(!!mq.matches);
    apply();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(apply);
      return () => mq.removeListener(apply);
    }
  }, []);

  // Sequenzstart wird im Header-Icon nach Layout-Animation getriggert (robuster als fixe Zeit)

  // Fallback/Override-Daten für die Pitch-Sektion gemäß Nutzerangaben (stabil via useMemo)
  const overrides = useMemo(() => ({
    investmentCase: {
      moat: [] as string[], // n/a laut Vorgabe
      traction: [
        "RaaS‑Rollouts mit Partnern (OEM/Integrator) beschleunigen Units & MRR",
        "App‑Store Anteil ab Jahr 3 bei 5–15% des Umsatzes (Upsell)",
        "Payback ~3 Monate (CAC ~€6k), LTV (Beitrag) ~€50k, LTV/CAC > 7x",
      ],
      unitEconomics: [
        "RaaS‑Preis je Roboter: 3.000–4.000 € / Monat (Ø ~3.500 €)",
        "Deckungsbeitrag je Roboter/Monat: ~2.000–2.400 € nach COGS",
        "Payback CAC: ~3 Monate (bei ~2.100 € mtl. Beitrag, CAC ~6.000 €)",
      ],
      gtm: [
        "Pilotprojekte mit Pflegeheimen, Hotels, Forschungsinstituten",
        "Kooperationen mit österreichischen Universitäten (TU Wien, FH Hagenberg, JKU Linz)",
        "Skalierung 2028–2029: RaaS‑Infrastruktur B2B, App‑Store (Beta), 20–30 Kunden DACH",
      ],
    },
    useOfFunds: {
      ticket: "€600.000",
      allocation: [
        { area: "Team", percent: 55 },
        { area: "Hardware CAPEX", percent: 20 },
        { area: "GTM/Vertrieb", percent: 12 },
        { area: "Cloud/Infra", percent: 8 },
        { area: "Compliance/Safety", percent: 5 },
      ] as Array<{ area: string; percent: number }>,
      milestones: [] as Array<{ year?: string; quarter?: string; title?: string }>, // n/a
    },
    askTerms: {
      roundLines: [
        "2025: Seed €0,6 Mio. (Produkt/Team/GTM) + Grants €0,2–0,4 Mio.",
        "2026: Bridge €0,3–0,5 Mio. zur Beschleunigung Pilot‑Rollouts",
        "Optional 2027: Series‑A abhängig von KPI‑Meilensteinen",
      ],
      terms: [
        "Instrument: SAFE",
        "Discount: 15%",
        "Valuation Cap: €5,0 Mio.",
        "Pro‑Rata‑Rechte: Ja",
      ],
      runway: [
        ["Aktueller Cash", 450000],
        ["Monatlicher Burn", -65000],
        ["Runway (Monate)", 7],
      ] as any[],
    },
  }) as const, []);

  // Kapitel 'Arbeitspakete' vollständig aus dem Pitch ausblenden
  const filteredChapters = useMemo(() => (
    chapters.filter((c) => !/arbeitspaket/i.test(c.title) && !/arbeitspaket/i.test(String(c.slug)))
  ), []);

  // Precompute sections for Investment Case
  const investmentSections = useMemo(() => {
    const m: any = messages ?? {};
    const moats: string[] = Array.isArray(m.marketCompetitive?.moat)
      ? m.marketCompetitive.moat
      : (Array.isArray(m.content?.marketCompetitive?.moat)
          ? m.content.marketCompetitive.moat
          : overrides.investmentCase.moat);
    const traction: string[] = Array.isArray((m.bp as any)?.tractionKpis?.highlights)
      ? (m.bp as any).tractionKpis.highlights
      : overrides.investmentCase.traction;
    const unit: string[] = Array.isArray(m.businessModel?.unitEconomics)
      ? m.businessModel.unitEconomics
      : (Array.isArray(m.content?.businessModel?.unitEconomics)
          ? m.content.businessModel.unitEconomics
          : overrides.investmentCase.unitEconomics);
    const gtm: string[] = Array.isArray(m.gtm?.phase1)
      ? m.gtm.phase1
      : (Array.isArray(m.content?.gtm?.phase1)
          ? m.content.gtm.phase1
          : overrides.investmentCase.gtm);
    type Sec = { title: string; items: string[] };
    const sections: Sec[] = [
      { title: 'Moat', items: moats.slice(0, 3) },
      { title: 'Traction', items: traction.slice(0, 3) },
      { title: 'Unit Economics', items: unit.slice(0, 3) },
      { title: 'GTM', items: gtm.slice(0, 3) },
    ];
    return sections;
  }, [messages, overrides]);

  // Precompute risks bullets
  const risksBullets = useMemo(() => extractBulletsForChapter('risks', messages), [messages]);

  // Presenter-Mode: einfache Tastaturnavigation zwischen Kapiteln
  useEffect(() => {
    function getSections(): HTMLElement[] {
      return Array.from(document.querySelectorAll<HTMLElement>('.chapter-section[data-chapter-index]'));
    }
    function getCurrentIndex(): number {
      const sections = getSections();
      const scrollY = window.scrollY;
      let current = 0;
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (top - 120 <= scrollY) current = i; else break;
      }
      return current;
    }
    function scrollToIndex(idx: number) {
      const sections = getSections();
      if (idx < 0 || idx >= sections.length) return;
      const el = sections[idx];
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (["ArrowRight","ArrowDown","PageDown"," "].includes(key)) {
        e.preventDefault();
        scrollToIndex(getCurrentIndex() + 1);
      } else if (["ArrowLeft","ArrowUp","PageUp"].includes(key)) {
        e.preventDefault();
        scrollToIndex(getCurrentIndex() - 1);
      }
    };
    window.addEventListener('keydown', onKey as any, { passive: false } as any);
    return () => {
      window.removeEventListener('keydown', onKey as any);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Scroll Progress Bar */}
      {!prefersReducedPage && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-3))]"
          style={{ scaleX: progressX }}
          aria-hidden
        />
      )}
      {/* Intro-Overlay entfernt: Einstieg erfolgt direkt mit Header */}
      {/* Print-only cover page for Pitch */}
      <div className="hidden print:block">
        <PitchCoverPage />
        {/* Print watermark */}
        <div className="print-watermark" aria-hidden>
          <span>VERTRAULICH</span>
        </div>
        {/* Print Table of Contents for pitch chapters */}
        <PrintTOC title="Inhalt" items={filteredChapters.map(c => ({ id: c.slug, title: c.title }))} />
      </div>
      {/* Main Content (RootLayout stellt bereits Container-Breite & Padding bereit) */}
      <div className="py-8">
        {/* Hero Header – eleganter Titel mit Badge & i18n Subtitel */}
        <div className="mb-12 md:mb-16">
          <div className="mx-auto max-w-3xl text-center flex flex-col items-center justify-center">
            {/* Badge (bleibt sichtbar ab 'badge' und in 'meta') – reservierter Platz, um Layout-Shift zu vermeiden */}
            <div className="min-h-[36px] md:min-h-[42px] mb-5">
              <AnimatePresence>
                {(stage === 'badge' || stage === 'meta') && (
                  <motion.div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide
                             ring-1 [--g1:var(--color-accent)] [--g2:var(--color-accent-3)]
                             ring-[color-mix(in_oklab,color-mix(in_oklab,var(--g1)_50%,var(--g2)_50%)_45%,transparent)]
                             bg-[linear-gradient(90deg,color-mix(in_oklab,var(--g1)_10%,transparent),color-mix(in_oklab,var(--g2)_10%,transparent))]
                             backdrop-blur-[0.5px]
                             shadow-[inset_0_0_0_1px_color-mix(in_oklab,color-mix(in_oklab,var(--g1)_50%,var(--g2)_50%)_22%,transparent)]"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: [-3, 1.5, 0] }}
                  transition={{ duration: 1.2, ease: [0.2, 0.85, 0.2, 1] }}
                  onAnimationComplete={() => {
                    if (stage === 'badge') setStage('meta');
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" aria-hidden stroke={`url(#${badgeGradId})`}>
                    <defs>
                      <linearGradient id={badgeGradId as any} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-accent)" />
                        <stop offset="100%" stopColor="var(--color-accent-3)" />
                      </linearGradient>
                    </defs>
                  </CheckCircle2>
                  <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,var(--g1),var(--g2))]">
                    {t("title", { default: "Investor Pitch" })}
                  </span>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Brand Lockup (kein Link, zentriert, ohne Unterstreichung) */}
            <h1 className="mt-1.5 text-[clamp(3.0rem,10.5vw,3.6rem)] md:text-5xl font-extrabold tracking-tight md:tracking-tighter leading-[1.06] md:leading-tight w-full">
              <span className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-2 [--g1:var(--color-accent)] [--g2:var(--color-accent-3)] pointer-events-none select-none w-full">
                  {/* Header-Anchor für die Zielmessung */}
                  <span id="pitch-bot-anchor" className="inline-flex items-center justify-center w-[1.2em] h-[1.2em] sm:w-[1.08em] sm:h-[1.08em] translate-y-[1px]">
                    <motion.i
                      aria-hidden
                      className={`inline-flex items-center justify-center w-full h-full visible`}
                      initial={{ scale: 0.82, opacity: 0 }}
                      animate={headerReady
                        ? (stage === 'badge' || stage === 'meta'
                          ? { scale: 1, opacity: 1, rotate: [0, -5, 2.5, -0.8, 0], x: [0, -5, 1.6, -0.4, 0] }
                          : { scale: 1, opacity: 1 })
                        : {}
                      }
                      transition={{
                        type: 'spring', stiffness: 180, damping: 30, mass: 0.95, bounce: 0.18, delay: 0.04,
                        rotate: { type: 'tween', duration: 0.45, ease: [0.22, 0.8, 0.22, 1], delay: 0.06 },
                        x: { type: 'tween', duration: 0.45, ease: [0.22, 0.8, 0.22, 1], delay: 0.06 },
                      }}
                      onAnimationComplete={() => setKick(true)}
                      style={{ transformOrigin: '55% 45%' }}
                    >
                      <RobotIcon
                        size="100%"
                        strokeWidth={2.4}
                        gradient
                        g1="var(--g1)"
                        g2="var(--g2)"
                        title="Robot"
                      />
                    </motion.i>
                  </span>
                  {/* Titel-Textsegmente – frische, positionsstabile Shine-Reveal-Animation ohne Pixelbewegung */}
                  <span className="relative inline-flex items-center justify-center gap-2">
                    {/* SIGMACODE AI – Shine von links nach rechts, danach stabil */}
                    <motion.span
                      className="text-transparent bg-clip-text bg-[linear-gradient(90deg,var(--g1),var(--g2))] text-center [text-wrap:balance] decoration-transparent inline-block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: headerReady && kick ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                      style={{ backgroundSize: '200% 100%', backgroundPosition: '0% 50%' }}
                      onAnimationComplete={() => { if (stage === 'title') setStage('badge'); }}
                    >
                      <motion.span
                        aria-hidden
                        style={{ display: 'inline-block', backgroundSize: '200% 100%' }}
                        animate={{ backgroundPosition: (headerReady && kick) ? ['0% 50%', '100% 50%'] : '0% 50%' }}
                        transition={{ duration: 0.9, ease: [0.22, 0.8, 0.22, 1] }}
                      >
                        SIGMACODE AI
                      </motion.span>
                    </motion.span>
                    {/* Robotics – leicht versetzt, gleicher Shine */}
                    <motion.span
                      className="ai-gradient-subtle text-center [text-wrap:balance] decoration-transparent inline-block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: headerReady && kick ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                      style={{ backgroundSize: '200% 100%', backgroundPosition: '0% 50%' }}
                    >
                      <motion.span
                        aria-hidden
                        style={{ display: 'inline-block', backgroundSize: '200% 100%' }}
                        animate={{ backgroundPosition: (headerReady && kick) ? ['0% 50%', '100% 50%'] : '0% 50%' }}
                        transition={{ duration: 0.9, ease: [0.22, 0.8, 0.22, 1] }}
                      >
                        Robotics
                      </motion.span>
                    </motion.span>
                  </span>
              </span>
            </h1>

            {/* Subtitel + Divider erscheinen erst nach Badge */}
            <AnimatePresence>
              {stage === 'meta' && (
                <>
                  <motion.p
                    className="mt-2 text-[16px] md:text-lg text-[--color-foreground-muted] max-w-[68ch] mx-auto"
                    initial={{ opacity: 0, y: 6, scaleY: 0.96, clipPath: 'inset(0 0 100% 0)' }}
                    animate={{ opacity: 1, y: 0, scaleY: 1, clipPath: 'inset(0 0 0% 0)' }}
                    transition={{ duration: 0.55, ease: [0.22, 0.8, 0.24, 1], delay: 0.16 }}
                    style={{ transformOrigin: 'top center' }}
                  >
                    {t("subtitle", { default: "Humanoid Robotics · App‑Store · KI‑Assistenz · Skalierbares RaaS" })}
                  </motion.p>
                  {/* Unterstreichung/Divider im Logo-Hero entfernt */}
                  {!prefersReducedPage && (
                    <motion.div
                      className="mt-3 flex items-center justify-center"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.36 }}
                      role="button"
                      aria-live="polite"
                      aria-label={isCoarse ? 'Nach unten wischen' : 'Nach unten scrollen'}
                      onClick={() => {
                        setHasInteracted(true);
                        const first = document.querySelector('[id^="pitch-"]') as HTMLElement | null;
                        first?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      tabIndex={0}
                    >
                      <motion.span
                        className="inline-flex items-center justify-center p-2.5 md:p-3 rounded-full ring-1 ring-[--color-border-subtle] bg-[--color-surface]/60 backdrop-blur-[1px] text-[--color-accent]"
                        animate={{ y: [0, 10, 0], opacity: [0.75, 1, 0.75] }}
                        transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
                        aria-hidden
                      >
                        {isCoarse ? (
                          <ChevronsDown className="h-6 w-6 md:h-7 md:w-7" />
                        ) : (
                          <Mouse className="h-6 w-6 md:h-7 md:w-7" />
                        )}
                      </motion.span>
                      <span className="sr-only">{isCoarse ? 'Nach unten wischen' : 'Nach unten scrollen'}</span>
                    </motion.div>
                  )}
                  {/* Replay-Button entfernt */}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="space-y-20">
          {filteredChapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              className="chapter-section"
              data-chapter-index={index}
              id={`pitch-${chapter.slug}`}
              initial={{ opacity: 1, y: 0 }}
              transition={{ ...defaultTransition, delay: index * 0.08 }}
            >
              <ChapterSection
                chapter={chapter}
                index={index}
                total={filteredChapters.length}
                messages={messages}
                locale={locale}
              />
            </motion.div>
          ))}
        </div>

        {/* Rechte Dots-Navigation */}
        <nav
          aria-label="Kapitel Navigation"
          className="fixed right-3 md:right-4 top-1/2 -translate-y-1/2 z-[55] hidden sm:block"
        >
          <ul className="m-0 p-0 list-none space-y-2">
            {filteredChapters.map((chapter, idx) => (
              <li key={chapter.id} className="m-0">
                <button
                  type="button"
                  aria-label={`${idx + 1}. ${chapter.title}`}
                  title={`${idx + 1}. ${chapter.title}`}
                  onClick={() => {
                    const el = document.getElementById(`pitch-${chapter.slug}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="group relative block h-2.5 w-2.5 rounded-full overflow-hidden"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[--color-border-subtle] group-hover:bg-[--color-accent]/50 transition-colors"
                  />
                  {currentChapter === idx && (
                    <motion.span
                      layoutId="chapter-dot"
                      className="absolute inset-0 rounded-full bg-[--color-accent]"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Investment Case – Moat, Traction, Unit Economics, GTM */}
        <Reveal>
          <ElegantCard className="mt-14" innerClassName="p-8 print:shadow-none print:ring-0 print:bg-transparent">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-tight">Investment Case</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {investmentSections.map((sec, idx) => (
              <motion.div
                key={idx}
                className="rounded-2xl bg-[--color-surface]/70 ring-1 ring-[--color-border-subtle] p-5"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={PITCH_VIEWPORT}
                transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(idx * 0.05, 0.25) }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <h3 className="text-sm font-semibold tracking-wide uppercase">{sec.title}</h3>
                </div>
                <ul className="grid gap-2.5 md:gap-3 text-[13px] md:text-[14px] list-none p-0 m-0">
                  {sec.items.length > 0 ? sec.items.filter((t) => !shouldHideBullet(String(t))).map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1 h-1 w-1 rounded-full bg-white/80" aria-hidden />
                      <span>{t}</span>
                    </li>
                  )) : <li className="text-[--color-foreground-muted]">n/a</li>}
                </ul>
              </motion.div>
            ))}
            </div>
          </ElegantCard>
        </Reveal>

        {/* Use of Funds – Ticket, Allocation, Nächste Meilensteine */}
        <Reveal>
          <ElegantCard className="mt-12" innerClassName="p-8 print:shadow-none print:ring-0 print:bg-transparent">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-tight">Use of Funds</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Ticketgröße */}
              <div className="rounded-2xl bg-[--color-surface]/70 ring-1 ring-[--color-border-subtle] p-5 print:shadow-none print:ring-0 print:bg-transparent">
                <div className="text-sm font-semibold tracking-wide uppercase mb-1">Ticketgröße</div>
                <div className="text-2xl font-extrabold [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
                  {(() => {
                    const m: any = messages ?? {};
                    const fin = (m.content?.finance ?? m.finance ?? {}) as any;
                    const ticketVal = fin.fundingStrategy?.ticket ?? fin.fundingRound?.ticket ?? overrides.useOfFunds.ticket ?? null;
                    return ticketVal ? String(ticketVal) : <span className="text-[--color-foreground-muted]">n/a</span>;
                  })()}
                </div>
                <div className="text-[12px] text-[--color-foreground-muted] mt-1">Geplant für 12–18 Monate Runway</div>
              </div>
              {/* Allocation */}
              <div className="rounded-2xl bg-[--color-surface]/70 ring-1 ring-[--color-border-subtle] p-5 print:shadow-none print:ring-0 print:bg-transparent">
                <div className="text-sm font-semibold tracking-wide uppercase mb-2">Allocation</div>
                <ul className="grid gap-0 text-[13px] md:text-[14px] list-none p-0 m-0 divide-y divide-[--color-border-subtle]/50">
                  {(() => {
                    const m: any = messages ?? {};
                    const fin = (m.content?.finance ?? m.finance ?? {}) as any;
                    const allocExplicit = Array.isArray(fin.fundingStrategy?.allocation)
                      ? (fin.fundingStrategy.allocation as Array<{ area: string; percent?: number | string }>)
                      : (Array.isArray(fin.fundingStrategyAllocation)
                        ? (fin.fundingStrategyAllocation as Array<{ area: string; percent?: number | string }>)
                        : overrides.useOfFunds.allocation as Array<{ area: string; percent?: number | string }>);
                    if (allocExplicit.length > 0) {
                      return allocExplicit.slice(0,5).map((a, i) => {
                        const pct = typeof a.percent === 'number' ? a.percent : (typeof a.percent === 'string' ? parseFloat(a.percent) : NaN);
                        const safePct = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : NaN;
                        return (
                          <li key={i}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span>{a.area}</span>
                              <span className="font-medium [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">{Number.isFinite(safePct) ? `${safePct}%` : (typeof a.percent !== 'undefined' ? String(a.percent) : '—')}</span>
                            </div>
                            {Number.isFinite(safePct) ? (
                              <div className="h-2 rounded-full bg-[--color-surface-2] overflow-hidden">
                                <div className="h-full bg-[--color-accent]" style={{ width: `${safePct}%` }} />
                              </div>
                            ) : null}
                          </li>
                        );
                      });
                    }
                    // Fallback: aus useOfFundsYears die erste Zeile für Anteile ableiten
                    const table = fin.useOfFundsYears;
                    const headers: any[] = Array.isArray(table?.headers) ? table.headers : [];
                    const first: any[] = Array.isArray(table?.rows?.[0]) ? table.rows[0] : [];
                    // Erwartet Schema: [Jahr, Cat1, Cat2, ..., CatN, Summe]
                    if (headers.length > 0 && first.length > 2) {
                      const lastIdx = first.length - 1;
                      const total = typeof first[lastIdx] === 'number' ? first[lastIdx] : first.slice(1, lastIdx).reduce((acc: number, v: any) => acc + (typeof v === 'number' ? v : 0), 0);
                      const items = headers.slice(1, -1).map((h: any, idx: number) => ({
                        area: String(h),
                        value: typeof first[idx + 1] === 'number' ? first[idx + 1] : 0
                      }));
                      const top = items
                        .map(it => ({ ...it, percent: total > 0 ? Math.round((it.value / total) * 100) : 0 }))
                        .sort((a, b) => b.percent - a.percent)
                        .slice(0, 5);
                      return top.map((a, i) => (
                        <li key={i}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span>{a.area}</span>
                            <span className="font-medium [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">{a.percent}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[--color-surface-2] overflow-hidden">
                            <div className="h-full bg-[--color-accent]" style={{ width: `${a.percent}%` }} />
                          </div>
                        </li>
                      ));
                    }
                    return <li className="text-[--color-foreground-muted]">n/a</li>;
                  })()}
                </ul>
              </div>
              {/* Meilensteine */}
              <div className="rounded-2xl bg-[--color-surface]/70 ring-1 ring-[--color-border-subtle] p-5 print:shadow-none print:ring-0 print:bg-transparent">
                <div className="text-sm font-semibold tracking-wide uppercase mb-2">Nächste Meilensteine</div>
                <ul className="grid gap-2 text-[13px] md:text-[14px] list-none p-0 m-0">
                  {(() => {
                    const m: any = messages ?? {};
                    const fin = (m.content?.finance ?? m.finance ?? {}) as any;
                    const milestones: Array<{ year?: string; quarter?: string; title?: string }> = Array.isArray(fin.milestones) ? fin.milestones : overrides.useOfFunds.milestones;
                    if (Array.isArray(milestones) && milestones.length > 0) {
                      return milestones.slice(0, 4).map((ms, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-accent-3]" aria-hidden />
                          <span>{[ms.year, ms.quarter, ms.title].filter(Boolean).join(' · ') || '—'}</span>
                        </li>
                      ));
                    }
                    return <li className="text-[--color-foreground-muted]">n/a</li>;
                  })()}
                </ul>
              </div>
              </div>
          </ElegantCard>
        </Reveal>

        {/* Ask & Terms – Runde, Rahmenbedingungen, Runway */}
        <Reveal>
          <ElegantCard className="mt-12" innerClassName="p-8 print:shadow-none print:ring-0 print:bg-transparent">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-tight">Ask & Terms</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
            {/* Runde & Zweck */}
            <div>
              <div className="text-sm font-semibold tracking-wide uppercase mb-2">Runde & Zweck</div>
              <ul className="grid gap-2 text-[13px] md:text-[14px] list-none p-0 m-0">
                {(() => {
                  const m: any = messages ?? {};
                  const fin = (m.content?.finance ?? m.finance ?? {}) as any;
                  const lines: string[] = Array.isArray(fin.fundingStrategy) ? fin.fundingStrategy : overrides.askTerms.roundLines;
                  return lines.length > 0 ? lines.slice(0, 3).map((l, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-accent]" aria-hidden />
                      <span>{l}</span>
                    </li>
                  )) : <li className="text-[--color-foreground-muted]">n/a</li>;
                })()}
              </ul>
            </div>
            {/* Konditionen (falls gepflegt) */}
            <div>
              <div className="text-sm font-semibold tracking-wide uppercase mb-2">Konditionen</div>
              <ul className="grid gap-2 text-[13px] md:text-[14px] list-none p-0 m-0">
                {(() => {
                  const m: any = messages ?? {};
                  const fin = (m.content?.finance ?? m.finance ?? {}) as any;
                  const terms: Array<string> = Array.isArray(fin.terms) ? fin.terms : overrides.askTerms.terms;
                  if (terms.length > 0) return terms.slice(0, 4).map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-accent-2]" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ));
                  // Fallback Platzhalter
                  return (
                    <>
                      <li className="text-[--color-foreground-muted]">Pre‑Money: n/a</li>
                      <li className="text-[--color-foreground-muted]">Instrument: n/a</li>
                      <li className="text-[--color-foreground-muted]">Discount/Cap: n/a</li>
                    </>
                  );
                })()}
              </ul>
            </div>
            {/* Runway */}
            <div>
              <div className="text-sm font-semibold tracking-wide uppercase mb-2">Runway</div>
              <ul className="grid gap-2 text-[13px] md:text-[14px] list-none p-0 m-0">
                {(() => {
                  const m: any = messages ?? {};
                  const fin = (m.content?.finance ?? m.finance ?? {}) as any;
                  const runway: any[] = Array.isArray(fin.runway) ? fin.runway : overrides.askTerms.runway;
                  return runway.length > 0 ? runway.slice(0, 3).map((row, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span>{row?.[0]}</span>
                      <span className="font-medium [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">{typeof row?.[1] === 'number' ? row[1].toLocaleString('de-DE') : String(row?.[1] ?? '—')}</span>
                    </li>
                  )) : <li className="text-[--color-foreground-muted]">n/a</li>;
                })()}
              </ul>
            </div>
          </div>
          </ElegantCard>
        </Reveal>

        {/* Compact Risks & Mitigation */}
        <Reveal>
          <ElegantCard className="mt-12" innerClassName="p-8 print:shadow-none print:ring-0 print:bg-transparent">
            <div className="mb-2">
              <h2 className="text-lg font-semibold tracking-tight">Risiken & Mitigation (Auszug)</h2>
            </div>
            <ul className="grid gap-2.5 md:gap-3 md:grid-cols-2 text-[13px] md:text-[14px] list-none p-0 m-0">
            {risksBullets.filter((r) => !shouldHideBullet(r)).slice(0,6).map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 rounded-full bg-white/80" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
            </ul>
          </ElegantCard>
        </Reveal>

        {/* Call to Action */}
        <Reveal>
          <ElegantCard className="mt-16" innerClassName="p-8 print:shadow-none print:ring-0 print:bg-transparent">
            <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, delay: 0.2 }}
            viewport={PITCH_VIEWPORT}
          >
            <h2>
              Nächster Schritt: Investment-Dialog
            </h2>
            <p className="text-xl text-[--color-foreground] max-w-3xl mx-auto">
              Wir kombinieren differenzierte Technologie, belastbare Unit Economics und klare GTM-Pfade. Lassen Sie uns konkret über Ticketgröße,
              Meilensteine und Zeithorizont sprechen – kompakt, datenbasiert, ergebnisorientiert.
            </p>
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <motion.a
                href={"mailto:invest@sigmacode.ai?subject=Investor%20Meeting&body=Hallo%20SIGMACODE%20AI%2C%5Cnwir%20m%C3%B6chten%20gern%20ein%20Gespr%C3%A4ch%20vereinbaren.%20Vorschl%C3%A4ge%20f%C3%BCr%20Termine%3A%20..."}
                className="btn-outline-gradient print:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="h-4 w-4" aria-hidden />
                Gespräch vereinbaren (Invest)
              </motion.a>
              <motion.button
                onClick={() => window.print()}
                className="btn-outline-brand print:hidden"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Printer className="h-4 w-4" aria-hidden />
                PDF exportieren
              </motion.button>
            </div>
            </motion.div>
          </ElegantCard>
        </Reveal>
      </div>
      {/* Print-only closing/contact page */}
      <div className="hidden print:block">
        <ClosingPage />
      </div>
    </div>
  );
}

function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // Trigger etwas später im Viewport: erscheint, wenn der Abschnitt wirklich im Fokus ist
  const inView = useInView(ref, { once: true, margin: "-30% 0px -55% 0px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 22 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      const n = typeof v === "number" ? v : parseFloat(String(v));
      if (!Number.isNaN(n)) setDisplay(Math.round(n));
    });
    if (inView) {
      const timer = setTimeout(() => {
        motionVal.stop();
        motionVal.set(0);
        spring.set(0);
        motionVal.set(value);
      }, delay * 1000);
      return () => { clearTimeout(timer); unsub(); };
    }
    return () => unsub();
  }, [inView, value, delay, motionVal, spring, rounded]);

  return (
    <motion.span
      ref={ref}
      style={{}}
      initial={{ opacity: 0.85 }}
      whileInView={{ opacity: 1 }}
      viewport={PITCH_VIEWPORT}
      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
    >
      {display}
    </motion.span>
  );
}

function ChapterSection({ chapter, index, total, messages, locale }: {
  chapter: typeof chapters[0];
  index: number;
  total: number;
  messages: Messages | null;
  locale?: string;
}) {
  const bullets = useMemo(() => extractBulletsForChapter(chapter.slug, messages), [chapter.slug, messages]);
  const financeKpis = useMemo(() => chapter.slug === 'finance' ? extractFinanceKpis(messages) : [], [chapter.slug, messages]);
  const tractionKpis = useMemo(() => chapter.slug === 'traction-kpis' ? extractTractionKpis(messages) : [], [chapter.slug, messages]);
  const theme = useMemo(() => getChapterTheme(chapter.slug as any), [chapter.slug]);

  // Kapitel-Icon je Abschnitt (nur für Bullets unten)
  const Icon = useMemo<ElementType>(() => {
    switch (chapter.slug) {
      case 'executive': return Sparkles;
      case 'business-model': return Briefcase;
      case 'market': return LineChart;
      case 'gtm': return Rocket;
      case 'finance': return Banknote;
      case 'technology': return Cpu;
      case 'team': return Users;
      case 'risks': return AlertTriangle;
      case 'traction-kpis': return Target;
      case 'impact': return Leaf;
      case 'exit-strategy': return Flag;
      default: return CheckCircle2;
    }
  }, [chapter.slug]);

  // Kapitel-spezifische KPI-Karten (State of the Art) – kompaktes Grid über den Bullets
  const kpiCards = useMemo(() => {
    if (!messages) return [] as Array<any>;
    const m: any = messages;
    const de = (locale || 'de').startsWith('de');

    switch (chapter.slug) {
      case 'business-model': { // ARPU, CAC, LTV, Gross Margin
        const bm = (m.bp?.content?.businessModel ?? m.bp?.businessModel ?? m.content?.businessModel ?? {}) as any;
        const items: any[] = [];
        if (bm?.kpi?.arpu) items.push({ key: 'arpu', label: 'ARPU', value: bm.kpi.arpu, chart: 'spark' });
        if (bm?.kpi?.cac) items.push({ key: 'cac', label: 'CAC', value: bm.kpi.cac, chart: 'bar' });
        if (bm?.kpi?.ltv) items.push({ key: 'ltv', label: 'LTV', value: bm.kpi.ltv, chart: 'spark' });
        if (bm?.kpi?.grossMargin) items.push({ key: 'gm', label: de ? 'Bruttomarge' : 'Gross Margin', value: bm.kpi.grossMargin, chart: 'donut' });
        return items;
      }
      case 'market': { // Service market, CAGR Service, Humanoids market, EU share
        const vol = (m.bp?.market?.volume ?? {}) as any;
        const items: any[] = [];
        if (typeof vol?.service?.global === 'string') items.push({ key: 'svc', label: de ? 'Service‑Markt (global)' : 'Service market (global)', value: vol.service.global, chart: 'spark' });
        if (typeof vol?.service?.cagr === 'string') items.push({ key: 'cagr', label: 'CAGR (Service)', value: vol.service.cagr, chart: 'bar' });
        if (typeof vol?.humanoid?.global === 'string') items.push({ key: 'hum', label: de ? 'Humanoiden‑Markt (global)' : 'Humanoids market (global)', value: vol.humanoid.global, chart: 'spark' });
        if (typeof vol?.eu === 'string') items.push({ key: 'eu', label: de ? 'EU‑Anteil' : 'EU share', value: vol.eu, chart: 'donut' });
        return items;
      }
      case 'finance': { // Market 2030, Break-even, CAGR, Revenue 2030 – Werte aus bp/finance & bp/market
        const t = (m.bp ?? {}) as any;
        const items: any[] = [];
        if (typeof t?.market?.volume?.service?.global === 'string') items.push({ key: 'market2030', label: de ? 'Markt 2030' : 'Market 2030', value: t.market.volume.service.global, chart: 'spark' });
        if (typeof t?.finance?.breakEven === 'string') items.push({ key: 'breakEven', label: de ? 'Break‑even' : 'Break‑even', value: t.finance.breakEven, chart: 'bar' });
        if (typeof t?.market?.volume?.service?.cagr === 'string') items.push({ key: 'cagr', label: 'CAGR', value: t.market.volume.service.cagr, chart: 'bar' });
        if (typeof t?.execFacts?.revenue2030 === 'string') items.push({ key: 'revenue2030', label: de ? 'Umsatz 2030' : 'Revenue 2030', value: t.execFacts.revenue2030, chart: 'spark' });
        return items;
      }
      case 'technology': { // Uptime, Latency, Build time, TRL
        const tk = (m.bp?.technology?.kpi ?? {}) as any;
        const items: any[] = [];
        if (tk?.uptime) items.push({ key: 'uptime', label: 'Uptime', value: tk.uptime, chart: 'donut' });
        if (tk?.latencyP95) items.push({ key: 'latency', label: de ? 'Latenz p95' : 'Latency p95', value: tk.latencyP95, chart: 'bar' });
        if (tk?.buildTime) items.push({ key: 'build', label: de ? 'Build‑Zeit' : 'Build time', value: tk.buildTime, chart: 'spark' });
        if (tk?.trl) items.push({ key: 'trl', label: 'TRL', value: tk.trl, chart: 'donut' });
        return items;
      }
      case 'risks': { // Top risks, Mitigation coverage, Regulatory readiness, Runway target
        const rk = (m.bp?.risks?.kpi ?? {}) as any;
        const items: any[] = [];
        if (rk?.topRisks) items.push({ key: 'top', label: de ? 'Top‑Risiken' : 'Top risks', value: rk.topRisks, chart: 'donut' });
        if (rk?.mitigationCoverage) items.push({ key: 'mitigation', label: de ? 'Mitigation' : 'Mitigation', value: rk.mitigationCoverage, chart: 'donut' });
        if (rk?.regulatoryReadiness) items.push({ key: 'reg', label: de ? 'Regulatorik' : 'Regulatory', value: rk.regulatoryReadiness, chart: 'spark' });
        if (rk?.runway) items.push({ key: 'runway', label: de ? 'Runway Ziel' : 'Runway target', value: rk.runway, chart: 'bar' });
        return items;
      }
      case 'traction-kpis': { // Live metrics kompakt (ohne harte Abhängigkeit vom metrics Modul)
        const td = (m.bp?.tractionKpis ?? {}) as any;
        const highlights = Array.isArray(td?.highlights) ? td.highlights : [];
        if (highlights.length === 0) return [] as any[];
        return highlights.slice(0, 4).map((h: string, i: number) => ({ key: `t${i}`, label: de ? 'Highlight' : 'Highlight', value: h, chart: i % 3 === 0 ? 'spark' : i % 3 === 1 ? 'bar' : 'donut' }));
      }
      case 'exit-strategy': { // Kompakte A/B/C Optik
        const ex = (m.bp?.exit ?? {}) as any;
        const items: any[] = [];
        if (ex?.options?.a?.title) items.push({ key: 'growth', label: 'Growth', value: ex.options.a.title, chart: 'bar' });
        if (ex?.options?.b?.title) items.push({ key: 'forecast', label: 'Forecast', value: ex.options.b.title, chart: 'spark' });
        if (ex?.options?.c?.title) items.push({ key: 'share', label: de ? 'Marktanteil' : 'Market share', value: ex.options.c.title, chart: 'donut' });
        return items;
      }
      default:
        return [] as any[];
    }
  }, [messages, chapter.slug, locale]);

  // Einheitliche Icon-Größe; für 'risks' etwas dünnerer Stroke, damit das Ausrufezeichen klar bleibt
  const bulletIconSize = useMemo(() => 20, []);
  const bulletIconStroke = useMemo(() => (
    chapter.slug === 'risks' ? 2.0 : 2.25
  ), [chapter.slug]);

  const bulletIconKeyframes = useMemo(() => {
    switch (chapter.slug) {
      case 'gtm':
        return { animate: { y: [0, -6, 0] as number[] }, transition: { duration: 1.15, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'market':
        return { animate: { y: [0, -5, 0] as number[] }, transition: { duration: 1.05, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'finance':
        return { animate: { scale: [1, 1.12, 1] as number[] }, transition: { duration: 1.05, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'technology':
        return { animate: { rotate: [0, -12, 0] as number[] }, transition: { duration: 1.15, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'team':
        return { animate: { scale: [1, 1.1, 1] as number[] }, transition: { duration: 1.0, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'risks':
        return { animate: { rotate: [0, -10, 0] as number[] }, transition: { duration: 1.05, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'traction-kpis':
        return { animate: { scale: [1, 1.12, 1] as number[] }, transition: { duration: 1.05, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'impact':
        return { animate: { y: [0, -6, 0] as number[] }, transition: { duration: 1.05, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'exit-strategy':
        return { animate: { x: [0, -6, 0] as number[] }, transition: { duration: 1.05, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'business-model':
        return { animate: { scale: [1, 1.1, 1] as number[] }, transition: { duration: 1.0, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
      case 'executive':
      default:
        return { animate: { opacity: [0.85, 1, 0.85] as number[] }, transition: { duration: 1.0, ease: 'easeInOut' as const, repeat: 2, repeatType: 'mirror' as const } };
    }
  }, [chapter.slug]);

  return (
    <Reveal>
      <ElegantCard innerClassName="p-8 print:shadow-none print:ring-0 print:bg-transparent">
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.span
            className="shine-text ai-blue text-3xl sm:text-4xl font-extrabold"
            initial={{ opacity: 0.85, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
            viewport={PITCH_VIEWPORT}
          >
            <AnimatedCounter value={index + 1} delay={index * 0.05} />
          </motion.span>
          <div>
            <h2
              className="shine-text ai-gradient-subtle text-2xl font-extrabold tracking-tight"
            >
              {chapter.title}
            </h2>
          </div>
        </div>
        <div className="text-sm text-[--color-foreground-muted]">
          {index + 1} von {total}
        </div>
      </div>

      {/* KPI/API Cards – oberhalb der Bullets, falls für das Kapitel verfügbar */}
      {kpiCards.length > 0 && (
        <motion.ul
          className="not-prose mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-stretch"
          variants={kpiContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={PITCH_VIEWPORT}
        >
          {kpiCards.map((s: any, idx: number) => (
            <motion.li
              key={`${String(s.label)}-${idx}`}
              variants={kpiItemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
            >
              <ElegantCard className="h-full" innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6" ariaLabel={`${s.label} KPI Card`} role="group">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted]">
                    <span>{s.label}</span>
                  </div>
                  <div className="mb-3 kpi-visual">
                    {s.chart === 'bar' ? (
                      <MiniBarChart
                        series={[24, 36, 42, 51, 58]}
                        height={110}
                        color={theme.warning}
                        ariaLabel={`${s.label} Trend`}
                        yTicksCount={3}
                        showGrid
                        xLabels={['M-4','M-3','M-2','M-1','Now']}
                        valueFormatter={(v) => `${v}`}
                      />
                    ) : s.chart === 'spark' ? (
                      <LineChartAnimated
                        data={[
                          { label: 'M-4', value: 40 },
                          { label: 'M-3', value: 46 },
                          { label: 'M-2', value: 49 },
                          { label: 'M-1', value: 51 },
                          { label: 'Now', value: 55 },
                        ]}
                        width={520}
                        height={120}
                        ariaLabel={`${s.label} Verlauf`}
                        showArea={false}
                        showPoints
                        yTicksCount={3}
                        gradientArea={false}
                        padding={{ top: 8, right: 8, bottom: 18, left: 30 }}
                        tooltipFormatter={(label, value) => `${label} • ${value}`}
                        responsive
                      />
                    ) : (
                      <MiniDonut
                        value={0.7}
                        gradient
                        colorStart={theme.success}
                        colorEnd={theme.accent1}
                        bg={theme.success ? `${theme.success}18` : 'rgba(16,185,129,0.15)'}
                        delay={getKpiDelay(idx) + 0.05}
                        duration={KPI_ANIM_DURATION}
                        className={KPI_DONUT_CLASS}
                      />
                    )}
                  </div>
                  <div className="font-semibold text-[--color-foreground-strong] [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums] text-[15px] md:text-[16px] leading-snug">
                    <span className="whitespace-normal break-words" title={String(s.value)}>{String(s.value)}</span>
                  </div>
                </div>
              </ElegantCard>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {/* Kompakte Inhaltsstichpunkte aus Businessplan/i18n mit Kapitel-Icons */}
      <div className="prose max-w-none">
        {(() => {
          const visibleBullets = bullets.filter((b) => !shouldHideBullet(b));
          if (visibleBullets.length === 0) return null;
          return (
            <motion.ul
              className="grid gap-2.5 md:gap-3 sm:grid-cols-2 list-none p-0 m-0"
              variants={bulletContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={PITCH_VIEWPORT}
            >
              {visibleBullets.map((b, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2.5 text-[13px] md:text-[14px] text-[--color-foreground]"
                  variants={bulletItemVariants}
                  style={{ transformOrigin: 'top left' }}
                >
                  {(() => {
                    const I = Icon;
                    const gradId = `pitch-icon-grad-${chapter.slug}-${i}`;
                    return (
                      <motion.i
                        aria-hidden
                        className="inline-flex items-center justify-center shrink-0 leading-none"
                        initial={false}
                        whileInView={bulletIconKeyframes.animate}
                        transition={bulletIconKeyframes.transition}
                        viewport={PITCH_VIEWPORT}
                        style={{ width: bulletIconSize, height: bulletIconSize }}
                      >
                        {chapter.slug === 'risks' ? (
                          <svg
                            width={bulletIconSize as any}
                            height={bulletIconSize as any}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="none"
                          >
                            <defs>
                              <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={'var(--color-accent-2)'} />
                                <stop offset="100%" stopColor={'var(--color-accent-3)'} />
                              </linearGradient>
                            </defs>
                            <path
                              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                              stroke={`url(#${gradId})`}
                              strokeWidth={bulletIconStroke as any}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <rect x="10.9" y="8.2" width="2.2" height="6.0" rx="1.1" fill={`url(#${gradId})`} shapeRendering="geometricPrecision" />
                            <circle cx="12" cy="16" r="1.5" fill={`url(#${gradId})`} />
                          </svg>
                        ) : (
                          <I
                            className="block w-full h-full"
                            width={bulletIconSize as any}
                            height={bulletIconSize as any}
                            stroke={`url(#${gradId})`}
                            fill="none"
                            strokeWidth={bulletIconStroke as any}
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ shapeRendering: 'geometricPrecision' }}
                          >
                            <defs>
                              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={chapter.slug === 'risks' ? 'var(--color-accent-2)' : 'var(--color-accent)'} />
                                <stop offset="100%" stopColor={'var(--color-accent-3)'} />
                              </linearGradient>
                            </defs>
                          </I>
                        )}
                      </motion.i>
                    );
                  })()}
                  <span>{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          );
        })()}
      </div>

      {/* Mini KPI-Karten für Finance / Traction */}
      {kpiCards.length === 0 && (financeKpis.length > 0 || tractionKpis.length > 0) && (
        <motion.div
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          variants={kpiContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={PITCH_VIEWPORT}
        >
          {(financeKpis.length > 0 ? financeKpis : tractionKpis).map((k, i) => (
            <motion.div
              key={`${k.label}-${i}`}
              variants={kpiItemVariants}
              className="rounded-2xl bg-[--color-surface]/70 ring-1 ring-[--color-border-subtle] p-4"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[11px] tracking-wide uppercase text-[--color-foreground-muted]">{k.label}</div>
              </div>
              <div className="text-[15px] md:text-[16px] font-semibold [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
                {k.value}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        className="mt-6 flex justify-end items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link href={buildLocalePath((locale ?? 'de'), `/chapters/${chapter.slug}`)} prefetch>
          <motion.span
            className="btn-outline-gradient"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Details ansehen
          </motion.span>
        </Link>
      </motion.div>
      </ElegantCard>
    </Reveal>
  );
}
