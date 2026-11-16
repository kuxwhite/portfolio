import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Cases } from "@/components/sections/Cases";
import { Experience } from "@/components/sections/Experience";
import { Visuals } from "@/components/sections/Visuals";
import { content, type Lang } from "@/lib/content";
import { Menu } from "@/components/sections/Menu";
import { ScrollThumb } from "./ScrollThumb";

export function HomePage({ lang }: { lang: Lang }) {
  const t = content[lang];
  return (
    <>
      <div className="relative">
        <Header t={t.header} lang={lang} />
        {/* Room for the pinned menu (52px + its 24px offset), so the last section scrolls clear of it. */}
        <main className="pb-[calc(52px+var(--space-24))]">
          <Hero t={t.hero} />
          <Cases t={t.cases} />
          <Experience t={t.experience} />
          <Visuals t={t.visuals} />
        </main>
      </div>
      <Menu t={t.menu} />
      <ScrollThumb />
    </>
  );
}
