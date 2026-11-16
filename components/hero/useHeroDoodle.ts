"use client";

import { useEffect, useRef, type RefObject } from "react";
import { asset } from "@/lib/asset";
import { CX, GROUND, INK, PAPER, REST_URL, SIT_DX } from "./heroDoodleGeometry";
import type { DoodleFrame, DoodlePose } from "./heroDoodleFrames";

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

type Rest = { foot: DoodleFrame[]; sitting: DoodlePose; head: DoodleFrame[]; blink: DoodleFrame[]; type: DoodleFrame[] };

const SVG = "http://www.w3.org/2000/svg";
function el(tag: string, attrs: Record<string, string | number>) {
  const n = document.createElementNS(SVG, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  return n;
}
/** Same markup as the server-rendered frames in HeroDoodle.tsx: a paper mask under the inked path. */
function frameNodes(kind: string, frames: DoodleFrame[]) {
  return frames.map(({ mask: [x, y, width, height], d }) => {
    const g = el("g", { "data-f": kind }) as SVGGElement;
    g.style.display = "none";
    g.append(el("rect", { x, y, width, height, fill: PAPER }), el("path", { d, fill: INK, "fill-rule": "evenodd" }));
    return g;
  });
}

function flip(list: FrameList, i: number) {
  if (!list.nodes.length || list.cur === i) return;
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
    const type: FrameList = { nodes: [], cur: null };
    const head: FrameList = { nodes: [], cur: null }; // open eyes, then the blink twins
    // The rest of the drawing arrives from doodle-rest.json (preloaded with the page); until then the
    // character holds still on its first frame and a hover/tap waits for it.
    let ready = false;
    const abort = new AbortController();
    fetch(asset(REST_URL), { signal: abort.signal })
      .then((r) => r.json() as Promise<Rest>)
      .then((rest) => {
        const more = frameNodes("foot", rest.foot);
        foot.nodes[foot.nodes.length - 1].after(...more);
        foot.nodes.push(...more);
        sitting.append(
          el("path", { d: rest.sitting.ground, stroke: INK, "stroke-width": 6.6, "stroke-linecap": "round", fill: "none" }),
          ...rest.sitting.static.map((p) => el("path", { d: p.d, fill: p.fill === "ink" ? INK : PAPER, "fill-rule": "evenodd" })),
        );
        const headNodes = frameNodes("head", rest.head);
        const blinkNodes = frameNodes("blink", rest.blink);
        const typeNodes = frameNodes("type", rest.type);
        sitting.append(...headNodes, ...blinkNodes, ...typeNodes);
        // Same first frames as the old server markup, before the loop takes over.
        headNodes[0].style.display = "";
        typeNodes[0].style.display = "";
        head.nodes = [...headNodes, ...blinkNodes];
        type.nodes = typeNodes;
        ready = true;
        if (target !== pose && !trans) start(target);
        wake();
      })
      .catch(() => {});

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
      if (pose === to || !ready) return;
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
      abort.abort();
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
