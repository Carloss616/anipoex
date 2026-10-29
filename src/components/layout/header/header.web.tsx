import { Memo, useObservable } from "@legendapp/state/react";
import type { NativeStackHeaderProps } from "expo-router";
import { getHeaderTitle } from "expo-router/react-navigation";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LARGE_TITLE_HEIGHT } from "./constants";

type SearchBarOptions = NonNullable<
  NativeStackHeaderProps["options"]["headerSearchBarOptions"]
>;

const INPUT_MODE: Record<
  NonNullable<SearchBarOptions["inputType"]>,
  HTMLAttributes<HTMLInputElement>["inputMode"]
> = {
  text: "text",
  number: "numeric",
  phone: "tel",
  email: "email",
} as const;

const TRANSITION = "duration-200 ease-out";
/** Must match `TRANSITION`: Tailwind reads class literals, the timer a number. */
const DURATION_MS = 200;

/** The large title row and what crossfades with it: drawer travel and timing. */
const COLLAPSE = "duration-500 ease-sheet";

/** The titles overlap as they cross; the blur hides the doubled words. */
const HANDOVER = "duration-300 ease-out";
const LEAVING = "opacity-0 blur-[2px] delay-0";
const ARRIVING = "opacity-100 blur-[0px] delay-100";

// The native search bar reports through events, so mirror that shape here.
const textEvent = (text: string) =>
  ({ nativeEvent: { text } }) as Parameters<
    NonNullable<SearchBarOptions["onChangeText"]>
  >[0];
// Nothing reads the focus event's fields; it only has to be there.
const focusEvent = {} as Parameters<
  NonNullable<SearchBarOptions["onFocus"]>
>[0];

export const header = (props: NativeStackHeaderProps) => <Header {...props} />;

