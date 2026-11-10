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
  { phase: "success", ms: 1900 }, // success zooms out of the button while the phone lowers
  { phase: "hold", ms: 1500 },
  { phase: "toActions", ms: 1600 }, // down to "Чек / Повторить / Закрыть"
  { phase: "pressClose", ms: 420 },
  { phase: "dismiss", ms: 1300 }, // success shrinks away, bank home comes forward
  { phase: "home", ms: 2400 },
];
export const TRANSFER_MS = totalMs(STEPS);

const VALUE: Partial<Record<Phase, string>> = { idle: "0", d1: "1", d2: "15", d3: "150" };

// Frame geometry (402 × 874), measured on the exported frames.
const BTN = { x: 76, y: 790, w: 310, h: 52 };
const BUTTON = rect(BTN.x, BTN.y, BTN.w, BTN.h);
const CLOSE = rect(299, 754, 56, 56); // icon of the "Закрыть" action

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
// iOS 18 zoom transition: the destination opens out of the tapped control.
const FROM_BUTTON = `inset(${pct(BTN.y, 874)} ${pct(402 - BTN.x - BTN.w, 402)} ${pct(874 - BTN.y - BTN.h, 874)} ${pct(BTN.x, 402)} round 6.47cqw)`;
const FULL = "inset(0% 0% 0% 0% round 0cqw)";
const ORIGIN = `${pct(BTN.x + BTN.w / 2, 402)} ${pct(BTN.y + BTN.h / 2, 874)}`;

const ZOOM = { type: "spring", duration: 1.1, bounce: 0 } as const;
const DISMISS = { type: "spring", duration: 0.9, bounce: 0 } as const;

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
            {/* Source screen: recedes slightly while the success screen opens over it */}
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: ORIGIN }}
              initial={false}
              animate={{ scale: opened ? 0.94 : 1, filter: opened ? "brightness(0.92)" : "brightness(1)" }}
              transition={ZOOM}
            >
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
            </motion.div>

            {/* Bank home waits under the success screen and comes forward on dismiss */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: at("hold") ? 1 : 0, scale: dismissed ? 1 : 0.94 }}
              transition={{ opacity: { duration: 0 }, scale: DISMISS }}
            >
              <Frame src={asset("screens/home.webp")} visible alt="Главный экран банка" />
            </motion.div>

            {/* Success: zooms out of the button, shrinks away on Close */}
            <motion.div
              className="absolute inset-0 z-20"
              style={{ transformOrigin: "50% 50%" }}
              initial={false}
              animate={{
                clipPath: opened ? FULL : FROM_BUTTON,
                opacity: opened && !dismissed ? 1 : 0,
                scale: dismissed ? 0.92 : 1,
              }}
              transition={{
                clipPath: opened ? ZOOM : { duration: 0 },
                opacity: dismissed ? { duration: 0.35, ease: "easeOut" } : { duration: opened ? 0.12 : 0 },
                scale: DISMISS,
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: ORIGIN }}
                initial={false}
                animate={{ scale: opened ? 1 : 0.9 }}
                transition={opened ? ZOOM : { duration: 0 }}
              >
                <Frame src={asset("screens/transfer-05.webp")} visible alt="Перевод отправлен" />
                <Pressable src={asset("parts/btn-close.webp")} style={CLOSE} bg="#ffffff" pressed={phase === "pressClose"} pressScale={0.86} darken />
              </motion.div>
            </motion.div>
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
