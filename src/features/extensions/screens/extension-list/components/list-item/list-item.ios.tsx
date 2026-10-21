import { Button, HStack, Label, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  disabled,
  foregroundStyle,
  frame,
  labelStyle,
  lineLimit,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import {
  BUTTON_ICON_SIZE,
  Icon,
  type IconName,
  Icons,
} from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import {
  describeVersion,
  type ExtensionOperation,
  extensionOperations$,
  hasUpdate,
  installExtension,
  updateExtension,
} from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import { openExternal } from "@/utils/open-external";
import type { ListItemProps } from "./list-item";
import { uninstallItem } from "./utils/uninstall-item";

const ICON_BUTTON = [
  buttonBorderShape("circle"),
  labelStyle("iconOnly"),
] as const;

interface ActionButtonProps {
  id: string;
  /** What this button starts: its icon turns into a loader while that runs. */
  operation: ExtensionOperation;
  icon: IconName;
  label: string;
  variant?: "standard" | "prominent" | "muted";
  onPress?: () => void;
}

/** Reads the operation itself so only this button re-renders; every action is off while one runs. */
function ActionButton({
  id,
  operation,
  icon,
  label,
  variant = "standard",
  onPress,
}: ActionButtonProps) {
  const current = useValue(extensionOperations$[id]);

  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle(variant === "prominent" ? "glassProminent" : "glass"),
        ...ICON_BUTTON,
        ...(variant === "muted" ? [foregroundStyle("secondary")] : []),
        accessibilityLabel(label),
        disabled(!!current),
      ]}
    >
      {current === operation ? (
        <Loader size="sm" />
      ) : (
        <Icon
          name={icon}
          size={BUTTON_ICON_SIZE}
          color="inherit"
          // The narrow ⋮ glyph needs a square frame to keep the button round.
          modifiers={
            icon === Icons.more ? [frame({ width: 20, height: 20 })] : undefined
          }
        />
      )}
    </Button>
  );
}

/** A `List` row: it already insets its content, so this draws none of its own. */
export const ListItem = memo(function ListItem({
  extension: e,
}: ListItemProps) {
  const mode = useValue(theme$.mode);
  const { websiteUrl } = e;
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
      <HStack>
        {websiteUrl && (
          <Button
            onPress={() => openExternal(websiteUrl)}
            modifiers={[
              buttonStyle("glass"),
              ...ICON_BUTTON,
              foregroundStyle("secondary"),
              accessibilityLabel("Open website"),
            ]}
          >
            <Icon
              name={Icons.website}
              size={BUTTON_ICON_SIZE}
              color="inherit"
            />
          </Button>
        )}
        {!e.installed ? (
          <ActionButton
            id={e.id}
            operation="installing"
            icon={Icons.download}
            label={`Install ${e.name}`}
            onPress={() => installExtension(e.id)}
          />
        ) : hasUpdate(e) ? (
          <ActionButton
            id={e.id}
            operation="updating"
            icon={Icons.update}
            label={`Update ${e.name}`}
            variant="prominent"
            onPress={() => updateExtension(e.id)}
          />
        ) : null}
        {e.installed && (
          <Menu items={[uninstallItem(e)]}>
            <ActionButton
              id={e.id}
              operation="uninstalling"
              icon={Icons.more}
              label={`More actions for ${e.name}`}
              variant="muted"
            />
          </Menu>
        )}
      </HStack>
    </HStack>
  );
});
