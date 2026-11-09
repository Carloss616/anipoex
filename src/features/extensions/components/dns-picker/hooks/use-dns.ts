import { useValue } from "@legendapp/state/react";
import type { MenuAction } from "@/components/ui/menu";
import { settings$ } from "@/state/settings";
import { selectDns } from "../../../state/dns";
import { DNS_OPTIONS } from "../constants";

/** The DNS choice as a trigger label and one checked row per option. */
export function useDns() {
  const dns = useValue(settings$.device.dns);

  const name = DNS_OPTIONS.find((option) => option.id === dns)?.name;
  const items: MenuAction[] = DNS_OPTIONS.map((option) => ({
    label: option.name,
    checked: option.id === dns,
    onPress: () => selectDns(option.id),
  }));

  return { label: name ? `DNS: ${name}` : "DNS", items };
}
