export type ScrollToAnchorOptions = {
  headerOffset?: number; // expliziter Offset, überschreibt Auto-Erkennung
  updateHash?: boolean; // Default: true – URL-Hash aktualisieren
  behavior?: ScrollBehavior; // 'smooth' | 'auto' – Default: abhängig von prefers-reduced-motion
};

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function parsePx(v: string | null): number {
  if (!v) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// Ermittelt den effektiven Top-Offset der Seite (Header/Top-Padding etc.)
export function getEffectiveTopOffset(explicit?: number): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return explicit ?? 0;
  if (typeof explicit === 'number') return explicit;

  // 1) Verwende das Top-Padding des ersten <main>-Elements, falls vorhanden
  const main = document.querySelector('main');
  if (main) {
    const cs = window.getComputedStyle(main);
    const pt = parsePx(cs.paddingTop);
    if (pt > 0) return pt;
  }

  // 2) Fallback: Höhe eines fixierten/sticky Headers (role=banner oder header Tag)
  const header = (document.querySelector('header[role="banner"], header, [data-header]') as HTMLElement | null);
  if (header) {
    const rect = header.getBoundingClientRect();
    // Wenn Header am oberen Rand klebt, verwende seine Höhe
    if (Math.abs(rect.top) < 1 || rect.top <= 0) return Math.max(0, Math.round(rect.height));
  }

  // 3) Default konservativ: 64px (entspricht pt-16)
  return 64;
}

function findAnchorElement(id: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  // Direktes id-Match
  let el = document.getElementById(id);
  if (el) return el;
  // Häufiges Pattern: "<id>-anchor"
  el = document.getElementById(`${id}-anchor`);
  if (el) return el;
  // Daten-Attribut als Fallback: data-anchor="<id>"
  el = document.querySelector(`[data-anchor="${CSS.escape(id)}"]`) as HTMLElement | null;
  if (el) return el;
  // Letzter Fallback: Anker innerhalb von SectionCard/SplitSection
  el = document.querySelector(`[id^="${CSS.escape(id)}"]`) as HTMLElement | null;
  return el;
}

export function scrollToAnchor(id: string, opts: ScrollToAnchorOptions = {}): boolean {
  if (typeof window === 'undefined') return false;
  const el = findAnchorElement(id);
  if (!el) return false;

  const prefersReduced = getPrefersReducedMotion();
  const offset = getEffectiveTopOffset(opts.headerOffset);
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY - offset;

  window.scrollTo({ top, behavior: opts.behavior ?? (prefersReduced ? 'auto' : 'smooth') });

  if (opts.updateHash !== false) {
    try {
      const url = new URL(window.location.href);
      url.hash = `#${id}`;
      window.history.pushState(null, '', url);
    } catch {}
  }
  return true;
}
