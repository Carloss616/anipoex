import { useHeaderHeight } from "expo-router/react-navigation";
import { View, type ViewProps } from "react-native";

/**
 * A View padded by the header's height, so its content starts below the
 * transparent header.
 */
export function HeaderInsetView({ style, ...props }: ViewProps) {
  const headerHeight = useHeaderHeight();

  return <View style={[{ paddingTop: headerHeight }, style]} {...props} />;
}
