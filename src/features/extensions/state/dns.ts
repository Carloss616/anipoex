import { toast } from "@/components/ui/toast";
import { settings$ } from "@/state/settings";
import { type DnsId, isRuntimeAvailable, runtime } from "../runtime";

if (isRuntimeAvailable) {
  const stored = settings$.device.dns.peek();
  // A build before settings kept the choice only in the runtime: adopt it.
  if (stored === undefined)
    runtime.getDns().then(
      (dns) => settings$.device.dns.set(dns),
      () => {},
    );
  else runtime.setDns(stored).catch(() => {});
}

export const DNS_OPTIONS: { id: DnsId; name: string }[] = [
  { id: "system", name: "System" },
  { id: "cloudflare", name: "Cloudflare" },
  { id: "google", name: "Google" },
  { id: "adguard", name: "AdGuard" },
  { id: "quad9", name: "Quad9" },
];

export function selectDns(next: DnsId) {
  const previous = settings$.device.dns.peek();
  settings$.device.dns.set(next);
  runtime.setDns(next).catch(() => {
    settings$.device.dns.set(previous);
    toast.error("Couldn't change the DNS");
  });
}
