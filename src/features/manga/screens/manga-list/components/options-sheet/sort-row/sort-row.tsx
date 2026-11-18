import { useValue } from "@legendapp/state/react";
import { Frame } from "panelui-web/frame";
import { Radio } from "panelui-web/radio-group";
import { memo } from "react";
import { Icon, Icons } from "@/components/ui/icon";
import { chooseSort, listOptions$ } from "@/features/manga/state/list-options";
import type { SortKey } from "@/features/manga/utils/list-options";
import { SORT_LABELS } from "../constants";
import { sortA11y } from "../utils/labels";

export interface SortRowProps {
  by: SortKey;
  /**
   * Its place among the rows, for the segmented row's corners.
   * @platform android
   */
  index: number;
}

/** One order: a press picks it, a second press reverses it. */
export const SortRow = memo(function SortRow({ by }: SortRowProps) {
  const label = useValue(() => sortA11y(by, listOptions$.sort.get()));
  const ascending = useValue(() => {
    const sort = listOptions$.sort.get();
    return sort.by === by ? sort.ascending : undefined;
  });

  return (
    <Frame.Row
      render={
        // biome-ignore lint/a11y/noLabelWithoutControl: the Radio below is its control.
        // biome-ignore lint/a11y/useKeyWithClickEvents: Space clicks the radio, which bubbles here.
        <label
          // A chosen radio sends no change, so its second press reverses here.
          onClick={ascending === undefined ? undefined : () => chooseSort(by)}
        />
      }
    >
      <Frame.Media>
        <Radio value={by} label={label} />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{SORT_LABELS[by]}</Frame.Title>
      </Frame.Content>
      {ascending !== undefined && (
        <Frame.Actions>
          <Icon
            name={ascending ? Icons.moveUp : Icons.moveDown}
            className="text-primary"
          />
        </Frame.Actions>
      )}
    </Frame.Row>
  );
});
