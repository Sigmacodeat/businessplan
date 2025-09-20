import * as React from "react";
import { useId } from "react";

export interface AIBotIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
  title?: string;
  variant?: "outline" | "duotone";
  gradient?: boolean;
  g1?: string;
  g2?: string;
  /**
   * Steuert die Mikro-Animation:
   * - none: keine Animation
   * - blink: nur Pupillen blinzeln selten
   * - pulse: nur Stirn-Node pulsiert sanft
   * - both: beides (Default)
   */
  animate?: "none" | "blink" | "pulse" | "both";
  /** Nur bei Hover animieren (Default: true für dezent) */
  hoverOnly?: boolean;
  /** Respectiert prefers-reduced-motion (Default: true) */
  reducedMotion?: boolean;
}

/**
 * AIBot Icon – dezent, AI-akzentuiert
 *
 * Design-Prinzipien:
 * - Outline-basiert, an Lucide angelehnt (currentColor)
 * - Subtiles AI-Detail: Stirn-Circuit-Node + leichte Eye-Ring-Linse
 * - Optionaler Duotone-Akzent (niedrige Opacity-Fläche)
 */
export const AIBot: React.FC<AIBotIconProps> = ({
  size = 24,
  strokeWidth = 1.75,
  title = "AI Bot",
  variant = "outline",
  className,
  ...props
}) => {
  const ariaProps = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  const duotone = variant === "duotone";
  // Custom-Props abtrennen, damit sie NICHT als DOM-Attribute auf <svg> landen
  const {
    gradient = false,
    g1 = "var(--color-accent)",
    g2 = "var(--color-accent-3)",
    animate = "both",
    hoverOnly = true,
    reducedMotion = true,
    // rest sind nur valide SVG/HTML Props
    ...rest
  } = props as AIBotIconProps & {
    animate?: "none" | "blink" | "pulse" | "both";
    hoverOnly?: boolean;
    reducedMotion?: boolean;
  };
  const gradId = useId();
  const uid = useId();
  const paint = gradient ? `url(#${gradId})` : "currentColor";

  const svgAnimClass = [
    className ?? "",
    "ai-bot",
    animate !== "none" && (hoverOnly ? "ai-bot--hover" : "ai-bot--anim"),
    animate === "blink" && "ai-bot--blink",
    animate === "pulse" && "ai-bot--pulse",
    animate === "both" && "ai-bot--blink ai-bot--pulse",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={paint}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={svgAnimClass}
      {...ariaProps}
      {...rest}
    >
      {/* Scoped Styles für Mikro-Animationen */}
      <style>
        {`
          /* Keyframes: seltenes Blinzeln (kurz unsichtbar), sanftes Pulsieren */
          @keyframes ${uid}-blink { 0%, 96%, 100% { opacity: 1 } 97%, 99% { opacity: 0 } }
          @keyframes ${uid}-pulse { 0%, 100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.06); opacity: 1 } }

          /* Grundzustand: keine Animation */
          .ai-bot .ai-bot__pupil, .ai-bot .ai-bot__node { animation: none; transform-origin: center; }

          /* Aktiv (non-hover) */
          .ai-bot.ai-bot--anim.ai-bot--blink .ai-bot__pupil { animation: ${uid}-blink 6s infinite steps(1, end); }
          .ai-bot.ai-bot--anim.ai-bot--pulse .ai-bot__node { animation: ${uid}-pulse 4.5s ease-in-out infinite; }

          /* Nur bei Hover */
          .ai-bot.ai-bot--hover.ai-bot--blink:hover .ai-bot__pupil { animation: ${uid}-blink 6s infinite steps(1, end); }
          .ai-bot.ai-bot--hover.ai-bot--pulse:hover .ai-bot__node { animation: ${uid}-pulse 4.5s ease-in-out infinite; }

          /* Respektiere reduced motion */
          ${reducedMotion ? `@media (prefers-reduced-motion: reduce) {
            .ai-bot .ai-bot__pupil, .ai-bot .ai-bot__node { animation: none !important; }
          }` : ""}
        `}
      </style>
      {gradient && (
        <defs>
          <linearGradient id={gradId as any} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={g1} />
            <stop offset="100%" stopColor={g2} />
          </linearGradient>
        </defs>
      )}
      {/* Duotone Hintergrund (sehr dezent) */}
      {duotone && (
        <path
          d="M6.5 9.75c0-2.9 2.35-5.25 5.25-5.25s5.25 2.35 5.25 5.25v3.5c0 2.76-2.24 5-5 5h-0.5c-2.76 0-5-2.24-5-5v-3.5z"
          fill={paint}
          opacity="0.08"
          stroke="none"
        />
      )}

      {/* Kopf – sanft gerundet */}
      <rect x="5" y="7.25" width="14" height="10" rx="4.25" stroke={paint} />

      {/* Kinn / Unterkante leicht abgeflacht (AI-Style) */}
      <path d="M8 17.25c.9 1.25 2.37 2 4 2s3.1-.75 4-2" stroke={paint} />

      {/* Antenne */}
      <line x1="12" y1="3.5" x2="12" y2="5.5" stroke={paint} />
      <circle cx="12" cy="2.5" r="1" stroke={paint} />

      {/* Augen – leicht ovale Linsen mit feinem Ring für "AI-Look" */}
      <g>
        <ellipse cx="9" cy="12" rx="1.55" ry="1.35" stroke={paint} />
        {/* Pupille gefüllt, damit sie nicht verschwindet */}
        <circle className="ai-bot__pupil" cx="9" cy="12" r="0.42" fill={paint} stroke="none" />
      </g>
      <g>
        <ellipse cx="15" cy="12" rx="1.55" ry="1.35" stroke={paint} />
        <circle className="ai-bot__pupil" cx="15" cy="12" r="0.42" fill={paint} stroke="none" />
      </g>

      {/* Stirn: subtile AI-Circuit Markierung (Node + Micro-Trace) */}
      <circle className="ai-bot__node" cx="12" cy="9.25" r="0.6" stroke={paint} />
      <path d="M12 9.85v.6" stroke={paint} />
      <path d="M11.5 9.25h-0.5" stroke={paint} />
      <path d="M12.5 9.25h0.5" stroke={paint} />

      {/* Seiten-Ports (Minimal, optional AI-Detail) */}
      <circle cx="5" cy="12" r="0.5" stroke={paint} />
      <circle cx="19" cy="12" r="0.5" stroke={paint} />
    </svg>
  );
};

export default AIBot;
