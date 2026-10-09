import FilterListIcon from "@expo/material-symbols/filter_list.xml";
import TranslateIcon from "@expo/material-symbols/translate.xml";
import {
  BadgedBox,
  Box,
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
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { cn } from "panelui-native/utils/cn";
import { useState } from "react";
import { useResolveClassNames } from "uniwind";
import { EmptyState } from "@/components/empty-state";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Row } from "@/components/layout/row";
import { Toolbar } from "@/components/layout/toolbar";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import {
  checkForUpdates,
  EXTENSION_FILTERS,
  FILTER_TITLES,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { contentPaddingOf } from "@/utils/utils";
import { ActiveFilters } from "../active-filters";
import { ExtensionRow } from "../extension-row";
import type { ExtensionListProps } from "./extension-list";

/** Pull to check for updates; the FAB installs them, collapsing once the list scrolls. */
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
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();
  const [checking, setChecking] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const fab = contentPaddingOf(
    useResolveClassNames("gutters pr-safe-offset-gx pb-safe-offset-4"),
  );
  const rows = toRows(sections);
  const shown = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu
            icon={TranslateIcon}
            tintColor={language ? m3.primary : undefined}
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
            icon={FilterListIcon}
            tintColor={filter !== "all" ? m3.primary : undefined}
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
        </Stack.Toolbar>
      </Toolbar>

      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        <Box modifiers={[fillMaxSize()]}>
          <PullToRefreshBox
            isRefreshing={checking}
            onRefresh={() => {
              setChecking(true);
              void checkForUpdates().finally(() => setChecking(false));
            }}
            contentAlignment="topCenter"
            modifiers={[fillMaxSize()]}
          >
            {sections.length === 0 ? (
              <EmptyState
                title="No extensions match this filter"
                modifiers={[verticalScroll()]}
              >
                <ActiveFilters filters={activeFilters} shown={shown} />
              </EmptyState>
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
                <ActiveFilters filters={activeFilters} shown={shown} />
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
    </>
  );
}
