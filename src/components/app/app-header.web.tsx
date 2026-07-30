import { Lucide } from "@react-native-vector-icons/lucide";
import type { NativeStackHeaderProps } from "expo-router";
import { getHeaderTitle } from "expo-router/react-navigation";
import { CloseButton } from "heroui-native/close-button";
import { useThemeColor } from "heroui-native/hooks";
import { SearchField } from "heroui-native/search-field";
import { cn } from "heroui-native/utils";
import { useState } from "react";
import {
  type InputModeOptions,
  type StyleProp,
  type TextStyle,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type SearchBarOptions = NonNullable<
  NativeStackHeaderProps["options"]["headerSearchBarOptions"]
>;

const INPUT_MODE: Record<
  NonNullable<SearchBarOptions["inputType"]>,
  InputModeOptions
> = {
  text: "text",
  number: "numeric",
  phone: "tel",
  email: "email",
} as const;

// The native search bar reports through events, so mirror that shape here.
const textEvent = (text: string) =>
  ({ nativeEvent: { text } }) as Parameters<
    NonNullable<SearchBarOptions["onChangeText"]>
  >[0];

export const appHeader = (props: NativeStackHeaderProps) => (
  <AppHeader {...props} />
);

export function AppHeader({
  options,
  back,
  navigation,
}: NativeStackHeaderProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const mutedColor = useThemeColor("muted");

  const search = options.headerSearchBarOptions;
  const tintColor = options.headerTintColor;
  const iconColor = tintColor ?? mutedColor;
  const title = getHeaderTitle(options, "");
  const showBack = !!back && options.headerBackVisible !== false;
  const backLabel = options.headerBackTitle ?? back?.title;
  const isMinimalBack = options.headerBackButtonDisplayMode === "minimal";
  const isStacked = search?.placement === "stacked";
  // A custom headerTitle owns its own sizing, so `large` only applies to plain titles.
  const isLarge =
    !!options.headerLargeTitle && typeof options.headerTitle !== "function";

  const emit = (text: string) => {
    setQuery(text);
    search?.onChangeText?.(textEvent(text));
  };

  const closeSearch = () => {
    emit("");
    setIsSearching(false);
    search?.onCancelButtonPress?.(textEvent(""));
    search?.onClose?.();
  };

  const searchField = search && (
    <SearchField value={query} onChange={emit} className="flex-1">
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          autoFocus={search.autoFocus ?? !isStacked}
          placeholder={search.placeholder}
          autoCapitalize={
            search.autoCapitalize === "systemDefault"
              ? undefined
              : search.autoCapitalize
          }
          inputMode={INPUT_MODE[search.inputType ?? "text"]}
          enterKeyHint="search"
          onFocus={search.onFocus}
          onBlur={search.onBlur}
          onSubmitEditing={() => search.onSearchButtonPress?.(textEvent(query))}
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );

  const titleNode =
    typeof options.headerTitle === "function" ? (
      <View className="flex-1">
        {options.headerTitle({ children: title, tintColor })}
      </View>
    ) : (
      <Typography.Heading
        type="h2"
        numberOfLines={1}
        style={[{ color: tintColor }, options.headerTitleStyle]}
        className={cn(
          "flex-1",
          options.headerTitleAlign === "center" && "text-center",
        )}
      >
        {title}
      </Typography.Heading>
    );

  return (
    <View
      style={options.headerStyle}
      className={cn(
        "gap-3 px-gutter py-6 backdrop-blur-xl",
        options.headerShadowVisible && "border-b",
        options.headerTransparent && "absolute inset-x-0 top-0 z-10",
      )}
    >
      <View className="h-14 flex-row items-center gap-2">
        {showBack && (
          <CloseButton
            className="h-10"
            isIconOnly={isMinimalBack || !backLabel}
            onPress={navigation.goBack}
            accessibilityLabel={backLabel ?? "Back"}
          >
            <Lucide name="chevron-left" size={18} color={iconColor} />
            {!isMinimalBack && backLabel && (
              <Button.Label>{backLabel}</Button.Label>
            )}
          </CloseButton>
        )}

        {options.headerLeft?.({ tintColor, canGoBack: !!back })}

        {isSearching && !isStacked ? (
          searchField
        ) : isLarge ? (
          <View className="flex-1" />
        ) : (
          titleNode
        )}

        {search &&
          !isStacked &&
          (isSearching ? (
            <CloseButton
              className="h-10"
              onPress={closeSearch}
              accessibilityLabel={search.cancelButtonText ?? "Cancel"}
              iconProps={{ size: 18 }}
            />
          ) : (
            <CloseButton
              className="h-10"
              onPress={() => {
                setIsSearching(true);
                search.onOpen?.();
              }}
              accessibilityLabel={search.placeholder ?? "Search"}
            >
              <Lucide name="search" size={18} color={iconColor} />
            </CloseButton>
          ))}

        {options.headerRight?.({ tintColor, canGoBack: !!back })}
      </View>

      {isLarge && (
        <Typography.Heading
          type="h1"
          numberOfLines={1}
          style={[
            { color: tintColor },
            options.headerLargeTitleStyle as StyleProp<TextStyle>,
          ]}
          className={cn(options.headerTitleAlign === "center" && "text-center")}
        >
          {title}
        </Typography.Heading>
      )}

      {isStacked && <View className="flex-row">{searchField}</View>}
    </View>
  );
}
