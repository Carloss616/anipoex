import { Button } from "@/components/ui/button";
import { Icon, Icons } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { SourceSheet } from "../source-sheet";
import { useSourcePicker } from "./hooks/use-source-picker";

export interface SourcePickerProps {
  mangaId: number;
  entryId: number | null | undefined;
  total: number | null | undefined;
}

/**
 * The source is the scope of the chapter list, so its trigger sits against what
 * it changes. Named for the control rather than `Source`, which is the shape a
 * registry hands over.
 */
export function SourcePicker({ mangaId, entryId, total }: SourcePickerProps) {
  const picker = useSourcePicker(mangaId);

  return (
    <>
      <Button variant="ghost" size="sm" onPress={picker.open}>
        <Typography type="body-sm" muted>
          {picker.label}
        </Typography>
        <Icon name={Icons.chevronDown} size={16} className="text-primary" />
      </Button>

      <SourceSheet
        isPresented={picker.isPresented}
        entryId={entryId}
        total={total}
        selectedId={picker.sourceId}
        onSelect={picker.select}
        onDismiss={picker.close}
      />
    </>
  );
}
