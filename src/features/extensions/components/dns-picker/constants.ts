import type { DnsId } from "../../runtime";

export const DNS_OPTIONS: { id: DnsId; name: string }[] = [
  { id: "system", name: "System" },
  { id: "cloudflare", name: "Cloudflare" },
  { id: "google", name: "Google" },
  { id: "adguard", name: "AdGuard" },
  { id: "quad9", name: "Quad9" },
];
