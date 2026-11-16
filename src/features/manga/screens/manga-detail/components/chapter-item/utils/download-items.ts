import { Icons } from "@/components/ui/icon";
import type { MenuAction, MenuItemDialogConfig } from "@/components/ui/menu";
import type { DownloadState } from "@/features/downloads";

export const DELETE_DIALOG: MenuItemDialogConfig = {
  title: "Delete download",
  description: "Delete this chapter's download?",
  confirmLabel: "Delete",
};

const LABELS: Record<DownloadState, string> = {
  none: "Download chapter",
  queued: "Cancel download of chapter",
  running: "Cancel download of chapter",
  failed: "Retry download of chapter",
  local: "Downloaded chapter",
  cloud: "In the cloud: chapter",
};

/** Running draws its progress instead. */
export const STATE_ICONS = {
  none: Icons.download,
  queued: Icons.hourglass,
  failed: Icons.downloadFailed,
  local: Icons.downloaded,
  cloud: Icons.inCloud,
};

/** The row button's accessibility label. */
export const downloadLabel = (state: DownloadState, title: string) =>
  `${LABELS[state]} ${title}`;

export interface DownloadActions {
  download: () => void;
  cancel: () => void;
  retry: () => void;
  remove: () => void;
}

/** `confirm: false` leaves the dialog to the caller (an iOS swipe opens it too). */
export function deleteItem(onPress: () => void, confirm = true): MenuAction {
  const row = {
    label: "Delete download",
    icon: Icons.trash,
    destructive: true,
    onPress,
  };
  return confirm
    ? { ...row, onPressMode: "dialog", dialogConfig: DELETE_DIALOG }
    : row;
}

/** The long-press menu's rows for a chapter in this state. */
export function downloadItems(
  state: DownloadState,
  actions: DownloadActions,
  confirm = true,
): MenuAction[] {
  const cancel = {
    label: "Cancel download",
    icon: Icons.close,
    onPress: actions.cancel,
  };
  switch (state) {
    case "none":
      return [
        { label: "Download", icon: Icons.download, onPress: actions.download },
      ];
    case "queued":
    case "running":
      return [cancel];
    case "failed":
      return [
        {
          label: "Retry download",
          icon: Icons.refresh,
          onPress: actions.retry,
        },
        cancel,
      ];
    default:
      return [deleteItem(actions.remove, confirm)];
  }
}
