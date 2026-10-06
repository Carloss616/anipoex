import {
  BadgedBox,
  Box,
  Icon as ComposeIcon,
  HorizontalFloatingToolbar,
  LazyColumn,
  ToggleButton,
} from "@expo/ui/jetpack-compose";
import { align, fillMaxSize, offset } from "@expo/ui/jetpack-compose/modifiers";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/empty-state";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { Typography } from "@/components/ui/typography";
import {
  EXTENSION_FILTERS,
  toRows,
  updateAllExtensions,
} from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ExtensionRow } from "../extension-row";
import type { ExtensionListProps } from "./extension-list";

const TITLES = {
  all: "All",
  installed: "Installed",
  updates: "Updates",
} as const;

/** Floors of the rendered heights (dp), so a list that can't scroll never counts as one. */
const HEADER_HEIGHT = 48;
const ROW_HEIGHT = 72;
const TOOLBAR_CLEARANCE = 112;

const LANGUAGE = Icon.select({
  ios: "globe",
  android: require("@expo/material-symbols/translate.xml"),
  web: "languages",
});

/**
 * A Compose list rather than an RN one: `HorizontalFloatingToolbar` only hides
 * on scroll through Compose nested scrolling, so the toolbar and the scroller
 * share the `Box` that carries `floatingToolbarExitAlwaysScrollBehavior`.
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
  const insets = useSafeAreaInsets();
  const m3 = useThemeM3Colors();
  const [viewport, setViewport] = useState(0);
  const rows = toRows(sections);
  // The toolbar hides on any downward drag, scrollable or not, and only an
  // upward scroll brings it back: on a list that fits, it would stay gone.
  const scrolls =
    rows.reduce(
      (h, r) => h + (r.kind === "header" ? HEADER_HEIGHT : ROW_HEIGHT),
      TOOLBAR_CLEARANCE,
    ) > viewport;

  return (
    <Host
      className="flex-1"
      style={{ marginTop: headerHeight }}
      onLayoutContent={(e) => setViewport(e.nativeEvent.height)}
    >
      <Box
        floatingToolbarExitAlwaysScrollBehavior={scrolls ? "bottom" : undefined}
        modifiers={[fillMaxSize()]}
      >
        {sections.length === 0 ? (
          <EmptyState title="No extensions match this filter" />
        ) : (
          <LazyColumn
            modifiers={[fillMaxSize()]}
            contentPadding={{
              // The sides clear a landscape cutout or nav bar; the rows keep
              // their own 16dp inside that. The bottom clears the floating toolbar.
              start: insets.left,
              end: insets.right,
              bottom: TOOLBAR_CLEARANCE,
            }}
          >
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

        <HorizontalFloatingToolbar
          // Remount when the FAB comes or goes: the native toolbar only checks
          // for its FAB slot on mount, and keeps an empty FAB once it's removed.
          key={counts.updates > 0 ? "fab" : "no-fab"}
          variant="vibrant"
          modifiers={[align("bottomCenter"), offset(0, -16)]}
        >
          {/* Labels without counts: with the FAB, counts push the bar past a 412dp screen. */}
          {EXTENSION_FILTERS.map((f) => (
            <ToggleButton
              key={f}
              checked={filter === f}
              onCheckedChange={() => onFilterChange(f)}
              colors={{
                containerColor: "transparent",
              }}
            >
              <Typography
                type="body-sm"
                weight="medium"
                className="text-inherit"
              >
                {TITLES[f]}
              </Typography>
            </ToggleButton>
          ))}
          <Menu
            items={[undefined, ...languages].map((l) => ({
              label: l ?? "All languages",
              checked: l === language,
              onPress: () => onLanguageChange(l),
            }))}
          >
            <Button size="icon" variant="ghost" accessibilityLabel="Language">
              <Icon name={LANGUAGE} size={24} className="text-inherit" />
            </Button>
          </Menu>
          {counts.updates > 0 && (
            <HorizontalFloatingToolbar.FloatingActionButton
              onPress={updateAllExtensions}
            >
              <BadgedBox>
                <BadgedBox.Badge>
                  <Badge color="inherit">{String(counts.updates)}</Badge>
                </BadgedBox.Badge>
                <ComposeIcon
                  source={require("@expo/material-symbols/refresh.xml")}
                  contentDescription={`Update all (${counts.updates})`}
                />
              </BadgedBox>
            </HorizontalFloatingToolbar.FloatingActionButton>
          )}
        </HorizontalFloatingToolbar>
      </Box>
    </Host>
  );
}
