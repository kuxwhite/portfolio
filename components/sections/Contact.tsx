import { Icon } from "@/components/ui/Icon";
import { asset } from "@/lib/asset";
import { links } from "@/lib/site";
import type { Content } from "@/lib/content";

const tile =
  "flex h-36 min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-[24px] p-6 transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-primary";

export function Contact({ t }: { t: Content["contact"] }) {
  return (
    <section aria-labelledby="contact-title" className="bg-bg-section py-(--portfolio-section-padding-y) pb-[calc(var(--portfolio-section-padding-y)+64px)]">
      <div className="content flex flex-col gap-(--portfolio-section-gap)">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("img/avatar.webp")} alt="" aria-hidden width={90} height={90} className="size-[90px] rounded-full object-cover" />
        <div className="flex flex-col gap-8">
          <h2 id="contact-title" className="text-heading text-fg-primary">
            {t.title}
          </h2>
          <p className="text-body-l text-fg-primary">
            {t.text}
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className={`${tile} bg-(--portfolio-button-primary-bg-default) hover:bg-(--portfolio-button-primary-bg-hover) active:bg-(--portfolio-button-primary-bg-pressed)`}
          >
            <span className="text-body-l text-fg-inverse">Telegram</span>
            <span className="flex justify-end">
              <Icon name="arrow-up-right-inverse" size={24} />
            </span>
          </a>
          <a href={links.cv} className={`${tile} bg-bg-card hover:bg-(--portfolio-button-secondary-bg-hover)`}>
            <span className="text-body-l text-fg-primary">CV</span>
            <span className="flex justify-end">
              <Icon name="arrow-up-right-muted" size={24} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
