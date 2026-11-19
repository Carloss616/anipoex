import { memo } from "react";
import type { TargetKey } from "@/features/sync/state/engine";
import type { ActivitySection } from "../../utils/filters";
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
}

/** One row of its section; each row resolves to its platform file. */
export const SectionItem = memo(function SectionItem({
  section,
  id,
}: SectionItemProps) {
  switch (section) {
    case "running":
      return <RunningItem mangaId={id} />;
    case "queue":
      return <QueueItem id={id} />;
    case "downloads":
      return <DownloadItem id={id} />;
    case "skipped":
      return <SkippedItem sourceId={id} />;
    case "entries":
      return <EntryItem id={id} />;
    case "unsent":
      return <UnsentItem id={id} />;
    case "sync":
      return <SyncItem id={id as TargetKey} />;
  }
});
