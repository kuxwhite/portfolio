# portfolio

Сайт-портфолио. Next.js (App Router, static export), Tailwind CSS 4, Motion.

```bash
npm ci
npm run dev     # http://localhost:3000
npm run build   # статическая сборка в ./out
```

- Токены: `app/styles/tokens.css` (Figma: Portfolio / Typography, Colors, Dimensions, имена из WEB code syntax). Mobile-режим ниже 768px.
- Типографика: утилиты `type-display`, `type-heading`, `type-body-l`, `type-body-m`, `type-link`, `type-label`, `type-caption`, `type-overline`, `type-mono-s`, `type-mono-m` (`app/globals.css`).
- Визуал: плитки в `components/sections/Visuals.tsx`, медиа подставляется через поле `media` (картинка или видео).
- Тексты RU/EN: `lib/content.ts` (английская версия на `/en/`).
- Ссылки (Telegram, CV, кейс): `lib/site.ts`.
- Деплой: Layero, настройки сборки в `layero.json` (результат в `out`).
- Экраны мокапов: `public/assets/screens` (WebP @2x из Figma).
