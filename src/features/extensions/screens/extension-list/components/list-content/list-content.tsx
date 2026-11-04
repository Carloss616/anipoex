import type { ObservablePrimitive } from "@legendapp/state";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { useMemo } from "react";
import { View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
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
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
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
  /**
   * The repositories sheet is open over it, so it stays on show.
   * @platform web
   */
  covered?: boolean;
}

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
  covered,
}: ListContentProps) {
  const sections = useSections({ extensions, filter, language, query$ });
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const wide = useBreakpoint().isAtLeast("md");
  const rows = useMemo(() => toRows(sections), [sections]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);
  const shown = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <View className="flex-1 flex-row">
      {wide && (
        <HeaderInsetView className="gutters box-content w-48 pr-4 pb-gb pl-gx">
          <ListSidebar
            filter={filter}
            counts={counts}
            onSelect={onFilterChange}
            className="pt-4"
          />
        </HeaderInsetView>
      )}
      <View className="flex-1">
        <LegendList
          recycleItems
          itemLayoutAnimation={LinearTransition}
          visibleWhenBlurred={covered}
          data={rows}
          keyExtractor={(row) => row.key}
          getItemType={(row) => row.kind}
          stickyHeaderConfig={{ offset: headerHeight - 12 }}
          stickyHeaderIndices={stickyIndices}
          {...headerScroll}
          contentContainerClassName="gutters pb-gb"
          ListHeaderComponent={
            <HeaderInsetView>
              <View className="flex-row flex-wrap items-center gap-3 px-gx py-4 md:pl-4">
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
                    onClick={updateAllExtensions}
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
                {row.divided && (
                  <View
                    role="separator"
                    className="mx-gx h-px bg-border md:ml-4"
                  />
                )}
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
      <Button variant="outline" size="sm">
        {languages.find((l) => l.code === language)?.name ?? "All languages"}
        <Icon name={Icons.chevronDown} size={16} />
      </Button>
    </Menu>
  );
}

/** Glass: it pins over the rows. */
function SectionHeader({ section }: { section: ExtensionSection }) {
  return (
    <Frame.Header className="stuck:glass-chrome stuck:inset-shadow-none stuck:border-b px-gx md:pl-4">
      <Frame.Title>
        {section.title} <Badge>{section.data.length}</Badge>
      </Frame.Title>
    </Frame.Header>
  );
}
