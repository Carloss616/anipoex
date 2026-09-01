import { AnimatedVisibility } from "@expo/ui/jetpack-compose";
import { useRef } from "react";
import { Column } from "@/components/layout/column";
import { Typography } from "@/components/ui/typography";
import type { ChangesPreviewProps } from "./changes-preview";

/** Compose's default transitions: fade + expand in, fade + shrink out. */
export function ChangesPreview({ changes }: ChangesPreviewProps) {
  // The children stay mounted through the exit, so the lines have to outlive
  // the edit being undone or the block fades out empty.
  const last = useRef(changes);
  if (changes.length) last.current = changes;

  return (
    <AnimatedVisibility visible={changes.length > 0}>
      <Column className="gap-1 px-4 pb-4">
        {last.current.map((line) => (
          <Typography key={line} type="small" muted>
            {line}
          </Typography>
        ))}
      </Column>
    </AnimatedVisibility>
  );
}
