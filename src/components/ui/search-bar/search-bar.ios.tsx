import { HStack } from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import {
  SearchBar as SearchBarBase,
  type SearchBarProps,
} from "panelui-native/components/search-bar";
import { EnsureHost, RNHostView } from "../host";

/**
 * iOS SearchBar: PanelUI's field as an RN island, since SwiftUI has no
 * standalone search bar. Fixed size because `matchContents` comes out too narrow.
 */
export function SearchBar(props: SearchBarProps) {
  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <HStack
        modifiers={[
          frame({ maxWidth: Infinity, minHeight: 48, maxHeight: 48 }),
        ]}
      >
        <RNHostView>
          <SearchBarBase {...props} />
        </RNHostView>
      </HStack>
    </EnsureHost>
  );
}
