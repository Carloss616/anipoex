import {
  HStack,
  Label,
  List,
  Picker,
  ScrollView,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  defaultScrollAnchorForRole,
  foregroundStyle,
  labelsHidden,
  lineLimit,
  listRowBackground,
  listRowInsets,
  listStyle,
  padding,
  pickerStyle,
  scrollContentBackground,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSources } from "./hooks/use-sources";
import type { SourceSheetProps } from "./source-sheet";

export function SourceSheet({
  isPresented,
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const { query, setQuery, mode, sources, selected, empty } =
    useSources(selectedId);
  const primary = useThemeColor("primary");

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
        modifiers={[padding({ vertical: GUTTER })]}
      >
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ horizontal: GUTTER })]}
        >
          <HStack spacing={8}>
            <Text textStyle="title3">Sources</Text>
            <Badge>{sources.length}</Badge>
            <Spacer />
            {selected && (
              <HStack spacing={4}>
                <Icon name={Icons.check} size={14} color={primary} />
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
                >
                  {selected.name}
                </Text>
              </HStack>
            )}
          </HStack>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            cancel="focus"
          />
        </VStack>

        {sources.length === 0 ? (
          <ScrollView
            modifiers={[defaultScrollAnchorForRole("center", "alignment")]}
          >
            <EmptyState {...empty} />
          </ScrollView>
        ) : (
          <List
            modifiers={[listStyle("plain"), scrollContentBackground("hidden")]}
          >
            <Picker
              selection={selectedId ?? null}
              onSelectionChange={(id) => id && onSelect(id)}
              modifiers={[
                pickerStyle("inline"),
                labelsHidden(),
                listRowBackground("clear"),
                // `Label` centres its icon in a ~24pt slot, so the 40pt tile
                // reaches 8pt past the inset; +8 lines it up with the header.
                listRowInsets({ leading: GUTTER + 8, trailing: GUTTER }),
              ]}
            >
              {sources.map((source) => (
                <Label
                  key={source.id}
                  icon={
                    <SourceTile
                      initials={source.initials}
                      iconUrl={source.iconUrl}
                      color={sourceColor(source, mode)}
                    />
                  }
                  modifiers={[tag(source.id)]}
                >
                  <Text weight="medium">{source.name}</Text>
                </Label>
              ))}
            </Picker>
          </List>
        )}
      </VStack>
    </BottomSheet>
  );
}
