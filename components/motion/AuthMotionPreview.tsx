"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { asset } from "@/lib/asset";
import { E, track, useTimeline, useTracks, type Ease, type Props, type Timeline, type Track } from "@/lib/motion/timeline";

/*
 * Sign-in flow of the Moud case (Figma "Auth · Motion v5 · phone matched to SMS", 1420:33175;
 * spec auth-motion.md). Loop 12 s: phone number → SMS code → create PIN → confirm PIN → Face ID.
 * Every keyframe is copied from get_motion_context. Layout is the 424 × 500 Figma canvas with the
 * 310 × 674 phone at (57, 48), cropped by the card; app UI metrics are Figma's own.
 * The iOS keyboards and status bar are exported from Figma (system components); the Jelly body is a
 * bitmap, its face stays vector because eyes, smile and the face group animate separately.
 */
const D = 12;
const L = "linear" as const;
const IO = "easeInOut" as const;

const C = {
  primary: "#131313",
  secondary: "#707070",
  disabled: "#aeaeae",
  field: "#efefef",
  surface: "#f7f7f7",
  green: "#22df6b",
  positive: "#10b24f",
};

// --- reusable keyframe shapes (values verbatim from Figma) ---
const screenInOut = (t: readonly number[]): Props => ({ opacity: track([0, ...t, 1], [0, 0, 1, 1, 0, 0], [E, E, E, E, L]) });
const contentInOut = (t: readonly number[]): Props => ({ x: track([0, ...t, 1], [16, 16, 0, 0, -12, -12], [L, E, E, E, L]) });
/** Rise: opacity over 0.14 s, translateY 7 → 0 over 0.18 s. */
const rise = (t0: number): Props => ({
  opacity: track([0, t0, t0 + 0.0117, 1], [0, 0, 1, 1], [L, E, L]),
  y: track([0, t0, t0 + 0.015, 1], [7, 7, 0, 0], [L, E, L]),
});
const fieldFocus = (a: number, b: number): Props => ({ stroke: track([0, a, b, 1], [0, 0, 1.157, 1.157], [E, E, L]) });
const pinFill = (t0: number): Props => ({
  y: track([0, t0, t0 + 0.0075, t0 + 0.0208, 1], [0, 0, -3.5, 0, 0], [L, E, E, L]),
  background: track([0, t0, t0 + 0.0083, 1], ["#AEAEAE", "#AEAEAE", "#131313", "#131313"], [E, E, L]),
});
const touch = (t: readonly [number, number, number]): Props => ({
  opacity: track([0, t[0], t[1], t[2], 1], [0, 0, 1, 0, 0], [E, E, E, L]),
  scale: track([0, t[0], t[2], 1], [0.7, 0.7, 1.35, 1.35], [L, E, L]),
});
/*
 * Loop seam (spec suggestion, approved): at 11.76 s Face ID crossfades back to the phone screen with
 * the screen-change pattern (0.24 s, E). Screen 01's own keyframes are reset to their first values at
 * 11.64 s, while it's invisible, so it comes back in its initial state.
 */
const SEAM = 0.98; // 11.76 s
const RESET = 0.97; // 11.64 s
function resetBeforeSeam(t: Track): Track {
  const n = t.times.length - 1;
  const ease = Array.isArray(t.ease) ? (t.ease as readonly Ease[]).slice(0, n - 1) : Array(n - 1).fill(t.ease);
  return {
    times: [...t.times.slice(0, n), RESET, RESET + 0.0001, 1],
    values: [...t.values.slice(0, n), t.values[n], t.values[0], t.values[0]],
    ease: [...ease, L, L, L],
  };
}
const resetProps = (p: Props): Props =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === "object" ? resetBeforeSeam(v as Track) : v])) as Props;

const breathe = (t: readonly number[], v: readonly number[]) => track([0, ...t, 1], [1, 1, ...v, 1], [L, IO, IO, IO, IO]);

