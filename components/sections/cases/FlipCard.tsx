"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
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
 * The card is a 322 × 210 canvas scaled to the preview and centered in its tile.
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
  <img src={asset(`cases/card/${name}.svg`)} fetchPriority="low" alt="" aria-hidden draggable={false} className={`block max-w-none ${className ?? ""}`} style={style} />
);

/** Edge with its drop shadows; Figma draws it 1px lower than the card and outset by the blur. */
const Edge = () => (
  <div className="absolute inset-x-0 top-px h-full">
    <Svg name="edge" className="absolute" style={{ inset: "-4.76% -6.83% -16.19% -6.83%", width: "auto", height: "auto" }} />
  </div>
);

export function NumberChip({ open, compact, digits = "3688" }: { open?: boolean; compact?: boolean; digits?: string }) {
  return (
    <span
      className={compact
        ? "relative flex h-[26px] items-center gap-[5px] rounded-full border border-white/25 bg-[#164c3a]/25 px-[8px]"
        : "relative flex items-center justify-end gap-(--space-4) rounded-full px-[6px] py-(--space-4) backdrop-blur-[3px]"}
      style={compact ? undefined : {
        background: "rgb(255 255 255 / 0.12)",
        boxShadow: "inset 0 0.75px 1px rgb(255 255 255 / 0.14), 0 2px 4px rgb(11 27 43 / 0.14)",
      }}
    >
      <span className="text-[14px] font-medium leading-[20px] tracking-[0.14px] whitespace-nowrap tabular-nums" style={compact ? undefined : { textShadow }}>
        •• {digits}
      </span>
      <Svg name={open ? "eye-slash" : "eye"} className={compact ? "size-[16px] shrink-0" : "size-[20px]"} />
    </span>
  );
}

const BottomRow = ({ open, compact }: { open: boolean; compact?: boolean }) => (
  <div className="absolute inset-x-[16px] bottom-[16px] flex items-end justify-between">
    <NumberChip open={open} compact={compact} />
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
const SCENE_THICKNESS = 2;
const SLICES = 5;
const EDGE = "linear-gradient(160deg, #3fcf78, #22a55a)"; // card edge, sampled from the Figma surface

function EdgeSlices({ thickness, inset = 0 }: { thickness: number; inset?: number }) {
  return Array.from({ length: SLICES }, (_, i) => {
    const z = -thickness / 2 + (thickness * (i + 0.5)) / SLICES;
    return <div key={i} aria-hidden className="absolute" style={{ inset, borderRadius: RADIUS - inset, background: EDGE, transform: `translateZ(${z}px)` }} />;
  });
}

/** Hover iridescence: a soft mint–lemon–sky band drifting across the gradient with the cursor. */
function Sheen({ x, y, strength, mirror, scene }: { x: MotionValue<number>; y: MotionValue<number>; strength: MotionValue<number>; mirror?: boolean; scene?: boolean }) {
  const pos = useTransform(() => {
    const horizontal = (mirror ? 1 - x.get() : x.get()) * 100;
    const vertical = scene ? 15 + y.get() * 70 : 50;
    return horizontal + "% " + vertical + "%";
  });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 mix-blend-soft-light"
      style={{
        borderRadius: RADIUS,
        backgroundImage: scene
          ? "linear-gradient(118deg, transparent 12%, rgb(160 245 200 / 0.12) 27%, rgb(204 255 224 / 0.78) 43%, rgb(253 255 198 / 0.63) 50%, rgb(148 237 246 / 0.43) 63%, transparent 79%)"
          : "linear-gradient(115deg, transparent 20%, rgb(190 255 215 / 0.55) 38%, rgb(255 250 180 / 0.45) 50%, rgb(170 225 255 / 0.5) 62%, transparent 80%)",
        backgroundSize: scene ? "235% 175%" : "260% 100%",
        backgroundPosition: pos,
        opacity: strength,
      }}
    />
  );
}

function Face({ back, thickness, scene, children }: { back?: boolean; thickness: number; scene?: boolean; children: ReactNode }) {
  const content = (
    <>
      <Svg name="surface" className="absolute inset-0 size-full" />
      {children}
    </>
  );
  return (
    <div
      className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
      style={{ transform: `${back ? "rotateY(180deg) " : ""}translateZ(${thickness / 2}px)`, ...rounded }}
    >
      {scene ? (
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: RADIUS, boxShadow: "0 7px 17px rgb(17 72 49 / 0.15)" }}>
          {content}
        </div>
      ) : (
        <>
          <Edge />
          {content}
        </>
      )}
    </div>
  );
}

type CardMotion = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  strength: MotionValue<number>;
  angle: MotionValue<number>;
  maxTilt: number;
};

