import { useState } from "react";
import { Column } from "@/components/layout/column";
import { AnimatedVisibility } from "@/components/ui/animated-visibility";
import { Feedback } from "@/components/ui/feedback";
import { Typography } from "@/components/ui/typography";

/** Enough to tell what the book is about, short enough to leave the page scannable. */
const COLLAPSED_LINES = 3;

export function Synopsis({ text }: { text: string | undefined }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <Feedback onPress={() => setExpanded((e) => !e)}>
      <Column className="items-start gap-1">
        {/* Two copies rather than one `Typography` whose `numberOfLines` changes:
          both native builds animate off `visible`, not off the child's measured
          height, so the thing that grows has to be a child they can keep
          mounted and open by frame. */}
        <AnimatedVisibility visible={!expanded}>
          <Typography numberOfLines={COLLAPSED_LINES} muted>
            {text}
          </Typography>
        </AnimatedVisibility>
        <AnimatedVisibility visible={expanded}>
          <Typography muted>{text}</Typography>
        </AnimatedVisibility>

        {/* Not muted: it is the control, and the only thing here that says the
          description was cut at all. */}
        <Typography type="body-sm" weight="medium">
          {expanded ? "Less" : "More"}
        </Typography>
      </Column>
    </Feedback>
  );
}
