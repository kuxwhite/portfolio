import type { Content } from "@/lib/content";
import { VisualTile, type VisualMedia } from "@/components/sections/VisualTile";

/*
 * Masonry from Figma "Gallery" (1373:61280): three 440px columns, tile heights in px.
 * Tiles keep these proportions as the columns resize; on phones the columns stack into one.
 * Add `media` to a tile to show an image or video.
 */
const COLUMNS: { h: number; media?: VisualMedia }[][] = [
  [{ h: 487 }, { h: 229 }, { h: 440 }, { h: 440 }],
  [{ h: 184 }, { h: 652 }, { h: 463 }, { h: 732 }],
  [{ h: 788 }, { h: 440 }, { h: 671 }],
];
const COLUMN_W = 440;

export function Visuals({ t }: { t: Content["visuals"] }) {
  return (
    <section aria-labelledby="visuals-title" className="flex flex-col items-center gap-(--portfolio-section-gap) px-(--page-padding-x) py-(--portfolio-section-gap)">
      <h2 id="visuals-title" className="type-overline text-center text-fg-secondary">
        {t.title} <span className="text-fg-subtle">{t.note}</span>
      </h2>
      <div className="flex w-full items-start gap-(--space-16) max-md:flex-col">
        {COLUMNS.map((col, c) => (
          <div key={c} className="flex w-full min-w-0 flex-1 flex-col gap-(--space-16)">
            {col.map((tile, i) => (
              <VisualTile key={i} ratio={[COLUMN_W, tile.h]} media={tile.media} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
