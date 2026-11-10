"use client";

import { useEffect, useRef, useState } from "react";

const MIN_THUMB = 40;
const IDLE_MS = 900;

/**
 * Overlay scrollbar: a slim grey thumb with no track, shown while the page scrolls
 * (or when hovered) and hidden when there is nothing to scroll. Draggable.
 */
export function ScrollThumb() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const hover = useRef(false);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const thumb = thumbRef.current!;
    let raf = 0;

    const layout = () => {
      const doc = document.documentElement;
      const vh = window.innerHeight;
      const sh = doc.scrollHeight;
      const canScroll = sh > vh + 1;
      setScrollable(canScroll);
      if (!canScroll) return;
      const h = Math.max(MIN_THUMB, (vh / sh) * vh);
      const max = sh - vh;
      const y = (window.scrollY / max) * (vh - h);
      thumb.style.height = `${h}px`;
      thumb.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const wake = () => {
      setVisible(true);
      clearTimeout(idle.current);
      idle.current = setTimeout(() => {
        if (!hover.current && !drag.current) setVisible(false);
      }, IDLE_MS);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
      wake();
    };

    layout();
    const ro = new ResizeObserver(() => layout());
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(idle.current);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: window.scrollY };
    setVisible(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const vh = window.innerHeight;
    const sh = document.documentElement.scrollHeight;
    const h = Math.max(MIN_THUMB, (vh / sh) * vh);
    const ratio = (sh - vh) / (vh - h);
    window.scrollTo({ top: drag.current.startScroll + (e.clientY - drag.current.startY) * ratio, behavior: "instant" });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    idle.current = setTimeout(() => !hover.current && setVisible(false), IDLE_MS);
  };

  return (
    <div
      aria-hidden
      data-scroll-thumb
      className={`group fixed inset-y-0 right-0 z-[60] w-3 max-md:pointer-events-none ${scrollable ? "" : "hidden"}`}
      onPointerEnter={() => {
        hover.current = true;
        setVisible(true);
      }}
      onPointerLeave={() => {
        hover.current = false;
        if (!drag.current) idle.current = setTimeout(() => setVisible(false), IDLE_MS);
      }}
    >
      <div
        ref={thumbRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={
          "absolute right-[3px] top-0 w-1.5 cursor-default touch-none rounded-full bg-fg-subtle/60 " +
          "transition-[opacity,background-color] duration-300 ease-out group-hover:bg-fg-subtle " +
          (visible ? "opacity-100" : "opacity-0")
        }
      />
    </div>
  );
}
