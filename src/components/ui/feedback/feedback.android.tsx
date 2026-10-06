import { Surface } from "@expo/ui/jetpack-compose";
import {
  clickable,
  combinedClickable,
} from "@expo/ui/jetpack-compose/modifiers";
import { EnsureHost } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { FeedbackProps } from "./feedback";

export function Feedback({ onPress, onLongPress, children }: FeedbackProps) {
  const m3 = useThemeM3Colors();
  // `combinedClickable` always reports a long-click action to TalkBack.
  const press = onLongPress
    ? combinedClickable({ onClick: onPress, onLongClick: onLongPress })
    : onPress && clickable(onPress);

  return !press ? (
    children
  ) : (
    <EnsureHost matchContents>
      <Surface
        color="transparent"
        // The ripple reads `LocalContentColor`, and a transparent Surface has
        // no `contentColorFor` match to seed it — without this it stays black.
        contentColor={m3.onSurface}
        modifiers={[press]}
      >
        {children}
      </Surface>
    </EnsureHost>
  );
}
