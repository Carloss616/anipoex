import type { Observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useEffect } from "react";
import { stopTitleSearch } from "@/features/manga/state/title-search";
import { useSourcePicker } from "../../hooks/use-source-picker";
import type { SourcePickerManga } from "../source-picker";
import { SheetContent } from "./sheet-content";

export interface SourceSheetProps {
  manga: SourcePickerManga;
  entryId: number | null | undefined;
  /** Shared with the trigger, so opening the sheet doesn't re-render the screen. */
  open$: Observable<boolean>;
}

/**
 * Which source the chapter list reads. A picker confirms by choosing, so it
 * carries no Save — the same way the tracking sheet's fields commit themselves.
 * Rendered beside the chapter list, not in its header row: Compose rebuilds a
 * list row when the list shrinks, closing and reopening a sheet inside it.
 */
export function SourceSheet({ manga, entryId, open$ }: SourceSheetProps) {
  const picker = useSourcePicker(manga, entryId, open$);
  const isPresented = useValue(open$);

  // Title results live while the sheet is open, however it closes (a pick closes it too).
  useEffect(() => {
    if (!isPresented) stopTitleSearch(manga.id);
  }, [isPresented, manga.id]);

  return (
    <SheetContent
      manga={manga}
      read={picker.read}
      isPresented={isPresented}
      selectedId={picker.sourceId}
      onSelect={picker.select}
      onDismiss={picker.close}
    />
  );
}
