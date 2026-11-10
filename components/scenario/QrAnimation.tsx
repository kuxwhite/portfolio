"use client";

import { PhoneFrame, Screen } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { asset } from "@/lib/asset";

export function QrAnimation() {
  return (
    <PhoneSlot>
      <PhoneFrame>
        <Screen src={asset("screens/qr-01.webp")} alt="Главная платежей" />
      </PhoneFrame>
    </PhoneSlot>
  );
}
