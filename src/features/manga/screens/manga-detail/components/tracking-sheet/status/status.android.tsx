import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/jetpack-compose/text";
import { RadioGroup } from "@/components/ui/radio-group";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import type { StatusProps } from "./status";
import { useStatus } from "./use-status";

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
        <RadioGroup
          value={selected}
          onValueChange={(value) => setSelected(value as MediaListStatus)}
        >
          {MANGA_STATUS_ENTRIES.map(([status, title]) => (
            <RadioGroup.Item
              key={status}
              value={status}
              label={title}
              // ponytail: the row's inset still rides the kept RadioGroup's className API.
              className="px-4"
            />
          ))}
        </RadioGroup>
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
