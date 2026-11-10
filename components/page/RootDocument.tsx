import type { Metadata, Viewport } from "next";
import { content, type Lang } from "@/lib/content";
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
