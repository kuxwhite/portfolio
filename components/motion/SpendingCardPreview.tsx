"use client";

import { asset } from "@/lib/asset";
import { E, track, useTimeline, useTracks, type Ease, type Props, type Timeline } from "@/lib/motion/timeline";

/*
 * Spending card (Figma "Preview · Animated", 1435:32574; spec spending-card-motion.md).
 * Loop 7.6 s: chips scroll → press "Loans" → State B (Loans breakdown) with the arcs sweeping in →
 * press "back" → State A, arcs sweep in again. All keyframes are copied from get_motion_context.
 *
 * The arcs keep Figma's own vectors (rounded-corner ring segments) and are revealed by masks:
 * a 30px stroke along each segment's mask path from Figma, its visible length animated 0 → 1.
 * Layout is the 404 × 404 Figma canvas (app UI metrics), scaled with the case strip.
 */
const D = 7.6;
const S = 323.98; // donut box
const BOX_X = 14.01;
const L = "linear" as const;
const SS: Ease = [0.65, 0, 0.35, 1]; // chips row scroll

// Colours inside the app mockup (app palette; same values as Portfolio palette where one exists).
const C = {
  primary: "var(--portfolio-palette-neutral-950)",
  secondary: "var(--portfolio-palette-neutral-600)",
  placeholder: "var(--portfolio-palette-neutral-400)",
  positive: "#10b24f",
  elevated: "var(--portfolio-palette-neutral-50)",
  neutral: "var(--portfolio-palette-neutral-100)",
};

type Arc = {
  key: string;
  bg: string; // light band svg
  line: string; // thin line svg
  inset: [string, string]; // Figma insets (t r b l, %) of band and line in the donut box
  mask: { x: number; y: number; d: string }; // Figma mask vector (stroke 30)
  dash: Props["dash"];
};

const box = (inset: string) => {
  const [t, r, b, l] = inset.split(" ").map((v) => parseFloat(v) / 100 || 0);
  return { x: BOX_X + l * S, y: t * S, width: S * (1 - l - r), height: S * (1 - t - b) };
};

// State A arcs: hidden at 3.49 s, swept back in from 5.68 s (one continuous fill).
const sweepA = (a: number, b: number) => track([0, 0.459, 0.461, a, b, 1], [1, 1, 0, 0, 1, 1], L);
const ARCS_A: Arc[] = [
  { key: "loans", bg: "cases/history/arc-loans-bg.svg", line: "cases/history/arc-loans.svg", inset: ["0 50.12% 50% 0", "0 50.13% 50% 0"], mask: { x: 26.1592, y: 12.1498, d: "M 0 149.84 C 0 67.238 66.847 0.216 149.449 0" }, dash: sweepA(0.748, 0.777) },
  { key: "utilities", bg: "cases/history/arc-utilities-bg.svg", line: "cases/history/arc-utilities.svg", inset: ["0 20.52% 84.57% 51.04%", "0 20.07% 89.31% 51.17%"], mask: { x: 179.5303, y: 12.1908, d: "M 0 0 C 31.367 0.739 61.71 11.306 86.751 30.21" }, dash: sweepA(0.778, 0.786) },
  { key: "food", bg: "cases/history/arc-food-bg.svg", line: "cases/history/arc-food.svg", inset: ["11.56% 6.75% 71.02% 77.14%", "11.1% 6.34% 73.75% 80.74%"], mask: { x: 269.3804, y: 44.8048, d: "M 0 0 C 15.527 12.372 28.44 27.707 37.989 45.113" }, dash: sweepA(0.786, 0.795) },
  { key: "marketplaces", bg: "cases/history/arc-marketplaces-bg.svg", line: "cases/history/arc-marketplaces.svg", inset: ["27.67% 2.02% 61.18% 88.34%", "27.28% 1.76% 62.59% 93.73%"], mask: { x: 309.2111, y: 93.3818, d: "M 0 0 C 4.994 9.697 8.915 19.91 11.692 30.458" }, dash: sweepA(0.796, 0.804) },
  { key: "other", bg: "cases/history/arc-other-bg.svg", line: "cases/history/arc-other.svg", inset: ["38.87% 0 50% 91.68%", "38.64% 0 50% 97.8%"], mask: { x: 321.8519, y: 127.6465, d: "M 0 0 C 2.65 11.256 3.989 22.781 3.989 34.344" }, dash: sweepA(0.805, 0.832) },
];
const ARCS_B: Arc[] = [
  { key: "sber", bg: "motion/spending/sber-bg.svg", line: "motion/spending/sber.svg", inset: ["0 37.05% 50% 0", "0 36.8% 50% 0"], mask: { x: 26.1592, y: 12.1523, d: "M 0 149.842 C 0 103.051 21.858 58.946 59.091 30.608 C 96.324 2.27 144.658 -7.049 189.758 5.416" }, dash: track([0, 0.436, 0.461, 1], [0, 0, 1, 1], L) },
  { key: "ym", bg: "motion/spending/ym-bg.svg", line: "motion/spending/ym.svg", inset: ["2.59% 0 50% 62.79%", "2.3% 0 50% 64.41%"], mask: { x: 219.6841, y: 18.6583, d: "M 0 0 C 63.065 19.221 106.157 77.404 106.157 143.332" }, dash: track([0, 0.461, 0.509, 1], [0, 0, 1, 1], L) },
];

