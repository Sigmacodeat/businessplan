"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToAnchor } from "@/lib/scroll";

export default function HashScroll({ headerOffset = 56 }: { headerOffset?: number }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const id = window.location.hash?.slice(1);
      if (!id) return;
      scrollToAnchor(id, { headerOffset, updateHash: false });
    };
    // initial on mount and when route changed
    apply();
    const onHash = () => apply();
    window.addEventListener("hashchange", onHash, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener("hashchange", onHash);
  }, [pathname, headerOffset]);

  return null;
}
