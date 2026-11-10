"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

/*
 * Timed dot navigation modelled on apple.com's `.dotnav-timed`:
 * - dot 8px; the current dot widens into a track (36px per the design; Apple uses 32px)
 *   over 250ms ease-in, the previous one shrinks back over 250ms ease-out;
 * - the fill is a separate layer that grows linearly from the dot size to the full track,
 *   so it is never clipped, and fades in (80ms ease-in) once the track has opened (240ms).
 */
const DOT = 8;
const TRACK = 36;

type Props = {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
  label: string;
  /** 0…1 playback of the active slide. Without it the current dot shows the static design fill. */
  progress?: MotionValue<number>;
};

function TimedFill({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, (p) => DOT + (TRACK - DOT) * Math.min(1, Math.max(0, p)));
  return (
    <motion.span
      className="absolute inset-y-0 left-0 rounded-full bg-pagination-dot-active"
      style={{ width }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.08, ease: "easeIn", delay: 0.24 } }}
    />
  );
}

const StaticFill = () => <span className="absolute inset-y-0 left-0 w-3 rounded-full bg-pagination-dot-active" />;

export function Pagination({ count, active, onSelect, label, progress }: Props) {
  return (
    <div role="tablist" aria-label={label} className="mx-auto flex items-center gap-1 rounded-full bg-pagination-track p-4">
      {Array.from({ length: count }, (_, i) => {
        const current = i === active;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={current}
            aria-label={`${i + 1} / ${count}`}
            onClick={() => onSelect?.(i)}
            className="group relative flex h-2 items-center before:absolute before:-inset-2 before:content-['']"
          >
            <span
              className={
                "relative block h-2 rounded-full bg-pagination-dot transition-[width,background-color] duration-[250ms] " +
                (current ? "ease-in" : "ease-out group-hover:bg-fg-muted")
              }
              style={{ width: current ? TRACK : DOT }}
            >
              {current && (progress ? <TimedFill key={`fill-${active}`} progress={progress} /> : <StaticFill />)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
