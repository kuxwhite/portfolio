"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

type Props = {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
  label: string;
  /** 0…1 playback of the active slide; fills the active pill. */
  progress?: MotionValue<number>;
};

function ProgressFill({ progress }: { progress: MotionValue<number> }) {
  // Grows from the 8px dot to the full 36px pill.
  const width = useTransform(progress, (p) => `${8 + 28 * Math.min(1, Math.max(0, p))}px`);
  return <motion.span className="absolute inset-y-0 left-0 rounded-full bg-pagination-dot-active" style={{ width }} />;
}

const StaticFill = () => <span className="absolute inset-y-0 left-0 w-3 rounded-full bg-pagination-dot-active" />;

export function Pagination({ count, active, onSelect, label, progress }: Props) {
  return (
    <div role="tablist" aria-label={label} className="mx-auto flex items-center gap-1 rounded-full bg-pagination-track p-4">
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${i + 1} / ${count}`}
            onClick={() => onSelect?.(i)}
            className={
              "relative h-2 overflow-hidden rounded-full bg-pagination-dot transition-[width,background-color] duration-500 ease-[cubic-bezier(0.2,0,0,1)] " +
              "before:absolute before:-inset-2 before:content-[''] " +
              (isActive ? "w-9" : "w-2 hover:bg-fg-muted")
            }
          >
            {isActive && (progress ? <ProgressFill progress={progress} /> : <StaticFill />)}
          </button>
        );
      })}
    </div>
  );
}
