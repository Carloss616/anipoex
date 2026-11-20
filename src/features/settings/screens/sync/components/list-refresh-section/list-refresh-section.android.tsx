import ScheduleIcon from "@expo/material-symbols/schedule.xml";
import { Column, Row, Switch } from "@expo/ui/jetpack-compose";
import { Computed, Memo, useValue } from "@legendapp/state/react";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { Label } from "@/features/settings/components/label";
import { LeadingIcon } from "@/features/settings/components/leading-icon";
import {
  DESCRIPTIONS,
  LIST_REFRESH_OPTIONS,
  listRefreshLabel,
} from "@/features/settings/constants";
import { useRowProps } from "@/features/settings/hooks/use-row-props";
import { settings$ } from "@/state/settings";

const refresh$ = settings$.mangaList.refresh;
const toggleOnOpen = () => refresh$.onOpen.set((on) => !on);

export function ListRefreshSection() {
  const row = useRowProps();
  const onOpen = useValue(refresh$.onOpen);
  const count = onOpen ? 2 : 1;

  return (
    <>
      <Label>AniList list</Label>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        <SegmentedListItem
          index={0}
          count={count}
          {...row}
          onPress={toggleOnOpen}
        >
          <SegmentedListItem.Leading>
            <LeadingIcon name={Icons.refresh} />
          </SegmentedListItem.Leading>
          <Text>Refresh on open</Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>
              {DESCRIPTIONS.listRefreshOnOpen}
            </Text>
          </SegmentedListItem.Supporting>
          <SegmentedListItem.Trailing>
            <Memo>
              {() => (
                <Switch
                  value={refresh$.onOpen.get()}
                  onCheckedChange={toggleOnOpen}
                />
              )}
            </Memo>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
        {onOpen ? (
          <Computed>
            {() => {
              const minutes = refresh$.minutes.get();

              return (
                <Menu
                  items={LIST_REFRESH_OPTIONS.map((option) => ({
                    label: option.label,
                    checked: option.minutes === minutes,
                    onPress: () => refresh$.minutes.set(option.minutes),
                  }))}
                >
                  <SegmentedListItem index={1} count={count} {...row}>
                    <SegmentedListItem.Leading>
                      <LeadingIcon name={ScheduleIcon} />
                    </SegmentedListItem.Leading>
                    <Text>Refresh after</Text>
                    <SegmentedListItem.Supporting>
                      <Text style={{ typography: "bodyMedium" }}>
                        {DESCRIPTIONS.listRefreshAfter}
                      </Text>
                    </SegmentedListItem.Supporting>
                    <SegmentedListItem.Trailing>
                      <Row verticalAlignment="center">
                        <Text>{listRefreshLabel(minutes)}</Text>
                        <Icon name={Icons.chevronDown} color="inherit" />
                      </Row>
                    </SegmentedListItem.Trailing>
                  </SegmentedListItem>
                </Menu>
              );
            }}
          </Computed>
        ) : null}
      </Column>
    </>
  );
}
