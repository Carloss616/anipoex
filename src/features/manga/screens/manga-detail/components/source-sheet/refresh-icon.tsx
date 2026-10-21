import { Platform } from "react-native";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";

/** The loader takes the icon's place in the same button, so the row never shifts. */
export function RefreshIcon({ spinning }: { spinning: boolean }) {
  return spinning ? (
    <Loader size="sm" />
  ) : (
    <Icon
      name={Icons.refresh}
      size={BUTTON_ICON_SIZE}
      // Native takes the button's tint, so a disabled one dims; web's default is foreground.
      color={Platform.OS === "web" ? undefined : "inherit"}
    />
  );
}
