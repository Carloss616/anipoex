import { memo } from "react";
import type { ActivitySection } from "@/features/activity/utils/filters";
import type { TargetKey } from "@/features/sync/state/engine";
import { DownloadItem } from "../download-item";
import { EntryItem } from "../entry-item";
import { QueueItem } from "../queue-item";
import { RunningItem } from "../running-item";
import { SkippedItem } from "../skipped-item";
import { SyncItem } from "../sync-item";
import { UnsentItem } from "../unsent-item";

export interface SectionItemProps {
  section: ActivitySection;
  id: string;
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** One row of its section; each row resolves to its platform file. */
export const SectionItem = memo(function SectionItem({
  section,
  id,
  index,
  count,
}: SectionItemProps) {
  const place = { index, count };
  switch (section) {
    case "running":
      return <RunningItem mangaId={id} {...place} />;
    case "queue":
      return <QueueItem id={id} {...place} />;
    case "downloads":
      return <DownloadItem id={id} {...place} />;
    case "skipped":
      return <SkippedItem sourceId={id} {...place} />;
    case "entries":
      return <EntryItem id={id} {...place} />;
    case "unsent":
      return <UnsentItem id={id} {...place} />;
    case "sync":
      return <SyncItem id={id as TargetKey} {...place} />;
  }
});
