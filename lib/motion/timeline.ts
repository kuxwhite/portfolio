"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cubicBezier, motionValue, type MotionValue } from "motion";

/*
 * A tiny deterministic keyframe timeline for the Figma motion previews.
 *
 * Every animated property is a track copied from Figma's `get_motion_context` snippets:
 * `times` are fractions of the loop (0…1), `values` the keyframes, `ease` one easing per segment
 * (cubic-bezier array, "linear" or "easeInOut"). The whole scene is a pure function of time,
 * so a slider can scrub it and pause / restart are exact.
 */
export type Bezier = readonly [number, number, number, number];
export type Ease = Bezier | "linear" | "easeInOut";
export type Track = { times: readonly number[]; values: readonly (number | string)[]; ease: Ease | readonly Ease[] };

/** Main curve of both previews. */
export const E: Bezier = [0.23, 1, 0.32, 1];

export type Props = Partial<{
  opacity: Track;
  x: Track;
  y: Track;
  scale: Track;
  scaleX: Track;
  scaleY: Track;
  rotate: Track; // degrees
  background: Track; // hex colour
  stroke: Track; // inside stroke width in px (box-shadow inset), colour from data-stroke
  dash: Track; // SVG reveal: visible fraction of a pathLength=1 stroke
  /** Static: x/y are expressed in a frame rotated by this many degrees (Figma design transform). */
  frame: number;
}>;

const easeCache = new Map<string, (t: number) => number>();
function easing(e: Ease): (t: number) => number {
  if (e === "linear") return (t) => t;
  const b: Bezier = e === "easeInOut" ? [0.42, 0, 0.58, 1] : e;
  const key = b.join(",");
  let fn = easeCache.get(key);
  if (!fn) easeCache.set(key, (fn = cubicBezier(b[0], b[1], b[2], b[3])));
  return fn;
}

const hex = (c: string) => {
  const h = c.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const mixColor = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(" ")})`;
};

/** Value of a track at loop progress p (0…1). Holds the first/last keyframe outside the range. */
export function sample(track: Track, p: number): number | string {
  const { times, values } = track;
  if (p <= times[0]) return values[0];
  const last = times.length - 1;
  if (p >= times[last]) return values[last];
  let i = 0;
  while (i < last - 1 && p > times[i + 1]) i++;
  const span = times[i + 1] - times[i];
  const u = span > 0 ? (p - times[i]) / span : 1;
  const e = Array.isArray(track.ease) ? (track.ease as readonly Ease[])[i] ?? "linear" : (track.ease as Ease);
  const k = easing(e)(u);
  const a = values[i];
  const b = values[i + 1];
  if (typeof a === "number" && typeof b === "number") return a + (b - a) * k;
  return mixColor(String(a), String(b), k);
}

function apply(el: HTMLElement | SVGElement, props: Props, p: number) {
  const s = el.style;
  const n = (t?: Track, d = 0) => (t ? (sample(t, p) as number) : d);
  if (props.opacity) s.opacity = String(n(props.opacity, 1));
  if (props.x || props.y || props.scale || props.scaleX || props.scaleY || props.rotate) {
    const sc = n(props.scale, 1);
    let x = n(props.x);
    let y = n(props.y);
    if (props.frame) {
      const a = (props.frame * Math.PI) / 180;
      [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    }
    s.transform =
      `translate(${x}px, ${y}px)` +
      (props.rotate ? ` rotate(${n(props.rotate)}deg)` : "") +
      ` scale(${sc * n(props.scaleX, 1)}, ${sc * n(props.scaleY, 1)})`;
  }
  if (props.background) s.background = String(sample(props.background, p));
  if (props.stroke) s.boxShadow = `inset 0 0 0 ${n(props.stroke)}px ${el.dataset.stroke ?? "currentColor"}`;
  if (props.dash) s.strokeDasharray = `${n(props.dash)} 1`;
}

export type Timeline = {
  duration: number; // s
  time: MotionValue<number>; // s
  playing: boolean;
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (t: number) => void;
  /** Observe this element: the loop only runs while it's on screen. */
  observe: (el: Element | null) => void;
};

/**
 * Clock for one preview. Autoplays while the observed element is visible, pauses off screen and
 * in hidden tabs, loops forever. Under prefers-reduced-motion it stays on the first frame (it can
 * still be scrubbed by hand, e.g. in the lab).
 */
export function useTimeline(duration: number, { autoplay = true }: { autoplay?: boolean } = {}): Timeline {
  const [time] = useState(() => motionValue(0));
  const [playing, setPlaying] = useState(false);
  const want = useRef(autoplay); // user intent (pause button)
  const visible = useRef(false);
  const [target, setTarget] = useState<Element | null>(null);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) want.current = false;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      time.set((time.get() + dt) % duration);
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = want.current && visible.current && !document.hidden;
      cancelAnimationFrame(raf);
      last = 0;
      if (run) raf = requestAnimationFrame(tick);
      setPlaying(run);
    };
    syncRef.current = sync;
    const io = target
      ? new IntersectionObserver(([e]) => {
          visible.current = e.isIntersecting;
          sync();
        })
      : null;
    if (io && target) io.observe(target);
    else visible.current = true;
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [duration, target, time]);

  const play = useCallback(() => {
    want.current = true;
    syncRef.current();
  }, []);
  const pause = useCallback(() => {
    want.current = false;
    syncRef.current();
  }, []);
  const seek = useCallback((t: number) => time.set(Math.max(0, Math.min(duration - 1e-6, t))), [duration, time]);
  const restart = useCallback(() => {
    time.set(0);
    play();
  }, [play, time]);

  return { duration, time, playing, play, pause, restart, seek, observe: setTarget };
}

/**
 * Binds elements to tracks: `ref={bind("chip", props)}`. Every frame of `timeline.time` writes the
 * sampled values straight to the elements' styles (no React re-renders).
 */
export function useTracks(timeline: Timeline) {
  const items = useRef(new Map<string, { el: HTMLElement | SVGElement | null; props: Props }>());
  const refs = useRef(new Map<string, (el: HTMLElement | SVGElement | null) => void>());

  useEffect(() => {
    const run = (t: number) => {
      const p = t / timeline.duration;
      items.current.forEach(({ el, props }) => el && apply(el, props, p));
    };
    run(timeline.time.get());
    return timeline.time.on("change", run);
  }, [timeline]);

  return useCallback(
    (key: string, props: Props) => {
      const entry = items.current.get(key);
      if (entry) entry.props = props;
      else items.current.set(key, { el: null, props });
      let ref = refs.current.get(key);
      if (!ref) {
        ref = (el) => {
          const item = items.current.get(key)!;
          item.el = el;
          if (el) apply(el, item.props, timeline.time.get() / timeline.duration);
        };
        refs.current.set(key, ref);
      }
      return ref;
    },
    [timeline],
  );
}

/** Shorthands for tracks that repeat across the previews. */
export const track = (times: readonly number[], values: readonly (number | string)[], ease: Ease | readonly Ease[]): Track => ({
  times,
  values,
  ease,
});
