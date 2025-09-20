"use client";

import React from "react";
import Image from "next/image";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { MapPin } from "lucide-react";
import RobotIcon from "@/components/ui/RobotIcon";

export default function CVCoverPage() {
  const t = useTranslations("cv");
  const format = useFormatter();
  const locale = useLocale();
  const now = new Date();
  const dateISO = now.toISOString().slice(0, 10);
  const dateStr = format.dateTime(now, { dateStyle: "long" });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = origin ? `${origin}/${locale || "de"}/lebenslauf` : "";

  return (
    <div className="hidden print:block rounded-2xl ring-1 ring-[--color-border-subtle] bg-[--color-surface] shadow-sm p-8 md:p-10 max-w-[210mm] mx-auto">
      <header className="flex items-center justify-between">
        <div className="text-sm text-[--color-foreground-muted]">
          <time dateTime={dateISO}>{dateStr}</time>
        </div>
        <div className="flex items-center gap-2 text-[--color-foreground]">
          <MapPin className="h-4 w-4" aria-hidden />
          <span>{t("location", { default: "Wien, AT" })}</span>
        </div>
      </header>
      <div className="mt-6 grid grid-cols-[96px_1fr] gap-4 items-center">
        <div className="h-24 w-24 rounded-xl overflow-hidden ring-1 ring-[--color-border-subtle]">
          <Image src="/cv/profile.jpg" alt="Profilfoto" width={128} height={128} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[--color-foreground-strong]">
            <span className="inline-flex items-center gap-3 align-middle">
              <RobotIcon size="lg" stroke="currentColor" strokeWidth={2} className="text-[--color-foreground] opacity-90" />
              <span>{t("pageTitle", { default: "Ismet Mesic" })}</span>
            </span>
          </h1>
          <p className="mt-1 text-base md:text-lg text-[--color-foreground-muted]">
            {t("pageSubtitle", { default: "Executive – Unternehmer, Innovator, Sanierer, Mentor & Forscher" })}
          </p>
        </div>
      </div>
      {url ? (
        <div className="mt-6 flex items-center gap-3">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(url)}`}
            alt="QR"
            width={96}
            height={96}
            unoptimized
            className="h-20 w-20 rounded-md ring-1 ring-[--color-border-subtle]"
          />
          <div>
            <p className="text-[13.5px] text-[--color-foreground] m-0">{t("openFullView", { default: "Vollansicht öffnen" })}</p>
            <p className="text-[12px] text-[--color-foreground-muted] m-0 mt-1">{url}</p>
          </div>
        </div>
      ) : null}
      <div className="page-break-after" />
    </div>
  );
}
