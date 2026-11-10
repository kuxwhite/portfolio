"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { useCarousel } from "@/components/ui/useCarousel";
import { links } from "@/lib/site";
import { ScenarioCard, PhoneSlot } from "@/components/scenario/ScenarioCard";
import { PhoneFrame, Screen } from "@/components/scenario/PhoneFrame";
import { TransferAnimation, TRANSFER_MS } from "@/components/scenario/TransferAnimation";
import { asset } from "@/lib/asset";
import type { Content } from "@/lib/content";

const SLIDES = 3;
const STATIC_MS = 6000; // static cards (Кредит, QR while it is being redrawn)
/** Playback length of each slide; the pagination pill fills over it, then the carousel advances. */
const DURATIONS = [TRANSFER_MS, STATIC_MS, STATIC_MS];

export function CaseSection({ t }: { t: Content["case"] }) {
  const { trackRef, active, scrollTo } = useCarousel(SLIDES);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const reduce = useReducedMotion();
  const playing = inView && !reduce;

  // One clock per active slide drives both the scene and the pagination fill.
  const clock = useMotionValue(0);
  const progress = useMotionValue(0);
  const advancing = useRef(false);

  useEffect(() => {
    clock.set(0);
    progress.set(0);
    advancing.current = false;
  }, [active, clock, progress]);

  useAnimationFrame((_, delta) => {
    if (!playing || advancing.current || document.hidden) return;
    const next = clock.get() + Math.min(delta, 64);
    if (next >= DURATIONS[active]) {
      clock.set(DURATIONS[active]);
      progress.set(1);
      advancing.current = true;
      scrollTo((active + 1) % SLIDES);
    } else {
      clock.set(next);
      progress.set(next / DURATIONS[active]);
    }
  });

  return (
    <section ref={sectionRef} aria-labelledby="case-title" className="bg-bg-section py-(--portfolio-section-padding-y)">
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
            current={active === 0}
            onSelect={() => scrollTo(0)}
            caption={t.transfer}
          >
            <TransferAnimation clock={clock} active={active === 0 && playing} />
          </ScenarioCard>

          <ScenarioCard
            current={active === 1}
            onSelect={() => scrollTo(1)}
            caption={t.loan}
          >
            <PhoneSlot>
              <PhoneFrame>
                <Screen src={asset("screens/loan.webp")} alt={t.loanAlt} />
              </PhoneFrame>
            </PhoneSlot>
          </ScenarioCard>

          <ScenarioCard
            current={active === 2}
            onSelect={() => scrollTo(2)}
            caption={t.qr}
          >
            <PhoneSlot>
              <PhoneFrame>
                <Screen src={asset("screens/qr-01.webp")} alt="Главная платежей" />
              </PhoneFrame>
            </PhoneSlot>
          </ScenarioCard>
        </div>

        <Pagination count={SLIDES} active={active} onSelect={scrollTo} label={t.carouselLabel} progress={reduce ? undefined : progress} />
      </div>
    </section>
  );
}
