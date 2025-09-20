"use client";

import React from "react";
import Image from "next/image";
import { useTranslations, useFormatter } from "next-intl";
import RobotIcon from "@/components/ui/RobotIcon";

export default function PitchCoverPage() {
  const t = useTranslations("pitchCover");
  const format = useFormatter();
  // Defer dynamic client-only values to state to avoid SSR/CSR mismatch
  const [dateInfo, setDateInfo] = React.useState<{ iso: string; str: string } | null>(null);
  const [origin, setOrigin] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Compute date on client after mount
    const now = new Date();
    setDateInfo({ iso: now.toISOString().slice(0, 10), str: format.dateTime(now, { dateStyle: "long" }) });
    // Read window.location only on client
    setOrigin(window.location.origin);
  }, [format]);

  const url = origin ? `${origin}/pitch` : null;

  return (
    <div className="hidden print:block rounded-2xl ring-1 ring-[--color-border-subtle] bg-[--color-surface] shadow-sm p-8 md:p-10 max-w-[210mm] mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[--color-foreground]">
          <RobotIcon size="sm" strokeWidth={2} stroke="currentColor" />
          <strong>SIGMACODE AI Robotics</strong>
        </div>
        <div className="text-sm text-[--color-foreground-muted]">
          {dateInfo ? (
            <time dateTime={dateInfo.iso}>{dateInfo.str}</time>
          ) : (
            // Render a stable placeholder during SSR/first client render
            <time aria-hidden="true">{/* populated on client */}</time>
          )}
        </div>
      </header>
      <div className="mt-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[--color-foreground-strong]">
          {t("title", { default: "Investor Pitch" })}
        </h1>
        <p className="mt-2 text-base md:text-lg text-[--color-foreground-muted] max-w-[60ch] mx-auto">
          {t("subtitle", { default: "Humanoid Robotics · App‑Store · KI‑Assistenz · Skalierbares RaaS" })}
        </p>
      </div>
      {url ? (
        <div className="mt-6 flex items-center justify-center">
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-3 rounded-lg px-3 py-2 ring-1 ring-[--color-border-subtle] bg-[--color-surface-2]"
            aria-label={t("open", { default: "Pitch-Deck online öffnen" })}
          >
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(url)}`}
              alt="QR"
              width={96}
              height={96}
              unoptimized
              className="h-20 w-20 rounded-md ring-1 ring-[--color-border-subtle]"
            />
            <span className="text-sm text-[--color-foreground-muted]">{url}</span>
          </a>
        </div>
      ) : null}
      <div className="page-break-after" />
    </div>
  );
}

