"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDragScroll } from "@/components/ui/useDragScroll";

export function CaseStrip({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLDivElement>(null);
  useDragScroll(ref);

  useEffect(() => {
    const row = navigation.current;
    const tile = row?.firstElementChild;
    if (!row || !tile) return;

    // The grid sizes itself in CSS. Only the interactive artboards need a scale.
    const resize = new ResizeObserver(([entry]) => {
      row.style.setProperty("--case-scale", String(entry.contentRect.width / 424));
    });
    resize.observe(tile);
    return () => resize.disconnect();
  }, []);
  return (
    <div ref={ref} className="case-strip no-scrollbar">
      <div ref={navigation} role="group" aria-label={label} className="case-navigation">
        {children}
      </div>
    </div>
  );
}
