import { Platform } from "expo";
import { useHeaderHeight } from "expo-router/react-navigation";
import { Select } from "panelui-native/components/select";
import { Tabs } from "panelui-native/components/tabs";
import { useMemo } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { EnsureHost } from "@/components/ui/host";
import { Item } from "@/components/ui/item";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import {
  ALL_LANGUAGES,
  EXTENSION_FILTERS,
  type ExtensionCounts,
  type ExtensionFilter,
  type ExtensionSection,
  filterLabel,
  headerIndices,
  parseFilter,
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
  /** `undefined` = every language. */
  language: string | undefined;
  languages: string[];
  onLanguageChange: (language: string | undefined) => void;
}

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
  const rows = useMemo(() => toRows(sections), [sections]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);

  return (
    <LegendList
      recycleItems
      data={rows}
      keyExtractor={(row) => row.key}
      getItemType={(row) => row.kind}
      // iOS insets the content itself (`contentInsetAdjustmentBehavior`)
      style={Platform.OS === "ios" ? undefined : { marginTop: headerHeight }}
      stickyHeaderConfig={{
        offset: Platform.OS === "ios" ? headerHeight - 28 : -16,
      }}
      stickyHeaderIndices={stickyIndices}
      {...headerScroll}
      contentContainerClassName="gutters px-safe-offset-gx pb-gb"
      ListHeaderComponent={
        <View className="flex-row flex-wrap items-center justify-between gap-3 pt-3">
          <Tabs
            className="w-full max-w-sm"
            value={filter}
            defaultValue="all"
            onValueChange={(v) => onFilterChange(parseFilter(v))}
          >
            <Tabs.List>
              {EXTENSION_FILTERS.map((f) => (
                <Tabs.Trigger key={f} value={f}>
                  {filterLabel(f, counts)}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <View className="flex-row items-center gap-3">
            <Select
              className="native:w-1/2"
              presentation="overlay"
              contentWidth="content"
              value={language ?? ALL_LANGUAGES}
              onValueChange={(v) =>
                onLanguageChange(v === ALL_LANGUAGES ? undefined : v)
              }
            >
              <Select.Item value={ALL_LANGUAGES} label="All languages" />
              {languages.map((l) => (
                <Select.Item key={l} value={l} label={l} />
              ))}
            </Select>
            {counts.updates > 0 && (
              <Button onPress={updateAllExtensions}>
                {`Update all · ${counts.updates}`}
              </Button>
            )}
          </View>
        </View>
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
