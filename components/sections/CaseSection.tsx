"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { useCarousel } from "@/components/ui/useCarousel";
import { links } from "@/lib/site";
import { ScenarioCard, PhoneSlot } from "@/components/scenario/ScenarioCard";
import { PhoneFrame, Screen } from "@/components/scenario/PhoneFrame";
import { TransferAnimation } from "@/components/scenario/TransferAnimation";
import { QrAnimation } from "@/components/scenario/QrAnimation";
import { asset } from "@/lib/asset";
import type { Content } from "@/lib/content";

const SLIDES = 3;

export function CaseSection({ t }: { t: Content["case"] }) {
  const { trackRef, active, scrollTo } = useCarousel(SLIDES);

  return (
    <section aria-labelledby="case-title" className="bg-bg-section py-(--portfolio-section-padding-y)">
      <div className="content flex flex-col gap-16 max-md:gap-8">
        <div className="flex items-end gap-[72px] max-md:gap-4">
          <h2 id="case-title" className="flex-1 text-heading">
            <span className="text-fg-primary">{t.titleLead}</span>
            <span className="text-fg-secondary">{t.titleRest}</span>
          </h2>
          <Button
            href={links.caseMoud}
            variant="secondary"
            content="icon"
            strong
            aria-label={t.openCase}
            icon={<Icon name="arrow-up-right" />}
          />
        </div>

        <div
          ref={trackRef}
          className="bleed-x flex snap-x snap-mandatory items-start gap-8 overflow-x-auto max-md:gap-3"
        >
          <ScenarioCard
            caption={t.transfer}
          >
            <TransferAnimation />
          </ScenarioCard>

          <ScenarioCard
            caption={t.loan}
          >
            <PhoneSlot>
              <PhoneFrame>
                <Screen src={asset("screens/loan.webp")} alt={t.loanAlt} />
              </PhoneFrame>
            </PhoneSlot>
          </ScenarioCard>

          <ScenarioCard
            caption={t.qr}
          >
            <QrAnimation />
          </ScenarioCard>
        </div>

        <Pagination count={SLIDES} active={active} onSelect={scrollTo} label={t.carouselLabel} />
      </div>
    </section>
  );
}
