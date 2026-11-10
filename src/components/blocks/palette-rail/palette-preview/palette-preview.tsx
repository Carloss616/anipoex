import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";

export type PalettePreviewProps = {
  /** Draws the chosen ring and check, which web's `ChoiceCards` draws itself. */
  selected: boolean;
};

const TAGS = [26, 32, 22];

/**
 * A manga detail page in miniature, in the colors of the theme it renders in
 * (a `ScopedTheme`): Uniwind classes only, since the bare `var(--primary)`
 * panelui-web reads resolves at `:root`.
 */
export function PalettePreview(_: PalettePreviewProps) {
  return (
    <View className="bg-background size-full gap-[7px] p-2">
      <View className="flex-row items-end gap-1.5">
        <View
          className="bg-card w-11 shrink-0 items-center justify-center rounded-lg shadow-md"
          style={{
            aspectRatio: 2 / 3,
            transform: [{ perspective: 160 }, { rotateY: "10deg" }],
          }}
        >
          <Icon
            name={Icons.cover}
            size={14}
            className="text-muted-foreground/20"
          />
        </View>
        <View className="flex-1 gap-1 pb-0.5">
          <View className="bg-foreground/85 h-[5px] rounded-full" />
          <View className="bg-foreground/85 h-[5px] w-[70%] rounded-full" />
          <View className="bg-foreground/45 mt-[3px] h-[5px] w-1/2 rounded-full" />
        </View>
      </View>
      <View className="flex-row gap-1">
        {TAGS.map((width) => (
          <View
            key={width}
            className="border-border h-[11px] rounded-full border"
            style={{ width }}
          />
        ))}
      </View>
      <View className="bg-card border-border gap-[5px] rounded-[10px] border p-[7px]">
        <View className="flex-row items-center justify-between">
          <View className="bg-foreground h-[5px] w-[34px] rounded-full" />
          <View className="bg-foreground/45 h-[5px] w-[18px] rounded-full" />
        </View>
        <View className="bg-muted h-[3px] overflow-hidden rounded-full">
          <View className="bg-primary h-full w-[62%]" />
        </View>
      </View>
      <View className="gap-0.5">
        {[true, false].map((latest) => (
          <View
            key={String(latest)}
            className="bg-card h-[15px] flex-row items-center gap-[5px] rounded-[3px] px-1.5 first:rounded-t-lg last:rounded-b-lg"
          >
            <View
              className={
                latest ? "bg-primary size-[5px] rounded-full" : "size-[5px]"
              }
            />
            <View className="bg-foreground/60 h-1 w-[55%] rounded-full" />
          </View>
        ))}
      </View>
    </View>
  );
}
