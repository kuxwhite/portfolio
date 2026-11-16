"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTimeline, type Timeline } from "@/lib/motion/timeline";
import { SpendingCardPreview } from "@/components/motion/SpendingCardPreview";
import { AuthMotionPreview } from "@/components/motion/AuthMotionPreview";

/** Test bench for the Figma motion previews: play/pause, restart, scrub (not linked from the site). */
function Controls({ tl }: { tl: Timeline }) {
  const [t, setT] = useState(0);
  useEffect(() => tl.time.on("change", setT), [tl]);
  const btn = "h-9 rounded-full bg-bg-subtle px-(--space-16) type-label hover:bg-(--portfolio-palette-neutral-150)";
  return (
    <div className="flex w-full flex-col gap-(--space-8)">
      <div className="flex items-center gap-(--space-8)">
        <button type="button" className={btn} onClick={tl.playing ? tl.pause : tl.play}>
          {tl.playing ? "Пауза" : "Играть"}
        </button>
        <button type="button" className={btn} onClick={tl.restart}>
          Рестарт
        </button>
        <span className="type-mono-s ml-auto text-fg-muted tabular-nums">
          {t.toFixed(2)} / {tl.duration.toFixed(1)} s
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={tl.duration}
        step={0.01}
        value={t}
        aria-label="Время"
        className="w-full accent-(--portfolio-palette-neutral-950)"
        onChange={(e) => {
          tl.pause();
          tl.seek(Number(e.target.value));
        }}
      />
    </div>
  );
}

function Bench({ title, node, tl, children }: { title: string; node: string; tl: Timeline; children: ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-(--space-16)">
      <h2 className="type-overline text-fg-secondary">
        {title} <span className="text-fg-subtle">{node}</span>
      </h2>
      {children}
      <Controls tl={tl} />
    </section>
  );
}

export function MotionLab() {
  const auth = useTimeline(12);
  const spend = useTimeline(7.6);
  return (
    <main className="flex min-h-screen flex-wrap items-start justify-center gap-(--space-32) px-(--page-padding-x) py-(--portfolio-section-padding-y)">
      <div className="w-[424px] max-w-full">
        <Bench title="Auth · Motion v5" node="1420:33175 · 12 s" tl={auth}>
          <AuthMotionPreview timeline={auth} />
        </Bench>
      </div>
      <div className="w-[424px] max-w-full">
        <Bench title="Preview · Animated" node="1435:32574 · 7.6 s" tl={spend}>
          <SpendingCardPreview timeline={spend} />
        </Bench>
      </div>
    </main>
  );
}
