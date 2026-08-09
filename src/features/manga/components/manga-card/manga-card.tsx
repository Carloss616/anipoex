import { Image, type ImageProps } from "expo-image";
import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { cn } from "heroui-native/utils";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Scrim } from "@/components/ui/scrim";
import { BlurHash, BookIcon } from "./constants";

export interface MangaCardProps {
  cover?: ImageProps["source"];
  title?: string;
  year?: string | number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function MangaCard({
  cover,
  title,
  year,
  style,
  className,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const content = (
    <>
      {cover ? (
        <Image
          style={StyleSheet.absoluteFill}
          source={cover}
          recyclingKey={typeof cover === "string" ? cover : undefined}
          placeholder={{ blurhash: BlurHash }}
          contentFit="cover"
          transition={500}
        />
      ) : (
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center"
        >
          <Icon name={BookIcon} size={22} colorClassName="accent-muted/20" />
        </View>
      )}
      {title && year && (
        <Scrim className="p-2 pt-12">
          <Card.Description
            numberOfLines={1}
            className="text-center text-gray-50 text-shadow-[0_1px_3px_#000000b3] text-xs"
          >
            {year}
          </Card.Description>
          <Card.Title
            numberOfLines={2}
            className="text-center text-shadow-[0_1px_3px_#000000b3] text-sm text-white"
          >
            {title}
          </Card.Title>
        </Scrim>
      )}
    </>
  );

  if (!onPress && !onLongPress)
    return (
      <Card
        style={style}
        className={cn("aspect-2/3 justify-end p-0", className)}
      >
        {content}
      </Card>
    );

  return (
    <Card
      style={style}
      className={cn("aspect-2/3 justify-end p-0", className)}
      asChild
    >
      <PressableFeedback onPress={onPress} onLongPress={onLongPress}>
        {content}
        <PressableFeedback.Highlight />
      </PressableFeedback>
    </Card>
  );
}