const PHONE_DIGITS = [
  { s: "(9", x: 0, t: 0.0708 },
  { s: "8", x: 12.7, t: 0.0783 },
  { s: "2) ", x: 20.87, t: 0.0858 },
  { s: "3", x: 35.83, t: 0.0933 },
  { s: "8", x: 43.83, t: 0.1008 },
  { s: "7-", x: 52, t: 0.1083 },
  { s: "2", x: 65.12, t: 0.1158 },
  { s: "4-", x: 72.52, t: 0.1233 },
  { s: "2", x: 86.46, t: 0.1308 },
  { s: "4", x: 93.86, t: 0.1383 },
];
const SMS_DIGITS = [
  { s: "7", t: 0.2375 },
  { s: "2", t: 0.2492 },
  { s: "9", t: 0.2592 },
  { s: "9", t: 0.27 },
  { s: "4", t: 0.28 },
  { s: "0", t: 0.29 },
];
const PIN_X = [87.14, 127.24, 167.34, 207.44];
const CONFIRM_DOTS: { y: number[]; bg: number }[] = [
  { y: [0.525, 0.5325, 0.5458, 0.5983, 0.6092, 0.625, 0.6333, 0.6417], bg: 0.525 },
  { y: [0.5433, 0.5508, 0.5642, 0.6038, 0.6146, 0.6304, 0.6388, 0.6471], bg: 0.5433 },
  { y: [0.5608, 0.5683, 0.5817, 0.6092, 0.62, 0.6358, 0.6442, 0.6525], bg: 0.5608 },
  { y: [0.5792, 0.5867, 0.6, 0.6146, 0.6254, 0.6413, 0.6496, 0.6579], bg: 0.5792 },
];

const T = {
  s1: { opacity: track([0, 0.1875, 0.2075, SEAM, 1], [1, 1, 0, 0, 1], [E, E, L, E]) },
  s1Content: { x: track([0, 0.1875, 0.2075, SEAM - 0.0001, SEAM, 1], [0, 0, -12, -12, 16, 0], [E, E, L, L, E]) },
  s2: screenInOut([0.1875, 0.2075, 0.3458, 0.3658]),
  s2Content: contentInOut([0.1875, 0.2075, 0.3458, 0.3658]),
  s3: screenInOut([0.3458, 0.3658, 0.4875, 0.5075]),
  s3Content: contentInOut([0.3458, 0.3658, 0.4875, 0.5075]),
  s4: screenInOut([0.4875, 0.5075, 0.6792, 0.6992]),
  s4Content: contentInOut([0.4875, 0.5075, 0.6792, 0.6992]),
  s5: { opacity: track([0, 0.6792, 0.6992, SEAM, 1], [0, 0, 1, 1, 0], [E, E, L, E]) },
  s5Content: { y: track([0, 0.6792, 0.7025, 1], [12, 12, 0, 0], [L, E, L]), x: track([0, SEAM, 1], [0, 0, -12], [L, E]) },
  s5Image: { y: track([0, 0.6792, 0.7025, 1], [16, 16, 0, 0], [L, E, L]) },

  phoneField: resetProps(fieldFocus(0.0483, 0.06)),
  placeholder: resetProps({ opacity: track([0, 0.065, 0.0717, 1], [1, 1, 0, 0], [E, E, L]) }),
  cursor: {
    opacity: track([0, 0.0542, 0.1567, 0.1625, 1], [0, 1, 1, 0, 0], [E, E, E, L]),
    // HOLD: the cursor jumps after each typed chunk.
    x: resetBeforeSeam(track(
      [0, 0.0707, 0.0708, 0.0782, 0.0783, 0.0857, 0.0858, 0.0932, 0.0933, 0.1007, 0.1008, 0.1082, 0.1083, 0.1157, 0.1158, 0.1232, 0.1233, 0.1307, 0.1308, 0.1382, 0.1383, 1],
      [-102, -102, -89.297, -89.297, -81.127, -81.127, -66.169, -66.169, -58.166, -58.166, -49.996, -49.996, -36.884, -36.884, -29.482, -29.482, -15.537, -15.537, -8.136, -8.136, 0, 0],
      L,
    )),
  },
  signIn: {
    scale: track([0, 0.1625, 0.1717, 0.1833, 1], [1, 1, 0.975, 1, 1], [L, E, E, L]),
    background: track([0, 0.1625, 0.1725, 0.1833, 1], ["#22DF6B", "#22DF6B", "#6DE79C", "#22DF6B", "#22DF6B"], [E, E, E, L]),
  },
  keyboard: resetProps({ y: track([0, 0.05, 0.0767, 1], [237.5, 237.5, 0, 0], [L, E, L]) }),
  smsCell: fieldFocus(0.3033, 0.3167),
  confirmTitle: { opacity: track([0, 0.5933, 0.605, 1], [1, 1, 0, 0], [E, E, L]) },
  correct: {
    opacity: track([0, 0.5975, 0.6108, 1], [0, 0, 1, 1], [E, E, L]),
    y: track([0, 0.5975, 0.6142, 1], [5, 5, 0, 0], [L, E, L]),
  },

  blob: {
    scaleX: breathe([0.6792, 0.7792, 0.8792, 0.9458], [1.018, 1, 1.012]),
    scaleY: breathe([0.6792, 0.7792, 0.8792, 0.9458], [1.027, 1, 1.018]),
  },
  face: {
    // Figma rotates in radians (0.05236 = 3°, -0.122173 = -7°); the offset lives in the face's -8° frame.
    frame: -8,
    rotate: track([0, 0.6792, 0.7083, 0.7383, 0.7958, 0.84, 1], [0, 0, 3, -7, -7, 0, 0], [L, IO, IO, E, IO, E]),
    x: track([0, 0.6792, 0.7083, 0.7383, 0.7958, 0.84, 1], [0, 0, -2, 3, 3, 0, 0], [L, IO, IO, E, IO, E]),
    y: track([0, 0.6792, 0.7083, 0.7383, 0.7958, 0.84, 0.875, 0.9167, 1], [0, 0, 2, -11, -11, 0, -1, 0, 0], [L, IO, IO, E, IO, IO, IO, L]),
  },
  eye: {
    scaleX: track([0, 0.6792, 0.7417, 0.7958, 0.84, 0.875, 0.9, 1], [1, 1, 1.08, 1.08, 1.2, 1.2, 1, 1], [L, E, E, E, E, E, L]),
    scaleY: track([0, 0.6792, 0.71, 0.72, 0.7417, 0.7958, 0.84, 0.875, 0.885, 0.8983, 1], [1, 1, 0.15, 1, 1.2, 1.2, 0.72, 0.72, 0.12, 1, 1], [L, E, E, E, E, E, E, E, E, E]),
  },
  smile: {
    scaleX: track([0, 0.6792, 0.7383, 0.7958, 0.84, 0.875, 0.9292, 1], [1, 1, 0.92, 0.92, 1.16, 1.16, 1, 1], [L, E, E, E, E, E, L]),
    scaleY: track([0, 0.6792, 0.7383, 0.7958, 0.84, 0.875, 0.9292, 1], [1, 1, 0.82, 0.82, 1.2, 1.2, 1, 1], [L, E, E, E, E, E, L]),
  },
  faceButton: { scale: breathe([0.6792, 0.7917, 0.8917, 0.9542], [1.025, 1, 1.015]) },
  faceIcon: { scale: breathe([0.6792, 0.8017, 0.9017, 0.9625], [1.015, 1, 1.009]) },

  touchField: touch([0.0433, 0.05, 0.0667]),
  touchSignIn: touch([0.1625, 0.1692, 0.1858]),
} satisfies Record<string, Props>;

