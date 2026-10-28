import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { ScrollView, View } from "react-native";
import { RadioGroup } from "@/components/ui/radio-group";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useStatus } from "./hooks/use-status";

export interface StatusProps {
  form: TrackingForm;
  /** Chapter count, when the source knows it — Completed fills progress to it. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** The status list, with a preview of what the pick would change. */
export function Status({ form, total, onCancel, onConfirm }: StatusProps) {
  const { isLandscape } = useBreakpoint();
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    total,
  );

  const options = (
    <RadioGroup
      value={selected}
      onValueChange={(value) => setSelected(value as MediaListStatus)}
      className="py-4"
      data-attached="column"
    >
      {MANGA_STATUS_ENTRIES.map(([status, title]) => (
        <RadioGroup.Item
          key={status}
          value={status}
          label={title}
          className="w-full px-4"
        />
      ))}
    </RadioGroup>
  );

  return (
    <View className="py-4">
      <Typography type="h4" className="px-4" numberOfLines={1}>
        Status
      </Typography>

      <ScrollView className={cn("w-full", isLandscape && "min-h-0 flex-1")}>
        {options}
      </ScrollView>

      <ChangesPreview changes={changes} />

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </View>
  );
}
