import type { MenuItem } from "@/components/ui/menu";
import {
  type SearchParams,
  sortOf,
} from "@/features/manga/utils/search-params";
import { SORT_OPTIONS } from "./constants";

export const sortLabel = (params: SearchParams) =>
  SORT_OPTIONS.find((o) => o.value === sortOf(params))?.label ?? "";

export const sortMenuItems = (
  params: SearchParams,
  onChange: (next: SearchParams) => void,
): MenuItem[] =>
  SORT_OPTIONS.map(({ value, label }) => ({
    label,
    checked: value === sortOf(params),
    onPress: () => onChange({ ...params, sort: value }),
  }));
