import {
  SearchBar as SearchBarBase,
  type SearchBarProps,
} from "panelui-native/components/search-bar";
import { Row } from "@/components/layout/row";
import { EnsureHost, RNHostView } from "../host";

/**
 * iOS SearchBar: PanelUI's field as an RN island, since SwiftUI has no
 * standalone search bar. Fixed size because `matchContents` comes out too narrow.
 */
export function SearchBar(props: SearchBarProps) {
  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <Row className="h-12 w-full">
        <RNHostView>
          <SearchBarBase {...props} />
        </RNHostView>
      </Row>
    </EnsureHost>
  );
}
