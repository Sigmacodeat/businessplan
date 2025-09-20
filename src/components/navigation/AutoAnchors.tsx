"use client";
import { useEffect } from "react";
import { chapters } from "@/app/chapters/chapters.config";

function ensureAnchorBefore(el: Element, id: string) {
  const span = document.createElement('span');
  span.id = id + '-anchor';
  span.setAttribute('aria-hidden', 'true');
  span.className = 'sr-only';
  el.parentElement?.insertBefore(span, el);
}

export default function AutoAnchors({ chapterId }: { chapterId: number }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.subchapters?.length) return;

    for (const s of chapter.subchapters) {
      const id = s.id;
      // Already present? (id or id-anchor or data-anchor)
      const has = !!document.getElementById(id)
        || !!document.getElementById(id + '-anchor')
        || !!document.querySelector(`[data-anchor="${CSS.escape(id)}"]`);
      if (has) continue;

      // Try to heuristically locate a target element:
      // 1) exact id startsWith pattern (ids that include the sub id)
      const candidate = document.querySelector(`[id^="${CSS.escape(id)}"], [id*="${CSS.escape(id)}"]`);
      if (candidate) {
        ensureAnchorBefore(candidate, id);
        continue;
      }

      // 2) Headings that contain an accessible name including the title snippet
      // (best effort; avoid expensive searches)
      const heading = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .find(h => (h.textContent || '').toLowerCase().includes((s.title || s.titleKey || id).toLowerCase().split('.').pop() || ''));
      if (heading) {
        ensureAnchorBefore(heading, id);
        continue;
      }

      // 3) Fallback: add anchor at top of main content to avoid broken links (not ideal, but better than 404)
      const main = document.querySelector('main, #main');
      if (main) {
        const span = document.createElement('span');
        span.id = id + '-anchor';
        span.setAttribute('aria-hidden', 'true');
        span.className = 'sr-only';
        main.insertBefore(span, main.firstChild);
      }
    }
  }, [chapterId]);

  return null;
}
