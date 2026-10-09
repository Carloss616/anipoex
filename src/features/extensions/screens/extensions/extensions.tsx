import { useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  countExtensions,
  type ExtensionFilter,
  extensions$,
  FILTER_TITLES,
  languagesOf,
  parseFilter,
  parseLanguage,
  toSections,
} from "@/features/extensions";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import type { ActiveFilter } from "./components/active-filters";
import { ExtensionList } from "./components/extension-list";

export function Extensions() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string; language?: string }>();
  const extensions = useValue(extensions$);
  const [search, setSearch] = useState("");
  const { height } = useWindowDimensions();
  const searchBarTheme = useStackSearchBarTheme();
  const large = height > 640;

  const languages = useMemo(() => languagesOf(extensions), [extensions]);
  const filter = parseFilter(params.filter);
  const language = parseLanguage(params.language, languages);
  const sections = useMemo(
    () => toSections(extensions, { filter, language, search }),
    [extensions, filter, language, search],
  );
  const counts = useMemo(() => countExtensions(extensions), [extensions]);

  // `all` is the default: keep it out of the URL.
  const setFilter = (f: ExtensionFilter) =>
    router.setParams({ filter: f === "all" ? undefined : f });
  const setLanguage = (l: string | undefined) =>
    router.setParams({ language: l });
  const languageName = languages.find((l) => l.code === language)?.name;
  const activeFilters: ActiveFilter[] = [
    ...(languageName
      ? [{ label: languageName, clear: () => setLanguage(undefined) }]
      : []),
    ...(filter !== "all"
      ? [{ label: FILTER_TITLES[filter], clear: () => setFilter("all") }]
      : []),
  ];

  return (
    <>
      <Stack.Title large={large}>Extensions</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        placement={large ? "stacked" : "integrated"}
        hideWhenScrolling={false}
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      <ExtensionList
        sections={sections}
        counts={counts}
        filter={filter}
        onFilterChange={setFilter}
        language={language}
        languages={languages}
        onLanguageChange={setLanguage}
        activeFilters={activeFilters}
      />
    </>
  );
}
