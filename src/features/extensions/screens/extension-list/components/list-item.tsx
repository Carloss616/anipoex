import { useValue } from "@legendapp/state/react";
import { Platform } from "expo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { Typography } from "@/components/ui/typography";
import {
  describeVersion,
  type Extension,
  hasUpdate,
  installExtension,
  uninstallExtension,
  updateExtension,
} from "@/features/extensions";
import { sourceColor } from "@/features/manga/sources";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";

const INSTALL = Icon.select({
  ios: "arrow.down",
  android: require("@expo/material-symbols/download.xml"),
  web: "download",
});

const UPDATE = Icon.select({
  ios: "arrow.clockwise",
  android: require("@expo/material-symbols/deployed_code_update.xml"),
  web: "refresh-cw",
});

const INSTALLED = Icon.select({
  ios: "checkmark.circle",
  android: require("@expo/material-symbols/check_circle.xml"),
  web: "circle-check",
});

const MORE = Icon.select({
  ios: "ellipsis",
  android: require("@expo/material-symbols/more_vert.xml"),
  web: "ellipsis-vertical",
});

export function ListItem({ extension: e }: { extension: Extension }) {
  const mode = useValue(theme$.mode);
  const primary = useThemeColor("primary");
  const m3 = useThemeM3Colors();

  return (
    // The iOS List row already insets its content; Android's ListItem owns its padding.
    <Item className="ios:p-0 web:px-0">
      <Item.Media
        variant="icon"
        style={{ backgroundColor: sourceColor(e, mode) }}
      >
        <Typography type="body-xs" weight="semibold">
          {e.initials}
        </Typography>
      </Item.Media>
      <Item.Content>
        <Item.Title numberOfLines={1}>
          {e.name}
          {e.nsfw && (
            <Badge color="destructive" className="web:ml-1.5">
              18+
            </Badge>
          )}
          {e.installed && (
            <Icon
              name={INSTALLED}
              size={14}
              color={m3?.primary ?? primary}
              className="web:ml-1.5"
              accessibilityLabel="Installed"
            />
          )}
        </Item.Title>
        <Item.Description numberOfLines={1}>
          <Badge>{e.language.code.toUpperCase()}</Badge>
          {` · ${describeVersion(e)}`}
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        {!e.installed ? (
          <Button
            size="icon"
            variant={Platform.OS === "android" ? "ghost" : "outline"}
            className="web:size-9"
            onPress={() => installExtension(e.id)}
            accessibilityLabel={`Install ${e.name}`}
          >
            <Icon
              name={INSTALL}
              size={BUTTON_ICON_SIZE}
              className="text-inherit web:text-primary"
            />
          </Button>
        ) : hasUpdate(e) ? (
          <Button
            size="icon"
            variant={Platform.OS === "android" ? "secondary" : "primary"}
            className="web:size-9"
            onPress={() => updateExtension(e.id)}
            accessibilityLabel={`Update ${e.name}`}
          >
            <Icon
              name={UPDATE}
              size={BUTTON_ICON_SIZE}
              className="text-inherit web:text-primary-foreground"
            />
          </Button>
        ) : null}
        {e.installed && (
          <Menu
            items={[
              {
                label: "Uninstall",
                destructive: true,
                onPress: () => uninstallExtension(e.id),
                onPressMode: "dialog",
                dialogConfig: {
                  title: `Uninstall ${e.name}?`,
                  description: "You can install it again from Available.",
                  confirmLabel: "Uninstall",
                },
              },
            ]}
          >
            <Button
              size="icon"
              variant={Platform.OS === "android" ? "ghost" : "outline"}
              className="ios:size-5 web:size-9"
              muted
              accessibilityLabel={`More actions for ${e.name}`}
            >
              <Icon
                name={MORE}
                size={BUTTON_ICON_SIZE}
                className="text-inherit web:text-foreground"
              />
            </Button>
          </Menu>
        )}
      </Item.Actions>
    </Item>
  );
}
