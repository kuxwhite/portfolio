import { Button } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { links } from "@/lib/site";
import type { CaseCard, Content } from "@/lib/content";
import { TiltCard } from "@/components/sections/cases/TiltCard";
import { HistoryPreview } from "@/components/sections/cases/HistoryPreview";
import { CaseStrip } from "@/components/sections/cases/CaseStrip";

const FILL: Record<CaseCard["fill"], string> = {
  subtle: "bg-bg-subtle",
  page: "bg-bg-page",
  section: "bg-bg-section",
  none: "",
};

/*
 * "Moud" brand mark from the case title (Figma component "Brand Mark" 1373:61397, Hover=Off/On):
 * muted name and a tilted grey icon; on hover the name turns accent and the icon straightens up in colour.
 * Figma greys the icon with the Luminosity blend; here it's grayscale(), which looks the same on the
 * white page and can be animated.
 */
function BrandMark({ name }: { name: string }) {
  return (
    <span className="group/brand mx-(--space-4) inline-flex h-(--space-32) items-center gap-(--space-8) align-top">
      <span className="text-fg-muted transition-colors duration-300 ease-out group-hover/brand:text-fg-accent">{name}</span>
      <span className="-rotate-2 overflow-hidden rounded-logo border-2 border-bg-page shadow-[0_4px_6px_rgba(0,0,0,0.12)] grayscale transition-[rotate,filter] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/brand:rotate-0 group-hover/brand:grayscale-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("home/moud-icon.svg")} alt="" aria-hidden width={32} height={32} className="block size-(--space-32)" />
      </span>
    </span>
  );
}

function Card({ card }: { card: CaseCard }) {
  const kind = card.kind ?? "image";
  return (
    <figure role="listitem" className="flex shrink-0 snap-start flex-col gap-[calc(var(--space-16)*var(--case-scale))]">
      <div
        className={`relative overflow-hidden rounded-visual ${FILL[card.fill]}`}
        style={{ width: `calc(${card.w}px * var(--case-scale))`, height: `calc(${card.h}px * var(--case-scale))` }}
      >
        {kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(card.image)} alt={card.caption} loading="lazy" draggable={false} className="block size-full object-cover" />
        )}
        {kind === "tilt" && <TiltCard src={card.image} alt={card.caption} />}
        {kind === "history" && <HistoryPreview label={card.caption} />}
      </div>
      <figcaption className={`type-caption ${card.captionTone === "primary" ? "text-fg-primary" : "text-fg-muted"}`}>
        {card.caption}
      </figcaption>
    </figure>
  );
}

export function Cases({ t }: { t: Content["cases"] }) {
  return (
    <section aria-labelledby="cases-title" className="flex flex-col items-center gap-(--portfolio-section-gap) py-(--portfolio-section-gap)">
      <h2 className="content type-overline text-center text-fg-secondary">{t.overline}</h2>

      <div className="content flex flex-col items-center gap-(--space-24) text-center">
        <h3 id="cases-title" className="type-body-l">
          <span className="text-fg-primary">{t.titleLead}</span>
          <BrandMark name={t.brand} />
          <span className="block text-fg-tertiary">{t.subtitle}</span>
        </h3>
        <p className="type-overline text-fg-muted">{t.tags}</p>
      </div>

      <CaseStrip label={t.stripLabel}>
        {t.cards.map((card) => (
          <Card key={card.caption} card={card} />
        ))}
      </CaseStrip>

      <Button href={links.caseMoud} variant="secondary" size="sm" label={t.cta} />
    </section>
  );
}
