"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { FlipCard } from "@/components/sections/cases/FlipCard";
import { asset } from "@/lib/asset";

const WIDTH = 350;
const HEIGHT = 436;
const CARD_WIDTH = 217.871;
const STOPS = [0, 0.08, 0.17, 0.25, 0.34, 0.43, 0.53, 0.68, 0.79, 0.89, 1];

function Artwork({ name, className }: { name: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(`motion/mood/${name}.svg`)} className={className} alt="" draggable={false} />
  );
}

function ScreenHeader() {
  return (
    <>
      {/* Scale the existing status-bar canvas as a single unit. */}
      <div className="absolute top-0 left-0 w-[310px] origin-top-left" style={{ transform: "scale(0.877419)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("motion/auth/status-bar.svg")} width={310} height={48} alt="" draggable={false} />
      </div>
      <div aria-hidden className="absolute top-[47px] left-[11px] grid size-[30px] place-items-center rounded-full border border-black/8 bg-white/35">
        <Artwork name="back" />
      </div>
      <div aria-hidden className="absolute top-[61px] left-1/2 flex -translate-x-1/2 items-center gap-[3px]">
        <span className="h-[3px] w-[16px] rounded-full bg-[#131313]" />
        <span className="size-[3px] rounded-full bg-black/25" />
        <span className="size-[3px] rounded-full bg-black/25" />
      </div>
    </>
  );
}

function PremiumCard() {
  return (
    <div aria-hidden className="pointer-events-none absolute top-[130px] left-[264.555px] h-[142.09px] w-[217.871px]">
      <Artwork name="premium-edge" className="absolute top-[-6px] left-[-15px] max-w-none" />
      <Artwork name="premium-surface" className="absolute inset-0" />
      <div className="absolute inset-0 overflow-hidden rounded-[16.24px]">
        <div className="absolute right-[-36.77px] bottom-0 rotate-[-16deg]">
          <Artwork name="premium-mark" className="max-w-none" />
        </div>
      </div>
      <Artwork name="premium-rim" className="absolute inset-0" />
    </div>
  );
}

const actions = [
  { label: "Transfer", icon: "transfer", fill: "bg-[#11d660]" },
  { label: "Top up", icon: "top-up", fill: "bg-white" },
  { label: "Pay", icon: "pay", fill: "bg-white" },
];

function CardActions() {
  return (
    <div aria-hidden className="absolute inset-x-[24px] top-[307px] flex">
      {actions.map(({ label, icon, fill }) => (
        <div key={icon} className="flex flex-1 flex-col items-center gap-[8px] text-[9.5px] leading-[13.5px]">
          <span className={`grid size-[38px] place-items-center rounded-full ${fill}`}><Artwork name={icon} /></span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function MoodCardLab() {
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const angle = useMotionValue(0);
  const running = useRef<{ stop: () => void } | null>(null);
  const lightX = useTransform(progress, STOPS, [0.5, 0.12, 0.22, 0.86, 0.9, 0.37, 0.5, 0.5, 0.65, 0.4, 0.5]);
  const lightY = useTransform(progress, STOPS, [0.5, 0.36, 0.9, 0.78, 0.11, 0.18, 0.5, 0.5, 0.54, 0.43, 0.5]);
  const strength = useTransform(progress, STOPS, [0, 0.84, 0.93, 0.88, 0.96, 0.7, 0.04, 0.26, 0.3, 0.18, 0]);
  const tapOpacity = useTransform(progress, [0, 0.54, 0.58, 0.62, 0.65, 1], [0, 0, 0.5, 0.16, 0, 0]);
  const tapScale = useTransform(progress, [0.54, 0.62], [0.65, 1.45]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / WIDTH));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => running.current?.stop(), []);

  function replay() {
    running.current?.stop();
    angle.stop();
    angle.set(0);
    progress.set(0);
    if (reduce) return;
    running.current = animate(progress, 1, {
      duration: 6.1,
      ease: "linear",
      onUpdate: (time) => {
        if (time < 0.58) return;
        const turn = [0.58, 0.71, 0.83, 0.96];
        const ease = (t: number) => t * t * (3 - 2 * t);
        const forward = ease(Math.max(0, Math.min(1, (time - turn[0]) / (turn[1] - turn[0]))));
        const back = ease(Math.max(0, Math.min(1, (time - turn[2]) / (turn[3] - turn[2]))));
        angle.set(180 * (forward + back));
      },
      onComplete: () => { running.current = null; },
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center px-5 py-10">
      <h1 className="mb-6 type-body-l text-center">Mood · сцены 13–14</h1>
      <div ref={stage} className="relative w-full overflow-hidden bg-[#efefef]" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}`, borderRadius: 80 * scale }} data-mood-stage>
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}>
          <div
            className="absolute top-[39px] left-[39px] h-[591.36px] w-[272px]"
            data-mood-phone
          >
            <div aria-hidden className="absolute -inset-[2px] rounded-[46px] bg-[#d7d7d7]" />
            <div className="absolute inset-0 overflow-hidden rounded-[44px] bg-[#f7f7f7] text-[#131313]" style={{ fontFamily: "var(--portfolio-font-family-rounded)" }}>
              <ScreenHeader />
              <PremiumCard />
              <div
                className="absolute top-[130px] left-[27.065px] h-[142.09px] w-[217.871px]"
                onPointerDown={() => { running.current?.stop(); running.current = null; progress.set(0); }}
              >
                <FlipCard label="Debit" flipLabel="Show or hide card details" previewScale={CARD_WIDTH / 322} scene={{ x: lightX, y: lightY, strength, angle, maxTilt: 13 }} />
              </div>
              <motion.span aria-hidden className="pointer-events-none absolute top-[239px] left-[72px] size-[23px] rounded-full border border-white bg-white/70" style={{ opacity: tapOpacity, scale: tapScale }} />
              <CardActions />
              <div aria-hidden className="absolute inset-x-0 top-[392px] h-[180px] rounded-t-[22px] bg-white" />
            </div>
          </div>
        </div>
      </div>
      {reduce ? (
        <p className="mt-5 type-label text-fg-secondary">Нажми на карту, чтобы увидеть реквизиты.</p>
      ) : (
        <button type="button" onClick={replay} className="mt-5 min-h-11 rounded-full motion-reduce:hidden bg-bg-subtle px-5 type-label text-fg-primary focus-visible:outline-2">
          Воспроизвести сцены
        </button>
      )}
    </main>
  );
}
