import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { links } from "@/lib/site";
import type { Content } from "@/lib/content";

// Mobile buttons are compact (36px high) per Menu/mobile.
const compact =
  "max-md:h-9 max-md:py-(--portfolio-button-gap) max-md:pl-3 max-md:pr-2.5";

export function FloatingMenu({ t }: { t: Content["menu"] }) {
  return (
    <nav
      aria-label={t.label}
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-(--portfolio-section-padding-x) max-md:bottom-5 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-11 rounded-full bg-bg-card p-2 drop-shadow-[0px_8px_8px_rgba(0,0,0,0.12)] max-md:w-full max-md:justify-between max-md:gap-2">
        <Button href="#experience" variant="secondary" content="text" label={t.experience} className="max-md:h-9 max-md:px-3 max-md:py-(--portfolio-button-gap)" />
        <div className="flex items-center gap-2">
          <Button
            href={links.cv}
            variant="secondary"
            content="text-icon"
            label={t.cv}
            icon={<Icon name="file" />}
            className={`bg-transparent border border-(--portfolio-button-secondary-bg-default) ${compact}`}
          />
          <Button
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            content="text-icon"
            label={t.telegram}
            icon={<Icon name="paperplane" />}
            className={compact}
          />
        </div>
      </div>
    </nav>
  );
}
