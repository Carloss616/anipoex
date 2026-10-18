import {
  Button,
  HStack,
  List,
  ScrollView,
  Section,
  Spacer,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  defaultScrollAnchorForRole,
  listRowBackground,
  listStyle,
  refreshable,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { EmptyState } from "@/components/blocks/empty-state";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { checkForUpdates, updateAllExtensions } from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ListItem } from "../list-item";
import type { ListContentProps } from "./list-content";

/** An inset-grouped list per section, pull to check for updates. */
export function ListContent({ sections, counts, language }: ListContentProps) {
  const rowBackground = listRowBackground(useThemeColor("muted"));
  const buttonFont = useFont("subheadline", "medium");

  return (
    <Host className="flex-1">
      {sections.length === 0 ? (
        <ScrollView
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
                <HStack spacing={12}>
                  <Text textStyle="footnote" weight="medium">
                    {s.title}
                  </Text>
                  <Badge>{s.data.length}</Badge>
                  {language && <Badge>{language.toUpperCase()}</Badge>}
                  <Spacer />
                  {s.key !== "available" && counts.updates > 0 && (
                    <Button
                      label="Update all"
                      onPress={updateAllExtensions}
                      modifiers={[
                        buttonStyle("borderless"),
                        controlSize("small"),
                        buttonFont,
                      ]}
                    />
                  )}
                </HStack>
              }
            >
              <List.ForEach data={s.data} keyExtractor={(e) => e.id}>
                {({ item: e }) => <ListItem extension={e} />}
              </List.ForEach>
            </Section>
          ))}
        </List>
      )}
    </Host>
  );
}
