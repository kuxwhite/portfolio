"use client";

import { useEffect, type RefObject } from "react";
import { animate } from "motion/react";

type Swipe = {
  id: number;
  x: number;
  y: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  start: number;
  index: number;
  positions: number[];
  dragging: boolean;
};

/** Each touch gesture advances at most one column. CSS scroll snap covers keyboard and trackpad scrolling. */
export function useCaseSwipe(strip: RefObject<HTMLDivElement | null>, navigation: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = strip.current;
    const nav = navigation.current;
    if (!el || !nav) return;

    const mobile = matchMedia("(max-width: 767px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let swipe: Swipe | undefined;
    let settle: { stop: () => void } | undefined;

    const stops = () => {
      const card = nav.children[1].getBoundingClientRect();
      const stripBox = el.getBoundingClientRect();
      const last = el.scrollWidth - el.clientWidth;
      const center = el.scrollLeft + card.left + card.width / 2 - stripBox.left - stripBox.width / 2;
      return [0, Math.max(0, Math.min(last, center)), last];
    };
    const restoreSnap = () => {
      settle = undefined;
      el.style.removeProperty("scroll-snap-type");
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !event.isPrimary || !mobile.matches) return;
      const start = el.scrollLeft;
      const positions = stops();
      const index = positions.reduce((best, position, i) =>
        Math.abs(position - start) < Math.abs(positions[best] - start) ? i : best, 0);
      settle?.stop();
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, start, index, positions, dragging: false };
    };

    const onMove = (event: PointerEvent) => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = swipe.x - event.clientX;
      if (!swipe.dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(event.clientY - swipe.y)) return;
        swipe.dragging = true;
        el.style.scrollSnapType = "none";
        el.setPointerCapture(event.pointerId);
      }
      const positions = swipe.positions;
      const min = positions[Math.max(0, swipe.index - 1)];
      const max = positions[Math.min(positions.length - 1, swipe.index + 1)];
      swipe.velocity = (swipe.lastX - event.clientX) / Math.max(1, event.timeStamp - swipe.lastTime);
      swipe.lastX = event.clientX;
      swipe.lastTime = event.timeStamp;
      el.scrollLeft = Math.min(max, Math.max(min, swipe.start + dx));
    };

    const onEnd = (event: PointerEvent) => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const { dragging, x, velocity, lastTime, index, positions } = swipe;
      swipe = undefined;
      if (!dragging && !settle) return;

      const dx = x - event.clientX;
      const speed = event.timeStamp - lastTime < 100 ? velocity : 0;
      const direction = Math.sign(Math.abs(dx) >= 32 ? dx : speed);
      const advance = event.type === "pointerup" && dragging && (Math.abs(dx) >= 32 || Math.abs(speed) > 0.35);
      const destination = positions[Math.min(positions.length - 1, Math.max(0, index + (advance ? direction : 0)))];

      if (reducedMotion.matches || Math.abs(el.scrollLeft - destination) < 1) {
        el.scrollLeft = destination;
        restoreSnap();
        return;
      }
      settle = animate(el.scrollLeft, destination, {
        type: "spring",
        duration: 0.32,
        bounce: 0,
        onUpdate: (left) => { el.scrollLeft = left; },
        onComplete: restoreSnap,
      });
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    return () => {
      settle?.stop();
      restoreSnap();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
    };
  }, [strip, navigation]);
}
