import { Checkbox, Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { NewListField } from "@/features/manga/components/new-list-field";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Footer } from "../footer";
import { useLists } from "./hooks/use-lists";
import type { ListsProps } from "./lists";

export function Lists({ form, onCancel, onConfirm }: ListsProps) {
  const { isLandscape } = useBreakpoint();
  const m3 = useThemeM3Colors();
  const { names, selected, toggle, next, dirty, create } = useLists(form);

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        Custom lists
      </Text>

      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(16, 16, 16, 16),
        ]}
      >
        {names.length > 0 ? (
          // Several can be on: rows with a checkbox, not single-select radios.
          <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
            {names.map((name, index) => (
              <SegmentedListItem
                key={name}
                index={index}
                count={names.length}
                onPress={() => toggle(name)}
              >
                <SegmentedListItem.Leading>
                  <Checkbox value={selected.includes(name)} />
                </SegmentedListItem.Leading>
                <Text>{name}</Text>
              </SegmentedListItem>
            ))}
          </Column>
        ) : (
          <Text color={m3.onSurfaceVariant}>No custom lists yet.</Text>
        )}
        <NewListField names={names} onSubmit={create} />
      </Column>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </Column>
  );
}
