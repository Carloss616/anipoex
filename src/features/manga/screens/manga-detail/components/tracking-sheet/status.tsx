import { Spacer } from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Typography } from "@/components/ui/typography";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  describeChanges,
  setStatus,
} from "@/features/manga/utils/tracking-form";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "./changes-preview";

export interface StatusProps {
  form: TrackingForm;
  /** Chapter count, when the source knows it — Completed fills progress to it. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** The status list. The rules run here so the preview can't drift from them. */
export function Status({ form, total, onCancel, onConfirm }: StatusProps) {
  const { isLandscape } = useBreakpoint();
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(form.status);

  const next = setStatus(form, selected, total, today);
  // Nothing to apply, nothing to announce: the preview and OK rise together.
  const dirty = next.status !== form.status;
  const changes = dirty ? describeChanges(form, next, "status", total) : [];

  const options = (
    <RadioGroup
      value={selected}
      onValueChange={(value) => setSelected(value as MediaListStatus)}
      className="ios:px-4 py-4"
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
    <Column className="py-4 android:pt-0">
      <Typography type="h4" className="px-4" numberOfLines={1}>
        Status
      </Typography>

      <ScrollView fill={isLandscape} className="w-full">
        {options}
      </ScrollView>

      <ChangesPreview changes={changes} />

      <Row alignment="center" className="gap-4 px-4">
        <Spacer flexible />
        <Button variant="ghost" cancelRole onPress={onCancel}>
          Cancel
        </Button>
        <Button disabled={!dirty} onPress={() => onConfirm(next)}>
          OK
        </Button>
      </Row>
    </Column>
  );
}
