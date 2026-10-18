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
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { theme$ } from "@/state/theme";
import type { ListItemProps } from "./list-item";
import { uninstallItem } from "./utils/uninstall-item";

const label = (text: string) => [semantics({ contentDescription: text })];

/** The menu hands its trigger an `onPress` to open it. */
function MoreButton({ name, onPress }: { name: string; onPress?: () => void }) {
  const m3 = useThemeM3Colors();

  return (
    <IconButton
      onClick={onPress}
      colors={{ contentColor: m3.onSurfaceVariant }}
      modifiers={label(`More actions for ${name}`)}
    >
      <Icon name={Icons.more} size={BUTTON_ICON_SIZE} color="inherit" />
    </IconButton>
  );
}

export function ListItem({ extension: e }: ListItemProps) {
  const mode = useValue(theme$.mode);
  const m3 = useThemeM3Colors();

  return (
    <ListItemView colors={{ containerColor: "transparent" }}>
      <ListItemView.LeadingContent>
        <SourceTile initials={e.initials} color={sourceColor(e, mode)} />
      </ListItemView.LeadingContent>
      <ListItemView.HeadlineContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          <Text style={{ fontWeight: "500" }} maxLines={1} overflow="ellipsis">
            {e.name}
          </Text>
          {e.nsfw && <Badge color="destructive">18+</Badge>}
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
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          {!e.installed ? (
            <IconButton
              onClick={() => installExtension(e.id)}
              modifiers={label(`Install ${e.name}`)}
            >
              <Icon
                name={Icons.download}
                size={BUTTON_ICON_SIZE}
                color="inherit"
              />
            </IconButton>
          ) : hasUpdate(e) ? (
            <FilledTonalIconButton
              onClick={() => updateExtension(e.id)}
              modifiers={label(`Update ${e.name}`)}
            >
              <Icon
                name={Icons.update}
                size={BUTTON_ICON_SIZE}
                color="inherit"
              />
            </FilledTonalIconButton>
          ) : null}
          {e.installed && (
            <Menu items={[uninstallItem(e)]}>
              <MoreButton name={e.name} />
            </Menu>
          )}
        </Row>
      </ListItemView.TrailingContent>
    </ListItemView>
  );
}
