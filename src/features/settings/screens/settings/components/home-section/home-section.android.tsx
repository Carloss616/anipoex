import TuneIcon from "@expo/material-symbols/tune.xml";
import { Row } from "@expo/ui/jetpack-compose";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { PRESET_LABELS } from "@/features/home/constants";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS } from "../../constants";
import { useRowProps } from "../../hooks/use-row-props";
import { Label } from "../label";
import { LeadingIcon } from "../leading-icon";

export function HomeSection() {
  const router = useRouter();
  const row = useRowProps();

  return (
    <>
      <Label>Home</Label>
      <SegmentedListItem
        index={0}
        count={1}
        {...row}
        onPress={() => router.push("/settings/layout")}
      >
        <SegmentedListItem.Leading>
          <LeadingIcon name={TuneIcon} />
        </SegmentedListItem.Leading>
        <Text>Layout</Text>
        <SegmentedListItem.Supporting>
          <Text style={{ typography: "bodyMedium" }}>
            {DESCRIPTIONS.layout}
          </Text>
        </SegmentedListItem.Supporting>
        <SegmentedListItem.Trailing>
          <Row verticalAlignment="center">
            {/* The preset alone: the count squeezes the description. */}
            <Memo>
              {() => <Text>{PRESET_LABELS[settings$.home.preset.get()]}</Text>}
            </Memo>
            <Icon name={Icons.chevronRight} color="inherit" />
          </Row>
        </SegmentedListItem.Trailing>
      </SegmentedListItem>
    </>
  );
}
