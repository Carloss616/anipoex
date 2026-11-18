import { Checkbox, Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { EmptyState } from "@/components/blocks/empty-state";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { NewListField } from "@/features/manga/components/new-list-field";
import { Footer } from "../footer";
import type { CustomListsProps } from "./custom-lists";
import { useCustomLists } from "./hooks/use-custom-lists";

export function CustomLists({ form, onCancel, onConfirm }: CustomListsProps) {
  const { isLandscape } = useBreakpoint();
  const { names, selected, toggle, next, dirty, create } = useCustomLists(form);

  return (
    <Column>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 16, 16, 16)]}
      >
        Custom lists
      </Text>

      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(16, 0, 16, 0),
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
          <EmptyState
            title="No custom lists yet"
            description="Name one above, then add this manga to it."
          />
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
