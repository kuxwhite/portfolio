import type { Metadata } from "next";
import { MoodCardLab } from "@/components/lab/MoodCardLab";

export const metadata: Metadata = { title: "Mood — сцены 13–14", robots: { index: false, follow: false } };

export default function Page() {
  return <MoodCardLab />;
}