// --- shared bits of the app UI ---
const title = "text-[18.508px] font-medium leading-[21.593px] tracking-[-0.0925px]";
const body = "text-[13.11px] font-medium leading-[16.966px] tracking-[0.0655px]";
const btn = "flex h-[40.101px] w-[285.332px] items-center justify-center rounded-full px-[12.339px] text-[13.11px] font-medium leading-[18.508px] whitespace-nowrap";
const fieldBox = "flex h-[43.185px] items-center rounded-[12.339px] p-[9.254px]";
const content = "flex flex-col items-start gap-[24.677px] pt-[169.657px]";
const pad = "w-full px-[12.339px]";
const img = (src: string, w: number, h: number, style?: CSSProperties) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={asset(`motion/auth/${src}`)} loading="lazy" fetchPriority="low" alt="" width={w} height={h} draggable={false} className="block max-w-none" style={{ width: w, height: h, ...style }} />
);

type Bind = ReturnType<typeof useTracks>;

function Screen({ bind, k, props, children }: { bind: Bind; k: string; props: Props; children: ReactNode }) {
  return (
    <div ref={bind(k, props)} className="absolute inset-0 overflow-hidden" style={{ background: C.surface }}>
      {children}
    </div>
  );
}

function PinScreen({ bind, k, screen, inner, titleNode, dots }: { bind: Bind; k: string; screen: Props; inner: Props; titleNode: ReactNode; dots: Props[] }) {
  return (
    <Screen bind={bind} k={k} props={screen}>
      <div ref={bind(`${k}-content`, inner)} className={`relative ${content}`}>
        <div className={`relative ${pad} text-center ${title}`}>{titleNode}</div>
        <div className="h-[37.016px] w-[310px] shrink-0" />
        {dots.map((d, i) => (
          <div key={i} ref={bind(`${k}-dot-${i}`, d)} className="absolute top-[227.13px] size-[15.423px] rounded-full" style={{ left: PIN_X[i], background: "#AEAEAE" }} />
        ))}
      </div>
      <div className="absolute top-[412.169px] left-[6.169px]">{img("passcode-keyboard.svg", 297.67, 256.027)}</div>
    </Screen>
  );
}

