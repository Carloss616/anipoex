import { Frame } from "panelui-web/frame";
import { Sheet } from "panelui-web/sheet";
import { SHEET_INSET } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
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
    <Frame variant="plain" role="radiogroup" aria-label="Status">
      <Frame.Panel data-attached="column">
        {MANGA_STATUS_ENTRIES.map(([status, title]) => (
          <Frame.Row
            key={status}
            role="radio"
            aria-checked={status === selected}
            onClick={() => setSelected(status)}
          >
            <Frame.Content>
              <Frame.Title as="p">{title}</Frame.Title>
            </Frame.Content>
            {status === selected && (
              <Frame.Actions>
                <Icon
                  name={Icons.check}
                  size={BUTTON_ICON_SIZE}
                  className="text-primary"
                />
              </Frame.Actions>
            )}
          </Frame.Row>
        ))}
      </Frame.Panel>
    </Frame>
  );

  return (
    <>
      <Sheet.Header title="Status" className={SHEET_INSET.header} />
      <Sheet.Body className={SHEET_INSET.body}>
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
