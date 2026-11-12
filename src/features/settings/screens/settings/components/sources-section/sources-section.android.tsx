import HourglassIcon from "@expo/material-symbols/hourglass.xml";
import ManageSearchIcon from "@expo/material-symbols/manage_search.xml";
import TranslateIcon from "@expo/material-symbols/translate.xml";
import { Column, Row, Switch } from "@expo/ui/jetpack-compose";
import { Computed, Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { languageName, languageOrder$ } from "@/features/extensions";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS, SLOW_SKIP_OPTIONS } from "../../constants";
import { useRowProps } from "../../hooks/use-row-props";
import { Label } from "../label";
import { LeadingIcon } from "../leading-icon";

const toggleAutoPick = () => settings$.sources.autoPick.set((on) => !on);

export function SourcesSection() {
  const router = useRouter();
  const row = useRowProps();

  return (
    <>
      <Label>Sources</Label>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        <SegmentedListItem
          index={0}
          count={3}
          {...row}
          onPress={toggleAutoPick}
        >
          <SegmentedListItem.Leading>
            <LeadingIcon name={ManageSearchIcon} />
          </SegmentedListItem.Leading>
          <Text>Auto-pick a source</Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>
              {DESCRIPTIONS.autoPick}
            </Text>
          </SegmentedListItem.Supporting>
          <SegmentedListItem.Trailing>
            <Memo>
              {() => (
                <Switch
                  value={settings$.sources.autoPick.get()}
                  onCheckedChange={toggleAutoPick}
                />
              )}
            </Memo>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
        <Computed>
          {() => {
            const slowSkip = settings$.sources.slowSkip.get();

            return (
              <Menu
                items={SLOW_SKIP_OPTIONS.map((option) => ({
                  label: option.label,
                  checked: option.seconds === slowSkip,
                  onPress: () => settings$.sources.slowSkip.set(option.seconds),
                }))}
              >
                <SegmentedListItem index={1} count={3} {...row}>
                  <SegmentedListItem.Leading>
                    <LeadingIcon name={HourglassIcon} />
                  </SegmentedListItem.Leading>
                  <Text>Skip slow sources</Text>
                  <SegmentedListItem.Supporting>
                    <Text style={{ typography: "bodyMedium" }}>
                      {DESCRIPTIONS.slowSkip}
                    </Text>
                  </SegmentedListItem.Supporting>
                  <SegmentedListItem.Trailing>
                    <Row verticalAlignment="center">
                      <Text>
                        {SLOW_SKIP_OPTIONS.find(
                          (option) => option.seconds === slowSkip,
                        )?.label ?? `${slowSkip} s`}
                      </Text>
                      <Icon name={Icons.chevronDown} color="inherit" />
                    </Row>
                  </SegmentedListItem.Trailing>
                </SegmentedListItem>
              </Menu>
            );
          }}
        </Computed>
        <SegmentedListItem
          index={2}
          count={3}
          {...row}
          onPress={() => router.push("/settings/languages")}
        >
          <SegmentedListItem.Leading>
            <LeadingIcon name={TranslateIcon} />
          </SegmentedListItem.Leading>
          <Text>Languages</Text>
          <SegmentedListItem.Trailing>
            <Row verticalAlignment="center">
              <Memo>
                {() => (
                  <Text>
                    {languageOrder$.get().map(languageName).join(", ")}
                  </Text>
                )}
              </Memo>
              <Icon name={Icons.chevronRight} muted />
            </Row>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      </Column>
    </>
  );
}
