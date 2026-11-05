import { Skeleton } from "panelui-native/components/skeleton";
import { Frame } from "panelui-web/frame";
import { View } from "react-native";
import { SECTIONS, type SectionId } from "@/features/home/constants";

export interface SectionPlaceholderProps {
  id: SectionId;
}

/** A section's frame with covers pulsing in it, while Home loads. */
export function SectionPlaceholder({ id }: SectionPlaceholderProps) {
  const { title } = SECTIONS[id];

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
      </Frame.Header>
      <Frame.Panel>
        <View className="flex-row gap-3 overflow-hidden p-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              label={i === 0 ? `Loading ${title}` : undefined}
              className="aspect-2/3 w-28 rounded-[10px]"
            />
          ))}
        </View>
      </Frame.Panel>
    </Frame>
  );
}
