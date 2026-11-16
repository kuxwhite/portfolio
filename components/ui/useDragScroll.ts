"use client";

import { useEffect, type RefObject } from "react";

const DRAG_THRESHOLD = 4; // px before a press becomes a drag (so clicks still work)
const FRICTION = 0.94; // per frame at 60 fps

/**
 * Horizontal scroller you can grab with the mouse (with a bit of inertia on release)
 * or move with Shift + wheel. Touch and trackpads keep their native scrolling.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let drag: { id: number; x: number; left: number; moved: boolean; lastX: number; lastT: number; v: number } | null = null;
    let raf = 0;
    const snap = getComputedStyle(el).scrollSnapType;

    const stopGlide = () => cancelAnimationFrame(raf);

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopGlide();
      drag = { id: e.pointerId, x: e.clientX, left: el.scrollLeft, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "";
        el.style.scrollSnapType = "none";
      }
      el.scrollLeft = drag.left - dx;
      const dt = Math.max(1, e.timeStamp - drag.lastT);
      drag.v = 0.8 * ((drag.lastX - e.clientX) / dt) + 0.2 * drag.v; // px per ms, smoothed
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, v } = drag;
      drag = null;
      if (!moved) return;
      delete el.dataset.dragging;
      // Swallow the click that follows a drag, so a card under the cursor doesn't open.
      const swallow = (c: MouseEvent) => c.preventDefault();
      el.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => el.removeEventListener("click", swallow, { capture: true }), 0);
      let speed = reduce ? 0 : v * 16; // px per frame
      let last = performance.now();
      const glide = (now: number) => {
        const k = (now - last) / 16.67;
        last = now;
        el.scrollLeft += speed * k;
        speed *= Math.pow(FRICTION, k);
        if (Math.abs(speed) > 0.3) raf = requestAnimationFrame(glide);
        else el.style.scrollSnapType = snap;
      };
      raf = requestAnimationFrame(glide);
    };
    const onWheel = (e: WheelEvent) => {
      // Shift + vertical wheel scrolls sideways (Chrome on Windows does this natively, Safari/Firefox on macOS not always).
      if (!e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max)) return;
      e.preventDefault();
      stopGlide();
      el.scrollLeft += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("dragstart", onDragStart);
    return () => {
      stopGlide();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
}
