import { Memo, useObservable } from "@legendapp/state/react";
import type { NativeStackHeaderProps } from "expo-router";
import { getHeaderTitle } from "expo-router/react-navigation";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import {
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Keyframe,
  LayoutAnimationConfig,
  useReducedMotion,
} from "react-native-reanimated";
import { Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
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

const DURATION_MS = 200;

/** A drawer's travel and timing: the large title row closes like a sheet. */
const COLLAPSE = "duration-500 ease-sheet";

/** The titles overlap as they cross; the blur hides the doubled words. */
const HANDOVER = "duration-300 ease-out";
/** Must match `HANDOVER`: Tailwind reads literals, the timer a number. */
const HANDOVER_MS = 300;
const LEAVING = "opacity-0 blur-[2px] delay-0";
const ARRIVING = "opacity-100 blur-[0px] delay-100";
/** `ARRIVING`'s delay, for the small title the large one hands over to. */
const TITLE_IN = FadeIn.delay(100);

const FIELD_IN = FadeIn.duration(DURATION_MS);
const FIELD_OUT = FadeOut.duration(DURATION_MS);

/** Shrunk and blurred, the crossing icons morph instead of stacking. */
const ICON_HIDDEN = {
  opacity: 0,
  transform: [{ scale: 0.25 }],
  filter: "blur(4px)",
};
const ICON_SHOWN = {
  opacity: 1,
  transform: [{ scale: 1 }],
  filter: "blur(0px)",
};
const ICON_IN = new Keyframe({ 0: ICON_HIDDEN, 100: ICON_SHOWN }).duration(
  DURATION_MS,
);
const ICON_OUT = new Keyframe({ 0: ICON_SHOWN, 100: ICON_HIDDEN }).duration(
  DURATION_MS,
);

/**
 * A glass capsule per group. `!` beats the track's bg-muted and its muted
 * ghost icons, both set by a stronger selector: over glass they need full ink.
 */
const GLASS_GROUP = cn(
  "glass-chrome glass-muted rounded-full! shadow-md border **:rounded-full!",
  "[&>:is([data-variant=ghost],[data-variant=outline])]:text-foreground!",
);

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
  // `isSearching` once the search group has finished resizing.
  const [settled, setSettled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  const search = options.headerSearchBarOptions;
  // A screen's own option: the field's text, open from the start.
  const searchText = (options as { searchText?: string }).searchText;
  const tintColor = options.headerTintColor;
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
    // Cancel ends an edit; a screen's own text is still what it shows.
    emit(searchText ?? "");
    setIsSearching(false);
    search?.onCancelButtonPress?.(textEvent(""));
    search?.onClose?.();
  };

  const openSearch = () => {
    setIsSearching(true);
    search?.onOpen?.();
  };

  // `Stack.SearchBar`'s ref, as on native: a screen can clear its own field.
  useImperativeHandle(search?.ref, () => ({
    focus: openSearch,
    blur: () => inputRef.current?.blur(),
    clearText: () => emit(""),
    setText: emit,
    toggleCancelButton: () => {},
    cancelSearch: closeSearch,
  }));

  useEffect(() => {
    if (searchText == null) return;
    query$.set(searchText);
    setIsSearching(true);
  }, [searchText, query$]);

  useEffect(() => {
    if (isSearching) inputRef.current?.focus();
    const timer = setTimeout(
      () => setSettled(isSearching),
      reduced ? 0 : HANDOVER_MS,
    );

    return () => clearTimeout(timer);
  }, [isSearching, reduced]);

  const searchField = search && (
    <Memo>
      {() => (
        <SearchBar
          ref={inputRef}
          // Stacked, it is its own glass. Inline, `visible` lets it take focus
          // while Reanimated still hides the parent it enters in.
          className={cn(
            "min-w-0 flex-1",
            isStacked ? "glass-chrome! glass-muted shadow-md" : "visible",
          )}
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
          // Like iOS 26: content fades under; the buttons are glass. The mask
          // stays on, or the edge turns hard while the veil fades out.
          "mask-[linear-gradient(to_top,transparent,black_1.5rem)] pointer-events-none absolute inset-0",
          "transition-[backdrop-filter,background-color]",
          COLLAPSE,
          options.headerShadowVisible && blur !== "none" && "glass-edge",
        )}
      />
      <LayoutAnimationConfig skipEntering>
        <View className="h-14 flex-row items-center gap-4">
          <ButtonGroup className={cn(GLASS_GROUP, "empty:hidden")}>
            {showBack && (
              <Button
                variant="ghost"
                shape="pill"
                size={isMinimalBack || !backLabel ? "icon" : "md"}
                onClick={navigation.goBack}
                aria-label={backLabel ?? "Back"}
              >
                <Icon name={Icons.back} />
                {!isMinimalBack && backLabel}
              </Button>
            )}
            {options.headerLeft?.({ tintColor, canGoBack: !!back })}
          </ButtonGroup>

          {/* Unmounted, not hidden, so its gap goes too. Back only once the
              group has shrunk, or it takes half the row at once. */}
          {!(isLarge || isSearching || settled) && (
            <Animated.View
              entering={TITLE_IN}
              exiting={FadeOut}
              className="min-w-0 flex-1 flex-row items-center"
            >
              {titleNode}
            </Animated.View>
          )}

          <ButtonGroup
            className={cn(
              GLASS_GROUP,
              // ms-auto keeps it at the end with no title to push it there.
              "ms-auto min-w-0 empty:hidden",
              !reduced && "transition-[flex-grow]",
              HANDOVER,
              isSearching && "grow",
              // relative: the field's leaving copy lands in the group, clipped
              // while it resizes. justify-end keeps the buttons at the end.
              "relative justify-end",
              isSearching !== settled && "overflow-hidden",
            )}
          >
            {isInline && isSearching && (
              <Animated.View
                entering={FIELD_IN}
                exiting={FIELD_OUT}
                // w-0, or the input's own width widens the group as it mounts.
                className="w-0 min-w-0 flex-1 basis-0 flex-row items-center"
              >
                {searchField}
              </Animated.View>
            )}
            {isInline && (
              <Button
                variant="ghost"
                size="icon"
                shape="pill"
                // No group divider beside the field.
                className="before:hidden"
                onClick={isSearching ? closeSearch : openSearch}
                aria-label={
                  isSearching
                    ? (search.cancelButtonText ?? "Cancel")
                    : (search.placeholder ?? "Search")
                }
              >
                {/* Keyed, so the icons cross. The leaving copy lands in this
                    sized View: in the padded button or an empty one, off. */}
                <View className="size-4.5">
                  <Animated.View
                    key={String(isSearching)}
                    entering={ICON_IN}
                    exiting={ICON_OUT}
                  >
                    <Icon name={isSearching ? Icons.close : Icons.search} />
                  </Animated.View>
                </View>
              </Button>
            )}
            {options.headerRight?.({ tintColor, canGoBack: !!back })}
          </ButtonGroup>
        </View>
      </LayoutAnimationConfig>

      {/* Kept mounted and clipped: max-h animates, auto height can't. */}
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
