"use client";

import { useRef, type ReactNode } from "react";
import { useDragScroll } from "@/components/ui/useDragScroll";

/** Horizontal strip of case previews: native scroll + mouse drag + Shift-wheel; snaps on phones. */
export function CaseStrip({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref);
  return (
    <div
      ref={ref}
      role="list"
      aria-label={label}
      className="no-scrollbar flex w-full cursor-grab items-center gap-(--space-16) overflow-x-auto overscroll-x-contain px-(--page-padding-x) scroll-px-(--page-padding-x) select-none data-dragging:cursor-grabbing max-md:snap-x max-md:snap-mandatory"
    >
      {children}
    </div>
  );
}
