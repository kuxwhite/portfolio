"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AmountField } from "./AmountField";
import { CAMERA, Frame, FrameBand, LIFT, Loader, Pressable, ScreenCanvas, Shine, rect, totalMs, usePhase, type Step } from "./anim";

type Phase =
  | "idle" | "d1" | "d2" | "d3" | "d4"
  | "lift" | "press" | "loading"
  | "fadeOut" | "success" | "hold" | "toActions" | "pressClose" | "closeOut" | "home";

const STEPS: Step<Phase>[] = [
  { phase: "idle", ms: 1000 },
  { phase: "d1", ms: 520 }, // "1", short pause
  { phase: "d2", ms: 150 }, // then "500" in one quick run
  { phase: "d3", ms: 150 },
  { phase: "d4", ms: 1000 },
  { phase: "lift", ms: 1900 }, // camera glides down to the button, which starts to shine
  { phase: "press", ms: 300 },
  { phase: "loading", ms: 900 },
  { phase: "fadeOut", ms: 300 }, // fade through: the payment screen goes out first…
  { phase: "success", ms: 1700 }, // …then the result comes in, parts one after another
  { phase: "hold", ms: 1300 },
  { phase: "toActions", ms: 1600 }, // down to "Чек / Повторить / Закрыть"
  { phase: "pressClose", ms: 420 },
  { phase: "closeOut", ms: 300 }, // fade through back to the bank home
  { phase: "home", ms: 2400 },
];
export const TRANSFER_MS = totalMs(STEPS);

const VALUE: Partial<Record<Phase, string>> = { idle: "0", d1: "1", d2: "15", d3: "150" };

// Frame geometry (402 × 874), measured on the exported frames.
const BUTTON = rect(76, 790, 310, 52);
const CLOSE = rect(299, 754, 56, 56); // icon of the "Закрыть" action
// Bands of the success frame: header (status + title), hero (mascot, amount, recipient), actions.
const HEADER = [0, 122] as const;
const HERO = [122, 750] as const;
const ACTIONS = [750, 874] as const;

// Fade through (Material): outgoing 90ms-ish quick fade, incoming fade + slight scale up.
const OUT = { duration: 0.25, ease: [0.4, 0, 1, 1] } as const;
const IN = { duration: 0.4, ease: [0, 0, 0.2, 1] } as const;

export function TransferAnimation({ clock, active }: { clock: MotionValue<number>; active: boolean }) {
  const phase = usePhase(STEPS, clock, active);
  const i = STEPS.findIndex((s) => s.phase === phase);
  const at = (p: Phase) => i >= STEPS.findIndex((s) => s.phase === p);

  const filled = at("d1");
  const gone = at("fadeOut"); // payment screen faded out
  const shown = at("success") && !at("closeOut"); // success content visible
  const home = at("home");
  const lifted = (at("lift") && !gone) || (at("toActions") && !at("closeOut"));

  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ y: lifted ? LIFT : "0%" }} transition={CAMERA}>
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <div className="absolute inset-0 bg-white" />

            {/* Payment screen */}
            <motion.div className="absolute inset-0" initial={false} animate={{ opacity: gone ? 0 : 1 }} transition={gone ? OUT : { duration: 0 }}>
              <Frame src={asset("screens/transfer-01.webp")} visible alt="Перевод: ввод суммы" />
              <Frame src={asset("screens/transfer-02.webp")} visible={filled} />
              <AmountField value={VALUE[phase] ?? "1 500"} />
              <Pressable
                src={asset("parts/btn-transfer.webp")}
                style={BUTTON}
                bg="#f7f7f7"
                visible={filled}
                pressed={phase === "press"}
                hideImage={phase === "loading" || gone}
                overlay={<Shine on={at("d4") && !at("press")} />}
              >
                <span className="absolute inset-0 bg-[#22df6b]" />
                <Loader show={phase === "loading" || phase === "fadeOut"} />
              </Pressable>
            </motion.div>

            {/* Success: parts enter one after another */}
            <motion.div className="absolute inset-0" initial={false} animate={{ opacity: at("closeOut") ? 0 : 1 }} transition={at("closeOut") ? OUT : { duration: 0 }}>
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={shown ? IN : { duration: 0 }}
              >
                <FrameBand src={asset("screens/transfer-05.webp")} from={HEADER[0]} to={HEADER[1]} alt="Перевод отправлен" />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: "50% 40%" }}
                initial={false}
                animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.96 }}
                transition={shown ? IN : { duration: 0 }}
              >
                <FrameBand src={asset("screens/transfer-05.webp")} from={HERO[0]} to={HERO[1]} />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: shown ? 1 : 0, y: shown ? "0%" : "1.6%" }}
                transition={shown ? { ...IN, delay: 0.12 } : { duration: 0 }}
              >
                <FrameBand src={asset("screens/transfer-05.webp")} from={ACTIONS[0]} to={ACTIONS[1]} />
                <Pressable src={asset("parts/btn-close.webp")} style={CLOSE} bg="#ffffff" pressed={phase === "pressClose"} pressScale={0.86} darken />
              </motion.div>
            </motion.div>

            {/* Bank home fades through in */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: home ? 1 : 0, scale: home ? 1 : 0.97 }}
              transition={home ? IN : { duration: 0 }}
            >
              <Frame src={asset("screens/home.webp")} visible alt="Главный экран банка" />
            </motion.div>
            {/* System status bar: stays on screen through every transition */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("parts/status-dark.webp")}
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 z-30 block h-auto w-full max-w-none"
            />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
