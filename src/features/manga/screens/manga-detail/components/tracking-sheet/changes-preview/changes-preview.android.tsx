import { Column } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { AnimatedVisibility } from "@/components/ui/animated-visibility";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ChangesPreviewProps } from "./changes-preview";

export function ChangesPreview({ changes }: ChangesPreviewProps) {
  const m3 = useThemeM3Colors();

  return (
    <AnimatedVisibility visible={changes.length > 0}>
      <Column
        verticalArrangement={{ spacedBy: 4 }}
        modifiers={[padding(16, 0, 16, 16)]}
      >
        {changes.map((line) => (
          <Text
            key={line}
            style={{ typography: "bodySmall", fontWeight: "500" }}
            color={m3.onSurfaceVariant}
          >
            {line}
          </Text>
        ))}
      </Column>
    </AnimatedVisibility>
  );
}
