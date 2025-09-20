import * as React from "react";
import { AIBot, type AIBotIconProps } from ".";

export interface AIBotBadgeProps extends Omit<AIBotIconProps, "variant" | "gradient" | "g1" | "g2" | "size"> {
  size?: number | string;
  /** Sanfter Ring um das Badge */
  ring?: boolean;
  /** Leichter Glow-Effekt (dezent) */
  glow?: boolean;
  /** Gradient-Farben des Hintergrunds (fallen zurück auf CSS-Vars im Container) */
  g1?: string;
  g2?: string;
}

/**
 * AIBotBadge – runder, dezenter Gradient-Hintergrund + AIBot in Weiß.
 * Ziel: identisch zum Favicon-Look.
 */
const AIBotBadge: React.FC<AIBotBadgeProps> = ({
  size = 28,
  ring = true,
  glow = false,
  className,
  g1 = "var(--g1, var(--color-accent))",
  g2 = "var(--g2, var(--color-accent-3))",
  strokeWidth = 1.9,
  animate = "both",
  hoverOnly = true,
  reducedMotion = true,
  title = "AI Bot",
  ...rest
}) => {
  const style: React.CSSProperties = {
    // Hintergrund-Gradient; nutzt CSS-Vars, fällt auf übergebene g1/g2 zurück
    background: `linear-gradient(135deg, ${g1}, ${g2})`,
    boxShadow: glow ? `0 6px 20px color-mix(in_oklab, ${g2} 30%, transparent)` : undefined,
  };

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full",
        ring ? "ring-1 ring-[color-mix(in_oklab,color-mix(in_oklab,var(--g1, var(--color-accent))_50%,var(--g2, var(--color-accent-3))_50%)_45%,transparent)]" : "",
        className ?? "",
      ].filter(Boolean).join(" ")}
      style={{ width: size as any, height: size as any, ...style }}
      aria-hidden
    >
      <AIBot
        size="60%"
        className="text-white"
        strokeWidth={strokeWidth}
        gradient={false}
        animate={animate}
        hoverOnly={hoverOnly}
        reducedMotion={reducedMotion}
        title={title}
        {...rest}
      />
    </span>
  );
};

export default AIBotBadge;
