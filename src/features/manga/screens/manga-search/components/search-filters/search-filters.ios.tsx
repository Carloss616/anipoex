import { Button, HStack, ScrollView } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityLabel,
  buttonStyle,
  contentShape,
  foregroundStyle,
  glassEffect,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { FORMAT_OPTIONS } from "./constants";
import type { SearchFiltersProps } from "./search-filters";
import { sortLabel, sortMenuItems } from "./utils";

// A plain button only hit-tests its label: the shape takes the whole pill.
const CAPSULE = [
  padding({ horizontal: 14, vertical: 8 }),
  contentShape(shapes.capsule()),
  glassEffect({
    glass: { variant: "regular", interactive: true },
    shape: "capsule",
  }),
];

/** Glass capsules for the formats, the sort menu and the genre, in a `Host`. */
export function SearchFilters({ params, onChange }: SearchFiltersProps) {
  const primary = useThemeColor("primary");
  const sort = sortLabel(params);

  return (
    <ScrollView axes="horizontal" showsIndicators={false}>
      <HStack spacing={8} modifiers={[padding({ horizontal: GUTTER })]}>
        {FORMAT_OPTIONS.map(({ value, label }) => {
          const selected = params.format === value;
          return (
            <Button
              key={label}
              onPress={() => onChange({ ...params, format: value })}
              modifiers={[
                buttonStyle("plain"),
                ...(selected ? [accessibilityAddTraits(["isSelected"])] : []),
              ]}
            >
              <Text
                textStyle="subheadline"
                weight="medium"
                modifiers={[
                  // Tinted when chosen, as the source list's header buttons.
                  foregroundStyle(selected ? primary : "secondary"),
                  ...CAPSULE,
                ]}
              >
                {label}
              </Text>
            </Button>
          );
        })}
        <Menu items={sortMenuItems(params, onChange)}>
          <HStack
            spacing={4}
            modifiers={[
              foregroundStyle("secondary"),
              ...CAPSULE,
              accessibilityLabel(`Sort: ${sort}`),
            ]}
          >
            <Text textStyle="subheadline" weight="medium">
              {sort}
            </Text>
            <Icon name={Icons.chevronDown} size={12} color="inherit" />
          </HStack>
        </Menu>
        {params.genre && (
          <Button
            onPress={() => onChange({ ...params, genre: undefined })}
            modifiers={[
              buttonStyle("plain"),
              accessibilityLabel(`Remove ${params.genre}`),
            ]}
          >
            <HStack
              spacing={4}
              modifiers={[foregroundStyle(primary), ...CAPSULE]}
            >
              <Text textStyle="subheadline" weight="medium">
                {params.genre}
              </Text>
              <Icon name={Icons.close} size={12} color="inherit" />
            </HStack>
          </Button>
        )}
      </HStack>
    </ScrollView>
  );
}
