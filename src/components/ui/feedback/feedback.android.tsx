import { Surface } from "@expo/ui/jetpack-compose";
import { combinedClickable } from "@expo/ui/jetpack-compose/modifiers";
import { EnsureHost } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { FeedbackProps } from "./feedback";

export function Feedback<P>({
  for: Component,
  onPress,
  onLongPress,
  children,
  ...props
}: FeedbackProps<P>) {
  const m3 = useThemeM3Colors();

  return !onPress && !onLongPress ? (
    <Component {...(props as P)}>{children}</Component>
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
        <Component {...(props as P)}>{children}</Component>
      </Surface>
    </EnsureHost>
  );
}
