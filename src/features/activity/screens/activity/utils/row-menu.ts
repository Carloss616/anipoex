import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import {
  removeFromQueue,
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

export function skippedMenu(sourceId: string): MenuItem[] {
  return [
    {
      label: "Retry",
      icon: Icons.refresh,
      onPress: () => retrySkipped(sourceId),
    },
  ];
}
