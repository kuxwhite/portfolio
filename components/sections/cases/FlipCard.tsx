"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { asset } from "@/lib/asset";

/*
 * Debit card from the Moud case (Figma "Карта · текущая", 1428:55451): front with the balance and
 * back with the card details. Built from live layers so it stays sharp at any size and pixel
 * density: the Figma vectors as SVG (surface with its noise filter, the "m", the rim, the edge
 * with its shadows, icons) and real text.
 *
 * - Hover (mouse/pen): the card leans toward the cursor and a soft glare follows it.
 * - Click / Enter / Space: flips to the details and back (always turning the same way).
 * - Reduced motion: no tilt or glare, the flip becomes a quick cross-fade.
 *
 * The card is a 322 × 210 canvas centred in the 432 × 300 preview and scaled with the strip.
 */
const W = 322;
const H = 210;
const RADIUS = 24;
const MAX_TILT = 8; // deg
const TILT_SPRING = { stiffness: 180, damping: 22, mass: 0.7 };
const FLIP = { type: "spring", stiffness: 95, damping: 16, mass: 1 } as const; // ≈0.8 s, a hint of overshoot

const ink = "var(--portfolio-palette-white)";
const textShadow = "0 2px 16px rgb(0 0 0 / 0.16)";
const rounded: CSSProperties = { fontFamily: "var(--portfolio-font-family-rounded)", color: ink };

const Svg = ({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={asset(`cases/card/${name}.svg`)} alt="" aria-hidden draggable={false} className={`block max-w-none ${className ?? ""}`} style={style} />
);

/** Edge with its drop shadows; Figma draws it 1px lower than the card and outset by the blur. */
const Edge = () => (
  <div className="absolute inset-x-0 top-px h-full">
    <Svg name="edge" className="absolute" style={{ inset: "-4.76% -6.83% -16.19% -6.83%", width: "auto", height: "auto" }} />
  </div>
);

function NumberChip({ open }: { open: boolean }) {
  return (
    <span
      className="relative flex items-center justify-end gap-(--space-4) rounded-full px-[6px] py-(--space-4) backdrop-blur-[3px]"
      style={{
        background: "rgb(255 255 255 / 0.12)",
        boxShadow: "inset 0 0.75px 1px rgb(255 255 255 / 0.14), 0 2px 4px rgb(11 27 43 / 0.14)",
      }}
    >
      <span className="text-[14px] font-medium leading-[20px] tracking-[0.14px] whitespace-nowrap" style={{ textShadow }}>
        •• 3688
      </span>
      <Svg name={open ? "eye-slash" : "eye"} className="size-[20px]" />
    </span>
  );
}

const BottomRow = ({ open }: { open: boolean }) => (
  <div className="absolute inset-x-[16px] bottom-[16px] flex items-end justify-between">
    <NumberChip open={open} />
    <Svg name="mir" className="h-[24px] w-[70px]" />
  </div>
);

function Detail({ label, value, labelWide }: { label: string; value: string; labelWide?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-(--space-8)">
      <p className={`text-[12px] leading-[16px] tracking-[0.12px] ${labelWide ? "w-full" : "whitespace-nowrap"}`}>{label}</p>
      <p className="flex items-center gap-(--space-8)">
        <span className="text-[18px] font-medium leading-[24px] tracking-[-0.36px] whitespace-nowrap">{value}</span>
        <Svg name="copy" className="size-[16px]" />
      </p>
    </div>
  );
}

/** Glare: a soft light spot under the cursor, clipped to the card. */
function Glare({ x, y, strength, mirror }: { x: MotionValue<number>; y: MotionValue<number>; strength: MotionValue<number>; mirror?: boolean }) {
  const gx = useTransform(x, (v) => `${(mirror ? 1 - v : v) * 100}%`);
  const gy = useTransform(y, (v) => `${v * 100}%`);
  const bg = useMotionTemplate`radial-gradient(farthest-corner circle at ${gx} ${gy}, rgb(255 255 255 / 0.32), rgb(255 255 255 / 0.08) 35%, transparent 70%)`;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 mix-blend-soft-light"
      style={{ borderRadius: RADIUS, backgroundImage: bg, opacity: strength }}
    />
  );
}

/*
 * Volume: the faces sit THICKNESS apart in 3D and a few edge slices fill the gap, so a thin green
 * edge shows when the card leans or turns (a real card is ~0.9% of its width thick → ~3px here).
 */
const THICKNESS = 3;
const SLICES = 5;
const EDGE = "linear-gradient(160deg, #3fcf78, #22a55a)"; // card edge, sampled from the Figma surface

function EdgeSlices() {
  return Array.from({ length: SLICES }, (_, i) => {
    const z = -THICKNESS / 2 + (THICKNESS * (i + 0.5)) / SLICES;
    return <div key={i} aria-hidden className="absolute inset-0" style={{ borderRadius: RADIUS, background: EDGE, transform: `translateZ(${z}px)` }} />;
  });
}

