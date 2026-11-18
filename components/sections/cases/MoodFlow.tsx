"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { spring } from "motion";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { AuthMotionPreview } from "@/components/motion/AuthMotionPreview";
import { asset } from "@/lib/asset";
import { E, sample, track, useTimeline } from "@/lib/motion/timeline";
import { FlipCard, NumberChip } from "./FlipCard";

const WIDTH = 350;
const HEIGHT = 436;
const PHONE_SCALE = 272 / 402;
const CARD_WIDTH = 217.871;
const CARD_SCALE = CARD_WIDTH / 322;
const CARD_HEADER_HEIGHT = 578 * PHONE_SCALE;
const SETTINGS_TOP = CARD_HEADER_HEIGHT + 69 * PHONE_SCALE;
const SETTINGS_SCROLL = 536 * PHONE_SCALE;
const CAROUSEL_TRAVEL = 237.49;
const DURATION = 26;
const STOPS = [0, 0.08, 0.17, 0.25, 0.34, 0.43, 0.53, 0.68, 0.79, 0.89, 1];

function Artwork({ name, className }: { name: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(`motion/mood/${name}.svg`)} className={className} alt="" draggable={false} />
  );
}

function DesignArtwork({ name, className, width, height, alt = "" }: { name: string; className?: string; width: number; height: number; alt?: string }) {
  return <Image src={asset(`motion/mood/${name}.webp`)} className={className} alt={alt} width={width} height={height} draggable={false} />;
}

function ScreenHeader({ premium, sticky, glass, frost, scroll, actionOpacity }: {
  premium: MotionValue<number>;
  sticky: MotionValue<number>;
  glass: MotionValue<number>;
  frost: MotionValue<number>;
  scroll: MotionValue<number>;
  actionOpacity: MotionValue<number>;
}) {
  const dotsOpacity = useTransform(sticky, (value) => 1 - value);
  const activeDotX = useTransform(premium, [0, 1], [0, 6]);
  const premiumDotOpacity = useTransform(premium, [0, 1], [1, 0]);
  const activeMiniOpacity = useTransform(frost, [0, 1], [1, 0]);
  return (
    <>
      {/* Render the layers that pass under the glass with the same scroll position.
          This keeps the blur live inside the clipped phone in Chromium and WebKit. */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[82.55px] overflow-hidden bg-[#f7f7f7]"
        style={{ opacity: glass, maskImage: "linear-gradient(#000 34%, #000e 63%, #0009 80%, transparent)" }}>
        <div className="absolute inset-0 blur-[8px]">
          <motion.div className="absolute inset-0" style={{ y: scroll }}>
            <CardActions opacity={actionOpacity} />
            <LinkedAccount />
          </motion.div>
        </div>
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[82.55px]"
        style={{ opacity: glass, background: "linear-gradient(to bottom, rgb(255 255 255 / 96%), rgb(255 255 255 / 92%) 62.79%, rgb(255 255 255 / 72%) 74.42%, rgb(255 255 255 / 38%) 84.88%, rgb(255 255 255 / 12%) 93.02%, transparent)" }} />
      <DesignArtwork name="sticky-back" width={30} height={30} className="absolute top-[47.02px] left-[10.49px]" />
      <motion.div aria-hidden className="absolute top-[61px] left-1/2 h-[3px] w-[28px] -translate-x-1/2" style={{ opacity: dotsOpacity }}>
        <motion.span className="absolute left-0 size-[3px] rounded-full bg-black/25" style={{ opacity: premium }} />
        <motion.span className="absolute left-[19px] size-[3px] rounded-full bg-black/25" style={{ opacity: premiumDotOpacity }} />
        <span className="absolute right-0 size-[3px] rounded-full bg-black/25" />
        <motion.span className="absolute left-0 h-full w-[16px] rounded-full bg-[#131313]" style={{ x: activeDotX }} />
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-[41.95px] h-[40.6px]" style={{ opacity: sticky }}>
        <div className="absolute top-[8.7px] left-1/2 h-[25px] w-[36px] -translate-x-1/2">
          <motion.div className="absolute inset-0" style={{ opacity: activeMiniOpacity }}>
            <DesignArtwork name="card-mini-active" width={36} height={25} />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: frost }}>
            <DesignArtwork name="card-mini" width={36} height={25} />
          </motion.div>
        </div>
        <div className="absolute top-[8.12px] right-[13.53px] whitespace-nowrap text-right text-[10.83px] leading-[13.53px] font-medium">
          <p>$15,400.50</p>
          <p className="text-[8.12px] leading-[10.83px] font-normal text-[#707070]">Debit •• 3688</p>
        </div>
      </motion.div>
    </>
  );
}

