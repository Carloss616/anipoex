import ScheduleIcon from "@expo/material-symbols/schedule.xml";
import { Column, Switch } from "@expo/ui/jetpack-compose";
import { Computed, Memo } from "@legendapp/state/react";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Label } from "@/features/settings/components/label";
import { LeadingIcon } from "@/features/settings/components/leading-icon";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { useRowProps } from "@/features/settings/hooks/use-row-props";
import { updates$ } from "@/features/updates/state/updates";
import { openExternal } from "@/utils/open-external";
import { LINKS, VERSION_LABEL } from "./constants";
import { checkStatus, onCheck, toggleUpdateCheck, updateCheck$ } from "./utils";

export function About() {
  const row = useRowProps();

  return (
    <SettingsPage title="About">
      <Label>Anipoex</Label>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        <SegmentedListItem index={0} count={3} {...row}>
          <SegmentedListItem.Leading>
            <LeadingIcon name={Icons.info} />
          </SegmentedListItem.Leading>
          <Text>Version</Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>{VERSION_LABEL}</Text>
          </SegmentedListItem.Supporting>
        </SegmentedListItem>
        <SegmentedListItem index={1} count={3} {...row} onPress={onCheck}>
          <SegmentedListItem.Leading>
            <LeadingIcon name={Icons.update} />
          </SegmentedListItem.Leading>
          <Text>Check for updates</Text>
          <SegmentedListItem.Supporting>
            <Computed>
              {() => (
                <Text style={{ typography: "bodyMedium" }}>
                  {checkStatus()}
                </Text>
              )}
            </Computed>
          </SegmentedListItem.Supporting>
          {/* Kept mounted: a Compose slot added after mount doesn't show. */}
          <SegmentedListItem.Trailing>
            <Computed>
              {() => (updates$.checking.get() ? <Loader size="sm" /> : null)}
            </Computed>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
        <SegmentedListItem
          index={2}
          count={3}
          {...row}
          onPress={toggleUpdateCheck}
        >
          <SegmentedListItem.Leading>
            <LeadingIcon name={ScheduleIcon} />
          </SegmentedListItem.Leading>
          <Text>Check automatically</Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>
              Once a day, when you open the app
            </Text>
          </SegmentedListItem.Supporting>
          <SegmentedListItem.Trailing>
            <Memo>
              {() => (
                <Switch
                  value={updateCheck$.get() !== false}
                  onCheckedChange={toggleUpdateCheck}
                />
              )}
            </Memo>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      </Column>
      <Label>Links</Label>
      <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
        {LINKS.map((link, i) => (
          <SegmentedListItem
            key={link.url}
            index={i}
            count={LINKS.length}
            {...row}
            onPress={() => openExternal(link.url)}
          >
            <SegmentedListItem.Leading>
              <LeadingIcon name={link.icon} />
            </SegmentedListItem.Leading>
            <Text>{link.label}</Text>
            <SegmentedListItem.Trailing>
              <Icon name={Icons.openExternal} color="inherit" />
            </SegmentedListItem.Trailing>
          </SegmentedListItem>
        ))}
      </Column>
    </SettingsPage>
  );
}
