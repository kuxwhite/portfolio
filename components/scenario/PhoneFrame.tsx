import type { ReactNode } from "react";
import { asset } from "@/lib/asset";

/*
 * iPhone frame drawn in DOM, sized by its container width (cqw units),
 * so it scales identically on desktop (330.9px) and mobile (230px).
 * Geometry from the Figma "Mockup" (330.9 × 689). The screen slot is
 * 309.83 × 667.93 at inset 10.53.
 */
export function PhoneFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="@container relative aspect-[330.9/689] w-full">
      {/* side buttons */}
      <div className="absolute -left-[0.8cqw] top-[39.52cqw] h-[8.22cqw] w-[1.33cqw] rounded-l-[0.53cqw] bg-[#373737]" />
      <div className="absolute -left-[0.8cqw] top-[55.44cqw] h-[14.85cqw] w-[1.33cqw] rounded-l-[0.53cqw] bg-[#373737]" />
      <div className="absolute -left-[0.8cqw] top-[74.8cqw] h-[14.85cqw] w-[1.33cqw] rounded-l-[0.53cqw] bg-[#373737]" />
      <div className="absolute -right-[0.8cqw] top-[66.84cqw] h-[25.46cqw] w-[1.33cqw] rounded-r-[0.53cqw] bg-[#373737]" />

      {/* titanium frame */}
      <div className="absolute inset-0 rounded-[16.45cqw] bg-black shadow-[inset_0_0_0_0.8cqw_#7b7b7b,inset_0_0_0_1.06cqw_#232323]" />
      {/* screen border */}
      <div className="absolute inset-[1.06cqw] rounded-[15.38cqw] bg-[#000100] shadow-[inset_0_0_0.93cqw_0.53cqw_rgba(135,145,148,0.55)]" />

      {/* screen slot */}
      <div className="absolute left-[3.183cqw] right-[3.183cqw] top-[3.183cqw] bottom-[3.183cqw] overflow-hidden rounded-[13.79cqw] bg-[#f7f7f7]">
        {children}
      </div>

      {/* dynamic island */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("img/dynamic-island.svg")}
        alt=""
        aria-hidden
        className="absolute left-1/2 top-[6.366cqw] h-auto w-[29.44cqw] -translate-x-1/2"
      />
    </div>
  );
}

/** A full app screen (402 × 874 export) placed at the top of the screen slot. */
export function Screen({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`absolute left-0 top-0 block h-auto w-full max-w-none ${className}`}
    />
  );
}
