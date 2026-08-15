import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { noop } from "@/utils/utils";

export function DownloadButton() {
  return (
    <Button size="sm" variant="ghost" isIconOnly onPress={noop}>
      <Icon
        name={Icon.select({
          ios: "arrow.down.circle",
          android: require("@expo/material-symbols/downloading.xml"),
          web: "circle-arrow-down",
        })}
        size={24}
        colorClassName="accent-primary"
      />
    </Button>
  );
}
