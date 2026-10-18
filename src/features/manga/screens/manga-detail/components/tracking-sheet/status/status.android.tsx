import { Column, RadioButton, Row } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height,
  padding,
  selectable,
  selectableGroup,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/jetpack-compose/text";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useStatus } from "./hooks/use-status";
import type { StatusProps } from "./status";

export function Status({ form, total, onCancel, onConfirm }: StatusProps) {
  const { isLandscape } = useBreakpoint();
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    total,
  );

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        Status
      </Text>

      <Column
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(0, 16, 0, 16),
        ]}
      >
        {/* M3's radio group: the whole row is the target, the disc only
            reports state, and the group reads as one choice. */}
        <Column modifiers={[selectableGroup()]}>
          {MANGA_STATUS_ENTRIES.map(([status, title]) => (
            <Row
              key={status}
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 16 }}
              modifiers={[
                fillMaxWidth(),
                height(56),
                selectable(
                  selected === status,
                  () => setSelected(status),
                  "radioButton",
                ),
                padding(16, 0, 16, 0),
              ]}
            >
              <RadioButton selected={selected === status} />
              <Text>{title}</Text>
            </Row>
          ))}
        </Column>
      </Column>

      <ChangesPreview changes={changes} />

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </Column>
  );
}
