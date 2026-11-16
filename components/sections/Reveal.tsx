"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
 * Scroll reveal for the visual tiles: each tile rises from below, scaling up from slightly smaller,
 * when it enters the viewport; neighbouring columns are offset in time so the grid "pours in".
 * Reduced motion: a plain fade.
 */
export function Reveal({ column, children }: { column: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 96, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      transition={
        reduce
          ? { duration: 0.3 }
          : {
              y: { type: "spring", stiffness: 70, damping: 18, mass: 1, delay: column * 0.08 },
              scale: { type: "spring", stiffness: 70, damping: 18, mass: 1, delay: column * 0.08 },
              opacity: { duration: 0.5, ease: "easeOut", delay: column * 0.08 },
            }
      }
      style={{ transformOrigin: "50% 100%" }}
    >
      {children}
    </motion.div>
  );
}