export function Header({ options, back, navigation }: NativeStackHeaderProps) {
  const query$ = useObservable("");
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mutedForeground = useThemeColor("muted-foreground");
  const reduced = useReducedMotion();

  const search = options.headerSearchBarOptions;
  const tintColor = options.headerTintColor;
  const iconColor = tintColor ?? mutedForeground;
  const title = getHeaderTitle(options, "");
  const showBack = !!back && options.headerBackVisible !== false;
  const backLabel = options.headerBackTitle ?? back?.title;
  const isMinimalBack = options.headerBackButtonDisplayMode === "minimal";
  const blur = options.headerBlurEffect;
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
    const timer = setTimeout(
      () => setIsExpanded(true),
      reduced ? 0 : DURATION_MS,
    );

    return () => clearTimeout(timer);
  }, [isSearching, reduced]);

  const searchField = search && (
    <Memo>
      {() => (
        <SearchBar
          ref={inputRef}
          className="min-w-0 flex-1"
          value={query$.get()}
          onChangeText={emit}
          onSubmit={(text) => search.onSearchButtonPress?.(textEvent(text))}
          autoFocus={isStacked && search.autoFocus}
          placeholder={search.placeholder}
          autoCapitalize={
            search.autoCapitalize === "systemDefault"
              ? undefined
              : search.autoCapitalize
          }
          inputMode={INPUT_MODE[search.inputType ?? "text"]}
          onFocus={() => search.onFocus?.(focusEvent)}
          onBlur={() => search.onBlur?.(focusEvent)}
        />
      )}
    </Memo>
  );
  const isInline = !!search && !isStacked;

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
          "flex-1 leading-[normal]",
          options.headerTitleAlign === "center" && "text-center",
        )}
      >
        {title}
      </Typography>
    );

  return (
    <View style={options.headerStyle} className="gutters px-gx py-3">
      <View
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          // Unset fades out like iOS 26's bar; a material ends square.
          !blur && "mask-[linear-gradient(to_top,transparent,black_1.5rem)]",
          "transition-[backdrop-filter,background-color]",
          COLLAPSE,
          options.headerShadowVisible &&
            blur !== "none" &&
            "bg-background/50 backdrop-blur-xl",
        )}
      />
      <View className="h-14 flex-row items-center gap-4">
        <ButtonGroup
          className={cn(!showBack && !options.headerLeft && "hidden")}
        >
          {showBack && (
            <Button
              variant="ghost"
              shape="pill"
              size={isMinimalBack || !backLabel ? "icon" : "md"}
              onClick={navigation.goBack}
              aria-label={backLabel ?? "Back"}
            >
              <Icon
                name={Icons.back}
                size={BUTTON_ICON_SIZE}
                color={iconColor}
              />
              {!isMinimalBack && backLabel}
            </Button>
          )}
          {options.headerLeft?.({ tintColor, canGoBack: !!back })}
        </ButtonGroup>

        {/* Searching, the title yields its width to the group, where the field grows. */}
        <View
          aria-hidden={isLarge || isSearching}
          className={cn(
            "min-w-0 flex-1 flex-row items-center",
            reduced
              ? "transition-[opacity,filter]"
              : "transition-[flex-grow,opacity,filter]",
            HANDOVER,
            isSearching && "grow-0",
            isLarge || isSearching ? LEAVING : ARRIVING,
          )}
        >
          {titleNode}
        </View>

        <ButtonGroup
          className={cn(
            "min-w-0",
            !reduced && "transition-[flex-grow]",
            HANDOVER,
            // The title's delay, or the group slides left while the gap is free.
            isLarge || isSearching ? "delay-0" : "delay-100",
            isSearching && "grow",
          )}
        >
          {isInline && (
            // Shown at once so it can take focus; hidden only after the shrink.
            <View
              className={cn(
                // w-0, or the hidden input's own width widens the group.
                "w-0 min-w-0 flex-1 basis-0 flex-row items-center",
                isSearching
                  ? "transition-opacity"
                  : "transition-[opacity,visibility]",
                TRANSITION,
                isSearching ? "visible opacity-100" : "invisible opacity-0",
                isExpanded ? "overflow-visible" : "overflow-hidden",
              )}
            >
              {searchField}
            </View>
          )}
          {isInline &&
            (isSearching ? (
              <Button
                variant="ghost"
                size="icon"
                shape="pill"
                // No group divider beside the field.
                className="before:hidden"
                onClick={closeSearch}
                aria-label={search.cancelButtonText ?? "Cancel"}
              >
                <Icon name={Icons.close} size={BUTTON_ICON_SIZE} muted />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                shape="pill"
                className="before:hidden"
                onClick={openSearch}
                aria-label={search.placeholder ?? "Search"}
              >
                <Icon
                  name={Icons.search}
                  size={BUTTON_ICON_SIZE}
                  color={iconColor}
                />
              </Button>
            ))}
          {options.headerRight?.({ tintColor, canGoBack: !!back })}
        </ButtonGroup>
      </View>

      {/* Mounted and clipped so it grows open; max-h animates where auto height can't. */}
      {canBeLarge && (
        <View
          aria-hidden={!isLarge}
          style={{ maxHeight: isLarge ? LARGE_TITLE_HEIGHT : 0 }}
          className={cn(
            "overflow-hidden",
            reduced ? "transition-none" : "transition-[max-height]",
            COLLAPSE,
          )}
        >
          {/* Rises as it closes: `max-height` alone reads as a crop. */}
          <View
            className={cn(
              reduced ? "transition-opacity" : "transition-[opacity,transform]",
              HANDOVER,
              isLarge ? ARRIVING : LEAVING,
              !reduced && (isLarge ? "translate-y-0" : "-translate-y-2"),
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
                "pt-3 leading-[normal]",
                options.headerTitleAlign === "center" && "text-center",
              )}
            >
              {title}
            </Typography>
          </View>
        </View>
      )}

      {isStacked && <View className="mt-3 flex-row">{searchField}</View>}
    </View>
  );
}
