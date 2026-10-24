import {
  SearchBar as PanelSearchBar,
  type SearchBarProps as PanelSearchBarProps,
} from "panelui-native/components/search-bar";
import type { ReactNode } from "react";
import { View } from "react-native";

export interface SearchBarProps extends PanelSearchBarProps {
  /** A control at the field's end, before the clear button; beside the field on web, where PanelUI has no slot for it. */
  accessory?: ReactNode;
}

export function SearchBar({ accessory, ...props }: SearchBarProps) {
  if (!accessory) return <PanelSearchBar {...props} />;
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">
        <PanelSearchBar {...props} />
      </View>
      {accessory}
    </View>
  );
}
