import { Button, HStack, Label, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  foregroundStyle,
  frame,
  labelStyle,
  lineLimit,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import {
  describeVersion,
  hasUpdate,
  installExtension,
  updateExtension,
} from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/sources";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import type { ListItemProps } from "./list-item";
import { uninstallItem } from "./utils/uninstall-item";

const ICON_BUTTON = [
  buttonBorderShape("circle"),
  labelStyle("iconOnly"),
] as const;

/** A `List` row: it already insets its content, so this draws none of its own. */
export function ListItem({ extension: e }: ListItemProps) {
  const mode = useValue(theme$.mode);
  const primary = useThemeColor("primary");

  return (
    <HStack>
      <Label
        icon={
          <SourceTile
            initials={e.initials}
            iconUrl={e.iconUrl}
            color={sourceColor(e, mode)}
          />
        }
      >
        <VStack alignment="leading" spacing={2}>
          <HStack spacing={6}>
            <Text weight="medium" modifiers={[lineLimit(1)]}>
              {e.name}
            </Text>
            {e.installed && (
              <Icon
                name={Icons.checkCircle}
                size={14}
                color={primary}
                modifiers={[accessibilityLabel("Installed")]}
              />
            )}
          </HStack>
          <HStack spacing={6}>
            <Badge>{e.language.code.toUpperCase()}</Badge>
            {e.nsfw && <Badge color="destructive">18+</Badge>}
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
            >
              {`· ${describeVersion(e)}`}
            </Text>
          </HStack>
        </VStack>
      </Label>
      <Spacer />
      <HStack spacing={6}>
        {!e.installed ? (
          <Button
            onPress={() => installExtension(e.id)}
            modifiers={[
              buttonStyle("glass"),
              ...ICON_BUTTON,
              accessibilityLabel(`Install ${e.name}`),
            ]}
          >
            <Icon
              name={Icons.download}
              size={BUTTON_ICON_SIZE}
              color="inherit"
            />
          </Button>
        ) : hasUpdate(e) ? (
          <Button
            onPress={() => updateExtension(e.id)}
            modifiers={[
              buttonStyle("glassProminent"),
              ...ICON_BUTTON,
              accessibilityLabel(`Update ${e.name}`),
            ]}
          >
            <Icon name={Icons.update} size={BUTTON_ICON_SIZE} color="inherit" />
          </Button>
        ) : null}
        {e.installed && (
          <Menu items={[uninstallItem(e)]}>
            <Button
              modifiers={[
                buttonStyle("glass"),
                ...ICON_BUTTON,
                foregroundStyle("secondary"),
                accessibilityLabel(`More actions for ${e.name}`),
              ]}
            >
              <Icon
                name={Icons.more}
                size={BUTTON_ICON_SIZE}
                color="inherit"
                modifiers={[frame({ width: 20, height: 20 })]}
              />
            </Button>
          </Menu>
        )}
      </HStack>
    </HStack>
  );
}
