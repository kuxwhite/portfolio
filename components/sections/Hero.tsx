import { asset } from "@/lib/asset";

export function Hero() {
  return (
    <header className="relative pt-(--portfolio-hero-padding-top) pb-(--portfolio-hero-padding-bottom)">
      <p className="absolute left-(--portfolio-hero-padding-bottom) top-(--portfolio-hero-padding-top) text-label text-fg-subtle max-md:left-(--portfolio-section-padding-x) max-md:top-(--portfolio-section-padding-x)">
        Пермь, Россия
      </p>
      <p className="absolute right-(--portfolio-hero-padding-bottom) top-(--portfolio-hero-padding-top) text-label max-md:right-(--portfolio-section-padding-x) max-md:top-(--portfolio-section-padding-x)">
        <span className="text-fg-primary">Ru</span>
        <span className="text-fg-subtle"> / En</span>
      </p>

      <div className="content flex flex-col gap-(--portfolio-section-gap)">
        <div className="relative size-[94px] max-md:size-[50px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("img/avatar-ring.svg")}
            alt=""
            aria-hidden
            className="absolute -left-[2.66%] -right-[2.66%] -top-[2.66%] bottom-[1.02%] h-auto w-[105.32%] max-w-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("img/avatar.webp")}
            alt="Кирилл Новиков"
            width={86}
            height={86}
            className="absolute left-1/2 top-1/2 size-[91.5%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-8 max-md:gap-5">
          <h1 className="text-heading text-fg-tertiary">
            Кирилл Новиков,
            <br />
            Senior Product Designer
          </h1>
          <p className="text-body-l text-fg-primary">
            Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные
            продукты, в которых сложные сценарии остаются простыми для пользователя.
          </p>
          <p className="text-body-l text-fg-tertiary">6+ лет · Module agency · ex-Intelinvest</p>
        </div>
      </div>
    </header>
  );
}
