"use client";

import { Pagination } from "@/components/ui/Pagination";
import { useCarousel } from "@/components/ui/useCarousel";
import { asset } from "@/lib/asset";
import type { Content } from "@/lib/content";

const SHOTS = 3;
const card = "relative shrink-0 snap-start overflow-hidden rounded-card bg-bg-section h-[434px] max-md:h-[360px]";

/* eslint-disable @next/next/no-img-element */
export function Visuals({ t }: { t: Content["visuals"] }) {
  const { trackRef, active, scrollTo } = useCarousel(SHOTS);
  return (
    <section aria-labelledby="visuals-title" className="py-(--portfolio-section-padding-y)">
      <div className="content flex flex-col gap-(--portfolio-section-gap)">
        <h2 id="visuals-title" className="text-heading text-fg-primary">
          {t.title}
        </h2>

        <div ref={trackRef} className="bleed-x flex snap-x snap-mandatory gap-4 overflow-x-auto max-md:gap-3">
          {/* Phone with success character */}
          <div className={`${card} w-[648px] max-md:w-[538px]`}>
            <img
              src={asset("img/visual-phone.webp")}
              alt={t.alts[0]}
              className="absolute left-1/2 top-[37px] h-auto w-[40.85%] max-w-none -translate-x-1/2"
            />
          </div>
          {/* Deposit card thumbnail */}
          <div className={`${card} w-[250px] max-md:w-[207px]`}>
            <img
              src={asset("img/visual-deposit.webp")}
              alt={t.alts[1]}
              className="absolute left-0 top-1/2 h-auto w-full max-w-none -translate-y-[36.4%]"
            />
          </div>
          {/* Debit card */}
          <div className={`${card} w-[788px] max-md:w-[654px]`}>
            <img
              src={asset("img/visual-card.webp")}
              alt={t.alts[2]}
              className="absolute left-1/2 top-1/2 h-auto w-[46.45%] max-w-none -translate-x-1/2 -translate-y-[45.3%]"
            />
          </div>
        </div>

        <Pagination count={SHOTS} active={active} onSelect={scrollTo} label={t.label} />
      </div>
    </section>
  );
}
