import { Button } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { links } from "@/lib/site";
import type { Content } from "@/lib/content";
import { MoodNavigation } from "./cases/MoodNavigation";

function BrandMark({ name }: { name: string }) {
  return (
    <span className="group/brand mx-(--space-4) inline-flex h-[1lh] items-center gap-(--space-8) align-top max-md:gap-(--space-4)">
      <span className="text-fg-accent">{name}</span>
      {/* Figma: 32px icon (its own 6.62 rounding) with a 2px OUTSIDE white stroke → 36px, outer radius 10.
          The stroke is a padded white backing, not a clipping border, so the tilted icon is never cut. */}
      <span className="-my-(--space-2) -rotate-2 rounded-[calc(var(--radius-logo)+var(--space-2))] bg-bg-page p-(--space-2) shadow-[0_4px_6px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/brand:rotate-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("home/moud-icon.svg")} fetchPriority="low" alt="" aria-hidden width={32} height={32} className="block size-(--space-32) max-md:size-7" />
      </span>
    </span>
  );
}

export function Cases({ t }: { t: Content["cases"] }) {
  return (
    <section aria-labelledby="cases-title" className="flex flex-col items-center gap-(--space-32) py-(--portfolio-section-gap)">
      <div className="content flex flex-col items-center gap-(--space-24) text-center">
        <h2 id="cases-title" className="type-body-l max-md:leading-6">
          <span className="text-fg-primary">{t.titleLead}</span>
          <BrandMark name={t.brand} />
          <span className="block text-fg-tertiary">{t.subtitle}</span>
        </h2>
        <p className="type-overline text-fg-muted">{t.tags}</p>
      </div>

      <MoodNavigation t={t} />

      <Button href={links.caseMoud} variant="secondary" size="sm" label={t.cta} />
    </section>
  );
}
