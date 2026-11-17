import { Button, HStack, ScrollView, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  buttonStyle,
  fixedSize,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { NewListField } from "@/features/manga/components/new-list-field";
import { Header } from "../header.ios";
import { useLists } from "./hooks/use-lists";
import type { ListsProps } from "./lists";

export function Lists({ form, onCancel, onConfirm }: ListsProps) {
  const { isLandscape } = useBreakpoint();
  const { names, selected, toggle, next, dirty, create } = useLists(form);

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ vertical: 16 })]}
    >
      <Header
        title="Custom lists"
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />

      <ScrollView
        modifiers={isLandscape ? [] : [fixedSize({ vertical: true })]}
      >
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ all: 16 })]}
        >
          {names.length > 0 ? (
            <VStack spacing={0}>
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
                    <HStack
                      modifiers={[padding({ vertical: 12 }), ...ROW_FILL]}
                    >
                      <Text>{name}</Text>
                      <Spacer />
                      {on && <Icon name={Icons.check} color="inherit" />}
                    </HStack>
                  </Button>
                );
              })}
            </VStack>
          ) : (
            <Text modifiers={[foregroundStyle("secondary")]}>
              No custom lists yet.
            </Text>
          )}
          <NewListField names={names} onSubmit={create} />
        </VStack>
      </ScrollView>
    </VStack>
  );
}
