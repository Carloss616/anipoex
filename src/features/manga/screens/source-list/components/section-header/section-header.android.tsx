import { IconButton, Row, Spacer } from "@expo/ui/jetpack-compose";
import { padding, semantics, weight } from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { SectionHeaderProps } from "./section-header";

/** The menu hands its trigger an `onPress` to open it. */
function MoreButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <IconButton
      onClick={onPress}
      modifiers={[semantics({ contentDescription: label })]}
    >
      <Icon name={Icons.more} size={BUTTON_ICON_SIZE} color="inherit" />
    </IconButton>
  );
}

export function SectionHeader({ title, count, menu }: SectionHeaderProps) {
  const m3 = useThemeM3Colors();
  return (
    <Row
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
      // The icon button brings its own padding to the end edge.
      modifiers={[padding(GUTTER, 8, menu ? 4 : GUTTER, 8)]}
    >
      <Text style={{ typography: "titleSmall" }} color={m3.primary}>
        {title}
      </Text>
      <Badge>{count}</Badge>
      {menu && (
        <>
          <Spacer modifiers={[weight(1)]} />
          <Computed>
            {() => (
              <Menu items={menu()}>
                <MoreButton label={`${title} sources actions`} />
              </Menu>
            )}
          </Computed>
        </>
      )}
    </Row>
  );
}
