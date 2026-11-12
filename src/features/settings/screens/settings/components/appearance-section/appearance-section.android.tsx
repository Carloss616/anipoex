import { Column, Row } from "@expo/ui/jetpack-compose";
import { Computed, Memo } from "@legendapp/state/react";
import { PaletteRail } from "@/components/blocks/palette-rail";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES } from "@/state/theme";
import { THEME_OPTIONS } from "../../constants";
import { useRowProps } from "../../hooks/use-row-props";
import { Label } from "../label";
import { LeadingIcon } from "../leading-icon";

function theme() {
  const preference = settings$.theme.preference.get();
  return (
    THEME_OPTIONS.find((option) => option.id === preference) ?? THEME_OPTIONS[0]
  );
}

export function AppearanceSection() {
  const row = useRowProps();

  return (
    <>
      <Label>Appearance</Label>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        <Computed>
          {() => {
            const current = theme();

            return (
              <Menu
                items={THEME_OPTIONS.map((option) => ({
                  label: option.label,
                  icon: option.icon,
                  checked: option.id === current.id,
                  onPress: () => settings$.theme.preference.set(option.id),
                }))}
              >
                <SegmentedListItem index={0} count={3} {...row}>
                  <SegmentedListItem.Leading>
                    <LeadingIcon name={current.icon} />
                  </SegmentedListItem.Leading>
                  <Text>Theme</Text>
                  <SegmentedListItem.Trailing>
                    <Row verticalAlignment="center">
                      <Text>{current.label}</Text>
                      <Icon name={Icons.chevronDown} color="inherit" />
                    </Row>
                  </SegmentedListItem.Trailing>
                </SegmentedListItem>
              </Menu>
            );
          }}
        </Computed>
        <Column>
          {/* Squared where they meet: the rail reads as part of this row. */}
          <SegmentedListItem
            index={1}
            count={3}
            {...row}
            shape={{ bottomStart: 0, bottomEnd: 0 }}
          >
            <SegmentedListItem.Leading>
              <Memo>{() => <LeadingIcon name={theme().icon} />}</Memo>
            </SegmentedListItem.Leading>
            <Text>Palette</Text>
            <SegmentedListItem.Trailing>
              <Memo>
                {() => (
                  <Text>
                    {THEME_FAMILIES.find(
                      (entry) => entry.id === settings$.theme.family.get(),
                    )?.name ?? ""}
                  </Text>
                )}
              </Memo>
            </SegmentedListItem.Trailing>
          </SegmentedListItem>
          <SegmentedListItem
            index={2}
            count={3}
            {...row}
            shape={{ topStart: 0, topEnd: 0 }}
            contentPadding={{ start: 0, top: 0, end: 0, bottom: 0 }}
          >
            <PaletteRail />
          </SegmentedListItem>
        </Column>
      </Column>
    </>
  );
}
