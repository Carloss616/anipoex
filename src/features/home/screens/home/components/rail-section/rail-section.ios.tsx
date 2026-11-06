import {
  Button,
  HStack,
  LazyHStack,
  ScrollView,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  padding,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { GridItem } from "@/features/manga/components/manga-grid/grid-item";
import { toRouteParams } from "@/features/manga/utils/search-params";
import type { RailSectionProps } from "./rail-section";

const CARD = 106;

export function RailSection({ title, media, params }: RailSectionProps) {
  const router = useRouter();
  const seeAllFont = useFont("body");

  return (
    <VStack alignment="leading" spacing={8}>
      <HStack modifiers={[padding({ horizontal: GUTTER })]}>
        <Text textStyle="title3" weight="bold">
          {title}
        </Text>
        <Spacer />
        {params && (
          <Button
            label="See All"
            onPress={() =>
              router.push({
                pathname: "/search",
                params: toRouteParams(params),
              })
            }
            modifiers={[buttonStyle("borderless"), seeAllFont]}
          />
        )}
      </HStack>
      <ScrollView axes="horizontal" modifiers={[scrollIndicators("hidden")]}>
        <LazyHStack
          alignment="top"
          spacing={10}
          modifiers={[padding({ horizontal: GUTTER })]}
        >
          {media.map((item) => (
            <GridItem key={item.id} item={item} width={CARD} />
          ))}
        </LazyHStack>
      </ScrollView>
    </VStack>
  );
}
