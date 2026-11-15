import { asset } from "@/lib/asset";

/*
 * TEMPORARY: static pose "Лёжа · нога на ногу" exported from Figma (1398:61452, 171.28 × 100).
 * The animated character (hero-doodle.html: lying → sits on hover, foot swing, typing, nod,
 * blink, line boil) is not in the repository yet; it will replace this markup 1:1, keeping the
 * same component API.
 */
export function HeroDoodle({ label }: { label: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("home/doodle-lying.svg")}
      alt={label}
      width={171.279}
      height={100}
      className="block h-auto w-[171.279px] max-w-full"
      draggable={false}
    />
  );
}
