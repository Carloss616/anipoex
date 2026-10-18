import type { UniversalBaseProps } from "@expo/ui";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useFace } from "./hooks/use-face";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** A way out of the empty state, as a small tonal button under the text. */
  action?: { label: string; onPress: () => void };
  children?: React.ReactNode;
  /** iOS and Android only. */
  modifiers?: UniversalBaseProps["modifiers"];
}

export function EmptyState({
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  const face = useFace();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-24">
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
    </View>
  );
}
