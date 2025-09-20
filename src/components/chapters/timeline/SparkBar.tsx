"use client";

import React from "react";

export interface SparkBarProps {
  width?: number;
  height?: number;
  value: number; // aktueller Wert (z. B. 0.6)
  totalMax: number; // Bezugsgröße (z. B. 2.6)
  labelInBar?: string; // Text in der Bar (z. B. "0,6 Mio. €")
  captionTop?: string; // Überschrift unter der Bar
  captionBottom?: string; // zweite Zeile
  ariaLabel?: string;
  color?: string; // Füllfarbe
}

const SparkBar: React.FC<SparkBarProps> = ({
  width = 420,
  height = 160,
  value,
  totalMax,
  labelInBar,
  captionTop,
  captionBottom,
  ariaLabel,
  color = "#10b981",
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    const W = Math.max(1, Math.floor(cssW * dpr));
    const H = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }

    const width = cssW, height = cssH;
    const padX = 10, padTop = 8, padBottom = 32;
    const padInner = 16;
    const barLeft = padX + padInner;
    const barRight = width - padX - padInner;
    const barTop = padTop + 18;
    const barHeight = Math.max(12, Math.min(18, (height - padTop - padBottom) * 0.22));

    const nfDecimalAT = new Intl.NumberFormat('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const ease = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

    const draw = (tt: number) => {
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0,0,width,height);

      // Achsenlinie
      ctx.save();
      ctx.strokeStyle = 'rgba(148,163,184,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(barLeft, barTop + barHeight + 10.5);
      ctx.lineTo(barRight, barTop + barHeight + 10.5);
      ctx.stroke();

      // Hintergrundbar
      ctx.fillStyle = 'rgba(148,163,184,0.12)';
      const barWidth = barRight - barLeft;
      const radius = 8;
      const rrectFill = (x:number,y:number,w:number,h:number,r:number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      };
      rrectFill(barLeft, barTop, barWidth, barHeight, radius);

      // Füllbar animiert
      const prog = ease(tt);
      const frac = Math.max(0, Math.min(1, value / totalMax)) * Math.max(0.0001, Math.min(1, prog));
      ctx.fillStyle = color;
      rrectFill(barLeft, barTop, barWidth * frac, barHeight, radius);

      // Zahl mittig
      const valueLabel = labelInBar ?? `${nfDecimalAT.format(value)} Mio. €`;
      ctx.fillStyle = 'rgba(15,23,42,0.92)';
      ctx.font = '600 12.5px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tx = barLeft + Math.max(40, barWidth * frac) / 2;
      const ty = barTop + barHeight / 2;
      ctx.fillText(valueLabel, tx, ty);

      // Untertitel & Zeitraum
      if (captionTop) {
        ctx.fillStyle = 'rgba(148,163,184,0.85)';
        ctx.font = '11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
        ctx.fillText(captionTop, width / 2, barTop + barHeight + 28);
      }
      if (captionBottom) {
        ctx.fillStyle = 'rgba(148,163,184,0.75)';
        ctx.font = '10.5px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
        ctx.fillText(captionBottom, width / 2, barTop + barHeight + 42);
      }
    };

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 800;
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const tt = Math.max(0, Math.min(1, elapsed / duration));
      draw(tt);
      if (tt < 1) rafRef.current = requestAnimationFrame(step);
    };

    if (!prefersReducedMotion) {
      draw(0);
      rafRef.current = requestAnimationFrame(step);
    } else {
      draw(1);
    }

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); startRef.current = null; rafRef.current = null; };
  }, [value, totalMax, labelInBar, captionTop, captionBottom, color]);

  return (
    <div className="h-40 bg-transparent ring-0 shadow-none w-full">
      <canvas ref={canvasRef} width={width} height={height} className="block w-full h-full" role="img" aria-label={ariaLabel} />
    </div>
  );
};

export default SparkBar;
