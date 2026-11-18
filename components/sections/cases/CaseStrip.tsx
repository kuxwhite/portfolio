"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function CaseStrip({ label, children }: { label: string; children: ReactNode }) {
  const navigation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = navigation.current;
    const tile = row?.firstElementChild;
    if (!row || !tile) return;

    // The grid scales the interactive artboards with the static previews.
    const resize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        row.style.setProperty("--case-scale", String(entry.contentRect.width / 424));
      }
    });
    resize.observe(tile);
    return () => resize.disconnect();
  }, []);

  return (
    <div className="case-strip">
      <div ref={navigation} role="group" aria-label={label} className="case-navigation">
        {children}
      </div>
    </div>
  );
}
