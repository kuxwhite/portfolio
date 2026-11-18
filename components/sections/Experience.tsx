"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import type { Content } from "@/lib/content";

type Item = Content["experience"]["items"][number];
type Part = Item["projects"][number][number];

const EASE = [0.32, 0.72, 0, 1] as const;

// Company mark backgrounds: neutral-950 token; Intelinvest uses its brand blue (no Portfolio token).
const LOGO_BG: Record<Item["logoBg"], string> = {
  neutral: "bg-(--portfolio-palette-neutral-950)",
  intelinvest: "bg-[#5e8ff2]",
};

const Logo = ({ name }: { name: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={asset(`logos/${name}.svg`)} fetchPriority="low" alt="" aria-hidden width={20} height={20} className="block size-(--space-20) shrink-0" />
);

function ProjectPart({ part, i }: { part: Part; i: number }) {
  if (typeof part === "string") return <>{part.split(" ").map((w, k) => <span key={`${i}-${k}`}>{w}</span>)}</>;
  const inner = (
    <>
      <Logo name={part.logo} />
      {part.label && <span>{part.label}</span>}
    </>
  );
  const mark = part.chip ? (
    // Grouped word + chip overhangs a 20px line; the standalone Uzum chip keeps its 26px height.
    <span className={`${part.lead ? "-my-[3px] " : ""}inline-flex items-center gap-(--space-4) rounded-logo border border-(--portfolio-button-secondary-bg-pressed) p-(--space-2)`}>{inner}</span>
  ) : (
    <span className="inline-flex items-center gap-(--space-4)">{inner}</span>
  );
  // The lead word and the mark wrap together.
  return part.lead ? (
    <span className="inline-flex items-center gap-(--space-4) whitespace-nowrap">
      <span>{part.lead}</span>
      {mark}
    </span>
  ) : (
    mark
  );
}

function ExperienceCard({ item, t }: { item: Item; t: Content["experience"] }) {
  const [open, setOpen] = useState(item.defaultOpen);
  const reduce = useReducedMotion();
  const panelId = useId();

  return (
    // The whole card toggles (the button stays for keyboard and screen readers); hovering it lights up the button.
    <li
      className="group/exp flex cursor-pointer items-start gap-(--space-16) rounded-[48px] border border-border-subtle p-(--space-24) md:p-(--space-32)"
      onClick={() => {
        if (window.getSelection()?.toString()) return; // selecting text isn't a click
        setOpen((o) => !o);
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-(--space-8)">
          <p className="type-mono-s flex items-center gap-(--space-4) text-fg-muted">
            <span>{item.start}</span>
            <span aria-hidden>-</span>
            {item.end ? (
              <span>{item.end}</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset("icons/sparkles.svg")} fetchPriority="low" alt={t.present} width={16} height={16} className="block size-(--space-16)" />
            )}
          </p>
          <div className="flex items-center gap-(--space-8)">
            <span className={`flex rounded-logo p-(--space-2) ${LOGO_BG[item.logoBg]}`}>
              <Logo name={item.logo} />
            </span>
            <h3 className="type-body-m text-fg-primary">{item.company}</h3>
          </div>
          <p className="type-label text-fg-tertiary">{item.description}</p>
        </div>

        <AnimatePresence initial={false}>
          {open && item.projects.length > 0 && (
            <motion.div
              id={panelId}
              key="projects"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0.2 : 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <ol className="flex flex-col gap-(--space-8) pt-(--space-20)">
                {item.projects.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-(--space-8)">
                    <span className="type-mono-m w-[10px] shrink-0 text-fg-subtle md:w-[11px]">{idx + 1}</span>
                    <p className="type-label flex flex-1 flex-wrap items-center gap-(--space-4) text-fg-secondary">
                      {p.map((part, j) => (
                        <ProjectPart key={j} part={part} i={j} />
                      ))}
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
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${open ? t.collapse : t.expand} ${item.company}`}
        className="group-hover/exp:bg-(--portfolio-button-secondary-bg-hover)"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        icon={
          <motion.span
            className="flex"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("icons/chevron-down-20.svg")} fetchPriority="low" alt="" aria-hidden width={20} height={20} className="block size-(--space-20)" />
          </motion.span>
        }
      />
    </li>
  );
}

export function Experience({ t }: { t: Content["experience"] }) {
  return (
    <section id="experience" aria-labelledby="experience-title" className="flex scroll-mt-(--space-24) flex-col items-center gap-(--portfolio-section-gap) py-(--portfolio-section-gap)">
      <h2 id="experience-title" className="content type-overline text-center text-fg-primary">
        {t.overline}
      </h2>
      <ul className="content flex flex-col gap-(--space-16)">
        {t.items.map((item) => (
          <ExperienceCard key={item.company} item={item} t={t} />
        ))}
      </ul>
    </section>
  );
}
