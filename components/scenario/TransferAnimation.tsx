"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AmountField } from "./AmountField";
import { CAMERA, Frame, LIFT, Loader, Pressable, ScreenCanvas, Sheet, rect, totalMs, usePhase, type Step } from "./anim";

type Phase =
  | "idle" | "d1" | "d2" | "d3" | "d4"
  | "lift" | "press" | "loading"
  | "sheet" | "toTop" | "hold" | "toActions" | "pressClose" | "dismiss" | "home";

const STEPS: Step<Phase>[] = [
  { phase: "idle", ms: 1200 },
  { phase: "d1", ms: 420 },
  { phase: "d2", ms: 420 },
  { phase: "d3", ms: 420 },
  { phase: "d4", ms: 900 },
  { phase: "lift", ms: 1300 }, // camera glides down to the button
  { phase: "press", ms: 260 },
  { phase: "loading", ms: 1600 },
  { phase: "sheet", ms: 900 }, // "Перевод отправлен" rises as a sheet
  { phase: "toTop", ms: 1300 }, // camera back to the top: mascot and amount
  { phase: "hold", ms: 1100 },
  { phase: "toActions", ms: 1300 }, // down to "Чек / Повторить / Закрыть"
  { phase: "pressClose", ms: 260 },
  { phase: "dismiss", ms: 1000 }, // sheet slides away, bank home underneath
  { phase: "home", ms: 2200 },
];
export const TRANSFER_MS = totalMs(STEPS);

const VALUE: Partial<Record<Phase, string>> = { idle: "0", d1: "1", d2: "15", d3: "150" };

// Frame geometry (402 × 874), measured on the exported frames.
const BUTTON = rect(76, 790, 310, 52);
const CLOSE = rect(299, 754, 56, 56); // icon of the "Закрыть" action

export function TransferAnimation({ clock, active }: { clock: MotionValue<number>; active: boolean }) {
  const phase = usePhase(STEPS, clock, active);
  const i = STEPS.findIndex((s) => s.phase === phase);
  const at = (p: Phase) => i >= STEPS.findIndex((s) => s.phase === p);

  const filled = at("d1");
  const sheetOpen = at("sheet") && !at("dismiss");
  const lifted = (at("lift") && !at("toTop")) || (at("toActions") && !at("dismiss"));

  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ y: lifted ? LIFT : "0%" }} transition={CAMERA}>
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <Frame src={asset("screens/transfer-01.webp")} visible alt="Перевод: ввод суммы" />
            <Frame src={asset("screens/transfer-02.webp")} visible={filled} />

            <AmountField value={VALUE[phase] ?? "1 500"} />

            <Pressable
              src={asset("parts/btn-transfer.webp")}
              style={BUTTON}
              bg="#f7f7f7"
              visible={filled}
              pressed={phase === "press"}
              hideImage={phase === "loading" || at("sheet")}
            >
              <span className="absolute inset-0 bg-[#22df6b]" />
              <Loader show={phase === "loading"} />
            </Pressable>

            {/* Bank home waits under the success sheet */}
            <Frame src={asset("screens/home.webp")} visible={at("sheet")} alt="Главный экран банка" />

            <motion.div
              className="absolute inset-0 z-20"
              initial={false}
              animate={{ y: sheetOpen ? "0%" : "102%" }}
              transition={{ type: "spring", duration: 0.8, bounce: 0 }}
            >
              <Sheet src={asset("screens/transfer-05.webp")} open alt="Перевод отправлен" />
              <Pressable src={asset("parts/btn-close.webp")} style={CLOSE} bg="#ffffff" pressed={phase === "pressClose"} />
            </motion.div>
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
