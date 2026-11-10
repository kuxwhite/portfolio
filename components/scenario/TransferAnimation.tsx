"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AmountField } from "./AmountField";
import { CAMERA, Frame, LIFT, Loader, Pressable, SHEET, ScreenCanvas, SheetBody, StatusBand, rect, totalMs, usePhase, type Step } from "./anim";

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
  { phase: "success", ms: 1900 }, // phone lowers while "Перевод отправлен" rises: one parallel move
  { phase: "hold", ms: 1500 },
  { phase: "toActions", ms: 1600 }, // down to "Чек / Повторить / Закрыть"
  { phase: "pressClose", ms: 420 },
  { phase: "dismiss", ms: 1500 }, // sheet slides away, bank home underneath
  { phase: "home", ms: 2400 },
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
  const sheetOpen = at("success") && !at("dismiss");
  const lifted = (at("lift") && !at("success")) || (at("toActions") && !at("dismiss"));

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
              hideImage={phase === "loading" || at("success")}
            >
              <span className="absolute inset-0 bg-[#22df6b]" />
              <Loader show={phase === "loading" || phase === "success"} />
            </Pressable>

            {/* Bank home waits under the success sheet */}
            <Frame src={asset("screens/home.webp")} visible={at("hold")} alt="Главный экран банка" />

            <motion.div
              className="absolute inset-0 z-20"
              initial={false}
              animate={{ y: sheetOpen ? "0%" : "102%" }}
              transition={SHEET}
            >
              <SheetBody src={asset("screens/transfer-05.webp")} alt="Перевод отправлен" />
              <Pressable src={asset("parts/btn-close.webp")} style={CLOSE} bg="#ffffff" pressed={phase === "pressClose"} pressScale={0.86} darken />
            </motion.div>
            <StatusBand src={asset("screens/transfer-05.webp")} visible={sheetOpen} />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
