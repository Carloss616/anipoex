import { Column } from "@/components/layout/column";
import { AnimatedVisibility } from "@/components/ui/animated-visibility";
import { Typography } from "@/components/ui/typography";

export interface ChangesPreviewProps {
  /** What confirming would change. Empty while the edit is a no-op. */
  changes: string[];
}

/** The preview under a tracking field, opening and closing with the edit. */
export function ChangesPreview({ changes }: ChangesPreviewProps) {
  return (
    <AnimatedVisibility visible={changes.length > 0}>
      <Column className="gap-1 px-4 pb-4">
        {changes.map((line) => (
          <Typography key={line} type="small" muted>
            {line}
          </Typography>
        ))}
      </Column>
    </AnimatedVisibility>
  );
}
