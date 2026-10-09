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
import { useHeaderHeight } from "expo-router/react-navigation";
import { cn } from "panelui-native/utils/cn";
import { useState } from "react";
import { useResolveClassNames } from "uniwind";
import { ActiveFilters } from "@/components/active-filters";
import { EmptyState } from "@/components/empty-state";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import {
  checkForUpdates,
  extensionCount,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { contentPaddingOf } from "@/utils/utils";
import { ListItem } from "../list-item";
import type { ListContentProps } from "./list-content";

/** Pull to check for updates; the FAB installs them, collapsing once the list scrolls. */
export function ListContent({
  sections,
  counts,
  filter,
  activeFilters,
}: ListContentProps) {
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
              <ActiveFilters filters={activeFilters} />
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
              <ActiveFilters
                filters={activeFilters}
                total={extensionCount(shown)}
              />
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
                    <ListItem extension={r.extension} />
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
  );
}
