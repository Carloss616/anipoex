import SearchIcon from "@expo/material-symbols/search.xml";
import { DockedSearchBar } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { EnsureHost } from "../host";
import { BUTTON_ICON_SIZE, Icon } from "../icon";
import type { SearchBarProps } from "./search-bar";

/**
 * Android SearchBar: PanelUI's props, drawn as M3's `DockedSearchBar`.
 *
 * The native bar owns its query — it takes no `value`, so it is always
 * uncontrolled and only `onChangeText` reaches it. Clear, cancel, loading and
 * submit have no slot to land in and stay iOS/web-only.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dockedsearchbar/
 */
export function SearchBar({ placeholder, onChangeText, icon }: SearchBarProps) {
  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <DockedSearchBar
        onQueryChange={onChangeText}
        modifiers={[fillMaxWidth()]}
      >
        {placeholder ? (
          <DockedSearchBar.Placeholder>
            <Text style={{ typography: "bodyMedium" }}>{placeholder}</Text>
          </DockedSearchBar.Placeholder>
        ) : null}
        <DockedSearchBar.LeadingIcon>
          {icon ?? <Icon name={SearchIcon} size={BUTTON_ICON_SIZE} muted />}
        </DockedSearchBar.LeadingIcon>
      </DockedSearchBar>
    </EnsureHost>
  );
}
