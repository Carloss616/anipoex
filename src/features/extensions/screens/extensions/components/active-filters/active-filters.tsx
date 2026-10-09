import { Chip } from "@/components/ui/chip";
import { Typography } from "@/components/ui/typography";
import { extensionCount } from "@/features/extensions";

/** A filter narrowing the list, and how to drop it. */
export interface ActiveFilter {
  label: string;
  clear: () => void;
}

export interface ActiveFiltersProps {
  filters: ActiveFilter[];
  /** How many extensions are listed. */
  shown: number;
}

/** Web: removable chips, then the total, always; a fragment for the caller's row. */
export function ActiveFilters({ filters, shown }: ActiveFiltersProps) {
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
      <Typography type="body-sm" muted className="whitespace-nowrap">
        {extensionCount(shown)}
      </Typography>
    </>
  );
}