function PremiumCard() {
  return (
    <div aria-hidden className="pointer-events-none absolute top-[130px] left-[264.555px] text-white">
      <DesignArtwork name="premium" width={248} height={172} className="absolute top-[-6px] left-[-15px] max-w-none" />
      <div className="relative h-[210px] w-[322px] origin-top-left" style={{ transform: `scale(${CARD_SCALE})` }}>
        <div className="absolute bottom-[16px] left-[16px]">
          <NumberChip compact digits="3812" />
        </div>
      </div>
    </div>
  );
}

const actions = [
  { label: "Transfer", icon: "transfer", fill: "bg-[#11d660]" },
  { label: "Top up", icon: "top-up", fill: "bg-white" },
  { label: "Pay", icon: "pay", fill: "bg-white" },
];

function CardActions({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div aria-hidden className="absolute inset-x-[24px] top-[307px] flex" style={{ opacity }}>
      {actions.map(({ label, icon, fill }) => (
        <div key={icon} className="flex flex-1 flex-col items-center gap-[8px] text-[9.5px] leading-[13.5px]">
          <span className={`grid size-[38px] place-items-center rounded-full ${fill}`}><Artwork name={icon} /></span>
          <span>{label}</span>
        </div>
      ))}
    </motion.div>
  );
}

function LinkedAccount() {
  return (
    <div className="absolute inset-x-0" style={{ top: CARD_HEADER_HEIGHT }}>
      <DesignArtwork name="linked-account" width={272} height={82} alt="Pay from •• 5690, $2,400.00" />
    </div>
  );
}

const accounts = [
  { name: "Debit", number: "3688", amount: "$15,400.50", artwork: "cases/card/surface.svg" },
  { name: "Premium", number: "3812", amount: "$15,750.00", artwork: "motion/mood/premium-surface.svg" },
  { name: "Payroll", number: "4185", amount: "$300.00" },
];

function Dashboard({ slide, debitScale }: { slide: MotionValue<number>; debitScale: MotionValue<number> }) {
  return (
    <>
      <div className="absolute inset-x-[10.83px] top-[47.36px] flex items-start justify-between">
        <DesignArtwork name="bank-profile" width={30} height={30} />
        <DesignArtwork name="bank-toolbar" width={66} height={31} />
      </div>
      <div className="absolute inset-x-[10.83px] top-[109.61px]">
        <p className="text-[11.5px] leading-[14.89px] text-[#707070]">Total balance</p>
        <p className="mt-[9px] text-[32.48px] leading-[36.54px] font-medium tracking-[-0.03em]">$31,450<span className="text-[21.65px] tracking-[-0.015em] text-[#707070]">.50</span></p>
        <div className="mt-[22px] flex gap-[10.83px] text-[13.53px] leading-[16.24px] font-medium text-[#707070]">
          <span className="border-b border-black pb-[7px] text-black">Cards</span><span>Accounts</span><span>Deposits</span><span>Loans</span>
        </div>
      </div>
      <motion.div className="absolute top-[232px] left-[11px] flex gap-[8px]" style={{ x: slide }}>
        {accounts.map(({ name, number, amount, artwork }) => (
          <motion.div key={number} className="size-[105.55px] rounded-[16.24px] bg-[#ededed] p-[10.83px]" style={name === "Debit" ? { scale: debitScale } : undefined}>
            <div className="relative h-[19px] w-[28px] overflow-hidden rounded-[4px] bg-[#9b9188]">
              {artwork && <Image src={asset(artwork)} alt="" width={28} height={19} />}
              <Image src={asset("cases/card/mir.svg")} className="absolute right-[2px] bottom-[2px]" alt="" width={11} height={4} />
            </div>
            <p className="mt-[16.48px] text-[9.47px] leading-[13.53px] text-[#707070]">{name}</p>
            <p className="text-[11.5px] leading-[14.89px] font-medium">{amount}</p>
            <p className="text-[9.47px] leading-[13.53px] text-[#707070]">••{number}</p>
          </motion.div>
        ))}
      </motion.div>
      <DesignArtwork name="banner" alt="Free card with up to 10% cashback" width={251} height={33} className="absolute top-[364px] left-[10.83px]" />
    </>
  );
}

