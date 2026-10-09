import { Chip } from "@/components/ui/chip";
import { Typography } from "@/components/ui/typography";

/** A filter narrowing the list, and how to drop it. */
export interface ActiveFilter {
  label: string;
  clear: () => void;
}

export interface ActiveFiltersProps {
  filters: ActiveFilter[];
  /** What's listed, worded by the caller ("3 extensions"); omitted = not shown. */
  total?: string;
}

/** Web: removable chips, then the total; a fragment for the caller's row. */
export function ActiveFilters({ filters, total }: ActiveFiltersProps) {
  return (
    <>
      {filters.map((f) => (
        <Chip
          key={f.label}
          size="sm"
          onClose={f.clear}
          closeLabel={`Clear ${f.label}`}
          className="self-auto"
        >
          {f.label}
        </Chip>
      ))}
      {total && (
        <Typography type="body-sm" muted className="whitespace-nowrap">
          {total}
        </Typography>
      )}
    </>
  );
}
