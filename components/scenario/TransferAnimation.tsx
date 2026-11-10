"use client";

import { motion } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AppButton, EASE, LIFT, Frame, ScreenCanvas, TapRipple, rect, useTimeline, type Step } from "./anim";

type Phase = "idle" | "d1" | "d2" | "d3" | "d4" | "filled" | "lift" | "tap" | "loading" | "done" | "reset";

const STEPS: Step<Phase>[] = [
  { phase: "idle", ms: 1000 },
  { phase: "d1", ms: 280 },
  { phase: "d2", ms: 280 },
  { phase: "d3", ms: 280 },
  { phase: "d4", ms: 450 },
  { phase: "filled", ms: 700 },
  { phase: "lift", ms: 1000 },
  { phase: "tap", ms: 450 },
  { phase: "loading", ms: 1500 },
  { phase: "done", ms: 2800 },
  { phase: "reset", ms: 700 },
];

const AMOUNT: Partial<Record<Phase, string>> = { idle: "0", d1: "1", d2: "15", d3: "150", d4: "1 500", reset: "0" };

// Frame geometry (402 × 874): amount value row and the main button.
const AMOUNT_ROW = rect(16, 140, 300, 54);
const BUTTON = { x: 76, y: 790, w: 310, h: 52 };

export function TransferAnimation() {
  const { ref, phase } = useTimeline(STEPS);
  const typing = phase in AMOUNT;
  const lifted = phase === "lift" || phase === "tap" || phase === "loading";
  const pressing = phase === "tap" || phase === "loading";

  return (
    <div ref={ref} className="absolute inset-0">
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ y: lifted ? LIFT : "0%" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <Frame src={asset("screens/transfer-01.webp")} visible alt="Перевод: ввод суммы" />
            <Frame src={asset("screens/transfer-02.webp")} visible={!typing || phase === "d4"} />

            {/* Typed amount, drawn over the frame's value row */}
            {typing && (
              <div
                aria-hidden
                className="absolute flex items-center bg-[#f7f7f7] text-[11.94cqw] leading-[13.43cqw] tracking-[-0.36cqw]"
                style={{ ...AMOUNT_ROW, fontFamily: "'SF Pro Rounded', ui-rounded, var(--portfolio-font-family)", fontWeight: 500 }}
              >
                <span className="text-[#131313]">{AMOUNT[phase]}</span>
                <span className="ml-[0.5cqw] h-[10.95cqw] w-[0.5cqw] animate-[blink_1s_steps(1)_infinite] rounded-full bg-[#131313]" />
                <span className="pl-[2cqw] text-[#9e9e9e]">₽</span>
              </div>
            )}

            <AppButton
              label="Перевести 1 500 ₽"
              visible={pressing}
              pressed={phase === "tap"}
              loading={phase === "loading"}
              style={rect(BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h)}
            />
            <TapRipple show={phase === "tap"} x={BUTTON.x + BUTTON.w / 2} y={BUTTON.y + BUTTON.h / 2} />

            <Frame src={asset("screens/transfer-05.webp")} visible={phase === "done"} alt="Перевод отправлен" />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
    </div>
  );
}
