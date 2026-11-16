import { Button } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { links } from "@/lib/site";
import type { CaseCard, Content } from "@/lib/content";

const FILL: Record<CaseCard["fill"], string> = {
  subtle: "bg-bg-subtle",
  page: "bg-bg-page",
  section: "bg-bg-section",
  none: "",
};

/** "Moud" brand mark from the case title (Figma "Brand Mark"). */
function BrandMark({ name }: { name: string }) {
  return (
    <span className="-my-(--space-8) mx-(--space-4) inline-flex items-center gap-(--space-8) rounded-brand border border-border-subtle p-(--space-4) align-middle">
      <span className="text-fg-muted">{name}</span>
      <span className="-rotate-2 overflow-hidden rounded-logo border-2 border-bg-page shadow-[0_4px_6px_rgba(0,0,0,0.12)] mix-blend-luminosity">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("home/moud-icon.svg")} alt="" aria-hidden width={32} height={32} className="block size-(--space-32)" />
      </span>
    </span>
  );
}

function Card({ card }: { card: CaseCard }) {
  return (
    <figure role="listitem" className="flex shrink-0 snap-start flex-col gap-[calc(var(--space-16)*var(--case-scale))]">
      <div
        className={`overflow-hidden rounded-visual ${FILL[card.fill]}`}
        style={{ width: `calc(${card.w}px * var(--case-scale))`, height: `calc(${card.h}px * var(--case-scale))` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(card.image)} alt={card.caption} loading="lazy" draggable={false} className="block size-full object-cover" />
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

      <div
        role="list"
        aria-label={t.stripLabel}
        className="no-scrollbar flex w-full items-center gap-(--space-16) overflow-x-auto overscroll-x-contain px-(--page-padding-x) scroll-px-(--page-padding-x) max-md:snap-x max-md:snap-mandatory"
      >
        {t.cards.map((card) => (
          <Card key={card.image} card={card} />
        ))}
      </div>

      <Button href={links.caseMoud} variant="secondary" size="sm" label={t.cta} />
    </section>
  );
}