// Shared shapes of the snippets.
const layer = (times: number[], op: number[], x: number[]): Props => ({
  opacity: track(times, op, [E, E, E, E, L]),
  x: track(times, x, [E, E, E, E, L]),
});
/** A-side element: hides at 3.5 s, rises back (opacity t0→t1, y t0→t2). */
const riseA = (t0: number, t1: number, t2: number): Props => ({
  opacity: track([0, 0.4604, 0.4605, t0, t1, 1], [1, 1, 0, 0, 1, 1], [E, L, E, E, L]),
  y: track([0, 0.4604, 0.4605, t0, t2, 1], [0, 0, 7, 7, 0, 0], [E, L, E, E, L]),
});
/** B-side element: rises once in the loop. */
const riseB = (t0: number, t1: number, t2: number): Props => ({
  opacity: track([0, t0, t1, 1], [0, 0, 1, 1], [L, E, L]),
  y: track([0, t0, t2, 1], [7, 7, 0, 0], [L, E, L]),
});

const T = {
  stateA: layer([0, 0.4276, 0.4592, 0.7434, 0.775, 1], [1, 1, 0, 0, 1, 1], [0, 0, -12, -16, 0, 0]),
  stateB: layer([0, 0.4276, 0.4592, 0.7434, 0.775, 1], [0, 0, 1, 1, 0, 0], [16, 16, 0, 0, 12, 12]),
  labelA: riseA(0.7566, 0.775, 0.7803),
  amountA: riseA(0.7671, 0.7855, 0.7908),
  incomeA: riseA(0.7776, 0.7961, 0.8013),
  chipsA: { x: track([0, 0.0789, 0.1974, 0.2763, 0.3684, 1], [0, 0, -136, -136, 0, 0], [SS, SS, SS, SS, L]) },
  chipLoans: {
    ...riseA(0.7618, 0.7803, 0.7855),
    scale: track([0, 0.3947, 0.4092, 0.4276, 1], [1, 1, 0.975, 1, 1], [L, E, E, L]),
    background: track([0, 0.3947, 0.4105, 0.4276, 1], ["#F7F7F7", "#F7F7F7", "#E8E8E8", "#F7F7F7", "#F7F7F7"], [E, E, E, L]),
  },
  chipsRestA: [riseA(0.7684, 0.7868, 0.7921), riseA(0.775, 0.7934, 0.7987), riseA(0.7816, 0.8, 0.8053)],
  labelB: riseB(0.4368, 0.4553, 0.4605),
  amountB: riseB(0.4474, 0.4658, 0.4711),
  back: {
    ...riseB(0.4421, 0.4605, 0.4658),
    scale: track([0, 0.7105, 0.725, 0.7434, 1], [1, 1, 0.95, 1, 1], [L, E, E, L]),
    background: track([0, 0.7105, 0.7263, 0.7434, 1], ["#131313", "#131313", "#4B4B4B", "#131313", "#131313"], [E, E, E, L]),
  },
  chipsB: [riseB(0.45, 0.4684, 0.4737), riseB(0.4579, 0.4763, 0.4816)],
} satisfies Record<string, Props | Props[]>;

const text = "whitespace-nowrap";
const chipText = "text-[12.259px] leading-[17.512px] tracking-[0.1226px]";
const chip = "flex h-[32px] shrink-0 items-center justify-center gap-[7.005px] overflow-hidden rounded-[16px] px-[9px]";

const CHIPS_A = [
  { key: "loans", name: "Loans", amount: "$450", bg: C.elevated },
  { key: "utilities", name: "Utilities", amount: "$185", bg: C.elevated },
  { key: "food", name: "Food", amount: "$120", bg: C.elevated },
  { key: "other", name: "Other", amount: "$40", bg: C.neutral },
];

function Arcs({ arcs, uid, bind, group }: { arcs: Arc[]; uid: string; bind: ReturnType<typeof useTracks>; group: string }) {
  return (
    <svg viewBox="0 0 352 163" width={352} height={163} className="absolute inset-0 block overflow-hidden" aria-hidden>
      <defs>
        {arcs.map((a) => (
          <mask key={a.key} id={`${uid}-${a.key}`} maskUnits="userSpaceOnUse" x="0" y="0" width="352" height="163">
            <path
              ref={bind(`${group}-mask-${a.key}`, { dash: a.dash })}
              d={a.mask.d}
              transform={`translate(${a.mask.x} ${a.mask.y})`}
              pathLength={1}
              stroke="white"
              strokeWidth={30}
              fill="none"
            />
          </mask>
        ))}
      </defs>
      {arcs.map((a) => (
        <g key={a.key} mask={`url(#${uid}-${a.key})`}>
          <image href={asset(a.bg)} preserveAspectRatio="none" {...box(a.inset[0])} />
          <image href={asset(a.line)} preserveAspectRatio="none" {...box(a.inset[1])} />
        </g>
      ))}
    </svg>
  );
}

