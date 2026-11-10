import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Style = "primary" | "secondary";
type Content = "text" | "text-icon" | "icon";

type CommonProps = {
  variant?: Style;
  content?: Content;
  /** Icon buttons on tinted sections use the stronger secondary fill. */
  strong?: boolean;
  label?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "content" | "className"> & { href?: undefined };
type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "content" | "className"> & { href: string };

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full text-label whitespace-nowrap select-none " +
  "transition-[background-color,transform] duration-150 ease-out not-disabled:active:scale-[0.96] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-primary " +
  "disabled:pointer-events-none";

const styles: Record<Style, string> = {
  primary:
    "bg-(--portfolio-button-primary-bg-default) text-(--portfolio-button-primary-fg) " +
    "hover:bg-(--portfolio-button-primary-bg-hover) active:bg-(--portfolio-button-primary-bg-pressed) " +
    "disabled:bg-(--portfolio-button-primary-bg-disabled) disabled:text-(--portfolio-button-primary-fg-disabled)",
  secondary:
    "bg-(--portfolio-button-secondary-bg-default) text-(--portfolio-button-secondary-fg) " +
    "hover:bg-(--portfolio-button-secondary-bg-hover) active:bg-(--portfolio-button-secondary-bg-pressed) " +
    "disabled:bg-(--portfolio-button-secondary-bg-disabled) disabled:text-(--portfolio-button-secondary-fg-disabled)",
};

// Stronger secondary fill (Figma instances on #f7f7f7 sections): default uses the pressed token,
// hover goes a step darker (neutral-150) so the circle never fades into the section; pressed darker still.
const strongSecondary =
  "bg-(--portfolio-button-secondary-bg-pressed) text-(--portfolio-button-secondary-fg) " +
  "hover:bg-(--portfolio-palette-neutral-150) active:bg-(--portfolio-palette-neutral-150) active:brightness-95";

const sizes: Record<Content, string> = {
  text: "h-11 gap-(--portfolio-button-gap) px-(--portfolio-button-padding-x) py-(--portfolio-button-padding-y)",
  "text-icon":
    "h-11 gap-(--portfolio-button-gap) pl-(--portfolio-button-padding-x) pr-(--portfolio-button-padding-x-icon-side) py-(--portfolio-button-padding-y)",
  icon: "size-12 p-(--portfolio-button-padding-icon)",
};

export function Button(props: ButtonProps | LinkProps) {
  const {
    variant = "primary",
    content = "text",
    strong = false,
    label,
    icon,
    className = "",
    ...rest
  } = props;

  const cls = [
    base,
    variant === "secondary" && strong ? strongSecondary : styles[variant],
    sizes[content],
    className,
  ].join(" ");

  const inner = (
    <>
      {content !== "icon" && <span>{label}</span>}
      {content !== "text" && icon && (
        <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden>
          {icon}
        </span>
      )}
    </>
  );

  if (typeof rest.href === "string") {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
