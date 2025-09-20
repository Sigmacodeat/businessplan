"use client";

import React from "react";

export type SparklineCanvasProps = {
  // Prozentwert 0..1000 (wir clampen intern)
  percent?: number | undefined;
  // Optional: Achsenlabels links/rechts (z.B. Jahre)
  xLabels?: [string, string] | undefined;
  // Optional: ARIA Label für Barrierefreiheit
  ariaLabel?: string | undefined;
  // Optional: Farbe der Linie (rgba)
  color?: string | undefined;
  // Kompakter Modus: engere Paddings, feinere Linien, geringere Glows
  compact?: boolean | undefined;
  // Feintuning-Parameter (optional)
  durationMs?: number | undefined; // Gesamtdauer der Animation (ms), default 980
  lineWidth?: number | undefined;  // Überschreibt berechnete Linienbreite
  glowRadius?: number | undefined; // Überschreibt Glowradius
  areaAlpha?: number | undefined;  // Überschreibt Flächenalpha (0..1)
};

// State-of-the-Art Canvas Sparkline (Variante B: Model/Draw strikt getrennt)
const SparklineCanvas: React.FC<SparklineCanvasProps> = ({ percent, xLabels, ariaLabel, color = 'rgba(16,185,129,0.8)', compact, durationMs, lineWidth: lineWidthOverride, glowRadius: glowRadiusOverride, areaAlpha: areaAlphaOverride }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const resizeObsRef = React.useRef<ResizeObserver | null>(null);
  // Modell-Cache für Hover/Tooltip (breit typisiert, um Vorwärts-Referenzen zu vermeiden)
  // Typisierung bewusst locker, da buildModel intern definiert ist und wir nur Teilfelder nutzen
  const modelRef = React.useRef<any>(null);
  const [hover, setHover] = React.useState<{ x: number; y: number; pct: number } | null>(null);

  // Sichtbarkeitsbeobachtung (leichtgewichtig, ohne zusätzliche Lib)
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.some(e => e.isIntersecting);
      setInView(vis);
    }, { root: null, rootMargin: '-20% 0px -20% 0px', threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1] });
    io.observe(el);
    return () => { try { io.disconnect(); } catch {} };
  }, []);

  type Model = {
    width: number;
    height: number;
    padTop: number;
    padBottom: number;
    padX: number;
    strokeColor: string;
    tipGlowColor: string;
    label: string; // "+XYZ%"
    labelWidth: number;
    startX: number;
    startY: number;
    endX: number;
    yFinal: number; // Ziel-Y für Prozentpunkt
    areaStartColor: string;
    areaEndColor: string;
    lineWidth: number;
    tipRadius: number;
    glowRadius: number;
    duration: number;
  };

  const buildModel = (ctx: CanvasRenderingContext2D, cssW: number, cssH: number): Model => {
    const pRaw = typeof percent === 'number' && Number.isFinite(percent) ? percent : 100;
    const p = Math.max(0, Math.min(1000, pRaw));
    const stroke = color;
    const glow = /239,\s*68,\s*68/.test(color) ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)';

    const padTop = compact ? 6 : 10;
    const padBottom = compact ? 14 : 18;
    const padX = compact ? 8 : 10;

    const label = `${p >= 0 ? '+' : ''}${Math.round(p)}%`;
    ctx.save();
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    const labelWidth = ctx.measureText(label).width;
    ctx.restore();

    // rechter Gutter abhängig von Labelbreite
    const rightGutterBase = compact ? 30 : 36;
    const rightGutter = Math.max(rightGutterBase, labelWidth + 18);

    // Raum für Y-Achse links (fix + etwas Luft)
    const leftAxis = (compact ? 16 : 20) + 8; // 20 Achse + 8 Luft

    const startX = padX + leftAxis;
    const endX = Math.max(startX, cssW - padX - rightGutter);

    const Hdraw = Math.max(1, cssH - padTop - padBottom);
    const normFinal = Math.max(0, Math.min(1, p / 1000));
    const startY = cssH - padBottom - 1;
    const yFinal = padTop + (1 - normFinal) * Hdraw;

    // Area-Farbverlauf (sehr subtil)
    const rgbaMatch = /rgba?\((\s*\d+\s*),(\s*\d+\s*),(\s*\d+\s*)(?:,(\s*\d*\.?\d+\s*))?\)/.exec(stroke) as RegExpExecArray | null;
    const baseR = rgbaMatch ? parseInt(rgbaMatch[1]!, 10) : 16;
    const baseG = rgbaMatch ? parseInt(rgbaMatch[2]!, 10) : 185;
    const baseB = rgbaMatch ? parseInt(rgbaMatch[3]!, 10) : 129;
    const areaStartAlpha = typeof areaAlphaOverride === 'number' ? Math.max(0, Math.min(1, areaAlphaOverride)) : (compact ? 0.08 : 0.12);
    const areaStartColor = `rgba(${baseR},${baseG},${baseB},${areaStartAlpha})`;
    const areaEndColor = `rgba(${baseR},${baseG},${baseB},0.0)`;
    const lineWidth = typeof lineWidthOverride === 'number' ? lineWidthOverride : (compact ? 1.2 : 1.4);
    const tipRadius = compact ? 1.9 : 2.4;
    const glowRadius = typeof glowRadiusOverride === 'number' ? glowRadiusOverride : (compact ? 8 : 10);
    const duration = typeof durationMs === 'number' && Number.isFinite(durationMs) ? Math.max(200, Math.min(4000, Math.floor(durationMs))) : 980;

    return { width: cssW, height: cssH, padTop, padBottom, padX, strokeColor: stroke, tipGlowColor: glow, label, labelWidth, startX, startY, endX, yFinal, areaStartColor, areaEndColor, lineWidth, tipRadius, glowRadius, duration };
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    dpr: number,
    model: Model,
    tt: number,
    xLabels?: [string, string]
  ) => {
    const { width, height, padTop, padBottom, padX, strokeColor, tipGlowColor, label, labelWidth, startX, startY, endX, yFinal, areaStartColor, areaEndColor, lineWidth, tipRadius, glowRadius } = model;

    // Clear & scale
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Ease: Cosine in/out
    const prog = 0.5 * (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, tt))));
    const tipX = startX + (endX - startX) * prog;
    const tipY = startY + (yFinal - startY) * prog;

    // Y-Achse links
    ctx.strokeStyle = 'rgba(148,163,184,0.20)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX + 20, padTop + 0.5);
    ctx.lineTo(padX + 20, height - padBottom + 0.5);
    ctx.stroke();

    // Horizontale Gridline durch StartY (Niveau)
    ctx.strokeStyle = 'rgba(148,163,184,0.12)';
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(startX, startY + 0.5);
    ctx.lineTo(endX, startY + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Entfernt: Fläche unter der Linie – minimalistische Darstellung (nur Linien)

    // Linie
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Entfernt: Glow, Punkt und Ring – minimalistische Darstellung (nur Linien)

    // Entfernt: Prozent-Label mit Pill-Hintergrund – minimalistische Darstellung (nur Linien)

    // X-Labels
    if (Array.isArray(xLabels) && xLabels.length === 2) {
      ctx.fillStyle = 'rgba(148,163,184,0.75)';
      ctx.font = '10.5px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const x0 = padX + 24; // links am Axisbereich
      const x1 = endX;      // rechts am Linienende
      const yAxisLabels = height - padBottom + (compact ? 10 : 12);
      ctx.fillText(xLabels[0], x0, yAxisLabels);
      ctx.fillText(xLabels[1], x1, yAxisLabels);
    }
  };

  const renderOnce = React.useCallback(() => {
    const canvas = canvasRef.current; const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rawDpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
    const dpr = Math.min(2, Math.max(1, Math.floor(rawDpr)));
    const rect = wrapper.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const model = buildModel(ctx, cssW, cssH);
    modelRef.current = model;

    const start = performance.now();
    const step = (ts: number) => {
      const raw = Math.min(1, Math.max(0, (ts - start) / model.duration));
      const eased = 0.5 * (1 - Math.cos(Math.PI * raw));
      draw(ctx, dpr, model, eased, xLabels);
      if (raw < 1 && (inView || typeof document === 'undefined')) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, color, JSON.stringify(xLabels), inView, compact]);

  React.useEffect(() => {
    if (!inView && typeof document !== 'undefined') return; // Zeichne nur wenn sichtbar (oder SSR)
    renderOnce();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [inView, renderOnce]);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      const obs = new ResizeObserver(() => {
        // bei jeder Größenänderung neu zeichnen (debounced via RAF im renderOnce)
        renderOnce();
      });
      obs.observe(el);
      resizeObsRef.current = obs;
      return () => { try { obs.disconnect(); } catch {} };
    } catch {
      // Fallback ohne ResizeObserver
      const handler = () => renderOnce();
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, [renderOnce]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        const el = wrapperRef.current; const m = modelRef.current;
        if (!el || !m) return;
        const rect = el.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        // Projektionsverhältnis entlang der Linie von startX -> endX
        const clampedX = Math.max(m.startX, Math.min(m.endX, localX));
        const ratio = m.endX === m.startX ? 0 : (clampedX - m.startX) / (m.endX - m.startX);
        const yOnLine = m.startY + (m.yFinal - m.startY) * ratio;
        const base = typeof m.pValue === 'number' ? m.pValue : 0;
        const pct = Math.max(0, Math.min(1000, base * ratio));
        setHover({ x: clampedX, y: yOnLine, pct });
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" role="img" aria-label={ariaLabel} />
      {hover && (
        <div
          className="pointer-events-none absolute select-none"
          style={{ left: Math.round(hover.x) + 8, top: Math.max(6, Math.round(hover.y) - 22) }}
        >
          <div className="rounded-md px-2 py-1 text-[10px] bg-[--color-surface] text-[--color-foreground] ring-1 ring-[--color-border] shadow-sm">
            {`${Math.round(hover.pct)}%`}
          </div>
        </div>
      )}
    </div>
  );
};

export default SparklineCanvas;
