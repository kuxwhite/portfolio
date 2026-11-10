"use client";

import { useEffect } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { asset } from "@/lib/asset";

/*
 * Jelly mascot from the success screen (Figma "Jelly character"), as live layers:
 * - body: exported bitmap with its volume, glow and noise (370 × 337 incl. effects);
 * - face: the original strokes with Figma's own glow filters (white 8, mint 18 at 80%).
 * Placement is in 402 × 874 frame points: body render bounds start at (16, 144), face at (139.7, 216.8).
 */
const BODY = { x: 16, y: 144, w: 370, h: 337 };
const FACE = { x: 139.7, y: 216.8, w: 124, h: 120 };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const GLOW_FILTER = (id: string) => (
  <filter id={id} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b1" />
    <feColorMatrix in="b1" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.8 0" result="g1" />
    <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b2" />
    <feColorMatrix in="b2" type="matrix" values="0 0 0 0 0.55  0 0 0 0 1  0 0 0 0 0.65  0 0 0 0.8 0" result="g2" />
    <feMerge>
      <feMergeNode in="g1" />
      <feMergeNode in="g2" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

const STROKE = { stroke: "white", strokeWidth: 11, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

// Strokes exported from Figma (Face group, 124 × 120 incl. glow)
const NOSE = "M65.9474 23.5008L65.7284 25.0587L65.4963 26.7102L65.2511 28.4551L64.9927 30.2935L64.7241 32.2046L64.4439 34.1988L64.1534 36.2658L63.8527 38.4054L63.5447 40.5969L63.2279 42.8508L62.9053 45.1462L62.5769 47.4831L62.2426 49.8616L61.904 52.2713L61.5609 54.7121L61.2164 57.1633L60.7101 59.56L59.936 61.6013L58.8644 63.2725L57.5279 64.5675L55.9147 65.4953L54.0366 66.0469L51.8936 66.2223L49.4947 66.0334L46.4885 65.5686";
const SMILE = "M23.5 75.8838L25.2389 78.0559L27.0651 80.1343L28.9816 82.0983L30.9675 83.9449L33.0139 85.6624L35.1194 87.2611L37.275 88.7291L39.4704 90.065L41.7144 91.2807L43.9893 92.3524L46.3039 93.292L48.6375 94.0966L51.0093 94.7795L53.3913 95.3155L55.8011 95.7283L58.2314 95.9957L60.6688 96.137L63.137 96.1344L65.6019 96.0042L68.0859 95.739L70.568 95.3358L73.0602 94.7858L75.5388 94.1067L78.0155 93.2897L80.4801 92.3333L82.9206 91.2465L85.3386 90.0187L87.7222 88.6591L90.0505 87.1645L92.3208 85.5559";

/*
 * Eyes as quadratic curves fitted to the Figma polylines (deviation < 0.3pt), so their shape can morph:
 * a blink brings the top end down and the bottom end up into a closed lid "‿".
 */
const EYE_L_OPEN = "M32.169 24.447 Q27.91 31.07 24.985 42.026";
const EYE_L_SHUT = "M22.6 35.6 Q28.2 39.4 33.8 35.6";
const EYE_R_OPEN = "M98.158 33.721 Q100.42 41.27 100.218 52.599";
const EYE_R_SHUT = "M93.6 45.4 Q99.2 49.2 104.8 45.4";

const BREATH = 3; // s, one breath
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Mascot({ uid }: { uid: string }) {
  const reduce = useReducedMotion();
  const f = (name: string) => `url(#${uid}-${name})`;
  const [scope, animate] = useAnimate();

  // Life: blinks, glances and a proper wink, on a loop (~8.5s). Transforms go on plain <g>s
  // without filters, and blinks morph the stroke itself, so nothing skews.
  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const eyeL = `#${uid}-eyeL`;
    const eyeR = `#${uid}-eyeR`;
    const face = `#${uid}-face`;
    const smile = `#${uid}-smile`;
    const CLOSE = { duration: 0.07, ease: [0.4, 0, 1, 1] } as const;
    const OPEN = { duration: 0.16, ease: [0, 0, 0.2, 1] } as const;

    const blink = async () => {
      await Promise.all([animate(eyeL, { d: EYE_L_SHUT }, CLOSE), animate(eyeR, { d: EYE_R_SHUT }, CLOSE)]);
      await wait(40);
      await Promise.all([animate(eyeL, { d: EYE_L_OPEN }, OPEN), animate(eyeR, { d: EYE_R_OPEN }, OPEN)]);
    };
    const glance = (dx: number, dy = 0) => animate(face, { x: dx, y: dy }, { type: "spring", duration: 0.45, bounce: 0.2 });
    const wink = async () => {
      animate(face, { rotate: 5, x: 2, y: -1 }, { type: "spring", duration: 0.5, bounce: 0.25 });
      animate(smile, { scaleX: 1.1, scaleY: 1.18 }, { type: "spring", duration: 0.45, bounce: 0.3 });
      await animate(eyeR, { d: EYE_R_SHUT }, { duration: 0.09, ease: [0.4, 0, 1, 1] });
      await wait(320);
      animate(smile, { scaleX: 1, scaleY: 1 }, { type: "spring", duration: 0.5, bounce: 0.2 });
      animate(face, { rotate: 0, x: 0, y: 0 }, { type: "spring", duration: 0.6, bounce: 0.2 });
      await animate(eyeR, { d: EYE_R_OPEN }, { duration: 0.18, ease: [0, 0, 0.2, 1] });
    };

    (async () => {
      await wait(1100); // after the entrance
      while (alive) {
        await blink();
        await wait(700);
        if (!alive) break;
        await wink();
        await wait(1000);
        await glance(4, -1);
        await wait(650);
        await glance(0);
        await wait(450);
        await blink();
        await wait(140);
        await blink();
        await wait(800);
        await glance(-4, 0.5);
        await wait(700);
        await glance(0);
        await wait(1100);
      }
    })();
    return () => {
      alive = false;
    };
  }, [animate, reduce, uid]);

  return (
    <div
      ref={scope}
      aria-hidden
      className="absolute"
      style={{ left: pct(BODY.x, 402), top: pct(BODY.y, 874), width: pct(BODY.w, 402), height: pct(BODY.h, 874) }}
    >
      {/* Entrance: drops in and settles like jelly (squash and stretch from the bottom) */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% 82%" }}
        initial={reduce ? false : { scaleX: 0.2, scaleY: 0.2, y: "6%", opacity: 0 }}
        animate={{ scaleX: [0.2, 1.1, 0.95, 1.02, 1], scaleY: [0.2, 0.88, 1.07, 0.98, 1], y: ["6%", "0%", "-2%", "0%", "0%"], opacity: [0, 1, 1, 1, 1] }}
        transition={{ duration: 0.95, times: [0, 0.38, 0.6, 0.8, 1], ease: "easeOut" }}
      >
        {/* Breathing: a slow vertical stretch with a slight sway */}
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: "50% 82%" }}
          animate={reduce ? undefined : { scaleY: [1, 1.05, 1], scaleX: [1, 0.978, 1], rotate: [0, 1, 0, -1, 0] }}
          transition={{
            scaleY: { duration: BREATH, ease: "easeInOut", repeat: Infinity, delay: 1 },
            scaleX: { duration: BREATH, ease: "easeInOut", repeat: Infinity, delay: 1 },
            rotate: { duration: BREATH * 2, ease: "easeInOut", repeat: Infinity, delay: 1 },
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("parts/mascot-body.webp")} alt="" draggable={false} className="absolute inset-0 block h-full w-full max-w-none" />

          {/* Face: appears after the body lands, follows the breath */}
          <motion.svg
            viewBox="0 0 124 120"
            className="absolute overflow-visible"
            style={{
              left: pct(FACE.x - BODY.x, BODY.w),
              top: pct(FACE.y - BODY.y, BODY.h),
              width: pct(FACE.w, BODY.w),
              height: pct(FACE.h, BODY.h),
            }}
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1, y: reduce ? 0 : [0, -1.8, 0] }}
            transition={{
              opacity: { duration: 0.3, delay: 0.42, ease: "easeOut" },
              scale: { type: "spring", duration: 0.5, bounce: 0.35, delay: 0.42 },
              y: { duration: BREATH, ease: "easeInOut", repeat: Infinity, delay: 1 },
            }}
          >
            <defs>
              {GLOW_FILTER(`${uid}-g1`)}
              {GLOW_FILTER(`${uid}-g2`)}
              {GLOW_FILTER(`${uid}-g3`)}
              {GLOW_FILTER(`${uid}-g4`)}
            </defs>
            <g id={`${uid}-face`}>
              <g filter={f("g1")}>
                <path id={`${uid}-eyeL`} d={EYE_L_OPEN} {...STROKE} />
              </g>
              <g filter={f("g2")}>
                <path id={`${uid}-eyeR`} d={EYE_R_OPEN} {...STROKE} />
              </g>
              <g filter={f("g3")}>
                <path d={NOSE} {...STROKE} />
              </g>
              <g id={`${uid}-smile`}>
                <g filter={f("g4")}>
                  <path d={SMILE} {...STROKE} />
                </g>
              </g>
            </g>
          </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
