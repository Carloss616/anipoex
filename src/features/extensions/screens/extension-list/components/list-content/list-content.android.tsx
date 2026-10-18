import {
  BadgedBox,
  Box,
  ExtendedFloatingActionButton,
  LazyColumn,
  PullToRefreshBox,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  height,
  offset,
  onVisibilityChanged,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveFilters } from "@/components/active-filters";
import { EmptyState } from "@/components/empty-state";
import { GUTTER_X } from "@/components/native/gutters";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import {
  checkForUpdates,
  extensionCount,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
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
  const insets = useSafeAreaInsets();
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
              contentPadding={{
                start: insets.left,
                end: insets.right,
                // Room for the FAB under the last row.
                bottom: counts.updates > 0 ? 80 : 0,
              }}
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
                    <Row
                      verticalAlignment="center"
                      horizontalArrangement={{ spacedBy: 8 }}
                      modifiers={[padding(16, 16, 16, 4)]}
                    >
                      <Text
                        style={{ typography: "bodyMedium", fontWeight: "500" }}
                        color={m3.primary}
                      >
                        {r.section.title}
                      </Text>
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
              // The tab bar below already clears the system inset.
              offset(-(insets.right + GUTTER_X), -16),
            ]}
          >
            <ExtendedFloatingActionButton.Icon>
              <BadgedBox>
                <BadgedBox.Badge>
                  <Badge color="inherit">{String(counts.updates)}</Badge>
                </BadgedBox.Badge>
                <Icon
                  name={Icons.update}
                  accessibilityLabel={`Update all (${counts.updates})`}
                  color="inherit"
                />
              </BadgedBox>
            </ExtendedFloatingActionButton.Icon>
            <ExtendedFloatingActionButton.Text>
              <Text style={{ fontWeight: "500" }}>Update all</Text>
            </ExtendedFloatingActionButton.Text>
          </ExtendedFloatingActionButton>
        )}
      </Box>
    </Host>
  );
}
