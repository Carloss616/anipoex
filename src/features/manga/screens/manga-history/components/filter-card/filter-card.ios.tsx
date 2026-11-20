import { Button, HStack, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  clipShape,
  controlSize,
  foregroundStyle,
  frame,
  lineLimit,
  listRowBackground,
} from "@expo/ui/swift-ui/modifiers";
import { Image } from "@/components/native/swift-ui/image";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { filterBy, openManga } from "../../utils/row-menu";
import type { FilterCardProps } from "./filter-card";
import { useFilterCard } from "./hooks/use-filter-card";

/** The manga the list is narrowed to, as the first section; Show all drops it. */
export function FilterCard({ mediaId }: FilterCardProps) {
  const { title, cover, detail } = useFilterCard(mediaId);
  const buttonFont = useFont("subheadline", "medium");
  const rowBackground = listRowBackground(useThemeColor("surface-secondary"));

  return (
    <Section
      modifiers={[rowBackground]}
      header={
        <HStack>
          <Text>Showing one manga</Text>
          <Spacer />
          <Button
            label="Show all"
            onPress={() => filterBy(undefined)}
            modifiers={[
              buttonStyle("borderless"),
              controlSize("small"),
              buttonFont,
            ]}
          />
        </HStack>
      }
    >
      <HStack spacing={12}>
        {cover?.medium ? (
          <Image
            source={{ uri: cover.medium }}
            modifiers={[
              frame({ width: 46, height: 68 }),
              clipShape("roundedRectangle", 8),
            ]}
          />
        ) : null}
        <VStack alignment="leading" spacing={2}>
          <Text textStyle="headline" modifiers={[lineLimit(2)]}>
            {title}
          </Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {detail}
          </Text>
        </VStack>
        <Spacer />
        <Button
          label="Open"
          onPress={() => openManga(mediaId)}
          modifiers={[
            buttonStyle("glassProminent"),
            buttonBorderShape("capsule"),
            controlSize("small"),
            buttonFont,
          ]}
        />
      </HStack>
    </Section>
  );
}
