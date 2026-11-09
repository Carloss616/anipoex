import {
  Button,
  HStack,
  Label,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { memo, useState } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu, type MenuAction } from "@/components/ui/menu";
import {
  describeVersion,
  extensionOperations$,
  hasUpdate,
  installExtension,
  uninstallExtension,
  updateExtension,
} from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeColor } from "@/hooks/use-theme-color";
import { themeMode$ } from "@/state/theme";
import { openExternal } from "@/utils/open-external";
import type { ListItemProps } from "./list-item";
import { uninstallDialog } from "./utils/uninstall-item";

/** The row's one action: Install as text, Update as a pill; off while an operation runs (the tile shows it). */
function RowAction({ extension: e }: ListItemProps) {
  const running = useValue(() => !!extensionOperations$[e.id].get());
  const font = useFont("subheadline", "semibold");

  if (e.installed && !hasUpdate(e)) return null;

  const update = e.installed;
  return (
    <Button
      label={update ? "Update" : "Install"}
      onPress={() => (update ? updateExtension : installExtension)(e.id)}
      modifiers={[
        // Install as text, so the rarer Update pill stands out down the list.
        buttonStyle(update ? "glassProminent" : "borderless"),
        buttonBorderShape("capsule"),
        controlSize("small"),
        font,
        disabled(running),
        accessibilityLabel(`${update ? "Update" : "Install"} ${e.name}`),
      ]}
    />
  );
}

/**
 * A `List` row: the pill installs or updates, long-press lists every action,
 * swipe uninstalls or opens the website.
 */
export const ListItem = memo(function ListItem({
  extension: e,
}: ListItemProps) {
  const mode = useValue(themeMode$);
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
  const [uninstalling, setUninstalling] = useState(false);
  const { websiteUrl } = e;
  const busy = () => !!extensionOperations$[e.id].get();
  const running = useValue(busy);
  // Uninstall confirms in the row's alert, which the swipe opens too.
  const menu: MenuAction[] = [
    ...(!e.installed || hasUpdate(e)
      ? [
          {
            label: e.installed ? "Update" : "Install",
            icon: e.installed ? Icons.update : Icons.download,
            disabled: running,
            onPress: () =>
              (e.installed ? updateExtension : installExtension)(e.id),
          },
        ]
      : []),
    ...(websiteUrl
      ? [
          {
            label: "Website",
            icon: Icons.website,
            onPress: () => openExternal(websiteUrl),
          },
        ]
      : []),
    ...(e.installed
      ? [
          {
            label: "Uninstall",
            icon: Icons.trash,
            destructive: true,
            disabled: running,
            onPress: () => setUninstalling(true),
          },
        ]
      : []),
  ];

  const row = (
    <HStack modifiers={ROW_FILL}>
      <Label
        icon={
          <SourceTile
            initials={e.initials}
            iconUrl={e.iconUrl}
            color={sourceColor(e, mode)}
            loading={running}
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
            <Badge>{describeVersion(e)}</Badge>
          </HStack>
        </VStack>
      </Label>
      <Spacer />
      <RowAction extension={e} />
    </HStack>
  );

  const website = websiteUrl && (
    <Button
      label="Website"
      systemImage="safari"
      onPress={() => openExternal(websiteUrl)}
    />
  );

  return (
    <SwipeActions>
      <ContextMenu items={menu}>
        {e.installed ? (
          // The alert hangs off the row content: a swipe or menu row only
          // opens it.
          <Dialog
            {...uninstallDialog(e)}
            alert
            role="destructive"
            open={uninstalling}
            onOpenChange={setUninstalling}
            onConfirm={() => uninstallExtension(e.id)}
          >
            <Dialog.Trigger>{row}</Dialog.Trigger>
          </Dialog>
        ) : (
          row
        )}
      </ContextMenu>
      {e.installed && (
        // Uninstall on the leading edge, apart from the rest, as Exclude on
        // source rows.
        <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
          <Computed>
            {() => (
              <Button
                label="Uninstall"
                systemImage="trash"
                // No destructive role: SwiftUI would delete the row before
                // the alert confirms.
                modifiers={[tint(destructive), disabled(busy())]}
                onPress={() => setUninstalling(true)}
              />
            )}
          </Computed>
        </SwipeActions.Actions>
      )}
      {website && (
        <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
          {website}
        </SwipeActions.Actions>
      )}
    </SwipeActions>
  );
});
