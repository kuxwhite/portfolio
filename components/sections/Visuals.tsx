import type { Content } from "@/lib/content";
import { Reveal } from "@/components/sections/Reveal";
import { VisualTile, type VisualMedia } from "@/components/sections/VisualTile";

/*
 * Masonry from Figma: desktop "Gallery" 1373:61280 (three 440px columns) and
 * mobile "Gallery" 1408:31103 (two 167px columns). Tiles are defined once (ratio from the
 * desktop size, which the mobile tiles keep) and both layouts reference them by index,
 * so `media` added here shows up in both.
 */
const TILES: { w: number; h: number; media?: VisualMedia }[] = [
  { w: 440, h: 487 }, // 0
  { w: 440, h: 229 }, // 1
  { w: 440, h: 440 }, // 2
  { w: 440, h: 440 }, // 3
  { w: 440, h: 184 }, // 4
  { w: 440, h: 652 }, // 5
  { w: 440, h: 463 }, // 6
  { w: 440, h: 732 }, // 7
  { w: 440, h: 788 }, // 8
  { w: 440, h: 440 }, // 9
  { w: 440, h: 671 }, // 10
];
const DESKTOP = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10],
];
const MOBILE = [
  [0, 1, 2, 3, 8, 10],
  [4, 5, 6, 7, 9],
];

function Columns({ layout, className }: { layout: number[][]; className: string }) {
  return (
    <div className={`w-full items-start gap-(--space-16) ${className}`}>
      {layout.map((col, c) => (
        <div key={c} className="flex min-w-0 flex-1 flex-col gap-(--space-16)">
          {col.map((i) => (
            <Reveal key={i} column={c}>
              <VisualTile ratio={[TILES[i].w, TILES[i].h]} media={TILES[i].media} />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Visuals({ t }: { t: Content["visuals"] }) {
  return (
    <section aria-labelledby="visuals-title" className="flex flex-col items-center gap-(--portfolio-section-gap) px-(--page-padding-x) py-(--portfolio-section-gap)">
      <h2 id="visuals-title" className="type-overline text-center text-fg-secondary">
        {t.title} <span className="text-fg-subtle">{t.note}</span>
      </h2>
      <Columns layout={DESKTOP} className="flex max-md:hidden" />
      <Columns layout={MOBILE} className="hidden max-md:flex" />
    </section>
  );
}
