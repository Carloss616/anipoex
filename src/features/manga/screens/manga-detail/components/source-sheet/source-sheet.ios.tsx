import {
  Button,
  Divider,
  HStack,
  LazyVStack,
  ScrollView,
  Spacer,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  clipShape,
  contentShape,
  foregroundStyle,
  frame,
  padding,
  shapes,
  strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { Fragment } from "react";
import { useCSSVariable } from "uniwind";
import { EmptyState } from "@/components/empty-state";
import { Code, Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { sourceColor } from "@/features/manga/sources";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import type { SourceSheetProps } from "./source-sheet";
import { useSources } from "./use-sources";

/** The initials tile's side, in points. */
const TILE = 40;

export function SourceSheet({
  isPresented,
  entryId,
  total,
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const { query, setQuery, mode, progress, sources } = useSources(
    entryId,
    selectedId,
  );
  const border = useThemeColor("border");
  // Each theme family sets its own rounding, so `rounded-lg` is read, not fixed.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${sources.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <VStack
        alignment="leading"
        spacing={16}
        modifiers={[padding({ vertical: 16 })]}
      >
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ horizontal: 16 })]}
        >
          <HStack spacing={8}>
            <Text textStyle="title3">Sources</Text>
            <Badge>{sources.length}</Badge>
            <Spacer />
            {!!progress && (
              <Code>
                {progress}/{total ?? "_"}
              </Code>
            )}
          </HStack>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </VStack>

        <ScrollView>
          {sources.length === 0 ? (
            <EmptyState title="No sources found" />
          ) : (
            <LazyVStack alignment="leading" spacing={0}>
              {sources.map((source, index) => (
                <Fragment key={source.id}>
                  {index > 0 && (
                    <Divider modifiers={[padding({ horizontal: 16 })]} />
                  )}
                  <Button
                    onPress={() => onSelect(source.id)}
                    modifiers={[buttonStyle("borderless")]}
                  >
                    <HStack
                      spacing={12}
                      modifiers={[
                        padding({ all: 16 }),
                        // A row, not a link: the tint stays off its text.
                        foregroundStyle("primary"),
                        // The gap the Spacer leaves takes the tap too.
                        contentShape(shapes.rectangle()),
                      ]}
                    >
                      <ZStack
                        modifiers={[
                          frame({ width: TILE, height: TILE }),
                          background(sourceColor(source, mode)),
                          clipShape("roundedRectangle", radius),
                          strokeBorder({
                            content: border,
                            shape: "roundedRectangle",
                            cornerRadius: radius,
                          }),
                        ]}
                      >
                        <Text textStyle="caption" weight="semibold">
                          {source.initials}
                        </Text>
                      </ZStack>
                      <Text weight="medium">{source.name}</Text>
                      <Spacer />
                      {source.id === selectedId && (
                        <Icon name={Icons.check} size={18} color="inherit" />
                      )}
                    </HStack>
                  </Button>
                </Fragment>
              ))}
            </LazyVStack>
          )}
        </ScrollView>
      </VStack>
    </BottomSheet>
  );
}
