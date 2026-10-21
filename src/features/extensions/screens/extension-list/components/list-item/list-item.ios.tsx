import {
  Button,
  ContextMenu,
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
  foregroundStyle,
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
import { Loader } from "@/components/ui/loader";
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
import { theme$ } from "@/state/theme";
import { openExternal } from "@/utils/open-external";
import type { ListItemProps } from "./list-item";
import { uninstallDialog } from "./utils/uninstall-item";

/** The row's one action, App Store style: a pill that turns into a loader while any operation runs. */
function RowAction({ extension: e }: ListItemProps) {
  const running = useValue(() => !!extensionOperations$[e.id].get());
  const font = useFont("subheadline", "semibold");

  if (running) return <Loader size="sm" />;
  if (e.installed && !hasUpdate(e)) return null;

  const update = e.installed;
  return (
    <Button
      label={update ? "Update" : "Install"}
      onPress={() => (update ? updateExtension : installExtension)(e.id)}
      modifiers={[
        buttonStyle(update ? "glassProminent" : "glass"),
        buttonBorderShape("capsule"),
        controlSize("small"),
        font,
        accessibilityLabel(`${update ? "Update" : "Install"} ${e.name}`),
      ]}
    />
  );
}

/** A `List` row: the pill installs or updates, long-press lists every action, swipe uninstalls or opens the website. */
export const ListItem = memo(function ListItem({
  extension: e,
}: ListItemProps) {
  const mode = useValue(theme$.mode);
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
  const [uninstalling, setUninstalling] = useState(false);
  const { websiteUrl } = e;
  const busy = () => !!extensionOperations$[e.id].get();

  const row = (
    <HStack modifiers={ROW_FILL}>
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
      <ContextMenu>
        <ContextMenu.Items>
          {(!e.installed || hasUpdate(e)) && (
            <Computed>
              {() => (
                <Button
                  label={e.installed ? "Update" : "Install"}
                  systemImage={
                    e.installed ? "arrow.clockwise" : "arrow.down.circle"
                  }
                  modifiers={[disabled(busy())]}
                  onPress={() =>
                    (e.installed ? updateExtension : installExtension)(e.id)
                  }
                />
              )}
            </Computed>
          )}
          {website}
          {e.installed && (
            <Computed>
              {() => (
                <Button
                  label="Uninstall"
                  systemImage="trash"
                  role="destructive"
                  modifiers={[disabled(busy())]}
                  onPress={() => setUninstalling(true)}
                />
              )}
            </Computed>
          )}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          {e.installed ? (
            // The alert hangs off the row content: a swipe or menu row only opens it.
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
        </ContextMenu.Trigger>
      </ContextMenu>
      {(e.installed || website) && (
        <SwipeActions.Actions allowsFullSwipe={false}>
          {e.installed && (
            <Computed>
              {() => (
                <Button
                  label="Uninstall"
                  systemImage="trash"
                  // No destructive role: SwiftUI would delete the row before the alert confirms.
                  modifiers={[tint(destructive), disabled(busy())]}
                  onPress={() => setUninstalling(true)}
                />
              )}
            </Computed>
          )}
          {website}
        </SwipeActions.Actions>
      )}
    </SwipeActions>
  );
});
