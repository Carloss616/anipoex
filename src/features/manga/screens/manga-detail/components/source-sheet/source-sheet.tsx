import { type Observable, observe } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { openSheet$, sheetRequest$ } from "@/features/manga/state/scan-views";
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

  useEffect(() => {
    // Title results live while the sheet is open, however it closes (a pick closes it too).
    if (!isPresented) {
      stopTitleSearch(manga.id);
      return;
    }
    // Told to the floating scan views, which hide this manga's scans under it.
    openSheet$.set(manga.id);
    return () => {
      if (openSheet$.peek() === manga.id) openSheet$.set(null);
    };
  }, [isPresented, manga.id]);

  // A view's tap opens the sheet of the screen in front, not one stacked behind.
  // Watched only while focused, without re-rendering the sheet.
  useFocusEffect(
    useCallback(
      () =>
        observe(() => {
          if (sheetRequest$.get() !== manga.id) return;
          sheetRequest$.set(null);
          open$.set(true);
        }),
      [manga.id, open$],
    ),
  );

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
