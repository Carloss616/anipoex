import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { ButtonGroup } from "panelui-native/components/button-group";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { Toolbar } from "@/components/layout/toolbar";
import { Badge } from "@/components/ui/badge";
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
  filterLabel,
  headerIndices,
  type Language,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { ExtensionRow } from "../extension-row";

export interface ExtensionListProps {
  sections: ExtensionSection[];
  counts: ExtensionCounts;
  filter: ExtensionFilter;
  onFilterChange: (filter: ExtensionFilter) => void;
  /** A language code; `undefined` = every language. */
  language: string | undefined;
  languages: Language[];
  onLanguageChange: (language: string | undefined) => void;
}

/**
 * Web, laid out like the manga list: the filters in a sidebar, folded into a
 * toolbar menu below `md`; the language and "Update all" above the rows.
 */
export function ExtensionList({
  sections,
  counts,
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
}: ExtensionListProps) {
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const wide = useBreakpoint().isAtLeast("md");
  const rows = useMemo(() => toRows(sections), [sections]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);
  const [checking, setChecking] = useState(false);

  return (
    <>
      <Toolbar spinning={checking}>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu
            hidden={wide}
            icon={Icon.select({
              ios: "line.3.horizontal.decrease",
              android: require("@expo/material-symbols/filter_list.xml"),
              web: "list-filter",
            })}
            accessibilityLabel="Filters"
          >
            {EXTENSION_FILTERS.map((f) => (
              <Stack.Toolbar.MenuAction
                key={f}
                isOn={f === filter}
                onPress={() => onFilterChange(f)}
              >
                {filterLabel(f, counts)}
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
      <View className="flex-1 flex-row" style={{ paddingTop: headerHeight }}>
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
            contentContainerClassName="gutters px-safe-offset-gx pb-gb"
            ListHeaderComponent={
              <Row alignment="center" className="justify-between gap-3 py-4">
                <Menu
                  align="start"
                  items={[undefined, ...languages].map((l) => ({
                    label: l?.name ?? "All languages",
                    checked: l?.code === language,
                    onPress: () => onLanguageChange(l?.code),
                  }))}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    endContent={<Icon name="chevron-down" size={16} />}
                  >
                    {languages.find((l) => l.code === language)?.name ??
                      "All languages"}
                  </Button>
                </Menu>
                {counts.updates > 0 && (
                  <Button size="sm" onPress={updateAllExtensions}>
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
      </View>
    </>
  );
}

/** Same column as the manga `ListSidebar`: tabs, since they switch one view. */
function FilterSidebar({
  filter,
  counts,
  onSelect,
}: {
  filter: ExtensionFilter;
  counts: ExtensionCounts;
  onSelect: (filter: ExtensionFilter) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="gutters box-content w-48 gap-0.5 border-border border-r p-4 pb-gb pl-gx"
    >
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        Filters
      </Typography>
      <ButtonGroup orientation="vertical">
        {EXTENSION_FILTERS.map((f) => {
          const selected = f === filter;
          return (
            <Button
              key={f}
              accessibilityRole="tab"
              aria-selected={selected}
              onPress={() => onSelect(f)}
              variant={selected ? "secondary" : "ghost"}
              className={cn("justify-between", !selected && "opacity-60!")}
            >
              {FILTER_TITLES[f]}
              <Badge>{counts[f]}</Badge>
            </Button>
          );
        })}
      </ButtonGroup>
    </View>
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
