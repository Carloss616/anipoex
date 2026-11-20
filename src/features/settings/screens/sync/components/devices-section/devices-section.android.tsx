import { Column } from "@expo/ui/jetpack-compose";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { ContextMenu } from "@/components/ui/menu";
import { Label } from "@/features/settings/components/label";
import { LeadingIcon } from "@/features/settings/components/leading-icon";
import { useRowProps } from "@/features/settings/hooks/use-row-props";
import { useSyncDevices } from "../../hooks/use-sync-devices";

export function DevicesSection() {
  const devices = useSyncDevices();
  const row = useRowProps();
  if (!devices.length) return null;

  return (
    <>
      <Label>Devices</Label>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        {devices.map((device, i) => {
          const item = (
            <SegmentedListItem
              key={device.id}
              index={i}
              count={devices.length}
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
              {/* Rows key by id, so the current one never gains this slot later. */}
              {device.current ? (
                <SegmentedListItem.Trailing>
                  <Badge color="primary">This device</Badge>
                </SegmentedListItem.Trailing>
              ) : null}
            </SegmentedListItem>
          );
          return device.menu ? (
            <ContextMenu key={device.id} items={device.menu}>
              {item}
            </ContextMenu>
          ) : (
            item
          );
        })}
      </Column>
    </>
  );
}
