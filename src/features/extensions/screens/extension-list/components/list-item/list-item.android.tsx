import {
  FilledTonalIconButton,
  IconButton,
  ListItem as ListItemView,
  Row,
} from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/jetpack-compose/text";
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
import { sourceColor } from "@/features/manga/sources";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { theme$ } from "@/state/theme";
import { openExternal } from "@/utils/open-external";
import type { ListItemProps } from "./list-item";
import { uninstallItem } from "./utils/uninstall-item";

const label = (text: string) => [semantics({ contentDescription: text })];

interface ActionButtonProps {
  id: string;
  /** What this button starts: its icon turns into a loader while that runs. */
  operation: ExtensionOperation;
  icon: IconName;
  label: string;
  variant?: "standard" | "tonal" | "muted";
  /** The menu hands its trigger an `onPress` to open it. */
  onPress?: () => void;
}

/** Reads the operation itself so only this button re-renders; every action is off while one runs. */
function ActionButton({
  id,
  operation,
  icon,
  label: text,
  variant = "standard",
  onPress,
}: ActionButtonProps) {
  const current = useValue(extensionOperations$[id]);
  const m3 = useThemeM3Colors();
  const Button = variant === "tonal" ? FilledTonalIconButton : IconButton;

  return (
    <Button
      enabled={!current}
      onClick={onPress}
      colors={
        variant === "muted" ? { contentColor: m3.onSurfaceVariant } : undefined
      }
      modifiers={label(text)}
    >
      {current === operation ? (
        <Loader size="sm" />
      ) : (
        <Icon name={icon} size={BUTTON_ICON_SIZE} color="inherit" />
      )}
    </Button>
  );
}

export function ListItem({ extension: e }: ListItemProps) {
  const mode = useValue(theme$.mode);
  const { websiteUrl } = e;
  const m3 = useThemeM3Colors();

  return (
    <ListItemView colors={{ containerColor: "transparent" }}>
      <ListItemView.LeadingContent>
        <SourceTile
          initials={e.initials}
          iconUrl={e.iconUrl}
          color={sourceColor(e, mode)}
        />
      </ListItemView.LeadingContent>
      <ListItemView.HeadlineContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          <Text style={{ fontWeight: "500" }} maxLines={1} overflow="ellipsis">
            {e.name}
          </Text>
          {e.installed && (
            <Icon
              name={Icons.checkCircle}
              size={14}
              color={m3.primary}
              accessibilityLabel="Installed"
            />
          )}
        </Row>
      </ListItemView.HeadlineContent>
      <ListItemView.SupportingContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          <Badge>{e.language.code.toUpperCase()}</Badge>
          {e.nsfw && <Badge color="destructive">18+</Badge>}
          <Text
            style={{ typography: "bodyMedium" }}
            maxLines={1}
            overflow="ellipsis"
          >
            {`· ${describeVersion(e)}`}
          </Text>
        </Row>
      </ListItemView.SupportingContent>
      <ListItemView.TrailingContent>
        <Row verticalAlignment="center">
          {websiteUrl && (
            <IconButton
              onClick={() => openExternal(websiteUrl)}
              colors={{ contentColor: m3.onSurfaceVariant }}
              modifiers={label("Open website")}
            >
              <Icon
                name={Icons.website}
                size={BUTTON_ICON_SIZE}
                color="inherit"
              />
            </IconButton>
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
              variant="tonal"
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
        </Row>
      </ListItemView.TrailingContent>
    </ListItemView>
  );
}
