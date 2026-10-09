import { List, Section, Spacer } from "@expo/ui/swift-ui";
import {
  defaultScrollAnchorForRole,
  listRowBackground,
  listStyle,
  refreshable,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { EmptyState } from "@/components/empty-state";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { checkForUpdates, updateAllExtensions } from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ExtensionRow } from "../extension-row";
import type { ExtensionListProps } from "./extension-list";

/** An inset-grouped list per section, pull to check for updates. */
export function ExtensionList({
  sections,
  counts,
  language,
}: ExtensionListProps) {
  const rowBackground = listRowBackground(useThemeColor("muted"));

  return (
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
                  {language && <Badge>{language.toUpperCase()}</Badge>}
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
  );
}
