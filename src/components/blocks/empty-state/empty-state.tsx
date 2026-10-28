import type { UniversalBaseProps } from "@expo/ui";
import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { useFace } from "./hooks/use-face";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Ways out of the empty state, stacked under the text; the first is the prominent one. */
  actions?: { label: string; onPress: () => void }[];
  children?: React.ReactNode;
  /** iOS and Android only. */
  modifiers?: UniversalBaseProps["modifiers"];
}

export function EmptyState({
  title,
  description,
  actions,
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
      {actions && actions.length > 0 && (
        <View className="mt-1 items-center gap-1.5">
          {actions.map(({ label, onPress }, i) => (
            <Button
              key={label}
              variant={i === 0 ? "secondary" : "ghost"}
              size="sm"
              onPress={onPress}
            >
              {label}
            </Button>
          ))}
        </View>
      )}
      {children}
    </View>
  );
}
