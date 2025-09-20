"use client";

import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import { useEffect, useRef } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import { buildLocalePath } from "@/i18n/path";
import RobotIcon from "@/components/ui/RobotIcon";
import LocaleLink from "@/components/navigation/LocaleLink";

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("coverPage");
  const locale = useLocale();
  const pathname = usePathname();
  const stripAnyLocale = (path: string) => path.replace(/^\/(de|en)(?=\/|$)/, "");
  const basePath = stripAnyLocale(pathname || "") || "/";
  const hrefDe = buildLocalePath("de", basePath);
  const hrefEn = buildLocalePath("en", basePath);
  const noticeText = (() => {
    try {
      return tc("confidentialNotice") as string;
    } catch {
      return "Vertraulich – ausschließlich für Evaluierungszwecke. Weitergabe nur mit Zustimmung von SIGMACODE AI Robotics.";
    }
  })();

  // Brand-Teile für zweizeilige Darstellung mit robustem Fallback
  const brandTitle = (() => {
    try {
      return t("brandTitle") as string;
    } catch {
      // Fallback: wenn nicht vorhanden, aus brand übernehmen
      try {
        const full = t("brand") as string;
        // Heuristik: bis letztes Wort ("Robotics") als Subtitle annehmen
        const parts = full.split(" ");
        return parts.length > 1 ? parts.slice(0, -1).join(" ") : full;
      } catch {
        return "SIGMACODE AI";
      }
    }
  })();
  const brandSubtitle = (() => {
    try {
      return t("brandSubtitle") as string;
    } catch {
      try {
        const full = t("brand") as string;
        const parts = full.split(" ");
        return parts.length > 1 ? parts[parts.length - 1] : "";
      } catch {
        return "Robotics";
      }
    }
  })();

  // Marquee: dynamische Animationsdistanz basierend auf Content-Breite
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Cache aktuelle Referenzen innerhalb des Effekts
    const trackEl = trackRef.current;
    const contentEl = contentRef.current;
    const updateWidth = () => {
      const w = contentEl?.offsetWidth || 0;
      if (trackEl && w > 0) {
        trackEl.style.setProperty("--content-w", `${w}px`);
      }
    };
    updateWidth();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && contentEl) {
      ro = new ResizeObserver(() => updateWidth());
      ro.observe(contentEl);
    }
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      if (ro) ro.disconnect();
    };
  }, [noticeText]);

  // Print: automatische, sanfte Skalierung langer Kapitel, damit alles auf A4 passt
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const MM_TO_PX = 96 / 25.4; // CSS px per mm
    // A4-Höhen-Parameter (müssen mit globals.css @media print konsistent bleiben)
    const PAGE_H_MM = 297;
    const M_TOP_MM = 16, M_BOTTOM_MM = 20;
    const SECTION_PAD_TOP_MM = 10, SECTION_PAD_BOTTOM_MM = 8;
    const FOOTER_SAFE_MM = 10; // Sicherheitsabzug für Fußzeile/Fix-Elements

    const getAvailableHeightPx = () => {
      const contentMm = PAGE_H_MM - M_TOP_MM - M_BOTTOM_MM - FOOTER_SAFE_MM;
      const innerMm = contentMm - SECTION_PAD_TOP_MM - SECTION_PAD_BOTTOM_MM;
      return innerMm * MM_TO_PX;
    };

    const scaleSectionsForPrint = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.chapter-section'));
      const availPx = getAvailableHeightPx();
      sections.forEach((el) => {
        // Reset evtl. vorheriger Zustand
        el.style.transform = '';
        el.style.transformOrigin = '';
        el.style.minHeight = '';
        el.removeAttribute('data-print-scaled');

        const rect = el.getBoundingClientRect();
        const needScale = rect.height > availPx;
        if (needScale) {
          const scale = Math.max(0.85, Math.min(0.995, availPx / rect.height));
          el.style.transformOrigin = 'top center';
          el.style.transform = `scale(${scale})`;
          // min-height stört beim Skalieren → neutralisieren
          el.style.minHeight = 'auto';
          el.setAttribute('data-print-scaled', '1');
        }
      });
    };

    const resetScale = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.chapter-section[data-print-scaled="1"]'));
      sections.forEach((el) => {
        el.style.transform = '';
        el.style.transformOrigin = '';
        el.style.minHeight = '';
        el.removeAttribute('data-print-scaled');
      });
    };

    const before = () => scaleSectionsForPrint();
    const after = () => resetScale();
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  return (
    <header role="banner" className="sticky top-0 z-50 backdrop-blur-md bg-background/95 dark:bg-background/95 supports-[backdrop-filter]:bg-background/90 dark:supports-[backdrop-filter]:bg-background/90 print:hidden">
      <div className="container-gutter flex h-14 sm:h-16 items-center justify-between">
        <LocaleLink href="/" className="flex items-center gap-1 sm:gap-2 font-semibold tracking-tight no-underline hover:no-underline focus:no-underline" aria-label={t("homeAria", { brand: t("brand") })}>
          <RobotIcon size={20} strokeWidth={2} stroke="currentColor" className="text-[--color-accent]" />
          <span className="flex flex-col leading-tight items-start">
            <span className="text-[13px] sm:text-base font-semibold leading-none">{brandTitle}</span>
            <span className="text-[9px] sm:text-xs text-muted-foreground -mt-0.5 tracking-wide self-end text-right leading-none">{brandSubtitle}</span>
          </span>
        </LocaleLink>
        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label={t("mainNav")}> 
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="btn-primary text-sm print:hidden"
          >
            {t("downloadPdf")}
          </button>
          <ThemeToggle />
          <div className="inline-flex items-center rounded border border-border overflow-hidden text-xs" role="group" aria-label={t("language")}>
            <Link
              href={hrefDe}
              aria-current={locale === "de" ? "page" : undefined}
              aria-label={`${t("language")}: DE`}
              className={`px-2 py-1.5 transition-colors no-underline hover:no-underline focus:no-underline ${locale === "de" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-foreground"}`}
            >
              DE
            </Link>
            <span aria-hidden className="w-px h-4 bg-border" />
            <Link
              href={hrefEn}
              aria-current={locale === "en" ? "page" : undefined}
              aria-label={`${t("language")}: EN`}
              className={`px-2 py-1.5 transition-colors no-underline hover:no-underline focus:no-underline ${locale === "en" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-foreground"}`}
            >
              EN
            </Link>
          </div>
        </nav>
      </div>
      {/* Dezente Warnleiste (Newsbreak-Style) direkt unter dem Header */}
      <div role="note" className="warning-bar" data-variant="warning">
        <div className="warning-bar__inner container-gutter" aria-label="Hinweis">
          {/* Eine nicht-animierte Live-Nachricht für Screenreader */}
          <span className="sr-only" aria-live="polite">{noticeText}</span>
          <div className="warning-marquee" aria-hidden="true">
            <div className="warning-track" ref={trackRef}>
              {/* Doppelter Content für nahtlosen Loop */}
              <div className="warning-content" ref={contentRef}>
                <span className="warning-text">{noticeText}</span>
                <span className="warning-sep">•</span>
                <span className="warning-text">{noticeText}</span>
                <span className="warning-sep">•</span>
                <span className="warning-text">{noticeText}</span>
              </div>
              <div className="warning-content" aria-hidden="true">
                <span className="warning-text">{noticeText}</span>
                <span className="warning-sep">•</span>
                <span className="warning-text">{noticeText}</span>
                <span className="warning-sep">•</span>
                <span className="warning-text">{noticeText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

