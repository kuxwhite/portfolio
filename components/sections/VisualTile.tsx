import { asset } from "@/lib/asset";

export type VisualMedia =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string; label: string };

/** A visual card (radius/visual, bg/subtle as in Figma). Empty until `media` is given. */
export function VisualTile({ ratio, media }: { ratio: [number, number]; media?: VisualMedia }) {
  return (
    <div className="relative w-full overflow-hidden rounded-visual bg-bg-subtle" style={{ aspectRatio: `${ratio[0]} / ${ratio[1]}` }}>
      {media?.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(media.src)} alt={media.alt} loading="lazy" className="absolute inset-0 block size-full object-cover" />
      )}
      {media?.kind === "video" && (
        <video
          src={asset(media.src)}
          poster={media.poster ? asset(media.poster) : undefined}
          aria-label={media.label}
          className="absolute inset-0 block size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
}
