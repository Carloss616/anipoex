import { useValue } from "@legendapp/state/react";
import { Platform } from "expo";
import { useHeaderHeight } from "expo-router/react-navigation";
import { Select } from "panelui-native/components/select";
import { Tabs } from "panelui-native/components/tabs";
import { useMemo } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { EnsureHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import {
  ALL_LANGUAGES,
  describeVersion,
  EXTENSION_FILTERS,
  type Extension,
  type ExtensionCounts,
  type ExtensionFilter,
  type ExtensionSection,
  filterLabel,
  hasUpdate,
  headerIndices,
  installExtension,
  parseFilter,
  toRows,
  uninstallExtension,
  updateAllExtensions,
  updateExtension,
} from "@/features/extensions";
import { sourceColor } from "@/features/manga/sources";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { theme$ } from "@/state/theme";

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

function ExtensionRow({ extension: e }: { extension: Extension }) {
  const mode = useValue(theme$.mode);

  return (
    <Item className="px-0">
      <Item.Media
        variant="icon"
        style={{ backgroundColor: sourceColor(e, mode) }}
      >
        <Typography type="body-xs" weight="semibold">
          {e.initials}
        </Typography>
      </Item.Media>
      <Item.Content>
        <Item.Title numberOfLines={1}>
          {e.nsfw ? `${e.name} · 18+` : e.name}
        </Item.Title>
        <Item.Description numberOfLines={1}>
          {`${e.language} · ${describeVersion(e)}`}
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        {!e.installed ? (
          <Button
            size="sm"
            variant="outline"
            onPress={() => installExtension(e.id)}
          >
            Install
          </Button>
        ) : hasUpdate(e) ? (
          <Button size="sm" onPress={() => updateExtension(e.id)}>
            Update
          </Button>
        ) : (
          <Badge>Installed</Badge>
        )}
        {e.installed && (
          <Menu
            items={[
              {
                label: "Uninstall",
                destructive: true,
                onPress: () => uninstallExtension(e.id),
                onPressMode: "dialog",
                dialogConfig: {
                  title: `Uninstall ${e.name}?`,
                  description: "You can install it again from Available.",
                  confirmLabel: "Uninstall",
                },
              },
            ]}
          >
            <CloseButton
              variant="secondary"
              accessibilityLabel={`More actions for ${e.name}`}
            >
              <Icon
                name={Icon.select({
                  ios: "ellipsis",
                  android: require("@expo/material-symbols/more_vert.xml"),
                  web: "ellipsis-vertical",
                })}
                size={16}
                muted
              />
            </CloseButton>
          </Menu>
        )}
      </Item.Actions>
    </Item>
  );
}
