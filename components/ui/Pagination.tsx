"use client";

type Props = {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
  label: string;
};

export function Pagination({ count, active, onSelect, label }: Props) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="mx-auto flex items-center gap-1 rounded-full bg-pagination-track p-4"
    >
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${i + 1} из ${count}`}
            onClick={() => onSelect?.(i)}
            className={
              "relative h-2 overflow-hidden rounded-full bg-pagination-dot transition-[width] duration-300 ease-out " +
              "before:absolute before:-inset-2 before:content-[''] " +
              (isActive ? "w-9" : "w-2 hover:bg-fg-muted")
            }
          >
            <span
              className={
                "absolute inset-y-0 left-0 rounded-full bg-pagination-dot-active transition-opacity duration-300 " +
                (isActive ? "w-3 opacity-100" : "w-3 opacity-0")
              }
            />
          </button>
        );
      })}
    </div>
  );
}
