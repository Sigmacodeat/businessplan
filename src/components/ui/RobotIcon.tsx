"use client";

import React, { useId } from "react";

export type RobotIconProps = {
  size?: number | string | "xs" | "sm" | "md" | "lg";
  className?: string;
  stroke?: string; // Fallback-Farbe, wenn kein Gradient aktiviert ist
  strokeWidth?: number;
  title?: string;
  gradient?: boolean; // aktiviert internen Verlauf (stroke)
  g1?: string; // Startfarbe des Gradients
  g2?: string; // Endfarbe des Gradients
};

/**
 * RobotIcon (kontrolliertes Inline-SVG)
 *
 * Warum Inline-SVG? Bei manchen Icon-Libs sind sehr kleine Details ("Augen")
 * extrem kurz. Mit Gradient + Anti-Aliasing können sie visuell "verschwinden".
 * Dieses SVG zeichnet die Details mit runden Kappen und erlaubt leicht erhöhte
 * Stroke-Breite, damit der Gradient überall sichtbar bleibt.
 */
const RobotIcon: React.FC<RobotIconProps> = ({
  size = 22,
  className = "",
  stroke = "currentColor",
  strokeWidth = 2,
  title,
  gradient = false,
  g1 = "var(--color-accent)",
  g2 = "var(--color-accent-3)",
}) => {
  const mapSize = (s: RobotIconProps["size"]): number | string => {
    if (typeof s === "number") return s;
    if (typeof s === "string") {
      switch (s) {
        case "xs":
          return 16;
        case "sm":
          return 20;
        case "md":
          return 22;
        case "lg":
          return 28;
        default:
          return s;
      }
    }
    return 22;
  };
  const width = mapSize(size);
  const height = width;
  const gradId = useId();
  const strokePaint = gradient ? `url(#${gradId})` : stroke;

  // leichte Verstärkung, damit "Augen" sichtbar bleiben
  const sw = Math.max(1.8, Number(strokeWidth) || 2);

  return (
    <i
      className={["inline-flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={title ? undefined : true}
      title={title}
      style={{ width, height }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokePaint}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        vectorEffect="non-scaling-stroke"
      >
        {gradient ? (
          <defs>
            {/* globaler Verlauf über die gesamte ViewBox, identisch für jedes Detail */}
            <linearGradient id={gradId as any} x1={0 as any} y1={0 as any} x2={24 as any} y2={0 as any} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={g1} />
              <stop offset="100%" stopColor={g2} />
            </linearGradient>
          </defs>
        ) : null}
        {/* Antenne */}
        <path d="M12 8V4H8" />
        {/* Kopf-Rahmen */}
        <rect width="16" height="12" x="4" y="8" rx="2" />
        {/* Ohren-Verbindungen – exakt gleiche Stroke/Gradient-Intensität */}
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        {/* Augen – leicht verlängert für Sichtbarkeit, gleiche Intensität */}
        <path d="M9 13v2.4" />
        <path d="M15 13v2.4" />
      </svg>
    </i>
  );
};

export default RobotIcon;
