"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { asset } from "@/lib/asset";

type Project = ReactNode[];
type Item = { logo: string; years: string; company: string; description: string; projects: Project[] };

const Logo = ({ name }: { name: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={asset(`logos/${name}.svg`)} alt="" aria-hidden className="inline-block size-5 shrink-0" />
);

const ITEMS: Item[] = [
  {
    logo: "module",
    years: "2022 — настоящее время",
    company: "Module agency",
    description: "Проектирую финтех- и AI-продукты для банков и e-commerce: платежи, кредитование, рассрочка, B2B-сервисы",
    projects: [
      ["Редизайн мобильного банка", <Logo key="l" name="round" />, "Round, сайт и оформление кредита наличными"],
      ["A2C сервис для мерчантов в", <Logo key="l" name="uzum" />, "Uzum Bank"],
      ["Рассрочка BNPL в", <Logo key="l" name="aliexpress" />, "Aliexpress"],
    ],
  },
  {
    logo: "intelinvest",
    years: "2021 — 2022",
    company: "Intelinvest",
    description: "Крупнейший в СНГ сервис учёта инвестиций, больше 300 тысяч пользователей",
    projects: [],
  },
];

export function Experience() {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-6 bg-bg-section py-(--portfolio-section-padding-y)">
      <div className="content flex flex-col gap-16">
        <h2 id="experience-title" className="text-heading text-fg-primary">
          Мой опыт
        </h2>
        <ul className="flex flex-col gap-11">
          {ITEMS.map((item, i) => (
            <ExperienceItem
              key={item.company}
              item={item}
              expanded={!!open[i]}
              onToggle={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExperienceItem({ item, expanded, onToggle }: { item: Item; expanded: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  const panelId = useId();
  const hasProjects = item.projects.length > 0;

  return (
    <li className="flex items-start gap-4">
      <div className="shrink-0 rounded-[16px] border border-[color-mix(in_srgb,var(--portfolio-palette-neutral-150)_24%,transparent)] bg-bg-card p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(`logos/${item.logo}.svg`)} alt={item.company} className="size-10" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-4">
          <p className="text-label text-fg-muted">{item.years}</p>
          <h3 className="text-body-m text-fg-primary">{item.company}</h3>
          <p className="text-label text-fg-primary">{item.description}</p>
        </div>

        <AnimatePresence initial={false}>
          {expanded && hasProjects && (
            <motion.div
              id={panelId}
              key="projects"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? { height: 0, opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <ol className="flex flex-col gap-4 pt-6">
                {item.projects.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-bg-subtle text-label text-fg-muted">
                      {idx + 1}
                    </span>
                    <p className="flex flex-1 flex-wrap items-center gap-x-1 text-label text-fg-secondary">
                      {p.map((part, j) =>
                        typeof part === "string" ? (
                          part.split(" ").map((w, k) => <span key={`${j}-${k}`}>{w}</span>)
                        ) : (
                          part
                        ),
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="secondary"
        content="icon"
        strong
        aria-expanded={expanded}
        aria-controls={hasProjects ? panelId : undefined}
        aria-label={expanded ? `Свернуть ${item.company}` : `Развернуть ${item.company}`}
        onClick={onToggle}
        icon={
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="flex"
          >
            <Icon name="chevron-down" />
          </motion.span>
        }
      />
    </li>
  );
}
