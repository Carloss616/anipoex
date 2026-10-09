import { Stack } from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { HeaderInset } from "@/components/layout/header-inset";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { Toolbar } from "@/components/layout/toolbar";
import { Button } from "@/components/ui/button";
import { EnsureHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import {
  checkForUpdates,
  EXTENSION_FILTERS,
  type ExtensionCounts,
  type ExtensionFilter,
  type ExtensionSection,
  FILTER_TITLES,
  headerIndices,
  type Language,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { useThemeColor } from "@/hooks/use-theme-color";
import { type ActiveFilter, ActiveFilters } from "../active-filters";
import { ExtensionRow } from "../extension-row";
import { FilterSidebar } from "../filter-sidebar";

export interface ExtensionListProps {
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
export function ExtensionList({
  sections,
  counts,
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
  activeFilters,
}: ExtensionListProps) {
  const headerScroll = useHeaderScroll();
  const wide = useBreakpoint().isAtLeast("md");
  const rows = useMemo(() => toRows(sections), [sections]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);
  const [checking, setChecking] = useState(false);
  const primary = useThemeColor("primary");
  const shown = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <>
      <Toolbar spinning={checking}>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu
            hidden={wide}
            icon={Icon.select({
              ios: "globe",
              android: require("@expo/material-symbols/translate.xml"),
              web: "languages",
            })}
            tintColor={language ? primary : undefined}
            accessibilityLabel="Language"
          >
            {[undefined, ...languages].map((l) => (
              <Stack.Toolbar.MenuAction
                key={l?.code ?? "all"}
                isOn={l?.code === language}
                onPress={() => onLanguageChange(l?.code)}
              >
                {l?.name ?? "All languages"}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu
            hidden={wide}
            icon={Icon.select({
              ios: "line.3.horizontal.decrease",
              android: require("@expo/material-symbols/filter_list.xml"),
              web: "list-filter",
            })}
            tintColor={filter !== "all" ? primary : undefined}
            accessibilityLabel="Filter"
          >
            {EXTENSION_FILTERS.map((f) => (
              <Stack.Toolbar.MenuAction
                key={f}
                isOn={f === filter}
                onPress={() => onFilterChange(f)}
              >
                {FILTER_TITLES[f]}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Button
            icon={Icon.select({
              ios: "arrow.clockwise",
              android: require("@expo/material-symbols/refresh.xml"),
              web: "refresh-cw",
            })}
            onPress={() => {
              setChecking(true);
              void checkForUpdates().finally(() => setChecking(false));
            }}
            disabled={checking}
            accessibilityLabel="Check for updates"
          />
        </Stack.Toolbar>
      </Toolbar>
      <HeaderInset className="flex-1 flex-row">
        {wide && (
          <FilterSidebar
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
                    <ActiveFilters filters={[]} shown={shown} />
                  </>
                ) : (
                  <ActiveFilters filters={activeFilters} shown={shown} />
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
                  <ExtensionRow extension={row.extension} />
                </>
              )
            }
          />
        </View>
      </HeaderInset>
    </>
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
