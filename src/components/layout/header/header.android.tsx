import { IconButton } from "@expo/ui/jetpack-compose";
import type {
  NativeStackHeaderProps,
  NativeStackNavigationOptions,
} from "expo-router";
import { getHeaderTitle } from "expo-router/react-navigation";
import { StyleSheet } from "react-native";
import { TopAppBar } from "@/components/native/jetpack-compose/top-app-bar";
import { Host } from "@/components/ui/host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";

export const header: NativeStackNavigationOptions["header"] = (props) => (
  <Header {...props} />
);

/**
 * The stack's header drawn as an M3 app bar in Compose, from the screen's
 * options: title (or a `headerTitle` in Compose), back, `headerRight` (what
 * `Toolbar` puts there) and the fill `useSetHeaderScrolled` sets. A search bar
 * makes it a search app bar.
 */
function Header({ options, back, navigation }: NativeStackHeaderProps) {
  const search = options.headerSearchBarOptions;
  const background = StyleSheet.flatten(options.headerStyle)?.backgroundColor;
  // `Stack.Title asChild` on Android passes Compose, which the bar can hold.
  const title =
    typeof options.headerTitle === "function"
      ? options.headerTitle({ children: getHeaderTitle(options, "") })
      : undefined;
  const right = options.headerRight?.({
    tintColor: options.headerTintColor,
    canGoBack: !!back,
  });

  return (
    <Host matchContents={{ vertical: true }}>
      <TopAppBar
        title={getHeaderTitle(options, "")}
        search={
          search && {
            placeholder: search.placeholder,
            // A screen that handles submit shows results elsewhere: start over.
            clearOnSubmit: !!search.onSearchButtonPress,
            onChangeText: (text) =>
              search.onChangeText?.({ nativeEvent: { text } } as never),
            onSubmit: (text) =>
              search.onSearchButtonPress?.({ nativeEvent: { text } } as never),
          }
        }
        containerColor={background ?? "transparent"}
      >
        {back && options.headerBackVisible !== false && (
          <TopAppBar.NavigationIcon>
            <IconButton onClick={navigation.goBack}>
              <Icon
                name={Icons.back}
                size={BUTTON_ICON_SIZE}
                accessibilityLabel="Navigate up"
                color="inherit"
              />
            </IconButton>
          </TopAppBar.NavigationIcon>
        )}
        {title && <TopAppBar.Title>{title}</TopAppBar.Title>}
        {right && <TopAppBar.Actions>{right}</TopAppBar.Actions>}
      </TopAppBar>
    </Host>
  );
}
