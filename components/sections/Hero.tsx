import type { Content } from "@/lib/content";
import { HeroDoodle } from "@/components/hero/HeroDoodle";

export function Hero({ t }: { t: Content["hero"] }) {
  return (
    <section className="flex flex-col items-center gap-(--portfolio-section-gap) pb-(--portfolio-section-padding-y) pt-[100px] md:pt-[148px]">
      <div className="content flex justify-center">
        <HeroDoodle label={t.doodleLabel} />
      </div>
      <div className="content flex flex-col gap-(--space-32) text-center md:gap-(--space-24)">
        <h1 className="type-body-l max-md:leading-6 text-fg-primary">
          {t.pitch.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>
        <p className="type-overline text-fg-muted">{t.facts}</p>
      </div>
    </section>
  );
}
