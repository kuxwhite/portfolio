"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "motion/react";

export type Step<P extends string> = { phase: P; ms: number };

/** Camera moves (phone lift / return): symmetric ease-in-out. */
export const MOVE = { duration: 1.1, ease: [0.65, 0, 0.35, 1] as const };
/** Screen cross-fades and reveals: emphasized decelerate. */
export const FADE = { duration: 0.45, ease: [0.2, 0, 0, 1] as const };

/** Phone lift as % of card height: brings the bottom button (y≈816 of 874) into view. */
export const LIFT = "-64%";

export const totalMs = <P extends string>(steps: Step<P>[]) => steps.reduce((s, x) => s + x.ms, 0);

function phaseAt<P extends string>(steps: Step<P>[], ms: number): P {
  let acc = 0;
  for (const s of steps) {
    acc += s.ms;
    if (ms < acc) return s.phase;
  }
  return steps[steps.length - 1].phase;
}

/**
 * Phase of a scenario driven by the carousel clock (ms since this card became active).
 * Inactive cards rest on their first phase.
 */
export function usePhase<P extends string>(steps: Step<P>[], clock: MotionValue<number>, active: boolean): P {
  const first = steps[0].phase;
  const [phase, setPhase] = useState<P>(first);
  useMotionValueEvent(clock, "change", (ms) => {
    if (!active) return;
    const p = phaseAt(steps, ms);
    setPhase((cur) => (cur === p ? cur : p));
  });
  useEffect(() => {
    setPhase(active ? phaseAt(steps, clock.get()) : first);
  }, [active, clock, steps, first]);
  return active ? phase : first;
}

/** Coordinate space of a 402 × 874 app frame; children use % of the frame and cqw for sizes. */
export function ScreenCanvas({ children }: { children: React.ReactNode }) {
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
      transition={FADE}
      className="absolute inset-0 block h-full w-full max-w-none"
    />
  );
}

/** Touch indicator: a soft 44pt disc that settles in, then fades on release. */
export function TapRipple({ show, x, y }: { show: boolean; x: number; y: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="tap"
          aria-hidden
          className="pointer-events-none absolute z-20 size-[10.95cqw] rounded-full bg-[#131313]/15"
          style={{ left: `${(x / 402) * 100}%`, top: `${(y / 874) * 100}%`, translate: "-50% -50%" }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.15, ease: "easeOut" } }}
          exit={{ scale: 1.15, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
        />
      )}
    </AnimatePresence>
  );
}

/** 270° arc spinner, like the app's button loader (24pt). */
export function Loader() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="block size-[5.97cqw]"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="#131313" strokeWidth="2.25" strokeLinecap="round" strokeDasharray="44.8 59.7" />
    </motion.svg>
  );
}

const ROUNDED = "'SF Pro Rounded', ui-rounded, var(--portfolio-font-family)";

/**
 * The app's primary green button (Figma ".button master", 52pt) redrawn in DOM on top of the
 * frame, so press and loading stay crisp. It covers the baked button for the whole scene,
 * which keeps the label from swapping. Colors are the app's own (inside the mockup).
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
        scale: pressed ? 0.96 : 1,
        filter: pressed ? "brightness(0.9)" : "brightness(1)",
      }}
      transition={{
        opacity: { duration: 0 },
        scale: { duration: 0.15, ease: "easeOut" },
        filter: { duration: 0.15, ease: "easeOut" },
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <motion.span
            key="loader"
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            <Loader />
          </motion.span>
        ) : (
          <motion.span
            key="label"
            className="whitespace-nowrap text-[4.23cqw] leading-[5.97cqw]"
            style={{ fontFamily: ROUNDED, fontWeight: 500 }}
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { ROUNDED };
