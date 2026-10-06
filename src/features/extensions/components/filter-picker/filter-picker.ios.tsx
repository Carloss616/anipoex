import { Picker } from "@expo/ui/swift-ui";
import {
  controlSize,
  frame,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { router, useGlobalSearchParams } from "expo-router";
import { EnsureHost } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import {
  countExtensions,
  EXTENSION_FILTERS,
  extensions$,
  filterLabel,
  parseFilter,
} from "@/features/extensions";

/**
 * Reads and writes the focused route's `filter` param itself, so it works the
 * same in the tab bar accessory (outside the Extensions stack) and inside the
 * list. No local state: iOS renders the accessory twice, once per placement
 * (`regular` / `inline`), and the URL keeps both in sync.
 */
export function FilterPicker() {
  const params = useGlobalSearchParams<{ filter?: string }>();
  const counts = countExtensions(useValue(extensions$));

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <Picker
        selection={parseFilter(params.filter)}
        onSelectionChange={(s) => {
          const f = parseFilter(s);
          // `all` is the default: keep it out of the URL.
          router.setParams({ filter: f === "all" ? undefined : f });
        }}
        modifiers={[
          pickerStyle("segmented"),
          controlSize("large"),
          // Centered in whatever holds it: the Host top-aligns its content.
          frame({ maxWidth: Infinity, maxHeight: Infinity }),
        ]}
      >
        {EXTENSION_FILTERS.map((f) => (
          <Typography key={f} modifiers={[tag(f)]}>
            {filterLabel(f, counts)}
          </Typography>
        ))}
      </Picker>
    </EnsureHost>
  );
}
