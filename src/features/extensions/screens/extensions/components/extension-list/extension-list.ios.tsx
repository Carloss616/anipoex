import { List, Section, Spacer } from "@expo/ui/swift-ui";
import {
  defaultScrollAnchorForRole,
  listRowBackground,
  listStyle,
  refreshable,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { Stack } from "expo-router";
import type { SFSymbol } from "expo-symbols";
import { EmptyState } from "@/components/empty-state";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Toolbar } from "@/components/layout/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import {
  checkForUpdates,
  EXTENSION_FILTERS,
  type ExtensionFilter,
  extensionCount,
  FILTER_TITLES,
  updateAllExtensions,
} from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ExtensionRow } from "../extension-row";
import type { ExtensionListProps } from "./extension-list";

const FILTER_SYMBOLS: Record<ExtensionFilter, SFSymbol> = {
  all: "puzzlepiece.extension",
  installed: "checkmark.circle",
  available: "arrow.down.circle",
  updates: "arrow.clockwise",
};

/**
 * Like the iOS manga list: one toolbar menu picks the filter and, in a
 * submenu, the language. The menus sit inline: `Stack.Toolbar` only reads its
 * direct children, so a wrapper component would be dropped.
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
  const rowBackground = listRowBackground(useThemeColor("muted"));
  const primary = useThemeColor("primary");

  return (
    <>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu
            icon="line.3.horizontal.decrease"
            tintColor={filter !== "all" || language ? primary : undefined}
            accessibilityLabel="Filter and language"
          >
            <Stack.Toolbar.Menu inline title="Filter">
              {EXTENSION_FILTERS.map((f) => (
                <Stack.Toolbar.MenuAction
                  key={f}
                  icon={FILTER_SYMBOLS[f]}
                  isOn={f === filter}
                  subtitle={extensionCount(counts[f])}
                  onPress={() => onFilterChange(f)}
                >
                  {FILTER_TITLES[f]}
                </Stack.Toolbar.MenuAction>
              ))}
            </Stack.Toolbar.Menu>
            <Stack.Toolbar.Menu title="Language" icon="globe">
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
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      </Toolbar>

      <Host className="flex-1">
        {sections.length === 0 ? (
          <ScrollView
            fill
            modifiers={[
              defaultScrollAnchorForRole("center", "alignment"),
              refreshable(checkForUpdates),
            ]}
          >
            <EmptyState title="No extensions match this filter" />
          </ScrollView>
        ) : (
          <List
            modifiers={[
              listStyle("insetGrouped"),
              scrollContentBackground("hidden"),
              refreshable(checkForUpdates),
            ]}
          >
            {sections.map((s) => (
              <Section
                key={s.key}
                modifiers={[rowBackground]}
                header={
                  <Row alignment="center" className="gap-3">
                    <Typography type="small" muted>
                      {s.title}
                    </Typography>
                    <Badge>{s.data.length}</Badge>
                    <Spacer />
                    {s.key !== "available" && counts.updates > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={updateAllExtensions}
                      >
                        Update all
                      </Button>
                    )}
                  </Row>
                }
              >
                <List.ForEach data={s.data} keyExtractor={(e) => e.id}>
                  {({ item: e }) => <ExtensionRow extension={e} />}
                </List.ForEach>
              </Section>
            ))}
          </List>
        )}
      </Host>
    </>
  );
}
