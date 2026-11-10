/** Apple-style caption: first sentence dark, the rest grey. */
export function Caption({ lead, rest }: { lead: string; rest: string }) {
  return (
    <p className="text-caption">
      <span className="text-fg-primary">{lead}</span>
      <span className="text-fg-tertiary"> {rest}</span>
    </p>
  );
}
