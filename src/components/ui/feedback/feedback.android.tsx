import { Surface } from "@expo/ui/jetpack-compose";
import { combinedClickable } from "@expo/ui/jetpack-compose/modifiers";
import { EnsureHost } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { FeedbackProps } from "./feedback";

export function Feedback({ onPress, onLongPress, children }: FeedbackProps) {
  const m3 = useThemeM3Colors();

  return !onPress && !onLongPress ? (
    children
  ) : (
    <EnsureHost matchContents>
      <Surface
        color="transparent"
        // The ripple reads `LocalContentColor`, and a transparent Surface has
        // no `contentColorFor` match to seed it — without this it stays black.
        contentColor={m3.onSurface}
        modifiers={[
          combinedClickable({ onClick: onPress, onLongClick: onLongPress }),
        ]}
      >
        {children}
      </Surface>
    </EnsureHost>
  );
}
