"use client";

import { motion } from "motion/react";
import { asset } from "@/lib/asset";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { AppButton, EASE, LIFT, Frame, ScreenCanvas, TapRipple, rect, useTimeline, type Step } from "./anim";

type Phase = "home" | "tapTile" | "expand" | "scan" | "confirm" | "tapPay" | "loading" | "done" | "reset";

const STEPS: Step<Phase>[] = [
  { phase: "home", ms: 1400 },
  { phase: "tapTile", ms: 450 },
  { phase: "expand", ms: 750 },
  { phase: "scan", ms: 1500 },
  { phase: "confirm", ms: 1500 },
  { phase: "tapPay", ms: 450 },
  { phase: "loading", ms: 1500 },
  { phase: "done", ms: 2800 },
  { phase: "reset", ms: 700 },
];

// Frame geometry (402 × 874)
const TILE = { x: 16, y: 94, w: 181, h: 324 };
const PAY = { x: 16, y: 790, w: 370, h: 52 };
const tileClip = `inset(${(TILE.y / 874) * 100}% ${((402 - TILE.x - TILE.w) / 402) * 100}% ${((874 - TILE.y - TILE.h) / 874) * 100}% ${(TILE.x / 402) * 100}% round 5.97cqw)`;
const fullClip = "inset(0% 0% 0% 0% round 0cqw)";

export function QrAnimation() {
  const { ref, phase } = useTimeline(STEPS);
  const scannerOn = phase === "expand" || phase === "scan";
  const confirmOn = phase === "confirm" || phase === "tapPay" || phase === "loading";
  const paying = phase === "tapPay" || phase === "loading";

  return (
    <div ref={ref} className="absolute inset-0">
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ y: confirmOn ? LIFT : "0%" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <PhoneSlot>
        <PhoneFrame>
          <ScreenCanvas>
            <Frame src={asset("screens/qr-01.webp")} visible alt="Главная платежей" />

            {/* QR tile grows into the full-screen scanner */}
            <motion.img
              src={asset("screens/qr-02.webp")}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 block h-full w-full max-w-none"
              initial={false}
              animate={{
                clipPath: scannerOn || confirmOn ? fullClip : tileClip,
                opacity: phase === "home" || phase === "tapTile" || phase === "reset" ? 0 : 1,
              }}
              transition={{
                clipPath: { duration: phase === "expand" ? 0.7 : 0, ease: EASE },
                opacity: { duration: phase === "expand" ? 0.15 : 0.35 },
              }}
            />
            <TapRipple show={phase === "tapTile"} x={TILE.x + TILE.w / 2} y={TILE.y + TILE.h / 2} />

            <Frame src={asset("screens/qr-03.webp")} visible={confirmOn} alt="Подтверждение оплаты" />
            <AppButton
              label="Оплатить 2 099 ₽"
              visible={paying}
              pressed={phase === "tapPay"}
              loading={phase === "loading"}
              style={rect(PAY.x, PAY.y, PAY.w, PAY.h)}
            />
            <TapRipple show={phase === "tapPay"} x={PAY.x + PAY.w / 2} y={PAY.y + PAY.h / 2} />

            <Frame src={asset("screens/qr-06.webp")} visible={phase === "done"} alt="Оплачено" />
          </ScreenCanvas>
        </PhoneFrame>
      </PhoneSlot>
    </motion.div>
    </div>
  );
}
