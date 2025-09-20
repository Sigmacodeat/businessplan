"use client";

import React from "react";

export interface MiniBarChartProps {
  series: number[]; // rohe Werte
  height?: number; // px
  barWidth?: number; // px
  gap?: number; // px
  color?: string; // rgba/hex
  ariaLabel?: string;
  // Erweiterungen: Achsen/Labels
  yTicksCount?: number; // default 3
  showGrid?: boolean;   // default true
  xLabels?: Array<string | number>; // optional: Beschriftungen je Säule
  valueFormatter?: (v: number) => string; // optional: Zahlenformat
}

/**
 * Sehr leichte Mini-Bar-Chart (horizontale Säulen), animiert per CSS/inline.
 */
export default function MiniBarChart({ series, height = 140, barWidth = 8, gap = 6, color = "#10b981", ariaLabel, yTicksCount = 3, showGrid = true, xLabels, valueFormatter }: MiniBarChartProps) {
  const safe = Array.isArray(series) && series.length > 0 ? series : [1];
  const max = Math.max(1, Math.max(...safe.map(v => (Number.isFinite(v) ? v : 0))));
  const bars = safe.map((v, i) => ({ key: i, value: Math.max(0, Number.isFinite(v) ? v : 0) }));
  // Achsen-Gutter
  const axisLeft = 34; // px für Y-Achse + Labels
  const axisBottom = 18; // px für X-Labels
  const innerHeight = Math.max(1, height - axisBottom - 6);
  const innerTop = 4;
  const innerBottomY = innerTop + innerHeight;
  const widthInner = bars.length * barWidth + Math.max(0, bars.length - 1) * gap;
  const width = widthInner + axisLeft + 10;
  const fmt = valueFormatter ?? ((v: number) => new Intl.NumberFormat('de-DE').format(v));
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  return (
    <div className="relative w-full" style={{ height }} role="img" aria-label={ariaLabel}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block mx-auto"
        aria-hidden
      >
        {/* Y-Achse */}
        <line x1={axisLeft} x2={axisLeft} y1={innerTop} y2={innerBottomY} stroke="rgba(148,163,184,0.28)" />
        {/* X-Achse */}
        <line x1={axisLeft} x2={axisLeft + widthInner} y1={innerBottomY} y2={innerBottomY} stroke="rgba(148,163,184,0.28)" />

        {/* Y-Ticks + Grid */}
        {Array.from({ length: Math.max(1, yTicksCount) + 1 }).map((_, i) => {
          const ratio = i / Math.max(1, yTicksCount);
          const y = innerTop + (1 - ratio) * innerHeight;
          const val = ratio * max;
          return (
            <g key={`yt-${i}`}>
              {showGrid && (
                <line x1={axisLeft} x2={axisLeft + widthInner} y1={y} y2={y} stroke="rgba(148,163,184,0.18)" strokeDasharray="4 4" />
              )}
              <line x1={axisLeft - 3} x2={axisLeft} y1={y} y2={y} stroke="rgba(148,163,184,0.38)" />
              <text x={axisLeft - 6} y={y} fontSize={10} textAnchor="end" dominantBaseline="middle" fill="rgba(148,163,184,0.85)">{fmt(Math.round(val))}</text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((b, i) => {
          const h = Math.round((b.value / max) * (innerHeight));
          const x = axisLeft + i * (barWidth + gap);
          const y = innerBottomY - h;
          const delay = 50 + i * 35;
          return (
            <g key={b.key}>
              <rect x={x} y={y} width={barWidth} height={h} rx={2} ry={2} fill={color} style={{ opacity: 0.85, transformOrigin: `${x + barWidth / 2}px ${innerBottomY}px`, transform: "scaleY(0)", animation: `barGrow ${300 + i * 40}ms ease-out ${delay}ms forwards` }} />
              {/* Wert-Label über Balken (optional: nur wenn Platz) */}
              {h > 12 && (
                <text x={x + barWidth / 2} y={y - 4} fontSize={10} textAnchor="middle" fill="var(--color-foreground-muted)">{fmt(b.value)}</text>
              )}
            </g>
          );
        })}

        {/* X-Labels */}
        {Array.isArray(xLabels) && xLabels.length === bars.length && xLabels.map((l, i) => (
          <text key={`xl-${i}`} x={axisLeft + i * (barWidth + gap) + barWidth / 2} y={innerBottomY + 12} fontSize={10} textAnchor="middle" fill="rgba(148,163,184,0.85)">{String(l)}</text>
        ))}
        {/* Hover capture & keyboard navigation */}
        <rect
          x={axisLeft}
          y={innerTop}
          width={widthInner}
          height={innerHeight}
          fill="transparent"
          tabIndex={0}
          onKeyDown={(e) => {
            if (bars.length === 0) return;
            if (e.key === 'ArrowLeft') {
              setHoverIdx((prev) => (prev == null ? bars.length - 1 : Math.max(0, prev - 1)));
            } else if (e.key === 'ArrowRight') {
              setHoverIdx((prev) => (prev == null ? 0 : Math.min(bars.length - 1, prev + 1)));
            }
          }}
          onMouseMove={(e) => {
            const bbox = (e.currentTarget as SVGRectElement).getBoundingClientRect();
            const x = e.clientX - bbox.left;
            const rel = Math.max(0, Math.min(widthInner, x));
            const step = barWidth + gap;
            const idx = Math.max(0, Math.min(bars.length - 1, Math.round((rel - barWidth / 2) / step)));
            setHoverIdx(idx);
          }}
          onMouseLeave={() => setHoverIdx(null)}
        />

        {hoverIdx !== null && hoverIdx >= 0 && hoverIdx < bars.length && (
          <g pointerEvents="none">
            {/* vertical guide */}
            <line
              x1={axisLeft + hoverIdx * (barWidth + gap) + barWidth / 2}
              x2={axisLeft + hoverIdx * (barWidth + gap) + barWidth / 2}
              y1={innerTop}
              y2={innerBottomY}
              stroke={color}
              opacity={0.35}
            />
            {/* tooltip box */}
            {(() => {
              const vx = axisLeft + hoverIdx * (barWidth + gap) + barWidth / 2;
              const vy = innerTop + 8;
              const label = Array.isArray(xLabels) && xLabels.length === bars.length ? ` ${String(xLabels[hoverIdx])}` : '';
              const text = `${fmt(bars[hoverIdx].value)}${label ? ' •' + label : ''}`;
              return (
                <g>
                  <rect x={Math.min(vx + 8, axisLeft + widthInner - 160)} y={vy} width={152} height={30} rx={6} ry={6} fill="var(--color-surface)" stroke="var(--color-border)" />
                  <text x={Math.min(vx + 14, axisLeft + widthInner - 154)} y={vy + 20} fontSize={11} fill="var(--color-foreground)">{text}</text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
      <style>
        {`
        @keyframes barGrow { to { transform: scaleY(1); } }
        `}
      </style>
    </div>
  );
}
