"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

export type Step<P extends string> = { phase: P; ms: number };

export const EASE = [0.32, 0.72, 0, 1] as const;

/** Phone lift as % of card height: brings the bottom button (y≈816 of 874) into view. */
export const LIFT = "-64%";

/**
 * Cycles through timeline steps while the element is in view.
 * Leaving the viewport resets to the first step; reduced motion freezes on it.
 */
export function useTimeline<P extends string>(steps: Step<P>[]) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const running = inView && !reduce;

  useEffect(() => {
    if (!running) {
      setIndex(0);
      return;
    }
    const t = setTimeout(() => setIndex((i) => (i + 1) % steps.length), steps[index].ms);
    return () => clearTimeout(t);
  }, [running, index, steps]);

  return { ref, phase: steps[running ? index : 0].phase, running, reduce: !!reduce };
}

/** Coordinate space of a 402 × 874 app frame; children use % of the frame and cqw for sizes. */
export function ScreenCanvas({ children }: { children: ReactNode }) {
  return <div className="@container absolute left-0 top-0 aspect-[402/874] w-full">{children}</div>;
}

/** Rect in 402 × 874 frame coordinates → absolute % styles. */
export const rect = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `${(x / 402) * 100}%`,
  top: `${(y / 874) * 100}%`,
  width: `${(w / 402) * 100}%`,
  height: `${(h / 874) * 100}%`,
});

export function Frame({ src, visible, alt = "" }: { src: string; visible: boolean; alt?: string }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      draggable={false}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 block h-full w-full max-w-none"
    />
  );
}

/** Touch indicator: a soft circle that grows and fades at the tap point. */
export function TapRipple({ show, x, y }: { show: boolean; x: number; y: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="tap"
          aria-hidden
          className="pointer-events-none absolute z-20 rounded-full bg-black/25 ring-2 ring-white/70"
          style={{ left: `${(x / 402) * 100}%`, top: `${(y / 874) * 100}%`, width: "11cqw", height: "11cqw", translate: "-50% -50%" }}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1, 1.25], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, times: [0, 0.35, 1], ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

export function Loader() {
  return (
    <motion.span
      aria-hidden
      className="block size-[5.97cqw] rounded-full border-[0.5cqw] border-[#131313] border-r-transparent border-b-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
    />
  );
}

/**
 * The app's primary green button (Figma ".button master", 52px high) redrawn in DOM over the
 * screen so press and loading states stay crisp. Colors are the app's own (inside the mockup).
 */
export function AppButton({
  label,
  visible,
  pressed,
  loading,
  style,
}: {
  label: string;
  visible: boolean;
  pressed: boolean;
  loading: boolean;
  style: CSSProperties;
}) {
  return (
    <motion.div
      aria-hidden
      className="absolute z-10 flex items-center justify-center rounded-full bg-[#22df6b] text-[#131313]"
      style={style}
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        scale: pressed ? 0.97 : 1,
        filter: pressed ? "brightness(0.86)" : "brightness(1)",
      }}
      transition={{ duration: visible ? 0.18 : 0.3, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Loader />
          </motion.span>
        ) : (
          <motion.span
            key="t"
            className="whitespace-nowrap text-[4.23cqw] leading-[5.97cqw]"
            style={{ fontFamily: "'SF Pro Rounded', ui-rounded, var(--portfolio-font-family)", fontWeight: 500 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
