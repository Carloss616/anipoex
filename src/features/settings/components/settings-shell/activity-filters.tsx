import { router, useGlobalSearchParams } from "expo-router";
import { FilterSidebar } from "@/components/blocks/filter-sidebar";
import { useActivityIds } from "@/features/activity/hooks/use-activity-ids";
import {
  type ActivityFilter,
  countsOf,
  FILTER_TITLES,
  parseFilter,
} from "@/features/activity/utils/filters";

const setFilter = (filter: ActivityFilter) =>
  router.setParams({ filter: filter === "all" ? undefined : filter });

/** Activity's filters under its row, where its own sidebar would sit. */
export function ActivityFilters() {
  // The sidebar sits outside the stack: the screen's params are the URL's.
  const { filter } = useGlobalSearchParams<{ filter?: string }>();
  const counts = countsOf(useActivityIds());

  return (
    <FilterSidebar
      titles={FILTER_TITLES}
      counts={counts}
      value={parseFilter(filter)}
      onSelect={setFilter}
      className="border-border ms-4 mt-3 border-s ps-2"
    />
  );
}
