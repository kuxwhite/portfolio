// Run before paint so the incoming language can fade in even on browsers without cross-document transitions.
export const languageNavigation = String.raw`
(() => {
  const key = "portfolio-language-navigation";
  const html = document.documentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  try {
    const pending = JSON.parse(sessionStorage.getItem(key) || "null");
    sessionStorage.removeItem(key);
    if (pending && pending.path === location.pathname && Date.now() - pending.at < 30000 && !reducedMotion.matches) {
      html.dataset.languageTransition = "in";
    }
  } catch {}

  const languageLink = (event) =>
    event.target instanceof Element ? event.target.closest("a[data-language-link]") : null;

  let prefetched;
  const prefetch = (event) => {
    const link = languageLink(event);
    if (!link || prefetched === link.href || navigator.connection?.saveData) return;
    prefetched = link.href;
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.href = link.href;
    document.head.append(hint);
  };
  document.addEventListener("pointerover", prefetch, { passive: true });
  document.addEventListener("touchstart", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);

  let timer;
  document.addEventListener("click", (event) => {
    const link = languageLink(event);
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey ||
        event.altKey || event.shiftKey || reducedMotion.matches) return;

    event.preventDefault();
    if (timer !== undefined) return;
    html.dataset.languageTransition = "out";
    timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify({ path: link.pathname, at: Date.now() }));
      } catch {}
      location.assign(link.href);
    }, 160);
  });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    delete html.dataset.languageTransition;
    timer = undefined;
  });
  document.addEventListener("animationend", (event) => {
    if (event.target === document.body && event.animationName === "vt-language-in") {
      delete html.dataset.languageTransition;
    }
  });
})();
`;
