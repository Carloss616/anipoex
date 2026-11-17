import { useValue } from "@legendapp/state/react";
import { toast } from "@/components/ui/toast";
import { settings$ } from "@/state/settings";
import { pickFolder } from "@/utils/picked-folder";
import { NO_SYNC_FOLDER } from "../constants";
import { changeFolder, folderLabel, type SaveTo, saveTo } from "../utils";

const device$ = settings$.device;

const pick = () =>
  pickFolder().catch((error) => {
    toast.error(
      `Couldn't use that folder: ${error instanceof Error ? error.message : error}`,
    );
    return undefined;
  });

const setSaveTo = (option: SaveTo) => saveTo(device$, option, pick);
const change = () => void changeFolder(device$, pick);

/** What every platform's Downloads section shows, and its actions. */
export function useDownloadsSection() {
  const option = useValue(() => device$.downloadsIn.get() ?? "sync");
  const folder = useValue(device$.downloadsFolder);
  const hasSyncFolder = useValue(() => !!device$.folder.get());

  return {
    saveTo: option,
    /** Resolves false when the option didn't change (the picker was dismissed). */
    setSaveTo,
    /** The chosen folder's row, while "Folder" is selected. */
    folder:
      option === "folder" ? { name: folderLabel(folder), change } : undefined,
    note: option === "sync" && !hasSyncFolder ? NO_SYNC_FOLDER : undefined,
  };
}
