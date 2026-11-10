"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AmountField } from "./AmountField";
import { CAMERA, Frame, LIFT, Loader, Pressable, ScreenCanvas, rect, totalMs, usePhase, type Step } from "./anim";

type Phase =
  | "idle" | "d1" | "d2" | "d3" | "d4"
  | "lift" | "press" | "loading"
  | "success" | "hold" | "toActions" | "pressClose" | "dismiss" | "home";

const STEPS: Step<Phase>[] = [
  { phase: "idle", ms: 1000 },
  { phase: "d1", ms: 520 }, // "1", short pause
  { phase: "d2", ms: 150 }, // then "500" in one quick run
  { phase: "d3", ms: 150 },
  { phase: "d4", ms: 1000 },
  { phase: "lift", ms: 1600 }, // camera glides down to the button
  { phase: "press", ms: 300 },
  { phase: "loading", ms: 650 },
  { phase: "success", ms: 1900 }, // success dissolves in while the phone lowers
  { phase: "hold", ms: 1500 },
  { phase: "toActions", ms: 1600 }, // down to "Чек / Повторить / Закрыть"
  { phase: "pressClose", ms: 420 },
  { phase: "dismiss", ms: 1300 }, // success dissolves away to the bank home
  { phase: "home", ms: 2400 },
];
export const TRANSFER_MS = totalMs(STEPS);

const VALUE: Partial<Record<Phase, string>> = { idle: "0", d1: "1", d2: "15", d3: "150" };

// Frame geometry (402 × 874), measured on the exported frames.
const BUTTON = rect(76, 790, 310, 52);
const CLOSE = rect(299, 754, 56, 56); // icon of the "Закрыть" action

/** In-place cross-dissolve, as iOS swaps one screen for another without a spatial move. */
const DISSOLVE = { duration: 0.5, ease: [0.42, 0, 0.58, 1] } as const;

export function TransferAnimation({ clock, active }: { clock: MotionValue<number>; active: boolean }) {
  const phase = usePhase(STEPS, clock, active);
  const i = STEPS.findIndex((s) => s.phase === phase);
  const at = (p: Phase) => i >= STEPS.findIndex((s) => s.phase === p);

  const filled = at("d1");
  const opened = at("success");
  const dismissed = at("dismiss");
  const lifted = (at("lift") && !opened) || (at("toActions") && !dismissed);

  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ y: lifted ? LIFT : "0%" }} transition={CAMERA}>
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            {/* Source screen */}
            <Frame src={asset("screens/transfer-01.webp")} visible alt="Перевод: ввод суммы" />
            <Frame src={asset("screens/transfer-02.webp")} visible={filled} />
            <AmountField value={VALUE[phase] ?? "1 500"} />
            <Pressable
              src={asset("parts/btn-transfer.webp")}
              style={BUTTON}
              bg="#f7f7f7"
              visible={filled}
              pressed={phase === "press"}
              hideImage={phase === "loading" || opened}
            >
              <span className="absolute inset-0 bg-[#22df6b]" />
              <Loader show={phase === "loading" || phase === "success"} />
            </Pressable>

            {/* Bank home sits under the success screen once it is fully shown */}
            <Frame src={asset("screens/home.webp")} visible={at("hold")} alt="Главный экран банка" />

            {/* Success: a plain in-place cross-dissolve, in and out */}
            <motion.div
              className="absolute inset-0 z-20"
              initial={false}
              animate={{ opacity: opened && !dismissed ? 1 : 0 }}
              transition={DISSOLVE}
            >
              <Frame src={asset("screens/transfer-05.webp")} visible alt="Перевод отправлен" />
              <Pressable src={asset("parts/btn-close.webp")} style={CLOSE} bg="#ffffff" pressed={phase === "pressClose"} pressScale={0.86} darken />
            </motion.div>
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
