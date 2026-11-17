import type {
  FilterKey,
  ListSort,
  SortKey,
  TriState,
} from "@/features/manga/utils/list-options";
import { FILTER_LABELS, SORT_LABELS } from "../constants";

const STATE_SUFFIX: Record<TriState, string> = {
  any: "",
  include: ", only",
  exclude: ", excluded",
};

/** Says the filter's state, which the row shows only as an icon. */
export function filterA11y(key: FilterKey, state: TriState): string {
  return FILTER_LABELS[key] + STATE_SUFFIX[state];
}

/** Says the direction of the active order only. */
export function sortA11y(key: SortKey, sort: ListSort): string {
  if (sort.by !== key) return SORT_LABELS[key];
  return `${SORT_LABELS[key]}, ${sort.ascending ? "ascending" : "descending"}`;
}
