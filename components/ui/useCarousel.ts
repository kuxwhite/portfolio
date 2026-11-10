"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Tracks the active slide of a horizontal scroll-snap track and scrolls to a slide on demand. */
export function useCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    const max = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= max - 2) {
      setActive(slides.length - 1);
      return;
    }
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    const left = track.getBoundingClientRect().left + pad;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.getBoundingClientRect().left - left);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [measure, count]);

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    // Position relative to the track itself (offsetLeft is relative to the offset parent, not the track).
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    const target = track.scrollLeft + slide.getBoundingClientRect().left - track.getBoundingClientRect().left - pad;
    const max = track.scrollWidth - track.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: reduce ? "auto" : "smooth" });
  }, []);

  return { trackRef, active, scrollTo };
}
