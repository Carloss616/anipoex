import DnsIcon from "@expo/material-symbols/dns.xml";
import { Row } from "@expo/ui/jetpack-compose";
import { Computed } from "@legendapp/state/react";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { DNS_OPTIONS, selectDns } from "@/features/extensions";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS } from "../../constants";
import { useRowProps } from "../../hooks/use-row-props";
import { Label } from "../label";
import { LeadingIcon } from "../leading-icon";

export function NetworkSection() {
  const row = useRowProps();

  return (
    <>
      <Label>Network</Label>
      <Computed>
        {() => {
          const dns = settings$.device.dns.get();
          const name = DNS_OPTIONS.find((option) => option.id === dns)?.name;

          return (
            <Menu
              items={DNS_OPTIONS.map((option) => ({
                label: option.name,
                checked: option.id === dns,
                onPress: () => selectDns(option.id),
              }))}
            >
              <SegmentedListItem index={0} count={1} {...row}>
                <SegmentedListItem.Leading>
                  <LeadingIcon name={DnsIcon} />
                </SegmentedListItem.Leading>
                <Text>DNS</Text>
                <SegmentedListItem.Supporting>
                  <Text style={{ typography: "bodyMedium" }}>
                    {DESCRIPTIONS.dns}
                  </Text>
                </SegmentedListItem.Supporting>
                <SegmentedListItem.Trailing>
                  <Row verticalAlignment="center">
                    {name && <Text>{name}</Text>}
                    <Icon name={Icons.chevronDown} color="inherit" />
                  </Row>
                </SegmentedListItem.Trailing>
              </SegmentedListItem>
            </Menu>
          );
        }}
      </Computed>
    </>
  );
}
