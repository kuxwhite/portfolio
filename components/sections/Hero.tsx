import type { Content } from "@/lib/content";
import { HeroDoodle } from "@/components/hero/HeroDoodle";

export function Hero({ t }: { t: Content["hero"] }) {
  return (
    // Top: section padding on desktop (Figma 1362:27633), hero padding on phones (old mobile 1265:12573).
    <section className="flex flex-col items-center gap-(--portfolio-section-gap) pb-(--portfolio-section-padding-y) pt-[max(var(--portfolio-section-padding-y),var(--portfolio-hero-padding-top))]">
      <HeroDoodle label={t.doodleLabel} />
      <div className="content flex flex-col gap-(--space-32) text-center">
        <h1 className="type-body-l text-fg-primary">
          {t.pitch[0]}
          <br /> {t.pitch[1]}
        </h1>
        <p className="type-overline text-fg-muted">{t.facts}</p>
      </div>
    </section>
  );
}
