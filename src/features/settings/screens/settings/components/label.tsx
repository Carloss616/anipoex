import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/** An Android settings group's title. */
export function Label({ children }: { children: string }) {
  const m3 = useThemeM3Colors();

  return (
    <Text
      style={{ typography: "titleSmall" }}
      color={m3.primary}
      modifiers={[padding(4, 24, 4, 8)]}
    >
      {children}
    </Text>
  );
}
