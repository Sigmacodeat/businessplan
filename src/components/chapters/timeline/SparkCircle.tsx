"use client";

import React from "react";

export interface SparkCircleProps {
  width?: number;
  height?: number;
  progressEnd?: number; // 0..1
  centerLines: string[]; // one or multiple lines in center
  captionTop?: string; // optional line under circle (primary)
  captionBottom?: string; // second line
  ariaLabel?: string;
  // Style options
  baseStroke?: string; // background ring color
  progressStroke?: string; // progress ring color
  baseWidth?: number; // px
  progressWidth?: number; // px
  outerWidth?: number; // px outer translucent ring
  outerOffset?: number; // px radius offset for outer ring
  withGlow?: boolean;
}

const SparkCircle: React.FC<SparkCircleProps> = ({
  width = 420,
  height = 160,
  progressEnd = 1,
  centerLines,
  captionTop,
  captionBottom,
  ariaLabel,
  baseStroke = "rgba(34,197,94,0.18)",
  progressStroke = "#10b981",
  baseWidth = 8,
  progressWidth = 8,
  outerWidth = 12,
  outerOffset = 2,
  withGlow = true,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);

  const drawElegantProgressCircle = React.useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    prog: number
  ) => {
    // background ring
    ctx.save();
    ctx.strokeStyle = baseStroke;
    ctx.lineWidth = baseWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // progress ring
    ctx.strokeStyle = progressStroke;
    ctx.lineCap = "round";
    ctx.lineWidth = progressWidth;
    ctx.beginPath();
    const start = -Math.PI / 2;
    const end = start + (Math.PI * 2) * Math.max(0.0001, Math.min(1, prog));
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();

    // outer translucent ring
    ctx.save();
    ctx.globalAlpha = 0.25 * Math.pow(Math.max(0, Math.min(1, prog)), 0.6);
    ctx.strokeStyle = progressStroke;
    ctx.lineWidth = outerWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, r + outerOffset, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // tip glow
    if (withGlow) {
      const tipX = cx + r * Math.cos(end);
      const tipY = cy + r * Math.sin(end);
      const grad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10);
      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.35, "rgba(16,185,129,0.85)");
      grad.addColorStop(1, "rgba(16,185,129,0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [baseStroke, baseWidth, progressStroke, progressWidth, outerWidth, outerOffset, withGlow]);

  const drawCenterLines = React.useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    lines: string[],
    opts?: { color?: string; weight?: string | number; startFontSize?: number }
  ) => {
    const color = opts?.color ?? progressStroke;
    const weight = opts?.weight ?? 600;
    let fs = opts?.startFontSize ?? 16;
    const fam = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    const maxW = (r - 10) * 2;
    for (let i = 0; i < 12; i++) {
      ctx.font = `${weight} ${fs}px ${fam}`;
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (widest <= maxW) break;
      fs -= 1;
      if (fs < 10) break;
    }
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${weight} ${fs}px ${fam}`;
    if (lines.length === 1) {
      ctx.fillText(lines[0]!, cx, cy);
    } else {
      const lineHeight = fs + 2;
      const startY = cy - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineHeight));
    }
  }, [progressStroke]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    const W = Math.max(1, Math.floor(cssW * dpr));
    const H = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }

    const width = cssW,
      height = cssH;
    const padTop = 8,
      padBottom = 32;
    const cx = width / 2;
    const cy = (height - padBottom + padTop) / 2 - 4;
    const r = Math.min(width, height) * 0.28;

    const ease = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

    const draw = (tt: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const prog = ease(tt) * Math.max(0, Math.min(1, progressEnd));
      drawElegantProgressCircle(ctx, cx, cy, r, prog);
      drawCenterLines(ctx, cx, cy, r, centerLines, { weight: 600, startFontSize: 16 });

      // captions under circle
      if (captionTop) {
        ctx.fillStyle = "rgba(148,163,184,0.85)";
        ctx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(captionTop, cx, cy + r + 22);
      }
      if (captionBottom) {
        ctx.fillStyle = "rgba(148,163,184,0.75)";
        ctx.font = "10.5px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(captionBottom, cx, cy + r + 38);
      }
    };

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      rafRef.current = null;
    };
  }, [progressEnd, centerLines, captionTop, captionBottom, baseStroke, progressStroke, baseWidth, progressWidth, outerWidth, outerOffset, withGlow, drawElegantProgressCircle, drawCenterLines]);

  return (
    <div className="h-40 bg-transparent ring-0 shadow-none w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-full"
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default SparkCircle;
