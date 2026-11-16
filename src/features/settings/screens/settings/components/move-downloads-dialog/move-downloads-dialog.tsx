import { Dialog } from "@/components/ui/dialog";
import { useMoveDownloads } from "./hooks/use-move-downloads";

/** Asks to move the downloads after Save to or the sync folder changes. */
export function MoveDownloadsDialog() {
  const { open, title, move, dismiss } = useMoveDownloads();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
      title={title}
      confirmLabel="Move"
      cancelLabel="Not now"
      onConfirm={move}
      alert
    />
  );
}
