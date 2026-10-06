import { useValue } from "@legendapp/state/react";
import { Platform } from "expo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { Icon } from "@/components/ui/icon";
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
import { theme$ } from "@/state/theme";

const MORE = Icon.select({
  ios: "ellipsis",
  android: require("@expo/material-symbols/more_vert.xml"),
  web: "ellipsis-vertical",
});

export function ExtensionRow({ extension: e }: { extension: Extension }) {
  const mode = useValue(theme$.mode);

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
          {e.nsfw ? `${e.name} · 18+` : e.name}
        </Item.Title>
        <Item.Description numberOfLines={1}>
          {`${e.language} · ${describeVersion(e)}`}
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        {!e.installed ? (
          <Button
            size="sm"
            variant="outline"
            onPress={() => installExtension(e.id)}
          >
            Install
          </Button>
        ) : hasUpdate(e) ? (
          <Button size="sm" onPress={() => updateExtension(e.id)}>
            Update
          </Button>
        ) : (
          <Badge>Installed</Badge>
        )}
        {/* iOS uninstalls from the row's swipe action instead. */}
        {e.installed && Platform.OS !== "ios" && (
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
            <CloseButton
              variant={Platform.OS === "android" ? "ghost" : "secondary"}
              accessibilityLabel={`More actions for ${e.name}`}
            >
              <Icon name={MORE} size={16} muted />
            </CloseButton>
          </Menu>
        )}
      </Item.Actions>
    </Item>
  );
}