const settings = [
  { label: "Freeze card", detail: "Off", icon: "freeze", top: 0 },
  { label: "Change PIN", icon: "pin", top: 60 },
  { label: "Reissue card", icon: "reissue", top: 120 },
  { label: "Card statement", icon: "statement", top: 180 },
  { label: "Rename", detail: "Debit", icon: "rename", top: 256 },
  { label: "Terms & fees", icon: "fees", top: 316 },
  { label: "Block card", icon: "block", top: 392 },
];

function CardSettings({ frozen, frost }: { frozen: boolean; frost: MotionValue<number> }) {
  const switchColor = useTransform(frost, [0, 1], ["#e3e3e3", "#11ca5f"]);
  const thumbX = useTransform(frost, [0, 1], [0, 14]);
  return (
    <div
      className="absolute left-0 h-[940px] w-[402px] origin-top-left rounded-t-[32px] bg-white"
      style={{ top: SETTINGS_TOP, transform: `scale(${PHONE_SCALE})` }}
    >
      <p className="absolute top-6 left-4 text-[20px] leading-6 font-medium">Card settings</p>
      <div className="absolute inset-x-4 top-[68px] h-[436px]">
        {settings.map(({ label, detail, icon, top }) => (
          <div key={icon} className="absolute inset-x-0 flex h-11 items-center gap-3 text-[16px] leading-5" style={{ top }}>
            <DesignArtwork name={`setting-${icon}`} width={44} height={44} className="shrink-0" />
            <span className={`flex-1 ${icon === "block" ? "text-[#ff3b30]" : ""}`}>
              {label}
              {detail && <span className="mt-1 block text-[14px] leading-5 text-[#707070]">{icon === "freeze" && frozen ? "On" : detail}</span>}
            </span>
            {icon === "freeze" ? (
              <motion.span data-freeze-switch={frozen ? "on" : "off"} className="relative h-7 w-[54px] rounded-full" style={{ backgroundColor: switchColor }}>
                <motion.span className="absolute top-0.5 left-0.5 h-6 w-9 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.08)]" style={{ x: thumbX }} />
              </motion.span>
            ) : <DesignArtwork name="setting-chevron" width={24} height={24} />}
          </div>
        ))}
        {[240, 376].map((top) => (
          <div key={top} aria-hidden className="absolute inset-x-0 h-px" style={{ top, background: "repeating-linear-gradient(to right, #efefef 0 6px, transparent 6px 12px)" }} />
        ))}
      </div>
    </div>
  );
}

