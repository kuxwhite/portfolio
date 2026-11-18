import type { Content, Lang } from "@/lib/content";

const other = "text-fg-muted transition-colors hover:text-fg-primary";

export function Header({ t, lang }: { t: Content["header"]; lang: Lang }) {
  return (
    <header className="absolute inset-x-0 top-(--page-padding-x) z-10 flex items-start justify-between px-(--page-padding-x) xl:px-16">
      <p className="type-label text-fg-primary">{t.name}</p>
      <nav aria-label={t.switchLabel} className="type-label text-right">
        {lang === "en" ? (
          <span className="text-fg-primary" aria-current="page">En</span>
        ) : (
          <a href="/en/" hrefLang="en" lang="en" data-language-link className={other}>En</a>
        )}
        <span className="text-fg-muted"> / </span>
        {lang === "ru" ? (
          <span className="text-fg-primary" aria-current="page">Ru</span>
        ) : (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- keep separate documents for cross-page transitions
          <a href="/" hrefLang="ru" lang="ru" data-language-link className={other}>Ru</a>
        )}
      </nav>
    </header>
  );
}
