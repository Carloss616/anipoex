import { Memo, useObservable } from "@legendapp/state/react";
import { Lucide } from "@react-native-vector-icons/lucide";
import type { NativeStackHeaderProps } from "expo-router";
import { getHeaderTitle } from "expo-router/react-navigation";
import { SearchBar } from "panelui-native/components/search-bar";
import { cn } from "panelui-native/utils/cn";
import { useEffect, useRef, useState } from "react";
import {
  type InputModeOptions,
  type StyleProp,
  type TextInput,
  type TextStyle,
  View,
} from "react-native";
import { CloseButton } from "@/components/ui/close-button";
import { Typography } from "@/components/ui/typography";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LARGE_TITLE_HEIGHT } from "./constants";

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

const TRANSITION = "duration-300 ease-out";
const DURATION_MS = 300;

// The native search bar reports through events, so mirror that shape here.
const textEvent = (text: string) =>
  ({ nativeEvent: { text } }) as Parameters<
    NonNullable<SearchBarOptions["onChangeText"]>
  >[0];

export const header = (props: NativeStackHeaderProps) => <Header {...props} />;

export function Header({ options, back, navigation }: NativeStackHeaderProps) {
  const query$ = useObservable("");
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const mutedForeground = useThemeColor("muted-foreground");

  const search = options.headerSearchBarOptions;
  const tintColor = options.headerTintColor;
  const iconColor = tintColor ?? mutedForeground;
  const title = getHeaderTitle(options, "");
  const showBack = !!back && options.headerBackVisible !== false;
  const backLabel = options.headerBackTitle ?? back?.title;
  const isMinimalBack = options.headerBackButtonDisplayMode === "minimal";
  const isStacked = search?.placement === "stacked";
  const canBeLarge = typeof options.headerTitle !== "function";
  const isLarge =
    (options.headerLargeTitle || options.headerLargeTitleEnabled) &&
    canBeLarge &&
    !options.headerShadowVisible;

  const emit = (text: string) => {
    query$.set(text);
    search?.onChangeText?.(textEvent(text));
  };

  const closeSearch = () => {
    inputRef.current?.blur();
    emit("");
    setIsSearching(false);
    search?.onCancelButtonPress?.(textEvent(""));
    search?.onClose?.();
  };

  const openSearch = () => {
    setIsSearching(true);
    search?.onOpen?.();
  };

  useEffect(() => {
    if (!isSearching) return setIsExpanded(false);
    inputRef.current?.focus();
    const timer = setTimeout(() => setIsExpanded(true), DURATION_MS);

    return () => clearTimeout(timer);
  }, [isSearching]);

  const searchField = search && (
    <Memo>
      {() => (
        <SearchBar
          ref={inputRef}
          value={query$.get()}
          onChangeText={emit}
          containerClassName="min-w-0 flex-1"
          autoFocus={isStacked && search.autoFocus}
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
          onSubmitEditing={() =>
            search.onSearchButtonPress?.(textEvent(query$.peek()))
          }
        />
      )}
    </Memo>
  );

  const titleNode =
    typeof options.headerTitle === "function" ? (
      <View className="flex-1">
        {options.headerTitle({ children: title, tintColor })}
      </View>
    ) : (
      <Typography
        type="h2"
        numberOfLines={1}
        style={[{ color: tintColor }, options.headerTitleStyle]}
        className={cn(
          "flex-1",
          options.headerTitleAlign === "center" && "text-center",
        )}
      >
        {title}
      </Typography>
    );

  return (
    <View
      style={options.headerStyle}
      className={cn(
        "gutters px-gx py-3 transition-[padding,backdrop-filter]",
        TRANSITION,
        options.headerShadowVisible && "backdrop-blur-xl",
      )}
    >
      <View className="h-14 flex-row items-center gap-4">
        {showBack && (
          <CloseButton
            className={cn(!isMinimalBack && backLabel && "w-[unset]")}
            size={isMinimalBack || !backLabel ? "icon" : "sm"}
            onPress={navigation.goBack}
            accessibilityLabel={backLabel ?? "Back"}
          >
            <Lucide name="chevron-left" size={18} color={iconColor} />
            {!isMinimalBack && backLabel}
          </CloseButton>
        )}

        {options.headerLeft?.({ tintColor, canGoBack: !!back })}

        {/* The field is laid over the title rather than next to it: no gap to
            collapse, so it can grow straight out of nothing. */}
        <View className="relative flex-1 flex-row items-center">
          <View
            aria-hidden={isLarge || isSearching}
            className={cn(
              "flex-1 flex-row items-center transition-opacity",
              TRANSITION,
              (isLarge || isSearching) && "opacity-0",
            )}
          >
            {titleNode}
          </View>

          {search && !isStacked && (
            // `visibility` transitions stepwise: the field stays visible for the
            // whole shrink, then drops out of hit-testing and the tab order.
            <View
              className={cn(
                // Centered instead of stretched: at the row's full height the clip
                // box is taller than the field, which reads as a crop.
                "absolute top-1/2 right-0 -translate-y-1/2 flex-row items-center transition-[width,opacity,visibility]",
                TRANSITION,
                isSearching
                  ? "visible w-full opacity-100"
                  : "invisible w-0 opacity-0",
                isExpanded ? "overflow-visible" : "overflow-hidden",
              )}
            >
              {searchField}
            </View>
          )}
        </View>

        {search &&
          !isStacked &&
          (isSearching ? (
            <CloseButton
              onPress={closeSearch}
              accessibilityLabel={search.cancelButtonText ?? "Cancel"}
            />
          ) : (
            <CloseButton
              onPress={openSearch}
              accessibilityLabel={search.placeholder ?? "Search"}
            >
              <Lucide name="search" size={18} color={iconColor} />
            </CloseButton>
          ))}

        {options.headerRight?.({ tintColor, canGoBack: !!back })}
      </View>

      {/* Stays mounted and clipped so the row can grow open instead of popping
          in. max-h is the animatable stand-in for the h1's auto height. */}
      {canBeLarge && (
        <View
          aria-hidden={!isLarge}
          style={{ maxHeight: isLarge ? LARGE_TITLE_HEIGHT : 0 }}
          className={cn(
            "overflow-hidden transition-[max-height,opacity]",
            TRANSITION,
            isLarge ? "opacity-100" : "opacity-0",
          )}
        >
          <Typography
            type="h1"
            numberOfLines={1}
            style={[
              { color: tintColor },
              options.headerLargeTitleStyle as StyleProp<TextStyle>,
            ]}
            className={cn(
              "pt-3",
              options.headerTitleAlign === "center" && "text-center",
            )}
          >
            {title}
          </Typography>
        </View>
      )}

      {isStacked && <View className="mt-3 flex-row">{searchField}</View>}
    </View>
  );
}
