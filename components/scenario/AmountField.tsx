"use client";

import { AnimatePresence, motion } from "motion/react";
import { GLYPHS, LAYOUTS, type Glyph } from "./glyphs";

/*
 * The app's amount value row (Figma "Amount input" → "Value row"): digits, a 2pt cursor and the ₽ suffix.
 * Frame coordinates: row at x16 y140, 54pt high. Gap 2 → cursor (2×44) → gap 2 → suffix slot (pl 6) → ₽.
 * Units are frame points converted to cqw of the 402pt-wide screen.
 */
const ROW = { x: 16, y: 140, h: 54 };
const u = (pt: number) => `${(pt / 402) * 100}cqw`;

const SLIDE = { type: "spring", duration: 0.5, bounce: 0 } as const;
const SHIFT = { type: "spring", duration: 0.45, bounce: 0 } as const;

function GlyphSvg({ g }: { g: Glyph }) {
  return (
    <svg
      viewBox={`0 0 ${g.w} ${g.h}`}
      className="absolute block"
      style={{ left: u(g.inkX), top: u(g.inkY), width: u(g.w), height: u(g.h) }}
      aria-hidden
    >
      <path d={g.d} fill={g.fill} />
    </svg>
  );
}

export function AmountField({ value, cover = "#f7f7f7", visible = true }: { value: string; cover?: string; visible?: boolean }) {
  const layout = LAYOUTS[value];
  const chars = value.replace(/\s/g, "").split("");

  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{ left: u(ROW.x - 2), top: u(ROW.y), width: u(240), height: u(ROW.h), background: cover }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="absolute inset-y-0" style={{ left: u(2) }}>
        <AnimatePresence initial={false} mode="popLayout">
          {chars.map((c, i) => (
            <motion.span
              key={`${i}-${c}`}
              className="absolute top-0"
              style={{ width: u(30), height: u(ROW.h) }}
              initial={{ x: u(layout.xs[i]), y: u(22), opacity: 0, filter: "blur(4px)" }}
              animate={{ x: u(layout.xs[i]), y: u(0), opacity: 1, filter: "blur(0px)" }}
              exit={{ y: u(-14), opacity: 0, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeOut" } }}
              transition={{ default: SLIDE, x: SHIFT }}
            >
              <GlyphSvg g={GLYPHS[c]} />
            </motion.span>
          ))}
        </AnimatePresence>

        {/* cursor + ₽ glide to the end of the value */}
        <motion.span
          className="absolute top-0"
          style={{ height: u(ROW.h) }}
          initial={false}
          animate={{ x: u(layout.width + 2) }}
          transition={SHIFT}
        >
          <span
            className="absolute animate-[blink_1.06s_steps(1)_infinite] rounded-full bg-[#131313]"
            style={{ left: 0, top: u(5), width: u(2), height: u(44) }}
          />
          <span className="absolute top-0" style={{ left: u(10), width: u(30), height: u(ROW.h) }}>
            <GlyphSvg g={GLYPHS["₽"]} />
          </span>
        </motion.span>
      </div>
    </motion.div>
  );
}