export function FlipCard({ label, flipLabel, previewScale, scene, frontArtwork }: { label: string; flipLabel: string; previewScale: number; scene?: CardMotion; frontArtwork?: ReactNode }) {
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  // Pointer over the card, 0…1 (0.5 = centre); "active" fades the effect in and out.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);
  const sx = useSpring(scene?.x ?? px, TILT_SPRING);
  const sy = useSpring(scene?.y ?? py, TILT_SPRING);
  const sa = useSpring(scene?.strength ?? active, TILT_SPRING);
  const maxTilt = scene?.maxTilt ?? MAX_TILT;
  const thickness = scene ? SCENE_THICKNESS : THICKNESS;
  const isScene = Boolean(scene);
  const tiltY = useTransform(() => (sx.get() - 0.5) * 2 * maxTilt * sa.get());
  const tiltX = useTransform(() => -(sy.get() - 0.5) * 2 * maxTilt * sa.get());

  // Flip: the angle keeps growing by 180°, so the card always turns the same way.
  const localAngle = useMotionValue(0);
  const manualTurn = useRef({ from: 0, to: 180 });
  const angle = scene?.angle ?? localAngle;
  useMotionValueEvent(angle, "change", (value) => {
    if (scene && !angle.isAnimating()) setFlipped(Math.round(value / 180) % 2 === 1);
  });
  const fade = useTransform(angle, (a) => (Math.round(a / 180) % 2 === 1 ? 1 : 0));
  // A small lift mid-turn (peaks at 90°) gives the flip some weight.
  const frontOpacity = useTransform(fade, (f) => 1 - f);
  // The embedded card is inside a rotated and clipped phone. Explicitly select its visible
  // face so WebKit cannot show a mirrored back face through the nested 3D layers.
  const frontVisible = useTransform(fade, (f) => f === 0 ? "visible" : "hidden");
  const backVisible = useTransform(fade, (f) => f === 1 ? "visible" : "hidden");
  const lift = useTransform(angle, (a) => 1 + 0.06 * Math.abs(Math.sin((a * Math.PI) / 180)));

  const flip = () => {
    if (scene && !reduce) {
      const previous = manualTurn.current;
      const from = angle.isAnimating() ? previous.to : Math.round(angle.get() / 180) * 180;
      const target = angle.isAnimating() ? previous.from : from + 180;
      manualTurn.current = { from, to: target };
      setFlipped(target % 360 === 180);
      animate(angle, target, FLIP);
      return;
    }
    const next = !flipped;
    setFlipped(next);
    if (reduce) {
      angle.set(next ? 180 : 0);
      return;
    }
    animate(angle, angle.get() + 180 - (angle.get() % 180), FLIP);
  };

  const onMove = (e: React.PointerEvent) => {
    if (scene || reduce || e.pointerType === "touch") return;
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
        className="relative shrink-0 cursor-pointer rounded-[24px] outline-none [-webkit-tap-highlight-color:transparent] motion-safe:transition-[scale] motion-safe:duration-100 motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg-primary"
        style={{ width: W, height: H, transform: `scale(var(--case-scale, 1)) scale(${previewScale})` }}
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
          data-card-tilt={scene ? "" : undefined}
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100, transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="absolute inset-0"
            style={reduce ? { transformStyle: "preserve-3d" } : { rotateY: angle, scale: lift, transformStyle: "preserve-3d" }}
          >
            {!reduce && <EdgeSlices thickness={thickness} inset={scene ? 0.5 : 0} />}
            {/* Front: balance */}
            <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={reduce ? { opacity: frontOpacity } : scene ? { visibility: frontVisible } : undefined}>
              <Face thickness={thickness} scene={isScene}>
                <Sheen x={sx} y={sy} scene={Boolean(scene)} strength={sa} />
                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: RADIUS }}>
                  <Svg name="m" className="absolute right-[-54.15px] bottom-[-0.17px] h-[164px] w-[310.649px]" />
                </div>
                {frontArtwork}
                <Svg name="rim" className="absolute inset-0 size-full" />
                <div className="absolute top-[16px] left-[16px] flex flex-col gap-(--space-8) font-medium" style={{ textShadow }}>
                  <p className="text-[14px] leading-[20px] tracking-[0.14px] opacity-70">Debit</p>
                  <p className="whitespace-nowrap">
                    <span className="text-[32px] leading-[40px] tracking-[-0.48px]">$15,400</span>
                    <span className="text-[24px] leading-[28px] tracking-[-0.12px] text-white/70">.50</span>
                  </p>
                </div>
                <BottomRow open={false} compact={isScene} />
                <Glare x={sx} y={sy} strength={sa} />
              </Face>
            </motion.div>

            {/* Back: card details */}
            <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={reduce ? { opacity: fade } : scene ? { visibility: backVisible } : undefined}>
              <Face thickness={thickness} scene={isScene} back={!reduce}>
                <Sheen x={sx} y={sy} scene={Boolean(scene)} strength={sa} mirror={!reduce} />
                <div className="absolute top-[16px] left-[16px] flex w-[282px] flex-col gap-[22px]">
                  <Detail label="Card number" value="2200 1234 5678 3688" labelWide />
                  <div className="flex items-center gap-(--space-24)">
                    <Detail label="Expires" value="12/30" />
                    <Detail label="CVV" value="123" labelWide />
                  </div>
                </div>
                <Svg name="rim" className="absolute inset-0 size-full" />
                <BottomRow open compact={isScene} />
                <Glare x={sx} y={sy} strength={sa} mirror={!reduce} />
              </Face>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
