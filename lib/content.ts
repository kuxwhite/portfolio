export type Lang = "ru" | "en";

/** lead: the word kept on one line with the logo (Figma "Project Category"). */
type ProjectPart = string | { logo: string; label?: string; chip?: boolean; lead?: string };

export type CaseCard = {
  /** Static screenshot, or a live preview built in code ("card": the flipping debit card, "history": spending chart). */
  kind?: "image" | "card" | "history";
  image: string;
  caption: string;
  /** Preview size in the Figma strip, px (desktop). */
  w: number;
  h: number;
  /** Preview fill token class; none = no fill. */
  fill: "subtle" | "page" | "section" | "none";
  captionTone: "muted" | "primary";
};

export type Content = {
  meta: { title: string; description: string };
  header: { name: string; switchLabel: string };
  hero: { pitch: string[]; facts: string; doodleLabel: string };
  cases: {
    overline: string;
    titleLead: string;
    brand: string;
    subtitle: string;
    tags: string;
    cta: string;
    stripLabel: string;
    cardFlip: string;
    cards: CaseCard[];
  };
  experience: {
    overline: string;
    expand: string;
    collapse: string;
    present: string;
    items: {
      logo: string;
      logoBg: "neutral" | "intelinvest";
      start: string;
      end?: string;
      company: string;
      description: string;
      projects: ProjectPart[][];
      defaultOpen: boolean;
    }[];
  };
  visuals: { title: string; note: string };
};

const cards = (captions: string[]): CaseCard[] => [
  { image: "cases/face-id.webp", caption: captions[0], w: 424, h: 500, fill: "subtle", captionTone: "muted" },
  { kind: "card", image: "", caption: captions[1], w: 432, h: 300, fill: "page", captionTone: "muted" },
  { image: "cases/home.webp", caption: captions[2], w: 347, h: 400, fill: "subtle", captionTone: "muted" },
  { image: "cases/atms.webp", caption: captions[3], w: 200, h: 200, fill: "subtle", captionTone: "muted" },
  { image: "cases/card-management.webp", caption: captions[4], w: 400, h: 500, fill: "section", captionTone: "muted" },
  { kind: "history", image: "", caption: captions[5], w: 404, h: 404, fill: "none", captionTone: "muted" },
];

export const content: Record<Lang, Content> = {
  ru: {
    meta: {
      title: "Кирилл Новиков — Senior Product Designer",
      description:
        "Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные продукты.",
    },
    header: { name: "Кирилл Новиков", switchLabel: "Язык" },
    hero: {
      pitch: [
        "Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные продукты,",
        "в которых сложные сценарии остаются простыми",
      ],
      facts: "6+ лет · Senior Product Designer",
      doodleLabel: "Иллюстрация: Кирилл лежит, закинув ногу на ногу. Наведите курсор или нажмите, чтобы он сел за ноутбук.",
    },
    cases: {
      overline: "Кейсы",
      titleLead: "Редизайн мобильного банка",
      brand: "Moud",
      subtitle: "Вернулся к агентской версии и переработал ключевые\u00a0сценарии",
      tags: "Финтех · B2C · Мобайл",
      cta: "Смотреть кейс",
      stripLabel: "Экраны кейса",
      cardFlip: "Нажмите, чтобы перевернуть и увидеть реквизиты",
      cards: cards(["Face ID", "Дебетовая карта", "Главный экран", "Банкоматы", "Управление картой", "История"]),
    },
    experience: {
      overline: "Опыт",
      expand: "Развернуть",
      collapse: "Свернуть",
      present: "по настоящее время",
      items: [
        {
          logo: "module-20",
          logoBg: "neutral",
          start: "2022",
          company: "Module agency",
          description:
            "Проектирую финтех- и AI-продукты для банков и e-commerce: платежи, кредитование, рассрочка, B2B-сервисы",
          projects: [
            ["Редизайн мобильного", { lead: "банка", logo: "round-20", label: "Round", chip: true }, "сайт и оформление кредита наличными"],
            ["A2C сервис для мерчантов в", { logo: "uzum", label: "Uzum Bank" }],
            ["Рассрочка BNPL", { lead: "в", logo: "aliexpress-20", label: "Aliexpress", chip: true }],
          ],
          defaultOpen: true,
        },
        {
          logo: "intelinvest-20",
          logoBg: "intelinvest",
          start: "2021",
          end: "2022",
          company: "Intelinvest",
          description: "Крупнейший в СНГ сервис учёта инвестиций, больше 300 тысяч пользователей",
          projects: [
            ["Обновление авторизации прибавило +30% к удержанию новых пользователей за 7 дней"],
            ["Выручка x1.5 в чёрную пятницу к 2021 году"],
            ["Фильтры, сортировка и табличный вид для публичных портфелей"],
          ],
          defaultOpen: false,
        },
      ],
    },
    visuals: { title: "Визуал", note: "(анимация в процессе)" },
  },
  en: {
    meta: {
      title: "Kirill Novikov — Senior Product Designer",
      description: "I help fintech, AI and web3 teams test ideas quickly through concepts and ship clear products.",
    },
    header: { name: "Kirill Novikov", switchLabel: "Language" },
    hero: {
      // One balanced paragraph: the forced RU-style break leaves EN lines ragged.
      pitch: ["I help fintech, AI and web3 teams test ideas quickly through concepts and ship clear products, where complex flows stay simple"],
      facts: "6+ years · Senior Product Designer",
      doodleLabel: "Illustration: Kirill is lying with his legs crossed. Hover or tap to make him sit down at the laptop.",
    },
    cases: {
      overline: "Cases",
      titleLead: "Mobile bank redesign",
      brand: "Moud",
      subtitle: "Went back to the agency version and reworked the key\u00a0flows",
      tags: "Fintech · B2C · Mobile",
      cta: "View case",
      stripLabel: "Case screens",
      cardFlip: "Click to flip it and see the card details",
      cards: cards(["Face ID", "Debit card", "Home screen", "ATMs", "Card management", "History"]),
    },
    experience: {
      overline: "Experience",
      expand: "Expand",
      collapse: "Collapse",
      present: "present",
      items: [
        {
          logo: "module-20",
          logoBg: "neutral",
          start: "2022",
          company: "Module agency",
          description:
            "I design fintech and AI products for banks and e-commerce: payments, lending, installments, B2B services",
          projects: [
            ["Redesign of the", { logo: "round-20", label: "Round", chip: true }, "mobile bank, website and cash loan flow"],
            ["A2C service for merchants at", { logo: "uzum", label: "Uzum Bank" }],
            ["BNPL installments", { lead: "at", logo: "aliexpress-20", label: "Aliexpress", chip: true }],
          ],
          defaultOpen: true,
        },
        {
          logo: "intelinvest-20",
          logoBg: "intelinvest",
          start: "2021",
          end: "2022",
          company: "Intelinvest",
          description: "The largest investment tracking service in the CIS, with over 300,000 users",
          projects: [
            ["A new sign-in flow added +30% to new-user retention within 7 days"],
            ["Revenue ×1.5 on Black Friday compared with 2021"],
            ["Filters, sorting and a table view for public portfolios"],
          ],
          defaultOpen: false,
        },
      ],
    },
    visuals: { title: "Visuals", note: "(animation in progress)" },
  },
};
