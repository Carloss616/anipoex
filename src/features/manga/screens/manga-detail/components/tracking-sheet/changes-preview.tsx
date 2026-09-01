import { Column } from "@/components/layout/column";
import { Typography } from "@/components/ui/typography";

export interface ChangesPreviewProps {
  /** What confirming would change. Empty while the edit is a no-op. */
  changes: string[];
}

/**
 * The preview under a tracking field. Both native platforms animate it in and
 * out; on web the drawer's own height transition carries the reveal.
 */
export function ChangesPreview({ changes }: ChangesPreviewProps) {
  if (!changes.length) return null;

  return (
    <Column className="gap-1 px-4 pb-4">
      {changes.map((line) => (
        <Typography key={line} type="small" muted>
          {line}
        </Typography>
      ))}
    </Column>
  );
}
