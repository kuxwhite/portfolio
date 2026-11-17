import { useId } from "react";
import { FOOT_FRAMES, LYING, SIT_DX, VIEW_BOX, type DoodlePose } from "./heroDoodleFrames";
import { DoodleScene } from "./DoodleScene";
import { INK, PAPER, SCENE_WIDTH } from "./heroDoodleGeometry";

/*
 * Hand-drawn hero character, ported from scripts/source/hero-doodle.html: the same inline SVG, frames and
 * "boil" filter (feTurbulence + feDisplacementMap). Lying → sits at the laptop on hover (mouse),
 * on tap (touch) or Enter / Space (keyboard). prefers-reduced-motion: no flipbooks, no boil,
 * the pose swaps without the squash.
 * Scene: the lying pose is 124 px tall (≈295 px wide); narrower columns scale it down.
 *
 * Loading: the HTML carries only what the first paint shows (the lying pose and its first foot frame).
 * The hook loads the remaining frames after the initial page load or when the visitor interacts.
 */
const fill = (f: "ink" | "paper") => (f === "ink" ? INK : PAPER);
const [FIRST_FOOT] = FOOT_FRAMES;

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

// Server-rendered first paint; the frames never ship as JS. The hook adds the rest and flips frames in the DOM.
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
          <g data-f="foot">
            <rect x={FIRST_FOOT.mask[0]} y={FIRST_FOOT.mask[1]} width={FIRST_FOOT.mask[2]} height={FIRST_FOOT.mask[3]} fill={PAPER} />
            <path d={FIRST_FOOT.d} fill={INK} fillRule="evenodd" />
          </g>
        </g>
        {/* Filled by the hook from doodle-rest.json. */}
        <g data-pose="sit" transform={`translate(${SIT_DX} 0)`} style={{ display: "none" }} />
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
