import { observable } from "@legendapp/state";
import { settings$ } from "@/state/settings";
import {
  DEFAULT_LIST_OPTIONS,
  type FilterKey,
  type ListOptions,
  nextTriState,
  pickSort,
  type SortKey,
  type TriState,
  withoutFilters,
} from "../utils/list-options";

export const listOptions$ = observable<ListOptions>(
  () =>
    settings$.device.mangaList.get() ?? {
      filters: { ...DEFAULT_LIST_OPTIONS.filters },
      sort: { ...DEFAULT_LIST_OPTIONS.sort },
    },
);

// Always the whole object: a child set under an absent parent makes a partial one.
const save = (next: ListOptions) => settings$.device.mangaList.set(next);

export function setFilter(key: FilterKey, state: TriState) {
  const { filters, sort } = listOptions$.peek();
  save({ filters: { ...filters, [key]: state }, sort });
}

export function cycleFilter(key: FilterKey) {
  setFilter(key, nextTriState(listOptions$.peek().filters[key]));
}

export function chooseSort(by: SortKey) {
  const options = listOptions$.peek();
  save({ ...options, sort: pickSort(options.sort, by) });
}

export function clearFilters() {
  save(withoutFilters(listOptions$.peek()));
}
