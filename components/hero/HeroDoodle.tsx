import { useId } from "react";
import {
  BLINK_FRAMES,
  FOOT_FRAMES,
  HEAD_FRAMES,
  LYING,
  SITTING,
  SIT_DX,
  TYPE_FRAMES,
  VIEW_BOX,
  type DoodleFrame,
  type DoodlePose,
} from "./heroDoodleFrames";
import { DoodleScene } from "./DoodleScene";

/*
 * Hand-drawn hero character, ported from public/hero-doodle.html: the same inline SVG, frames and
 * "boil" filter (feTurbulence + feDisplacementMap). Lying → sits at the laptop on hover (mouse),
 * on tap (touch) or Enter / Space (keyboard). prefers-reduced-motion: no flipbooks, no boil,
 * the pose swaps without the squash.
 * Scene: 306 px wide, the column width on narrow screens (but no more than 306).
 */
const SCENE_WIDTH = 306; // px, from hero-doodle.html (.scene max-width)
const INK = "#1F64F2"; // line colour of the drawing (hero-doodle.html --ink); no Portfolio token yet
const PAPER = "var(--portfolio-bg-page)";
const fill = (f: "ink" | "paper") => (f === "ink" ? INK : PAPER);

function Frames({ kind, frames, hidden = false }: { kind: string; frames: DoodleFrame[]; hidden?: boolean }) {
  return frames.map(({ mask: [x, y, width, height], d }, i) => (
    <g key={i} data-f={kind} style={hidden || i > 0 ? { display: "none" } : undefined}>
      <rect x={x} y={y} width={width} height={height} fill={PAPER} />
      <path d={d} fill={INK} fillRule="evenodd" />
    </g>
  ));
}

function Pose({ pose }: { pose: DoodlePose }) {
  return (
    <>
      <path d={pose.ground} stroke={INK} strokeWidth={6.6} strokeLinecap="round" fill="none" />
      {pose.static.map((p, i) => (
        <path key={i} d={p.d} fill={fill(p.fill)} fillRule="evenodd" />
      ))}
    </>
  );
}

// Server-rendered: the frames stay in the HTML and never ship as JS; the client hook flips them in the DOM.
function Art({ uid }: { uid: string }) {
  return (
    <svg viewBox={VIEW_BOX} aria-hidden className="block h-auto w-full overflow-visible">
      <defs>
        <filter id={`${uid}-boil`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={1} seed="1" />
          <feDisplacementMap in="SourceGraphic" scale="1.4" />
        </filter>
      </defs>
      <g data-art filter={`url(#${uid}-boil)`}>
        <g data-pose="lie">
          <Pose pose={LYING} />
          <Frames kind="foot" frames={FOOT_FRAMES} />
        </g>
        <g data-pose="sit" transform={`translate(${SIT_DX} 0)`} style={{ display: "none" }}>
          <Pose pose={SITTING} />
          <Frames kind="head" frames={HEAD_FRAMES} />
          <Frames kind="blink" frames={BLINK_FRAMES} hidden />
          <Frames kind="type" frames={TYPE_FRAMES} />
        </g>
      </g>
    </svg>
  );
}

export function HeroDoodle({ label }: { label: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <DoodleScene label={label} width={SCENE_WIDTH}>
      <Art uid={uid} />
    </DoodleScene>
  );
}
