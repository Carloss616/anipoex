import { Button, HStack, List, Section, Spacer } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  lineLimit,
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import {
  clearSearchHistory,
  matchingHistory,
  searchHistory$,
} from "@/features/manga/state/search-history";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { SearchSuggestionsProps } from "./search-suggestions";
import { SuggestionsOverlay } from "./suggestions-overlay";

/** Over Home's sections while the field has text. */
export function SearchSuggestions({
  draft$,
  onSubmit,
}: SearchSuggestionsProps) {
  const draft = useValue(draft$).trim();
  const recent = matchingHistory(useValue(searchHistory$), draft);
  const clearFont = useFont("footnote");
  const rowBackground = listRowBackground(useThemeColor("surface-secondary"));

  return (
    <SuggestionsOverlay>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
          ]}
        >
          <Section
            modifiers={[rowBackground]}
            footer={
              <Text textStyle="footnote">
                Typing doesn't search. Press Search on the keyboard.
              </Text>
            }
          >
            <SuggestionRow
              icon={Icons.search}
              label={`Search “${draft}” on AniList`}
              onPress={() => onSubmit(draft)}
            />
          </Section>
          {recent.length > 0 && (
            <Section
              modifiers={[rowBackground]}
              header={
                <HStack>
                  <Text>Recent</Text>
                  <Spacer />
                  <Button
                    label="Clear"
                    onPress={clearSearchHistory}
                    modifiers={[buttonStyle("borderless"), clearFont]}
                  />
                </HStack>
              }
            >
              {recent.map((entry) => (
                <SuggestionRow
                  key={entry}
                  icon={Icons.history}
                  label={entry}
                  onPress={() => onSubmit(entry)}
                />
              ))}
            </Section>
          )}
        </List>
      </Host>
    </SuggestionsOverlay>
  );
}

function SuggestionRow({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button onPress={onPress}>
      <HStack spacing={12}>
        <Icon name={icon} muted />
        <Text modifiers={[foregroundStyle("primary"), lineLimit(1)]}>
          {label}
        </Text>
      </HStack>
    </Button>
  );
}
