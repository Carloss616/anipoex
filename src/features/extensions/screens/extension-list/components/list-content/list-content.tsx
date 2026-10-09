import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useMemo } from "react";
import { View } from "react-native";
import { type ActiveFilter, ActiveFilters } from "@/components/active-filters";
import { EmptyState } from "@/components/empty-state";
import { HeaderInset } from "@/components/layout/header-inset";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { EnsureHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import {
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

export interface ListContentProps {
  sections: ExtensionSection[];
  counts: ExtensionCounts;
  filter: ExtensionFilter;
  onFilterChange: (filter: ExtensionFilter) => void;
  /** A language code; `undefined` = every language. */
  language: string | undefined;
  languages: Language[];
  onLanguageChange: (language: string | undefined) => void;
  /** Shown as chips on Android and narrow web. */
  activeFilters: ActiveFilter[];
}

/** Web, laid out like the manga list. */
export function ListContent({
  sections,
  counts,
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
  activeFilters,
}: ListContentProps) {
  const headerScroll = useHeaderScroll();
  const wide = useBreakpoint().isAtLeast("md");
  const rows = useMemo(() => toRows(sections), [sections]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);
  const shown = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <HeaderInset className="flex-1 flex-row">
      {wide && (
        <ListSidebar
          filter={filter}
          counts={counts}
          onSelect={onFilterChange}
        />
      )}
      <View className="flex-1">
        <LegendList
          recycleItems
          data={rows}
          keyExtractor={(row) => row.key}
          getItemType={(row) => row.kind}
          stickyHeaderConfig={{ offset: -16 }}
          stickyHeaderIndices={stickyIndices}
          {...headerScroll}
          contentContainerClassName="gutters px-safe-offset-gx md:pl-4 md:pr-safe-offset-gx pb-gb"
          ListHeaderComponent={
            <Row alignment="center" className="flex-wrap gap-3 py-4">
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
            </Row>
          }
          ListEmptyComponent={
            <EmptyState title="No extensions match this filter" />
          }
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
    </HeaderInset>
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
        endContent={<Icon name="chevron-down" size={16} />}
      >
        {languages.find((l) => l.code === language)?.name ?? "All languages"}
      </Button>
    </Menu>
  );
}

function SectionHeader({ section }: { section: ExtensionSection }) {
  return (
    <EnsureHost matchContents>
      <Row className="pt-6 pb-2">
        <Surface className="px-1.5 py-0.5" elevated>
          <Typography type="small" weight="semibold" muted>
            {`${section.title} · ${section.data.length}`}
          </Typography>
        </Surface>
      </Row>
    </EnsureHost>
  );
}
