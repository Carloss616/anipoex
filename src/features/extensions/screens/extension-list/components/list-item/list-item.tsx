import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { type ComponentProps, memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import {
  describeVersion,
  type Extension,
  extensionOperations$,
  hasUpdate,
  installExtension,
  updateExtension,
} from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeColor } from "@/hooks/use-theme-color";
import { themeMode$ } from "@/state/theme";
import { openExternal } from "@/utils/open-external";
import { uninstallItem } from "./utils/uninstall-item";

export interface ListItemProps {
  extension: Extension;
  /**
   * Its place in its section, for the group's rounded ends.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

type ActionButtonProps = Omit<ComponentProps<typeof Button>, "size"> & {
  id: string;
  icon: IconName;
};

/**
 * Reads the operation itself so only this button re-renders; every action
 * is off while one runs, which the tile shows. Spreads the rest so a menu
 * trigger keeps its props and ref.
 */
function ActionButton({ id, icon, variant, ...props }: ActionButtonProps) {
  const running = useValue(() => !!extensionOperations$[id].get());

  return (
    <Button size="icon" variant={variant} {...props} disabled={running}>
      <Icon name={icon} />
    </Button>
  );
}

export const ListItem = memo(function ListItem({
  extension: e,
}: ListItemProps) {
  const mode = useValue(themeMode$);
  const running = useValue(() => !!extensionOperations$[e.id].get());
  const { websiteUrl } = e;
  const primary = useThemeColor("primary");

  return (
    <Frame.Row>
      <Frame.Media>
        <SourceTile
          initials={e.initials}
          iconUrl={e.iconUrl}
          color={sourceColor(e, mode)}
          loading={running}
        />
      </Frame.Media>
      <Frame.Content>
        {/* Beside the title, not in it: a <p> can't hold the icon's <div>. */}
        <View className="flex-row items-center gap-1.5">
          <Frame.Title as="p">{e.name}</Frame.Title>
          {e.installed && (
            <Icon
              name={Icons.checkCircle}
              size={14}
              color={primary}
              accessibilityLabel="Installed"
            />
          )}
        </View>
        <Frame.Description>
          <Badge>{e.language.code.toUpperCase()}</Badge>{" "}
          {e.nsfw && <Badge color="destructive">18+</Badge>}{" "}
          <Badge>{describeVersion(e)}</Badge>
        </Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        {websiteUrl && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openExternal(websiteUrl)}
            aria-label="Open website"
          >
            <Icon name={Icons.website} />
          </Button>
        )}
        {!e.installed ? (
          <ActionButton
            id={e.id}
            icon={Icons.download}
            variant="ghost"
            onClick={() => installExtension(e.id)}
            aria-label={`Install ${e.name}`}
          />
        ) : hasUpdate(e) ? (
          <ActionButton
            id={e.id}
            icon={Icons.update}
            onClick={() => updateExtension(e.id)}
            aria-label={`Update ${e.name}`}
          />
        ) : null}
        {e.installed && (
          <Menu items={[uninstallItem(e)]}>
            <ActionButton
              id={e.id}
              icon={Icons.more}
              variant="ghost"
              aria-label={`More actions for ${e.name}`}
            />
          </Menu>
        )}
      </Frame.Actions>
    </Frame.Row>
  );
});
