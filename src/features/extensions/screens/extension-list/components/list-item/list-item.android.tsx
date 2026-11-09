import { Button, FilledTonalIconButton, Row } from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu, type MenuItem } from "@/components/ui/menu";
import {
  describeVersion,
  extensionOperations$,
  hasUpdate,
  installExtension,
  updateExtension,
} from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { themeMode$ } from "@/state/theme";
import { openExternal } from "@/utils/open-external";
import type { ListItemProps } from "./list-item";
import { uninstallItem } from "./utils/uninstall-item";

/**
 * One segmented row: its single action at the end (install tonal, update
 * filled), the rest in its context menu, which a tap opens too.
 */
export const ListItem = memo(function ListItem({
  extension: e,
  index = 0,
  count = 1,
}: ListItemProps) {
  const mode = useValue(themeMode$);
  const running = useValue(() => !!extensionOperations$[e.id].get());
  const m3 = useThemeM3Colors();
  const { websiteUrl } = e;
  const update = e.installed && hasUpdate(e);

  const menu: MenuItem[] = [
    ...(websiteUrl
      ? [
          {
            label: "Open website",
            icon: Icons.website,
            onPress: () => openExternal(websiteUrl),
          },
        ]
      : []),
    ...(e.installed
      ? [{ ...uninstallItem(e), icon: Icons.trash, disabled: running }]
      : []),
  ];

  const row = (
    <SegmentedListItem
      index={index}
      count={count}
      containerColor={m3.surfaceContainer}
    >
      <SegmentedListItem.Leading>
        <SourceTile
          initials={e.initials}
          iconUrl={e.iconUrl}
          color={sourceColor(e, mode)}
          loading={running}
        />
      </SegmentedListItem.Leading>
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
      <SegmentedListItem.Supporting>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          <Badge>{e.language.code.toUpperCase()}</Badge>
          {e.nsfw && <Badge color="destructive">18+</Badge>}
          <Badge>{describeVersion(e)}</Badge>
        </Row>
      </SegmentedListItem.Supporting>
      {!e.installed ? (
        <SegmentedListItem.Trailing>
          <FilledTonalIconButton
            enabled={!running}
            onClick={() => installExtension(e.id)}
            modifiers={[semantics({ contentDescription: `Install ${e.name}` })]}
          >
            <Icon name={Icons.download} color="inherit" />
          </FilledTonalIconButton>
        </SegmentedListItem.Trailing>
      ) : update ? (
        <SegmentedListItem.Trailing>
          <Button enabled={!running} onClick={() => updateExtension(e.id)}>
            <Text style={{ typography: "labelLarge" }}>Update</Text>
          </Button>
        </SegmentedListItem.Trailing>
      ) : null}
    </SegmentedListItem>
  );

  return menu.length > 0 ? <ContextMenu items={menu}>{row}</ContextMenu> : row;
});
