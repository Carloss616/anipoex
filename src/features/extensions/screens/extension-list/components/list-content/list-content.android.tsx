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
  offset,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed, useObservable, useValue } from "@legendapp/state/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveFilters } from "@/components/blocks/active-filters";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { SEGMENTED_GAP } from "@/components/native/jetpack-compose/segmented-list-item";
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
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ListItem } from "../list-item";
import { useSections } from "./hooks/use-sections";
import type { ListContentProps } from "./list-content";

function RefreshBox({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(false);
  return (
    <PullToRefreshBox
      isRefreshing={checking}
      onRefresh={() => {
        setChecking(true);
        void checkForUpdates().finally(() => setChecking(false));
      }}
      contentAlignment="topCenter"
      modifiers={[fillMaxSize()]}
    >
      {children}
    </PullToRefreshBox>
  );
}

/**
 * Pull to check for updates; the FAB installs them. Once the list scrolls the
 * FAB collapses and the header fills.
 */
export function ListContent({
  extensions,
  query$,
  counts,
  filter,
  language,
  activeFilters,
  emptyState,
}: ListContentProps) {
  const sections = useSections({ extensions, filter, language, query$ });
  const query = useValue(query$);
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();
  const atTop$ = useObservable(true);
  const setHeaderScrolled = useSetHeaderScrolled();
  const insets = useSafeAreaInsets();
  const rows = toRows(sections);
  const shown = sections.reduce((n, s) => n + s.data.length, 0);
  const empty = sections.length === 0;

  // The scroll behavior leaves with the list: with nothing to scroll, the
  // header rests.
  useEffect(() => {
    if (empty) setHeaderScrolled(false);
  }, [empty, setHeaderScrolled]);

  return (
    <Host className="flex-1" style={{ marginTop: headerHeight }}>
      <Box modifiers={[fillMaxSize()]}>
        <RefreshBox>
          {empty ? (
            <EmptyState {...emptyState} modifiers={[verticalScroll()]}>
              <ActiveFilters filters={activeFilters} />
            </EmptyState>
          ) : (
            <Box
              // Remount per filter or search, or Compose keeps the scroll on
              // the old first key; the scroll behavior starts over with it.
              key={`${filter}:${query}`}
              modifiers={[
                fillMaxSize(),
                pinnedScrollBehavior((scrolled) => {
                  atTop$.set(!scrolled);
                  setHeaderScrolled(scrolled);
                }),
              ]}
            >
              <LazyColumn
                modifiers={[fillMaxSize()]}
                contentPadding={{
                  start: insets.left,
                  end: insets.right,
                  // Room for the FAB under the last row.
                  bottom: counts.updates > 0 ? 80 : 0,
                }}
              >
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
                        modifiers={[padding(GUTTER, 16, GUTTER, 8)]}
                      >
                        <Text
                          style={{ typography: "titleSmall" }}
                          color={m3.primary}
                        >
                          {r.section.title}
                        </Text>
                        <Badge>{r.section.data.length}</Badge>
                      </Row>
                    ) : (
                      <Box
                        modifiers={[
                          padding(
                            GUTTER,
                            r.index > 0 ? SEGMENTED_GAP : 0,
                            GUTTER,
                            0,
                          ),
                        ]}
                      >
                        <ListItem
                          extension={r.extension}
                          index={r.index}
                          count={r.count}
                        />
                      </Box>
                    )
                  }
                </LazyColumn.Items>
              </LazyColumn>
            </Box>
          )}
        </RefreshBox>

        {counts.updates > 0 && (
          <Computed>
            {() => (
              <ExtendedFloatingActionButton
                expanded={atTop$.get() || empty}
                onClick={updateAllExtensions}
                modifiers={[
                  align("bottomEnd"),
                  // The tab bar below already clears the system inset.
                  offset(-(insets.right + GUTTER), -16),
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
                  <Text>Update all</Text>
                </ExtendedFloatingActionButton.Text>
              </ExtendedFloatingActionButton>
            )}
          </Computed>
        )}
      </Box>
    </Host>
  );
}
