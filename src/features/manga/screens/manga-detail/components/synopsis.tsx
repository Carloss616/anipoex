import { useState } from "react";
import { Row } from "@/components/layout/row";
import { Feedback } from "@/components/ui/feedback";
import { Typography } from "@/components/ui/typography";

export function Synopsis({ text }: { text: string | undefined }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <Feedback for={Row} onPress={() => setExpanded((e) => !e)}>
      <Typography numberOfLines={expanded ? undefined : 2} color="muted">
        {text}
      </Typography>
    </Feedback>
  );
}
