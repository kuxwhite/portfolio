import { asset } from "@/lib/asset";

export type IconName =
  | "arrow-up-right"
  | "arrow-up-right-inverse"
  | "arrow-up-right-muted"
  | "chevron-down"
  | "chevron-up"
  | "file"
  | "paperplane";

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`icons/${name}.svg`)}
      width={size}
      height={size}
      alt=""
      aria-hidden
      draggable={false}
      className={`block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
