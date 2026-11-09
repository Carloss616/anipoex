import { useValue } from "@legendapp/state/react";
import type { MenuAction } from "@/components/ui/menu";
import { settings$ } from "@/state/settings";
import { DNS_OPTIONS, selectDns } from "../state/dns";

/** The DNS choice, its name and one checked menu row per option. */
export function useDns() {
  const dns = useValue(settings$.device.dns);

  const name = DNS_OPTIONS.find((option) => option.id === dns)?.name;
  const items: MenuAction[] = DNS_OPTIONS.map((option) => ({
    label: option.name,
    checked: option.id === dns,
    onPress: () => selectDns(option.id),
  }));

  return { dns: dns ?? null, name, items };
}
