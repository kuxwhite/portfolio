import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { links } from "@/lib/site";
import type { Content } from "@/lib/content";

/*
 * Floating menu (Figma "Menu/mobile" 1400:62357): a white pill 358 × 52, 8px padding, shadow 0 8 8 / 8%,
 * centred and pinned 24px above the bottom of the viewport while the page scrolls.
 * Buttons are Portfolio/Button sm instances: "Experience" Secondary Text; CV Secondary Text+Icon with
 * its fill swapped for a 1px secondary-bg outline; Telegram Primary Text+Icon. Both icon buttons
 * override the right padding to 10px.
 */
export function Menu({ t }: { t: Content["menu"] }) {
  return (
    <nav
      aria-label={t.label}
      className="fixed inset-x-0 bottom-[calc(var(--space-24)+env(safe-area-inset-bottom))] z-20 mx-auto flex w-[calc(100%-var(--space-32))] max-w-[358px] items-center justify-between rounded-full bg-bg-card p-(--space-8) shadow-[0_8px_8px_rgba(0,0,0,0.08)]"
    >
      <Button href="#experience" variant="secondary" size="sm" label={t.experience} />
      <div className="flex items-center gap-(--space-8)">
        <Button
          href={links.cv}
          variant="secondary"
          size="sm"
          content="text-icon"
          label={t.cv}
          icon={<Icon name="file" />}
          outline
          // Figma strokes sit inside the 12/10 padding; a CSS border adds to it, so take 1px back.
          className="pr-[9px]! pl-[11px]!"
        />
        <Button
          href={links.telegram}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          content="text-icon"
          label={t.telegram}
          icon={<Icon name="paperplane" />}
          className="pr-[10px]!"
        />
      </div>
    </nav>
  );
}
