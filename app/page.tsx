import { FloatingMenu } from "@/components/sections/FloatingMenu";
import { Hero } from "@/components/sections/Hero";
import { CaseSection } from "@/components/sections/CaseSection";
import { Experience } from "@/components/sections/Experience";
import { Visuals } from "@/components/sections/Visuals";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <CaseSection />
        <Experience />
        <Visuals />
        <Contact />
      </main>
      <FloatingMenu />
    </>
  );
}
