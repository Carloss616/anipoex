import { useState } from "react";
import { Typography } from "@/components/ui/typography";

export function Synopsis({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <Typography
      numberOfLines={expanded ? undefined : 2}
      color="muted"
      onPress={() => setExpanded((e) => !e)}
    >
      {text}
    </Typography>
  );
}
