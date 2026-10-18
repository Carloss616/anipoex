import { useValue } from "@legendapp/state/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import {
  describeVersion,
  type Extension,
  hasUpdate,
  installExtension,
  updateExtension,
} from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/sources";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import { uninstallItem } from "./uninstall-item";

export interface ListItemProps {
  extension: Extension;
}

export function ListItem({ extension: e }: ListItemProps) {
  const mode = useValue(theme$.mode);
  const primary = useThemeColor("primary");

  return (
    <Item className="px-0">
      <SourceTile initials={e.initials} color={sourceColor(e, mode)} />
      <Item.Content>
        <Item.Title numberOfLines={1}>
          {e.name}
          {e.nsfw && (
            <Badge color="destructive" className="ml-1.5">
              18+
            </Badge>
          )}
          {e.installed && (
            <Icon
              name={Icons.checkCircle}
              size={14}
              color={primary}
              className="ml-1.5"
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
            variant="outline"
            className="size-9"
            onPress={() => installExtension(e.id)}
            accessibilityLabel={`Install ${e.name}`}
          >
            <Icon
              name={Icons.download}
              size={BUTTON_ICON_SIZE}
              className="text-primary"
            />
          </Button>
        ) : hasUpdate(e) ? (
          <Button
            size="icon"
            variant="primary"
            className="size-9"
            onPress={() => updateExtension(e.id)}
            accessibilityLabel={`Update ${e.name}`}
          >
            <Icon
              name={Icons.update}
              size={BUTTON_ICON_SIZE}
              className="text-primary-foreground"
            />
          </Button>
        ) : null}
        {e.installed && (
          <Menu items={[uninstallItem(e)]}>
            <Button
              size="icon"
              variant="outline"
              className="size-9"
              muted
              accessibilityLabel={`More actions for ${e.name}`}
            >
              <Icon
                name={Icons.more}
                size={BUTTON_ICON_SIZE}
                className="text-foreground"
              />
            </Button>
          </Menu>
        )}
      </Item.Actions>
    </Item>
  );
}
