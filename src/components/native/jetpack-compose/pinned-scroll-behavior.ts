import { createModifierWithEventListener } from "@expo/ui/jetpack-compose/modifiers";

/**
 * M3's `TopAppBarDefaults.pinnedScrollBehavior()` on a scrolling list's
 * parent, registered by the local `modules/modifiers`: reports whether the
 * list has scrolled from its top, for a bar drawn in another Host. Not on the
 * `LazyColumn` itself: @expo/ui drops its modifiers' events.
 */
export const pinnedScrollBehavior = (onChange: (scrolled: boolean) => void) =>
  createModifierWithEventListener(
    "pinnedScrollBehavior",
    ({ scrolled }: { scrolled: boolean }) => onChange(scrolled),
  );
