"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { asset } from "@/lib/asset";

/*
 * Debit card preview (Figma 1366:57558): the card tilts toward the cursor and catches a glare
 * that follows it. Geometry in Figma points of the 432 × 300 preview:
 * - card 306.67 × 200 at (62.53, 50), radius 20;
 * - the exported render (with its drop shadows) is 348.67 × 242, the card sits at (21, 8.67) inside it.
 * Mouse and pen only; touch keeps the strip scroll. Off under reduced motion.
 */
const PREVIEW = { w: 432, h: 300 };
const CARD = { x: 62.53, y: 50, w: 306.67, h: 200, r: 20 };
const RENDER = { dx: 21, dy: 8.67, w: 348.67, h: 242 };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const MAX_TILT = 14; // deg
const SPRING = { stiffness: 260, damping: 24, mass: 0.6 };

export function TiltCard({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  // Pointer position over the card, 0…1 (0.5 = centre); "active" 0…1 eases the effect in and out.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const sa = useSpring(active, SPRING);

  const rotateY = useTransform(() => (sx.get() - 0.5) * 2 * MAX_TILT * sa.get());
  const rotateX = useTransform(() => -(sy.get() - 0.5) * 2 * MAX_TILT * sa.get());
  const scale = useTransform(sa, [0, 1], [1, 1.04]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0.25) 30%, transparent 60%)`;
  // A soft diagonal sheen that slides opposite to the glare, like light on a laminated card.
  const sheenX = useTransform(sx, [0, 1], ["70%", "30%"]);
  const sheen = useMotionTemplate`linear-gradient(115deg, transparent 20%, rgb(255 255 255 / 0.35) ${sheenX}, transparent 80%)`;

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === "touch") return;
    const r = area.current!.getBoundingClientRect();
    // Relative to the card itself, clamped so the tilt stays sane near the preview edges.
    const cx = r.left + (CARD.x / PREVIEW.w) * r.width;
    const cy = r.top + (CARD.y / PREVIEW.h) * r.height;
    const cw = (CARD.w / PREVIEW.w) * r.width;
    const ch = (CARD.h / PREVIEW.h) * r.height;
    px.set(Math.min(1.15, Math.max(-0.15, (e.clientX - cx) / cw)));
    py.set(Math.min(1.15, Math.max(-0.15, (e.clientY - cy) / ch)));
    active.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    active.set(0);
  };

  return (
    <div ref={area} className="absolute inset-0 [perspective:900px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div
        className="absolute"
        style={{
          left: pct(CARD.x - RENDER.dx, PREVIEW.w),
          top: pct(CARD.y - RENDER.dy, PREVIEW.h),
          width: pct(RENDER.w, PREVIEW.w),
          height: pct(RENDER.h, PREVIEW.h),
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(src)} alt={alt} draggable={false} className="absolute inset-0 block size-full max-w-none" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute overflow-hidden mix-blend-overlay"
          style={{
            left: pct(RENDER.dx, RENDER.w),
            top: pct(RENDER.dy, RENDER.h),
            width: pct(CARD.w, RENDER.w),
            height: pct(CARD.h, RENDER.h),
            borderRadius: `${(CARD.r / CARD.w) * 100}% / ${(CARD.r / CARD.h) * 100}%`,
            opacity: sa,
          }}
        >
          <motion.div className="absolute inset-0" style={{ backgroundImage: glare }} />
          <motion.div className="absolute inset-0" style={{ backgroundImage: sheen }} />
        </motion.div>
      </motion.div>
    </div>
  );
}
