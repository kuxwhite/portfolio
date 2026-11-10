"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { CAMERA, FADE, Frame, LIFT, Loader, Pressable, SHEET, ScreenCanvas, SheetBody, StatusBand, rect, totalMs, usePhase, type Step } from "./anim";

type Phase =
  | "home" | "pressTile" | "expand" | "scan"
  | "sheet" | "lift" | "pressPay" | "loading" | "success" | "toTop" | "hold";

const STEPS: Step<Phase>[] = [
  { phase: "home", ms: 1600 },
  { phase: "pressTile", ms: 320 },
  { phase: "expand", ms: 1100 }, // QR tile opens into the full-screen scanner
  { phase: "scan", ms: 1700 },
  { phase: "sheet", ms: 1500 }, // payment confirmation rises over the camera
  { phase: "lift", ms: 1600 },
  { phase: "pressPay", ms: 300 },
  { phase: "loading", ms: 1100 },
  { phase: "success", ms: 900 },
  { phase: "toTop", ms: 1600 },
  { phase: "hold", ms: 2400 },
];
export const QR_MS = totalMs(STEPS);

// Frame geometry (402 × 874)
const TILE = { x: 16, y: 94, w: 181, h: 324 };
const PAY = rect(16, 790, 370, 52);
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const tileClip = `inset(${pct(TILE.y, 874)} ${pct(402 - TILE.x - TILE.w, 402)} ${pct(874 - TILE.y - TILE.h, 874)} ${pct(TILE.x, 402)} round 5.97cqw)`;
const fullClip = "inset(0% 0% 0% 0% round 0cqw)";

export function QrAnimation({ clock, active }: { clock: MotionValue<number>; active: boolean }) {
  const phase = usePhase(STEPS, clock, active);
  const i = STEPS.findIndex((s) => s.phase === phase);
  const at = (p: Phase) => i >= STEPS.findIndex((s) => s.phase === p);

  const scanner = at("expand");
  const sheet = at("sheet");
  const lifted = at("lift") && !at("toTop");

  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ y: lifted ? LIFT : "0%" }} transition={CAMERA}>
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <Frame src={asset("screens/qr-01.webp")} visible alt="Главная платежей" />
            <Pressable
              src={asset("parts/qr-tile.webp")}
              style={rect(TILE.x, TILE.y, TILE.w, TILE.h)}
              bg="#f7f7f7"
              radius="5.97cqw"
              visible={!scanner}
              pressed={phase === "pressTile"}
            />

            {/* The tile opens into the scanner (shared shape, clip-path) */}
            <motion.img
              src={asset("screens/qr-02.webp")}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 z-10 block h-full w-full max-w-none"
              initial={false}
              animate={{ clipPath: scanner ? fullClip : tileClip, opacity: scanner ? 1 : 0 }}
              transition={{
                clipPath: scanner ? { type: "spring", duration: 0.9, bounce: 0 } : { duration: 0 },
                opacity: scanner ? { duration: 0.12 } : FADE,
              }}
            />

            {/* Confirmation sheet with the live pay button */}
            <motion.div
              className="absolute inset-0 z-20"
              initial={false}
              animate={{ y: sheet ? "0%" : "102%" }}
              transition={SHEET}
            >
              <SheetBody src={asset("screens/qr-03.webp")} alt="Подтверждение оплаты" />
              <Pressable
                src={asset("parts/btn-pay.webp")}
                style={PAY}
                bg="#ffffff"
                visible={!at("success")}
                pressed={phase === "pressPay"}
                hideImage={phase === "loading"}
              >
                <span className="absolute inset-0 bg-[#22df6b]" />
                <Loader show={phase === "loading"} />
              </Pressable>
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: at("success") ? 1 : 0 }}
                transition={FADE}
              >
                <SheetBody src={asset("screens/qr-06.webp")} alt="Оплачено" />
              </motion.div>
            </motion.div>
            <StatusBand src={asset("screens/qr-03.webp")} visible={sheet} />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
