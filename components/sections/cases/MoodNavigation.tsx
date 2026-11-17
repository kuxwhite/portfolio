import { asset } from "@/lib/asset";
import { AuthMotionPreview } from "@/components/motion/AuthMotionPreview";
import { CaseStrip } from "./CaseStrip";
import { FlipCard } from "./FlipCard";
import type { Content } from "@/lib/content";

const artwork = {
  overview: { file: "card-overview", width: 232, height: 210 },
  map: { file: "atm-directions", width: 176, height: 210 },
  settings: { file: "card-settings", width: 424, height: 483 },
};

function PreviewImage({ name, alt }: { name: keyof typeof artwork; alt: string }) {
  const { file, width, height } = artwork[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(`cases/${file}.webp`)} width={width} height={height} alt={alt}
      fetchPriority="low" draggable={false} className="block h-auto w-full" />
  );
}

export function MoodNavigation({ t }: { t: Content["cases"] }) {
  return (
    <CaseStrip label={t.stripLabel}>
      <div className="case-auth">
        <AuthMotionPreview label={t.previews.auth} layout="navigation" />
      </div>
      <div className="case-middle">
        <div className="case-debit">
          <FlipCard label={t.previews.debit} flipLabel={t.cardFlip} previewScale={251 / 322} />
        </div>
        <PreviewImage name="overview" alt={t.previews.overview} />
        <PreviewImage name="map" alt={t.previews.map} />
      </div>
      <div className="case-settings">
        <PreviewImage name="settings" alt={t.previews.settings} />
      </div>
    </CaseStrip>
  );
}
