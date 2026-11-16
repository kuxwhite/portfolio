import { asset } from "@/lib/asset";

/*
 * "История" preview (Figma 1366:57777): the app's spending overview, a half-donut by category and
 * category chips. Built from live layers (not a screenshot) so it can become interactive later.
 * It's a piece of the app's UI, so the numbers inside are the app's own (scaled) metrics, laid out
 * on a 404 × 404 canvas and scaled with the strip (--case-scale). Text is the app's English UI.
 */
type Category = {
  key: string;
  name: string;
  amount: string;
  chip: "elevated" | "neutral";
  // Arc layers inside the 323.98 donut box, as Figma insets: top right bottom left (%).
  bg: string;
  line: string;
};

const CATEGORIES: Category[] = [
  { key: "loans", name: "Loans", amount: "$450", chip: "elevated", bg: "0 50.12% 50% 0", line: "0 50.13% 50% 0" },
  { key: "utilities", name: "Utilities", amount: "$185", chip: "elevated", bg: "0 20.52% 84.57% 51.04%", line: "0 20.07% 89.31% 51.17%" },
  { key: "food", name: "Food & groceries", amount: "$120", chip: "elevated", bg: "11.56% 6.75% 71.02% 77.14%", line: "11.1% 6.34% 73.75% 80.74%" },
  { key: "marketplaces", name: "Marketplaces", amount: "$45", chip: "neutral", bg: "27.67% 2.02% 61.18% 88.34%", line: "27.28% 1.76% 62.59% 93.73%" },
  { key: "other", name: "Other", amount: "$40", chip: "neutral", bg: "38.87% 0 50% 91.68%", line: "38.64% 0 50% 97.8%" },
];

// App palette mapped to the Portfolio palette (same values); "positive" green has no Portfolio token.
const C = {
  primary: "var(--portfolio-palette-neutral-950)",
  secondary: "var(--portfolio-palette-neutral-600)",
  placeholder: "var(--portfolio-palette-neutral-400)",
  positive: "#10b24f",
  elevated: "var(--portfolio-palette-neutral-50)",
  neutral: "var(--portfolio-palette-neutral-100)",
};
const ROUNDED = "var(--portfolio-font-family-rounded)";

const Arc = ({ inset, src }: { inset: string; src: string }) => (
  <div className="absolute" style={{ inset }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={asset(src)} alt="" aria-hidden draggable={false} className="block size-full max-w-none" />
  </div>
);

export function HistoryPreview({ label }: { label: string }) {
  return (
    <div role="img" aria-label={label} className="absolute inset-0 overflow-hidden rounded-visual border border-bg-subtle">
      <div
        className="absolute top-1/2 left-1/2 size-[404px] origin-center -translate-1/2"
        style={{ scale: "var(--case-scale)", fontFamily: ROUNDED }}
      >
        <div className="absolute top-[calc(50%+0.2px)] left-1/2 flex w-[352px] -translate-1/2 flex-col items-center gap-[14.01px]">
          <div className="relative h-[162.866px] w-full shrink-0 overflow-hidden">
            <div className="absolute top-0 left-[14.01px] size-[323.98px]">
              {CATEGORIES.map((c) => (
                <div key={c.key} className="contents">
                  <Arc inset={c.bg} src={`cases/history/arc-${c.key}-bg.svg`} />
                  <Arc inset={c.line} src={`cases/history/arc-${c.key}.svg`} />
                </div>
              ))}
            </div>
            <div className="absolute top-[61.29px] left-[calc(50%-0.44px)] flex -translate-x-1/2 flex-col items-center gap-[7.005px] whitespace-nowrap">
              <p className="text-[14.01px] leading-[17.512px]" style={{ color: C.placeholder }}>
                October spending
              </p>
              <p className="pl-[3.502px] text-[28.02px] font-medium leading-[35.025px] tracking-[-0.4203px]" style={{ color: C.primary }}>
                $840
              </p>
              <p className="flex gap-[3.502px] text-[14.886px] leading-[19.264px] tracking-[0.0744px]">
                <span style={{ color: C.secondary }}>Income</span>
                <span style={{ color: C.positive }}>+ $630</span>
              </p>
            </div>
          </div>

          <div className="flex w-[352px] shrink-0 items-center gap-[7.005px] px-[14.01px]">
            {CATEGORIES.map((c) => (
              <div
                key={c.key}
                className="flex h-[31.522px] shrink-0 items-center justify-center gap-[7.005px] rounded-[38.527px] px-[8.756px] text-[12.259px] leading-[17.512px] tracking-[0.1226px] whitespace-nowrap"
                style={{ background: C[c.chip], color: C.primary }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(`cases/history/icon-${c.key}.svg`)} alt="" aria-hidden width={17.5124} height={17.5124} className="block size-[17.512px]" />
                <span>{c.name}</span>
                <span className="font-medium">{c.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
