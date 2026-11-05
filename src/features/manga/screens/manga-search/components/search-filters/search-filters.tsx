import { Chip } from "panelui-web/chip";
import { Select } from "panelui-web/select";
import { ScrollView } from "react-native";
import type {
  SearchFormat,
  SearchParams,
} from "@/features/manga/utils/search-params";
import { sortOf } from "@/features/manga/utils/search-params";
import { FORMAT_OPTIONS, SORT_OPTIONS } from "./constants";

export interface SearchFiltersProps {
  params: SearchParams;
  onChange: (next: SearchParams) => void;
}

const ALL = "all";

/** Format chips, the sort and the genre, in a row that scrolls when narrow. */
export function SearchFilters({ params, onChange }: SearchFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-2 px-gx"
    >
      <Chip.Group
        aria-label="Format"
        multiple={false}
        value={[params.format ?? ALL]}
        // Pressing the chosen chip empties the group: keep it chosen.
        onValueChange={([value]) =>
          value &&
          onChange({
            ...params,
            format: value === ALL ? undefined : (value as SearchFormat),
          })
        }
        className="flex-nowrap"
      >
        {FORMAT_OPTIONS.map(({ value, label }) => (
          <Chip key={label} value={value ?? ALL} size="sm">
            {label}
          </Chip>
        ))}
      </Chip.Group>
      <Select
        items={SORT_OPTIONS}
        value={sortOf(params)}
        onValueChange={(sort) => sort && onChange({ ...params, sort })}
      >
        <Select.Trigger variant="pill" size="sm" aria-label="Sort">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {SORT_OPTIONS.map(({ value, label }) => (
            <Select.Item key={value} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {params.genre && (
        <Chip
          size="sm"
          onRemove={() => onChange({ ...params, genre: undefined })}
          removeLabel={`Remove ${params.genre}`}
        >
          {params.genre}
        </Chip>
      )}
    </ScrollView>
  );
}