// Face strokes from Figma (Face group, matrices relative to the Image frame).
const FACE_PARTS = {
  eyeL: { m: "0.990268 0.139173 -0.139173 0.990268 128.9433 82.3879", d: "M 3.5993 0 L 3.292 0.6794 L 2.9927 1.3993 L 2.7096 2.1434 L 2.4265 2.9199 L 2.1596 3.7207 L 1.9089 4.5538 L 1.6662 5.4192 L 1.4317 6.309 L 1.2133 7.2149 L 1.003 8.1531 L 0.8008 9.1157 L 0.6147 10.0944 L 0.4449 11.0892 L 0.2831 12.1084 L 0.1375 13.1437 L 0 14.1952" },
  eyeR: { m: "0.990268 0.139173 -0.139173 0.990268 183.3966 90.0408", d: "M 0 0 L 0.3074 0.6794 L 0.6066 1.3993 L 0.8897 2.1434 L 1.1728 2.9199 L 1.4397 3.7207 L 1.6905 4.5538 L 1.9331 5.4192 L 2.1677 6.309 L 2.3861 7.2149 L 2.5964 8.1531 L 2.7986 9.1157 L 2.9846 10.0944 L 3.1545 11.0892 L 3.3163 12.1084 L 3.4618 13.1437 L 3.5993 14.1952" },
  nose: { m: "0.990268 0.139173 -0.139173 0.990268 148.3122 80.7195", d: "M 10.3451 0 L 10.3451 26.2146 L 10.2157 28.0992 L 9.8436 29.7411 L 9.2046 31.1323 L 8.323 32.2647 L 7.1906 33.1464 L 5.8156 33.7692 L 4.1979 34.1331 L 2.3456 34.2464 L 0 34.214" },
  smile: { m: "0.990268 0.139173 -0.139173 0.990268 125.8223 122.5554", d: "M 0 0 L 1.5611 1.4721 L 3.1788 2.8633 L 4.8531 4.1574 L 6.5678 5.3545 L 8.3149 6.4465 L 10.0944 7.4413 L 11.8981 8.3311 L 13.718 9.1157 L 15.5621 9.8032 L 17.4144 10.3774 L 19.2828 10.8466 L 21.1512 11.2106 L 23.0358 11.4775 L 24.9123 11.6312 L 26.7969 11.6878 L 28.6815 11.6312 L 30.5581 11.4775 L 32.4427 11.2106 L 34.3111 10.8466 L 36.1795 10.3774 L 38.0318 9.8032 L 39.8759 9.1157 L 41.6958 8.3311 L 43.4995 7.4413 L 45.279 6.4465 L 47.0261 5.3545 L 48.7408 4.1574 L 50.4151 2.8633 L 52.0328 1.4721 L 53.5939 0" },
};
const STROKE = { stroke: "white", strokeWidth: 8.4828, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const PART_STYLE: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };

