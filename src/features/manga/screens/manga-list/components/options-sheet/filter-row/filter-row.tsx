import { useValue } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { Checkbox } from "panelui-web/checkbox";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { cycleFilter, listOptions$ } from "@/features/manga/state/list-options";
import type { FilterKey } from "@/features/manga/utils/list-options";
import { FILTER_LABELS, FILTER_STATE_TEXT } from "../constants";
import { filterA11y } from "../utils/labels";

export interface FilterRowProps {
  filter: FilterKey;
  /**
   * Its place among the rows, for the segmented row's corners.
   * @platform android
   */
  index: number;
}

/** One filter; each press cycles any → only → excluded. */
export const FilterRow = memo(function FilterRow({ filter }: FilterRowProps) {
  const state = useValue(() => listOptions$.filters[filter].get());

  return (
    // A label hands its click to the checkbox inside.
    <Frame.Row
      // biome-ignore lint/a11y/noLabelWithoutControl: the Checkbox below is its control.
      render={<label />}
    >
      <Frame.Media>
        {/* Three states, so every press cycles; exclude is a dash, as on Android. */}
        <Checkbox
          label={filterA11y(filter, state)}
          checked={state === "include"}
          indeterminate={state === "exclude"}
          color={state === "exclude" ? "destructive" : "primary"}
          onCheckedChange={() => cycleFilter(filter)}
        />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{FILTER_LABELS[filter]}</Frame.Title>
      </Frame.Content>
      {state !== "any" && (
        <Frame.Actions>
          <Typography type="small" muted>
            {FILTER_STATE_TEXT[state]}
          </Typography>
        </Frame.Actions>
      )}
    </Frame.Row>
  );
});
