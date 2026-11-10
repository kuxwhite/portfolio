import type { Metadata, Viewport } from "next";
import { content, type Lang } from "@/lib/content";
// Inter is the real fallback where SF Pro is not installed (Windows, Android, Linux).
import "@fontsource-variable/inter/wght.css";
import "@/app/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export function metadataFor(lang: Lang): Metadata {
  return {
    title: content[lang].meta.title,
    description: content[lang].meta.description,
    alternates: { languages: { ru: "/", en: "/en/" } },
  };
}

export function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
