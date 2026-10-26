import { useValue } from "@legendapp/state/react";
import { type ComponentProps, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BUTTON_ICON_SIZE,
  Icon,
  type IconName,
  Icons,
} from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import {
  describeVersion,
  type Extension,
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
import { uninstallItem } from "./utils/uninstall-item";

export interface ListItemProps {
  extension: Extension;
}

type ActionButtonProps = Omit<
  Extract<ComponentProps<typeof Button>, { size: "icon" }>,
  "size" | "loading"
> & {
  id: string;
  /** What this button starts: its icon turns into a loader while that runs. */
  operation: ExtensionOperation;
  icon: IconName;
  iconClassName: string;
};

/** Reads the operation itself so only this button re-renders; every action is off while one runs. Spreads the rest so a menu trigger keeps its props and ref. */
function ActionButton({
  id,
  operation,
  icon,
  iconClassName,
  variant = "outline",
  ...props
}: ActionButtonProps) {
  const current = useValue(extensionOperations$[id]);
  const loading = current === operation;

  return (
    <Button
      size="icon"
      variant={variant}
      className="size-9"
      {...props}
      disabled={!!current}
      loading={loading}
    >
      {!loading && (
        <Icon name={icon} size={BUTTON_ICON_SIZE} className={iconClassName} />
      )}
    </Button>
  );
}

export const ListItem = memo(function ListItem({
  extension: e,
}: ListItemProps) {
  const mode = useValue(theme$.mode);
  const { websiteUrl } = e;
  const primary = useThemeColor("primary");

  return (
    <Item className="px-0">
      <SourceTile
        initials={e.initials}
        iconUrl={e.iconUrl}
        color={sourceColor(e, mode)}
      />
      <Item.Content>
        <Item.Title numberOfLines={1}>
          {e.name}
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
          {e.nsfw && (
            <Badge color="destructive" className="ml-1.5">
              18+
            </Badge>
          )}
          {` · ${describeVersion(e)}`}
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        {websiteUrl && (
          <Button
            size="icon"
            variant="outline"
            className="size-9"
            onPress={() => openExternal(websiteUrl)}
            accessibilityLabel="Open website"
          >
            <Icon
              name={Icons.website}
              size={BUTTON_ICON_SIZE}
              className="text-foreground"
            />
          </Button>
        )}
        {!e.installed ? (
          <ActionButton
            id={e.id}
            operation="installing"
            icon={Icons.download}
            iconClassName="text-primary"
            onPress={() => installExtension(e.id)}
            accessibilityLabel={`Install ${e.name}`}
          />
        ) : hasUpdate(e) ? (
          <ActionButton
            id={e.id}
            operation="updating"
            icon={Icons.update}
            iconClassName="text-primary-foreground"
            variant="primary"
            onPress={() => updateExtension(e.id)}
            accessibilityLabel={`Update ${e.name}`}
          />
        ) : null}
        {e.installed && (
          <Menu items={[uninstallItem(e)]}>
            <ActionButton
              id={e.id}
              operation="uninstalling"
              icon={Icons.more}
              iconClassName="text-foreground"
              accessibilityLabel={`More actions for ${e.name}`}
            />
          </Menu>
        )}
      </Item.Actions>
    </Item>
  );
});
