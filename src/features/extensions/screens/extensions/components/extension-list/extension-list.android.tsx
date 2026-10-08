import {
  BadgedBox,
  Box,
  Column,
  ExtendedFloatingActionButton,
  PullToRefreshBox,
} from "@expo/ui/jetpack-compose";
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  height,
  offset,
  onVisibilityChanged,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useHeaderHeight } from "expo-router/react-navigation";
import { cn } from "panelui-native/utils/cn";
import { useState } from "react";
import { useResolveClassNames } from "uniwind";
import { EmptyState } from "@/components/empty-state";
import { LazyColumn } from "@/components/layout/lazy-column";
import { LazyRow } from "@/components/layout/lazy-row";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import {
  checkForUpdates,
  EXTENSION_FILTERS,
  filterLabel,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { contentPaddingOf } from "@/utils/utils";
import { ExtensionRow } from "../extension-row";
import type { ExtensionListProps } from "./extension-list";

/**
 * The language and filters are chips above the list, outside it, so an empty
 * result can still be left. Pull to check for updates; the FAB installs them,
 * collapsing to its icon once the list scrolls off the top.
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
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();
  const [checking, setChecking] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const fab = contentPaddingOf(
    useResolveClassNames("gutters pr-safe-offset-gx pb-safe-offset-4"),
  );
  const rows = toRows(sections);

  return (
    <Host className="flex-1" style={{ marginTop: headerHeight }}>
      <Box modifiers={[fillMaxSize()]}>
        <Column modifiers={[fillMaxSize()]}>
          <LazyRow
            verticalAlignment="center"
            className="gutters gap-2 px-safe-offset-gx pb-2"
          >
            <Menu
              items={[undefined, ...languages].map((l) => ({
                label: l?.name ?? "All languages",
                checked: l?.code === language,
                onPress: () => onLanguageChange(l?.code),
              }))}
            >
              <Chip selected={language !== undefined}>
                <Chip.Label>
                  {languages.find((l) => l.code === language)?.name ??
                    "Language"}
                </Chip.Label>
              </Chip>
            </Menu>
            <Separator orientation="vertical" className="h-6" />
            <Menu
              items={EXTENSION_FILTERS.map((f) => ({
                label: filterLabel(f, counts),
                checked: f === filter,
                onPress: () => onFilterChange(f),
              }))}
            >
              <Chip selected={filter !== "all"}>
                <Chip.Label>{filterLabel(filter, counts)}</Chip.Label>
              </Chip>
            </Menu>
          </LazyRow>
          <Separator />
          <PullToRefreshBox
            isRefreshing={checking}
            onRefresh={() => {
              setChecking(true);
              void checkForUpdates().finally(() => setChecking(false));
            }}
            contentAlignment="topCenter"
            modifiers={[weight(1), fillMaxWidth()]}
          >
            {sections.length === 0 ? (
              <Box modifiers={[fillMaxSize()]}>
                <EmptyState title="No extensions match this filter" />
              </Box>
            ) : (
              <LazyColumn
                // Remount per filter, or Compose keeps the scroll on the old first key.
                key={filter}
                modifiers={[fillMaxSize()]}
                className={cn("px-safe", counts.updates > 0 && "pb-20")}
              >
                {/* Top sentinel: Compose's `firstVisibleItemIndex == 0`, without scroll events. */}
                <Box
                  modifiers={[
                    fillMaxWidth(),
                    height(1),
                    onVisibilityChanged(setAtTop, { minFractionVisible: 0 }),
                  ]}
                />
                {/* One recycled stream: each section is a header row, then its extensions. */}
                <LazyColumn.Items data={rows} keyExtractor={(r) => r.key}>
                  {({ item: r }) =>
                    r.kind === "header" ? (
                      <Row alignment="center" className="gap-2 px-4 pt-4 pb-1">
                        <Typography
                          type="body-sm"
                          weight="medium"
                          style={{ color: m3.primary }}
                        >
                          {r.section.title}
                        </Typography>
                        <Badge>{r.section.data.length}</Badge>
                      </Row>
                    ) : (
                      <ExtensionRow extension={r.extension} />
                    )
                  }
                </LazyColumn.Items>
              </LazyColumn>
            )}
          </PullToRefreshBox>
        </Column>

        {counts.updates > 0 && (
          <ExtendedFloatingActionButton
            expanded={atTop}
            onClick={updateAllExtensions}
            modifiers={[
              align("bottomEnd"),
              offset(-(fab.end ?? 0), -(fab.bottom ?? 0)),
            ]}
          >
            <ExtendedFloatingActionButton.Icon>
              <BadgedBox>
                <BadgedBox.Badge>
                  <Badge color="inherit">{String(counts.updates)}</Badge>
                </BadgedBox.Badge>
                <Icon
                  name={require("@expo/material-symbols/deployed_code_update.xml")}
                  accessibilityLabel={`Update all (${counts.updates})`}
                  className="text-inherit"
                />
              </BadgedBox>
            </ExtendedFloatingActionButton.Icon>
            <ExtendedFloatingActionButton.Text>
              <Typography weight="medium" className="text-inherit">
                Update all
              </Typography>
            </ExtendedFloatingActionButton.Text>
          </ExtendedFloatingActionButton>
        )}
      </Box>
    </Host>
  );
}
