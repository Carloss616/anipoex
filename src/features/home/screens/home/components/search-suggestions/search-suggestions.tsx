import type { Observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { ScrollView } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { Icon, Icons } from "@/components/ui/icon";
import {
  clearSearchHistory,
  matchingHistory,
  searchHistory$,
} from "@/features/manga/state/search-history";
import { SuggestionsOverlay } from "./suggestions-overlay";

export interface SearchSuggestionsProps {
  /** What the Home field holds; the suggestions follow it. */
  draft$: Observable<string>;
  onSubmit: (q: string) => void;
}

export function SearchSuggestions({
  draft$,
  onSubmit,
}: SearchSuggestionsProps) {
  const draft = useValue(draft$).trim();
  const recent = matchingHistory(useValue(searchHistory$), draft);

  return (
    <SuggestionsOverlay>
      <ScrollView className="flex-1">
        <HeaderInsetView className="gutters w-full max-w-2xl self-center px-gx pb-gb">
          <Frame className="mt-4">
            <Frame.Header>
              <Frame.Title>Search</Frame.Title>
              {recent.length > 0 && (
                <Frame.Action>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                  >
                    Clear history
                  </Button>
                </Frame.Action>
              )}
            </Frame.Header>
            <Frame.Panel>
              <Frame.Row onClick={() => onSubmit(draft)}>
                <Frame.Media>
                  <Icon name={Icons.search} size={18} muted />
                </Frame.Media>
                <Frame.Content>
                  <Frame.Title as="p">Search “{draft}” on AniList</Frame.Title>
                </Frame.Content>
              </Frame.Row>
              {recent.map((q) => (
                <Frame.Row
                  key={q}
                  aria-label={`Search ${q}`}
                  onClick={() => onSubmit(q)}
                >
                  <Frame.Media>
                    <Icon name={Icons.history} size={18} muted />
                  </Frame.Media>
                  <Frame.Content>
                    <Frame.Title as="p" className="font-normal">
                      {q}
                    </Frame.Title>
                  </Frame.Content>
                </Frame.Row>
              ))}
            </Frame.Panel>
          </Frame>
        </HeaderInsetView>
      </ScrollView>
    </SuggestionsOverlay>
  );
}
