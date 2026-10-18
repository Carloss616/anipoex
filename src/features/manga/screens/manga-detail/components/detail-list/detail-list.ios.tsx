import { HStack, List, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  listRowBackground,
  listRowInsets,
  listRowSeparator,
  listSectionMargins,
  listSectionSpacing,
  listStyle,
  offset,
  padding,
  refreshable,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { cn } from "panelui-native/utils/cn";
import { EmptyState } from "@/components/empty-state";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ChapterItem } from "../chapter-item";
import { ART_HEIGHT } from "../hero";
import type { DetailListProps } from "./detail-list";

const NO_INSETS = listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 });

/**
 * An inset-grouped `List`: the header is a bare full-width row with the hero
 * drawn up behind the navigation bar, the chapters a native card section.
 */
export function DetailList({
  hero,
  header,
  chapters,
  total,
  action,
  entryId,
  maxHeaderHeight,
  onRefresh,
  className,
}: DetailListProps) {
  const rowBackground = listRowBackground(useThemeColor("muted"));
  const sectionHeader = (
    <HStack spacing={12}>
      <Text textStyle="footnote" weight="medium">
        Chapters
      </Text>
      <Badge>{total}</Badge>
      <Spacer />
      {action}
    </HStack>
  );

  return (
    <Host className={cn("flex-1", className)}>
      <List
        modifiers={[
          listStyle("insetGrouped"),
          scrollContentBackground("hidden"),
          // The header's own bottom padding is the gap above the chapters.
          listSectionSpacing(0),
          refreshable(async () => {
            await onRefresh();
          }),
        ]}
      >
        {/* iOS 26+: below that the section keeps its side margins. */}
        <Section
          modifiers={[listSectionMargins({ length: 0, edges: "horizontal" })]}
        >
          <VStack
            alignment="leading"
            spacing={0}
            modifiers={[
              NO_INSETS,
              listRowBackground("clear"),
              listRowSeparator("hidden"),
            ]}
          >
            {/* A row's top edge can't move up, so the hero is only drawn
                higher (layout unchanged) and the header pulled up by as much. */}
            <VStack modifiers={[offset({ y: -maxHeaderHeight })]}>
              {hero}
            </VStack>
            <VStack
              modifiers={[padding({ top: -(ART_HEIGHT + maxHeaderHeight) })]}
            >
              {header}
            </VStack>
          </VStack>
        </Section>

        {chapters.length === 0 ? (
          <Section
            header={sectionHeader}
            modifiers={[listRowBackground("clear")]}
          >
            <EmptyState title="No chapters available" />
          </Section>
        ) : (
          <Section header={sectionHeader} modifiers={[rowBackground]}>
            <List.ForEach
              data={chapters}
              keyExtractor={(chapter) => String(chapter.id)}
              modifiers={[NO_INSETS]}
            >
              {({ item }) => <ChapterItem chapter={item} entryId={entryId} />}
            </List.ForEach>
          </Section>
        )}
      </List>
    </Host>
  );
}