const screenLift = track([0, 9.3, 10.03, 10.55, 11.03, DURATION], [0, 0, -234, -234, 0, 0], [E, E, E, E, E]);
// Match the velocity at release, carry the flick into a small overshoot, then settle on the Figma offset.
const detailScroll = track(
  [0, 19.65, 19.77, 20.53, 20.79, 21.65, 22.5, DURATION],
  [0, 0, -45, -SETTINGS_SCROLL - 6.5, -SETTINGS_SCROLL, -SETTINGS_SCROLL, 0, 0],
  ["linear", [0.32, 0, 0.68, 0.41], [0.34, 0.56, 0.47, 1], "easeInOut", "linear", "easeInOut", "linear"],
);
const freezeCard = track([0, 21.23, 21.45, DURATION], [0, 0, 1, 1], "easeInOut");
const enterCard = track([0, 13.75, 14.13, DURATION], [0, 0, 1, 1], ["linear", E, "linear"]);
const pressScale = (at: number) => track(
  [0, at, at + 0.06, at + 0.10, at + 0.19, at + 0.25, DURATION],
  [1, 1, 0.975, 0.975, 1.004, 1, 1],
  ["linear", E, "linear", E, "easeInOut", "linear"],
);
const pickDebit = pressScale(13.63);
const revealDebit = pressScale(17.18);

const getNumber = (value: ReturnType<typeof track>, time: number) => Number(sample(value, time));
const crossfade = (time: number, from: number, to: number) => Math.min(1, Math.max(0, (time - from) / (to - from)));
const smoothFade = (time: number, from: number, to: number) => {
  const progress = crossfade(time, from, to);
  return progress * progress * (3 - 2 * progress);
};

// Sample the spring by timeline time so pause and backward scrubbing land on the same frame.
const travelSpring = spring({
  keyframes: [0, 1], stiffness: 145, damping: 18, mass: 0.9, velocity: 1.2,
  restSpeed: 0.001, restDelta: 0.001,
});
function glide(time: number, from: number, to: number) {
  const progress = crossfade(time, from, to);
  return progress >= 1 ? 1 : travelSpring.next(progress * 760).value;
}

function PlaybackScrubber({ time, onSeek }: { time: MotionValue<number>; onSeek: (value: number) => void }) {
  const [position, setPosition] = useState(0);
  useMotionValueEvent(time, "change", (seconds) => setPosition(Math.round(seconds * 50) / 50));
  const formatTime = (value: number) => `0:${String(Math.floor(value)).padStart(2, "0")}`;
  return (
    <label className="flex items-center gap-3">
      <input type="range" min={0} max={DURATION} step={0.02} value={position}
        onChange={(event) => onSeek(event.currentTarget.valueAsNumber)} aria-label="Время анимации"
        aria-valuetext={`${position.toFixed(2)} с из ${DURATION} с`} className="h-8 min-w-0 flex-1 cursor-pointer accent-[#131313]" />
      <span className="text-xs text-fg-secondary tabular-nums">{formatTime(position)} / {formatTime(DURATION)}</span>
    </label>
  );
}

