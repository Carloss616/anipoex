import { Button } from "panelui-web/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useSourcePicker } from "../../hooks/use-source-picker";

export type SourcePickerManga = Pick<MangaDetail, "id" | "title" | "synonyms">;

export interface SourcePickerProps {
  manga: SourcePickerManga;
}

/**
 * The source is the scope of the chapter list, so its trigger sits against what
 * it changes. Named for the control rather than `Source`, which is the shape a
 * registry hands over.
 */
export function SourcePicker({ manga }: SourcePickerProps) {
  const picker = useSourcePicker(manga);

  return (
    <>
      <Button variant="ghost" size="sm" shape="pill" onClick={picker.open}>
        {picker.label}
        <Icon name={Icons.chevronDown} size={16} />
      </Button>
      {picker.hasWeb && (
        <Button
          size="icon"
          variant="ghost"
          shape="pill"
          onClick={picker.openWeb}
          aria-label={`Open on ${picker.label}`}
        >
          <Icon name={Icons.website} size={BUTTON_ICON_SIZE} />
        </Button>
      )}
    </>
  );
}
