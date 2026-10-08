import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon } from "@/components/ui/icon";
import { noop } from "@/utils/utils";

export function DownloadButton() {
  return (
    <Button size="icon" variant="ghost" onPress={noop} muted>
      <Icon
        name={Icon.select({
          ios: "arrow.down.circle",
          android: require("@expo/material-symbols/downloading.xml"),
          web: "circle-arrow-down",
        })}
        size={BUTTON_ICON_SIZE}
        className="text-inherit web:text-muted-foreground"
      />
    </Button>
  );
}
