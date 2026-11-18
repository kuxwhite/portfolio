import type { Metadata } from "next";
import { MoodFlow } from "@/components/sections/cases/MoodFlow";

export const metadata: Metadata = { title: "Moud — мобильный флоу", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center px-5 py-10">
      <h1 className="mb-6 type-body-l text-center">Moud · мобильный флоу</h1>
      <MoodFlow label="Экраны кейса" lab />
    </main>
  );
}
