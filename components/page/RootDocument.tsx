import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
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
  preload("/fonts/SF-Pro-Display-Medium.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
