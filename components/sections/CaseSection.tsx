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

const SLIDES = 3;

export function CaseSection() {
  const { trackRef, active, scrollTo } = useCarousel(SLIDES);

  return (
    <section aria-labelledby="case-title" className="bg-bg-section py-(--portfolio-section-padding-y)">
      <div className="content flex flex-col gap-16 max-md:gap-8">
        <div className="flex items-end gap-[72px] max-md:gap-4">
          <h2 id="case-title" className="flex-1 text-heading">
            <span className="text-fg-primary">Редизайн мобильного банка Round: </span>
            <span className="text-fg-secondary">вернулся к агентской версии и переработал ключевые сценарии.</span>
          </h2>
          <Button
            href={links.caseMoud}
            variant="secondary"
            content="icon"
            strong
            aria-label="Открыть кейс"
            icon={<Icon name="arrow-up-right" />}
          />
        </div>

        <div
          ref={trackRef}
          className="bleed-x flex snap-x snap-mandatory items-start gap-8 overflow-x-auto max-md:gap-3"
        >
          <ScenarioCard
            caption={{
              lead: "Перевод в одно касание.",
              rest: "Клавиатура открывается сразу, а сумма видна прямо на кнопке. Вместо трёх действий осталось одно.",
            }}
          >
            <TransferAnimation />
          </ScenarioCard>

          <ScenarioCard
            caption={{
              lead: "Любой платёж по кредиту в одном поле.",
              rest: "Обычный, досрочный и полный платёж вводятся одинаково, а экономия и новый срок видны ещё до оплаты.",
            }}
          >
            <PhoneSlot>
              <PhoneFrame>
                <Screen src={asset("screens/loan.webp")} alt="Экран кредита" />
              </PhoneFrame>
            </PhoneSlot>
          </ScenarioCard>

          <ScenarioCard
            caption={{
              lead: "Оплата по QR в один тап.",
              rest: "Камера встроена прямо в экран платежей, а после сканирования сразу видны магазин, сумма и условия.",
            }}
          >
            <QrAnimation />
          </ScenarioCard>
        </div>

        <Pagination count={SLIDES} active={active} onSelect={scrollTo} label="Сценарии кейса" />
      </div>
    </section>
  );
}
