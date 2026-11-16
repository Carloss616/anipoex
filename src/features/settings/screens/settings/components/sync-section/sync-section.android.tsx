import ScheduleIcon from "@expo/material-symbols/schedule.xml";
import {
  Box,
  Column,
  FilledTonalButton,
  IconButton,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  matchParentSize,
  offset,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { Image } from "@/components/native/jetpack-compose/image";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { ContextMenu, Menu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useRowProps } from "../../hooks/use-row-props";
import { Label } from "../label";
import { LeadingIcon } from "../leading-icon";
import { INTERVAL_HINT, SYNC_FOOTER, SYNC_INTERVAL_OPTIONS } from "./constants";
import { useSyncSection } from "./hooks/use-sync-section";
import { SyncHelp } from "./sync-help";

const FOLDER_DETAIL = "A folder a sync app keeps in your cloud";

/**
 * Android: segmented rows; the GitHub row's tap and long press open its
 * menu, and its trailing button syncs now.
 */
export function SyncSection() {
  const sync = useSyncSection();
  const { account, gist, folder } = sync;
  const m3 = useThemeM3Colors();
  const row = useRowProps();
  const devices = sync.connected ? sync.devices : [];
  const count = (sync.connected ? 3 : 2) + devices.length;

  return (
    <>
      {/* Bottom-aligned, the button's glyph sits 6dp above the label's text. */}
      <Row verticalAlignment="bottom">
        <Label>Sync</Label>
        <Box modifiers={[offset(0, 6)]}>
          <SyncHelp moments={sync.moments} />
        </Box>
      </Row>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        {account ? (
          <ContextMenu items={gist.menu}>
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
                  color={gist.failed ? m3.error : undefined}
                >
                  {gist.status}
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Box contentAlignment="center">
                  {gist.busy ? (
                    <Loader size="sm" />
                  ) : gist.revoked ? (
                    <FilledTonalButton onClick={sync.connect}>
                      <Text style={{ typography: "labelLarge" }}>
                        Reconnect
                      </Text>
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
        {folder?.name ? (
          <ContextMenu items={folder.menu}>
            <SegmentedListItem index={1} count={count} {...row}>
              <SegmentedListItem.Leading>
                <LeadingIcon name={Icons.folder} />
              </SegmentedListItem.Leading>
              <Text>{folder.name}</Text>
              <SegmentedListItem.Supporting>
                <Text
                  style={{ typography: "bodyMedium" }}
                  color={folder.failed ? m3.error : undefined}
                >
                  {folder.status}
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Box contentAlignment="center">
                  {folder.busy ? <Loader size="sm" /> : null}
                </Box>
              </SegmentedListItem.Trailing>
            </SegmentedListItem>
          </ContextMenu>
        ) : (
          <SegmentedListItem
            index={1}
            count={count}
            {...row}
            onPress={folder?.choose}
          >
            <SegmentedListItem.Leading>
              <LeadingIcon name={Icons.folder} />
            </SegmentedListItem.Leading>
            <Text>Folder</Text>
            <SegmentedListItem.Supporting>
              <Text style={{ typography: "bodyMedium" }}>{FOLDER_DETAIL}</Text>
            </SegmentedListItem.Supporting>
            <SegmentedListItem.Trailing>
              <FilledTonalButton onClick={folder?.choose}>
                <Text style={{ typography: "labelLarge" }}>Choose</Text>
              </FilledTonalButton>
            </SegmentedListItem.Trailing>
          </SegmentedListItem>
        )}
        {sync.connected ? (
          <Menu
            items={SYNC_INTERVAL_OPTIONS.map((option) => ({
              label: option.label,
              checked: option.minutes === sync.interval.minutes,
              onPress: () => sync.interval.set(option.minutes),
            }))}
          >
            <SegmentedListItem index={2} count={count} {...row}>
              <SegmentedListItem.Leading>
                <LeadingIcon name={ScheduleIcon} />
              </SegmentedListItem.Leading>
              <Text>Check for changes</Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  {INTERVAL_HINT}
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Row verticalAlignment="center">
                  <Text>
                    {SYNC_INTERVAL_OPTIONS.find(
                      (option) => option.minutes === sync.interval.minutes,
                    )?.label ?? `${sync.interval.minutes} min`}
                  </Text>
                  <Icon name={Icons.chevronDown} color="inherit" />
                </Row>
              </SegmentedListItem.Trailing>
            </SegmentedListItem>
          </Menu>
        ) : null}
        {devices.map((device, i) => (
          <SegmentedListItem
            key={device.id}
            index={i + 3}
            count={count}
            {...row}
          >
            <SegmentedListItem.Leading>
              <LeadingIcon name={device.icon} />
            </SegmentedListItem.Leading>
            <Text>{device.title}</Text>
            {device.detail ? (
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  {device.detail}
                </Text>
              </SegmentedListItem.Supporting>
            ) : null}
          </SegmentedListItem>
        ))}
      </Column>
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
