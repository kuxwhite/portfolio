"use client";

import { AuthMotionPreview } from "@/components/motion/AuthMotionPreview";
import { SpendingCardPreview } from "@/components/motion/SpendingCardPreview";

/**
 * Figma motion previews in the case strip. They are laid out on their Figma canvas (424 × 500,
 * 404 × 404) and scaled with the strip (--case-scale); the card wrapper keeps the site radius.
 */
export function MotionPreview({ kind, w, h, label }: { kind: "auth" | "spending"; w: number; h: number; label: string }) {
  return (
    <div className="absolute top-0 left-0 origin-top-left" style={{ width: w, height: h, scale: "var(--case-scale)" }}>
      {kind === "auth" ? <AuthMotionPreview label={label} /> : <SpendingCardPreview label={label} />}
    </div>
  );
}
