export type Lang = "ru" | "en";

type Caption = { lead: string; rest: string };
type ProjectPart = string | { logo: string };

export type Content = {
  meta: { title: string; description: string };
  menu: { label: string; experience: string; cv: string; telegram: string };
  hero: { location: string; name: [string, string]; pitch: string; facts: string; avatarAlt: string };
  case: {
    titleLead: string;
    titleRest: string;
    openCase: string;
    carouselLabel: string;
    transfer: Caption;
    loan: Caption;
    qr: Caption;
    loanAlt: string;
  };
  experience: {
    title: string;
    expand: string;
    collapse: string;
    items: { logo: string; years: string; company: string; description: string; projects: ProjectPart[][] }[];
  };
  visuals: { title: string; label: string; alts: [string, string, string] };
  contact: { title: string; text: string };
};

export const content: Record<Lang, Content> = {
  ru: {
    meta: {
      title: "Кирилл Новиков — Senior Product Designer",
      description:
        "Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные продукты.",
    },
    menu: { label: "Навигация", experience: "Опыт", cv: "CV", telegram: "Telegram" },
    hero: {
      location: "Пермь, Россия",
      name: ["Кирилл Новиков,", "Senior Product Designer"],
      pitch:
        "Помогаю финтех, AI, web3 командам быстро проверять идеи через концепции и выпускать понятные продукты, в которых сложные сценарии остаются простыми для пользователя.",
      facts: "6+ лет · Module agency · ex-Intelinvest",
      avatarAlt: "Кирилл Новиков",
    },
    case: {
      titleLead: "Редизайн мобильного банка Round: ",
      titleRest: "вернулся к агентской версии и переработал ключевые сценарии.",
      openCase: "Открыть кейс",
      carouselLabel: "Сценарии кейса",
      transfer: {
        lead: "Перевод в одно касание.",
        rest: "Клавиатура открывается сразу, а сумма видна прямо на кнопке. Вместо трёх действий осталось одно.",
      },
      loan: {
        lead: "Любой платёж по кредиту в одном поле.",
        rest: "Обычный, досрочный и полный платёж вводятся одинаково, а экономия и новый срок видны ещё до оплаты.",
      },
      qr: {
        lead: "Оплата по QR в один тап.",
        rest: "Камера встроена прямо в экран платежей, а после сканирования сразу видны магазин, сумма и условия.",
      },
      loanAlt: "Экран кредита",
    },
    experience: {
      title: "Мой опыт",
      expand: "Развернуть",
      collapse: "Свернуть",
      items: [
        {
          logo: "module",
          years: "2022 — настоящее время",
          company: "Module agency",
          description:
            "Проектирую финтех- и AI-продукты для банков и e-commerce: платежи, кредитование, рассрочка, B2B-сервисы",
          projects: [
            ["Редизайн мобильного банка", { logo: "round" }, "Round, сайт и оформление кредита наличными"],
            ["A2C сервис для мерчантов в", { logo: "uzum" }, "Uzum Bank"],
            ["Рассрочка BNPL в", { logo: "aliexpress" }, "Aliexpress"],
          ],
        },
        {
          logo: "intelinvest",
          years: "2021 — 2022",
          company: "Intelinvest",
          description: "Крупнейший в СНГ сервис учёта инвестиций, больше 300 тысяч пользователей",
          projects: [
            ["Обновление авторизации прибавило +30% к удержанию новых пользователей за 7 дней"],
            ["Выручка x1.5 в чёрную пятницу к 2021 году"],
            ["Фильтры, сортировка и табличный вид для публичных портфелей"],
          ],
        },
      ],
    },
    visuals: {
      title: "Визуал",
      label: "Визуал",
      alts: ["Экран успешной операции с маскотом", "Карточка вклада", "Дебетовая карта"],
    },
    contact: {
      title: "Давайте поработаем",
      text: "Открыт к предложениям на позицию Senior Product Designer. Быстрее всего отвечаю в Telegram.",
    },
  },
  en: {
    meta: {
      title: "Kirill Novikov — Senior Product Designer",
      description: "I help fintech, AI and web3 teams test ideas quickly through concepts and ship clear products.",
    },
    menu: { label: "Navigation", experience: "Experience", cv: "CV", telegram: "Telegram" },
    hero: {
      location: "Perm, Russia",
      name: ["Kirill Novikov,", "Senior Product Designer"],
      pitch:
        "I help fintech, AI and web3 teams test ideas quickly through concepts and ship clear products where complex flows stay simple for the user.",
      facts: "6+ years · Module agency · ex-Intelinvest",
      avatarAlt: "Kirill Novikov",
    },
    case: {
      titleLead: "Round mobile bank redesign: ",
      titleRest: "went back to the agency version and reworked the key flows.",
      openCase: "Open case study",
      carouselLabel: "Case study flows",
      transfer: {
        lead: "One-tap transfer.",
        rest: "The keypad opens right away and the amount is shown on the button. Three actions became one.",
      },
      loan: {
        lead: "Any loan payment in a single field.",
        rest: "Regular, early and full repayments are entered the same way, and the savings and new term are visible before paying.",
      },
      qr: {
        lead: "QR payment in one tap.",
        rest: "The camera is built right into the payments screen, and after scanning you instantly see the store, amount and terms.",
      },
      loanAlt: "Loan screen",
    },
    experience: {
      title: "Experience",
      expand: "Expand",
      collapse: "Collapse",
      items: [
        {
          logo: "module",
          years: "2022 — present",
          company: "Module agency",
          description:
            "I design fintech and AI products for banks and e-commerce: payments, lending, installments, B2B services",
          projects: [
            ["Redesign of the", { logo: "round" }, "Round mobile bank, website and cash loan flow"],
            ["A2C service for merchants at", { logo: "uzum" }, "Uzum Bank"],
            ["BNPL installments at", { logo: "aliexpress" }, "Aliexpress"],
          ],
        },
        {
          logo: "intelinvest",
          years: "2021 — 2022",
          company: "Intelinvest",
          description: "The largest investment tracking service in the CIS, with over 300,000 users",
          projects: [
            ["A new sign-in flow added +30% to new-user retention within 7 days"],
            ["Revenue ×1.5 on Black Friday compared with 2021"],
            ["Filters, sorting and a table view for public portfolios"],
          ],
        },
      ],
    },
    visuals: {
      title: "Visuals",
      label: "Visuals",
      alts: ["Success screen with the mascot", "Deposit card", "Debit card"],
    },
    contact: {
      title: "Let’s work together",
      text: "Open to Senior Product Designer roles. Telegram is the fastest way to reach me.",
    },
  },
};
