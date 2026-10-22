import { useEffect, useState } from "react";
import type { MenuAction } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { type DnsId, runtime } from "../../../runtime";
import { DNS_OPTIONS } from "../constants";

/** The runtime's DNS choice as a trigger label and one checked row per option. */
export function useDns() {
  const [dns, setDns] = useState<DnsId>();

  useEffect(() => {
    runtime.getDns().then(setDns, () => {});
  }, []);

  const select = (next: DnsId) => {
    const previous = dns;
    setDns(next);
    runtime.setDns(next).catch(() => {
      setDns(previous);
      toast.destructive("Couldn't change the DNS");
    });
  };

  const name = DNS_OPTIONS.find((option) => option.id === dns)?.name;
  const items: MenuAction[] = DNS_OPTIONS.map((option) => ({
    label: option.name,
    checked: option.id === dns,
    onPress: () => select(option.id),
  }));

  return { label: name ? `DNS: ${name}` : "DNS", items };
}
