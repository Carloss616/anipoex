import {
  Button,
  HStack,
  List,
  Section,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  buttonStyle,
  listRowBackground,
  listStyle,
  padding,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { EmptyState } from "@/components/blocks/empty-state";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Icon } from "@/components/ui/icon";
import { NewListField } from "@/features/manga/components/new-list-field";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Header } from "../header.ios";
import { useLists } from "./hooks/use-lists";
import type { ListsProps } from "./lists";

/** The custom lists as rows, like the manga list's Filter options. */
export function Lists({ form, onCancel, onConfirm }: ListsProps) {
  const { names, selected, toggle, next, dirty, create } = useLists(form);
  const [primary, cell] = useThemeColor(["primary", "muted"]);
  const font = useFont();

  return (
    <VStack alignment="leading" spacing={0}>
      <Header
        title="Custom lists"
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />

      {/* A glass field sits above the List: a row would crop its shadow. */}
      <VStack modifiers={[padding({ horizontal: 16 })]}>
        <NewListField names={names} onSubmit={create} />
      </VStack>

      {names.length > 0 ? (
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
            font,
          ]}
        >
          <Section modifiers={[listRowBackground(cell)]}>
            {names.map((name) => {
              const on = selected.includes(name);
              return (
                <Button
                  key={name}
                  onPress={() => toggle(name)}
                  modifiers={[
                    buttonStyle("plain"),
                    accessibilityAddTraits(
                      on ? ["isToggle", "isSelected"] : ["isToggle"],
                    ),
                  ]}
                >
                  <HStack spacing={12} modifiers={ROW_FILL}>
                    <Icon
                      name={on ? "checkmark.circle.fill" : "circle"}
                      muted={!on}
                      color={on ? primary : undefined}
                    />
                    <Text>{name}</Text>
                    <Spacer />
                  </HStack>
                </Button>
              );
            })}
          </Section>
        </List>
      ) : (
        <EmptyState
          title="No custom lists yet"
          description="Name one above, then add this manga to it."
        />
      )}
    </VStack>
  );
}
