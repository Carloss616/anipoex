import { Box } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { Icon, type IconName } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/** An Android settings row's icon, in a circle. */
export function LeadingIcon({ name }: { name: IconName }) {
  const m3 = useThemeM3Colors();

  return (
    <Box
      contentAlignment="center"
      modifiers={[
        size(40, 40),
        clip(Shapes.Circle),
        background(m3.surfaceContainerHigh),
      ]}
    >
      <Icon name={name} color="inherit" />
    </Box>
  );
}
