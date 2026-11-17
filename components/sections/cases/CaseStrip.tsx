"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDragScroll } from "@/components/ui/useDragScroll";

export function CaseStrip({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLDivElement>(null);
  useDragScroll(ref);

  useEffect(() => {
    const strip = ref.current;
    if (!strip) return;

    // Some embedded browsers deliver the touch but leave a nested scroll container stationary.
    // Native scroll gets first chance. Only a completed horizontal gesture can use this fallback.
    let gesture: { id: number; x: number; y: number; left: number; pageY: number; moved: boolean } | undefined;
    let timer: number | undefined;
    let suppressClickUntil = 0;

    const start = (event: TouchEvent) => {
      window.clearTimeout(timer);
      gesture = undefined;
      suppressClickUntil = 0;
      if (event.touches.length !== 1 || strip.scrollWidth <= strip.clientWidth) return;
      const touch = event.touches[0];
      gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, left: strip.scrollLeft, pageY: window.scrollY, moved: false };
    };

    const markNativeScroll = () => {
      if (gesture && Math.abs(strip.scrollLeft - gesture.left) > 3) gesture.moved = true;
    };

    const cancel = () => {
      gesture = undefined;
      window.clearTimeout(timer);
    };

    const end = (event: TouchEvent) => {
      const began = gesture;
      gesture = undefined;
      if (!began || began.moved || event.touches.length > 0) return;
      const touch = Array.from(event.changedTouches).find(({ identifier }) => identifier === began.id);
      if (!touch) return;
      const dx = began.x - touch.clientX;
      const dy = began.y - touch.clientY;
      if (Math.abs(dx) < 36 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
      if (Math.abs(window.scrollY - began.pageY) > 6 || Math.abs(strip.scrollLeft - began.left) > 3) return;

      const max = strip.scrollWidth - strip.clientWidth;
      const origin = Math.round((2 * began.left) / max);
      const next = Math.min(2, Math.max(0, origin + Math.sign(dx)));
      if (next === origin) return;

      suppressClickUntil = performance.now() + 350;
      timer = window.setTimeout(() => {
        if (Math.abs(strip.scrollLeft - began.left) > 3 || Math.abs(window.scrollY - began.pageY) > 6) return;
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        strip.scrollTo({ left: max * next / 2, behavior: reduce ? "auto" : "smooth" });
      }, 90);
    };

    const click = (event: MouseEvent) => {
      if (event.detail && performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    strip.addEventListener("touchstart", start, { passive: true });
    strip.addEventListener("touchend", end, { passive: true });
    strip.addEventListener("touchcancel", cancel, { passive: true });
    strip.addEventListener("scroll", markNativeScroll, { passive: true });
    strip.addEventListener("click", click, true);
    return () => {
      cancel();
      strip.removeEventListener("touchstart", start);
      strip.removeEventListener("touchend", end);
      strip.removeEventListener("touchcancel", cancel);
      strip.removeEventListener("scroll", markNativeScroll);
      strip.removeEventListener("click", click, true);
    };
  }, []);

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
