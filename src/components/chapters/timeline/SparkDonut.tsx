"use client";

import React from "react";

export interface SparkDonutProps {
  width?: number;
  height?: number;
  segments: Array<{ label: string; value: number; color?: string }>; // values add up to total
  centerLabel?: string; // text in the center
  captionTop?: string;
  captionBottom?: string;
  ariaLabel?: string;
  baseStroke?: string; // ring base color
  ringWidth?: number;
}

const SparkDonut: React.FC<SparkDonutProps> = ({
  width = 420,
  height = 160,
  segments,
  centerLabel,
  captionTop,
  captionBottom,
  ariaLabel,
  baseStroke = 'rgba(148,163,184,0.16)',
  ringWidth = 8,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    const W = Math.max(1, Math.floor(cssW * dpr));
    const H = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }

    const width = cssW, height = cssH;
    const padTop = 8, padBottom = 32;
    const cx = width / 2;
    const cy = (height - padBottom + padTop) / 2 - 6;
    const r = Math.min(width, height) * 0.28;

    const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
    const ease = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

    const draw = (tt: number) => {
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0,0,width,height);

      const prog = ease(tt);
      const sweep = (Math.PI * 2) * Math.max(0.0001, Math.min(1, prog));

      // base ring
      ctx.save();
      ctx.strokeStyle = baseStroke;
      ctx.lineWidth = ringWidth;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // segments
      let cursor = -Math.PI / 2;
      for (const seg of segments) {
        const frac = Math.max(0, Math.min(1, seg.value / total));
        const segSweep = sweep * frac;
        ctx.strokeStyle = seg.color ?? '#10b981';
        ctx.lineCap = 'round';
        ctx.lineWidth = ringWidth;
        ctx.beginPath();
        ctx.arc(cx, cy, r, cursor, cursor + segSweep);
        ctx.stroke();
        cursor += (Math.PI * 2) * frac; // advance full circle proportion even if not fully drawn yet
      }

      // center label
      if (centerLabel) {
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let fs = 15;
        const fam = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
        const maxW = (r - 8) * 2;
        for (let i = 0; i < 10; i++) {
          ctx.font = `bold ${fs}px ${fam}`;
          if (ctx.measureText(centerLabel).width <= maxW) break;
          fs -= 1; if (fs < 10) break;
        }
        ctx.font = `bold ${fs}px ${fam}`;
        ctx.fillText(centerLabel, cx, cy);
      }

      // captions
      if (captionTop) {
        ctx.fillStyle = 'rgba(148,163,184,0.85)';
        ctx.font = '11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
        ctx.fillText(captionTop, cx, cy + r + 18);
      }
      if (captionBottom) {
        ctx.fillStyle = 'rgba(148,163,184,0.75)';
        ctx.font = '10.5px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
        ctx.fillText(captionBottom, cx, cy + r + 32);
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

    if (!prefersReducedMotion) { draw(0); rafRef.current = requestAnimationFrame(step); }
    else { draw(1); }

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); startRef.current = null; rafRef.current = null; };
  }, [segments, centerLabel, captionTop, captionBottom, baseStroke, ringWidth]);

  return (
    <div className="h-40 bg-transparent ring-0 shadow-none w-full">
      <canvas ref={canvasRef} width={width} height={height} className="block w-full h-full" role="img" aria-label={ariaLabel} />
    </div>
  );
};

export default SparkDonut;
