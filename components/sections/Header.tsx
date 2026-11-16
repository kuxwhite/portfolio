import type { Content, Lang } from "@/lib/content";

const other = "text-fg-muted transition-colors hover:text-fg-primary";

/*
 * Plain links: Ru and En are separate documents (two root layouts), so the switch is a full
 * navigation animated by the cross-document view transition. RootDocument prerenders the other
 * language, which is what keeps the very first switch as smooth as the next ones.
 */
export function Header({ t, lang }: { t: Content["header"]; lang: Lang }) {
  return (
    <header className="absolute inset-x-0 top-(--page-padding-x) z-10 flex items-start justify-between px-(--page-padding-x)">
      <p className="type-label text-fg-primary">{t.name}</p>
      <nav aria-label={t.switchLabel} className="type-label text-right">
        {lang === "en" ? (
          <span className="text-fg-primary" aria-current="page">En</span>
        ) : (
          <a href="/en/" hrefLang="en" lang="en" className={other}>En</a>
        )}
        <span className="text-fg-muted"> / </span>
        {lang === "ru" ? (
          <span className="text-fg-primary" aria-current="page">Ru</span>
        ) : (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- full navigation on purpose (see above)
          <a href="/" hrefLang="ru" lang="ru" className={other}>Ru</a>
        )}
      </nav>
    </header>
  );
}
