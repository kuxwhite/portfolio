import { asset } from "@/lib/asset";
import type { CaseScreen } from "@/lib/content";

/**
 * A static case preview laid out exactly as its Figma "Preview" frame: a fixed artboard (card size)
 * with the screen frame absolutely positioned at its Figma x/y/size/radius. The screen may be larger
 * than the card and run past its right/bottom edges; the card wrapper (Cases.tsx) clips it.
 * The whole artboard is scaled as one piece with the strip (--case-scale), so proportions never change.
 *
 * `image` is the Figma export of the screen frame cropped to the part the card shows
 * (min(w, cardW − x) × min(h, cardH − y)), so it sits at the screen's top-left corner.
 */
export function ArtboardPreview({ w, h, image, alt, screen }: { w: number; h: number; image: string; alt: string; screen: CaseScreen }) {
  const shownW = Math.min(screen.w, w - screen.x);
  const shownH = Math.min(screen.h, h - screen.y);
  return (
    <div className="absolute top-0 left-0 origin-top-left" style={{ width: w, height: h, scale: "var(--case-scale)" }}>
      <div
        className="absolute overflow-hidden"
        style={{ left: screen.x, top: screen.y, width: screen.w, height: screen.h, borderRadius: screen.r, background: screen.fill }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(image)}
          alt={alt}
          width={shownW}
          height={shownH}
          fetchPriority="low"
          draggable={false}
          className="absolute top-0 left-0 block max-w-none"
          style={{ width: shownW, height: shownH }}
        />
      </div>
    </div>
  );
}