/** Hover iridescence: a soft mint–lemon–sky band drifting across the gradient with the cursor. */
function Sheen({ x, strength, mirror }: { x: MotionValue<number>; strength: MotionValue<number>; mirror?: boolean }) {
  const pos = useTransform(x, (v) => `${(mirror ? 1 - v : v) * 100}% 50%`);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 mix-blend-soft-light"
      style={{
        borderRadius: RADIUS,
        backgroundImage:
          "linear-gradient(115deg, transparent 20%, rgb(190 255 215 / 0.55) 38%, rgb(255 250 180 / 0.45) 50%, rgb(170 225 255 / 0.5) 62%, transparent 80%)",
        backgroundSize: "260% 100%",
        backgroundPosition: pos,
        opacity: strength,
      }}
    />
  );
}

function Face({ back, children }: { back?: boolean; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
      style={{ transform: `${back ? "rotateY(180deg) " : ""}translateZ(${THICKNESS / 2}px)`, ...rounded }}
    >
      <Edge />
      <Svg name="surface" className="absolute inset-0 size-full" />
      {children}
    </div>
  );
}

export function FlipCard({ label, flipLabel }: { label: string; flipLabel: string }) {
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  // Pointer over the card, 0…1 (0.5 = centre); "active" fades the effect in and out.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);
  const sx = useSpring(px, TILT_SPRING);
  const sy = useSpring(py, TILT_SPRING);
  const sa = useSpring(active, TILT_SPRING);
  const tiltY = useTransform(() => (sx.get() - 0.5) * 2 * MAX_TILT * sa.get());
  const tiltX = useTransform(() => -(sy.get() - 0.5) * 2 * MAX_TILT * sa.get());

  // Flip: the angle keeps growing by 180°, so the card always turns the same way.
  const angle = useMotionValue(0);
  const fade = useTransform(angle, (a) => (Math.round(a / 180) % 2 === 1 ? 1 : 0));
  // A small lift mid-turn (peaks at 90°) gives the flip some weight.
  const frontOpacity = useTransform(fade, (f) => 1 - f);
  const lift = useTransform(angle, (a) => 1 + 0.06 * Math.abs(Math.sin((a * Math.PI) / 180)));

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    if (reduce) {
      angle.set(next ? 180 : 0);
      return;
    }
    animate(angle, angle.get() + 180 - (angle.get() % 180), FLIP);
  };

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === "touch") return;
    const r = area.current!.getBoundingClientRect();
    px.set(Math.min(1.1, Math.max(-0.1, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1.1, Math.max(-0.1, (e.clientY - r.top) / r.height)));
    active.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    active.set(0);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        ref={area}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${label}. ${flipLabel}`}
        className="relative shrink-0 cursor-pointer rounded-[24px] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg-primary"
        style={{ width: W, height: H, scale: "var(--case-scale)" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={(e) => {
          if (e.defaultPrevented) return; // the click that ends a strip drag
          flip();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100, transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="absolute inset-0"
            style={reduce ? { transformStyle: "preserve-3d" } : { rotateY: angle, scale: lift, transformStyle: "preserve-3d" }}
          >
            {!reduce && <EdgeSlices />}
            {/* Front: balance */}
            <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={reduce ? { opacity: frontOpacity } : undefined}>
              <Face>
                <Sheen x={sx} strength={sa} />
                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: RADIUS }}>
                  <Svg name="m" className="absolute right-[-54.15px] bottom-[-0.17px] h-[164px] w-[310.649px]" />
                </div>
                <Svg name="rim" className="absolute inset-0 size-full" />
                <div className="absolute top-[16px] left-[16px] flex flex-col gap-(--space-8) font-medium" style={{ textShadow }}>
                  <p className="text-[14px] leading-[20px] tracking-[0.14px] opacity-70">Дебетовая</p>
                  <p className="whitespace-nowrap">
                    <span className="text-[32px] leading-[40px] tracking-[-0.48px]">132 400</span>
                    <span className="text-[24px] leading-[28px] tracking-[-0.12px] text-white/70">,41 ₽</span>
                  </p>
                </div>
                <BottomRow open={false} />
                <Glare x={sx} y={sy} strength={sa} />
              </Face>
            </motion.div>

            {/* Back: card details */}
            <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={reduce ? { opacity: fade } : undefined}>
              <Face back={!reduce}>
                <Sheen x={sx} strength={sa} mirror={!reduce} />
                <div className="absolute top-[16px] left-[16px] flex w-[282px] flex-col gap-[22px]">
                  <Detail label="Номер карты" value="2200 7012 4589 3688" labelWide />
                  <div className="flex items-center gap-(--space-24)">
                    <Detail label="Действует до" value="08/30" />
                    <Detail label="CVV" value="417" labelWide />
                  </div>
                </div>
                <Svg name="rim" className="absolute inset-0 size-full" />
                <BottomRow open />
                <Glare x={sx} y={sy} strength={sa} mirror={!reduce} />
              </Face>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
