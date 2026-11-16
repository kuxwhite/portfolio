"use client";

import { useRef, type ReactNode } from "react";
import { useHeroDoodle } from "./useHeroDoodle";

/** Interactive wrapper of the hero drawing: focusable toggle button, runs the doodle hook. */
export function DoodleScene({ label, width, children }: { label: string; width: number; children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  useHeroDoodle(scene);
  return (
    <div
      ref={scene}
      role="button"
      tabIndex={0}
      aria-pressed="false"
      aria-label={label}
      style={{ maxWidth: width }}
      className="block w-full cursor-pointer touch-manipulation rounded-card outline-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-primary"
    >
      {children}
    </div>
  );
}
