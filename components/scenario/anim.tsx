"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "motion/react";

export type Step<P extends string> = { phase: P; ms: number };

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

/** Camera move of the phone inside the card: a critically damped spring (no bounce). */
export const CAMERA = { type: "spring", duration: 1.15, bounce: 0 } as const;
/** Sheets sliding over a screen, as in iOS. */
export const SHEET = { type: "spring", duration: 0.75, bounce: 0 } as const;
/** Press: 0.96 over 150ms ease-out, release springs back. */
const PRESS = { duration: 0.15, ease: "easeOut" } as const;
const RELEASE = { type: "spring", duration: 0.35, bounce: 0 } as const;

/** Patch of screen background that hides the baked element under a live copy. */
function Patch({ style, color }: { style: CSSProperties; color: string }) {
  return <span aria-hidden className="absolute" style={{ ...style, background: color }} />;
}

/**
 * A control cut from the frame (same pixels, real font) laid over a background patch, so pressing
 * it simply shrinks the control to 0.96 with nothing peeking out from under it.
 */
export function Pressable({
  src,
  style,
  bg,
  visible = true,
  pressed,
  radius = "9999px",
  children,
  hideImage = false,
}: {
  src: string;
  style: CSSProperties;
  bg: string;
  visible?: boolean;
  pressed: boolean;
  radius?: string;
  children?: React.ReactNode;
  hideImage?: boolean;
}) {
  if (!visible) return null;
  return (
    <>
      <Patch style={style} color={bg} />
      <motion.div
        aria-hidden
        className="absolute z-10 overflow-hidden"
        style={{ ...style, borderRadius: radius }}
        initial={false}
        animate={{ scale: pressed ? 0.96 : 1 }}
        transition={pressed ? PRESS : RELEASE}
      >
        {children}
        <motion.img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 block h-full w-full max-w-none"
          initial={false}
          animate={{ opacity: hideImage ? 0 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </motion.div>
    </>
  );
}

/** 270° arc spinner, like the app's button loader (24pt). */
export function Loader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="loader"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="block size-[5.97cqw]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
            aria-hidden
          >
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="#131313" strokeWidth="2.25" strokeLinecap="round" strokeDasharray="44.8 59.7" />
          </motion.svg>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** A screen that slides up from the bottom like an iOS sheet and slides back down to dismiss. */
export function Sheet({ src, open, alt = "" }: { src: string; open: boolean; alt?: string }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      draggable={false}
      initial={false}
      animate={{ y: open ? "0%" : "102%" }}
      transition={SHEET}
      className="absolute inset-0 z-20 block h-full w-full max-w-none"
    />
  );
}
