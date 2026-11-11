import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";

export type PalettePreviewProps = {
  /** @platform ios, android */
  selected?: boolean;
  /** @platform ios, android */
  onSelect?: () => void;
};

const TAGS = [26, 32, 22];

/**
 * A manga detail page in miniature, in the colors of the theme it renders in
 * (a `ScopedTheme`): Uniwind classes only, since the bare `var(--primary)`
 * panelui-web reads resolves at `:root`.
 */
export function PalettePreview(_: PalettePreviewProps) {
  return (
    <View className="bg-background size-full gap-1.75 p-2">
      <View className="flex-row items-end gap-1.5">
        <View className="bg-accent aspect-2/3 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm">
          <Icon
            name={Icons.cover}
            size={14}
            className="text-accent-foreground"
          />
        </View>
        <View className="flex-1 gap-1 pb-0.5">
          <View className="bg-foreground/85 h-1.25 rounded-full" />
          <View className="bg-foreground/65 h-1.25 w-[70%] rounded-full" />
          <View className="bg-foreground/45 h-1.25 w-1/2 rounded-full" />
        </View>
      </View>
      <View className="flex-row gap-1">
        {TAGS.map((width) => (
          <View
            key={width}
            className="border-border h-2.75 rounded-full border"
            style={{ width }}
          />
        ))}
      </View>
      <View className="bg-card border-border gap-1.25 rounded-[10px] border p-1.75">
        <View className="flex-row items-center justify-between">
          <View className="bg-primary h-1.25 w-8.5 rounded-full" />
          <View className="bg-foreground/45 h-1.25 w-4.5 rounded-full" />
        </View>
        <View className="bg-muted h-0.75 overflow-hidden rounded-full">
          <View className="bg-primary h-full w-[62%]" />
        </View>
      </View>
      <View className="gap-0.5">
        {[true, false].map((latest) => (
          <View
            key={String(latest)}
            className="bg-card h-3.75 flex-row items-center gap-1.25 rounded-[3px] px-1.5 first:rounded-t-lg last:rounded-b-lg"
          >
            <View
              className={
                latest ? "bg-primary size-1.25 rounded-full" : "size-1.25"
              }
            />
            <View className="bg-foreground/60 h-1 w-[55%] rounded-full" />
          </View>
        ))}
      </View>
    </View>
  );
}
