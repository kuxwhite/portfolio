export type Lang = "ru" | "en";

/** lead: the word kept on one line with the logo (Figma "Project Category"). */
type ProjectPart = string | { logo: string; label?: string; chip?: boolean; lead?: string };

export type Content = {
  meta: { title: string; description: string };
  header: { name: string; switchLabel: string };
  menu: { label: string; experience: string; cv: string; telegram: string };
  hero: { pitch: string[]; facts: string; doodleLabel: string };
  cases: {
    titleLead: string;
    brand: string;
    subtitle: string;
    tags: string;
    cta: string;
    stripLabel: string;
    cardFlip: string;
    previews: { auth: string; debit: string; overview: string; map: string; settings: string };
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

export const content: Record<Lang, Content> = {
  ru: {
    meta: {
      title: "Кирилл Новиков — Senior Product Designer",
      description:
        "Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные продукты.",
    },
    header: { name: "Кирилл Новиков", switchLabel: "Язык" },
    menu: { label: "Меню", experience: "Опыт", cv: "CV", telegram: "Telegram" },
    hero: {
      pitch: [
        "Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные продукты,",
        "в которых сложные сценарии остаются простыми",
      ],
      facts: "6+ лет · Senior Product Designer",
      doodleLabel: "Иллюстрация: Кирилл лежит, закинув ногу на ногу. Наведите курсор или нажмите, чтобы он сел за ноутбук.",
    },
    cases: {
      titleLead: "Редизайн мобильного банка",
      brand: "Moud",
      subtitle: "Вернулся к агентской версии и переработал ключевые\u00a0сценарии",
      tags: "Финтех · B2C · Мобайл",
      cta: "Смотреть кейс",
      stripLabel: "Экраны кейса",
      cardFlip: "Нажмите, чтобы перевернуть и увидеть реквизиты",
      previews: { auth: "Face ID", debit: "Дебетовая карта", overview: "Карты, счета и вклады", map: "Маршрут до банкомата", settings: "Настройки карты" },
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
    menu: { label: "Menu", experience: "Experience", cv: "CV", telegram: "Telegram" },
    hero: {
      // One balanced paragraph: the forced RU-style break leaves EN lines ragged.
      pitch: ["I help fintech, AI and web3 teams test ideas quickly through concepts and ship clear products, where complex flows stay simple"],
      facts: "6+ years · Senior Product Designer",
      doodleLabel: "Illustration: Kirill is lying with his legs crossed. Hover or tap to make him sit down at the laptop.",
    },
    cases: {
      titleLead: "Mobile bank redesign",
      brand: "Moud",
      subtitle: "Went back to the agency version and reworked the key\u00a0flows",
      tags: "Fintech · B2C · Mobile",
      cta: "View case",
      stripLabel: "Case screens",
      cardFlip: "Click to flip it and see the card details",
      previews: { auth: "Face ID", debit: "Debit card", overview: "Cards, accounts, and deposits", map: "Directions to an ATM", settings: "Card settings" },
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
