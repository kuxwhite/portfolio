"use client";

import { motion, useReducedMotion } from "motion/react";
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
const EYE_L = "M32.1689 24.4469L31.6516 25.2639L31.1373 26.1343L30.6395 27.0388L30.1359 27.9848L29.6486 28.9649L29.1763 29.9894L28.7085 31.057L28.2467 32.1572L27.8028 33.2811L27.3634 34.4479L26.93 35.6474L26.5145 36.8706L26.1168 38.1175L25.7252 39.397L25.3514 40.7002L24.9851 42.0256";
const EYE_R = "M98.1582 33.7212L98.4303 34.6491L98.6847 35.6275L98.9139 36.6342L99.1373 37.6824L99.3355 38.7588L99.5072 39.8739L99.6626 41.029L99.8032 42.2138L99.9201 43.4165L100.021 44.6593L100.107 45.9318L100.169 47.2221L100.208 48.5303L100.231 49.8682L100.232 51.224L100.218 52.599";
const NOSE = "M65.9474 23.5008L65.7284 25.0587L65.4963 26.7102L65.2511 28.4551L64.9927 30.2935L64.7241 32.2046L64.4439 34.1988L64.1534 36.2658L63.8527 38.4054L63.5447 40.5969L63.2279 42.8508L62.9053 45.1462L62.5769 47.4831L62.2426 49.8616L61.904 52.2713L61.5609 54.7121L61.2164 57.1633L60.7101 59.56L59.936 61.6013L58.8644 63.2725L57.5279 64.5675L55.9147 65.4953L54.0366 66.0469L51.8936 66.2223L49.4947 66.0334L46.4885 65.5686";
const SMILE = "M23.5 75.8838L25.2389 78.0559L27.0651 80.1343L28.9816 82.0983L30.9675 83.9449L33.0139 85.6624L35.1194 87.2611L37.275 88.7291L39.4704 90.065L41.7144 91.2807L43.9893 92.3524L46.3039 93.292L48.6375 94.0966L51.0093 94.7795L53.3913 95.3155L55.8011 95.7283L58.2314 95.9957L60.6688 96.137L63.137 96.1344L65.6019 96.0042L68.0859 95.739L70.568 95.3358L73.0602 94.7858L75.5388 94.1067L78.0155 93.2897L80.4801 92.3333L82.9206 91.2465L85.3386 90.0187L87.7222 88.6591L90.0505 87.1645L92.3208 85.5559";

const BREATH = 3.2; // s, one breath
const WINK_EVERY = 3.6; // s

export function Mascot({ uid }: { uid: string }) {
  const reduce = useReducedMotion();
  const f = (name: string) => `url(#${uid}-${name})`;

  return (
    <div
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
          animate={reduce ? undefined : { scaleY: [1, 1.035, 1], scaleX: [1, 0.985, 1], rotate: [0, 0.8, 0, -0.8, 0] }}
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
            animate={{ opacity: 1, scale: 1, y: reduce ? 0 : [0, -1.2, 0] }}
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
            <g filter={f("g1")}>
              <path d={EYE_L} {...STROKE} />
            </g>
            {/* Wink: the right eye closes for a beat */}
            <motion.g
              filter={f("g2")}
              style={{ transformBox: "fill-box", transformOrigin: "50% 60%" }}
              animate={reduce ? undefined : { scaleY: [1, 1, 0.12, 1, 1] }}
              transition={{ duration: WINK_EVERY, times: [0, 0.55, 0.6, 0.66, 1], ease: "easeInOut", repeat: Infinity, delay: 1.4 }}
            >
              <path d={EYE_R} {...STROKE} />
            </motion.g>
            <g filter={f("g3")}>
              <path d={NOSE} {...STROKE} />
            </g>
            {/* Smile widens a touch with the wink */}
            <motion.g
              filter={f("g4")}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              animate={reduce ? undefined : { scaleX: [1, 1, 1.07, 1, 1], scaleY: [1, 1, 1.12, 1, 1] }}
              transition={{ duration: WINK_EVERY, times: [0, 0.55, 0.62, 0.72, 1], ease: "easeInOut", repeat: Infinity, delay: 1.4 }}
            >
              <path d={SMILE} {...STROKE} />
            </motion.g>
          </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
