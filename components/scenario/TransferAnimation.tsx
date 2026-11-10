"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AppButton, FADE, Frame, LIFT, MOVE, ROUNDED, ScreenCanvas, TapRipple, rect, totalMs, usePhase, type Step } from "./anim";

type Phase =
  | "idle" | "d1" | "d2" | "d3" | "d4" | "filled"
  | "lift" | "tap" | "loading"
  | "success" | "successHold" | "toActions" | "tapClose" | "home";

const STEPS: Step<Phase>[] = [
  { phase: "idle", ms: 1200 },
  { phase: "d1", ms: 380 },
  { phase: "d2", ms: 380 },
  { phase: "d3", ms: 380 },
  { phase: "d4", ms: 700 },
  { phase: "filled", ms: 500 },
  { phase: "lift", ms: 1300 }, // phone glides up to the button
  { phase: "tap", ms: 450 },
  { phase: "loading", ms: 1700 },
  { phase: "success", ms: 1200 }, // "Перевод отправлен" fades in, phone glides back to the top
  { phase: "successHold", ms: 1300 },
  { phase: "toActions", ms: 1300 }, // glides down to "Чек / Повторить / Закрыть"
  { phase: "tapClose", ms: 500 },
  { phase: "home", ms: 2600 }, // back to the bank's home screen
];
export const TRANSFER_MS = totalMs(STEPS);

const DIGITS: Partial<Record<Phase, string>> = { idle: "0", d1: "1", d2: "15", d3: "150" };

// Frame geometry (402 × 874), measured on the exported frames.
const AMOUNT_ROW = rect(16, 140, 220, 54); // value row of "Amount input" (48/54)
const BUTTON = { x: 76, y: 790, w: 310, h: 52 };
const CLOSE = { x: 327, y: 782 }; // center of the "Закрыть" action (56pt icon)

export function TransferAnimation({ clock, active }: { clock: MotionValue<number>; active: boolean }) {
  const phase = usePhase(STEPS, clock, active);
  const i = STEPS.findIndex((s) => s.phase === phase);
  const at = (p: Phase) => i >= STEPS.findIndex((s) => s.phase === p);

  const filled = at("d1"); // frame 02: helper text and button label for a filled amount
  const finished = at("success");
  const home = at("home");
  const lifted = (at("lift") && !finished) || (at("toActions") && !home);

  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ y: lifted ? LIFT : "0%" }} transition={MOVE}>
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <Frame src={asset("screens/transfer-01.webp")} visible alt="Перевод: ввод суммы" />
            <Frame src={asset("screens/transfer-02.webp")} visible={filled} />

            {/* The amount is always live text, so typing never swaps to the baked digits */}
            <motion.div
              aria-hidden
              className="absolute flex items-center bg-[#f7f7f7] text-[11.94cqw] leading-[13.43cqw] tracking-[-0.36cqw]"
              style={{ ...AMOUNT_ROW, fontFamily: ROUNDED, fontWeight: 500 }}
              initial={false}
              animate={{ opacity: finished ? 0 : 1 }}
              transition={FADE}
            >
              <span className="text-[#131313] tabular-nums">{DIGITS[phase] ?? "1 500"}</span>
              <span className="ml-[0.5cqw] h-[10.95cqw] w-[0.5cqw] animate-[blink_1.06s_steps(1)_infinite] rounded-full bg-[#131313]" />
              <span className="pl-[1.5cqw] text-[#9e9e9e]">₽</span>
            </motion.div>

            <AppButton
              label="Перевести 1 500 ₽"
              visible={filled && !finished}
              pressed={phase === "tap"}
              loading={phase === "loading"}
              style={rect(BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h)}
            />
            <TapRipple show={phase === "tap"} x={BUTTON.x + BUTTON.w / 2} y={BUTTON.y + BUTTON.h / 2} />

            <Frame src={asset("screens/transfer-05.webp")} visible={finished} alt="Перевод отправлен" />
            <TapRipple show={phase === "tapClose"} x={CLOSE.x} y={CLOSE.y} />

            <Frame src={asset("screens/home.webp")} visible={home} alt="Главный экран банка" />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
