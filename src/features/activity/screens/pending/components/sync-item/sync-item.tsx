import { router } from "expo-router";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { Icon } from "@/components/ui/icon";
import type { TargetKey } from "@/features/sync/state/engine";
import { TARGETS } from "./constants";
import { useSyncItem } from "./hooks/use-sync-item";

export interface SyncItemProps {
  id: TargetKey;
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** A sync target and what it still has to send. */
export const SyncItem = memo(function SyncItem({ id }: SyncItemProps) {
  const { line, unsynced } = useSyncItem(id);
  const { title, icon } = TARGETS[id];

  return (
    <Frame.Row onClick={() => router.navigate("/settings/sync")}>
      <Frame.Media>
        <Icon name={icon} size={20} />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{title}</Frame.Title>
        {line !== "" && <Frame.Description>{line}</Frame.Description>}
        {unsynced !== "" && <Frame.Description>{unsynced}</Frame.Description>}
      </Frame.Content>
    </Frame.Row>
  );
});
