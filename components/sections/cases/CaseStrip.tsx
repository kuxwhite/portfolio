"use client";

import { useRef, type ReactNode } from "react";
import { useDragScroll } from "@/components/ui/useDragScroll";

export function CaseStrip({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref);
  return (
    <div ref={ref} className="case-strip no-scrollbar">
      <div role="group" aria-label={label} className="case-navigation">
        {children}
      </div>
    </div>
  );
}
