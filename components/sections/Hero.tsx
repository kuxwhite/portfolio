import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Content, Lang } from "@/lib/content";

const langLink = "transition-colors hover:text-fg-primary";

export function Hero({ t, lang }: { t: Content["hero"]; lang: Lang }) {
  return (
    <header className="relative pt-(--portfolio-hero-padding-top) pb-(--portfolio-hero-padding-bottom)">
      <p className="absolute left-(--portfolio-hero-padding-bottom) top-(--portfolio-hero-padding-top) text-label text-fg-subtle max-md:left-(--portfolio-section-padding-x) max-md:top-(--portfolio-section-padding-x)">
        {t.location}
      </p>
      <p className="absolute right-(--portfolio-hero-padding-bottom) top-(--portfolio-hero-padding-top) text-label max-md:right-(--portfolio-section-padding-x) max-md:top-(--portfolio-section-padding-x)">
        {lang === "ru" ? (
          <span className="text-fg-primary" aria-current="page">Ru</span>
        ) : (
          <Link href="/" hrefLang="ru" lang="ru" className={`text-fg-subtle ${langLink}`}>Ru</Link>
        )}
        <span className="text-fg-subtle"> / </span>
        {lang === "en" ? (
          <span className="text-fg-primary" aria-current="page">En</span>
        ) : (
          <Link href="/en/" hrefLang="en" lang="en" className={`text-fg-subtle ${langLink}`}>En</Link>
        )}
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
            alt={t.avatarAlt}
            width={86}
            height={86}
            className="absolute left-1/2 top-1/2 size-[91.5%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-8 max-md:gap-5">
          <h1 className="text-heading text-fg-tertiary">
            {t.name[0]}
            <br />
            {t.name[1]}
          </h1>
          <p className="text-body-l text-fg-primary">
            {t.pitch}
          </p>
          <p className="text-body-l text-fg-tertiary">{t.facts}</p>
        </div>
      </div>
    </header>
  );
}
