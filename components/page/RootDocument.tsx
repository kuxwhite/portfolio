import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { content, type Lang } from "@/lib/content";
import "@fontsource/geist-mono/500.css";
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
  preload("/fonts/SF-Pro-Display-Regular.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  // The language switch is a cross-document navigation. Without this the first switch has to fetch
  // the other page and its fonts mid-transition (a visible jump); later switches hit the cache.
  // Chrome/Edge prerender the other language in the background, so activation is instant;
  // other browsers at least get its HTML prefetched.
  const other = lang === "ru" ? "/en/" : "/";
  const rules = { prerender: [{ urls: [other], eagerness: "immediate" }] };
  return (
    <html lang={lang}>
      <body>
        {/* React hoists the <link> into <head>; speculation rules work from <body> too. */}
        <link rel="prefetch" href={other} />
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(rules) }} />
        {children}
      </body>
    </html>
  );
}
