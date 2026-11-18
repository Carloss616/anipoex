import { Frame } from "panelui-web/frame";
import { Radio, RadioGroup } from "panelui-web/radio-group";
import { Sheet } from "panelui-web/sheet";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useStatus } from "./hooks/use-status";

export interface StatusProps {
  form: TrackingForm;
  /** The manga, whose list activity dates a Completed. */
  mediaId: number;
  /** Chapter count, if the source knows it — Completed fills progress to it. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** The status list, with a preview of what the pick would change. */
export function Status({
  form,
  mediaId,
  total,
  onCancel,
  onConfirm,
}: StatusProps) {
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    mediaId,
    total,
  );

  const options = (
    <Frame variant="plain">
      <RadioGroup
        aria-label="Status"
        // "" picks no radio and keeps the group controlled.
        value={selected ?? ""}
        onValueChange={(value) => setSelected(value as MediaListStatus)}
        render={<Frame.Panel data-attached="column" />}
        className="gap-0"
      >
        {MANGA_STATUS_ENTRIES.map(([status, title]) => (
          <Frame.Row
            key={status}
            // biome-ignore lint/a11y/noLabelWithoutControl: the Radio below is its control.
            render={<label />}
          >
            <Frame.Media>
              <Radio value={status} label={title} />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title as="p">{title}</Frame.Title>
            </Frame.Content>
          </Frame.Row>
        ))}
      </RadioGroup>
    </Frame>
  );

  return (
    <>
      <Sheet.Header title="Status" className="p-4" />
      <Sheet.Body className="px-4 pb-0">
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
