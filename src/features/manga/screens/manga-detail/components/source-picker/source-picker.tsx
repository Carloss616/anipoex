import type { Observable } from "@legendapp/state";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useSourcePicker } from "./hooks/use-source-picker";

export type SourcePickerManga = Pick<MangaDetail, "id" | "title" | "synonyms">;

export interface SourcePickerProps {
  manga: SourcePickerManga;
  entryId: number | null | undefined;
  /** Whether the source sheet is open; the sheet renders outside the chapter list (`SourcePickerSheet`). */
  open$: Observable<boolean>;
}

/**
 * The source is the scope of the chapter list, so its trigger sits against what
 * it changes. Named for the control rather than `Source`, which is the shape a
 * registry hands over.
 */
export function SourcePicker({ manga, entryId, open$ }: SourcePickerProps) {
  const picker = useSourcePicker(manga, entryId, open$);

  return (
    <>
      <Button variant="ghost" size="sm" onPress={picker.open}>
        <Typography type="body-sm" muted>
          {picker.label}
        </Typography>
        <Icon name={Icons.chevronDown} size={16} className="text-primary" />
      </Button>
      {picker.hasWeb && (
        <Button
          size="icon"
          variant="ghost"
          className="size-9"
          onPress={picker.openWeb}
          accessibilityLabel={`Open on ${picker.label}`}
        >
          <Icon
            name={Icons.website}
            size={BUTTON_ICON_SIZE}
            className="text-muted-foreground"
          />
        </Button>
      )}
    </>
  );
}
