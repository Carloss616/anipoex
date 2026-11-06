import ArrowForward from "@expo/material-symbols/arrow_forward.xml";
import { IconButton, Row } from "@expo/ui/jetpack-compose";
import {
  defaultMinSize,
  padding,
  semantics,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/**
 * A page section's title, with the arrow button M3 asks of a carousel on a
 * vertically scrolling page when there's more to show.
 */
export function SectionHeader({
  title,
  onShowAll,
}: {
  title: string;
  onShowAll?: () => void;
}) {
  const m3 = useThemeM3Colors();

  return (
    <Row
      verticalAlignment="center"
      modifiers={[
        padding(GUTTER + 4, 20, 8, 8),
        defaultMinSize({ minHeight: 48 }),
      ]}
    >
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[weight(1)]}
      >
        {title}
      </Text>
      {onShowAll && (
        <IconButton
          onClick={onShowAll}
          colors={{ containerColor: m3.surfaceContainerHigh }}
          modifiers={[semantics({ contentDescription: `Show all ${title}` })]}
        >
          <Icon name={ArrowForward} color="inherit" />
        </IconButton>
      )}
    </Row>
  );
}
