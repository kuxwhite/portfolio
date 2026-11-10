import { FloatingMenu } from "@/components/sections/FloatingMenu";
import { Hero } from "@/components/sections/Hero";
import { CaseSection } from "@/components/sections/CaseSection";
import { Experience } from "@/components/sections/Experience";
import { Visuals } from "@/components/sections/Visuals";
import { Contact } from "@/components/sections/Contact";
import { content, type Lang } from "@/lib/content";
import { SmoothScroll } from "./SmoothScroll";
import { ScrollThumb } from "./ScrollThumb";

export function HomePage({ lang }: { lang: Lang }) {
  const t = content[lang];
  return (
    <>
      <main>
        <Hero t={t.hero} lang={lang} />
        <CaseSection t={t.case} />
        <Experience t={t.experience} />
        <Visuals t={t.visuals} />
        <Contact t={t.contact} />
      </main>
      <FloatingMenu t={t.menu} />
      <SmoothScroll />
      <ScrollThumb />
    </>
  );
}
