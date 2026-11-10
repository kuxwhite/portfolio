import type { ReactNode } from "react";
import { Caption } from "./Caption";

type Props = {
  caption: { lead: string; rest: string };
  /** Select this card (scrolls the carousel to it) when it is not the current one. */
  onSelect?: () => void;
  current?: boolean;
  /** Phone (with its own positioning) rendered inside the clipped window. */
  children: ReactNode;
};

/*
 * Card window: 442.9 × 479 on desktop, 310 × 334 on mobile (same ratio).
 * Caption always sits below the window, the phone never covers it.
 */
export function ScenarioCard({ caption, children, onSelect, current = true }: Props) {
  return (
    <figure
      className={`flex w-[442.9px] shrink-0 snap-start flex-col gap-5 max-md:w-[310px] ${current ? "" : "cursor-pointer"}`}
      onClick={current ? undefined : onSelect}
    >
      <div className="relative aspect-[442.9/479] w-full overflow-hidden rounded-card bg-bg-card">{children}</div>
      <figcaption>
        <Caption {...caption} />
      </figcaption>
    </figure>
  );
}

/** Default phone placement inside a card: 74.7% wide, centered, top at 11.7% of card height. */
export function PhoneSlot({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="absolute left-1/2 top-[11.7%] w-[74.7%] -translate-x-1/2" style={style}>
      {children}
    </div>
  );
}
