import { useValue } from "@legendapp/state/react";
import { SourceSheet } from "../source-sheet";
import { useSourcePicker } from "./hooks/use-source-picker";
import type { SourcePickerProps } from "./source-picker";

/** The picker's sheet, kept outside the chapter list: Compose rebuilds a list row when the list shrinks, closing and reopening a sheet inside it. */
export function SourcePickerSheet({
  manga,
  entryId,
  open$,
}: SourcePickerProps) {
  const picker = useSourcePicker(manga, entryId, open$);
  const isPresented = useValue(open$);

  return (
    <SourceSheet
      manga={manga}
      read={picker.read}
      isPresented={isPresented}
      selectedId={picker.sourceId}
      onSelect={picker.select}
      onDismiss={picker.close}
    />
  );
}
