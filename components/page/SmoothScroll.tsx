"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Smooth wheel scrolling for the whole page (off under reduced motion). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      anchors: { offset: -24 },
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