export function SpendingCardPreview({ timeline, label = "Spending overview" }: { timeline?: Timeline; label?: string }) {
  const own = useTimeline(D, { autoplay: !timeline });
  const tl = timeline ?? own;
  const bind = useTracks(tl);
  const uid = "spend";

  return (
    <div
      ref={tl.observe}
      role="img"
      aria-label={label}
      className="relative size-[404px] overflow-hidden border border-bg-subtle bg-bg-page"
      // Site radius after the strip scale (the preview is scaled by --case-scale).
      style={{ borderRadius: "calc(var(--radius-visual) / var(--case-scale, 1))", fontFamily: "var(--portfolio-font-family-rounded)", color: C.primary }}
    >
      {/* State A · Overview */}
      <div className="absolute top-[calc(50%+0.2px)] left-1/2 w-[352px] -translate-1/2">
        <div ref={bind("A", T.stateA)} className="flex flex-col items-center gap-[14.01px]">
          <div className="relative h-[163px] w-full shrink-0 overflow-hidden">
            <Arcs arcs={ARCS_A} uid={`${uid}-a`} bind={bind} group="a" />
            <div className="absolute top-[61.29px] left-[calc(50%-0.44px)] flex -translate-x-1/2 flex-col items-center gap-[7.005px] overflow-hidden">
              <p ref={bind("labelA", T.labelA)} className={`text-[14.01px] leading-[17.512px] ${text}`} style={{ color: C.placeholder }}>
                October spending
              </p>
              <p ref={bind("amountA", T.amountA)} className={`pl-[3.502px] text-[28.02px] font-medium leading-[35.025px] tracking-[-0.4203px] ${text}`}>
                $840
              </p>
              <p ref={bind("incomeA", T.incomeA)} className={`flex gap-[3.502px] text-[14.886px] leading-[19.264px] tracking-[0.0744px] ${text}`}>
                <span style={{ color: C.secondary }}>Income</span>
                <span style={{ color: C.positive }}>+ $630</span>
              </p>
            </div>
          </div>
          <div ref={bind("chipsA", T.chipsA)} className="flex w-[352px] shrink-0 items-center gap-[7.005px] px-[14.01px]">
            {CHIPS_A.map((c, i) => (
              <div key={c.key} ref={bind(`chipA-${c.key}`, i === 0 ? T.chipLoans : T.chipsRestA[i - 1])} className={chip} style={{ background: c.bg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(`cases/history/icon-${c.key}.svg`)} fetchPriority="low" alt="" width={17.512} height={17.512} className="block size-[17.512px]" />
                <span className={`${chipText} ${text}`}>{c.name}</span>
                <span className={`${chipText} ${text} font-medium`}>{c.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* State B · Loans */}
      <div className="absolute top-[97px] left-1/2 w-[352px] -translate-x-1/2 overflow-hidden">
        <div ref={bind("B", T.stateB)} className="flex flex-col items-start gap-[14.01px]">
          <div className="relative h-[163px] w-full shrink-0">
            <Arcs arcs={ARCS_B} uid={`${uid}-b`} bind={bind} group="b" />
            <div className="absolute top-[calc(50%+10.56px)] left-1/2 flex -translate-1/2 flex-col items-center gap-[7.005px] overflow-hidden">
              <p ref={bind("labelB", T.labelB)} className={`text-[14.01px] leading-[17.512px] ${text}`} style={{ color: C.placeholder }}>
                Loans
              </p>
              <p ref={bind("amountB", T.amountB)} className={`text-[28.02px] font-medium leading-[35.025px] tracking-[-0.4203px] ${text}`}>
                $450
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 items-start gap-[7.005px] px-[14.01px]">
            <div ref={bind("back", T.back)} className="flex size-[32px] shrink-0 items-center justify-center overflow-hidden rounded-[16px]" style={{ background: "#131313" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("motion/spending/arrow-left.svg")} fetchPriority="low" alt="" width={14.01} height={14.01} className="block size-[14.01px]" />
            </div>
            {[
              { key: "sber", name: "Sber", amount: "$265" },
              { key: "ym", name: "Yandex Market", amount: "$185" },
            ].map((c, i) => (
              <div key={c.key} ref={bind(`chipB-${c.key}`, T.chipsB[i])} className={chip} style={{ background: C.neutral }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(`motion/spending/dot-${c.key}.svg`)} fetchPriority="low" alt="" width={8.756} height={8.756} className="block size-[8.756px]" />
                <span className={`${chipText} ${text}`}>{c.name}</span>
                <span className={`${chipText} ${text} font-medium`}>{c.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
