import { Icons } from "@/components/ui/icon";
import type {
  MenuAction,
  MenuItem,
  MenuItemDialogConfig,
} from "@/components/ui/menu";
import { discardPending, retryUnsent } from "./actions";

export const DISCARD_DIALOG: MenuItemDialogConfig = {
  title: "Discard this progress?",
  confirmLabel: "Discard",
};

/** `discard` opens the row's own dialog (an iOS swipe opens it too). */
export function discardItem(mediaId: string, discard?: () => void): MenuAction {
  const row = { label: "Discard", icon: Icons.trash, destructive: true };
  return discard
    ? { ...row, onPress: discard }
    : {
        ...row,
        onPress: () => discardPending(Number(mediaId)),
        onPressMode: "dialog",
        dialogConfig: DISCARD_DIALOG,
      };
}

export function unsentMenu(mediaId: string, discard?: () => void): MenuItem[] {
  return [
    {
      label: "Retry",
      icon: Icons.refresh,
      onPress: () => retryUnsent(mediaId),
    },
    discardItem(mediaId, discard),
  ];
}
