import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Center, type CenterProps } from "../layout/center";
import { useFace } from "./hooks/use-face";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** A way out of the empty state, as a small tonal button under the text. */
  action?: { label: string; onPress: () => void };
  children?: React.ReactNode;
  modifiers?: CenterProps["modifiers"];
}

export function EmptyState({
  title,
  description,
  action,
  children,
  modifiers,
}: EmptyStateProps) {
  const face = useFace();

  return (
    <Center className="gap-3 px-8 py-24" modifiers={modifiers}>
      <Typography align="center" muted className="text-5xl">
        {face}
      </Typography>
      <Typography type="h5" weight="medium" align="center" muted>
        {title}
      </Typography>
      {description && (
        <Typography type="body-xs" align="center" muted>
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-1"
          onPress={action.onPress}
        >
          {action.label}
        </Button>
      )}
      {children}
    </Center>
  );
}
