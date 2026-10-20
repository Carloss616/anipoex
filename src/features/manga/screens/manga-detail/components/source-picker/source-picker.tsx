import { Button } from "@/components/ui/button";
import { Icon, Icons } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { SourceSheet } from "../source-sheet";
import { useSourcePicker } from "./hooks/use-source-picker";

export type SourcePickerManga = Pick<MangaDetail, "id" | "title" | "synonyms">;

export interface SourcePickerProps {
  manga: SourcePickerManga;
  entryId: number | null | undefined;
}

/**
 * The source is the scope of the chapter list, so its trigger sits against what
 * it changes. Named for the control rather than `Source`, which is the shape a
 * registry hands over.
 */
export function SourcePicker({ manga, entryId }: SourcePickerProps) {
  const picker = useSourcePicker(manga, entryId);

  return (
    <>
      <Button variant="ghost" size="sm" onPress={picker.open}>
        <Typography type="body-sm" muted>
          {picker.label}
        </Typography>
        <Icon name={Icons.chevronDown} size={16} className="text-primary" />
      </Button>

      <SourceSheet
        manga={manga}
        read={picker.read}
        isPresented={picker.isPresented}
        selectedId={picker.sourceId}
        onSelect={picker.select}
        onDismiss={picker.close}
      />
    </>
  );
}
