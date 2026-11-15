import Link from "next/link";
import type { Content, Lang } from "@/lib/content";

const other = "text-fg-muted transition-colors hover:text-fg-primary";

export function Header({ t, lang }: { t: Content["header"]; lang: Lang }) {
  return (
    <header className="absolute inset-x-0 top-(--page-padding-x) z-10 flex items-start justify-between px-(--page-padding-x)">
      <p className="type-label text-fg-primary">{t.name}</p>
      <nav aria-label={t.switchLabel} className="type-label text-right">
        {lang === "en" ? (
          <span className="text-fg-primary" aria-current="page">En</span>
        ) : (
          <Link href="/en/" hrefLang="en" lang="en" className={other}>En</Link>
        )}
        <span className="text-fg-muted"> / </span>
        {lang === "ru" ? (
          <span className="text-fg-primary" aria-current="page">Ru</span>
        ) : (
          <Link href="/" hrefLang="ru" lang="ru" className={other}>Ru</Link>
        )}
      </nav>
    </header>
  );
}
