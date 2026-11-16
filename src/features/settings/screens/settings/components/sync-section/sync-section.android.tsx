import FolderIcon from "@expo/material-symbols/folder.xml";
import { Box, FilledTonalButton, IconButton } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  matchParentSize,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { Image } from "@/components/native/jetpack-compose/image";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { ContextMenu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useRowProps } from "../../hooks/use-row-props";
import { Label } from "../label";
import { LeadingIcon } from "../leading-icon";
import { SYNC_FOOTER } from "./constants";
import { useSyncSection } from "./hooks/use-sync-section";

const FOLDER_DETAIL = "A folder FolderSync keeps in OneDrive";

/**
 * Android: segmented rows; the GitHub row's tap and long press open its
 * menu, and its trailing button syncs now.
 */
export function SyncSection() {
  const sync = useSyncSection();
  const { account } = sync;
  const m3 = useThemeM3Colors();
  const row = useRowProps();
  const count = (account ? 1 + sync.devices.length : 1) + 1;

  return (
    <>
      <Label>Sync</Label>
      {account ? (
        <ContextMenu items={sync.menu}>
          <SegmentedListItem index={0} count={count} {...row}>
            <SegmentedListItem.Leading>
              <Box
                modifiers={[
                  size(40, 40),
                  clip(Shapes.Circle),
                  background(m3.primaryContainer),
                ]}
              >
                <Image
                  source={{ uri: account.avatarUrl }}
                  modifiers={[matchParentSize()]}
                />
              </Box>
            </SegmentedListItem.Leading>
            <Text>{account.login}</Text>
            <SegmentedListItem.Supporting>
              <Text
                style={{ typography: "bodyMedium" }}
                color={sync.failed ? m3.error : undefined}
              >
                {sync.status}
              </Text>
            </SegmentedListItem.Supporting>
            <SegmentedListItem.Trailing>
              <Box contentAlignment="center">
                {sync.syncing ? (
                  <Loader size="sm" />
                ) : sync.revoked ? (
                  <FilledTonalButton onClick={sync.connect}>
                    <Text style={{ typography: "labelLarge" }}>Reconnect</Text>
                  </FilledTonalButton>
                ) : (
                  <IconButton onClick={sync.syncNow}>
                    <Icon
                      name={Icons.refresh}
                      accessibilityLabel="Sync now"
                      color="inherit"
                    />
                  </IconButton>
                )}
              </Box>
            </SegmentedListItem.Trailing>
          </SegmentedListItem>
        </ContextMenu>
      ) : (
        <SegmentedListItem
          index={0}
          count={count}
          {...row}
          onPress={sync.connect}
        >
          <SegmentedListItem.Leading>
            <LeadingIcon name={Icons.update} />
          </SegmentedListItem.Leading>
          <Text>GitHub</Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>Not connected</Text>
          </SegmentedListItem.Supporting>
          <SegmentedListItem.Trailing>
            <FilledTonalButton onClick={sync.connect}>
              <Text style={{ typography: "labelLarge" }}>Connect</Text>
            </FilledTonalButton>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      )}
      {account
        ? sync.devices.map((device, i) => (
            <SegmentedListItem
              key={device.id}
              index={i + 1}
              count={count}
              {...row}
            >
              <Text>{device.title}</Text>
              {device.detail ? (
                <SegmentedListItem.Supporting>
                  <Text style={{ typography: "bodyMedium" }}>
                    {device.detail}
                  </Text>
                </SegmentedListItem.Supporting>
              ) : null}
            </SegmentedListItem>
          ))
        : null}
      <SegmentedListItem index={count - 1} count={count} {...row}>
        <SegmentedListItem.Leading>
          <LeadingIcon name={FolderIcon} />
        </SegmentedListItem.Leading>
        <Text>Folder</Text>
        <SegmentedListItem.Supporting>
          <Text style={{ typography: "bodyMedium" }}>{FOLDER_DETAIL}</Text>
        </SegmentedListItem.Supporting>
        <SegmentedListItem.Trailing>
          <Text>Soon</Text>
        </SegmentedListItem.Trailing>
      </SegmentedListItem>
      <Text
        style={{ typography: "bodySmall" }}
        color={m3.onSurfaceVariant}
        modifiers={[padding(16, 8, 16, 0)]}
      >
        {SYNC_FOOTER}
      </Text>
    </>
  );
}
