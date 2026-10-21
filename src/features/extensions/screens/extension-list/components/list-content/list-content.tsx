import type { ObservablePrimitive } from "@legendapp/state";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useMemo } from "react";
import { View } from "react-native";
import {
  type ActiveFilter,
  ActiveFilters,
} from "@/components/blocks/active-filters";
import {
  EmptyState,
  type EmptyStateProps,
} from "@/components/blocks/empty-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { Button } from "@/components/ui/button";
import { Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import {
  type Extension,
  type ExtensionCounts,
  type ExtensionFilter,
  type ExtensionSection,
  extensionCount,
  headerIndices,
  type Language,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { ListItem } from "../list-item";
import { ListSidebar } from "../list-sidebar";
import { useSections } from "./hooks/use-sections";

export interface ListContentProps {
  extensions: Extension[];
  /** The debounced search, read by the list alone. */
  query$: ObservablePrimitive<string>;
  counts: ExtensionCounts;
  filter: ExtensionFilter;
  onFilterChange: (filter: ExtensionFilter) => void;
  /** A language code; `undefined` = every language. */
  language: string | undefined;
  languages: Language[];
  onLanguageChange: (language: string | undefined) => void;
  /** Shown as chips on Android and narrow web. */
  activeFilters: ActiveFilter[];
  /** What an empty list says: no match for the filter, or no repository yet. */
  emptyState: Pick<EmptyStateProps, "title" | "description">;
}

/** Web, laid out like the manga list. */
export function ListContent({
  extensions,
  query$,
  counts,
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
  activeFilters,
  emptyState,
}: ListContentProps) {
  const sections = useSections({ extensions, filter, language, query$ });
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const wide = useBreakpoint().isAtLeast("md");
  const rows = useMemo(() => toRows(sections), [sections]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);
  const shown = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    // The list runs under the header, which blurs it once scrolled.
    <View className="flex-1 flex-row">
      {wide && (
        <HeaderInsetView>
          <ListSidebar
            filter={filter}
            counts={counts}
            onSelect={onFilterChange}
          />
        </HeaderInsetView>
      )}
      <View className="flex-1">
        <LegendList
          recycleItems
          data={rows}
          keyExtractor={(row) => row.key}
          getItemType={(row) => row.kind}
          // Pinned below the header, minus the section row's top padding.
          stickyHeaderConfig={{ offset: headerHeight - 16 }}
          stickyHeaderIndices={stickyIndices}
          {...headerScroll}
          contentContainerClassName="gutters px-gx md:pl-4 md:pr-gx pb-gb"
          ListHeaderComponent={
            <HeaderInsetView>
              <View className="flex-row flex-wrap items-center gap-3 py-4">
                {wide ? (
                  <>
                    <LanguageMenu
                      language={language}
                      languages={languages}
                      onSelect={onLanguageChange}
                    />
                    <ActiveFilters filters={[]} total={extensionCount(shown)} />
                  </>
                ) : (
                  <ActiveFilters
                    filters={activeFilters}
                    total={extensionCount(shown)}
                  />
                )}
                {counts.updates > 0 && (
                  <Button
                    size="sm"
                    onPress={updateAllExtensions}
                    className="ml-auto"
                  >
                    Update all
                  </Button>
                )}
              </View>
            </HeaderInsetView>
          }
          ListEmptyComponent={<EmptyState {...emptyState} />}
          renderItem={({ item: row }) =>
            row.kind === "header" ? (
              <SectionHeader section={row.section} />
            ) : (
              <>
                {row.divided && <Item.Separator />}
                <ListItem extension={row.extension} />
              </>
            )
          }
        />
      </View>
    </View>
  );
}

function LanguageMenu({
  language,
  languages,
  onSelect,
}: {
  language: string | undefined;
  languages: Language[];
  onSelect: (language: string | undefined) => void;
}) {
  return (
    <Menu
      align="start"
      items={[undefined, ...languages].map((l) => ({
        label: l?.name ?? "All languages",
        checked: l?.code === language,
        onPress: () => onSelect(l?.code),
      }))}
    >
      <Button
        variant="outline"
        size="sm"
        endContent={<Icon name={Icons.chevronDown} size={16} />}
      >
        {languages.find((l) => l.code === language)?.name ?? "All languages"}
      </Button>
    </Menu>
  );
}

function SectionHeader({ section }: { section: ExtensionSection }) {
  return (
    <View className="flex-row items-start pt-6 pb-2">
      <Surface className="px-1.5 py-0.5" elevated>
        <Typography type="small" weight="semibold" muted>
          {`${section.title} · ${section.data.length}`}
        </Typography>
      </Surface>
    </View>
  );
}
