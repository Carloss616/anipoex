import { Sheet } from "panelui-web/sheet";
import { RadioGroup } from "@/components/ui/radio-group";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useStatus } from "./hooks/use-status";

export interface StatusProps {
  form: TrackingForm;
  /** Chapter count, when the source knows it — Completed fills progress to it. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** The status list, with a preview of what the pick would change. */
export function Status({ form, total, onCancel, onConfirm }: StatusProps) {
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    total,
  );

  const options = (
    <RadioGroup
      value={selected}
      onValueChange={(value) => setSelected(value as MediaListStatus)}
      data-attached="column"
    >
      {MANGA_STATUS_ENTRIES.map(([status, title]) => (
        <RadioGroup.Item
          key={status}
          value={status}
          label={title}
          className="w-full"
        />
      ))}
    </RadioGroup>
  );

  return (
    <>
      <Sheet.Header title="Status" />
      <Sheet.Body>
        {options}
        <ChangesPreview changes={changes} />
      </Sheet.Body>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </>
  );
}