export function AuthMotionPreview({ timeline, label = "Sign-in flow", layout = "lab", facePressed }: { timeline?: Timeline; label?: string; layout?: "lab" | "navigation" | "flow"; facePressed?: boolean }) {
  const own = useTimeline(D, { autoplay: !timeline });
  const tl = timeline ?? own;
  const bind = useTracks(tl);
  const inNavigation = layout === "navigation";
  const inFlow = layout === "flow";
  const phoneScale = 321 / 310;
  const glowId = useId();

  return (
    <div
      ref={inFlow ? undefined : tl.observe}
      role="img"
      aria-label={label}
      className={inFlow ? "absolute inset-0" : inNavigation ? "case-auth-artboard" : "relative h-[500px] w-[424px] overflow-hidden rounded-visual bg-bg-subtle"}
      style={{ fontFamily: "var(--portfolio-font-family-rounded)", color: C.primary }}
    >
      <div
        className="absolute w-[310px] origin-top-left overflow-hidden"
        style={inFlow
          ? { inset: 0, height: 674, transform: "scale(0.877419)", background: C.surface }
          : inNavigation
          ? { left: 51, top: 52, height: 700 / phoneScale, borderRadius: 59 / phoneScale, boxShadow: "0 0 0 3.86px rgb(19 19 19 / 0.08)", transform: `scale(${phoneScale})`, background: C.surface }
          : { left: 57, top: 48, height: 674, borderRadius: 47.812, background: C.surface }}
      >
        {/* 01 · Phone */}
        <Screen bind={bind} k="s1" props={T.s1}>
          <div ref={bind("s1-content", T.s1Content)} className={content}>
            <p className={`${pad} ${title}`}>Sign in to your bank</p>
            <div className={pad}>
              <div ref={bind("phoneField", T.phoneField)} data-stroke="#cccccc" className={`relative w-full gap-[9.254px] ${fieldBox}`} style={{ background: C.field }}>
                <p className={`w-[18.508px] text-center ${body}`} style={{ color: C.disabled }}>
                  +7
                </p>
                <div className={`relative h-[18.508px] w-[103.542px] whitespace-pre ${body}`}>
                  {PHONE_DIGITS.map((d, i) => (
                    <span key={i} ref={bind(`phone-${i}`, resetProps(rise(d.t)))} className="absolute top-[0.75px] block" style={{ left: d.x }}>
                      {d.s}
                    </span>
                  ))}
                </div>
                <p ref={bind("placeholder", T.placeholder)} className={`absolute top-[12.51px] left-[36.44px] w-[106px] ${body}`} style={{ color: C.secondary }}>
                  (000) 000-00-00
                </p>
                <div ref={bind("cursor", T.cursor)} className="absolute top-[11.76px] left-[138.44px] h-[18.508px] w-[1.542px] rounded-full" style={{ background: C.primary }} />
              </div>
            </div>
            <div className={`flex flex-col gap-[6.169px] ${pad}`}>
              <div ref={bind("signIn", T.signIn)} className={btn} style={{ background: C.green }}>
                Sign in
              </div>
              <div className={`${btn} bg-white`}>Sign in with card number</div>
            </div>
          </div>
          <div ref={bind("keyboard", T.keyboard)} className="absolute top-[436px] left-0">
            {img("keyboard.webp", 310.009, 237.519)}
          </div>
        </Screen>

        {/* 02 · SMS */}
        <Screen bind={bind} k="s2" props={T.s2}>
          <div ref={bind("s2-content", T.s2Content)} className={content}>
            <p className={`${pad} ${title}`}>
              Enter the code sent to
              <br />
              +7 (982) 387-24-24
            </p>
            <div className={`flex gap-[6.169px] ${pad}`}>
              {SMS_DIGITS.map((d, i) => (
                <div key={i} ref={bind(`sms-cell-${i}`, T.smsCell)} data-stroke={C.green} className={`flex-1 justify-center ${fieldBox}`} style={{ background: C.field }}>
                  <span ref={bind(`sms-${i}`, rise(d.t))} className={`block ${body}`}>
                    {d.s}
                  </span>
                </div>
              ))}
            </div>
            <div className={`flex flex-col gap-[6.169px] ${pad}`}>
              <div className={btn} style={{ background: C.field, color: C.disabled }}>
                New code in 56 seconds
              </div>
              <div className={btn} style={{ background: C.surface }}>
                Use a different number
              </div>
            </div>
          </div>
          <div className="absolute top-[436px] left-0">{img("keyboard.webp", 310.009, 237.519)}</div>
        </Screen>

        {/* 03 · Create PIN */}
        <PinScreen bind={bind} k="s3" screen={T.s3} inner={T.s3Content} titleNode="Create a sign-in code" dots={[0.385, 0.4033, 0.4208, 0.4392].map(pinFill)} />

        {/* 04 · Confirm PIN */}
        <PinScreen
          bind={bind}
          k="s4"
          screen={T.s4}
          inner={T.s4Content}
          titleNode={
            <>
              <p ref={bind("confirmTitle", T.confirmTitle)}>Confirm your code</p>
              <p ref={bind("correct", T.correct)} className="absolute inset-x-[12.339px] top-0" style={{ color: C.positive }}>
                Correct!
              </p>
            </>
          }
          dots={CONFIRM_DOTS.map((d) => ({
            y: track([0, ...d.y, 1], [0, 0, -3.5, 0, 0, -7, 0, -1.2, 0, 0], [L, E, E, E, E, E, E, E, L]),
            background: track([0, d.bg, d.bg + 0.0083, 0.5933, 0.605, 1], ["#AEAEAE", "#AEAEAE", "#131313", "#131313", "#10B24F", "#10B24F"], [E, E, E, E, L]),
          }))}
        />

        {/* 05 · Face ID */}
        <Screen bind={bind} k="s5" props={T.s5}>
          <div ref={bind("s5-content", T.s5Content)} className="absolute top-[94px] w-full py-[24.677px]">
            <div className={`flex flex-col gap-[6.169px] text-center ${pad}`}>
              <p className={title}>Sign in with Face ID</p>
              <p className="text-[12.339px] leading-[15.423px]" style={{ color: C.secondary }}>
                No more typing your passcode
              </p>
            </div>
          </div>
          <div ref={bind("s5-image", T.s5Image)} className="absolute top-[187.606px] left-0 h-[309px] w-[310px]" style={{ background: C.surface }}>
            {/* Jelly body: Figma render with its glow, noise and inner shadows (299.21 × 268.37 from −33.93, −21.59). */}
            <div
              ref={bind("blob", T.blob)}
              className="absolute"
              style={{ left: 39.325 - 33.931, top: 29.499 - 21.593, transformOrigin: `${33.931 + 115.675}px ${21.593 + 100.252}px` }}
            >
              {img("jelly-blob.webp", 299.213, 268.366)}
            </div>
            <svg viewBox="0 0 310 309" width={310} height={309} className="absolute inset-0 overflow-visible" aria-hidden>
              <defs>
                <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3.085" result="b1" />
                  <feColorMatrix in="b1" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.8 0" result="g1" />
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6.94" result="b2" />
                  <feColorMatrix in="b2" type="matrix" values="0 0 0 0 0.55  0 0 0 0 1  0 0 0 0 0.65  0 0 0 0.8 0" result="g2" />
                  <feMerge>
                    <feMergeNode in="g2" />
                    <feMergeNode in="g1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g ref={bind("face", T.face)} style={PART_STYLE} filter={`url(#${glowId})`}>
                {(["eyeL", "eyeR", "nose", "smile"] as const).map((k) => (
                  <g key={k} transform={`matrix(${FACE_PARTS[k].m})`}>
                    <path
                      ref={k === "nose" ? undefined : bind(`face-${k}`, k === "smile" ? T.smile : T.eye)}
                      d={FACE_PARTS[k].d}
                      style={PART_STYLE}
                      {...STROKE}
                    />
                  </g>
                ))}
              </g>
            </svg>
            {/* Face ID button: liquid-glass circle (Figma Glass effect approximated with a backdrop blur). */}
            <div ref={bind("faceButton", T.faceButton)} className="absolute" style={{ left: 88.297 - 30.84, top: 208.885 - 30.84, width: 61.68, height: 61.68 }}>
              <div
                className="absolute inset-0 rounded-full backdrop-blur-[1.5px]"
                style={{
                  background: "rgb(255 255 255 / 0.12)",
                  boxShadow: "inset 0 1.157px 1.542px rgb(255 255 255 / 0.9), inset 0 0 10.796px rgb(255 255 255 / 0.35), 0 6.169px 15.423px rgb(13 89 38 / 0.12)",
                }}
              />
              <div ref={bind("faceIcon", T.faceIcon)} className="absolute" style={{ left: 64.944 - 57.457, top: 185.531 - 178.045 }}>
                {img("faceid-icon.svg", 46.708, 46.708)}
              </div>
            </div>
          </div>
          {inFlow && (
            <div className="absolute left-[12.339px] top-[551px] flex flex-col gap-[6.169px]">
              <div className={btn} style={{ background: facePressed ? "#6de79c" : C.green, transform: facePressed ? "scale(0.975)" : undefined, transition: "transform 140ms, background-color 140ms" }}>Turn on</div>
              <div className={`${btn} bg-white`}>Not now</div>
            </div>
          )}
        </Screen>

        {/* Status bar · static (header below it is empty in Figma: the logo layer has no content) */}
        <div className="pointer-events-none absolute top-0 left-0">{img("status-bar.svg", 310.009, 47.812)}</div>

        {/* Touch indicators in the phone coordinate space, so they scale with the controls. */}
        {(
          [
            ["touchField", 211, 226],
            ["touchSignIn", 143, 292],
          ] as const
        ).map(([k, x, y]) => (
          <div
            key={k}
            ref={bind(k, T[k])}
            className="pointer-events-none absolute size-[24px] rounded-full"
            style={{ left: x, top: y, background: "rgb(20 20 20 / 0.12)", boxShadow: "inset 0 0 0 1px rgb(20 20 20 / 0.2)" }}
          />
        ))}
      </div>
    </div>
  );
}
