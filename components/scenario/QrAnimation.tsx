"use client";

import { motion, type MotionValue } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AppButton, FADE, Frame, LIFT, MOVE, ScreenCanvas, TapRipple, rect, totalMs, usePhase, type Step } from "./anim";

type Phase = "home" | "tapTile" | "expand" | "scan" | "confirm" | "lift" | "tapPay" | "loading" | "success" | "done";

const STEPS: Step<Phase>[] = [
  { phase: "home", ms: 1500 },
  { phase: "tapTile", ms: 450 },
  { phase: "expand", ms: 900 },
  { phase: "scan", ms: 1700 },
  { phase: "confirm", ms: 900 },
  { phase: "lift", ms: 1300 },
  { phase: "tapPay", ms: 450 },
  { phase: "loading", ms: 1700 },
  { phase: "success", ms: 900 },
  { phase: "done", ms: 2700 },
];
export const QR_MS = totalMs(STEPS);

// Frame geometry (402 × 874)
const TILE = { x: 16, y: 94, w: 181, h: 324 };
const PAY = { x: 16, y: 790, w: 370, h: 52 };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const tileClip = `inset(${pct(TILE.y, 874)} ${pct(402 - TILE.x - TILE.w, 402)} ${pct(874 - TILE.y - TILE.h, 874)} ${pct(TILE.x, 402)} round 5.97cqw)`;
const fullClip = "inset(0% 0% 0% 0% round 0cqw)";

export function QrAnimation({ clock, active }: { clock: MotionValue<number>; active: boolean }) {
  const phase = usePhase(STEPS, clock, active);
  const i = STEPS.findIndex((s) => s.phase === phase);
  const at = (p: Phase) => i >= STEPS.findIndex((s) => s.phase === p);

  const scanner = at("expand");
  const confirm = at("confirm");
  const lifted = at("lift") && !at("done");
  const finished = at("success");

  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ y: lifted ? LIFT : "0%" }} transition={MOVE}>
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <Frame src={asset("screens/qr-01.webp")} visible alt="Главная платежей" />

            {/* The QR tile opens into the full-screen scanner */}
            <motion.img
              src={asset("screens/qr-02.webp")}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 block h-full w-full max-w-none"
              initial={false}
              animate={{ clipPath: scanner ? fullClip : tileClip, opacity: scanner ? 1 : 0 }}
              transition={{
                clipPath: scanner ? { duration: 0.9, ease: [0.2, 0, 0, 1] } : { duration: 0 },
                opacity: scanner ? { duration: 0.2, ease: "easeOut" } : FADE,
              }}
            />
            <TapRipple show={phase === "tapTile"} x={TILE.x + TILE.w / 2} y={TILE.y + TILE.h / 2} />

            <Frame src={asset("screens/qr-03.webp")} visible={confirm} alt="Подтверждение оплаты" />
            <AppButton
              label="Оплатить 2 099 ₽"
              visible={confirm && !finished}
              pressed={phase === "tapPay"}
              loading={phase === "loading"}
              style={rect(PAY.x, PAY.y, PAY.w, PAY.h)}
            />
            <TapRipple show={phase === "tapPay"} x={PAY.x + PAY.w / 2} y={PAY.y + PAY.h / 2} />

            <Frame src={asset("screens/qr-06.webp")} visible={finished} alt="Оплачено" />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
  );
}
