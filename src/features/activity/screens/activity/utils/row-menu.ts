import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import type { QueuedDownload } from "@/features/downloads";
import {
  cancelDownload,
  moveDownloadUp,
  pauseDownload,
  removeFromQueue,
  resumeDownload,
  retryDownload,
  retrySkipped,
  scanNext,
  stopManga,
  stopSource,
} from "./actions";
import { toggleExpanded } from "./state";

/** A running manga's menu: the same on every platform. */
export function runningMenu(
  mangaId: number,
  { expanded, open }: { expanded: boolean; open: () => void },
): MenuItem[] {
  return [
    { label: "Open manga", icon: Icons.openExternal, onPress: open },
    {
      label: expanded ? "Hide sources" : "Show sources",
      icon: Icons.list,
      onPress: () => toggleExpanded(mangaId),
    },
    {
      label: "Stop this manga",
      icon: Icons.stop,
      destructive: true,
      onPress: () => stopManga(mangaId),
    },
  ];
}

export function queuedMenu(id: string, open: () => void): MenuItem[] {
  return [
    { label: "Scan next", icon: Icons.moveToTop, onPress: () => scanNext(id) },
    { label: "Open manga", icon: Icons.openExternal, onPress: open },
    {
      label: "Remove from queue",
      icon: Icons.close,
      destructive: true,
      onPress: () => removeFromQueue(id),
    },
  ];
}

export function sourceMenu(mangaId: number, sourceId: string): MenuItem[] {
  return [
    {
      label: "Stop this source",
      icon: Icons.stop,
      destructive: true,
      onPress: () => stopSource(mangaId, sourceId),
    },
  ];
}

/** Takes what it shows as arguments: the Compiler caches a call on its inputs. */
export function downloadRowMenu(
  key: string,
  { state, canMoveUp }: { state: QueuedDownload["state"]; canMoveUp: boolean },
): MenuItem[] {
  const items: MenuItem[] = [];
  if (state === "queued" && canMoveUp)
    items.push({
      label: "Move up",
      icon: Icons.moveUp,
      onPress: () => moveDownloadUp(key),
    });
  if (state === "running")
    items.push({
      label: "Pause",
      icon: Icons.pause,
      onPress: () => pauseDownload(key),
    });
  if (state === "paused")
    items.push({
      label: "Resume",
      icon: Icons.play,
      onPress: () => resumeDownload(key),
    });
  if (state === "failed")
    items.push({
      label: "Retry",
      icon: Icons.refresh,
      onPress: () => retryDownload(key),
    });
  items.push({
    label: "Cancel",
    icon: Icons.close,
    destructive: true,
    onPress: () => cancelDownload(key),
  });
  return items;
}

export function skippedMenu(sourceId: string): MenuItem[] {
  return [
    {
      label: "Retry",
      icon: Icons.refresh,
      onPress: () => retrySkipped(sourceId),
    },
  ];
}