export function MoodFlow({ label, lab = false, english = false }: { label: string; lab?: boolean; english?: boolean }) {
  const { time, observe, pause, play, restart, seek, playing } = useTimeline(DURATION, { autoplay: !lab });
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scene, setScene] = useState(0);
  const sceneRef = useRef(0);
  const reduce = useReducedMotion();
  const angle = useMotionValue(0);
  const authTime = useMotionValue(0);
  const auth = { duration: 12, time: authTime, playing, pause, play: restart, restart, seek: (seconds: number) => authTime.set(seconds), observe };
  const showCard = scene >= 3;
  const frozen = scene >= 5;
  const homeOpacity = useTransform(time, (s) => s < 25.25 ? smoothFade(s, 10.54, 11.03) : 0);
  const authOpacity = useTransform(time, (s) => s < 11.03 || s >= 25.25 ? 1 : 0);
  const cardOpacity = useTransform(time, (s) => s < 13.75 ? 0 : 1 - smoothFade(s, 25.25, 25.65));
  const cardEntry = useTransform(time, (s) => getNumber(enterCard, s));
  const cardPanelX = useTransform(cardEntry, [0, 1], [272, 0]);
  const homePanelX = useTransform(cardEntry, [0, 1], [0, -24]);
  const phoneLift = useTransform(time, (s) => getNumber(screenLift, s));
  const phoneShellY = useTransform(() => phoneLift.get() * scale);
  const homeX = useTransform(time, (s) => -85 * (glide(s, 11.7, 12.46) - glide(s, 12.62, 13.38)));
  const homeScale = useTransform(time, (s) => getNumber(pickDebit, s));
  const debitScale = useTransform(time, (s) => getNumber(revealDebit, s));
  const contentY = useTransform(time, (s) => getNumber(detailScroll, s));
  const carouselProgress = useTransform(time, (s) => glide(s, 23.02, 23.78));
  const carouselX = useTransform(carouselProgress, (position) => -CAROUSEL_TRAVEL * position);
  const premium = useTransform(carouselProgress, (position) => smoothFade(position, 0.48, 0.995));
  const frost = useTransform(time, (s) => getNumber(freezeCard, s));
  const actionOpacity = useTransform(() => 1 - 0.67 * frost.get() * (1 - premium.get()));
  const glassOpacity = useTransform(contentY, (scroll) => smoothFade(-scroll, 155, 330));
  const stickyOpacity = useTransform(contentY, (scroll) => smoothFade(-scroll, 208, 348));
  const progress = useTransform(time, [14.03, 19.65], [0, 1]);
  const lightX = useTransform(progress, STOPS, [0.5, 0.12, 0.22, 0.86, 0.9, 0.37, 0.5, 0.5, 0.65, 0.4, 0.5]);
  const lightY = useTransform(progress, STOPS, [0.5, 0.36, 0.9, 0.78, 0.11, 0.18, 0.5, 0.5, 0.54, 0.43, 0.5]);
  const strength = useTransform(progress, STOPS, [0, 0.84, 0.93, 0.88, 0.96, 0.7, 0.04, 0.26, 0.3, 0.18, 0]);
  const manual = useRef(false);
  const synchronized = useCallback((seconds: number) => {
    authTime.set(seconds < 25.25 ? Math.min(seconds, 11.5) : 0);
    if (!manual.current) {
      const forward = glide(seconds, 17.29, 18.02);
      const back = glide(seconds, 18.69, 19.43);
      angle.set(180 * (forward + back));
    }
    const next = seconds < 10.54 || seconds >= 25.65 ? 0 : seconds < 13.75 ? 2 : seconds < 20.25 ? 3 : seconds < 21.23 ? 4 : seconds < 23.32 ? 5 : 6;
    if (next !== sceneRef.current) {
      sceneRef.current = next;
      setScene(next);
    }
  }, [angle, authTime]);
  useMotionValueEvent(time, "change", synchronized);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setScale(entry.contentRect.width / WIDTH);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const attachStage = useCallback((element: HTMLDivElement | null) => {
    stage.current = element;
    observe(element);
  }, [observe]);

  function replay() {
    manual.current = false;
    angle.stop();
    synchronized(0);
    restart();
  }

  function takeOverCard() {
    manual.current = true;
    pause();
  }
  function scrub(seconds: number) {
    pause();
    manual.current = false;
    angle.stop();
    seek(seconds);
    synchronized(seconds);
  }

  function togglePlayback() {
    if (playing) pause();
    else if (!lab || time.get() >= DURATION - 0.1) replay();
    else {
      manual.current = false;
      angle.stop();
      synchronized(time.get());
      play();
    }
  }
  const playbackLabel = playing ? (english ? "Pause" : "Пауза") : (english ? "Replay" : "Воспроизвести");

  return (
    <div className="relative w-full">
      <div ref={attachStage} role="group" aria-label={label} className="relative w-full overflow-hidden bg-[#efefef]" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}`, borderRadius: 80 * scale }} data-mood-stage data-flow-scene={scene}>
        {/* Keep the border in the final coordinate space so it is always 2 CSS px. */}
        <motion.div aria-hidden className="pointer-events-none absolute z-10 border-2 border-black/8" style={{ left: 39 * scale - 2, top: 39 * scale - 2, width: 272 * scale + 4, height: 591.36 * scale + 4, borderRadius: 44 * scale + 2, y: reduce ? 0 : phoneShellY }} />
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}>
          <motion.div className="absolute top-[39px] left-[39px] h-[591.36px] w-[272px] overflow-hidden rounded-[44px] bg-[#f7f7f7] text-[#131313]" style={{ y: reduce ? 0 : phoneLift, fontFamily: "var(--portfolio-font-family-rounded)" }} data-mood-phone>
            <motion.div className="absolute inset-0" style={{ opacity: reduce ? 0 : authOpacity }} aria-hidden={showCard || Boolean(reduce) || scene === 2}>
              <AuthMotionPreview layout="flow" timeline={auth} />
            </motion.div>
            <motion.div className="pointer-events-none absolute inset-0 bg-[#f7f7f7]" style={{ opacity: reduce ? 0 : homeOpacity, x: reduce ? 0 : homePanelX }} aria-hidden={scene !== 2 || Boolean(reduce)}>
              <Dashboard slide={homeX} debitScale={homeScale} />
            </motion.div>
            <motion.div className="absolute inset-0 bg-[#f7f7f7]" style={{ opacity: reduce ? 1 : cardOpacity, x: reduce ? 0 : cardPanelX }} inert={!(reduce || showCard)} aria-hidden={!(reduce || showCard)}>
              <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : contentY }}>
                <motion.div className="absolute inset-0" style={{ x: reduce ? 0 : carouselX }}>
                  <PremiumCard />
                  <motion.div className="absolute top-[130px] left-[27.065px] h-[142.09px] w-[217.871px]" style={{ scale: reduce ? 1 : debitScale }} inert={!reduce && (scene === 4 || scene === 6)} onClickCapture={takeOverCard} onKeyDownCapture={(event) => { if (event.key === "Enter" || event.key === " ") takeOverCard(); }}>
                    <FlipCard label="Debit" flipLabel="Show or hide card details" previewScale={CARD_SCALE} scene={{ x: lightX, y: lightY, strength, angle, maxTilt: 13 }}
                      frontArtwork={
                        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: frost }}>
                          <div className="absolute inset-0 bg-[#808080]/18 mix-blend-saturation" />
                          <DesignArtwork name="frost" width={322} height={210} className="absolute inset-0" />
                          <DesignArtwork name="frostBadge" width={56} height={56} className="absolute top-2 right-2" />
                        </motion.div>
                      }
                    />
                  </motion.div>
                  <div aria-hidden className="absolute top-[130px] left-[502px] h-[142px] w-[218px] rounded-[16px] bg-[#8e857c]" />
                </motion.div>
                <CardActions opacity={actionOpacity} />
                <LinkedAccount />
                <CardSettings frozen={frozen} frost={frost} />
              </motion.div>
              <ScreenHeader premium={premium} sticky={stickyOpacity} glass={glassOpacity} frost={frost} scroll={contentY} actionOpacity={actionOpacity} />
            </motion.div>
            <div aria-hidden className="pointer-events-none absolute top-0 left-0 z-1 w-[310px] origin-top-left scale-[0.877419]">
              <Image src={asset("motion/auth/status-bar.svg")} width={310} height={48} alt="" draggable={false} />
            </div>
          </motion.div>
        </div>
      </div>
      {lab && !reduce && <PlaybackScrubber time={time} onSeek={scrub} />}
      {!reduce && (
        <button type="button" onClick={togglePlayback} aria-label={playbackLabel}
          className={lab
            ? "mx-auto mt-1 block min-h-11 rounded-full bg-bg-subtle px-5 type-label motion-reduce:hidden focus-visible:outline-2"
            : "absolute right-3 bottom-3 z-20 grid size-11 place-items-center rounded-full bg-white/95 text-black shadow-sm motion-reduce:hidden focus-visible:outline-2"}
        >
          {lab ? playbackLabel : (
            <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {playing ? <path d="M6 3.5v9m4-9v9" /> : <path d="m6 3.5 6 4.5-6 4.5z" />}
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
