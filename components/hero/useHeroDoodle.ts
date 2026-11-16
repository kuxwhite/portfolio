"use client";

import { useEffect, useRef, type RefObject } from "react";
import { CX, GROUND, SIT_DX } from "./heroDoodleGeometry";

/*
 * Logic of hero-doodle.html, as is: lying ↔ sitting with anticipation, a swap and a springy settle;
 * idle flipbooks (foot swing, typing, nod with a blink) and the line boil (feTurbulence seed).
 * Everything runs in one rAF loop and writes straight to the SVG, without React re-renders.
 * Extra: the loop sleeps while the scene is off screen or the tab is hidden.
 */
type Pose = "lie" | "sit";
type Trans = { to: Pose; from: Pose; t0: number; swapped: boolean };
type FrameList = { nodes: SVGGElement[]; cur: number | null };

const A = 110; // anticipation, ms
const B = 430; // settle, ms
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const spring = (u: number) => Math.exp(-5.5 * u) * Math.cos(2 * Math.PI * 1.5 * u); // 1 → 0 with a small overshoot
const scaleT = (sx: number, sy: number, base = "") =>
  `translate(${CX} ${GROUND}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-CX} ${-GROUND}) ${base}`;

function flip(list: FrameList, i: number) {
  if (list.cur === i) return;
  if (list.cur != null) list.nodes[list.cur].style.display = "none";
  else list.nodes.forEach((n) => (n.style.display = "none"));
  list.nodes[i].style.display = "";
  list.cur = i;
}

export function useHeroDoodle(scene: RefObject<HTMLDivElement | null>) {
  const api = useRef<{ toggle: () => void } | null>(null);

  useEffect(() => {
    const root = scene.current;
    if (!root) return;
    const q = <T extends Element>(sel: string) => [...root.querySelectorAll<T>(sel)];
    const lying = root.querySelector<SVGGElement>("[data-pose=lie]")!;
    const sitting = root.querySelector<SVGGElement>("[data-pose=sit]")!;
    const art = root.querySelector<SVGGElement>("[data-art]")!;
    const noise = root.querySelector<SVGFETurbulenceElement>("feTurbulence")!;
    const foot: FrameList = { nodes: q("[data-f=foot]"), cur: null };
    const type: FrameList = { nodes: q("[data-f=type]"), cur: null };
    const head: FrameList = { nodes: [...q<SVGGElement>("[data-f=head]"), ...q<SVGGElement>("[data-f=blink]")], cur: null }; // open eyes, then the blink twins

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = matchMedia("(hover: none)").matches;
    const filter = art.getAttribute("filter");
    if (reduce) art.removeAttribute("filter");

    let pose: Pose = "lie";
    let target: Pose = "lie";
    let trans: Trans | null = null;

    const show = (p: Pose) => {
      const l = p === "lie";
      lying.style.display = l ? "" : "none";
      sitting.style.display = l ? "none" : "";
    };

    function start(to: Pose) {
      if (pose === to) return;
      if (reduce) {
        pose = to;
        show(to);
        return;
      }
      trans = { to, from: pose, t0: performance.now(), swapped: false };
      wake();
    }

    let raf = 0;
    let visible = true;

    function frame(now: number) {
      // --- transition: anticipation → swap → springy settle ---
      let lyT = "";
      let siT = `translate(${SIT_DX} 0)`;
      if (trans) {
        const t = now - trans.t0;
        const toSit = trans.to === "sit";
        if (t < A) {
          const k = easeOut(t / A);
          const sx = 1 + (toSit ? 0.03 : 0.04) * k;
          const sy = 1 - (toSit ? 0.05 : 0.06) * k;
          if (trans.from === "lie") lyT = scaleT(sx, sy);
          else siT = scaleT(sx, sy, `translate(${SIT_DX} 0)`);
        } else {
          if (!trans.swapped) {
            trans.swapped = true;
            pose = trans.to;
            show(pose);
          }
          const u = Math.min(1, (t - A) / B);
          const s = spring(u);
          if (toSit) siT = scaleT(1 - 0.07 * s, 1 + 0.12 * s, `translate(${SIT_DX} 0)`);
          else lyT = scaleT(1 + 0.07 * s, 1 - 0.05 * s);
          if (u >= 1) {
            trans = null;
            if (pose !== target) start(target);
          }
        }
      }
      lying.setAttribute("transform", lyT);
      sitting.setAttribute("transform", siT);

      // --- idle loops: whole hand-drawn frames played like a flipbook ---
      if (!reduce) {
        flip(foot, Math.floor(now / 65) % foot.nodes.length); // foot swing, ~15 fps
        flip(type, Math.floor(now / 105) % type.nodes.length); // typing, ~10 fps
        const nh = head.nodes.length / 2;
        const hk = Math.floor(now / 160) % nh; // slow nod while reading
        flip(head, hk + (now % 3900 < 140 ? nh : 0)); // same head frame with eyes closed = blink
        const seed = String(1 + (Math.floor(now / 125) % 3)); // gentle line boil
        if (noise.getAttribute("seed") !== seed) noise.setAttribute("seed", seed);
      }
      raf = visible && !document.hidden && (!reduce || trans) ? requestAnimationFrame(frame) : 0;
    }
    function wake() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    wake();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      wake();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", wake);

    const go = (to: Pose) => {
      target = to;
      root.setAttribute("aria-pressed", String(to === "sit"));
      if (!trans) start(to);
    };
    const toggle = () => go(target === "sit" ? "lie" : "sit");
    api.current = { toggle };

    const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && go("sit");
    const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && go("lie");
    const onClick = (e: MouseEvent) => (e as PointerEvent).pointerType !== "mouse" && toggle();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    const onFocus = () => !touch && go("sit");
    const onBlur = () => go("lie");
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    root.addEventListener("focus", onFocus);
    root.addEventListener("blur", onBlur);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("focus", onFocus);
      root.removeEventListener("blur", onBlur);
      if (filter) art.setAttribute("filter", filter);
    };
  }, [scene]);

  return api;
}
