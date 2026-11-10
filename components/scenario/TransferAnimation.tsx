"use client";

import { PhoneFrame, Screen } from "./PhoneFrame";
import { PhoneSlot } from "./ScenarioCard";
import { asset } from "@/lib/asset";

export function TransferAnimation() {
  return (
    <PhoneSlot>
      <PhoneFrame>
        <Screen src={asset("screens/transfer-01.webp")} alt="Экран перевода" />
      </PhoneFrame>
    </PhoneSlot>
  );
}
