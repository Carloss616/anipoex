import { Column, FilledTonalButton } from "@expo/ui/jetpack-compose";
import { fillMaxSize, padding } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { EnsureHost } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { EmptyStateProps } from "./empty-state";
import { useFace } from "./hooks/use-face";

/**
 * Centred in what it's given; `modifiers` sit between the fill and the
 * padding, so a `verticalScroll()` keeps the viewport as the minimum height.
 */
export function EmptyState({
  title,
  description,
  action,
  children,
  modifiers,
}: EmptyStateProps) {
  const face = useFace();
  const m3 = useThemeM3Colors();
  const muted = m3.onSurfaceVariant;

  return (
    <EnsureHost className="flex-1">
      <Column
        verticalArrangement="center"
        horizontalAlignment="center"
        modifiers={[
          fillMaxSize(),
          ...(modifiers ?? []),
          padding(32, 96, 32, 96),
        ]}
      >
        <Column
          verticalArrangement={{ spacedBy: 12 }}
          horizontalAlignment="center"
        >
          <Text style={{ fontSize: 48, lineHeight: 48 }} color={muted}>
            {face}
          </Text>
          <Text
            style={{ typography: "titleMedium", textAlign: "center" }}
            color={muted}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={{ typography: "bodySmall", textAlign: "center" }}
              color={muted}
            >
              {description}
            </Text>
          )}
          {action && (
            <FilledTonalButton onClick={action.onPress}>
              <Text style={{ typography: "labelLarge" }}>{action.label}</Text>
            </FilledTonalButton>
          )}
          {children}
        </Column>
      </Column>
    </EnsureHost>
  );
}
