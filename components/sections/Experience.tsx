"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { asset } from "@/lib/asset";
import type { Content } from "@/lib/content";

type Item = Content["experience"]["items"][number];

const Logo = ({ name }: { name: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={asset(`logos/${name}.svg`)} alt="" aria-hidden className="inline-block size-5 shrink-0" />
);

export function Experience({ t }: { t: Content["experience"] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-6 bg-bg-section py-(--portfolio-section-padding-y)">
      <div className="content flex flex-col gap-16">
        <h2 id="experience-title" className="text-heading text-fg-primary">
          {t.title}
        </h2>
        <ul className="flex flex-col gap-11">
          {t.items.map((item, i) => (
            <ExperienceItem
              key={item.company}
              item={item}
              labels={t}
              expanded={!!open[i]}
              onToggle={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExperienceItem({
  item,
  labels,
  expanded,
  onToggle,
}: {
  item: Item;
  labels: { expand: string; collapse: string };
  expanded: boolean;
  onToggle: () => void;
}) {
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
                          <Logo key={j} name={part.logo} />
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
        aria-label={`${expanded ? labels.collapse : labels.expand} ${item.company}`}
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
