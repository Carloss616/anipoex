import { type IconName, Icons } from "@/components/ui/icon";
import type { HistoryKind } from "./utils/history-action";

/** The glyph on a cover's badge, by what the activity did. */
export const KIND_ICON: Record<HistoryKind, IconName> = {
  read: Icons.play,
  add: Icons.add,
  done: Icons.check,
  pause: Icons.pause,
  drop: Icons.close,
};
